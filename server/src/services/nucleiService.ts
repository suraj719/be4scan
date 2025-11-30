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
    // Initialize empty artifact file
    await writeFile(outputPath, "");

    console.log(`[Nuclei] Starting scan for ${target} (scanId: ${scanId})`);
    console.log(`[Nuclei] Artifact directory: ${resolve(scanDir)}`);

    // Ensure Nuclei image is available
    await ensureNucleiImage();

    // Prepare Docker container configuration
    const containerConfig = {
      Image: NUCLEI_IMAGE,
      Cmd: [
        "-u",
        target,
        "-jsonl", // JSON Lines output format
        "-timeout",
        "30", // 30 second timeout per request
        "-no-color",
        "-silent", // Suppress banner
      ],
      HostConfig: {
        // We still mount the dir to ensure we can write to it if needed,
        // though we are writing from Node.js side now.
        Binds: [`${dockerMountPath}:/output`],
        AutoRemove: true,
        Memory: 2 * 1024 * 1024 * 1024, // 2GB limit
        MemorySwap: 2 * 1024 * 1024 * 1024,
        CpuQuota: 50000, // 50% CPU
        CpuPeriod: 100000,
      },
      Tty: false,
    };

    // Create container
    const container = await docker.createContainer(containerConfig);

    // Attach to stream before starting to ensure we catch all output
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await (container as any).attach({
      stream: true,
      stdout: true,
      stderr: true,
    });

    await container.start();
    console.log(`[Nuclei] Container started: ${container.id}`);

    // Set up timeout
    const timeoutId = setTimeout(async () => {
      try {
        console.log(
          `[Nuclei] Timeout reached, stopping container ${container.id}`
        );
        await container.stop({ t: 10 });
        await container.remove();
      } catch (error) {
        console.error(`[Nuclei] Error stopping timed-out container:`, error);
      }
    }, SCAN_TIMEOUT_MS);

    // Process stream
    let buffer = "";
    let findingsCount = 0;

    stream.on("data", async (chunk: Buffer) => {
      buffer += chunk.toString("utf-8");

      const lines = buffer.split("\n");
      // Keep the last partial line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        // Skip Docker headers or empty lines (Docker headers often result in weird chars at start)
        // A simple heuristic: JSON starts with {
        const jsonStartIndex = trimmedLine.indexOf("{");
        if (jsonStartIndex === -1) continue;

        const potentialJson = trimmedLine.substring(jsonStartIndex);

        try {
          const finding: NucleiFinding = JSON.parse(potentialJson);

          findingsCount++;

          await require("fs/promises").appendFile(
            outputPath,
            JSON.stringify(finding) + "\n"
          );

          const info = finding.info || {};
          const severity = mapNucleiSeverity(info.severity || "info");
          const title = info.name || info.id || "Unknown Finding";
          const description = info.description || finding.matched || "";
          const resource = finding.host
            ? `${finding.host}${finding.path || ""}`
            : target;

          await prisma.finding.create({
            data: {
              scanId,
              title,
              severity,
              description,
              resource,
              evidencePath: outputPath,
            },
          });

          console.log(`[Nuclei] New finding: ${title} (${severity})`);
        } catch (e) {
          // Not a valid JSON or not a finding, ignore
        }
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

    // Finalize scan
    let artifactHash: string | null = null;
    try {
      const fileContent = await readFile(outputPath, "utf-8");
      if (fileContent) {
        artifactHash = createHash("sha256").update(fileContent).digest("hex");
      }
    } catch (e) {
      console.warn("[Nuclei] Could not read artifact for hashing");
    }

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: exitCode === 0 ? "completed" : "failed",
        finishedAt: new Date(),
        findingsCount,
        artifactPath: outputPath,
        artifactHash,
        errorMessage:
          exitCode !== 0 ? `Container exited with code ${exitCode}` : null,
      },
    });

    console.log(`[Nuclei] Scan completed: ${findingsCount} findings processed`);
  } catch (error) {
    console.error(`[Nuclei] Error executing scan:`, error);

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
