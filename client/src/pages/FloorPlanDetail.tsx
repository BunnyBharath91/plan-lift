import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFloorPlan, createRenderJob, getImageUrl, type FloorPlan } from "../api/client";

const STYLE_PRESETS = [
  { id: "modern_minimal", label: "Modern Minimal" },
  { id: "scandinavian", label: "Scandinavian" },
  { id: "industrial", label: "Industrial" },
];

export default function FloorPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stylePreset, setStylePreset] = useState("modern_minimal");

  useEffect(() => {
    if (!id) return;
    getFloorPlan(id)
      .then(setFloorPlan)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRender = async () => {
    if (!id) return;
    setRendering(true);
    setError(null);
    try {
      const job = await createRenderJob(id, stylePreset);
      navigate(`/renders/${job.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRendering(false);
    }
  };

  if (loading || !floorPlan) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {loading ? "Loading..." : error || "Not found"}
      </div>
    );
  }

  return (
    <div className="visualizer">
      <nav className="topbar">
        <button type="button" className="brand cursor-pointer bg-transparent border-none" onClick={() => navigate("/")}>
          <span className="name">Roomify</span>
        </button>
      </nav>

      <section className="content max-w-6xl mx-auto p-6">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Floor Plan</p>
              <h2>{floorPlan.title}</h2>
            </div>
          </div>

          <div className="render-area min-h-[300px] bg-zinc-100 p-4">
            {floorPlan.filePath && (
              <img
                src={getImageUrl(floorPlan.filePath)}
                alt={floorPlan.title}
                className="w-full max-h-[400px] object-contain"
              />
            )}
          </div>

          <div className="p-5 border-t border-zinc-100">
            <p className="text-sm font-medium text-zinc-600 mb-3">Style preset</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {STYLE_PRESETS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStylePreset(s.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    stylePreset === s.id
                      ? "bg-primary text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={handleRender}
              disabled={rendering}
              className="btn btn--primary btn--lg"
            >
              {rendering ? "Rendering..." : "Generate Photorealistic Render"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
