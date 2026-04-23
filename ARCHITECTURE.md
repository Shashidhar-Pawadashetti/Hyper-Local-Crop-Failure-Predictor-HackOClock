# System Architecture Document — FasalRakshak

**Version:** 1.0  
**Date:** April 23, 2026  
**Status:** Production Draft  
**Tech Stack:** Node.js + Express + Prisma + MongoDB | React 18 + TypeScript + Vite + Tailwind

---

## 1. High-Level Architecture

### 1.1 System Architecture Diagram (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENT LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                      React Application (Vite)                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐    │  │
│  │  │  Input       │  │    Risk       │  │    Recommendations             │    │  │
│  │  │  Wizard     │  │   Dashboard  │  │    Panel + Voice Output     │    │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┬───────────┘    │  │
│  │         │                 │                   │                       │  │
│  │         └─────────────────┴───────────────────┘                       │  │
│  │                             │                                         │  │
│  │                    ┌──────▼──────┐                                  │  │
│  │                    │   API Client │                                  │  │
│  │                    │  (Axios +   │                                  │  │
│  │                    │  React Query)│                                  │  │
│  │                    └──────┬──────┘                                  │  │
│  └─────────────────────────────┼────────────────────────────────────────┘  │
│                                │                                                │
└────────────────────────────────┼────────────────────────────────────────────────┘
                                 │ HTTPS (TLS 1.2+)
                                 │ JSON
                                 ▼
┌────────────────────────────────┼────────────────────────────────────────────────┐
│                                │          SERVER LAYER                          │
│                    ┌───────────▼────────────┐                                   │
│                    │    Express Router      │                                   │
│                    │    (Rate Limiting,     │                                   │
│                    │     Validation,       │                                   │
│                    │     Error Handling)   │                                   │
│                    └───────────┬────────────┘                                   │
│                                │                                                │
│           ┌────────────────────┼────────────────────┐                          │
│           │                    │                    │                          │
│  ┌────────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐                   │
│  │   /api/analyze   │  │  /api/      │  │   /api/        │                   │
│  │   Controller    │  │  recommend  │  │   crops        │                   │
│  │                 │  │  Controller │  │   Controller   │                   │
│  │  - fetchWeather │  │             │  │                 │                   │
│  │  - fetchNDVI    │  │  - call     │  │  - getDistricts│                   │
│  │  - calculate   │  │    Claude   │  │  - getCrops     │                   │
│  │    riskScores  │  │  - translate│  │  - getStages   │                   │
│  └────────┬───────┘  └──────┬───────┘  └─────┬────────┘                   │
│           │                 │                │                              │
│           └─────────────────┼────────────────┘                              │
│                             │                                                │
│                    ┌────────▼────────┐                                     │
│                    │  Service Layer   │                                     │
│                    │  - WeatherService│                                     │
│                    │  - NDVIService   │                                     │
│                    │  - RiskEngine    │                                     │
│                    │  - CacheService  │                                     │
│                    └────────┬─────────┘                                     │
└─────────────────────────────┼────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼─────────┐  ┌───────▼─────────┐  ┌───────▼─────────┐
│   Open-Meteo    │  │  Sentinel-2    │  │  Anthropic      │
│   API           │  │  /Copernicus  │  │  Claude API     │
│  (Weather)      │  │  (NDVI)       │  │  (AI Gen)       │
└────────────────┘  └────────────────┘  └────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
���                              DATA LAYER                                       │
│  ┌─────────────────────┐   ┌─────────────────────┐                       │
│  │   MongoDB           │   │   Redis Cache        │                       │
│  │   (Prisma ORM)     │   │   (Weather + NDVI)  │                       │
│  │                    │   │                     │                       │
│  │  - Districts       │   │  - weather:*       │                       │
│  │  - Crops           │   │  - ndvi:*           │                       │
│  │  - RiskHistory    │   │  - recommendations:*  │                       │
│  │  - UserSessions   │   │  - sessions:*       │                       │
│  └─────────────────────┘   └─────────────────────┘                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. API Endpoint Specifications

### 2.1 Base URL

```
Development: http://localhost:3000/api
Production:  https://api.fasalrakshak.in/api
```

### 2.2 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|-----------|--------------|---------------|
| POST | `/analyze` | Run full risk analysis | No |
| POST | `/recommend` | Generate recommendations | No |
| GET | `/crops` | Get supported crops | No |
| GET | `/crops/:id/stages` | Get growth stages for crop | No |
| GET | `/districts` | Get all districts | No |
| GET | `/districts/:id` | Get district by ID | No |
| GET | `/health` | Health check | No |

---

### 2.3 POST /api/analyze

**Description:** Accepts farmer input and returns weather data, NDVI data, and calculated risk scores.

#### Request Schema

```typescript
interface AnalyzeRequest {
  district: {
    id: string;        // e.g., "KA_09" (Dharwad)
    name: string;     // e.g., "Dharwad"
    state: string;   // e.g., "Karnataka"
    lat: number;     // e.g., 15.4589
    lon: number;     // e.g., 75.1234
  };
  crop: {
    id: string;       // e.g., "ragi"
    name: string;    // e.g., "Ragi"
  };
  stage: {
    id: string;       // e.g., "vegetative"
    name: string;    // e.g., "Vegetative Growth"
  };
}
```

#### Example Request

```json
{
  "district": {
    "id": "KA_09",
    "name": "Dharwad",
    "state": "Karnataka",
    "lat": 15.4589,
    "lon": 75.1234
  },
  "crop": {
    "id": "ragi",
    "name": "Ragi"
  },
  "stage": {
    "id": "vegetative",
    "name": "Vegetative Growth"
  }
}
```

#### Response Schema

```typescript
interface AnalyzeResponse {
  success: boolean;
  timestamp: string;           // ISO 8601
  requestId: string;         // UUID
  data: {
    weather: {
      current: {
        temperature: { max: number; min: number; unit: "°C" };
        precipitation: { value: number; unit: "mm" };
        humidity: { value: number; unit: "%" };
        windSpeed: { value: number; unit: "km/h" };
        evapotranspiration: { value: number; unit: "mm/day" };
      };
      forecast: Array<{
        date: string;
        temperature: { max: number; min: number };
        precipitation: number;
        humidity: number;
      }>;
      fetchedAt: string;
      isFresh: boolean;
    };
    ndvi: {
      value: number;          // 0-1 scale
      anomaly: number;       // deviation from baseline
      status: "healthy" | "stressed" | "critical";
      fetchedAt: string;
      isFresh: boolean;
    };
    riskScores: {
      droughtStress: {
        score: number;       // 0-100
        level: "low" | "moderate" | "high" | "critical";
        factors: string[];
      };
      pestPressure: {
        score: number;
        level: "low" | "moderate" | "high" | "critical";
        factors: string[];
      };
      nutrientDeficiency: {
        score: number;
        level: "low" | "moderate" | "high" | "critical";
        factors: string[];
      };
      composite: {
        score: number;      // 0-100
        level: "healthy" | "at-risk" | "critical";
        trend: "improving" | "stable" | "declining";
      };
    };
    forecast7Day: Array<{
      date: string;
      droughtRisk: number;
      pestRisk: number;
      nutrientRisk: number;
    }>;
  };
  error?: { code: string; message: string };
}
```

#### Example Response

```json
{
  "success": true,
  "timestamp": "2026-04-23T10:30:00.000Z",
  "requestId": "req_abc123def456",
  "data": {
    "weather": {
      "current": {
        "temperature": { "max": 32, "min": 24, "unit": "°C" },
        "precipitation": { "value": 0, "unit": "mm" },
        "humidity": { "value": 45, "unit": "%" },
        "windSpeed": { "value": 12, "unit": "km/h" },
        "evapotranspiration": { "value": 5.2, "unit": "mm/day" }
      },
      "forecast": [
        { "date": "2026-04-24", "temperature": { "max": 33, "min": 25 }, "precipitation": 0, "humidity": 42 },
        { "date": "2026-04-25", "temperature": { "max": 34, "min": 26 }, "precipitation": 0, "humidity": 38 }
      ],
      "fetchedAt": "2026-04-23T10:25:00.000Z",
      "isFresh": true
    },
    "ndvi": {
      "value": 0.58,
      "anomaly": -0.12,
      "status": "stressed",
      "fetchedAt": "2026-04-20T00:00:00.000Z",
      "isFresh": false
    },
    "riskScores": {
      "droughtStress": {
        "score": 72,
        "level": "high",
        "factors": ["precipitation_deficit_14d", "high_et0", "ndvi_decline"]
      },
      "pestPressure": {
        "score": 35,
        "level": "low",
        "factors": ["low_humidity", "temp_outside_pest_range"]
      },
      "nutrientDeficiency": {
        "score": 58,
        "level": "moderate",
        "factors": ["ndvi_below_threshold", "rain_leaching"]
      },
      "composite": {
        "score": 52,
        "level": "at-risk",
        "trend": "stable"
      }
    },
    "forecast7Day": [
      { "date": "2026-04-24", "droughtRisk": 75, "pestRisk": 30, "nutrientRisk": 60 },
      { "date": "2026-04-25", "droughtRisk": 78, "pestRisk": 25, "nutrientRisk": 65 },
      { "date": "2026-04-26", "droughtRisk": 70, "pestRisk": 20, "nutrientRisk": 55 }
    ]
  }
}
```

#### HTTP Status Codes

| Status | Condition |
|--------|-----------|
| 200 | Success |
| 400 | Invalid request body |
| 422 | Unprocessable entity (e.g., invalid district/crop/stage) |
| 500 | Server error |
| 503 | External API unavailable |

---

### 2.4 POST /api/recommend

**Description:** Generates multilingual, quantity-aware intervention recommendations using Claude API.

#### Request Schema

```typescript
interface RecommendRequest {
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
  riskPayload: {
    weather: AnalyzeResponse["data"]["weather"];
    ndvi: AnalyzeResponse["data"]["ndvi"];
    riskScores: AnalyzeResponse["data"]["riskScores"];
    forecast7Day: AnalyzeResponse["data"]["forecast7Day"];
  };
  language: "en" | "hi" | "kn";  // en: English, hi: Hindi, kn: Kannada
}
```

#### Example Request

```json
{
  "district": {
    "id": "KA_09",
    "name": "Dharwad",
    "state": "Karnataka"
  },
  "crop": {
    "id": "ragi",
    "name": "Ragi"
  },
  "stage": {
    "id": "vegetative",
    "name": "Vegetative Growth"
  },
  "riskPayload": {
    "weather": { /* ... same as analyze response weather ... */ },
    "ndvi": { /* ... same as analyze response ndvi ... */ },
    "riskScores": { /* ... same as analyze response riskScores ... */ },
    "forecast7Day": [ /* ... */ ]
  },
  "language": "kn"
}
```

#### Response Schema

```typescript
interface RecommendResponse {
  success: boolean;
  timestamp: string;
  requestId: string;
  data: {
    recommendations: Array<{
      id: string;
      type: "irrigation" | "fertilizer" | "pest_control" | "nutrient" | "general";
      priority: "high" | "medium" | "low";
      title: {
        en: string;
        hi: string;
        kn: string;
      };
      description: {
        en: string;
        hi: string;
        kn: string;
      };
      quantity: string;        // e.g., "2 liters/sq meter", "15 kg/acre"
      timing: string;         // e.g., "today", "within 48 hours", "after next rain"
      estimatedCost: number; // in INR
      estimatedCostUnit: string;
      voiceText: string;    // Simplified for TTS in Kannada
    }>;
    summary: {
      overallRisk: "low" | "moderate" | "high" | "critical";
      primaryConcern: string;
      actionRequired: boolean;
    };
    generatedBy: string;    // "Claude-3-Opus-20240229"
  };
  error?: { code: string; message: string };
}
```

#### Example Response

```json
{
  "success": true,
  "timestamp": "2026-04-23T10:30:15.000Z",
  "requestId": "req_abc123def456",
  "data": {
    "recommendations": [
      {
        "id": "rec_001",
        "type": "irrigation",
        "priority": "high",
        "title": {
          "en": "Immediate irrigation required",
          "hi": "तुरंत सिंचाई की आवश्यकता है",
          "kn": "ತಕ್ಷಣದ ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ"
        },
        "description": {
          "en": "Apply 2 liters of water per square meter today and tomorrow morning. Current soil moisture is critically low with no precipitation forecast for the next 7 days.",
          "hi": "आज और कल सुबह प्रति वर्ग मीटर 2 लीटर पानी लगाएं। वर्तमान में मिट्टी की नमी बहुत कम है और अगले 7 दिनों तक बारिश का अनुमान नहीं है।",
          "kn": "ಇಂದು ಮತ್ತು ನಾಳೆ ಬೆಳಗ್ಗೆ ಪ್ರತಿ ಚದರ ಮೀಟರ್‌ಗೆ 2 ಲೀಟರ್ ನೀರು ಹಾಕಿ. ಮಣ್ಣಿನ ತೇವಾಂಶವು ತುಂಬಾ ಕಡಿಮೆ ಇದೆ ಮತ್ತು 7 ದಿನಗಳಲ್ಲಿ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿಲ್ಲ."
        },
        "quantity": "2 liters/sq meter",
        "timing": "today and tomorrow morning",
        "estimatedCost": 0,
        "estimatedCostUnit": "labor only",
        "voiceText": "ಇಂದು ಮತ್ತು ನಾಳೆ ಬೆಳಗ್ಗೆ 2 ಲೀಟರ್ ನೀರು ಹಾಕಿ."
      },
      {
        "id": "rec_002",
        "type": "fertilizer",
        "priority": "high",
        "title": {
          "en": "Apply urea top-dressing",
          "hi": "यूरिया टॉप ड्रेसिंग करें",
          "kn": "ಯೂರಿಯಾ ಸಾರವರ್ಧನ ಮಾಡಿ"
        },
        "description": {
          "en": "Apply urea 15 kg/acre 5 days after next rainfall event. This will supply nitrogen during the vegetative growth stage when the crop needs it most.",
          "hi": "अगली बारिश के 5 दिन बाद प्रति एकड़ 15 किलो यूरिया टॉप ड्रेसिंग करें।",
          "kn": "ಮುಂದಿನ ಮಳೆಯ 5 ದಿನಗಳ ನಂತರ 15 ಕೆಜಿ/ಎಕರೆ ಯೂರಿಯಾ ಹಾಕಿ."
        },
        "quantity": "15 kg/acre",
        "timing": "5 days after next rain",
        "estimatedCost": 360,
        "estimatedCostUnit": "INR/acre",
        "voiceText": "ಮುಂದಿನ ಮಳೆಯ 5 ದಿನಗಳ ನಂತರ 15 ಕೆಜಿ ಯೂರಿಯಾ ಹಾಕಿ. ಬೆಲೆ 360 ರುಪಾಯಿ."
      },
      {
        "id": "rec_003",
        "type": "pest_control",
        "priority": "medium",
        "title": {
          "en": "Preventive pest control with neem",
          "hi": "नीम से कीट नियंत्रण",
          "kn": "ತೇಗೆ ಸಸಿ ನಿಯಂತ್ರಣ"
        },
        "description": {
          "en": "Apply neem cake 250 kg/acre as a preventive measure. Current conditions are not yet favorable for pest outbreak, but monitor weekly.",
          "hi": "निवारक उपाय के लिए प्रति एकड़ 250 किलो नीम की खाद लगाएं।",
          "kn": "250 ಕೆಜಿ/ಎಕರೆ ತೇಗೆ ಹಿಂಡೆ ಹಾಕಿ."
        },
        "quantity": "250 kg/acre",
        "timing": "within 7 days",
        "estimatedCost": 500,
        "estimatedCostUnit": "INR/acre",
        "voiceText": "7 ದಿನಗಳ ಒಳಗಾಗಿ 250 ಕೆಜಿ ತೇಗೆ ಹಿಂಡೆ ಹಾಕಿ."
      }
    ],
    "summary": {
      "overallRisk": "high",
      "primaryConcern": "Drought stress is critically high. Immediate irrigation required.",
      "actionRequired": true
    },
    "generatedBy": "Claude-3-Opus-20240229"
  }
}
```

#### HTTP Status Codes

| Status | Condition |
|--------|-----------|
| 200 | Success |
| 400 | Invalid request |
| 422 | Risk payload missing or invalid |
| 500 | Server error |
| 503 | Claude API unavailable |

---

### 2.5 GET /api/crops

**Description:** Returns list of supported crops.

#### Response Schema

```typescript
interface CropsResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: {
      en: string;
      hi: string;
      kn: string;
    };
    category: "cereal" | "pulse" | "oilseed" | "cash" | "vegetable";
    icon: string;  // emoji or icon name
  }>;
}
```

---

### 2.6 GET /api/crops/:id/stages

**Description:** Returns growth stages for a specific crop.

#### Response Schema

```typescript
interface StagesResponse {
  success: boolean;
  cropId: string;
  data: Array<{
    id: string;
    name: {
      en: string;
      hi: string;
      kn: string;
    };
    description: {
      en: string;
      hi: string;
      kn: string;
    };
    icon: string;
    durationDays: { min: number; max: number };
  }>;
}
```

---

### 2.7 GET /api/districts

**Description:** Returns list of Indian districts.

#### Response Schema

```typescript
interface DistrictsResponse {
  success: boolean;
  data: Array<{
    id: string;        // "KA_09"
    name: string;      // "Dharwad"
    state: string;     // "Karnataka"
    stateCode: string; // "KA"
    lat: number;
    lon: number;
    primaryLanguage: "en" | "hi" | "kn" | "te" | "ta" | "mr" | "bn" | "ml";
  }>;
}
```

---

### 2.8 GET /api/health

**Description:** Health check for all system components.

#### Response Schema

```typescript
interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: { status: "up" | "down"; latencyMs: number };
    cache: { status: "up" | "down"; latencyMs: number };
    weatherApi: { status: "up" | "down" | "degraded"; latencyMs: number };
    ndviApi: { status: "up" | "down" | "degraded"; latencyMs: number };
    claudeApi: { status: "up" | "down" | "degraded"; latencyMs: number };
  };
  uptime: number;  // seconds since last restart
}
```

---

## 3. Data Flow Description

### 3.1 End-to-End Data Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                        FARMER INTERACTION                          │
│                                                                   │
│  1. Farmer opens FasalRakshak web app                              │
│  2. Selects district (Dharwad, Karnataka)                        │
│  3. Selects crop (Ragi)                                         │
│  4. Selects growth stage (Vegetative)                             │
│  5. Clicks "Analyze"                                           │
└────────────────────────┬──────────────────────────────────────────┘
                          │ POST /api/analyze
                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND PROCESSING                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │ REQUEST VALIDATION                                       │      │
│  │ - Validate district ID exists                         │      │
│  │ - Validate crop ID exists                          │      │
│  │ - Validate growth stage exists for crop               │      │
│  └─────��─��─────────────┬───────────────────────────────┘      │
│                        │                                        │
│                        ▼                                        │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ WEATHER DATA FETCH (Open-Meteo)                     │      │
│  │ - Check cache (key: weather:{lat}:{lon})           │      │
│  │ - If miss: GET https://api.open-meteo.com/v1...   │      │
│  │ - Cache result for 6 hours                        │      │
│  │ - Extract: temp, precip, humidity, wind, ET0     │      │
│  └─────────────────────┬───────────────────────────┘      │
│                        │                                        │
│                        ▼                                        │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ NDVI DATA FETCH (Sentinel-2 / MODIS)                │      │
│  │ - Check cache (key: ndvi:{lat}:{lon})              │      │
│  │ - If miss: Query NDVI from satellite API           │      │
│  │ - Cache result for 24 hours                       │      │
│  │ - Extract: NDVI value (0-1), compare to baseline │      │
│  └─────────────────────┬───────────────────────────┘      │
│                        │                                        │
│                        ▼                                        │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ RISK SCORING ENGINE                                │      │
│  │                                                   │      │
│  │ DROUGHT STRESS CALCULATION:                       │      │
│  │   - precip_deficit = (14d_actual / 14d_avg - 1)   │      │
│  │   - soil_moisture_proxy = precip - ET0              │      │
│  │   - ndvi_deviation = (current - 14d_avg)         │      │
│  │   - temp_anomaly = (current - historical_avg)  │      │
│  │   - score = weighted_composite * 100             │      │
│  │                                                   │      │
│  │ PEST PRESSURE CALCULATION:                        │      │
│  │   - humidity_days = days with humidity >70%     │      │
│  │   - temp_favorable = days with temp 25-35°C     │      │
│  │   - ndvi_decline = (current - 14d_prior)         │      │
│  │   - pest_correlation = historical_outbreak_score  │      │
│  │   - score = weighted_composite * 100           │      │
│  │                                                   │      │
│  │ NUTRIENT DEFICIENCY CALCULATION:                 │      │
│  │   - ndvi_vs_threshold = (threshold - current) if < 0  │      │
│  │   - rain_leaching = excess_rain_days            │      │
│  │   - crop_indicators = crop_specific_flags     │      │
│  │   - score = weighted_composite * 100          │      │
│  │                                                   │      │
│  │ COMPOSITE SCORE:                               │      │
│  │   - drought_weight = 0.40                    │      │
│  │   - pest_weight = 0.30                       │      │
│  │   - nutrient_weight = 0.30                    │      │
│  │   - composite = weighted_sum               │      │
│  └─────────────────────┬───────────────────────────┘      │
│                        │                                        │
│                        ▼                                        │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ 7-DAY FORECAST GENERATION                         │      │
│  │ - Use Open-Meteo forecast data                  │      │
│  │ - Project each risk channel forward             │      │
│  │ - Apply simple trending algorithm              │      │
│  └─────────────────────┬───────────────────────────┘      │
│                        │                                        │
│                        ▼                                        │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ RESPONSE FORMATION                               │      │
│  │ - Compose analyze response                     │      │
│  │ - Include all weather, NDVI, scores          │      │
│  │ - Add data freshness indicators             │      │
│  └─────────────────────┬───────────────────────────┘      │
└────────────────────────┼─────────────────────────────────────────┘
                       │
                       │ POST /api/recommend
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│              RECOMMENDATION GENERATION                                 │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ CLAUDE API CALL                                              │    │
│  │ - Construct prompt with risk data                          │    │
│  │ - Include crop, stage, district context                    │    │
│  │ - Specify language preference (en/hi/kn)                   │    │
│  │ - Request 3-5 recommendations with quantities                │    │
│  │ - Cache recommendation (key: recommend:{hash})               │    │
│  └─────────────────────┬──────────────────────────────────────┘    │
│                         │                                            │
│                         ▼                                            │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ RESPONSE PARSING                                            │    │
│  │ - Parse Claude response JSON                                 │    │
│  │ - Extract recommendations array                                │    │
│  │ - Add translated titles/descriptions (hi, kn)               │    │
│  │ - Create simplified voiceText for TTS                      │    │
│  └─────────────────────┬──────────────────────────────────────┘    │
│                         │                                            │
│                         ▼                                            │
└────────────────────────┬───────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   FRONTEND RENDERING                                  │
│                                                                       │
│  1. Display crop health score as circular gauge                      │
│  2. Show 3 risk channel bars (drought, pest, nutrient)         │
│  3. Display 7-day forecast chart                             │
│  4. Render recommendations as cards                         │
│  5. Enable language toggle (en/hi/kn)                          │
│  6. Enable voice readout button (Web Speech API)             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow Sequence Diagram

```
Farmer → InputWizard → API Client → Express Router
                                    ↓
                              Validation
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                           ↓
            WeatherService              NDVIService
                    ↓                           ↓
              Open-Meteo              Sentinel-2/
                 ↓                  Copernicus
                    ↓           (or proxy)
                    └─────────┬─────────────┘
                            ↓
                      CacheService
                            ↓
                     Redis
                            ↓
                    ┌────────┴────────┐
                    ↓                 ↓
           RiskEngine        RiskEngine
           (scoring)      (forecast)
                    ↓                 ↓
                    └────────┬────────┘
                            ↓
                    AnalysisController
                            ↓
                            ├───────────────────┐
                            ↓                   ↓
                    /api/analyze        ClaudeAPI
                     Response          (recommend)
                            ↓                   ↓
                            └────────┬─────────┘
                                     ↓
                             RecommendationController
                                     ↓
                            /api/recommend Response
                                     ↓
                               Frontend
```

---

## 4. Error Handling Strategy

### 4.1 Error Hierarchy

```
Error
├── ClientError (4xx)
│   ├��─ ValidationError (400)
│   │   ├── InvalidDistrictError
│   │   ├── InvalidCropError
│   │   └── InvalidStageError
│   ├── RateLimitError (429)
│   └── UnprocessableError (422)
│
├── ServerError (5xx)
│   ├── DatabaseError (500)
│   │   ├── ConnectionError
│   │   └── QueryError
│   ├── ExternalAPIError (503)
│   │   ├── WeatherAPIError
│   │   ├── NDVIAPIError
│   │   └── ClaudeAPIError
│   └── InternalError (500)
│
└── NetworkError
    ├── TimeoutError
    └── ConnectionError
```

### 4.2 Error Response Schema

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // e.g., "WEATHER_API_UNAVAILABLE"
    message: string;     // User-friendly message
    messageHi: string;    // Hindi translation
    messageKn: string;     // Kannada translation
    statusCode: number;
    details?: any;         // Technical details (dev only)
    retryAfter?: number;  // Seconds to wait before retry
    suggestion?: string;  // User action suggestion
  };
  requestId: string;
  timestamp: string;
}
```

### 4.3 Error Handling by Service

| Service | Error Type | User Message | Retry Strategy |
|---------|------------|--------------|---------------|
| Open-Meteo | Timeout/503 | "Weather service unavailable. Using cached data." | Return cached data (stale OK) |
| Open-Meteo | 404 | "Location data unavailable." | Return error |
| NDVI API | Timeout/503 | "Satellite data unavailable. Using cached data." | Return cached NDVI |
| NDVI API | Rate Limited | "High demand. Please try again in a few minutes." | Retry with exponential backoff |
| Claude API | Timeout/503 | "Unable to generate recommendations. Please try again." | Retry once, then fallback to template |
| Claude API | Rate Limited | "Service busy. Please wait 30 seconds." | Retry after delay |
| MongoDB | Connection | "Database temporarily unavailable." | Retry with backoff |
| Redis | Connection | N/A (silent) | Bypass cache, fetch fresh |

### 4.4 Frontend Error Handling

```typescript
// React Query Error Boundary
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error.code === 'WEATHER_API_UNAVAILABLE') {
        showToast('Using cached weather data', 'warning');
      }
    }
  })
});

// Error Display Component
interface ErrorDisplayProps {
  error: ErrorResponse;
  onRetry?: () => void;
  language: 'en' | 'hi' | 'kn';
}

// User-facing error messages by language
const errorMessages = {
  WEATHER_API_UNAVAILABLE: {
    en: "Weather service is temporarily unavailable. Showing cached data.",
    hi: "मौसम सेवा अभी उपलब्ध नहीं है। पुराना डेटा दिखाया जा रहा है।",
    kn: "ಹವಾಮಾನ ಸೇವೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. ಹಳೆಯ ಡೇಟಾ ತೋರಿಸಲಾಗುತ್ತಿದೆ."
  }
};
```

### 4.5 Graceful Degradation Rules

| Component Failure | Degradation Behavior |
|------------------|----------------------|
| Weather API unavailable | Return cached weather + `isFresh: false` indicator |
| NDVI API unavailable | Return cached NDVI + use historical average as proxy |
| Claude API unavailable | Return template-based recommendations with warning |
| Database unavailable | Use in-memory fallback for static data (crops, districts) |
| Cache unavailable | Fetch fresh data from external APIs (acceptable latency increase) |
| All external services down | Return error with user-friendly message in selected language |

---

## 5. Caching Approach

### 5.1 Cache Architecture

```
┌─────────────────────────────────────────────┐
│              Cache Layer                   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     Redis (Production)             │   │
│  │     OR In-Memory (Dev/MVP)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Key Structure:                            │
│  ─────────────────────────────────────    │
│  weather:{lat}:{lon}:hourly               │
│  ndvi:{lat}:{lon}:latest                 │
│  recommend:{requestHash}               │
│  session:{sessionId}                    │
│  district:{districtId}:latest            │
└─────────────────────────────────────────────┘
```

### 5.2 Cache Key Definitions

| Data Type | Key Pattern | TTL | Invalidation |
|----------|------------|-----|--------------|
| Weather Current | `weather:{lat}:{lon}:current` | 6 hours | Time-based |
| Weather Forecast | `weather:{lat}:{lon}:forecast:{date}` | 6 hours | Time-based |
| NDVI | `ndvi:{lat}:{lon}` | 24 hours | Time-based |
| Recommendations | `recommend:{hash(request)}` | 12 hours | Time-based |
| District Data | `district:{id}` | 7 days | Manual update |
| Crop List | `crops:all` | 30 days | Manual update |
| Growth Stages | `stages:{cropId}` | 30 days | Manual update |
| User Session | `session:{id}` | 24 hours | Time-based |

### 5.3 Cache Implementation (Node.js)

```typescript
// src/services/cache.service.ts

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || undefined);

export class CacheService {
  private static instance: CacheService;
  
  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
    }
  }

  // Generate hash for recommendation request
  static hashRequest(obj: any): string {
    const crypto = require('crypto');
    return crypto.createHash('md5')
      .update(JSON.stringify(obj))
      .digest('hex');
  }
}

// Usage in Weather Service
export class WeatherService {
  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = `weather:${lat}:${lon}:current`;
    
    const cached = await CacheService.getInstance().get<WeatherData>(cacheKey);
    if (cached) {
      return { ...cached, isFresh: false };
    }

    const data = await this.fetchFromOpenMeteo(lat, lon);
    await CacheService.getInstance().set(cacheKey, data, 6 * 60 * 60);
    
    return { ...data, isFresh: true };
  }
}
```

### 5.4 Cache Fallback (In-Memory)

```typescript
// src/services/cache.service.ts (fallback)

import NodeCache from 'node-cache';

const inMemoryCache = new NodeCache({ stdTTL: 3600 });

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    return inMemoryCache.get(key) as T | null;
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    inMemoryCache.set(key, value, ttlSeconds);
  }
}
```

### 5.5 Cache Invalidation Strategy

| Trigger | Action |
|---------|--------|
| TTL expiry | Automatic expiration by Redis |
| District data update | Invalidate `district:*` keys |
| Crop list update | Invalidate `crops:*`, `stages:*` keys |
| Manual flush | `FLUSHDB` command (admin only) |
| Deployment | Automatic cache clear on new deployment (optional) |

---

## 6. Technology Stack Summary

### 6.1 Backend

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 20.x LTS |
| Framework | Express.js | 5.x |
| ORM | Prisma | 5.x |
| Database | MongoDB | 7.x |
| Cache | Redis | 7.x |
| Validation | Zod | 3.x |
| HTTP Client | Axios | 1.x |
| Logging | Pino | 9.x |
| API Spec | OpenAPI 3.x |

### 6.2 Frontend

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 18.x |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.x |
| State/Fetch | TanStack Query | 5.x |
| Routing | React Router | 6.x |
| Forms | React Hook Form | 7.x |
| Charts | Recharts | 2.x |
| Icons | Lucide React | 0.x |
| Voice | Web Speech API | Native |

### 6.3 External APIs

| Provider | Endpoint | Auth | Rate Limit |
|----------|----------|------|------------|
| Open-Meteo | api.open-meteo.com/v1 | None | 10,000/day |
| Copernicus | scihub.copernicus.eu | API Key | TBD |
| Anthropic | api.anthropic.com | API Key | 50/min |

---

## 7. Security Considerations

| Area | Implementation |
|------|----------------|
| HTTPS | TLS 1.2+ enforced |
| API Keys | Environment variables, never committed |
| Input Validation | Zod schemas on all endpoints |
| Rate Limiting | 100 requests/minute per IP |
| CORS | Restricted to frontend origins |
| Request Size | Max 1MB body |
| XSS Protection | Helmet.js middleware |
| SQL Injection | Prisma parameterized queries |
| Cache Poisoning | Input sanitization before cache keys |

---

## 8. Appendix

### 8.1 Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/fasalrakshak

# Redis
REDIS_URL=redis://localhost:6379

# External APIs
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
COPERNICUS_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-3-opus-20240229

# Frontend
VITE_API_URL=http://localhost:3000/api
```

### 8.2 Directory Structure

```
fasalrakshak/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── analyze.controller.ts
│   │   │   ├── recommend.controller.ts
│   │   │   ├── crops.controller.ts
│   │   │   └── districts.controller.ts
│   │   ├── services/
│   │   │   ├── weather.service.ts
│   │   │   ├── ndvi.service.ts
│   │   │   ├── risk-engine.service.ts
│   │   │   ├── cache.service.ts
│   │   │   └── claude.service.ts
│   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── validation.ts
│   │   │   ├── error-handler.ts
│   │   │   └── rate-limit.ts
│   │   ├── schemas/
│   │   │   ├── analyze.schema.ts
│   │   │   └── recommend.schema.ts
│   │   ├── config/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputWizard/
│   │   │   ├── RiskDashboard/
│   │   │   ├── Recommendations/
│   │   │   └── common/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

---

*Document Version: 1.0*  
*Last Updated: April 23, 2026*  
*Author: Engineering Team, FasalRakshak*  
*Status: Ready for Implementation*