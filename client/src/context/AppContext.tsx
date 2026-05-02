import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { District, Crop, GrowthStage, Language, AppState, AnalyzeResponse, RecommendationItem, RecommendationSummary, MapTheme } from '../types';

// ============================================================
// Actions
// ============================================================

type AppAction =
  | { type: 'SET_DISTRICT'; payload: District }
  | { type: 'SET_CROP'; payload: Crop }
  | { type: 'SET_STAGE'; payload: GrowthStage }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_ANALYSIS_RESULT'; payload: AnalyzeResponse['data'] }
  | { type: 'SET_RECOMMENDATIONS'; payload: { items: RecommendationItem[]; summary: RecommendationSummary } }
  | { type: 'SET_MAP_THEME'; payload: MapTheme }
  | { type: 'RESET_FORM' };

// ============================================================
// Initial State
// ============================================================

const initialState: AppState = {
  district: null,
  crop: null,
  stage: null,
  language: 'en',
  analysisResult: null,
  recommendations: [],
  recommendationSummary: null,
  mapTheme: 'default',
};

// ============================================================
// Reducer
// ============================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DISTRICT':
      return { ...state, district: action.payload, language: action.payload.primaryLanguage as Language };
    case 'SET_CROP':
      return { ...state, crop: action.payload, stage: null };
    case 'SET_STAGE':
      return { ...state, stage: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_ANALYSIS_RESULT':
      return { ...state, analysisResult: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload.items, recommendationSummary: action.payload.summary };
    case 'SET_MAP_THEME':
      return { ...state, mapTheme: action.payload };
    case 'RESET_FORM':
      return { ...initialState, language: state.language };
    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================

interface AppContextValue {
  state: AppState;
  setDistrict: (d: District) => void;
  setCrop: (c: Crop) => void;
  setStage: (s: GrowthStage) => void;
  setLanguage: (l: Language) => void;
  setAnalysisResult: (r: AnalyzeResponse['data']) => void;
  setRecommendations: (items: RecommendationItem[], summary: RecommendationSummary) => void;
  setMapTheme: (t: MapTheme) => void;
  resetForm: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setDistrict = (d: District) => dispatch({ type: 'SET_DISTRICT', payload: d });
  const setCrop = (c: Crop) => dispatch({ type: 'SET_CROP', payload: c });
  const setStage = (s: GrowthStage) => dispatch({ type: 'SET_STAGE', payload: s });
  const setLanguage = (l: Language) => dispatch({ type: 'SET_LANGUAGE', payload: l });
  const setAnalysisResult = (r: AnalyzeResponse['data']) => dispatch({ type: 'SET_ANALYSIS_RESULT', payload: r });
  const setRecommendations = (items: RecommendationItem[], summary: RecommendationSummary) =>
    dispatch({ type: 'SET_RECOMMENDATIONS', payload: { items, summary } });
  const setMapTheme = (t: MapTheme) => dispatch({ type: 'SET_MAP_THEME', payload: t });
  const resetForm = () => dispatch({ type: 'RESET_FORM' });

  return (
    <AppContext.Provider value={{
      state, setDistrict, setCrop, setStage, setLanguage,
      setAnalysisResult, setRecommendations, setMapTheme, resetForm,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
