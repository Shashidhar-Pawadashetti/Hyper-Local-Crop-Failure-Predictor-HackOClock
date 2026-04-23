import { useState, useCallback } from 'react';
import type { Language } from '../types';
import { analysisApi } from '../api/client';

export interface AnalysisRequest {
  district: string;
  state: string;
  crop: string;
  growthStage: string;
  language: Language;
}

export interface UseRiskAnalysisResult {
  data: import('../types').AnalyzeResponse | null;
  loading: boolean;
  error: string | null;
  analyze: (request: AnalysisRequest) => Promise<void>;
  reset: () => void;
}

export function useRiskAnalysis(): UseRiskAnalysisResult {
  const [data, setData] = useState<import('../types').AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (request: AnalysisRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await analysisApi.analyze(request);
      if (response.success) {
        setData(response as import('../types').AnalyzeResponse);
      } else {
        setError(response.error?.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, analyze, reset };
}