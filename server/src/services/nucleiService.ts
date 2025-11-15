import Docker from "dockerode";
import { mkdir, writeFile, readFile } from "fs/promises";
import { join, resolve } from "path";
import { createHash } from "crypto";
import { platform } from "os";
import prisma from "../db/client";

// Detect OS and set default Docker socket path
function getDefaultDockerSocketPath(): string {
  const osPlatform = platform();
  if (osPlatform === "win32") {
    // Windows Docker Desktop uses named pipe
    return "//./pipe/docker_engine";
  }
  // Linux and macOS use Unix socket
  return "/var/run/docker.sock";
}

// Initialize Docker client with OS-aware defaults
const dockerSocketPath =
  process.env.DOCKER_SOCKET_PATH || getDefaultDockerSocketPath();

const docker = new Docker({
  socketPath: dockerSocketPath,
});

console.log(`[Docker] Using socket path: ${dockerSocketPath}`);

const SCAN_TIMEOUT_MS =
  parseInt(process.env.SCAN_TIMEOUT_MINUTES || "30") * 60 * 1000;
const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || "./artifacts";
const NUCLEI_IMAGE = "projectdiscovery/nuclei:latest";

/**
 * Ensure the Nuclei Docker image is available, pulling it if necessary
 */
async function ensureNucleiImage(): Promise<void> {
  try {
    // Try to inspect the image to see if it exists
    const image = docker.getImage(NUCLEI_IMAGE);
    await image.inspect();
    console.log(`[Docker] Image ${NUCLEI_IMAGE} already exists`);
  } catch (error) {
    // Image doesn't exist, pull it
    console.log(`[Docker] Image ${NUCLEI_IMAGE} not found, pulling...`);
    console.log(`[Docker] This may take a few minutes on first run...`);

    return new Promise((resolve, reject) => {
      // dockerode's pull method uses a callback pattern
      docker.pull(
        NUCLEI_IMAGE,
        (pullErr: Error | null, stream: NodeJS.ReadableStream | null) => {
          if (pullErr) {
            console.error(`[Docker] Error initiating pull:`, pullErr);
            reject(pullErr);
            return;
          }

          if (!stream) {
            reject(new Error("Failed to create pull stream"));
            return;
          }

          // Monitor pull progress
          docker.modem.followProgress(
            stream,
            (finishErr: Error | null) => {
              if (finishErr) {
                console.error(`[Docker] Error pulling image:`, finishErr);
                reject(finishErr);
              } else {
                console.log(`\n[Docker] Successfully pulled ${NUCLEI_IMAGE}`);
                resolve();
              }
            },
            (event: { status?: string; progress?: string; id?: string }) => {
              // Show progress updates
              if (event.status && event.progress) {
                const progressInfo = event.id ? `[${event.id}] ` : "";
                process.stdout.write(
                  `\r[Docker] ${progressInfo}${event.status}: ${event.progress}`
                );
              } else if (event.status) {
                process.stdout.write(
                  `\r[Docker] ${event.status}                    \n`
                );
              }
            }
          );
        }
      );
    });
  }
}

interface NucleiFinding {
  info?: {
    name?: string;
    id?: string;
    severity?: string;
    description?: string;
  };
  matched?: string;
  matched_at?: string;
  request?: string;
  response?: string;
  host?: string;
  path?: string;
}

/**
 * Normalize path for Docker bind mounts
 * On Windows, Docker may require forward slashes or specific path format
 */
function normalizeDockerPath(path: string): string {
  const osPlatform = platform();
  if (osPlatform === "win32") {
    // On Windows, Docker typically expects forward slashes or the path in a specific format
    // Convert backslashes to forward slashes for Docker compatibility
    return resolve(path).replace(/\\/g, "/");
  }
  // On Linux/Mac, just use the resolved absolute path
  return resolve(path);
}

export async function executeNucleiScan(
  scanId: string,
  target: string
): Promise<void> {
  // Use relative path for file operations
  const scanDir = join(ARTIFACTS_DIR, scanId);
  const outputPath = join(scanDir, "nuclei.json");

  // Convert to absolute path and normalize for Docker volume mount (required on Windows)
  const dockerMountPath = normalizeDockerPath(scanDir);

  try {
    // Create scan directory
    await mkdir(scanDir, { recursive: true });

    console.log(`[Nuclei] Starting scan for ${target} (scanId: ${scanId})`);
    console.log(`[Nuclei] Artifact directory: ${resolve(scanDir)}`);
    console.log(`[Nuclei] Docker mount path: ${dockerMountPath}`);

    // Ensure Nuclei image is available
    await ensureNucleiImage();

    // Prepare Docker container configuration
    const containerConfig = {
      Image: NUCLEI_IMAGE,
      Cmd: [
        "-u",
        target,
        "-jsonl", // JSON Lines output format (one JSON object per line)
        "-o",
        "/output/nuclei.json",
        "-timeout",
        "30", // 30 second timeout per request
        "-no-color",
        "-silent", // Suppress banner and other non-essential output
      ],
      HostConfig: {
        // Use normalized absolute path for Docker bind mount (required, especially on Windows)
        Binds: [`${dockerMountPath}:/output`],
        AutoRemove: true,
        Memory: 2 * 1024 * 1024 * 1024, // 2GB limit
        MemorySwap: 2 * 1024 * 1024 * 1024,
        CpuQuota: 50000, // 50% CPU
        CpuPeriod: 100000,
      },
    };

    // Create and start container
    const container = await docker.createContainer(containerConfig);
    await container.start();

    console.log(`[Nuclei] Container started: ${container.id}`);

    // Set up timeout
    const timeoutId = setTimeout(async () => {
      try {
        console.log(
          `[Nuclei] Timeout reached, stopping container ${container.id}`
        );
        await container.stop({ t: 10 }); // 10 second grace period
        await container.remove();
      } catch (error) {
        console.error(`[Nuclei] Error stopping timed-out container:`, error);
      }
    }, SCAN_TIMEOUT_MS);

    // Stream logs
    const logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    logStream.on("data", (chunk: Buffer) => {
      const logLine = chunk.toString("utf-8").trim();
      if (logLine) {
        console.log(`[Nuclei] ${logLine}`);
      }
    });

    // Wait for container to finish
    const exitCode = await new Promise<number>((resolve, reject) => {
      container.wait(
        (err: Error | null, data: { StatusCode?: number } | null) => {
          if (err) {
            reject(err);
          } else {
            resolve(data?.StatusCode || 0);
          }
        }
      );
    });

    clearTimeout(timeoutId);
    console.log(`[Nuclei] Container exited with code ${exitCode}`);

    // Read and parse results
    let findings: NucleiFinding[] = [];
    let outputFileExists = false;

    try {
      const outputContent = await readFile(outputPath, "utf-8");
      outputFileExists = true;
      const lines = outputContent
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      if (lines.length > 0) {
        findings = lines
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch (parseLineError) {
              console.warn(
                `[Nuclei] Skipping invalid JSON line: ${line.substring(
                  0,
                  100
                )}...`
              );
              return null;
            }
          })
          .filter((finding) => finding !== null) as NucleiFinding[];
      }

      console.log(`[Nuclei] Parsed ${findings.length} findings from output`);
    } catch (readError: any) {
      if (readError.code === "ENOENT") {
        console.warn(
          `[Nuclei] Output file not found (container may have failed or produced no output)`
        );
        if (exitCode !== 0) {
          console.warn(
            `[Nuclei] Container exited with error code ${exitCode} - scan may have failed`
          );
        }
      } else {
        console.warn(`[Nuclei] Could not read output file:`, readError);
      }
      // Continue even if no findings - scan may have completed successfully with no vulnerabilities
    }

    // Compute SHA-256 checksum (only if file exists)
    let artifactHash: string | null = null;
    if (outputFileExists) {
      try {
        const fileContent = await readFile(outputPath, "utf-8");
        artifactHash = createHash("sha256").update(fileContent).digest("hex");
        console.log(
          `[Nuclei] Computed artifact hash: ${artifactHash.substring(0, 16)}...`
        );
      } catch (hashError) {
        console.error(`[Nuclei] Error computing checksum:`, hashError);
      }
    }

    // Map Nuclei findings to database Finding records
    const findingRecords = findings.map((finding) => {
      const info = finding.info || {};
      const severity = mapNucleiSeverity(info.severity || "info");
      const title = info.name || info.id || "Unknown Finding";
      const description = info.description || finding.matched || "";
      const resource = finding.host
        ? `${finding.host}${finding.path || ""}`
        : target;

      return {
        scanId,
        title,
        severity,
        description,
        resource,
        evidencePath: outputPath, // Reference to the full JSON file
      };
    });

    // Insert findings in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // Delete existing findings for this scan (in case of re-run)
      await tx.finding.deleteMany({ where: { scanId } });

      // Insert new findings
      if (findingRecords.length > 0) {
        await tx.finding.createMany({ data: findingRecords });
      }

      // Update scan status
      await tx.scan.update({
        where: { id: scanId },
        data: {
          status: exitCode === 0 && outputFileExists ? "completed" : "failed",
          finishedAt: new Date(),
          findingsCount: findingRecords.length,
          artifactPath: outputFileExists ? outputPath : null,
          artifactHash,
          errorMessage:
            exitCode !== 0
              ? `Container exited with code ${exitCode}${
                  !outputFileExists ? " (no output file generated)" : ""
                }`
              : !outputFileExists
              ? "Scan completed but no output file was generated"
              : null,
        },
      });
    });

    console.log(
      `[Nuclei] Scan completed: ${findingRecords.length} findings saved`
    );
  } catch (error) {
    console.error(`[Nuclei] Error executing scan:`, error);

    // Update scan status to failed
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "failed",
        finishedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

function mapNucleiSeverity(nucleiSeverity: string): string {
  const severityMap: Record<string, string> = {
    critical: "critical",
    high: "high",
    medium: "medium",
    low: "low",
    info: "info",
    informational: "info",
    unknown: "info",
  };

  return severityMap[nucleiSeverity.toLowerCase()] || "info";
}
