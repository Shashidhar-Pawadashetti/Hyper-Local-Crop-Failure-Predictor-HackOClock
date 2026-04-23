---
name: fasalrakshak
description: >
  Full project skill for FasalRakshak — a hyper-local crop failure predictor 
  for Indian farmers. Use this skill whenever working on any part of this 
  codebase: adding features, fixing bugs, writing new services, building 
  React components, engineering Claude prompts, seeding MongoDB, or debugging 
  the risk scoring engine. This skill encodes all project-specific constraints, 
  data contracts, naming conventions, and architectural decisions so you never 
  have to guess. Trigger this for ANY task involving FasalRakshak code, docs, 
  or configuration — even if the task seems simple.
---

# FasalRakshak Skill

## What This Project Is

FasalRakshak is a **three-layer web application**:

1. **Data Layer** — fetches live weather (Open-Meteo) and NDVI satellite data (Sentinel-2/MODIS) for a farmer's district
2. **Scoring Layer** — runs a three-channel risk engine (drought, pest, nutrient) producing a 0–100 composite crop health score with a 7-day forecast
3. **AI Layer** — passes the structured risk payload to Claude API which generates 3–5 hyper-specific interventions in Kannada, Hindi, and English, with voice readout via Web Speech API

The farmer inputs only three things: **district**, **crop**, and **growth stage**. No login. No GPS required. Works on a 3G Android browser.

---

## Before You Write Any Code

Always read these files first for the domain you're working in:

| Domain | Read First |
|---|---|
| Any backend work | `AGENTS.md` → API Contract section |
| Risk scoring changes | `AGENTS.md` → Risk Scoring Rules section |
| Claude prompt changes | `docs/PROMPT_GUIDE.md` |
| New React component | `AGENTS.md` → Frontend Component Rules + `docs/FRONTEND_COMPONENTS.md` |
| MongoDB schema changes | `AGENTS.md` → MongoDB Schemas section |
| Crop knowledge edits | `docs/CROP_KNOWLEDGE.md` |

---

## Tech Stack Quick Reference

```
Frontend : React 18 · TypeScript · Vite · Tailwind CSS · Recharts · Web Speech API
Backend  : Node.js 18 · Express · Mongoose · MongoDB Atlas · Zod · Axios
AI       : Anthropic Claude API (claude-sonnet-4-20250514)
Data     : Open-Meteo (weather) · Sentinel-2/Copernicus (NDVI) · cropKnowledge.json
Deploy   : Docker Compose · Render.com
```

---

## The Three Risk Channels — Never Collapse Them

This is the core differentiator of the product. The system always scores and explains three independent channels:

| Channel | Key Inputs | Intervention Type |
|---|---|---|
| **Drought Stress** | rainfall deficit, NDVI delta, soil type | Irrigation schedule |
| **Pest Pressure** | humidity, temp range, crop stage window | Pesticide / monitoring |
| **Nutrient Deficiency** | growth stage demand, leaching risk, soil NPK | Fertilizer type + timing |

Each channel has its own score (0–100). The composite score is a weighted combination using stage-specific weights from `cropKnowledge.json`. Never merge these into a single score before display.

---

## Crop Knowledge Base

Located at `server/src/data/cropKnowledge.json`. This is a **static JSON file** — not fetched from an API. It is seeded into MongoDB on server startup but is also imported directly for scoring to avoid async overhead.

**10 supported crops:**
Rice · Wheat · Sugarcane · Cotton · Maize · Groundnut · Soybean · Tomato · Onion · Jowar

Each crop has 5–6 growth stages. Each stage has:
- `droughtSensitivity`: `"low" | "medium" | "high" | "critical"`
- `pestWindow`: boolean
- `nutrientDemand`: `{ N, P, K }` each `"low" | "medium" | "high"`
- `weights`: `{ drought: float, pest: float, nutrient: float }` — must sum to 1.0

---

## Claude API Rules

- Called **only** from `server/src/services/claude.ts`
- Model: `claude-sonnet-4-20250514` — do not change
- Temperature: `0` for deterministic output
- Output must be **pure JSON** — no markdown, no preamble
- If JSON parse fails → use fallback from `server/src/data/fallbackRecommendations.json`
- The prompt template is in `docs/PROMPT_GUIDE.md` — copy exactly, don't improvise

**Output shape Claude must return:**
```json
{
  "kannada": [{ "type": "", "urgency": "", "action": "", "reason": "" }],
  "hindi":   [{ ... }],
  "english": [{ ... }]
}
```

`urgency` values: `"immediate"` | `"within3days"` | `"thisweek"`  
`type` values: `"irrigation"` | `"fertilizer"` | `"pesticide"` | `"monitoring"` | `"other"`

---

## Patterns to Follow

### Adding a New API Endpoint
1. Create route file in `server/src/routes/`
2. Create corresponding service in `server/src/services/`
3. Add Zod validation schema in `server/src/middleware/validate.ts`
4. Register route in `server/src/index.ts`
5. Update API Contract in `AGENTS.md`

### Adding a New React Component
1. Create folder in `client/src/components/ComponentName/`
2. Files: `index.tsx` + `ComponentName.tsx` + `types.ts` (if complex)
3. Mobile-first: design at 375px, then scale up
4. No inline styles — Tailwind classes only
5. No API calls in components — use hooks from `client/src/hooks/`

### Adding a New Crop
1. Add entry to `server/src/data/cropKnowledge.json`
2. Add to the crop selector options in `InputWizard`
3. Add fallback recommendations for the crop in `fallbackRecommendations.json`
4. Test scoring engine with the new crop across all its stages

---

## Common Gotchas

**NDVI fallback:** Sentinel-2 API may rate-limit or fail during demo. The scoring engine must handle `ndvi: null` gracefully — use weather-only drought scoring with a `ndviUnavailable: true` flag. The frontend shows a small "Satellite data unavailable — weather-based estimate" notice.

**Kannada rendering:** Tailwind's default font stack may not render Kannada well on some devices. Add `font-family: 'Noto Sans Kannada', sans-serif` for elements rendering Kannada text. Import from Google Fonts in `index.html`.

**Web Speech API Kannada:** Not all browsers support `kn-IN` voice. Detect availability with `speechSynthesis.getVoices()`. If `kn-IN` is unavailable, fall back to `hi-IN`, then `en-IN`, and show a small notice.

**MongoDB Atlas cold start:** Free-tier Atlas clusters may have a cold start latency of 2–5 seconds on first connection. Add a connection health check on server startup and retry with 3s backoff.

**Open-Meteo coordinates:** The district lookup in `districts.json` provides a single centroid lat/lng per district. This is sufficient for the hackathon — don't try to do polygon-level queries.

---

## Score Interpretation (for UI display)

| Composite Score | Color | Label |
|---|---|---|
| 0 – 33 | Green (#22c55e) | Healthy |
| 34 – 55 | Amber (#f59e0b) | Watch |
| 56 – 74 | Orange (#f97316) | At Risk |
| 75 – 100 | Red (#ef4444) | Critical |

Same thresholds apply to individual channel cards.

---

## Files That Must Not Be Deleted

- `server/src/data/cropKnowledge.json` — the knowledge base
- `server/src/data/districts.json` — district coordinate lookup
- `server/src/data/fallbackRecommendations.json` — Claude failure fallback
- `docs/PROMPT_GUIDE.md` — Claude prompt specification
- `AGENTS.md` — agent conventions

---

## Definition of Done (MVP)

- [ ] Farmer can complete input in < 60 seconds on mobile
- [ ] Risk score renders with all three channel cards
- [ ] 7-day forecast chart renders with correct data
- [ ] Recommendations appear in Kannada by default
- [ ] Language toggle switches all text to English and Hindi
- [ ] Voice readout plays on Android Chrome
- [ ] App loads on 3G (< 3s first contentful paint)
- [ ] No login or account required
- [ ] Fallback recommendations work when Claude API is unavailable