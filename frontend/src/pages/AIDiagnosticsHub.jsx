import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const IMAGE_TYPES = [
  { key: "skin", label: "Skin" },
  { key: "eye", label: "Eye" },
  { key: "throat", label: "Throat" },
  { key: "general_visible_symptoms", label: "General" },
];

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function AIDiagnosticsHub() {
  const [alert, setAlert] = useState("");

  // Image diagnosis states
  const [imageType, setImageType] = useState("skin");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageNotes, setImageNotes] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState(null);

  // Lab analysis states
  const [labFile, setLabFile] = useState(null);
  const [labText, setLabText] = useState("");
  const [labLoading, setLabLoading] = useState(false);
  const [labResult, setLabResult] = useState(null);

  const severityTone = useMemo(() => {
    const s = String(imageResult?.severity || "").toLowerCase();
    if (s === "high") return "high";
    if (s === "medium") return "medium";
    return "low";
  }, [imageResult]);

  const onImagePick = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(await toBase64(file));
    setImageResult(null);
  };

  const runImageAnalysis = async () => {
    if (!imageFile) return;
    setImageLoading(true);
    setAlert("");
    try {
      const imageBase64 = await toBase64(imageFile);
      const { data } = await API.post("/api/intelligence/skin-detect", {
        analysisType: imageType,
        imageBase64,
        mimeType: imageFile.type,
        notes: imageNotes,
      });
      setImageResult(data);
      if (data?.emergency || data?.severity === "high") {
        setAlert("🚨 High-risk visual finding detected. Please seek urgent medical attention.");
      }
    } catch (err) {
      console.error("Image analysis error", err);
      setAlert(err?.response?.data?.message || "Image analysis failed.");
    } finally {
      setImageLoading(false);
    }
  };

  const runLabAnalysis = async () => {
    if (!labFile && !labText.trim()) {
      setAlert("Please upload a report (PDF/image) or paste report text.");
      return;
    }
    setLabLoading(true);
    setAlert("");
    try {
      let payload = { reportText: labText };
      if (labFile) {
        payload = {
          fileBase64: await toBase64(labFile),
          mimeType: labFile.type || "application/pdf",
          patientContext: imageNotes,
        };
      }
      const { data } = await API.post("/api/intelligence/lab-report-analyze", payload);
      setLabResult(data);
      if (data?.emergency || data?.risk_level === "high") {
        setAlert("🚨 Critical lab risk detected. Contact your doctor immediately.");
      }
    } catch (err) {
      console.error("Lab analysis error", err);
      setAlert(err?.response?.data?.message || "Lab analysis failed.");
    } finally {
      setLabLoading(false);
    }
  };

  return (
    <div className="diag-page">
      <div className="diag-shell">
        <section className="diag-hero">
          <div>
            <p className="diag-kicker">AI DIAGNOSTICS HUB</p>
            <h1>Image + Lab Intelligence Center</h1>
            <p>Upload skin/eye/throat images and lab reports (PDF/image) for structured AI-powered clinical triage insights.</p>
          </div>
          <div className="diag-hero-actions">
            <button onClick={() => { setImageResult(null); setLabResult(null); }}>Analyze Again</button>
            <Link to="/chat">Ask AI about this</Link>
          </div>
        </section>

        {alert && <div className="diag-alert">{alert}</div>}

        <section className="diag-grid">
          <article className="diag-card">
            <h2>📸 Real Image-Based Detection</h2>
            <p className="diag-sub">Supports skin, eye, throat, and general visible symptom triage.</p>

            <div className="diag-type-row">
              {IMAGE_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setImageType(t.key)}
                  className={imageType === t.key ? "active" : ""}
                >{t.label}</button>
              ))}
            </div>

            <label className="diag-upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onImagePick(e.dataTransfer.files?.[0]); }}
            >
              <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => onImagePick(e.target.files?.[0])} />
              <span>Drag & drop image or tap to capture/upload</span>
              {imageFile && <small>{imageFile.name}</small>}
            </label>

            {imagePreview && <img className="diag-preview" src={imagePreview} alt="medical upload" />}

            <textarea
              className="diag-textarea"
              value={imageNotes}
              onChange={(e) => setImageNotes(e.target.value)}
              placeholder="Optional notes (duration, pain, itching, fever...)"
            />

            <button className="diag-primary" disabled={!imageFile || imageLoading} onClick={runImageAnalysis}>
              {imageLoading ? "Analyzing image…" : "Run AI Image Analysis"}
            </button>

            {imageResult && (
              <div className="diag-result">
                <h3>{imageResult.detected_condition}</h3>
                <div className="diag-meta">
                  <span>Confidence: {Math.round((imageResult.confidence || 0) * 100)}%</span>
                  <span className={`badge ${severityTone}`}>Severity: {imageResult.severity}</span>
                </div>
                <p>{imageResult.description}</p>
                <ul>
                  {(imageResult.recommendations || []).map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
            )}
          </article>

          <article className="diag-card">
            <h2>🧪 Real Lab Report Analyzer</h2>
            <p className="diag-sub">Upload PDF/image reports or paste extracted values.</p>

            <label className="diag-upload">
              <input
                type="file"
                accept="application/pdf,image/*"
                hidden
                onChange={(e) => setLabFile(e.target.files?.[0] || null)}
              />
              <span>Upload lab report (PDF/JPEG/PNG)</span>
              {labFile && <small>{labFile.name}</small>}
            </label>

            <textarea
              className="diag-textarea"
              value={labText}
              onChange={(e) => setLabText(e.target.value)}
              placeholder="Or paste report text here..."
            />

            <button className="diag-primary" disabled={labLoading} onClick={runLabAnalysis}>
              {labLoading ? "Analyzing report…" : "Run AI Lab Analysis"}
            </button>

            {labResult && (
              <div className="diag-result">
                <h3>{labResult.summary}</h3>
                <div className="diag-meta">
                  <span className={`badge ${labResult.risk_level || "medium"}`}>Risk: {labResult.risk_level}</span>
                  <span>Abnormal values: {(labResult.abnormal_values || []).length}</span>
                </div>

                {!!labResult.extracted_tests?.length && (
                  <div className="diag-table-wrap">
                    <table className="diag-table">
                      <thead><tr><th>Test</th><th>Value</th><th>Unit</th><th>Range</th><th>Status</th></tr></thead>
                      <tbody>
                        {labResult.extracted_tests.map((t, i) => (
                          <tr key={`${t.test}-${i}`}>
                            <td>{t.test}</td>
                            <td>{t.value}</td>
                            <td>{t.unit}</td>
                            <td>{t.reference_range}</td>
                            <td className={String(t.status).toLowerCase() === "normal" ? "ok" : "warn"}>{t.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <p><strong>Simple explanation:</strong> {labResult.simple_explanation}</p>
                <ul>
                  {(labResult.recommendations || []).map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
            )}
          </article>
        </section>
      </div>
    </div>
  );
}
