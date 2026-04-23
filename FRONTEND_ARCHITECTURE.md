# Frontend Component Architecture — FasalRakshak

**Version:** 1.0  
**Date:** April 23, 2026  
**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS

---

## 1. Component Tree

```
App
├── RootErrorBoundary
├── AppContext
├── Router (React Router)
│   ├── InputWizard (/)
│   │   ├── ProgressIndicator
│   │   ├── DistrictStep
│   │   │   ├── DistrictSearch
│   │   │   └── DistrictCard
│   │   ├── CropStep
│   │   │   ├── CropGrid
│   │   │   └── CropCard
│   │   ├── StageStep
│   │   │   ├── StageList
│   │   │   └── StageCard
│   │   └── NavigationButtons
│   │
│   ├── RiskDashboard (/results)
│   │   ├── ScoreGauge
│   │   ├── ChannelBars
│   │   │   ├── DroughtBar
│   │   │   ├── PestBar
│   │   │   └── NutrientBar
│   │   ├── ForecastChart (Recharts)
│   │   └── WeatherSummary
│   │
│   └── Recommendations (/recommendations)
│       ├── LanguageToggle
│       ├── VoiceReadout
│       ├── RecommendationCard (×3-5)
│       │   ├── UrgencyBadge
│       │   ├── ActionText
│       │   └── ReasonText
│       └── CostSummary
│
├── LoadingOverlay
└── Toast
```

---

## 2. Props Interfaces (TypeScript)

### 2.1 Domain Types

```typescript
// src/types/domain.ts

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
}

export interface RiskScores {
  droughtStress: number;
  pestPressure: number;
  nutrientDeficiency: number;
  composite: number;
}

export interface RiskLevel {
  drought: 'low' | 'moderate' | 'high' | 'critical';
  pest: 'low' | 'moderate' | 'high' | 'critical';
  nutrient: 'low' | 'moderate' | 'high' | 'critical';
  overall: 'healthy' | 'at-risk' | 'critical';
}

export interface WeatherData {
  current: {
    temperature: { max: number; min: number; unit: string };
    precipitation: { value: number; unit: string };
    humidity: { value: number; unit: string };
    windSpeed: { value: number; unit: string };
  };
  forecast: Array<{
    date: string;
    temperature: { max: number; min: number };
    precipitation: number;
  }>;
}

export interface NDVIData {
  value: number;
  anomaly: number;
  status: 'healthy' | 'stressed' | 'critical';
}

export interface ForecastDay {
  date: string;
  droughtRisk: number;
  pestRisk: number;
  nutrientRisk: number;
}
```

### 2.2 Recommendation Types

```typescript
// src/types/recommendations.ts

export type Language = 'en' | 'hi' | 'kn';
export type RecommendationType = 'irrigation' | 'fertilizer' | 'pesticide' | 'monitoring' | 'other';
export type Urgency = 'immediate' | 'within3days' | 'thisweek';

export interface RecommendationContent {
  type: RecommendationType;
  urgency: Urgency;
  action: string;
  reason: string;
  estimatedCostINR?: number;
}
```

### 2.3 Component Props

```typescript
// src/types/components.ts

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
}

interface ChannelBarsProps {
  channels: Array<{
    label: string;
    value: number;
    level: 'low' | 'moderate' | 'high' | 'critical';
  }>;
  animate?: boolean;
}

interface ForecastChartProps {
  data: ForecastDay[];
  height?: number;
}

interface LanguageToggleProps {
  value: Language;
  onChange: (lang: Language) => void;
  size?: 'sm' | 'md';
}

interface VoiceReadoutProps {
  text: string;
  language: Language;
  disabled?: boolean;
}

interface RecommendationCardProps {
  recommendation: RecommendationContent;
  language: Language;
  onSpeak?: (text: string) => void;
}

interface NavigationButtonsProps {
  backLabel?: string;
  nextLabel?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
}
```

---

## 3. State Management (React Hooks)

### 3.1 App Context

```typescript
// src/context/AppContext.tsx

import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { District, Crop, GrowthStage, Language } from '../types';

interface AppState {
  district: District | null;
  crop: Crop | null;
  stage: GrowthStage | null;
  language: Language;
  currentView: 'input' | 'dashboard' | 'recommendations';
}

type AppAction =
  | { type: 'SET_DISTRICT'; payload: District }
  | { type: 'SET_CROP'; payload: Crop }
  | { type: 'SET_STAGE'; payload: GrowthStage }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_VIEW'; payload: AppState['currentView'] }
  | { type: 'RESET_FORM' };

const initialState: AppState = {
  district: null,
  crop: null,
  stage: null,
  language: 'en',
  currentView: 'input',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DISTRICT':
      return { ...state, district: action.payload, language: action.payload.primaryLanguage as Language };
    case 'SET_CROP':
      return { ...state, crop: action.payload };
    case 'SET_STAGE':
      return { ...state, stage: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'RESET_FORM':
      return { ...initialState, language: state.language };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  setDistrict: (d: District) => void;
  setCrop: (c: Crop) => void;
  setStage: (s: GrowthStage) => void;
  setLanguage: (l: Language) => void;
  goToDashboard: () => void;
  goToRecommendations: () => void;
  goToInput: () => void;
  resetForm: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const setDistrict = (d: District) => dispatch({ type: 'SET_DISTRICT', payload: d });
  const setCrop = (c: Crop) => dispatch({ type: 'SET_CROP', payload: c });
  const setStage = (s: GrowthStage) => dispatch({ type: 'SET_STAGE', payload: s });
  const setLanguage = (l: Language) => dispatch({ type: 'SET_LANGUAGE', payload: l });
  const goToDashboard = () => dispatch({ type: 'SET_VIEW', payload: 'dashboard' });
  const goToRecommendations = () => dispatch({ type: 'SET_VIEW', payload: 'recommendations' });
  const goToInput = () => dispatch({ type: 'SET_VIEW', payload: 'input' });
  const resetForm = () => dispatch({ type: 'RESET_FORM' });
  
  return (
    <AppContext.Provider value={{
      state, setDistrict, setCrop, setStage, setLanguage,
      goToDashboard, goToRecommendations, goToInput, resetForm,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
```

### 3.2 Local useState Usage

- Form input values, toggle states, animation states, UI expand/collapse
- No Redux needed — AppContext handles all global state

---

## 4. API Call Hooks

### 4.1 useRiskAnalysis

```typescript
// src/hooks/useRiskAnalysis.ts

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '../api/client';
import type { District, Crop, GrowthStage, RiskScores, RiskLevel, WeatherData, NDVIData, ForecastDay } from '../types';

interface RiskAnalysisResult {
  weather: WeatherData | null;
  ndvi: NDVIData | null;
  riskScores: RiskScores | null;
  riskLevel: RiskLevel | null;
  forecast: ForecastDay[];
}

export function useRiskAnalysis(
  district: District | null, 
  crop: Crop | null, 
  stage: GrowthStage | null
) {
  const [result, setResult] = useState<RiskAnalysisResult>({
    weather: null,
    ndvi: null,
    riskScores: null,
    riskLevel: null,
    forecast: [],
  });
  
  const queryKey = district && crop && stage 
    ? ['riskAnalysis', district.id, crop.id, stage.id]
    : null;
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!district || !crop || !stage) throw new Error('Missing parameters');
      return analysisApi.analyze({
        district: { id: district.id, name: district.name, state: district.state, lat: district.lat, lon: district.lon },
        crop: { id: crop.id, name: crop.name.en },
        stage: { id: stage.id, name: stage.name.en },
      });
    },
    enabled: !!queryKey,
    staleTime: 6 * 60 * 60 * 1000,
    cacheTime: 24 * 60 * 60 * 1000,
  });
  
  useEffect(() => {
    if (query.data?.data) {
      const { weather, ndvi, riskScores, forecast7Day } = query.data.data;
      const riskLevel: RiskLevel = {
        drought: getRiskLevel(riskScores.droughtStress),
        pest: getRiskLevel(riskScores.pestPressure),
        nutrient: getRiskLevel(riskScores.nutrientDeficiency),
        overall: getOverallLevel(riskScores.composite),
      };
      setResult({ weather, ndvi, riskScores, riskLevel, forecast: forecast7Day });
    }
  }, [query.data]);
  
  return { ...result, isLoading: query.isLoading, isError: query.isError, error: query.error, refetch: query.refetch };
}

function getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (score < 25) return 'low';
  if (score < 50) return 'moderate';
  if (score < 75) return 'high';
  return 'critical';
}

function getOverallLevel(score: number): 'healthy' | 'at-risk' | 'critical' {
  if (score >= 70) return 'healthy';
  if (score >= 40) return 'at-risk';
  return 'critical';
}
```

### 4.2 useRecommendations

```typescript
// src/hooks/useRecommendations.ts

import { useQuery } from '@tanstack/react-query';
import { recommendationsApi } from '../api/client';
import type { Language, RecommendationOutput, RiskAnalysisResult } from '../types';
import type { District, Crop, GrowthStage } from '../types';

export function useRecommendations(
  analysis: RiskAnalysisResult,
  language: Language,
  district: District | null,
  crop: Crop | null,
  stage: GrowthStage | null
) {
  const queryKey = district && crop && stage && analysis.riskScores
    ? ['recommendations', district.id, crop.id, stage.id, language]
    : null;
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!district || !crop || !stage || !analysis.riskScores) throw new Error('Missing parameters');
      return recommendationsApi.recommend({
        district: { id: district.id, name: district.name, state: district.state },
        crop: { id: crop.id, name: crop.name.en },
        stage: { id: stage.id, name: stage.name.en },
        riskPayload: {
          weather: analysis.weather,
          ndvi: analysis.ndvi,
          riskScores: analysis.riskScores,
          forecast7Day: analysis.forecast,
        },
        language,
      }) as Promise<{ data: RecommendationOutput }>;
    },
    enabled: !!queryKey,
    staleTime: 12 * 60 * 60 * 1000,
    cacheTime: 24 * 60 * 60 * 1000,
  });
}
```

### 4.3 Preloading Hooks

```typescript
// src/hooks/usePreload.ts

import { useQuery } from '@tanstack/react-query';
import { cropsApi, districtsApi } from '../api/client';

export function useDistricts() {
  return useQuery({ queryKey: ['districts'], queryFn: () => districtsApi.getAll(), staleTime: 7 * 24 * 60 * 60 * 1000 });
}

export function useCrops() {
  return useQuery({ queryKey: ['crops'], queryFn: () => cropsApi.getAll(), staleTime: 30 * 24 * 60 * 60 * 1000 });
}

export function useCropStages(cropId: string) {
  return useQuery({ queryKey: ['cropStages', cropId], queryFn: () => cropsApi.getStages(cropId), staleTime: 30 * 24 * 60 * 60 * 1000, enabled: !!cropId });
}
```

---

## 5. Mobile Breakpoint Strategy (375px Primary)

### 5.1 Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Default | 320–639px | Single column, full-width |
| sm | 640px | Padding 16px |
| md | 768px | Two-column grids |

### 5.2 Touch Target Rules

```javascript
// tailwind.config.js - add custom min-height
theme: {
  minHeight: {
    'touch': '44px',
  },
}
```

### 5.3 Design Rules (375px)

- Minimum tap target: 44×44px
- Minimum font size: 16px body text
- Line height: 1.5
- Button padding: 12px vertical, 16px horizontal
- Card padding: 16px
- Card border radius: 12px
- Section spacing: 24px
- Use icons instead of text labels where possible

### 5.4 Responsive Pattern

```tsx
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
  {children}
</div>
```

---

## 6. PWA Configuration Checklist

### 6.1 Dependencies

```bash
npm install vite-plugin-pwa -D
```

### 6.2 vite.config.ts

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'FasalRakshak',
        short_name: 'FasalRakshak',
        theme_color: '#22c55e',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'weather-cache', expiration: { maxEntries: 50, maxAgeSeconds: 6 * 60 * 60 } },
          },
        ],
      },
    }),
  ],
});
```

### 6.3 Checklist

| Item | Status |
|------|--------|
| manifest.json | ☐ |
| Service Worker (auto-registration) | ☐ |
| Offline fallback page | ☐ |
| App icons (192, 512px) | ☐ |
| Theme color #22c55e | ☐ |
| Cache API responses (Workbox) | ☐ |
| Assets caching | ☐ |
| Offline status indicator | ☐ |

---

*Document Version: 1.0*  
*Last Updated: April 23, 2026*