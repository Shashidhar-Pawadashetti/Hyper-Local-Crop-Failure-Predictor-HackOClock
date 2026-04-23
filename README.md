# FasalRakshak — Hyper-Local Crop Failure Predictor

A mobile-first web application that predicts crop failure risk at the district level in India using satellite NDVI data, weather data from Open-Meteo API, and AI-generated recommendations via Claude API. Designed for small and marginal farmers with multi-language support (English, Hindi, Kannada) and voice readout for low-literacy users.

## Features

- **District-Level Risk Prediction**: Input district, crop type, and growth stage to receive a 0-100 crop health score
- **Three-Channel Risk Scoring**: Differentiates between drought stress, pest pressure, and nutrient deficiency
- **7-Day Forecast**: Weather-correlated risk forecast for proactive planning
- **Multi-Language Recommendations**: Quantity-aware interventions in English, Hindi, or Kannada
- **Voice Readout**: Web Speech API synthesis in Kannada for low-literacy users
- **Mobile-First Design**: Responsive UI optimized for basic smartphones on 3G networks

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js (Express) or Python (FastAPI)
- **Weather Data**: Open-Meteo API (free, no API key required)
- **NDVI Data**: Sentinel-2 / MODIS satellite data
- **Recommendations**: Claude API (Anthropic)
- **Voice**: Web Speech API

## Getting Started

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Supported Crops

- Paddy (Rice)
- Wheat
- Maize
- Ragi (Finger Millet)
- Cotton
- Sugarcane
- Soybean
- Groundnut
- Mustard
- Potato

## Supported Languages

- English (en-IN) — Default
- Hindi (hi-IN)
- Kannada (kn-IN)

## Documentation

See [PRD.md](./PRD.md) for the full Product Requirements Document.

## License

MIT