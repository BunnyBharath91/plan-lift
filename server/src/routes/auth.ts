import { Router } from "express";

export const authRouter = Router();

// Placeholder auth routes - optional for first phase
authRouter.get("/me", (_req, res) => {
  res.json({ user: null });
});
