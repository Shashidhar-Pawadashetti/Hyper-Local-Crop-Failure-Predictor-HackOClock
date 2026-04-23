# FasalRakshak — Claude Prompt Engineering Guide

## Overview

The Claude API is called once per user request at the `/api/recommend` endpoint. It receives a structured risk payload and returns 3–5 hyper-specific interventions in all three languages simultaneously — Kannada, Hindi, and English. This document specifies the exact prompt, the output contract, worked examples, fallback strategy, and tuning guidelines.

---

## Model Configuration

```typescript
{
  model: "claude-sonnet-4-20250514",
  max_tokens: 1000,
  temperature: 0,   // deterministic — same input always gives same output
}
```

---

## System Prompt

Copy this exactly into `server/src/services/claude.ts`. Do not paraphrase.

```
You are a senior agronomist advising small-scale Indian farmers. 
You will receive a JSON object describing a farmer's crop, growth stage, 
current weather conditions, satellite NDVI data, and three risk channel scores 
(drought, pest pressure, nutrient deficiency). 

Your task is to generate 3 to 5 specific, actionable interventions.

Rules you must follow:
1. Every recommendation must include a specific quantity (e.g., "4 cm of water", "10 kg urea per acre") or a specific time window (e.g., "before Thursday", "within the next 48 hours"). Vague advice like "irrigate as needed" is not acceptable.
2. Prioritise recommendations by risk severity — address the highest-scoring channel first.
3. Write at a Grade 5 comprehension level. Short sentences. Simple words. No technical jargon.
4. The "reason" field must be one sentence that explains WHY the action is needed, written so a farmer with no agricultural training can understand it.
5. You must generate the same recommendations in all three languages: Kannada (kn), Hindi (hi), and English (en). Each language array must contain the same number of recommendations in the same order.
6. Return ONLY a valid JSON object. No preamble, no markdown, no explanation outside the JSON.

Output format:
{
  "kannada": [
    {
      "type": "irrigation" | "fertilizer" | "pesticide" | "monitoring" | "other",
      "urgency": "immediate" | "within3days" | "thisweek",
      "action": "<specific action in Kannada>",
      "reason": "<one sentence reason in Kannada>"
    }
  ],
  "hindi": [ { same structure } ],
  "english": [ { same structure } ]
}
```

---

## User Message Template

Build this string in `server/src/services/claude.ts` and pass it as the user message:

```typescript
const userMessage = `
Here is the crop situation for this farmer:

Crop: ${crop}
District: ${district}, Karnataka, India
Growth Stage: ${growthStage}

Risk Scores (0 = no risk, 100 = critical):
- Drought Stress: ${droughtScore}/100 (${droughtLevel}) — Driver: ${droughtDriver}
- Pest Pressure: ${pestScore}/100 (${pestLevel}) — Driver: ${pestDriver}  
- Nutrient Deficiency: ${nutrientScore}/100 (${nutrientLevel}) — Driver: ${nutrientDriver}
- Composite Health Score: ${compositeScore}/100

Current Weather (7-day summary):
- Max temperature: ${tempMax}°C
- Min temperature: ${tempMin}°C  
- Humidity: ${humidity}%
- Rainfall in last 7 days: ${rainfall7d} mm
- Forecasted rainfall next 7 days: ${forecastRain} mm

Satellite NDVI:
- Current NDVI: ${ndviCurrent ?? "unavailable"}
- Baseline NDVI for this crop/stage: ${ndviBaseline ?? "unavailable"}
- Delta: ${ndviDelta ?? "unavailable"} (negative = crop stress detected)

Soil type for this district: ${soilType}

Generate recommendations now.
`.trim()
```

---

## Output Parsing

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function getRecommendations(payload: RiskPayload) {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(payload) }]
    })

    const raw = response.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("")

    const clean = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(clean)

    // Validate structure
    if (!parsed.kannada || !parsed.hindi || !parsed.english) {
      throw new Error("Missing language keys in Claude response")
    }

    return { success: true, recommendations: parsed, aiGenerated: true }

  } catch (err) {
    console.error("Claude API failed:", err)
    return {
      success: true,
      recommendations: getFallbackRecommendations(payload.crop, payload.growthStage),
      aiGenerated: false
    }
  }
}
```

---

## Worked Examples

### Example 1 — Wheat at Flowering, High Drought

**Input payload:**
```json
{
  "crop": "wheat",
  "district": "Belagavi",
  "growthStage": "flowering",
  "droughtScore": 81,
  "pestScore": 28,
  "nutrientScore": 52,
  "compositeScore": 67,
  "tempMax": 35,
  "tempMin": 22,
  "humidity": 48,
  "rainfall7d": 1.2,
  "forecastRain": 6.0,
  "ndviCurrent": 0.38,
  "ndviBaseline": 0.62,
  "ndviDelta": -0.24,
  "soilType": "medium black cotton"
}
```

**Expected Claude output (abbreviated):**
```json
{
  "kannada": [
    {
      "type": "irrigation",
      "urgency": "immediate",
      "action": "ನಾಳೆ ಬೆಳಿಗ್ಗೆ 7 ಗಂಟೆಯ ಮೊದಲು ಪ್ರತಿ ಎಕರೆಗೆ 4 ಸೆಂ.ಮೀ. ನೀರು ಹಾಯಿಸಿ",
      "reason": "ಗೋಧಿ ಹೂಬಿಡುವ ಸಮಯದಲ್ಲಿ ನೀರಿನ ಕೊರತೆ ಕಾಳು ತುಂಬದಂತೆ ಮಾಡುತ್ತದೆ"
    },
    {
      "type": "monitoring",
      "urgency": "within3days",
      "action": "ಗೋಧಿ ಎಲೆಗಳ ಅಂಚು ಹಳದಿ ಆಗುತ್ತಿದ್ದರೆ ಗಮನಿಸಿ — ಇದು ನೀರಿನ ಒತ್ತಡದ ಚಿಹ್ನೆ",
      "reason": "ಉಪಗ್ರಹ ದತ್ತಾಂಶ ತೋರಿಸಿದ ಹಸಿರು ಕಡಿಮೆ ಆಗಿದೆ, ಬೇಗ ಗುರುತಿಸಿದರೆ ನಷ್ಟ ತಪ್ಪಿಸಬಹುದು"
    },
    {
      "type": "fertilizer",
      "urgency": "within3days",
      "action": "ಮಳೆ ಬರುವ ಮೊದಲು ಪ್ರತಿ ಎಕರೆಗೆ 8 ಕೆ.ಜಿ. ಯೂರಿಯಾ ಹಾಕಿ",
      "reason": "ಹೂಬಿಡುವ ಸಮಯದಲ್ಲಿ ಸಾರಜನಕ ಬೇಕಾಗುತ್ತದೆ ಮತ್ತು ಮಳೆ ಬರುವ ಮೊದಲು ಹಾಕಿದರೆ ಗಿಡ ಚೆನ್ನಾಗಿ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ"
    }
  ],
  "english": [
    {
      "type": "irrigation",
      "urgency": "immediate",
      "action": "Irrigate 4 cm per acre tomorrow morning before 7 AM",
      "reason": "Wheat at flowering stage cannot form grain without enough water — the satellite shows your crop is already stressed"
    },
    {
      "type": "monitoring",
      "urgency": "within3days",
      "action": "Check wheat leaves for yellowing at the tips — this is an early drought stress signal",
      "reason": "Catching stress early lets you act before yield loss becomes permanent"
    },
    {
      "type": "fertilizer",
      "urgency": "within3days",
      "action": "Apply 8 kg urea per acre before the forecasted rain on Thursday",
      "reason": "Flowering stage has peak nitrogen demand and rain will help the fertiliser absorb into the soil"
    }
  ]
}
```

---

### Example 2 — Rice at Tillering, High Pest Pressure

**Input payload (key fields):**
```json
{
  "crop": "rice",
  "growthStage": "tillering",
  "droughtScore": 18,
  "pestScore": 79,
  "nutrientScore": 41,
  "compositeScore": 55,
  "humidity": 88,
  "tempMax": 31,
  "rainfall7d": 45
}
```

**Expected output highlights:**
- Pest-first: recommendation 1 should be pesticide/monitoring for brown planthopper or stem borer (common at tillering in high-humidity Karnataka conditions)
- Irrigation ranked last — drought score is low
- Urgency should be `"immediate"` for pest intervention given humidity at 88%

---

### Example 3 — Cotton at Boll Formation, Balanced Risk

**Input payload (key fields):**
```json
{
  "crop": "cotton",
  "growthStage": "bollFormation",
  "droughtScore": 44,
  "pestScore": 51,
  "nutrientScore": 63,
  "compositeScore": 54
}
```

**Expected output highlights:**
- Nutrient-first (potassium demand is critical at boll formation)
- Pest second (bollworm monitoring)
- All three urgencies should be `"within3days"` or `"thisweek"` — no channel is critical

---

## Prompt Tuning Guidelines

### If recommendations are too vague:
Add to system prompt: `"If you write any recommendation without a specific number (quantity, days, hours, or kg), rewrite it with a number before finalising."`

### If Kannada output has grammar issues:
The model may occasionally produce awkward phrasing in Kannada. Add: `"Write Kannada in simple, everyday spoken Karnataka style — avoid formal literary Kannada."`

### If urgency is always "immediate":
Add: `"Use 'immediate' only when delay of more than 24 hours causes irreversible harm. For preventive actions, use 'within3days' or 'thisweek'."`

### If too many recommendations are generated:
Tighten: `"Generate exactly 3 recommendations if composite score is below 50, and exactly 5 if above 70. Generate 4 for scores between 50 and 70."`

---

## Token & Cost Estimate

| Field | Value |
|---|---|
| System prompt tokens | ~280 |
| User message tokens | ~180 |
| Total input tokens | ~460 |
| Output tokens (3 languages × 4 recs) | ~600 |
| Total per call | ~1,060 tokens |
| Claude Sonnet cost per call | ~$0.004 |
| Calls per demo (estimated 50) | ~$0.20 total |

Well within free-tier / hackathon budget.

---

## Fallback Recommendations

If Claude API fails for any reason, `server/src/data/fallbackRecommendations.json` provides static but crop-stage-specific recommendations for all 10 crops × 5 stages combinations.

Fallback recommendations:
- Are pre-written in Kannada, Hindi, and English
- Do not include weather-specific timing (they say "when soil is dry" not "on Tuesday")
- Are clearly marked with `aiGenerated: false` in the API response
- Include a visible notice in the UI: "Advisory based on general guidelines — live data unavailable"