import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function toCsv(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join(", ");
}

export default function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    age: "",
    gender: "prefer_not_to_say",
    existingMedicalConditions: "",
    allergies: "",
    medications: "",
  });

  const [whatsappIdInput, setWhatsappIdInput] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const [profileRes, historyRes] = await Promise.all([
          API.get("/api/profile/me"),
          API.get("/api/profile/history?limit=30"),
        ]);

        setProfile(profileRes.data.profile);
        setHistory(historyRes.data.messages || []);

        const p = profileRes.data.profile || {};
        setForm({
          age: p.age ?? "",
          gender: p.gender ?? "prefer_not_to_say",
          existingMedicalConditions: toCsv(p.existingMedicalConditions),
          allergies: toCsv(p.allergies),
          medications: toCsv(p.medications),
        });
        setWhatsappIdInput(p.whatsappId ?? "");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate, token]);

  const saveProfile = async () => {
    try {
      setError("");
      await API.put("/api/profile/me", {
        age: form.age === "" ? undefined : form.age,
        gender: form.gender,
        existingMedicalConditions: form.existingMedicalConditions,
        allergies: form.allergies,
        medications: form.medications,
      });

      const profileRes = await API.get("/api/profile/me");
      setProfile(profileRes.data.profile);
      setError("Profile updated successfully");
      setTimeout(() => setError(""), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    }
  };

  const linkWhatsApp = async () => {
    try {
      setError("");
      await API.post("/api/profile/link-whatsapp", { whatsappId: whatsappIdInput });
      const profileRes = await API.get("/api/profile/me");
      setProfile(profileRes.data.profile);
      setWhatsappIdInput(profileRes.data.profile?.whatsappId ?? "");
      setError("WhatsApp linked successfully");
      setTimeout(() => setError(""), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to link WhatsApp");
    }
  };

  const updateField = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

  if (loading) {
    return (
      <div className="page">
        <div className="card">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="grid">
        <section className="card">
          <div className="card-title">Your Health Profile</div>
          {profile && (
            <div className="muted">
              {profile.name} ({profile.email})
            </div>
          )}

          {error && <div className="notice">{error}</div>}

          <div className="form">
            <label className="label">
              Age
              <input
                value={form.age}
                onChange={updateField("age")}
                className="input"
                inputMode="numeric"
                placeholder="e.g. 28"
              />
            </label>

            <label className="label">
              Gender
              <select
                className="input"
                value={form.gender}
                onChange={updateField("gender")}
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="label">
              Existing Medical Conditions
              <input
                value={form.existingMedicalConditions}
                onChange={updateField("existingMedicalConditions")}
                className="input"
                placeholder="comma-separated (e.g. diabetes, asthma)"
              />
            </label>

            <label className="label">
              Allergies
              <input
                value={form.allergies}
                onChange={updateField("allergies")}
                className="input"
                placeholder="comma-separated (e.g. penicillin)"
              />
            </label>

            <label className="label">
              Medications (optional)
              <input
                value={form.medications}
                onChange={updateField("medications")}
                className="input"
                placeholder="comma-separated (e.g. metformin)"
              />
            </label>

            <button className="primary-btn" onClick={saveProfile} type="button">
              Save Profile
            </button>

            <div style={{ height: 10 }} />

            <div className="card-title">Optional WhatsApp Linking</div>
            <div className="muted" style={{ marginBottom: 10 }}>
              Personalization for WhatsApp works when your WhatsApp id is linked.
            </div>

            <label className="label">
              WhatsApp id (example: `12345@c.us`)
              <input
                value={whatsappIdInput}
                onChange={(e) => setWhatsappIdInput(e.target.value)}
                className="input"
                placeholder="paste msg.from value"
              />
            </label>

            <button className="primary-btn" onClick={linkWhatsApp} type="button">
              Link WhatsApp
            </button>
          </div>
        </section>

        <section className="card">
          <div className="card-title">Recent Chat History</div>
          <div className="muted">Last {history.length} messages</div>

          <div className="history">
            {history.length === 0 ? (
              <div className="muted">No chat history yet.</div>
            ) : (
              history.map((m, i) => (
                <div
                  key={`${m.createdAt || i}-${i}`}
                  className={`history-row ${m.role}`}
                >
                  <div className="history-bubble">{m.content}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

