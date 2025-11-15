import dotenv from "dotenv";
import prisma from "./db/client";
import { executeNucleiScan } from "./services/nucleiService";

dotenv.config();

const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds

async function processQueuedScans() {
  while (true) {
    try {
      // Find the oldest queued scan
      const queuedScan = await prisma.scan.findFirst({
        where: { status: "queued" },
        orderBy: { createdAt: "asc" },
      });

      if (queuedScan) {
        console.log(
          `[Worker] Processing scan ${queuedScan.id} (${queuedScan.type}) for target ${queuedScan.target}`
        );

        // Update status to running
        await prisma.scan.update({
          where: { id: queuedScan.id },
          data: {
            status: "running",
            startedAt: new Date(),
          },
        });

        // Execute the scan based on type
        if (queuedScan.type === "nuclei") {
          await executeNucleiScan(queuedScan.id, queuedScan.target);
        } else {
          console.warn(`[Worker] Unknown scan type: ${queuedScan.type}`);
          await prisma.scan.update({
            where: { id: queuedScan.id },
            data: {
              status: "failed",
              finishedAt: new Date(),
              errorMessage: `Unknown scan type: ${queuedScan.type}`,
            },
          });
        }
      } else {
        // No queued scans, wait before polling again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    } catch (error) {
      console.error("[Worker] Error processing scans:", error);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

// Start the worker
console.log("[Worker] Starting scan worker...");
processQueuedScans().catch((error) => {
  console.error("[Worker] Fatal error:", error);
  process.exit(1);
});
