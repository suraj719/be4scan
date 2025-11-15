import { Router, Request, Response } from "express";
import prisma from "../db/client";

export const findingRoutes = Router();

// GET /api/findings?scanId=xxx - Get findings for a scan
findingRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const scanId = req.query.scanId as string;

    if (!scanId) {
      return res
        .status(400)
        .json({ error: "scanId query parameter is required" });
    }

    const findings = await prisma.finding.findMany({
      where: { scanId },
      orderBy: [
        { severity: "desc" }, // critical, high, medium, low, info
        { createdAt: "desc" },
      ],
    });

    res.json(findings);
  } catch (error) {
    console.error("Error fetching findings:", error);
    res.status(500).json({ error: "Failed to fetch findings" });
  }
});
