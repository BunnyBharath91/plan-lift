import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, Layers, Plus } from "lucide-react";
import { listFloorPlans, getImageUrl, type FloorPlan } from "../api/client";

export default function FloorPlanList() {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listFloorPlans()
      .then(setFloorPlans)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing Roomify 2.0</p>
        </div>

        <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

        <p className="subtitle">
          Roomify is an AI-first design environment that helps you visualize, render, and ship architectural projects faster than ever.
        </p>

        <div className="actions">
          <Link to="/upload" className="cta inline-flex items-center gap-2">
            Start Building <Layers className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Your floor plans and photorealistic renders, all in one place.</p>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="empty">{error}</div>
          ) : (
            <div className="projects-grid">
              <Link to="/upload" className="project-card empty flex flex-col items-center justify-center min-h-[200px] border-dashed">
                <Plus className="w-12 h-12 text-zinc-400 mb-2" />
                <span>Upload new floor plan</span>
              </Link>
              {floorPlans.map((fp) => (
                <Link key={fp.id} to={`/floorplans/${fp.id}`} className="project-card group">
                  <div className="preview">
                    <img
                      src={fp.filePath ? getImageUrl(fp.filePath) : ""}
                      alt={fp.title}
                    />
                    <div className="badge">
                      <span>Floor Plan</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div>
                      <h3>{fp.title}</h3>
                      <div className="meta">
                        <Clock size={12} />
                        <span>{new Date(fp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="arrow">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
