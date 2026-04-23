# FasalRakshak — Project Context (Paste This Into Any AI)

## What This Project Is

FasalRakshak (ಫಸಲ್ ರಕ್ಷಕ — "Crop Guardian") is a hyper-local crop failure predictor web app for Indian farmers, built as a hackathon MVP in 18 hours by team Code Blooded.

A farmer enters 3 inputs: district, crop type, and growth stage. The system fetches live satellite + weather data, runs a risk scoring engine, and returns AI-generated recommendations in Kannada, Hindi, and English — with voice readout for low-literacy users. No login required. Works on a 3G Android browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Charts | Recharts |
| Voice | Web Speech API (browser-native, kn-IN) |
| Backend | Node.js 18 + Express + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Validation | Zod |
| AI | Anthropic Claude API — `claude-sonnet-4-20250514` |
| Weather Data | Open-Meteo API (free, no key) |
| Satellite/NDVI | Sentinel-2 / Copernicus / MODIS |
| Deployment | Docker + Docker Compose + Render.com |

---

## Folder Structure

```
fasalrakshak/
├── client/                        # React frontend
│   └── src/
│       ├── components/
│       │   ├── InputWizard/       # 3-step form: district → crop → stage
│       │   ├── RiskDashboard/     # score gauge, channel cards, forecast chart
│       │   └── RecommendationsPanel/  # multilingual cards + voice button
│       ├── hooks/
│       │   ├── useRiskAnalysis.ts
│       │   └── useRecommendations.ts
│       ├── types/index.ts         # all shared TypeScript interfaces
│       └── utils/speech.ts        # Web Speech API wrapper
│
└── server/                        # Node.js backend
    └── src/
        ├── routes/
        │   ├── analyze.ts         # POST /api/analyze
        │   └── recommend.ts       # POST /api/recommend
        ├── services/
        │   ├── weather.ts         # Open-Meteo integration
        │   ├── ndvi.ts            # Satellite NDVI fetch
        │   ├── scoring.ts         # three-channel risk engine
        │   └── claude.ts          # Anthropic API call
        ├── models/
        │   ├── CropKnowledge.ts   # Mongoose model
        │   └── AnalysisCache.ts   # Mongoose model (TTL 6 hours)
        └── data/
            ├── districts.json          # district → lat/lng
            ├── cropKnowledge.json      # crop × stage vulnerability matrix
            └── fallbackRecommendations.json
```

---

## API Endpoints

### POST `/api/analyze`
**Input:**
```json
{
  "district": "Belagavi",
  "crop": "wheat",
  "growthStage": "flowering",
  "language": "kannada"
}
```
**Output:**
```json
{
  "success": true,
  "data": {
    "compositeScore": 68,
    "channels": {
      "drought":  { "score": 81, "level": "high",   "driver": "3-day rainfall deficit" },
      "pest":     { "score": 28, "level": "low",    "driver": "humidity within safe range" },
      "nutrient": { "score": 52, "level": "medium", "driver": "nitrogen demand peak at flowering" }
    },
    "forecast": [ { "day": "2026-04-24", "score": 68, "rainfall": 0, "tempMax": 34 } ],
    "ndvi": { "current": 0.42, "baseline": 0.61, "delta": -0.19 },
    "weather": { "tempMax": 34, "tempMin": 22, "humidity": 61, "rainfall7d": 2.1, "forecastRain": 8.0 }
  }
}
```

### POST `/api/recommend`
**Input:** the `data` object from `/api/analyze` response  
**Output:**
```json
{
  "success": true,
  "aiGenerated": true,
  "recommendations": {
    "kannada": [
      { "type": "irrigation", "urgency": "immediate", "action": "ನಾಳೆ ಬೆಳಿಗ್ಗೆ 7 ಗಂಟೆಯ ಮೊದಲು 4 ಸೆಂ.ಮೀ. ನೀರು ಹಾಯಿಸಿ", "reason": "..." }
    ],
    "hindi":   [ { "type": "irrigation", "urgency": "immediate", "action": "...", "reason": "..." } ],
    "english": [ { "type": "irrigation", "urgency": "immediate", "action": "Irrigate 4 cm before 7 AM tomorrow", "reason": "..." } ]
  }
}
```

---

## Risk Scoring Logic (scoring.ts)

Three independent channels, each 0–100:

```
DROUGHT SCORE:
  base = (1 - rainfall7d / expectedRainfall) * 100
  ndviPenalty = max(0, (baseline_ndvi - current_ndvi) / baseline_ndvi) * 30
  stageMultiplier = { low:0.6, medium:0.8, high:1.0, critical:1.2 }[droughtSensitivity]
  droughtScore = clamp(base + ndviPenalty, 0, 100) * stageMultiplier

PEST SCORE:
  humidityRisk = humidity > 75 ? (humidity - 75) * 2 : 0
  tempRisk = (tempMax > 32 && tempMax < 38) ? 30 : 0
  stagePestWindow = pestWindow === true ? 20 : 0
  pestScore = clamp(humidityRisk + tempRisk + stagePestWindow, 0, 100)

NUTRIENT SCORE:
  demandBase = { low:20, medium:50, high:75 }[nutrientDemand.N]
  leachingRisk = rainfall7d > 50 ? 25 : 0
  nutrientScore = clamp(demandBase + leachingRisk, 0, 100)

COMPOSITE:
  composite = drought*weights.drought + pest*weights.pest + nutrient*weights.nutrient
  (weights come from cropKnowledge.json per crop × stage, always sum to 1.0)
```

---

## MongoDB Collections

**`cropknowledges`** — seeded from `cropKnowledge.json` on server start. One document per crop. Each document has an array of stages, each with: droughtSensitivity, pestWindow, commonPests, nutrientDemand (N/P/K), tempRange, rainfallRange, and weights (drought/pest/nutrient summing to 1.0).

**`analysiscaches`** — caches `/api/analyze` results. TTL index on `expiresAt` (6 hours). Cache key: `district + crop + growthStage`.

---

## Supported Crops (10)
Rice · Wheat · Sugarcane · Cotton · Maize · Groundnut · Soybean · Tomato · Onion · Jowar

## Supported Languages
Kannada (kn-IN, default) · Hindi (hi-IN) · English (en-IN)

---

## Claude API Usage

- **File:** `server/src/services/claude.ts` — only file that calls Claude
- **Model:** `claude-sonnet-4-20250514`
- **Temp:** `0` (deterministic)
- **Max tokens:** `1000`
- Claude receives the full risk payload and returns pure JSON with `kannada`, `hindi`, `english` arrays
- Each recommendation has: `type`, `urgency`, `action` (with quantities/timing), `reason` (Grade 5 reading level)
- If Claude fails → use `fallbackRecommendations.json`, set `aiGenerated: false`

---

## Key TypeScript Types

```typescript
type CropType = "wheat"|"rice"|"sugarcane"|"cotton"|"maize"|"groundnut"|"soybean"|"tomato"|"onion"|"jowar"
type Language = "kannada" | "hindi" | "english"
type RiskLevel = "low" | "medium" | "high" | "critical"
type Urgency = "immediate" | "within3days" | "thisweek"
type RecommendationType = "irrigation"|"fertilizer"|"pesticide"|"monitoring"|"other"

interface AnalysisResult {
  district: string
  crop: CropType
  growthStage: string
  compositeScore: number
  channels: { drought: ChannelScore, pest: ChannelScore, nutrient: ChannelScore }
  forecast: ForecastDay[]
  ndvi: { current: number|null, baseline: number|null, delta: number|null }
  weather: { tempMax: number, tempMin: number, humidity: number, rainfall7d: number, forecastRain: number }
  soilType: string
  ndviUnavailable?: boolean
}

interface Recommendation {
  type: RecommendationType
  urgency: Urgency
  action: string
  reason: string
}
```

---

## Score → UI Colour Mapping

| Score | Colour | Label |
|---|---|---|
| 0–33 | `#22c55e` green | Healthy |
| 34–55 | `#f59e0b` amber | Watch |
| 56–74 | `#f97316` orange | At Risk |
| 75–100 | `#ef4444` red | Critical |

---

## Environment Variables

**server/.env**
```
PORT=3001
MONGODB_URI=mongodb+srv://...
ANTHROPIC_API_KEY=sk-ant-...
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
```

**client/.env**
```
VITE_API_BASE_URL=http://localhost:3001
```

---

## Important Constraints

- No authentication anywhere — fully public, zero friction
- All TypeScript strict mode — no `any` without a comment
- No API calls in React components — only through custom hooks
- No Redux/Zustand — React hooks only
- Mobile-first at 375px — Tailwind base styles are always mobile
- Kannada text must use `font-family: 'Noto Sans Kannada'`
- NDVI failure is non-fatal — proceed with `ndvi: null` and `ndviUnavailable: true`
- Claude failure is non-fatal — serve fallback recommendations
- Open-Meteo failure IS fatal for `/api/analyze` — return 503

---

## Team

| Member | Owns |
|---|---|
| M1 — Backend | Express server, Open-Meteo, NDVI fetch, MongoDB, districts.json |
| M2 — Scoring | Risk engine (drought/pest/nutrient), cropKnowledge.json, unit tests |
| M3 — AI | Claude API, prompt engineering, multilingual output, fallback recs |
| M4 — Frontend | React UI, Recharts, Web Speech API, mobile polish, PWA |