import { Router, Request, Response } from 'express';

// @ts-ignore — JSON import
import cropKnowledgeRaw from '../data/cropKnowledge.json';
// @ts-ignore — JSON import
import districtsRaw from '../data/districts.json';

import logger from '../utils/logger';

const cropKnowledge = cropKnowledgeRaw as Record<string, Record<string, unknown>>;
const districts = districtsRaw as Record<string, { lat: number; lng: number }>;

// ---------------------------------------------------------------------------
// District metadata — state detection & language mapping
// ---------------------------------------------------------------------------

interface DistrictMeta {
  state: string;
  stateCode: string;
  primaryLanguage: 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'mr';
}

/** Map district names to their state + language. Fallback to Karnataka/Kannada. */
function getDistrictMeta(name: string): DistrictMeta {
  // Maharashtra districts
  const MH_DISTRICTS = ['Pune', 'Nashik'];
  if (MH_DISTRICTS.includes(name)) {
    return { state: 'Maharashtra', stateCode: 'MH', primaryLanguage: 'mr' };
  }

  // Andhra Pradesh / Telangana
  const AP_DISTRICTS = ['Kurnool'];
  if (AP_DISTRICTS.includes(name)) {
    return { state: 'Andhra Pradesh', stateCode: 'AP', primaryLanguage: 'te' };
  }

  // Tamil Nadu
  const TN_DISTRICTS = ['Coimbatore'];
  if (TN_DISTRICTS.includes(name)) {
    return { state: 'Tamil Nadu', stateCode: 'TN', primaryLanguage: 'ta' };
  }

  // Uttar Pradesh
  const UP_DISTRICTS = ['Lucknow'];
  if (UP_DISTRICTS.includes(name)) {
    return { state: 'Uttar Pradesh', stateCode: 'UP', primaryLanguage: 'hi' };
  }

  // Rajasthan
  const RJ_DISTRICTS = ['Jaipur'];
  if (RJ_DISTRICTS.includes(name)) {
    return { state: 'Rajasthan', stateCode: 'RJ', primaryLanguage: 'hi' };
  }

  // Default: Karnataka
  return { state: 'Karnataka', stateCode: 'KA', primaryLanguage: 'kn' };
}

// ---------------------------------------------------------------------------
// Reference data routes — static lookups for the InputWizard
// ---------------------------------------------------------------------------

const referenceRouter = Router();

// GET /api/districts — list all available districts
referenceRouter.get('/districts', (_req: Request, res: Response): void => {
  const districtNames = Object.keys(districts);
  const data = districtNames.map((name, index) => {
    const coords = districts[name];
    const meta = getDistrictMeta(name);
    return {
      id: `${meta.stateCode}_${String(index + 1).padStart(2, '0')}`,
      name,
      state: meta.state,
      stateCode: meta.stateCode,
      lat: coords.lat,
      lon: coords.lng,
      primaryLanguage: meta.primaryLanguage,
    };
  });

  logger.info(`Returning ${data.length} districts`);
  res.json({ success: true, data });
});

// GET /api/crops — list available crops
referenceRouter.get('/crops', (_req: Request, res: Response): void => {
  const crops = Object.keys(cropKnowledge).map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
  }));
  logger.info(`Returning ${crops.length} crops`);
  res.json({ success: true, data: crops });
});

// GET /api/crops/:cropId/stages — list stages for a crop
referenceRouter.get('/crops/:cropId/stages', (req: Request, res: Response): void => {
  const cropId = req.params.cropId as string;
  const stages = cropKnowledge[cropId];
  if (!stages) {
    res.status(404).json({ success: false, error: `Crop not found: ${cropId}` });
    return;
  }
  const stageList = Object.keys(stages).map(id => ({
    id,
    name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  }));
  logger.info(`Returning ${stageList.length} stages for ${cropId}`);
  res.json({ success: true, data: stageList });
});

export default referenceRouter;
