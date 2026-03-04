import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Box, Download, RefreshCcw, X } from "lucide-react";
import { getRenderJob, getImageUrl, type RenderJob } from "../api/client";

export default function RenderJobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<RenderJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchJob = () => {
      getRenderJob(id)
        .then(setJob)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    };
    fetchJob();
    const interval = setInterval(fetchJob, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const handleExport = () => {
    const img = job?.renderImages?.[0];
    if (!img?.imagePath) return;
    const link = document.createElement("a");
    link.href = getImageUrl(img.imagePath);
    link.download = `roomify-${id}.png`;
    link.click();
  };

  const isProcessing = job?.status === "running" || job?.status === "queued";
  const renderImage = job?.renderImages?.[0];
  const floorPlanImage = job?.floorPlan?.filePath;

  if (loading && !job) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">Roomify</span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="exit flex items-center text-zinc-500 hover:text-black"
        >
          <X className="w-5 h-5 mr-2" /> Exit
        </button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{job?.floorPlan?.title || `Render ${id}`}</h2>
              <p className="note">Status: {job?.status}</p>
            </div>
            <div className="panel-actions">
              <button
                onClick={handleExport}
                disabled={!renderImage?.imagePath}
                className="export btn btn--primary btn--sm"
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </button>
            </div>
          </div>

          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {renderImage?.imagePath ? (
              <img
                src={getImageUrl(renderImage.imagePath)}
                alt="AI Render"
                className="render-img"
              />
            ) : (
              <div className="render-placeholder">
                {floorPlanImage && (
                  <img
                    src={getImageUrl(floorPlanImage)}
                    alt="Original"
                    className="render-fallback"
                  />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Rendering...</span>
                  <span className="subtitle">Generating your photorealistic visualization</span>
                </div>
              </div>
            )}

            {job?.status === "failed" && job.errorMessage && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                <p className="text-red-600">{job.errorMessage}</p>
              </div>
            )}
          </div>
        </div>

        <div className="panel compare">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparison</p>
              <h3>Before and After</h3>
            </div>
            <div className="hint">Drag to compare</div>
          </div>

          <div className="compare-stage">
            {floorPlanImage && renderImage?.imagePath ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ width: "100%", height: "auto" }}
                itemOne={
                  <ReactCompareSliderImage
                    src={getImageUrl(floorPlanImage)}
                    alt="before"
                    className="compare-img"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={getImageUrl(renderImage.imagePath)}
                    alt="after"
                    className="compare-img"
                  />
                }
              />
            ) : (
              <div className="compare-fallback">
                {floorPlanImage && (
                  <img
                    src={getImageUrl(floorPlanImage)}
                    alt="Before"
                    className="compare-img"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
