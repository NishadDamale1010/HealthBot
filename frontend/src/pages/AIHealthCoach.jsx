import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { downloadHealthReport } from "../services/reportDownload";

const QUICK_PREFS = {
  dietPreference: "balanced",
  activityDays: 3,
  sleepHours: 7,
  proteinConsumed: 42,
};

const CHAT_STORAGE_KEY = "healthbot.chat.conversations.v2";

const extractSymptoms = (messages = []) => {
  const text = messages.map((m) => m?.text || "").join(" ").toLowerCase();
  const keys = ["fever", "pain", "cough", "fatigue", "nausea", "breath", "dizziness", "headache"];
  return keys.filter((k) => text.includes(k));
};

const buildMeals = ({ symptoms, deficiencyRisk, dietPreference }) => {
  const ironFocus = deficiencyRisk?.iron && deficiencyRisk.iron !== "Low";
  const vitaminDFocus = deficiencyRisk?.vitaminD === "High";
  const gentleFoods = symptoms.includes("nausea") || symptoms.includes("fever");

  return {
    breakfast: gentleFoods
      ? ["🍌 Banana + oatmeal", "🥛 Warm milk / fortified soy milk", "🥚 Soft-boiled egg"]
      : ["🍎 Apple + chia oats", "🥚 Eggs / tofu scramble", "🥜 Nuts + seeds"],
    lunch: [
      "🥗 Mixed greens + dal / grilled chicken",
      ironFocus ? "🥦 Spinach + lentils combo" : "🥕 Seasonal vegetables + whole grains",
      "🥛 Curd / probiotic yogurt",
    ],
    dinner: [
      gentleFoods ? "🍲 Light khichdi + vegetables" : "🍗 Lean protein + sautéed veggies",
      vitaminDFocus ? "🐟 Fatty fish or fortified paneer" : "🍠 Sweet potato + salad",
      "💧 Warm water after meal",
    ],
    avoid: [
      symptoms.includes("fever") ? "Sugary cold drinks" : "Processed sugar snacks",
      "Deep-fried foods",
      "Excess caffeine late evening",
      "High-sodium packaged food",
    ],
    hydration: symptoms.includes("fever") ? "Target 2.8L fluids/day + electrolytes" : "Target 2.3L water/day",
    tags: ["Protein", ironFocus ? "Iron Focus" : "Fiber", "Vitamin C", vitaminDFocus ? "Vitamin D" : "Electrolytes"],
    dietPreference,
  };
};

const buildExercises = ({ riskLevel, fatigueRiskIn5Days, activityDays }) => {
  const highRisk = riskLevel === "High";
  const fatigueHigh = fatigueRiskIn5Days === "High";

  return [
    {
      type: "Cardio",
      icon: "🏃",
      duration: highRisk ? "12-15 min/day" : "20 min/day",
      difficulty: highRisk ? "Low" : "Moderate",
      note: highRisk ? "Low-intensity walk + breathing" : "Brisk walk / cycle",
      progress: Math.min(100, Math.round((activityDays / 5) * 100)),
    },
    {
      type: "Strength",
      icon: "💪",
      duration: highRisk ? "10 min x 3 days" : "18 min x 4 days",
      difficulty: highRisk ? "Low" : "Moderate",
      note: "Bodyweight (squats, wall-pushups, glute bridges)",
      progress: Math.min(100, Math.round((activityDays / 4) * 100)),
    },
    {
      type: "Yoga & Recovery",
      icon: "🧘",
      duration: fatigueHigh ? "15 min nightly" : "12 min nightly",
      difficulty: "Easy",
      note: fatigueHigh ? "Focus on breath + restorative stretches" : "Mobility + sleep reset flow",
      progress: fatigueHigh ? 70 : 82,
    },
  ];
};

export default function AIHealthCoach() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [profile, setProfile] = useState({
    age: Number(user?.age) || 32,
    gender: user?.gender || "other",
    conditions: user?.existingMedicalConditions || [],
    ...QUICK_PREFS,
  });

  const [risk, setRisk] = useState(null);
  const [advanced, setAdvanced] = useState(null);
  const [ultra, setUltra] = useState(null);
  const [dailyCoach, setDailyCoach] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [symptoms, setSymptoms] = useState(["fatigue"]);

  const medicalHistoryText = useMemo(() => timeline.map((e) => e.text).join(". ").slice(0, 280), [timeline]);

  const riskLevel = risk?.heartRisk?.level || risk?.diabetesRisk?.level || "Low";
  const aiConfidence = ultra?.predictiveTriage?.confidence || 76;
  const healthScore = Math.max(35, Math.min(98, Math.round(100 - (risk?.heartRisk?.score || 24) * 0.45 + aiConfidence * 0.18)));

  const proteinRequired = useMemo(() => {
    const base = profile.gender?.toLowerCase() === "male" ? 62 : 52;
    const ageAdjust = profile.age > 50 ? 6 : 0;
    const conditionAdjust = profile.conditions?.length ? 5 : 0;
    return base + ageAdjust + conditionAdjust;
  }, [profile]);

  const proteinProgress = Math.min(100, Math.round((profile.proteinConsumed / proteinRequired) * 100));

  const deficiencyRisk = useMemo(() => advanced?.nutritionalDeficiencyPredictor || {}, [advanced]);
  const meals = useMemo(
    () => buildMeals({ symptoms, deficiencyRisk, dietPreference: profile.dietPreference }),
    [symptoms, deficiencyRisk, profile.dietPreference],
  );

  const exercises = useMemo(
    () => buildExercises({ riskLevel, fatigueRiskIn5Days: advanced?.digitalTwin?.fatigueRiskIn5Days, activityDays: profile.activityDays }),
    [riskLevel, advanced, profile.activityDays],
  );

  const vitamins = useMemo(() => {
    const base = [
      {
        name: "Vitamin C",
        why: symptoms.includes("fever") ? "Supports recovery and immune response." : "Supports immunity and tissue repair.",
        sources: "Citrus, amla, bell peppers",
        tone: "medium",
      },
      {
        name: "Vitamin D",
        why: deficiencyRisk?.vitaminD === "High" ? "Deficiency risk is elevated from AI analysis." : "Supports bones and immune modulation.",
        sources: "Sunlight, fortified milk, egg yolk",
        tone: deficiencyRisk?.vitaminD === "High" ? "high" : "medium",
      },
      {
        name: "B12",
        why: "Helps reduce fatigue and supports nerve health.",
        sources: "Dairy, eggs, fish / fortified foods",
        tone: "medium",
      },
      {
        name: "Iron",
        why: deficiencyRisk?.iron && deficiencyRisk.iron !== "Low" ? "AI flagged potential iron risk." : "Supports oxygen transport and energy.",
        sources: "Spinach, lentils, beans, lean meat",
        tone: deficiencyRisk?.iron && deficiencyRisk.iron !== "Low" ? "high" : "low",
      },
    ];
    return base;
  }, [deficiencyRisk, symptoms]);

  const warnings = useMemo(() => {
    const riskyHabits = [];
    if (profile.sleepHours < 7) riskyHabits.push("Sleep debt may increase fatigue and inflammation.");
    if ((risk?.diabetesRisk?.score || 0) >= 70) riskyHabits.push("High sugar intake pattern detected — reduce refined carbs.");
    if (riskLevel === "High") riskyHabits.push("High risk profile detected — prioritize urgent clinical evaluation if symptoms worsen.");

    return {
      avoidFoods: meals.avoid,
      riskyHabits,
    };
  }, [meals, profile.sleepHours, risk, riskLevel]);

  const aiSuggestions = useMemo(() => {
    const list = [
      "Increase hydration consistency across the day.",
      "Reduce sugar intake after dinner.",
      "Keep a fixed bedtime window for 7+ hours sleep.",
    ];

    if (advanced?.medicationAdherence?.adherencePercent < 80) {
      list.unshift("Medication adherence is low — set dose reminders.");
    }
    if (ultra?.continuousMonitoring?.lateNightRisk === "High") {
      list.unshift("Late-night activity is impacting recovery trend.");
    }

    return list.slice(0, 5);
  }, [advanced, ultra]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      let chatHistory = [];
      try {
        chatHistory = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || "[]");
      } catch {
        chatHistory = [];
      }
      const latestMessages = chatHistory[0]?.messages || [];
      const symptomsFromChat = extractSymptoms(latestMessages);
      if (symptomsFromChat.length) setSymptoms(symptomsFromChat);

      const symptomText = (symptomsFromChat.length ? symptomsFromChat : symptoms).join(", ");

      const [riskRes, advancedRes, ultraRes, dailyRes, timelineRes] = await Promise.all([
        API.post("/api/intelligence/risk-score", {
          age: profile.age,
          bmi: 24,
          sleepHours: profile.sleepHours,
          activityDaysPerWeek: profile.activityDays,
          sugarLevel: profile.dietPreference === "low_sugar" ? 3 : 6,
        }),
        API.post("/api/intelligence/advanced-insights", {
          symptoms: symptomText,
          sleepHours: profile.sleepHours,
          steps: profile.activityDays * 1800,
          diet: profile.dietPreference,
          diagnosis: "",
          medsTaken: 5,
          medsPrescribed: 7,
          language: "en",
        }),
        API.post("/api/intelligence/ultra-insights", {
          symptoms: symptomText,
          sleepHours: profile.sleepHours,
          typingSpeedWpm: 30,
          lateNightChats: profile.sleepHours < 6 ? 5 : 2,
          familyHistory: profile.conditions.join(", "),
          medsHelped: "yes",
          weather: "normal",
          aqi: 90,
          goal: "improve health",
          userType: "standard",
          bodyPart: symptomText.includes("chest") ? "chest" : "general",
        }),
        API.post("/api/intelligence/daily-coach", { sleepHours: profile.sleepHours }),
        API.get("/api/intelligence/timeline"),
      ]);

      setRisk(riskRes.data);
      setAdvanced(advancedRes.data);
      setUltra(ultraRes.data);
      setDailyCoach(dailyRes.data);
      setTimeline(timelineRes.data?.events || []);
      console.log("[AIHealthCoach] loaded personalized data", {
        symptoms: symptomText,
        risk: riskRes.data,
      });
    } catch (err) {
      console.error("[AIHealthCoach] failed to load", err);
      setError("Could not load personalized coach data right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`ai-coach-page ${darkMode ? "dark" : ""}`}>
      <div className="ai-coach-shell">
        <section className="ai-coach-hero glass">
          <div>
            <p className="ai-coach-kicker">PERSONALIZED WELLNESS ENGINE</p>
            <h1>Your AI Health Coach</h1>
            <p>
              Personalized nutrition, fitness, and lifestyle plan generated from your profile, symptoms, risk model, and recent health conversations.
            </p>
          </div>
          <div className="ai-coach-hero-metrics">
            <article><span>Health Score</span><strong>{healthScore}%</strong></article>
            <article><span>Risk Level</span><strong>{riskLevel}</strong></article>
            <article><span>AI Confidence</span><strong>{aiConfidence}%</strong></article>
          </div>
          <div className="ai-coach-hero-actions">
            <button disabled={loading} onClick={loadData}>{loading ? "Regenerating…" : "Regenerate Plan"}</button>
            <button onClick={() => setCustomOpen(true)}>Customize Preferences</button>
            <button onClick={() => downloadHealthReport()}>Download Diet Plan (PDF)</button>
            <Link to="/chat">Ask AI Coach</Link>
            <button className="ghost" onClick={() => setDarkMode((s) => !s)}>{darkMode ? "☀️ Light" : "🌙 Dark"}</button>
          </div>
          {error && <div className="ai-coach-error">{error}</div>}
        </section>

        <section className="ai-coach-grid">
          <article className="ai-coach-card glass">
            <h2>🥗 What You Should Eat</h2>
            <p className="ai-coach-sub">Plan tuned for <strong>{profile.dietPreference}</strong> style · Symptoms: {symptoms.join(", ") || "none"}</p>
            <div className="ai-coach-meals">
              <div><h4>Breakfast</h4>{meals.breakfast.map((i) => <span key={i}>{i}</span>)}</div>
              <div><h4>Lunch</h4>{meals.lunch.map((i) => <span key={i}>{i}</span>)}</div>
              <div><h4>Dinner</h4>{meals.dinner.map((i) => <span key={i}>{i}</span>)}</div>
            </div>
            <div className="ai-chip-row">{meals.tags.map((tag) => <span key={tag} className="ai-chip">{tag}</span>)}</div>
            <p className="ai-coach-sub">💧 {meals.hydration}</p>
          </article>

          <article className="ai-coach-card glass">
            <h2>🏋️ Recommended Exercises</h2>
            <div className="ai-coach-exercises">
              {exercises.map((item) => (
                <div key={item.type} className="ai-ex-item">
                  <div>
                    <h4>{item.icon} {item.type}</h4>
                    <p>{item.duration} · {item.difficulty}</p>
                    <small>{item.note}</small>
                  </div>
                  <div className="ai-progress-wrap">
                    <div className="ai-progress"><span style={{ width: `${item.progress}%` }} /></div>
                    <label>{item.progress}% consistency</label>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="ai-coach-card glass">
            <h2>💊 Essential Vitamins</h2>
            <div className="ai-vitamin-grid">
              {vitamins.map((v) => (
                <div key={v.name} className={`ai-vitamin tone-${v.tone}`}>
                  <h4>{v.name}</h4>
                  <p>{v.why}</p>
                  <small>Sources: {v.sources}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="ai-coach-card glass">
            <h2>🍗 Daily Protein Recommendation</h2>
            <p>Required: <strong>{proteinRequired}g/day</strong> · Consumed: <strong>{profile.proteinConsumed}g</strong></p>
            <div className="ai-progress large"><span style={{ width: `${proteinProgress}%` }} /></div>
            <label>{proteinProgress}% of target achieved</label>
            <div className="ai-chip-row">
              {["eggs", "paneer", "chicken", "dal", "tofu", "greek yogurt"].map((s) => <span key={s} className="ai-chip">{s}</span>)}
            </div>
          </article>

          <article className="ai-coach-card glass warn">
            <h2>⚠️ Warnings & Alerts</h2>
            <h4>Foods to avoid</h4>
            <ul>{warnings.avoidFoods.map((w) => <li key={w}>{w}</li>)}</ul>
            <h4>Risky habits</h4>
            <ul>{warnings.riskyHabits.length ? warnings.riskyHabits.map((w) => <li key={w}>{w}</li>) : <li>No critical habits flagged right now.</li>}</ul>
          </article>

          <article className="ai-coach-card glass">
            <h2>🤖 AI Suggestions</h2>
            <ul className="ai-suggestions">
              {aiSuggestions.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <div className="ai-coach-mini-grid">
              <div>
                <h4>Daily Coach</h4>
                <p>{dailyCoach?.tips?.[0] || "Loading recommendations…"}</p>
              </div>
              <div>
                <h4>Chat Insight Memory</h4>
                <p>{medicalHistoryText || "No historical context found yet. Start a chat for deeper personalization."}</p>
              </div>
            </div>
          </article>
        </section>
      </div>

      {customOpen && (
        <div className="ai-coach-modal-backdrop" onClick={() => setCustomOpen(false)}>
          <div className="ai-coach-modal glass" onClick={(e) => e.stopPropagation()}>
            <h3>Customize Preferences</h3>
            <label>Diet preference
              <select value={profile.dietPreference} onChange={(e) => setProfile((p) => ({ ...p, dietPreference: e.target.value }))}>
                <option value="balanced">Balanced</option>
                <option value="high_protein">High Protein</option>
                <option value="low_sugar">Low Sugar</option>
                <option value="vegetarian">Vegetarian</option>
              </select>
            </label>
            <label>Activity days/week
              <input type="number" min="1" max="7" value={profile.activityDays} onChange={(e) => setProfile((p) => ({ ...p, activityDays: Number(e.target.value) }))} />
            </label>
            <label>Sleep hours
              <input type="number" min="4" max="10" step="0.5" value={profile.sleepHours} onChange={(e) => setProfile((p) => ({ ...p, sleepHours: Number(e.target.value) }))} />
            </label>
            <label>Protein consumed today (g)
              <input type="number" min="0" max="180" value={profile.proteinConsumed} onChange={(e) => setProfile((p) => ({ ...p, proteinConsumed: Number(e.target.value) }))} />
            </label>
            <div className="ai-coach-modal-actions">
              <button onClick={() => setCustomOpen(false)}>Close</button>
              <button
                onClick={() => {
                  setCustomOpen(false);
                  loadData();
                }}
              >Apply + Regenerate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
