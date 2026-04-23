# AGENTS.md — FasalRakshak

> This file is the canonical reference for any AI coding agent (Claude Code, Cursor, Copilot, etc.) working on the FasalRakshak codebase. Read this entire file before touching any code.

---

## Project Identity

**FasalRakshak** (ಫಸಲ್ ರಕ್ಷಕ — *Crop Guardian*) is a hyper-local crop failure predictor built for Indian farmers. It ingests live satellite and weather data, runs a three-channel risk scoring engine, and delivers AI-generated recommendations in Kannada, Hindi, and English — including voice readout for low-literacy users.

**Hackathon:** Hyper-Local Crop Failure Predictor track  
**Team:** Code Blooded  
**Time constraint:** 18-hour sprint  
**Stack:** React 18 + TypeScript + Vite + Tailwind (frontend) · Node.js + Express + Mongoose + MongoDB Atlas (backend) · Claude API (AI layer)

---

## Repo Structure

```
fasalrakshak/
├── client/                   # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputWizard/      # 3-step farmer input flow
│   │   │   ├── RiskDashboard/    # Score display + forecast chart
│   │   │   └── RecommendationsPanel/  # Multilingual cards + voice
│   │   ├── hooks/
│   │   │   ├── useRiskAnalysis.ts
│   │   │   └── useRecommendations.ts
│   │   ├── types/
│   │   │   └── index.ts          # All shared TypeScript interfaces
│   │   ├── utils/
│   │   │   └── speech.ts         # Web Speech API wrapper
│   │   └── App.tsx
│   ├── public/
│   │   └── manifest.json         # PWA manifest
│   └── vite.config.ts
│
├── server/                   # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── analyze.ts        # POST /api/analyze
│   │   │   └── recommend.ts      # POST /api/recommend
│   │   ├── services/
│   │   │   ├── weather.ts        # Open-Meteo API integration
│   │   │   ├── ndvi.ts           # Sentinel-2 / NDVI proxy
│   │   │   ├── scoring.ts        # Three-channel risk engine
│   │   │   └── claude.ts         # Anthropic API integration
│   │   ├── models/
│   │   │   ├── CropKnowledge.ts  # Mongoose model
│   │   │   └── AnalysisCache.ts  # Mongoose model
│   │   ├── data/
│   │   │   ├── districts.json    # District → lat/lng lookup
│   │   │   └── cropKnowledge.json # Crop × stage vulnerability matrix
│   │   ├── middleware/
│   │   │   └── validate.ts       # Zod request validation
│   │   └── index.ts              # Express app entry
│   └── tsconfig.json
│
├── docs/                     # All markdown documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── CROP_KNOWLEDGE.md
│   ├── PROMPT_GUIDE.md
│   ├── FRONTEND_COMPONENTS.md
│   └── SPRINT_PLAN.md
│
├── AGENTS.md                 # ← You are here
├── SKILL.md                  # Project skill for Claude Code
├── docker-compose.yml
└── README.md
```

---

## Core Conventions

### Language & Runtime
- All code is **TypeScript** — no plain `.js` files anywhere in `client/` or `server/`
- Node version: **18+**
- Package manager: **npm** (use `npm install`, not yarn or pnpm)
- `"strict": true` in all `tsconfig.json` files — no `any` without a comment explaining why

### Naming Conventions
| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `RiskDashboard.tsx` |
| Hooks | camelCase with `use` prefix | `useRiskAnalysis.ts` |
| API route files | camelCase | `analyze.ts` |
| Service files | camelCase | `weather.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RISK_SCORE` |
| MongoDB collections | camelCase plural | `cropKnowledges`, `analysisCaches` |
| Env variables | SCREAMING_SNAKE_CASE | `ANTHROPIC_API_KEY` |

### File Size Limits
- No component file over **200 lines** — split into sub-components
- No service file over **150 lines** — split into helpers
- No route handler over **50 lines** — business logic goes in services

### Import Order (enforced mentally, not by linter in hackathon)
1. Node built-ins
2. Third-party packages
3. Internal absolute imports (`@/components/...`)
4. Relative imports (`./utils`)

---

## Environment Variables

Create a `.env` file in `server/` with:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/fasalrakshak
ANTHROPIC_API_KEY=sk-ant-...
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
COPERNICUS_USER=
COPERNICUS_PASS=
NODE_ENV=development
```

Create a `.env` file in `client/` with:

```env
VITE_API_BASE_URL=http://localhost:3001
```

**Never commit `.env` files.** Both are in `.gitignore`.

---

## API Contract

### POST `/api/analyze`

**Request:**
```json
{
  "district": "Belagavi",
  "state": "Karnataka",
  "crop": "wheat",
  "growthStage": "flowering",
  "language": "kannada"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "district": "Belagavi",
    "crop": "wheat",
    "growthStage": "flowering",
    "compositeScore": 68,
    "channels": {
      "drought": { "score": 78, "level": "high", "driver": "3-day rainfall deficit" },
      "pest":    { "score": 32, "level": "low",  "driver": "humidity within safe range" },
      "nutrient":{ "score": 55, "level": "medium","driver": "nitrogen demand peak at flowering" }
    },
    "forecast": [
      { "day": "2026-04-24", "score": 68, "rainfall": 0, "tempMax": 34 },
      ...7 days
    ],
    "ndvi": { "current": 0.42, "baseline": 0.61, "delta": -0.19 },
    "weather": {
      "tempMax": 34, "tempMin": 22, "humidity": 61,
      "rainfall7d": 2.1, "forecastRain": 8.0
    }
  }
}
```

### POST `/api/recommend`

**Request:** Same fields as `/api/analyze` response `data` object.

**Response:**
```json
{
  "success": true,
  "recommendations": {
    "kannada": [
      {
        "type": "irrigation",
        "urgency": "immediate",
        "action": "ನಾಳೆ ಬೆಳಿಗ್ಗೆ 7 ಗಂಟೆಯ ಮೊದಲು 4 ಸೆಂ.ಮೀ. ನೀರು ಹಾಯಿಸಿ",
        "reason": "ಮಣ್ಣು ತುಂಬಾ ಒಣಗಿದೆ, ಹೂಬಿಡುವ ಹಂತದಲ್ಲಿ ನೀರಿನ ಕೊರತೆ ಇಳುವರಿ ತಗ್ಗಿಸುತ್ತದೆ"
      }
    ],
    "hindi": [ ... ],
    "english": [ ... ]
  }
}
```

---

## MongoDB Schemas

### CropKnowledge
```typescript
{
  crop: string,           // "wheat"
  stages: [{
    name: string,         // "flowering"
    durationDays: number,
    droughtSensitivity: "low" | "medium" | "high" | "critical",
    pestWindow: boolean,
    commonPests: string[],
    nutrientDemand: { N: "low"|"medium"|"high", P: string, K: string },
    tempRange: { min: number, max: number },
    rainfallRange: { min: number, max: number },
    weights: { drought: number, pest: number, nutrient: number }
  }],
  karnatakaSeason: "kharif" | "rabi" | "both",
  sowingMonths: number[]
}
```

### AnalysisCache
```typescript
{
  district: string,
  crop: string,
  growthStage: string,
  result: object,         // full /api/analyze response
  cachedAt: Date,         // TTL: 6 hours
  expiresAt: Date
}
```

---

## Risk Scoring Rules

The scoring engine lives in `server/src/services/scoring.ts`. These rules are **non-negotiable** — do not change scoring logic without updating this section.

### Drought Score (0–100)
```
base = (1 - rainfall7d / expectedRainfall7d) * 100
ndviPenalty = max(0, (baseline_ndvi - current_ndvi) / baseline_ndvi) * 30
stageMultiplier = droughtSensitivity map: low=0.6, medium=0.8, high=1.0, critical=1.2
droughtScore = clamp(base + ndviPenalty, 0, 100) * stageMultiplier
```

### Pest Score (0–100)
```
humidityRisk = humidity > 75 ? (humidity - 75) * 2 : 0
tempRisk = tempMax > 32 && tempMax < 38 ? 30 : 0
stagePestWindow = pestWindow === true ? 20 : 0
pestScore = clamp(humidityRisk + tempRisk + stagePestWindow, 0, 100)
```

### Nutrient Score (0–100)
```
demandBase = { low: 20, medium: 50, high: 75 }[nutrientDemand.N]
leachingRisk = rainfall7d > 50 ? 25 : 0
nutrientScore = clamp(demandBase + leachingRisk, 0, 100)
```

### Composite Score
```
weights = cropStage.weights  // from CropKnowledge
composite = drought * weights.drought + pest * weights.pest + nutrient * weights.nutrient
```

---

## Claude API Usage

Claude is called **only** in `server/src/services/claude.ts`. No other file should import or call the Anthropic SDK.

**Model:** `claude-sonnet-4-20250514`  
**Max tokens:** `1000`  
**Temperature:** `0` (deterministic for consistency)

The system prompt and user message template live in `docs/PROMPT_GUIDE.md`. Copy them exactly — do not improvise prompt changes without updating the doc.

**Output contract:** Claude must return **only** a JSON object. If the response is not parseable JSON, use the fallback recommendations in `server/src/data/fallbackRecommendations.json`.

---

## Frontend Component Rules

### InputWizard
- Three steps: Step 1 = District, Step 2 = Crop, Step 3 = Growth Stage
- Progress bar shows current step (1/3, 2/3, 3/3)
- No free text inputs — all selections are dropdowns or button grids
- Language selector (EN/HI/KN) is always visible in the top-right corner

### RiskDashboard
- Composite score displayed as a circular gauge (SVG, not a library)
- Three channel cards: color-coded (green ≤ 33, amber 34–66, red ≥ 67)
- 7-day forecast is a `LineChart` from Recharts with score on Y-axis, dates on X-axis
- NDVI badge shows current value and delta arrow (↑↓) vs baseline

### RecommendationsPanel
- Each recommendation is a card with: urgency badge (color-coded), type icon, action text (large, readable), reason text (smaller, muted)
- Language toggle switches ALL text simultaneously — no partial translations
- Voice button uses `window.speechSynthesis` — calls `speech.ts` utility
- Voice reads action text only (not the reason) in the selected language

### Mobile Breakpoints
- Design at **375px** first — this is the primary viewport
- Tablet (768px+): two-column layout for recommendations
- Desktop (1024px+): three-column layout

---

## Voice Readout Implementation

```typescript
// client/src/utils/speech.ts
export function speakRecommendations(
  recommendations: Recommendation[],
  language: "kannada" | "hindi" | "english"
): void {
  const langMap = { kannada: "kn-IN", hindi: "hi-IN", english: "en-IN" }
  const utterance = new SpeechSynthesisUtterance(
    recommendations.map(r => r.action).join(". ")
  )
  utterance.lang = langMap[language]
  utterance.rate = 0.85  // slightly slower for clarity
  window.speechSynthesis.cancel()  // stop any current speech
  window.speechSynthesis.speak(utterance)
}
```

---

## Error Handling Conventions

- All API routes must return `{ success: false, error: string }` on failure
- HTTP status codes: 400 (bad input), 500 (server error), 503 (external API down)
- If Open-Meteo is unreachable → return error, do not proceed to scoring
- If NDVI API is unreachable → proceed with `ndvi: null`, use weather-only scoring with a warning flag
- If Claude API fails → return hardcoded fallback recommendations from `fallbackRecommendations.json` with `{ aiGenerated: false }` flag in response
- Never expose raw error messages from external APIs to the client

---

## What NOT to Do

- Do not add authentication — this is a zero-friction public tool
- Do not add Redux or Zustand — React hooks are sufficient for this scope
- Do not use `fetch` directly in components — all API calls go through custom hooks
- Do not hardcode API keys anywhere — always use `process.env`
- Do not render recommendations in English if the user selected Kannada
- Do not skip Zod validation on incoming requests
- Do not call Claude more than once per `/api/recommend` request
- Do not use `console.log` in production paths — use a simple `logger.ts` wrapper

---

## Integration Checkpoints

### Hour 8 Checkpoint
Before Hour 8, the following must be working end-to-end:
- [ ] `/api/analyze` returns valid JSON for at least 3 district + crop combinations
- [ ] Scoring engine produces scores in 0–100 range for all three channels
- [ ] MongoDB Atlas connection is live and CropKnowledge documents are seeded
- [ ] Frontend InputWizard completes all 3 steps and calls the API

### Hour 14 Checkpoint
Before Hour 14, the following must be working end-to-end:
- [ ] `/api/recommend` returns valid Kannada + English recommendations
- [ ] RiskDashboard renders score, three channel cards, and 7-day chart
- [ ] RecommendationsPanel renders cards in Kannada with language toggle
- [ ] Voice readout works on Android Chrome (test on actual device)

---

## Demo Script (Final 60 Seconds)

1. Open app on mobile browser — show zero login friction
2. Select **Belagavi** district, **Wheat**, **Flowering** stage, language **Kannada**
3. Hit "Check My Crop" — show loading state
4. Dashboard appears — point to composite score, three channel breakdown, NDVI delta
5. Scroll to recommendations — read one recommendation aloud
6. Hit voice button — Kannada audio plays
7. Toggle to English — same recommendations switch language instantly

---

*Last updated: Sprint start. Any agent modifying core scoring logic, API contracts, or prompt templates must update this file in the same commit.*