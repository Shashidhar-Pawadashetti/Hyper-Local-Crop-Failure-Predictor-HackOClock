import axios from 'axios';
import type { AnalyzeResponse, RecommendResponse, Language } from '../types';

// Use Vite's dev-server proxy for /api routes — avoids CORS entirely.
// In production, set VITE_API_BASE_URL to the actual backend URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// Request / Response logging
// ============================================================

client.interceptors.request.use((config) => {
  console.info(`[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

client.interceptors.response.use(
  (response) => {
    console.info(`[API] ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('[API] ⚠ Backend unreachable — will use offline data');
    } else {
      console.error(`[API] ✖ ${error.response?.status ?? 'NETWORK_ERROR'} ${error.config?.url}`, error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Analysis API — aligned with ARCHITECTURE.md POST /api/analyze
// ============================================================

export interface AnalyzeRequest {
  district: {
    id: string;
    name: string;
    state: string;
    lat: number;
    lon: number;
  };
  crop: {
    id: string;
    name: string;
  };
  stage: {
    id: string;
    name: string;
  };
}

export const analysisApi = {
  async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const { data } = await client.post<AnalyzeResponse>('/api/analyze', request);
    return data;
  },
};

// ============================================================
// Recommendations API — aligned with ARCHITECTURE.md POST /api/recommend
// ============================================================

export interface RecommendRequest {
  district: {
    id: string;
    name: string;
    state: string;
  };
  crop: {
    id: string;
    name: string;
  };
  stage: {
    id: string;
    name: string;
  };
  riskPayload: AnalyzeResponse['data'];
  language: Language;
}

export const recommendationsApi = {
  async recommend(request: RecommendRequest): Promise<RecommendResponse> {
    const { data } = await client.post<RecommendResponse>('/api/recommend', request);
    return data;
  },
};
