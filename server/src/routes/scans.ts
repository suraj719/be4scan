import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../db/client";
import { authenticate, AuthRequest } from "../middleware/auth";

export const scanRoutes = Router();

const createScanSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  target: z.string().url(),
});

// POST /api/scans - Create a new scan (protected)
scanRoutes.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const body = createScanSchema.parse(req.body);

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const scan = await prisma.scan.create({
      data: {
        name: body.name,
        type: body.type,
        target: body.target,
        status: "queued",
        userId: req.userId,
      },
    });

    res.status(201).json(scan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request body", details: error.errors });
    }
    console.error("Error creating scan:", error);
    res.status(500).json({ error: "Failed to create scan" });
  }
});

// GET /api/scans - List all scans for current user (protected)
scanRoutes.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const scans = await prisma.scan.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { findings: true },
        },
      },
    });

    res.json(scans);
  } catch (error) {
    console.error("Error fetching scans:", error);
    res.status(500).json({ error: "Failed to fetch scans" });
  }
});

// GET /api/scans/:id - Get a specific scan (protected)
scanRoutes.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const scan = await prisma.scan.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId, // Ensure user owns the scan
      },
      include: {
        _count: {
          select: { findings: true },
        },
      },
    });

    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }

    res.json(scan);
  } catch (error) {
    console.error("Error fetching scan:", error);
    res.status(500).json({ error: "Failed to fetch scan" });
  }
});
