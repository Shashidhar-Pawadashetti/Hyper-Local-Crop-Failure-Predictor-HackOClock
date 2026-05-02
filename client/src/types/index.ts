// ============================================================
// Domain Types — aligned with ARCHITECTURE.md API contracts
// ============================================================

export interface District {
  id: string;
  name: string;
  state: string;
  stateCode: string;
  lat: number;
  lon: number;
  primaryLanguage: 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'mr';
}

export interface Crop {
  id: string;
  name: { en: string; hi: string; kn: string };
  category: 'cereal' | 'pulse' | 'oilseed' | 'cash' | 'vegetable' | 'fiber';
  icon: string;
}

export interface GrowthStage {
  id: string;
  name: { en: string; hi: string; kn: string };
  description: { en: string; hi: string; kn: string };
  icon: string;
  durationDays?: { min: number; max: number };
}

export interface WeatherCurrent {
  temperature: { max: number; min: number; unit: string };
  precipitation: { value: number; unit: string };
  humidity: { value: number; unit: string };
  windSpeed: { value: number; unit: string };
  evapotranspiration?: { value: number; unit: string };
}

export interface WeatherForecastDay {
  date: string;
  temperature: { max: number; min: number };
  precipitation: number;
  humidity?: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  forecast: WeatherForecastDay[];
  fetchedAt?: string;
  isFresh?: boolean;
}

export interface NDVIData {
  value: number;
  anomaly: number;
  status: 'healthy' | 'stressed' | 'critical';
  fetchedAt?: string;
  isFresh?: boolean;
}

export interface RiskChannel {
  score: number;
  level: 'low' | 'moderate' | 'high' | 'critical';
  factors?: string[];
}

export interface RiskScores {
  droughtStress: RiskChannel;
  pestPressure: RiskChannel;
  nutrientDeficiency: RiskChannel;
  composite: {
    score: number;
    level: 'healthy' | 'at-risk' | 'critical';
    trend?: 'improving' | 'stable' | 'declining';
  };
}

export interface ForecastDay {
  date: string;
  droughtRisk: number;
  pestRisk: number;
  nutrientRisk: number;
}

export interface AnalyzeResponse {
  success: boolean;
  timestamp: string;
  requestId: string;
  data: {
    weather: WeatherData;
    ndvi: NDVIData;
    riskScores: RiskScores;
    forecast7Day: ForecastDay[];
  };
  error?: { code: string; message: string };
}

// ============================================================
// Recommendation Types
// ============================================================

export type Language = 'en' | 'hi' | 'kn';
export type RecommendationType = 'irrigation' | 'fertilizer' | 'pest_control' | 'nutrient' | 'general';
export type Priority = 'high' | 'medium' | 'low';
export type MapTheme = 'default' | 'vegetation' | 'weather' | 'heat';

export interface RecommendationItem {
  id: string;
  type: RecommendationType;
  priority: Priority;
  title: { en: string; hi: string; kn: string };
  description: { en: string; hi: string; kn: string };
  quantity?: string;
  timing?: string;
  estimatedCost?: number;
  estimatedCostUnit?: string;
  voiceText?: string;
}

export interface RecommendationSummary {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  primaryConcern: string;
  actionRequired: boolean;
}

export interface RecommendResponse {
  success: boolean;
  timestamp: string;
  requestId: string;
  data: {
    recommendations: RecommendationItem[];
    summary: RecommendationSummary;
    generatedBy?: string;
    aiGenerated?: boolean;
  };
  error?: { code: string; message: string };
}

// ============================================================
// App State Types
// ============================================================

export interface AppState {
  district: District | null;
  crop: Crop | null;
  stage: GrowthStage | null;
  language: Language;
  analysisResult: AnalyzeResponse['data'] | null;
  recommendations: RecommendationItem[];
  recommendationSummary: RecommendationSummary | null;
  mapTheme: MapTheme;
}

// ============================================================
// Component Props Types
// ============================================================

export interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
  level?: 'healthy' | 'at-risk' | 'critical';
}

export interface ChannelBarProps {
  label: string;
  value: number;
  level: 'low' | 'moderate' | 'high' | 'critical';
  icon?: string;
  animate?: boolean;
}

export interface ForecastChartProps {
  data: ForecastDay[];
  height?: number;
}

export interface LanguageToggleProps {
  value: Language;
  onChange: (lang: Language) => void;
  size?: 'sm' | 'md';
}

export interface VoiceReadoutProps {
  text: string;
  language: Language;
  disabled?: boolean;
}

export interface RecommendationCardProps {
  recommendation: RecommendationItem;
  language: Language;
}
