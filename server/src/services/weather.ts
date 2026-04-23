import { WeatherInput } from './scoring';
import { cacheGet, cacheSet, sanitizeKeySegment } from './cache';
import logger from '../utils/logger';

const OPEN_METEO_BASE_URL = process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';

/** Weather data cache TTL — 6 hours per ARCHITECTURE.md */
const WEATHER_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 21 600 000 ms

export async function getWeather(lat: number, lng: number): Promise<WeatherInput> {
  // 1. Check in-memory cache
  const cacheKey = `weather:${sanitizeKeySegment(lat.toFixed(2))}:${sanitizeKeySegment(lng.toFixed(2))}`;
  const cached = cacheGet<WeatherInput>(cacheKey);
  if (cached) {
    logger.info(`Weather cache HIT for ${cacheKey}`);
    return cached;
  }

  try {
    // Request wind speed along with temperature, humidity, and precipitation
    const url = `${OPEN_METEO_BASE_URL}/forecast`
      + `?latitude=${lat}&longitude=${lng}`
      + `&current=temperature_2m,relative_humidity_2m`
      + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max`
      + `&past_days=7&forecast_days=7`
      + `&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }

    const data = await response.json();

    const current = data.current;
    const daily = data.daily;

    if (!current || !daily || !daily.precipitation_sum) {
      throw new Error('Invalid data format received from Open-Meteo');
    }

    // Open-Meteo with past_days=7 & forecast_days=7 returns 15 entries:
    //   Index 0–6  = 7 days ago through yesterday
    //   Index 7    = today
    //   Index 8–13 = tomorrow through 6 days from now
    //
    // rainfall7d = sum of indices 0–7 (past 7 days inclusive of today)
    // precipToday = index 7 (today only)
    // forecastRain = sum of indices 8–13 (next 6 days, excluding today)

    const precipArray = daily.precipitation_sum as number[];

    let rainfall7d = 0;
    for (let i = 0; i <= 7 && i < precipArray.length; i++) {
      rainfall7d += (precipArray[i] || 0);
    }

    const precipToday = (precipArray.length > 7) ? (precipArray[7] || 0) : 0;

    let forecastRain = 0;
    for (let i = 8; i <= 13 && i < precipArray.length; i++) {
      forecastRain += (precipArray[i] || 0);
    }

    // Temperature — use current reading or today's daily value as fallback
    const tempMax = current.temperature_2m !== undefined && current.temperature_2m !== null
      ? current.temperature_2m
      : (daily.temperature_2m_max?.[7] ?? 30);

    const tempMin = daily.temperature_2m_min?.[7] ?? 20;

    // Humidity — fall back to 50% if unavailable
    const humidity = current.relative_humidity_2m !== undefined && current.relative_humidity_2m !== null
      ? current.relative_humidity_2m
      : 50;

    // Wind speed — today's max, or fall back to 10 km/h
    const windSpeedArray = daily.windspeed_10m_max as number[] | undefined;
    const windSpeedMax = windSpeedArray?.[7] ?? 10;

    const result: WeatherInput = {
      tempMax: Number(tempMax),
      tempMin: Number(tempMin),
      humidity: Number(humidity),
      rainfall7d: Number(rainfall7d.toFixed(2)),
      forecastRain: Number(forecastRain.toFixed(2)),
      precipToday: Number(precipToday.toFixed(2)),
      windSpeedMax: Number(windSpeedMax),
    };

    // 2. Store in cache
    cacheSet(cacheKey, result, WEATHER_CACHE_TTL_MS);

    return result;

  } catch (error) {
    logger.error('Weather service failed', error);
    throw new Error('Unable to fetch weather data. Open-Meteo might be unreachable.');
  }
}
