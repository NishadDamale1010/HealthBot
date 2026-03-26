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
        setError("Failed to load dashboard");
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
      setError("✅ Profile updated successfully");
      setTimeout(() => setError(""), 2500);
    } catch {
      setError("❌ Failed to update profile");
    }
  };

  const linkWhatsApp = async () => {
    try {
      setError("");
      await API.post("/api/profile/link-whatsapp", { whatsappId: whatsappIdInput });

      const profileRes = await API.get("/api/profile/me");
      setProfile(profileRes.data.profile);
      setWhatsappIdInput(profileRes.data.profile?.whatsappId ?? "");

      setError("✅ WhatsApp linked successfully");
      setTimeout(() => setError(""), 2500);
    } catch {
      setError("❌ Failed to link WhatsApp");
    }
  };

  const updateField = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">

        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-600">🧑 Health Profile</h2>
            <button
              onClick={() => window.open("/api/report/download", "_blank")}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
            >
              📄 Download Report
            </button>
          </div>
          {profile && (
            <p className="text-sm text-gray-500">
              {profile.name} ({profile.email})
            </p>
          )}

          {error && (
            <div className="bg-blue-100 text-blue-700 text-sm p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3">

            <input
              value={form.age}
              onChange={updateField("age")}
              placeholder="Age"
              className="w-full border rounded-lg px-3 py-2"
            />

            <select
              value={form.gender}
              onChange={updateField("gender")}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input
              value={form.existingMedicalConditions}
              onChange={updateField("existingMedicalConditions")}
              placeholder="Medical Conditions"
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              value={form.allergies}
              onChange={updateField("allergies")}
              placeholder="Allergies"
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              value={form.medications}
              onChange={updateField("medications")}
              placeholder="Medications"
              className="w-full border rounded-lg px-3 py-2"
            />

            <button
              onClick={saveProfile}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Save Profile
            </button>

            {/* WhatsApp */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">📱 WhatsApp Linking</h3>

              <input
                value={whatsappIdInput}
                onChange={(e) => setWhatsappIdInput(e.target.value)}
                placeholder="12345@c.us"
                className="w-full border rounded-lg px-3 py-2 mb-2"
              />

              <button
                onClick={linkWhatsApp}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                Link WhatsApp
              </button>
            </div>

          </div>
        </div>

        {/* HISTORY CARD */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">

          <h2 className="text-xl font-bold text-blue-600 mb-2">
            💬 Chat History
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Last {history.length} messages
          </p>

          <div className="flex-1 overflow-y-auto space-y-2">

            {history.length === 0 ? (
              <p className="text-gray-400">No chat history yet.</p>
            ) : (
              history.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-sm max-w-[80%] ${m.role === "user"
                    ? "ml-auto bg-blue-500 text-white"
                    : "bg-gray-100"
                    }`}
                >
                  {m.content}
                </div>
              ))
            )}

          </div>
        </div>

      </div>
    </div>
  );
}