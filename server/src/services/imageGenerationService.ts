import path from "path";
import fs from "fs";
import { callImageModel } from "../openai/client.js";
import type { FloorPlan } from "@prisma/client";
import type { FloorPlanAnalysis } from "./floorPlanAnalysisService.js";

const ROOMIFY_RENDER_PROMPT = `
TASK: Convert the input 2D floor plan into a **photorealistic, top‑down 3D architectural render**.

STRICT REQUIREMENTS (do not violate):
1) **REMOVE ALL TEXT**: Do not render any letters, numbers, labels, dimensions, or annotations. Floors must be continuous where text used to be.
2) **GEOMETRY MUST MATCH**: Walls, rooms, doors, and windows must follow the exact lines and positions in the plan. Do not shift or resize.
3) **TOP‑DOWN ONLY**: Orthographic top‑down view. No perspective tilt.
4) **CLEAN, REALISTIC OUTPUT**: Crisp edges, balanced lighting, and realistic materials. No sketch/hand‑drawn look.
5) **NO EXTRA CONTENT**: Do not add rooms, furniture, or objects that are not clearly indicated by the plan.

STRUCTURE & DETAILS:
- **Walls**: Extrude precisely from the plan lines. Consistent wall height and thickness.
- **Doors**: Convert door swing arcs into open doors, aligned to the plan.
- **Windows**: Convert thin perimeter lines into realistic glass windows.

FURNITURE & ROOM MAPPING (only where icons/fixtures are clearly shown):
- Bed icon → realistic bed with duvet and pillows.
- Sofa icon → modern sectional or sofa.
- Dining table icon → table with chairs.
- Kitchen icon → counters with sink and stove.
- Bathroom icon → toilet, sink, and tub/shower.
- Office/study icon → desk, chair, and minimal shelving.
- Porch/patio/balcony icon → outdoor seating or simple furniture (keep minimal).
- Utility/laundry icon → washer/dryer and minimal cabinetry.

STYLE & LIGHTING:
- Lighting: bright, neutral daylight. High clarity and balanced contrast.
- Materials: realistic wood/tile floors, clean walls, subtle shadows.
- Finish: professional architectural visualization; no text, no watermarks, no logos.
`.trim();

const STYLE_PRESETS: Record<string, string> = {
  modern_minimal: "Modern minimalist style.",
  scandinavian: "Scandinavian interior.",
  industrial: "Industrial loft style.",
};

export async function generateRenderImage(params: {
  floorPlan: FloorPlan;
  analysis: FloorPlanAnalysis;
  stylePreset: string;
  cameraPreset: string;
}): Promise<{ buffer: Buffer; width: number; height: number }> {
  const { floorPlan, analysis, stylePreset } = params;
  const storagePath = process.env.STORAGE_PATH || "./uploads";
  const filePath = path.join(storagePath, floorPlan.filePath || "");

  if (!fs.existsSync(filePath)) {
    throw new Error("Floor plan file not found");
  }

  const imageBuffer = fs.readFileSync(filePath);
  const base64 = imageBuffer.toString("base64");
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/webp";

  const styleHint = STYLE_PRESETS[stylePreset] || STYLE_PRESETS.modern_minimal;
  const prompt = `${ROOMIFY_RENDER_PROMPT}\n\nStyle: ${styleHint}\n\nLayout description: ${analysis.description}`;

  const imageData = await callImageModel({
    prompt,
    image: base64,
    mimeType,
  });

  const width = 1024;
  const height = 1024;

  return {
    buffer: imageData,
    width,
    height,
  };
}
