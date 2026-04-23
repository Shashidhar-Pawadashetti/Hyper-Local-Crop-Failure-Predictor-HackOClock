import { GoogleGenerativeAI } from '@google/generative-ai';
// @ts-ignore — JSON import
import fallbackDataRaw from '../data/fallbackRecommendations.json';
import logger from '../utils/logger';

// ---------------------------------------------------------------------------
// Model configuration — prefers Groq if GROQ_API_KEY is set, else Gemini
// ---------------------------------------------------------------------------

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = 'llama-3.3-70b-versatile';  // Groq's best model
const GEMINI_MODEL = 'gemini-1.5-pro';           // Upgraded from flash to pro

const SYSTEM_PROMPT = `You are a senior agronomist advising small-scale Indian farmers.
You will receive a JSON object describing a farmer's crop, growth stage,
current weather conditions, satellite NDVI data, and three risk channel
scores (drought, pest pressure, nutrient deficiency).

Your task is to generate 3 to 5 specific, actionable interventions.

Rules you must follow:
1. Every recommendation must include a specific quantity (e.g., "4 cm of water",
   "10 kg urea per acre") or a specific time window (e.g., "before Thursday",
   "within the next 48 hours"). Vague advice like "irrigate as needed" is not acceptable.
2. Prioritise recommendations by risk severity — address the highest-scoring channel first.
3. Write at a Grade 5 comprehension level. Short sentences. Simple words. No jargon.
4. Provide translations directly in the title and description objects for English (en), Hindi (hi), and Kannada (kn).
5. The "voiceText" must be one short sentence in Kannada summarizing the action for voice readout.
6. Return ONLY valid JSON matching the exact schema below. No markdown, no code fences.

Output format (strict JSON):
{
  "recommendations": [
    {
      "id": "rec_001",
      "type": "irrigation",
      "priority": "high",
      "title": { "en": "...", "hi": "...", "kn": "..." },
      "description": { "en": "...", "hi": "...", "kn": "..." },
      "quantity": "4 cm",
      "timing": "within 48 hours",
      "voiceText": "..."
    }
  ],
  "summary": {
    "overallRisk": "high",
    "primaryConcern": "drought stress",
    "actionRequired": true
  }
}

Note: "type" must be one of: "irrigation", "fertilizer", "pest_control", "nutrient", "general".
"priority" must be one of: "high", "medium", "low".
"overallRisk" must be one of: "low", "moderate", "high", "critical".`;

export interface RiskPayload {
  crop: string;
  district: string;
  growthStage: string;
  droughtScore: number;
  pestScore: number;
  nutrientScore: number;
  compositeScore: number;
  droughtLevel: string;
  pestLevel: string;
  nutrientLevel: string;
  droughtDriver: string;
  pestDriver: string;
  nutrientDriver: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainfall7d: number;
  forecastRain: number;
  ndviCurrent: number | null;
  ndviBaseline: number | null;
  ndviDelta: number | null;
  soilType: string;
}

export interface RecommendationItem {
  id: string;
  type: 'irrigation' | 'fertilizer' | 'pest_control' | 'nutrient' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: { en: string; hi: string; kn: string };
  description: { en: string; hi: string; kn: string };
  quantity?: string;
  timing?: string;
  estimatedCost?: number;
  estimatedCostUnit?: string;
  voiceText?: string;
}

export interface RecommendationSummary {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  primaryConcern: string;
  actionRequired: boolean;
}

export interface GeminiResult {
  success: boolean;
  data: {
    recommendations: RecommendationItem[];
    summary: RecommendationSummary;
    generatedBy?: string;
    aiGenerated?: boolean;
  };
}

export function buildUserMessage(payload: RiskPayload): string {
  const v = (val: number | null): string => (val !== null ? String(val) : 'unavailable');
  return `Here is the crop situation for this farmer:

Crop: ${payload.crop}
District: ${payload.district}, India
Growth Stage: ${payload.growthStage}

Risk Scores (0 = no risk, 100 = critical):
- Drought Stress: ${payload.droughtScore}/100 (${payload.droughtLevel}) — Driver: ${payload.droughtDriver}
- Pest Pressure: ${payload.pestScore}/100 (${payload.pestLevel}) — Driver: ${payload.pestDriver}
- Nutrient Deficiency: ${payload.nutrientScore}/100 (${payload.nutrientLevel}) — Driver: ${payload.nutrientDriver}
- Composite Health Score: ${payload.compositeScore}/100

Current Weather (7-day summary):
- Max temperature: ${payload.tempMax}°C
- Min temperature: ${payload.tempMin}°C
- Humidity: ${payload.humidity}%
- Rainfall in last 7 days: ${payload.rainfall7d} mm
- Forecasted rainfall next 7 days: ${payload.forecastRain} mm

Satellite NDVI:
- Current NDVI: ${v(payload.ndviCurrent)}
- Baseline NDVI for this crop/stage: ${v(payload.ndviBaseline)}
- Delta: ${v(payload.ndviDelta)} (negative = crop stress detected)

Soil type for this district: ${payload.soilType}

Generate recommendations now.`;
}

function getFallbackRecommendations(_payload: RiskPayload): GeminiResult {
  const fallback = fallbackDataRaw as { recommendations: RecommendationItem[]; summary: RecommendationSummary };
  return {
    success: true,
    data: {
      recommendations: fallback.recommendations,
      summary: fallback.summary,
      aiGenerated: false,
    },
  };
}

// ---------------------------------------------------------------------------
// Groq provider — OpenAI-compatible chat completions API
// ---------------------------------------------------------------------------

async function callGroq(userMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API ${response.status}: ${errorBody}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment — Groq returns dynamic JSON
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ---------------------------------------------------------------------------
// Gemini provider — Google Generative AI SDK
// ---------------------------------------------------------------------------

async function callGemini(userMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
  });

  const result = await model.generateContent(userMessage);
  return result.response.text();
}

// ---------------------------------------------------------------------------
// Main entry point — auto-selects Groq or Gemini based on available API key
// ---------------------------------------------------------------------------

export async function getRecommendations(payload: RiskPayload): Promise<GeminiResult> {
  const userMessage = buildUserMessage(payload);
  const useGroq = !!process.env.GROQ_API_KEY;
  const provider = useGroq ? 'Groq' : 'Gemini';
  const modelName = useGroq ? GROQ_MODEL : GEMINI_MODEL;

  try {
    if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
      throw new Error('No AI API key configured (set GROQ_API_KEY or GEMINI_API_KEY)');
    }

    logger.info(`Calling ${provider} (${modelName}) for recommendations…`);
    let text = useGroq ? await callGroq(userMessage) : await callGemini(userMessage);

    // Strip markdown code fences if the model wraps the output
    text = text.replace(/^\s*```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment — AI returns dynamic JSON
    const parsed = JSON.parse(text);
    if (!parsed.recommendations || !parsed.summary) {
      throw new Error(`${provider} response missing required keys`);
    }

    logger.info(`${provider} returned ${parsed.recommendations.length} recommendations`);

    return {
      success: true,
      data: {
        recommendations: parsed.recommendations,
        summary: parsed.summary,
        generatedBy: `${provider}/${modelName}`,
        aiGenerated: true,
      },
    };
  } catch (err) {
    logger.error(`[${provider}] Error generating recommendations:`, err);
    return getFallbackRecommendations(payload);
  }
}
