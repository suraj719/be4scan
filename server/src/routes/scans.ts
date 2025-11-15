import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../db/client";

export const scanRoutes = Router();

const createScanSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  target: z.string().url(),
});

// POST /api/scans - Create a new scan
scanRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const body = createScanSchema.parse(req.body);

    const scan = await prisma.scan.create({
      data: {
        name: body.name,
        type: body.type,
        target: body.target,
        status: "queued",
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

// GET /api/scans - List all scans
scanRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const scans = await prisma.scan.findMany({
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

// GET /api/scans/:id - Get a specific scan
scanRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const scan = await prisma.scan.findUnique({
      where: { id: req.params.id },
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
