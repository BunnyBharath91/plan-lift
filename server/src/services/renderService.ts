import path from "path";
import fs from "fs";
import { prisma } from "../db/client.js";
import { analyzeFloorPlan } from "./floorPlanAnalysisService.js";
import { generateRenderImage } from "./imageGenerationService.js";

const storagePath = process.env.STORAGE_PATH || "./uploads";

export async function createRenderJob(params: {
  floorPlanId: string;
  stylePreset: string;
  cameraPreset: string;
}) {
  const { floorPlanId, stylePreset, cameraPreset } = params;

  const job = await prisma.renderJob.create({
    data: {
      floorPlanId,
      stylePreset,
      cameraPreset,
      status: "running",
    },
  });

  try {
    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id: floorPlanId },
    });
    if (!floorPlan) throw new Error("Floor plan not found");

    const analysis = await analyzeFloorPlan(floorPlan);
    const imageResult = await generateRenderImage({
      floorPlan,
      analysis,
      stylePreset,
      cameraPreset,
    });

    const rendersDir = path.join(storagePath, "renders");
    fs.mkdirSync(rendersDir, { recursive: true });
    const imagePath = path.join(rendersDir, `${job.id}.png`);
    fs.writeFileSync(imagePath, imageResult.buffer);

    const relativePath = path.relative(storagePath, imagePath);

    await prisma.renderImage.create({
      data: {
        jobId: job.id,
        imagePath: relativePath,
        width: imageResult.width,
        height: imageResult.height,
        format: "png",
        viewLabel: cameraPreset,
      },
    });

    await prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: "succeeded",
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    const updated = await prisma.renderJob.findUnique({
      where: { id: job.id },
      include: { floorPlan: true, renderImages: true },
    });
    if (!updated) throw new Error("Job not found after update");
    return updated;
  } catch (err) {
    await prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        errorMessage: (err as Error).message,
        completedAt: new Date(),
      },
    });
    throw err;
  }
}
