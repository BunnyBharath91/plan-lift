import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { floorplansRouter } from "./routes/floorplans.js";
import { rendersRouter } from "./routes/renders.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Serve uploaded and generated images
const storagePath = process.env.STORAGE_PATH || "./uploads";
app.use("/uploads", express.static(path.resolve(storagePath)));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/floorplans", floorplansRouter);
app.use("/api/renders", rendersRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
