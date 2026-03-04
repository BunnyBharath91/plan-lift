const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export interface FloorPlan {
  id: string;
  title: string;
  description: string | null;
  sourceType: string;
  filePath: string | null;
  fileUrl: string | null;
  createdAt: string;
}

export interface RenderImage {
  id: string;
  imagePath: string | null;
  imageUrl: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  viewLabel: string | null;
}

export interface RenderJob {
  id: string;
  floorPlanId: string;
  stylePreset: string;
  cameraPreset: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  floorPlan?: FloorPlan;
  renderImages?: RenderImage[];
}

export async function uploadFloorPlan(file: File, title?: string, description?: string): Promise<FloorPlan> {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  if (description) form.append("description", description);

  const res = await fetch(`${API_BASE}/api/floorplans`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }

  return res.json();
}

export async function listFloorPlans(): Promise<FloorPlan[]> {
  const res = await fetch(`${API_BASE}/api/floorplans`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function getFloorPlan(id: string): Promise<FloorPlan> {
  const res = await fetch(`${API_BASE}/api/floorplans/${id}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function createRenderJob(floorPlanId: string, stylePreset?: string, cameraPreset?: string): Promise<RenderJob> {
  const res = await fetch(`${API_BASE}/api/renders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      floorPlanId,
      stylePreset: stylePreset || "modern_minimal",
      cameraPreset: cameraPreset || "isometric",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }

  return res.json();
}

export async function getRenderJob(id: string): Promise<RenderJob> {
  const res = await fetch(`${API_BASE}/api/renders/${id}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export function getImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = API_BASE || "";
  const clean = path.replace(/^\//, "");
  return `${base}/uploads/${clean}`.replace(/\/+/g, "/");
}
