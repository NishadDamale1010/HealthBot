# 🧠 HealthBot — Complete Feature Report
### AI-Driven Public Health Chatbot for Disease Awareness
**Generated:** 17 July 2026  
**Stack:** Node.js (Express) · React (Vite) · MongoDB · Groq/OpenRouter LLMs

---

## 📋 Table of Contents

1. [Core Chat & AI Engine](#1-core-chat--ai-engine)
2. [User Authentication & Profiles](#2-user-authentication--profiles)
3. [AI Health Intelligence Suite](#3-ai-health-intelligence-suite)
4. [Advanced AI Bundle](#4-advanced-ai-bundle)
5. [Ultra AI Bundle](#5-ultra-ai-bundle)
6. [Health Records & Reports](#6-health-records--reports)
7. [Nearby Hospital Locator](#7-nearby-hospital-locator)
8. [Seasonal Disease Alerts](#8-seasonal-disease-alerts)
9. [WhatsApp Bot Integration](#9-whatsapp-bot-integration)
10. [SIH Blueprint — Multilingual Voice Pipeline](#10-multilingual-voice-pipeline)
11. [SIH Blueprint — Offline-First PWA](#11-offline-first-pwa-mode)
12. [SIH Blueprint — ASHA Worker Co-Pilot](#12-asha-worker-co-pilot-mode)
13. [SIH Blueprint — ABDM V3 ABHA Integration](#13-abdm-v3-abha-integration)
14. [SIH Blueprint — PIB Misinformation Firewall](#14-pib-misinformation-firewall)
15. [SIH Blueprint — DPDP Consent Manager](#15-dpdp-consent-manager)
16. [SIH Blueprint — Epidemic Outbreak Heatmap](#16-epidemic-outbreak-heatmap)
17. [Infrastructure & Security](#17-infrastructure--security)
18. [API Reference](#18-api-reference)
19. [Folder Structure](#19-folder-structure)

---

## 1. Core Chat & AI Engine

| Aspect | Detail |
|--------|--------|
| **Route** | `POST /api/chat` |
| **LLM Providers** | OpenRouter (GPT-3.5-Turbo) → Groq (Llama-3) fallback chain |
| **Features** | Multi-turn conversational memory, 5-step user profile intake, symptom analysis with disease prediction, context-aware follow-ups |
| **Intake Flow** | Symptom → Duration → Severity (1–10 with chip selection) → Location → Additional symptoms |
| **Emergency Detection** | Keyword matching for critical terms (chest pain, unconscious, severe bleeding) triggers SOS overlay with 📞 Call 102, 🏥 Find Hospitals, and audible alarm |
| **Risk Assessment** | Multi-factor risk scoring: backend prediction + user severity + keyword matching (HIGH/MEDIUM/LOW) |
| **Chat History** | Persisted in MongoDB (`ChatMessage` model), last 6 messages loaded as LLM context, 10 messages loaded for UI |
| **Language Support** | English, Hindi (हिंदी), Marathi (मराठी) — auto-detection via `googletrans` |
| **UI Features** | Dark/Light theme, ECG animation, typing indicator, section-based card splitting (max 4), quick prompt chips |

---

## 2. User Authentication & Profiles

| Aspect | Detail |
|--------|--------|
| **Routes** | `POST /api/auth/register`, `POST /api/auth/login` |
| **Auth Method** | JWT (7-day expiry) + bcryptjs password hashing |
| **User Schema Fields** | name, email, password, age, gender, existingMedicalConditions[], allergies[], medications[], whatsappId, **role** (CITIZEN / ASHA_WORKER) |
| **Profile Routes** | `GET /api/profile/me`, `PUT /api/profile/me`, `GET /api/profile/chat-history`, `PUT /api/profile/link-whatsapp` |
| **Frontend** | Login/Register pages, auto-redirect on 401, avatar with initials in navbar |

---

## 3. AI Health Intelligence Suite

All endpoints at `/api/intelligence/*`:

| Feature | Endpoint | What It Does |
|---------|----------|-------------|
| **Disease Progression Simulator** | `POST /progression` | Simulates how a disease may progress over time based on symptoms |
| **Risk Score Calculator** | `POST /risk-score` | Generates a numerical risk score from symptom data |
| **Prescription Safety Checker** | `POST /prescription-safety` | Analyzes drug interactions and safety of medications |
| **Emotion/Mental Health Check** | `POST /emotion-check` | Detects emotional state and provides mental health guidance |
| **Lab Report Analyzer** | `POST /lab-analyzer` | Parses and interprets lab test values |
| **Daily Health Coach** | `POST /daily-coach` | Personalized daily health tips based on profile |

---

## 4. Advanced AI Bundle

| Feature | Endpoint | What It Does |
|---------|----------|-------------|
| **Advanced Insights** | `POST /advanced-insights` | Digital twin simulation, adherence tracking, recovery prediction, second opinion scaffolds |
| **Health Timeline** | `GET /timeline` | Chronological view of all health interactions and assessments |

---

## 5. Ultra AI Bundle

| Feature | Endpoint | What It Does |
|---------|----------|-------------|
| **Ultra Insights** | `POST /ultra-insights` | Continuous monitoring analysis, triage color coding, confidence scoring, habit correlation, rare disease flagging |
| **Skin Disease Detection** | `POST /skin-detect` | AI-assisted preliminary analysis of dermatological images |
| **Lab Report Explanation** | `POST /lab-report-explain` | Plain-language explanation of clinical lab reports |

---

## 6. Health Records & Reports

| Feature | Endpoint | What It Does |
|---------|----------|-------------|
| **Save Health Data** | `POST /api/health/save` | Manually save health data to history |
| **Health History** | `GET /api/health/history` | Retrieve full conversation-based health history grouped by session |
| **AI Health Insights** | `GET /api/health/insights` | AI-generated insights derived from chat history analysis |
| **PDF Report Download** | `GET /api/health/report` | Download a PDF report with AI-generated health summary (via PDFKit) |

---

## 7. Nearby Hospital Locator

| Aspect | Detail |
|--------|--------|
| **Route** | `GET /api/hospitals` |
| **Data Source** | RapidAPI (free tier) for real-time hospital geolocation |
| **Frontend** | Full hospital listing page with distance-based sorting |
| **Emergency Integration** | Linked from the emergency overlay in Chat (🏥 Find Hospitals button) |

---

## 8. Seasonal Disease Alerts

| Aspect | Detail |
|--------|--------|
| **Route** | `GET /api/seasonal-alert` |
| **Data** | Pre-curated seasonal health data (monsoon diseases, flu season, heat stroke warnings) |
| **Frontend** | `SeasonalAlert` banner component displayed at the top of the Chat page |

---

## 9. WhatsApp Bot Integration

| Aspect | Detail |
|--------|--------|
| **Library** | `whatsapp-web.js` + `qrcode-terminal` |
| **Status** | Infrastructure ready (commented out in server.js to prevent boot issues) |
| **Features** | WhatsApp linking via profile (`PUT /api/profile/link-whatsapp`), personalized responses based on linked account |

---

## 10. Multilingual Voice Pipeline
> **🏷️ SIH Blueprint Feature — Innovation: 9/10, Impact: 10/10**

| Aspect | Detail |
|--------|--------|
| **Technology** | Web Speech API (100% free, browser-native) |
| **Speech-to-Text** | `webkitSpeechRecognition` — supports `en-US`, `hi-IN`, `mr-IN` |
| **Text-to-Speech** | `SpeechSynthesisUtterance` — auto-reads bot responses aloud when enabled |
| **Toggle** | 🔊/🔇 button in Chat header to enable/disable voice output |
| **Mic Input** | 🎤 button in input bar — tap to speak, transcript auto-fills input |
| **Cost** | $0 — runs entirely client-side |

---

## 11. Offline-First PWA Mode
> **🏷️ SIH Blueprint Feature — "Village Mode" Offline Fallback**

| Aspect | Detail |
|--------|--------|
| **Technology** | `vite-plugin-pwa` with Workbox auto-generated Service Worker |
| **Manifest** | Full PWA manifest (name, icons, theme color) for mobile installation |
| **Precaching** | 6 static assets precached (545 KB) for instant load |
| **Service Worker** | `sw.js` + `workbox-*.js` auto-registered, auto-updated |

---

## 12. ASHA Worker Co-Pilot Mode
> **🏷️ SIH Blueprint Feature — Innovation: 8.5/10, Impact: 9.5/10**

| Aspect | Detail |
|--------|--------|
| **Frontend** | Tabbed dashboard: Guidelines, Vaccination Schedule, Schemes |
| **Guidelines Data** | 4 categories: Antenatal Care (ANC), Safe Delivery, Postnatal Care (PNC), Newborn Care |
| **Vaccination Schedule** | Full Indian National Immunization Schedule (UIP) — Birth to 16 years |
| **Government Schemes** | PM-JAY, JSY, JSSK, PMMVY, RBSK, Nikshay Poshan, AB-HWC with eligibility criteria |
| **Backend Routes** | `GET /api/asha/guidelines`, `GET /api/asha/vaccination-schedule`, `POST /api/asha/scheme-eligibility` |
| **Access Control** | Protected by JWT auth + RBAC middleware (`ASHA_WORKER` role only) |
| **Nav Visibility** | "ASHA Co-Pilot" link only visible to users with `role: "ASHA_WORKER"` |

---

## 13. ABDM V3 ABHA Integration
> **🏷️ SIH Blueprint Feature — Innovation: 8/10, Impact: 10/10**

| Aspect | Detail |
|--------|--------|
| **Frontend** | 3-step OTP flow: Enter Mobile → Verify OTP → ABHA Linked |
| **Backend Service** | Mock implementation of ABDM V3 APIs with realistic NHA-structured responses |
| **Endpoints** | `POST /api/abdm/generate-otp`, `POST /api/abdm/verify-otp`, `POST /api/abdm/create-abha`, `POST /api/abdm/discover` |
| **Encryption Notes** | RSA/ECB/OAEPWithSHA-1AndMGF1Padding documented (production-ready swap) |
| **Production Ready** | Mock service can be swapped for real ABDM Sandbox with env variable toggle |

---

## 14. PIB Misinformation Firewall
> **🏷️ SIH Blueprint Feature — Innovation: 9/10, Impact: 8/10**

| Aspect | Detail |
|--------|--------|
| **Database** | Local store of **17 debunked Indian health myths** |
| **Myths Covered** | Cow urine cures cancer, tulsi cures COVID, vaccines cause autism, 5G causes corona, cold water causes cold, garlic cures COVID, insulin is addictive, homeopathy for cancer, etc. |
| **Detection** | Keyword-based semantic matching via `checkForMisinformation(query)` |
| **Response** | Returns `{ isMisinformation, myth, fact, source }` |
| **Middleware** | Non-blocking Express middleware enriches `req.factCheckResult` before chat processing |

---

## 15. DPDP Consent Manager
> **🏷️ SIH Blueprint Feature — DPDP Act 2023 Compliance**

| Aspect | Detail |
|--------|--------|
| **Frontend** | Toggle UI for 5 consent purposes with DPDP compliance badge |
| **Consent Purposes** | Health Analysis, Chat History, PHR Sharing, Anonymized Analytics, Scheme Matching |
| **Backend Model** | Immutable append-only audit trail (userId, purpose, status, IP, userAgent, timestamp) |
| **Backend Routes** | `POST /api/consent/grant`, `POST /api/consent/revoke`, `GET /api/consent/status` |
| **Compliance** | Satisfies DPDP Act 2023 requirements for explicit, granular, logged consent |

---

## 16. Epidemic Outbreak Heatmap
> **🏷️ SIH Blueprint "WOW" Feature — Syndromic Surveillance**

| Aspect | Detail |
|--------|--------|
| **Dashboard** | Real-time surveillance view of 12 Indian districts |
| **Diseases Tracked** | Dengue, Malaria, Chikungunya, Typhoid, Japanese Encephalitis, Leptospirosis, Nipah Virus |
| **Data Points** | District, state, disease, case count, trend (rising/falling/stable), severity (critical/high/medium/low) |
| **Filtering** | Filter by severity level (All / Critical / High / Medium / Low) |
| **Stats Dashboard** | Total queries, active districts, critical zones, rising trends |

---

## 17. Infrastructure & Security

| Aspect | Detail |
|--------|--------|
| **CORS** | Configurable via `FRONTEND_ORIGIN` env variable |
| **Rate Limiting** | Configurable daily limits (`CHAT_DAILY_LIMIT`, `UPLOAD_DAILY_LIMIT`) |
| **Request Tracking** | UUID `X-Request-Id` header on every response |
| **Error Handling** | Global error handler with request ID logging |
| **Security Headers** | `x-powered-by` disabled |
| **Health Check** | `GET /healthz` — uptime, timestamp, request ID |
| **JWT Auth** | Mandatory (`auth.middleware.js`) and optional (`optionalAuth.middleware.js`) variants |
| **RBAC** | Factory middleware `rbac(["ROLE"])` for role-based access control |
| **Deployment** | Backend on Render, Frontend on Vercel (with SPA rewrite via `vercel.json`) |
| **File Storage** | Cloudinary (free tier) for image uploads |
| **Email** | Gmail SMTP via App Password |

---

## 18. API Reference

### Authentication
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | ❌ | User registration (accepts optional `role`) |
| POST | `/api/auth/login` | ❌ | User login (returns JWT + user with `role`) |

### Chat
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/chat` | Optional | Core AI chat interaction |

### Profile
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/profile/me` | ✅ | Get user profile |
| PUT | `/api/profile/me` | ✅ | Update profile |
| GET | `/api/profile/chat-history` | ✅ | Get user chat history |
| PUT | `/api/profile/link-whatsapp` | ✅ | Link WhatsApp ID |

### Health
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/health/save` | ✅ | Save health data |
| GET | `/api/health/history` | ✅ | Health history |
| GET | `/api/health/insights` | ✅ | AI-generated insights |
| GET | `/api/health/report` | ✅ | Download PDF report |

### Intelligence Suite
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/intelligence/progression` | ❌ | Disease progression simulation |
| POST | `/api/intelligence/risk-score` | ❌ | Risk score calculation |
| POST | `/api/intelligence/prescription-safety` | ❌ | Drug interaction check |
| POST | `/api/intelligence/emotion-check` | ❌ | Mental health assessment |
| POST | `/api/intelligence/lab-analyzer` | ❌ | Lab value interpretation |
| POST | `/api/intelligence/daily-coach` | ❌ | Daily health coaching |
| POST | `/api/intelligence/advanced-insights` | ❌ | Digital twin & recovery prediction |
| POST | `/api/intelligence/ultra-insights` | ❌ | Continuous monitoring & triage |
| POST | `/api/intelligence/skin-detect` | ❌ | Skin disease detection |
| POST | `/api/intelligence/lab-report-explain` | ❌ | Lab report explanation |
| GET | `/api/intelligence/timeline` | Optional | Health timeline |

### Prediction
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/predict` | ❌ | Symptom-based disease prediction |

### Hospitals & Alerts
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/hospitals` | ✅ | Nearby hospitals (RapidAPI) |
| GET | `/api/seasonal-alert` | ❌ | Seasonal disease alerts |

### SIH Blueprint Features
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/abdm/generate-otp` | ❌ | ABDM ABHA OTP generation |
| POST | `/api/abdm/verify-otp` | ❌ | ABDM ABHA OTP verification |
| POST | `/api/abdm/create-abha` | ❌ | Create ABHA address |
| POST | `/api/abdm/discover` | ❌ | Patient discovery (V3) |
| POST | `/api/consent/grant` | ✅ | Grant data processing consent |
| POST | `/api/consent/revoke` | ✅ | Revoke consent |
| GET | `/api/consent/status` | ✅ | Check consent status |
| GET | `/api/asha/guidelines` | ✅ + ASHA | Maternal health guidelines |
| GET | `/api/asha/vaccination-schedule` | ✅ + ASHA | National immunization schedule |
| POST | `/api/asha/scheme-eligibility` | ✅ + ASHA | Government scheme eligibility |

---

## 19. Folder Structure

```
HealthBot/
├── backend/
│   ├── server.js                              # Express entry point
│   ├── src/
│   │   ├── controllers/                       # Route handlers
│   │   │   ├── auth.controller.js             #   Registration & Login
│   │   │   ├── chat.controller.js             #   Core AI chat engine
│   │   │   ├── health.controller.js           #   Health records & PDF reports
│   │   │   ├── hospital.controller.js         #   Nearby hospital search
│   │   │   ├── intelligence.controller.js     #   AI Intelligence Suite
│   │   │   ├── predict.controller.js          #   Symptom prediction
│   │   │   ├── profile.controller.js          #   User profile management
│   │   │   └── seasonal.controller.js         #   Seasonal disease alerts
│   │   ├── models/                            # Mongoose schemas
│   │   │   ├── user.js                        #   User (with role field)
│   │   │   ├── chatMessage.js                 #   Chat message logs
│   │   │   └── HealthHistory.js               #   Health history records
│   │   ├── routes/                            # Express routers
│   │   │   ├── auth.route.js
│   │   │   ├── chat.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── hospital.routes.js
│   │   │   ├── intelligence.routes.js
│   │   │   ├── predict.routes.js
│   │   │   ├── profile.routes.js
│   │   │   └── seasonal.routes.js
│   │   ├── middleware/                        # Auth & Access Control
│   │   │   ├── auth.middleware.js             #   JWT verification (mandatory)
│   │   │   ├── optionalAuth.middleware.js     #   JWT verification (optional)
│   │   │   └── rbac.middleware.js             #   Role-based access control [NEW]
│   │   ├── features/                          # SIH Blueprint modules [NEW]
│   │   │   ├── abdm/                          #   ABDM V3 ABHA Integration
│   │   │   │   ├── abdmService.js
│   │   │   │   ├── abdm.controller.js
│   │   │   │   └── abdm.routes.js
│   │   │   ├── asha/                          #   ASHA Worker Co-Pilot
│   │   │   │   ├── asha.controller.js
│   │   │   │   └── asha.routes.js
│   │   │   ├── consent/                       #   DPDP Consent Manager
│   │   │   │   ├── consent.model.js
│   │   │   │   ├── consent.controller.js
│   │   │   │   └── consent.routes.js
│   │   │   └── misinformation/                #   PIB Fact-Check Firewall
│   │   │       ├── factCheck.js
│   │   │       └── factCheck.middleware.js
│   │   ├── utils/                             # Helper utilities
│   │   │   ├── aiResponse.js
│   │   │   ├── medicalKnowledge.js
│   │   │   ├── symptoms.js
│   │   │   ├── translator.js
│   │   │   ├── memory.js
│   │   │   ├── formatAlert.js
│   │   │   └── getSeasonalData.js
│   │   ├── data/
│   │   │   └── seasonalData.js
│   │   └── whatsapp/
│   │       └── whatsapp.js                    # WhatsApp Web.js integration
│   └── package.json
│
├── frontend/
│   ├── index.html                             # PWA-ready HTML
│   ├── vite.config.js                         # Vite + PWA configuration
│   ├── vercel.json                            # SPA rewrite rules
│   ├── src/
│   │   ├── App.jsx                            # Router + Navigation
│   │   ├── main.jsx                           # Entry point
│   │   ├── pages/
│   │   │   ├── Chat.jsx                       #   Core AI chat interface
│   │   │   ├── Login.jsx                      #   User login
│   │   │   ├── Register.jsx                   #   User registration
│   │   │   ├── Dashboard.jsx                  #   User dashboard
│   │   │   ├── HealthInsights.jsx             #   AI health insights
│   │   │   ├── Hospitals.jsx                  #   Nearby hospital finder
│   │   │   ├── AISuite.jsx                    #   AI Intelligence Suite UI
│   │   │   ├── ASHADashboard.jsx              #   ASHA Co-Pilot [NEW]
│   │   │   ├── OutbreakHeatmap.jsx            #   Epidemic surveillance [NEW]
│   │   │   ├── ConsentManager.jsx             #   DPDP consent UI [NEW]
│   │   │   └── ABHAIntegration.jsx            #   ABHA OTP flow [NEW]
│   │   ├── components/
│   │   │   └── SeasonalAlert.jsx              #   Seasonal alert banner
│   │   ├── services/
│   │   │   ├── api.js                         #   Axios client + interceptors
│   │   │   └── reportDownload.js              #   PDF report download helper
│   │   └── context/
│   │       └── authContext.js                 #   Auth state management
│   └── package.json
│
├── README.md
└── dependencies.md
```

---

> ⚠️ **Disclaimer:** HealthBot provides AI-generated guidance only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
