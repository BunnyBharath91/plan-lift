import { Router } from "express";
import { prisma } from "../db/client.js";
import { createRenderJob } from "../services/renderService.js";

export const rendersRouter = Router();

rendersRouter.post("/", async (req, res) => {
  try {
    const { floorPlanId, stylePreset = "modern_minimal", cameraPreset = "isometric" } = req.body || {};

    if (!floorPlanId) {
      res.status(400).json({ error: "floorPlanId is required" });
      return;
    }

    const floorPlan = await prisma.floorPlan.findUnique({ where: { id: floorPlanId } });
    if (!floorPlan) {
      res.status(404).json({ error: "Floor plan not found" });
      return;
    }

    const job = await createRenderJob({ floorPlanId, stylePreset, cameraPreset });
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

rendersRouter.get("/", async (req, res) => {
  try {
    const { floorPlanId } = req.query;
    const where = floorPlanId ? { floorPlanId: String(floorPlanId) } : {};

    const jobs = await prisma.renderJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { floorPlan: true, renderImages: true },
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

rendersRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.renderJob.findUnique({
      where: { id },
      include: { floorPlan: true, renderImages: true },
    });
    if (!job) {
      res.status(404).json({ error: "Render job not found" });
      return;
    }
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});
