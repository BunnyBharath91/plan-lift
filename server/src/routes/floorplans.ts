import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../db/client.js";

const storagePath = process.env.STORAGE_PATH || "./uploads";
fs.mkdirSync(storagePath, { recursive: true });
const floorplansDir = path.join(storagePath, "floorplans");
fs.mkdirSync(floorplansDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, floorplansDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|pdf)$/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error("Only JPG, PNG, WEBP, PDF allowed"));
  },
});

export const floorplansRouter = Router();

floorplansRouter.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { title, description } = req.body || {};
    const relativePath = path.relative(storagePath, file.path);

    const floorPlan = await prisma.floorPlan.create({
      data: {
        title: title || `Floor Plan ${Date.now()}`,
        description: description || null,
        sourceType: "upload",
        filePath: relativePath,
      },
    });

    res.status(201).json(floorPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

floorplansRouter.get("/", async (_req, res) => {
  try {
    const floorPlans = await prisma.floorPlan.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(floorPlans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

floorplansRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id },
      include: { renderJobs: true },
    });
    if (!floorPlan) {
      res.status(404).json({ error: "Floor plan not found" });
      return;
    }
    res.json(floorPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});
