import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UploadIcon, ImageIcon, CheckCircle2, Layers } from "lucide-react";
import { uploadFloorPlan } from "../api/client";

export default function UploadFloorPlan() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (f: File) => {
      setFile(f);
      setProgress(0);
      setError(null);

      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) {
            clearInterval(interval);
            return 90;
          }
          return p + 10;
        });
      }, 200);

      try {
        const fp = await uploadFloorPlan(f, `Floor Plan ${Date.now()}`);
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => navigate(`/floorplans/${fp.id}`), 500);
      } catch (e) {
        clearInterval(interval);
        setError((e as Error).message);
      }
    },
    [navigate]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && /\.(jpg|jpeg|png|webp)$/i.test(dropped.name)) {
      processFile(dropped);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="upload-shell">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG, WEBP up to 10MB</p>
            </div>

            {!file ? (
              <div
                className={`dropzone ${isDragging ? "is-dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="drop-input"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleChange}
                />
                <div className="drop-content">
                  <div className="drop-icon">
                    <UploadIcon size={20} />
                  </div>
                  <p>Click to upload or drag and drop</p>
                  <p className="help">Maximum file size 10 MB.</p>
                </div>
              </div>
            ) : (
              <div className="upload-status">
                <div className="status-content">
                  <div className="status-icon">
                    {progress === 100 ? (
                      <CheckCircle2 className="check" />
                    ) : (
                      <ImageIcon className="image" />
                    )}
                  </div>
                  <h3>{file.name}</h3>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  <div className="progress">
                    <div className="bar" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="status-text">
                    {progress < 100 ? "Uploading..." : "Redirecting..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
