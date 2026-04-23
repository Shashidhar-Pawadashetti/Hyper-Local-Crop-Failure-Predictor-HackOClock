import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getRecommendations, RiskPayload } from '../services/gemini';
// @ts-ignore — JSON import
import soilTypesRaw from '../data/soilTypes.json';
import logger from '../utils/logger';

const soilTypes = soilTypesRaw as Record<string, string>;

// ---------------------------------------------------------------------------
// Zod schema — matches the frontend RecommendRequest
// ---------------------------------------------------------------------------

const recommendSchema = z.object({
  district: z.object({
    id: z.string(),
    name: z.string(),
    state: z.string(),
  }),
  crop: z.object({
    id: z.string(),
    name: z.string(),
  }),
  stage: z.object({
    id: z.string(),
    name: z.string(),
  }),
  language: z.enum(['en', 'hi', 'kn']),
  riskPayload: z.object({
    weather: z.object({
      current: z.object({
        temperature: z.object({ max: z.number(), min: z.number() }),
        precipitation: z.object({ value: z.number() }),
        humidity: z.object({ value: z.number() }),
      }),
      forecast: z.array(z.any()),
    }),
    ndvi: z.object({
      value: z.number(),
      anomaly: z.number(),
      status: z.string(),
    }).nullable(),
    riskScores: z.object({
      droughtStress: z.object({ score: z.number(), level: z.string(), factors: z.array(z.string()).optional() }),
      pestPressure: z.object({ score: z.number(), level: z.string(), factors: z.array(z.string()).optional() }),
      nutrientDeficiency: z.object({ score: z.number(), level: z.string(), factors: z.array(z.string()).optional() }),
      composite: z.object({ score: z.number(), level: z.string() }),
    }),
    forecast7Day: z.array(z.any()),
  }),
});

type RecommendBody = z.infer<typeof recommendSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapToRiskPayload(body: RecommendBody): RiskPayload {
  const rp = body.riskPayload;

  // Sum forecast precipitation across the 7-day forecast
  const forecastRain = rp.weather.forecast.reduce(
    (sum: number, day: Record<string, unknown>) => sum + (Number(day.precipitation) || 0),
    0,
  );

  // Look up soil type from soilTypes.json; fall back to 'medium black'
  const soilType = soilTypes[body.district.name] ?? 'medium black';

  return {
    crop: body.crop.name,
    district: body.district.name,
    growthStage: body.stage.name,
    droughtScore: rp.riskScores.droughtStress.score,
    pestScore: rp.riskScores.pestPressure.score,
    nutrientScore: rp.riskScores.nutrientDeficiency.score,
    compositeScore: rp.riskScores.composite.score,
    droughtLevel: rp.riskScores.droughtStress.level,
    pestLevel: rp.riskScores.pestPressure.level,
    nutrientLevel: rp.riskScores.nutrientDeficiency.level,
    droughtDriver: rp.riskScores.droughtStress.factors?.[0] ?? 'N/A',
    pestDriver: rp.riskScores.pestPressure.factors?.[0] ?? 'N/A',
    nutrientDriver: rp.riskScores.nutrientDeficiency.factors?.[0] ?? 'N/A',
    tempMax: rp.weather.current.temperature.max,
    tempMin: rp.weather.current.temperature.min,
    humidity: rp.weather.current.humidity.value,
    rainfall7d: rp.weather.current.precipitation.value,
    forecastRain,
    ndviCurrent: rp.ndvi?.value ?? null,
    ndviBaseline: rp.ndvi ? rp.ndvi.value - rp.ndvi.anomaly : null,
    ndviDelta: rp.ndvi?.anomaly ?? null,
    soilType,
  };
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const recommendRouter = Router();

recommendRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = recommendSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn('Validation failed for /api/recommend:', parsed.error.issues);
    res.status(400).json({ success: false, error: 'Invalid request body' });
    return;
  }

  try {
    const riskPayload = mapToRiskPayload(parsed.data);
    const result = await getRecommendations(riskPayload);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      requestId: `req-${Date.now()}`,
      data: result.data,
    });
  } catch (err) {
    logger.error('Recommendation route error:', err);
    res.status(503).json({ success: false, error: 'Recommendation service unavailable' });
  }
});

export default recommendRouter;
