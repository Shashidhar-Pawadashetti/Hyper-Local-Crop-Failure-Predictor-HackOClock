import { useState, useCallback } from 'react';
import type { Language, RecommendResponse } from '../types';
import { recommendationsApi } from '../api/client';
import { getMockRecommendations } from '../data/staticData';

export interface RecommendRequest {
  district: string;
  crop: string;
  growthStage: string;
  riskPayload: {
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
    weather: {
      current: {
        temperature: { max: number; min: number };
        precipitation: { value: number };
        humidity: { value: number };
      };
      forecast: unknown[];
    };
    ndvi: { value: number; anomaly: number; status: string } | null;
    forecast7Day: unknown[];
  };
  language: Language;
}

export interface UseRecommendationsResult {
  data: RecommendResponse | null;
  loading: boolean;
  error: string | null;
  recommend: (request: RecommendRequest) => Promise<void>;
  reset: () => void;
}

export function useRecommendations(): UseRecommendationsResult {
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommend = useCallback(async (request: RecommendRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await recommendationsApi.recommend(request);
      if (response.success) {
        setData(response);
      } else {
        setError(response.error?.message || 'Recommendation failed');
        const fallback = getMockRecommendations(request.language);
        setData({
          success: true,
          timestamp: new Date().toISOString(),
          requestId: `fallback-${Date.now()}`,
          data: {
            recommendations: fallback,
            summary: {
              overallRisk: 'moderate',
              primaryConcern: 'Using offline recommendations',
              actionRequired: false,
            },
            generatedBy: 'fallback',
            aiGenerated: false,
          },
        });
      }
    } catch (err) {
      const fallback = getMockRecommendations(request.language);
      setData({
        success: true,
        timestamp: new Date().toISOString(),
        requestId: `fallback-${Date.now()}`,
        data: {
          recommendations: fallback,
          summary: {
            overallRisk: 'moderate',
            primaryConcern: 'Using offline recommendations',
            actionRequired: false,
          },
          generatedBy: 'fallback',
          aiGenerated: false,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, recommend, reset };
}