import { Router, Request, Response } from 'express';
import { z } from 'zod';

import { getRecommendations, RiskPayload } from '../services/gemini';
import logger from '../utils/logger';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const recommendSchema = z.object({
  district: z.string().min(2),
  crop: z.string().min(2),
  growthStage: z.string().min(2),
  language: z.enum(['en', 'hi', 'kn']),
  riskPayload: z.object({
    droughtScore: z.number().min(0).max(100),
    pestScore: z.number().min(0).max(100),
    nutrientScore: z.number().min(0).max(100),
    compositeScore: z.number().min(0).max(100),
    droughtLevel: z.string(),
    pestLevel: z.string(),
    nutrientLevel: z.string(),
    droughtDriver: z.string(),
    pestDriver: z.string(),
    nutrientDriver: z.string(),
    weather: z.object({
      current: z.object({
        temperature: z.object({ max: z.number(), min: z.number() }),
        precipitation: z.object({ value: z.number() }),
        humidity: z.object({ value: z.number() }),
      }),
      forecast: z.array(z.unknown()).min(1),
    }),
    ndvi: z
      .object({
        value: z.number(),
        anomaly: z.number(),
        status: z.string(),
      })
      .nullable(),
    forecast7Day: z.array(z.unknown()),
  }),
});

type RecommendBody = z.infer<typeof recommendSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveDriver(level: string, channel: 'drought' | 'pest' | 'nutrient'): string {
  if (channel === 'drought') {
    return level === 'high' || level === 'critical'
      ? 'precipitation deficit'
      : 'within normal range';
  }
  if (channel === 'pest') {
    return level === 'high'
      ? 'humidity and temperature favorable'
      : 'conditions normal';
  }
  return level === 'high' ? 'nitrogen demand at peak' : 'moderate demand';
}

function computeForecastRain(body: RecommendBody): number {
  const items = body.riskPayload.forecast7Day.slice(0, 7);
  if (items.length === 0) return body.riskPayload.droughtScore / 10;

  return items.reduce<number>((sum, item) => {
    if (typeof item === 'object' && item !== null && 'precipitation' in item) {
      const precip = (item as { precipitation: number }).precipitation;
      return sum + (typeof precip === 'number' ? precip : 0);
    }
    return sum;
  }, 0);
}

function mapToRiskPayload(body: RecommendBody): RiskPayload {
  const rp = body.riskPayload;
  const ndviCurrent = rp.ndvi?.value ?? null;
  const ndviDelta = rp.ndvi?.anomaly ?? null;
  const ndviBaseline = ndviCurrent !== null && rp.ndvi
    ? ndviCurrent - rp.ndvi.anomaly
    : null;

  return {
    crop: body.crop,
    district: body.district,
    growthStage: body.growthStage,
    droughtScore: rp.droughtScore,
    pestScore: rp.pestScore,
    nutrientScore: rp.nutrientScore,
    compositeScore: rp.compositeScore,
    droughtLevel: rp.droughtLevel,
    pestLevel: rp.pestLevel,
    nutrientLevel: rp.nutrientLevel,
    droughtDriver: deriveDriver(rp.droughtLevel, 'drought'),
    pestDriver: deriveDriver(rp.pestLevel, 'pest'),
    nutrientDriver: deriveDriver(rp.nutrientLevel, 'nutrient'),
    tempMax: rp.weather.current.temperature.max,
    tempMin: rp.weather.current.temperature.min,
    humidity: rp.weather.current.humidity.value,
    rainfall7d: rp.weather.current.precipitation.value,
    forecastRain: computeForecastRain(body),
    ndviCurrent,
    ndviBaseline,
    ndviDelta,
    soilType: 'medium', // hardcoded — will be dynamic in v2
  };
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const recommendRouter = Router();

recommendRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = recommendSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn('Validation failed:', parsed.error.issues);
    res.status(400).json({ success: false, error: 'Invalid request body' });
    return;
  }

  try {
    const riskPayload = mapToRiskPayload(parsed.data);
    const result = await getRecommendations(riskPayload);

    res.json({
      success: true,
      recommendations: result.recommendations,
      aiGenerated: result.aiGenerated,
      requestedLanguage: parsed.data.language,
    });
  } catch (err) {
    logger.error('Recommendation route error:', err);
    res.status(503).json({ success: false, error: 'Recommendation service unavailable' });
  }
});

export default recommendRouter;
