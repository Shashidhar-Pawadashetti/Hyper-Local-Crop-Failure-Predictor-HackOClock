import { NDVIInput } from './scoring';
import { cacheGet, cacheSet, sanitizeKeySegment } from './cache';
import logger from '../utils/logger';

/** NDVI data cache TTL — 24 hours per ARCHITECTURE.md */
const NDVI_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 86 400 000 ms

const COPERNICUS_TOKEN_URL = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
const COPERNICUS_STAT_URL = 'https://sh.dataspace.copernicus.eu/api/v1/statistics';

// ---------------------------------------------------------------------------
// Copernicus Sentinel Hub — Statistical API for NDVI
// ---------------------------------------------------------------------------

async function getCopernicusToken(): Promise<string> {
  const clientId = process.env.COPERNICUS_CLIENT_ID;
  const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Copernicus credentials not configured');
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(COPERNICUS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Copernicus auth failed: ${res.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment — dynamic JSON
  const data = await res.json();
  return data.access_token as string;
}

/**
 * Queries Copernicus Sentinel Hub Statistical API for NDVI mean
 * over a small bounding box (~5 km) around the given coordinates.
 */
async function fetchCopernicusNDVI(lat: number, lng: number): Promise<{ current: number; baseline: number }> {
  const token = await getCopernicusToken();

  // Create a small bounding box (~0.05° ≈ 5.5 km)
  const delta = 0.05;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta];

  // Date ranges: last 10 days for current, same period last year for baseline
  const now = new Date();
  const currentFrom = new Date(now);
  currentFrom.setDate(now.getDate() - 10);
  const currentTo = now;

  const baselineFrom = new Date(currentFrom);
  baselineFrom.setFullYear(baselineFrom.getFullYear() - 1);
  const baselineTo = new Date(currentTo);
  baselineTo.setFullYear(baselineTo.getFullYear() - 1);

  const evalscript = `
    //VERSION=3
    function setup() {
      return { input: ["B04", "B08"], output: [{ id: "ndvi", bands: 1 }] };
    }
    function evaluatePixel(sample) {
      const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
      return [ndvi];
    }
  `;

  const makePayload = (from: Date, to: Date) => ({
    input: {
      bounds: { bbox, properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' } },
      data: [{
        type: 'sentinel-2-l2a',
        dataFilter: {
          timeRange: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
          maxCloudCoverage: 30,
        },
      }],
    },
    aggregation: {
      timeRange: { from: from.toISOString(), to: to.toISOString() },
      aggregationInterval: { of: 'P10D' },
      evalscript,
    },
    calculations: { default: { statistics: { default: { percentiles: { k: [50] } } } } },
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const [currentRes, baselineRes] = await Promise.all([
      fetch(COPERNICUS_STAT_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(makePayload(currentFrom, currentTo)),
        signal: controller.signal,
      }),
      fetch(COPERNICUS_STAT_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(makePayload(baselineFrom, baselineTo)),
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeout);

    if (!currentRes.ok || !baselineRes.ok) {
      throw new Error(`Copernicus stat API returned ${currentRes.status}/${baselineRes.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment — dynamic Copernicus response
    const currentData = await currentRes.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const baselineData = await baselineRes.json();

    // Extract mean NDVI from the response
    const currentNDVI = currentData?.data?.[0]?.outputs?.ndvi?.bands?.B0?.stats?.mean;
    const baselineNDVI = baselineData?.data?.[0]?.outputs?.ndvi?.bands?.B0?.stats?.mean;

    if (typeof currentNDVI !== 'number' || typeof baselineNDVI !== 'number') {
      throw new Error('Could not extract NDVI values from Copernicus response');
    }

    return { current: currentNDVI, baseline: baselineNDVI };
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Deterministic simulation fallback (when Copernicus is unavailable)
// ---------------------------------------------------------------------------

function getSimulatedNDVI(lat: number, lng: number, crop: string): NDVIInput {
  // Deterministic seed from coordinates — no Math.random
  const baseOffset = (crop.length % 5) * 0.04;
  const latSeed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233)) % 1;
  const baseline = 0.58 + baseOffset + latSeed * 0.05;

  const stressSeed = Math.abs(Math.cos(lat * 45.123 + lng * 23.456)) % 1;
  const stressDrop = 0.05 + stressSeed * 0.18;
  const current = Math.max(0, baseline - stressDrop);

  return {
    current: Number(current.toFixed(2)),
    baseline: Number(baseline.toFixed(2)),
    delta: Number((current - baseline).toFixed(2)),
  };
}

// ---------------------------------------------------------------------------
// Public API — tries Copernicus first, falls back to simulation
// ---------------------------------------------------------------------------

export async function getNDVI(lat: number, lng: number, crop: string): Promise<NDVIInput> {
  // 1. Check in-memory cache
  const cacheKey = `ndvi:${sanitizeKeySegment(lat.toFixed(2))}:${sanitizeKeySegment(lng.toFixed(2))}:${sanitizeKeySegment(crop)}`;
  const cached = cacheGet<NDVIInput>(cacheKey);
  if (cached) {
    logger.info(`NDVI cache HIT for ${cacheKey}`);
    return cached;
  }

  // 2. Try Copernicus Sentinel-2 if credentials are configured
  if (process.env.COPERNICUS_CLIENT_ID && process.env.COPERNICUS_CLIENT_SECRET) {
    try {
      logger.info(`Fetching NDVI from Copernicus for (${lat.toFixed(2)}, ${lng.toFixed(2)})…`);
      const { current, baseline } = await fetchCopernicusNDVI(lat, lng);

      const result: NDVIInput = {
        current: Number(current.toFixed(2)),
        baseline: Number(baseline.toFixed(2)),
        delta: Number((current - baseline).toFixed(2)),
      };

      cacheSet(cacheKey, result, NDVI_CACHE_TTL_MS);
      logger.info(`Copernicus NDVI: current=${result.current}, baseline=${result.baseline}, delta=${result.delta}`);
      return result;
    } catch (err) {
      // As per AGENTS.md: If NDVI API is unreachable → proceed with fallback + warning
      logger.warn('Copernicus NDVI fetch failed, using simulation:', err);
    }
  }

  // 3. Fallback: deterministic simulation
  try {
    const result = getSimulatedNDVI(lat, lng, crop);
    cacheSet(cacheKey, result, NDVI_CACHE_TTL_MS);
    logger.info(`Simulated NDVI: current=${result.current}, baseline=${result.baseline}, delta=${result.delta}`);
    return result;
  } catch (error) {
    logger.error('NDVI simulation also failed', error);
    // Last resort: return null values
    return { current: null, baseline: null, delta: null };
  }
}
