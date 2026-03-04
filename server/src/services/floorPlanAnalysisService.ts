import path from "path";
import fs from "fs";
import { callVisionModel } from "../openai/client.js";
import type { FloorPlan } from "@prisma/client";

export interface FloorPlanAnalysis {
  description: string;
  rooms: Array<{ label: string; type?: string; dimensions?: string }>;
}

export async function analyzeFloorPlan(floorPlan: FloorPlan): Promise<FloorPlanAnalysis> {
  const storagePath = process.env.STORAGE_PATH || "./uploads";
  const filePath = path.join(storagePath, floorPlan.filePath || "");

  if (!fs.existsSync(filePath)) {
    return { description: "Floor plan image not found on disk.", rooms: [] };
  }

  const imageBuffer = fs.readFileSync(filePath);
  const base64 = imageBuffer.toString("base64");
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/webp";

  const instructions = `Analyze this 2D floor plan image. Return a JSON object with:
- "description": a detailed natural-language description of the layout and rooms
- "rooms": array of objects with "label" (e.g. "kitchen", "living_room", "bedroom"), "type" (optional), "dimensions" (optional approximate dimensions)

Return ONLY valid JSON, no other text.`;

  const result = await callVisionModel({
    image: base64,
    mimeType,
    instructions,
  });

  try {
    const parsed = JSON.parse(result) as FloorPlanAnalysis;
    return parsed;
  } catch {
    return { description: result || "Unknown layout", rooms: [] };
  }
}
