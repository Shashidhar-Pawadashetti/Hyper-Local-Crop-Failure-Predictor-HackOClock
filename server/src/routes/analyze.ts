import { Router, Request, Response } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';
import AnalysisCache from '../models/AnalysisCache';
// @ts-ignore
import districtsData from '../data/districts.json';
import { getWeather } from '../services/weather';
import { getNDVI } from '../services/ndvi';
import { calculateScore, toApiChannels } from '../services/scoring';

const router = Router();

// Validation schema per API Contract
const analyzeRequestSchema = z.object({
  district: z.string().min(1),
  state: z.string().min(1),
  crop: z.string().min(1),
  growthStage: z.string().min(1),
  language: z.enum(['english', 'hindi', 'kannada'])
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = analyzeRequestSchema.parse(req.body);
    const { district, crop, growthStage } = validatedData;

    // 1. Check cache
    const cached = await AnalysisCache.findOne({ district, crop, growthStage });
    if (cached && cached.expiresAt > new Date()) {
      logger.info(`Serving cached analysis for ${district} - ${crop} at ${growthStage}`);
      res.status(200).json({
        success: true,
        data: cached.result
      });
      return;
    }

    // 2. Lookup Lat/Lng
    const districts = districtsData as Record<string, { lat: number; lng: number }>;
    const coords = districts[district];
    if (!coords) {
      res.status(400).json({ success: false, error: `Coordinates not found for district: ${district}` });
      return;
    }

    // 3. Fetch Weather & NDVI
    // If getWeather throws (e.g. Open-Meteo is down), it is caught below and returns 500
    const weather = await getWeather(coords.lat, coords.lng);
    const ndvi = await getNDVI(coords.lat, coords.lng, crop);

    // 4. Calculate Score
    const scoringResult = calculateScore({
      crop,
      growthStage,
      weather,
      ndvi
    });

    const apiChannels = toApiChannels(scoringResult);

    // 5. Build Final Payload exactly matching AGENTS.md API contract
    const resultPayload = {
      district,
      crop,
      growthStage,
      compositeScore: scoringResult.compositeScore,
      channels: apiChannels.channels,
      forecast: scoringResult.forecast,
      ndvi,
      weather
    };

    // 6. Cache the Result (TTL 6 hours)
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
    await AnalysisCache.findOneAndUpdate(
      { district, crop, growthStage },
      { result: resultPayload, cachedAt: new Date(), expiresAt },
      { upsert: true, new: true }
    );

    // 7. Return Response
    res.status(200).json({
      success: true,
      data: resultPayload
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Invalid input parameters' });
      return;
    }
    logger.error('Error in /api/analyze:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
  }
});

export default router;
