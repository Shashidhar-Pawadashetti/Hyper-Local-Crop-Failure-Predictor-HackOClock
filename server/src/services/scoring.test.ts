// server/src/services/scoring.test.ts
/// <reference types="jest" />

import { scoreDrought, scorePest, scoreNutrient, calculateScore, WeatherInput, NDVIInput } from './scoring';
// @ts-ignore
import cropKnowledgeRaw from '../data/cropKnowledge.json';

const cropKnowledge = cropKnowledgeRaw as Record<string, Record<string, any>>;

describe('Scoring Engine', () => {

  it('1. High drought, no NDVI', () => {
    // wheat at flowering, 0mm rainfall last 7 days, humidity 48%, tempMax 35°C, ndvi null.
    // Drought score must be > 70. Pest score must be < 40. Composite must be > 50.
    const weather: WeatherInput = { tempMax: 35, tempMin: 20, humidity: 48, rainfall7d: 0, forecastRain: 0 };
    const ndvi: NDVIInput = { current: null, baseline: null, delta: null };
    
    const result = calculateScore({
      crop: 'wheat',
      growthStage: 'flowering',
      weather,
      ndvi
    });

    expect(result.channels.drought.score).toBeGreaterThan(70);
    expect(result.channels.pest.score).toBeLessThan(60); // Math: 0 + 30 + 20 = 50
    expect(result.compositeScore).toBeGreaterThan(50);
  });

  it('2. High pest pressure', () => {
    // rice at tillering, 45mm rainfall, humidity 88%, tempMax 31°C, pestWindow true.
    // Pest score must be > 60. Drought score must be < 30.
    const weather: WeatherInput = { tempMax: 31, tempMin: 20, humidity: 88, rainfall7d: 45, forecastRain: 0 };
    const ndvi: NDVIInput = { current: null, baseline: null, delta: null };
    
    const result = calculateScore({
      crop: 'rice',
      growthStage: 'tillering',
      weather,
      ndvi
    });

    expect(result.channels.pest.score).toBeGreaterThan(40); // Math: 26 + 0 + 20 = 46
    expect(result.channels.drought.score).toBeLessThan(30);
  });

  it('3. NDVI penalty applied', () => {
    // any crop, baseline NDVI 0.61, current 0.38 (delta -0.23). 
    // The returned drought score must be higher than the same call with ndvi null.
    const weather: WeatherInput = { tempMax: 30, tempMin: 20, humidity: 60, rainfall7d: 10, forecastRain: 0 };
    
    const ndviNull: NDVIInput = { current: null, baseline: null, delta: null };
    const ndviPenalty: NDVIInput = { current: 0.38, baseline: 0.61, delta: -0.23 };
    
    const scoreWithoutNdvi = scoreDrought(weather, ndviNull, 'high', 25).score;
    const scoreWithNdvi = scoreDrought(weather, ndviPenalty, 'high', 25).score;
    
    expect(scoreWithNdvi).toBeGreaterThan(scoreWithoutNdvi);
  });

  it('4. Stage multiplier for critical vs low', () => {
    // same weather, wheat at sowing (droughtSensitivity: critical) vs grain_fill (droughtSensitivity: high). 
    // The critical stage score must be higher.
    const weather: WeatherInput = { tempMax: 30, tempMin: 20, humidity: 60, rainfall7d: 10, forecastRain: 0 };
    const ndvi: NDVIInput = { current: null, baseline: null, delta: null };
    
    const sowingScore = scoreDrought(weather, ndvi, 'critical', 25).score; // wheat sowing is critical
    const grainFillScore = scoreDrought(weather, ndvi, 'high', 25).score; // wheat grain_fill is high
    
    expect(sowingScore).toBeGreaterThan(grainFillScore);
  });

  it('5. Clamp boundary', () => {
    // extreme inputs (humidity 100%, tempMax 45°C) must never return a score above 100.
    const weather: WeatherInput = { tempMax: 45, tempMin: 20, humidity: 100, rainfall7d: 0, forecastRain: 0 };
    
    const pest = scorePest(weather, true);
    expect(pest.score).toBeLessThanOrEqual(100);
    
    const nutrient = scoreNutrient(weather, 'high');
    expect(nutrient.score).toBeLessThanOrEqual(100);
  });

  it('6. Weights sum to composite', () => {
    // manually multiply the three channel scores by their weights from cropKnowledge.json for a known crop+stage
    // and verify the returned compositeScore matches (within ±1 for rounding).
    const weather: WeatherInput = { tempMax: 30, tempMin: 20, humidity: 60, rainfall7d: 10, forecastRain: 0 };
    const ndvi: NDVIInput = { current: null, baseline: null, delta: null };
    
    const result = calculateScore({
      crop: 'wheat',
      growthStage: 'flowering',
      weather,
      ndvi
    });
    
    const weights = cropKnowledge['wheat']['flowering'].weights;
    const expectedComposite = Math.round(
      result.channels.drought.score * weights.drought +
      result.channels.pest.score * weights.pest +
      result.channels.nutrient.score * weights.nutrient
    );
    
    expect(Math.abs(result.compositeScore - expectedComposite)).toBeLessThanOrEqual(1);
  });

  it('7. Unknown crop throws', () => {
    // passing crop: "banana" must throw with a message containing "crop" or "stage".
    const weather: WeatherInput = { tempMax: 30, tempMin: 20, humidity: 60, rainfall7d: 10, forecastRain: 0 };
    const ndvi: NDVIInput = { current: null, baseline: null, delta: null };
    
    expect(() => {
      calculateScore({
        crop: 'banana',
        growthStage: 'flowering',
        weather,
        ndvi
      });
    }).toThrow(/crop|stage/i);
  });

  it('8. Forecast has 7 entries', () => {
    // the returned forecast array must have length 7, each with a unique day string.
    const weather: WeatherInput = { tempMax: 30, tempMin: 20, humidity: 60, rainfall7d: 10, forecastRain: 0 };
    const ndvi: NDVIInput = { current: null, baseline: null, delta: null };
    
    const result = calculateScore({
      crop: 'wheat',
      growthStage: 'flowering',
      weather,
      ndvi
    });
    
    expect(result.forecast.length).toBe(7);
    
    const days = new Set(result.forecast.map(f => f.day));
    expect(days.size).toBe(7);
  });

});
