import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/client";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("[Auth] JWT_SECRET not configured");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    const decoded = jwt.verify(token, secret) as { userId: string };

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      return;
    }
    console.error("[Auth] Error authenticating:", error);
    res.status(500).json({ error: "Authentication error" });
  }
};
