import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { scanRoutes } from "./routes/scans";
import { findingRoutes } from "./routes/findings";
import { artifactRoutes } from "./routes/artifacts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/scans", scanRoutes);
app.use("/api/findings", findingRoutes);
app.use("/api/artifacts", artifactRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
