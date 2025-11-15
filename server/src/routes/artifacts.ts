import { Router, Request, Response } from "express";
import { readFile } from "fs/promises";
import { join } from "path";
import prisma from "../db/client";

export const artifactRoutes = Router();

// GET /api/artifacts/:scanId/nuclei.json - Download artifact file
artifactRoutes.get(
  "/:scanId/nuclei.json",
  async (req: Request, res: Response) => {
    try {
      const { scanId } = req.params;

      const scan = await prisma.scan.findUnique({
        where: { id: scanId },
      });

      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }

      if (!scan.artifactPath) {
        return res
          .status(404)
          .json({ error: "Artifact not found for this scan" });
      }

      const artifactsDir = process.env.ARTIFACTS_DIR || "./artifacts";
      const filePath = join(artifactsDir, scanId, "nuclei.json");

      try {
        const fileContent = await readFile(filePath, "utf-8");
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="scan-${scanId}-nuclei.json"`
        );
        res.send(fileContent);
      } catch (fileError) {
        console.error("Error reading artifact file:", fileError);
        res.status(404).json({ error: "Artifact file not found on disk" });
      }
    } catch (error) {
      console.error("Error fetching artifact:", error);
      res.status(500).json({ error: "Failed to fetch artifact" });
    }
  }
);
