import { Router, Request, Response } from "express";
import prisma from "../db/client";
import { authenticate, AuthRequest } from "../middleware/auth";

export const findingRoutes = Router();

// GET /api/findings?scanId=xxx - Get findings for a scan (protected)
findingRoutes.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const scanId = req.query.scanId as string;

    if (!scanId) {
      return res
        .status(400)
        .json({ error: "scanId query parameter is required" });
    }

    // Verify scan belongs to user
    const scan = await prisma.scan.findFirst({
      where: {
        id: scanId,
        userId: req.userId,
      },
    });

    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
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
