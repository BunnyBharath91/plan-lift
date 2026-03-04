import OpenAI from "openai";
import { toFile } from "openai/uploads";
import sharp from "sharp";

const API_KEY = process.env.OPENAI_API_KEY;
const VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";

function getClient(): OpenAI {
  if (!API_KEY) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: API_KEY });
}

export async function callVisionModel(params: {
  image: string;
  mimeType: string;
  instructions: string;
}): Promise<string> {
  const { image, mimeType, instructions } = params;
  const client = getClient();

  const response = await client.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${image}` },
          },
          { type: "text", text: instructions },
        ],
      },
    ],
    max_tokens: 2048,
  });

  const content = response.choices?.[0]?.message?.content;
  return content || "";
}

export async function callImageModel(params: {
  prompt: string;
  image: string;
  mimeType: string;
}): Promise<Buffer> {
  const { prompt, image, mimeType } = params;
  const client = getClient();

  let imageBuffer: Buffer = Buffer.from(image, "base64");

  // Ensure PNG and reasonable size for API (gpt-image-1.5 accepts png/webp/jpg < 50MB)
  const ext = mimeType.split("/")[1] || "png";
  if (ext !== "png" && ext !== "webp" && ext !== "jpeg" && ext !== "jpg") {
    imageBuffer = Buffer.from(await sharp(imageBuffer).png().toBuffer());
  }

  // Resize if too large (keep under 50MB, typical floor plans are fine)
  const meta = await sharp(imageBuffer).metadata();
  const maxDim = 2048;
  if (
    meta.width &&
    meta.height &&
    (meta.width > maxDim || meta.height > maxDim)
  ) {
    imageBuffer = Buffer.from(
      await sharp(imageBuffer)
        .resize(maxDim, maxDim, { fit: "inside" })
        .png()
        .toBuffer()
    );
  }

  const file = await toFile(imageBuffer, "floorplan.png", {
    type: "image/png",
  });

  const response = await client.images.edit({
    model: IMAGE_MODEL,
    image: file,
    prompt: prompt.slice(0, 32000),
    n: 1,
    size: "1024x1024",
  });

  const first = response.data?.[0];
  if (!first) throw new Error("No image in OpenAI response");

  if (first.b64_json) {
    return Buffer.from(first.b64_json, "base64");
  }
  if (first.url) {
    const imgRes = await fetch(first.url);
    if (!imgRes.ok) throw new Error("Failed to fetch generated image");
    const arr = await imgRes.arrayBuffer();
    return Buffer.from(arr);
  }
  throw new Error("No image data in OpenAI response");
}
