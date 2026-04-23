// server/src/services/scoring.ts

// @ts-ignore
import cropKnowledgeRaw from "../data/cropKnowledge.json"

export interface ChannelScore {
  score: number         // 0–100, clamped
  level: "low" | "medium" | "high" | "critical"
  driver: string        // human-readable explanation for UI
}

export interface WeatherInput {
  tempMax: number
  tempMin: number
  humidity: number      // percentage
  rainfall7d: number    // mm
  forecastRain: number  // mm, next 7 days
}

export interface NDVIInput {
  current: number | null
  baseline: number | null
  delta: number | null
}

export interface ScoringInput {
  crop: string
  growthStage: string
  weather: WeatherInput
  ndvi: NDVIInput
}

export interface ForecastDay {
  day: string           // ISO date string
  score: number
  rainfall: number
  tempMax: number
}

export interface ScoringResult {
  compositeScore: number
  channels: {
    drought: ChannelScore
    pest: ChannelScore
    nutrient: ChannelScore
  }
  forecast: ForecastDay[]
}

const cropKnowledge = cropKnowledgeRaw as Record<string, Record<string, any>>;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreToLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score <= 33) return "low";
  if (score <= 55) return "medium";
  if (score <= 74) return "high";
  return "critical";
}

export function scoreDrought(weather: WeatherInput, ndvi: NDVIInput, droughtSensitivity: string, expectedRainfall: number): ChannelScore {
  const base = (1 - weather.rainfall7d / expectedRainfall) * 100;
  
  let ndviPenalty = 0;
  if (ndvi.current !== null && ndvi.baseline !== null && ndvi.baseline > 0) {
    ndviPenalty = Math.max(0, (ndvi.baseline - ndvi.current) / ndvi.baseline) * 30;
  }
  
  const multiplierMap: Record<string, number> = { low: 0.6, medium: 0.8, high: 1.0, critical: 1.2 };
  const stageMultiplier = multiplierMap[droughtSensitivity] || 1.0;
  
  const score = clamp(base + ndviPenalty, 0, 100) * stageMultiplier;
  const finalScore = clamp(score, 0, 100);
  
  let driver = "optimal rainfall";
  if (weather.rainfall7d < expectedRainfall * 0.5) {
    driver = "severe rainfall deficit";
  } else if (weather.rainfall7d < expectedRainfall) {
    driver = "moderate rainfall deficit";
  }
  if (ndviPenalty > 10) driver += " with poor crop health (NDVI)";

  return {
    score: finalScore,
    level: scoreToLevel(finalScore),
    driver
  };
}

export function scorePest(weather: WeatherInput, pestWindow: boolean): ChannelScore {
  const humidityRisk = weather.humidity > 75 ? (weather.humidity - 75) * 2 : 0;
  const tempRisk = (weather.tempMax > 32 && weather.tempMax < 38) ? 30 : 0;
  const stagePestWindow = pestWindow ? 20 : 0;
  
  const score = clamp(humidityRisk + tempRisk + stagePestWindow, 0, 100);
  
  let driver = "conditions safe from pests";
  if (score > 60) driver = "high humidity and active pest window";
  else if (humidityRisk > 0) driver = "elevated humidity increasing risk";
  else if (stagePestWindow > 0) driver = "crop at vulnerable stage";
  
  return {
    score,
    level: scoreToLevel(score),
    driver
  };
}

export function scoreNutrient(weather: WeatherInput, nutrientDemandN: string): ChannelScore {
  const demandBaseMap: Record<string, number> = { low: 20, medium: 50, high: 75 };
  const demandBase = demandBaseMap[nutrientDemandN] || 50;
  const leachingRisk = weather.rainfall7d > 50 ? 25 : 0;
  
  const score = clamp(demandBase + leachingRisk, 0, 100);
  
  let driver = `${nutrientDemandN} nitrogen demand`;
  if (leachingRisk > 0) driver += " with nutrient leaching risk";
  
  return {
    score,
    level: scoreToLevel(score),
    driver
  };
}

export function calculateScore(input: ScoringInput): ScoringResult {
  const cropData = cropKnowledge[input.crop];
  if (!cropData) throw new Error(`Unknown crop: ${input.crop}`);
  
  const stageData = cropData[input.growthStage];
  if (!stageData) throw new Error(`Unknown growthStage: ${input.growthStage} for crop: ${input.crop}`);
  
  const expectedRainfall = 25; // An assumed expected rainfall per week, as it's missing from the crop knowledge JSON schema in step 2.
  
  const drought = scoreDrought(input.weather, input.ndvi, stageData.droughtSensitivity, expectedRainfall);
  const pest = scorePest(input.weather, stageData.pestWindow);
  const nutrient = scoreNutrient(input.weather, stageData.nutrientDemand.N);
  
  const weights = stageData.weights;
  const compositeScore = Math.round(
    drought.score * weights.drought +
    pest.score * weights.pest +
    nutrient.score * weights.nutrient
  );
  
  const forecast: ForecastDay[] = [];
  const today = new Date();
  
  for (let n = 0; n < 7; n++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + n);
    const dayStr = forecastDate.toISOString().split("T")[0];
    
    const incrementalRain = n === 0 ? 0 : input.weather.forecastRain / 7;
    const simulatedRainfall7d = input.weather.rainfall7d + (input.weather.forecastRain / 7) * n;
    
    const simWeather = { ...input.weather, rainfall7d: simulatedRainfall7d };
    const simDrought = scoreDrought(simWeather, input.ndvi, stageData.droughtSensitivity, expectedRainfall);
    
    const simCompositeScore = Math.round(
      simDrought.score * weights.drought +
      pest.score * weights.pest +
      nutrient.score * weights.nutrient
    );
    
    forecast.push({
      day: dayStr,
      score: simCompositeScore,
      rainfall: incrementalRain,
      tempMax: input.weather.tempMax
    });
  }
  
  return {
    compositeScore,
    channels: { drought, pest, nutrient },
    forecast
  };
}

export function toApiChannels(result: ScoringResult) {
  return {
    channels: {
      drought: {
        score: Math.round(result.channels.drought.score),
        level: result.channels.drought.level,
        driver: result.channels.drought.driver
      },
      pest: {
        score: Math.round(result.channels.pest.score),
        level: result.channels.pest.level,
        driver: result.channels.pest.driver
      },
      nutrient: {
        score: Math.round(result.channels.nutrient.score),
        level: result.channels.nutrient.level,
        driver: result.channels.nutrient.driver
      }
    }
  };
}
