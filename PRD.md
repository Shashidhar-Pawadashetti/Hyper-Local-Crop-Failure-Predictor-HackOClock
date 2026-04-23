# Product Requirements Document (PRD): FasalRakshak

## Hyper-Local Crop Failure Predictor for Indian Farmers

| Document Property | Value |
|-------------------|-------|
| **Product Name** | FasalRakshak |
| **Version** | 1.0 |
| **Document Status** | Production Draft |
| **Classification** | Agricultural Technology / GovTech |
| **Target Users** | Small and Marginal Indian Farmers, Agricultural Extension Officers |
| **Platform** | Web Application (Mobile-First) |
| **Primary Language Support** | English, Hindi, Kannada |

---

## 1. Problem Statement

India loses approximately ₹8-10 lakh crore annually to crop failures caused by preventable factors including drought stress, pest infestations, and nutrient deficiencies. While satellite imagery, soil sensors, and historical weather patterns contain powerful predictive signals that could enable early intervention, the majority of Indian farmers lack the technical tools, literacy, and infrastructure to interpret this data and take preemptive action.

The current agricultural advisory ecosystem in India suffers from three critical gaps:

1. **Information asymmetry**: Weather and satellite data exist in technical formats that are inaccessible to average farmers, who typically have only primary-level education and rely on visual observation and traditional knowledge for crop management decisions.

2. **Language and literacy barriers**: Existing agricultural advisory systems deliver recommendations in English or technical Hindi, assuming a level of literacy and digital fluency that does not reflect the reality of India's farming community—particularly women farmers, who constitute approximately 33% of the agricultural labor force but have significantly lower average educational attainment.

3. **Actionability deficit**: Even when farmers receive risk warnings, the recommendations lack specificity—quantities, timings, and local context—so farmers cannot translate abstract alerts into concrete actions. A warning to "apply fertilizer" is meaningless without knowing what type, how much, when, and at what cost.

FasalRakshak addresses these gaps by building a user-centric system that translates complex remote sensing and weather data into a simple 0-100 crop health score with a 7-day risk forecast, delivers 3-5 hyper-specific interventions in the farmer's preferred language (including Kannada), and provides voice readout capabilities for low-literacy users.

---

## 2. Executive Summary

FasalRakshak is a mobile-first web application that predicts crop failure risk at the district level using publicly available satellite data (NDVI from Sentinel-2/MODIS) and weather data (Open-Meteo API). The system accepts three inputs from the farmer—district location, crop type, and growth stage—and outputs a composite 0-100 crop health score with a 7-day risk forecast, along with 3-5 actionable recommendations generated via Claude API in English, Hindi, or Kannada. A voice readout feature using Web Speech API enables usage by low-literacy farmers.

The three-channel risk scoring engine differentiates between:

- **Drought stress**: Derived from precipitation deficit, soil moisture estimates, evapotranspiration rates, and NDVI trends.
- **Pest pressure**: Inferred from weather conditions favorable to pest proliferation, historical pest outbreak data, and vegetation stress indicators.
- **Nutrient deficiency**: Estimated from NDVI anomalies relative to crop-specific healthy baselines, precipitation patterns, and soil type proxies.

Key differentiators from existing solutions include: (1) multi-language output including Kannada, (2) voice interface for low-literacy users, (3) differentiation between three distinct risk channels, and (4) quantity-aware recommendations with specific amounts, schedules, and costs.

---

## 3. User Personas

### 3.1 Persona A: Small and Marginal Indian Farmer

| Attribute | Details |
|-----------|---------|
| **Name** | Ramesh |
| **Age** | 45 years |
| **Location** | Rural Karnataka (Dharwad District) |
| **Farm Size** | 1.5 acres (marginal farmer) |
| **Primary Crop** | Ragi, Maize, and Vegetables |
| **Education** | 7th standard (primary completed) |
| **Digital Literacy** | Basic—can use WhatsApp, make UPI payments, and consume short videos. Cannot read long-form text comfortably. |
| **Language Preference** | Kannada (native), Hindi (conversational), English (limited) |
| **Pain Points** | Unpredictable monsoon causes crop losses; unable to identify whether yellowing leaves are due to drought, pest, or nutrient deficiency; receives generic advice that does not specify quantities or costs; has to visit the Krishi Vigyan Kendra (KVK) for advice, which is time-consuming and requires travel. |
| **Goals** | Protect the standing crop from predictable losses; receive specific guidance on water, fertilizer, and pest management that fits his resources; avoid middlemen and input dealers who may recommend unnecessary or expensive products. |
| **User Journey** | Ramesh accesses FasalRakshak via a mobile browser. He selects his district (Dharwad), crop (Ragi), and growth stage (vegetative). He receives a crop health score of 68/100 with a 7-day forecast. The system identifies elevated drought stress (72/100) and recommends specific interventions: (1) Apply 2 liters of water per square meter today and tomorrow morning, (2) Apply neem cake 250 kg/acre as preventive pest control, (3) Top-dress urea 15 kg/acre 5 days after next rain. He clicks the voice button to hear the first two recommendations in Kannada. |

### 3.2 Persona B: Agricultural Extension Officer

| Attribute | Details |
|-----------|---------|
| **Name** | Dr. Lakshmi Devi |
| **Age** | 38 years |
| **Location** | Bhopal, Madhya Pradesh (originally from Andhra Pradesh) |
| **Role** | Subject Matter Specialist (Crop Science), District Agricultural Extension Office |
| **Organization** | Department of Agriculture, Madhya Pradesh |
| **Education** | M.Sc. in Agronomy, 12 years of field experience |
| **Digital Literacy** | Moderate—uses Kisan Portal, WhatsApp groups, Excel, and can navigate web dashboards. |
| **Language Preference** | Hindi (native), English (working), Telugu (home), Kannada (basic comprehension) |
| **Pain Points** | Overwhelmed by the number of farmers to serve (1 officer per 30,000+ farmers); cannot visit every village regularly; existing advisory systems are too generic and do not account for micro-level variations within a district; lacks real-time data to support field observations with evidence. |
| **Goals** | Scale personalized advisory to more farmers; access district-level risk summaries to prioritize field visits; provide evidence-backed recommendations to farmer groups; track aggregate risk trends to request resource allocation from the state government. |
| **User Journey** | Dr. Lakshmi opens the FasalRakshak dashboard for her district (Rajgarh). She sees a heatmap of crop health scores across villages and identifies three villages with scores below 50. She clicks into each village to see the breakdown by crop and risk channel. She selects a village with high pest pressure and generates a bulk advisory for cotton farmers in the pod formation stage—specifically, a recommendation to apply imidacloprid at 0.3 ml/liter of water within 48 hours, with a warning not to apply during flowering to protect pollinators. She exports this advisory as a PDF in Hindi and shares it via WhatsApp to the village farmer group. |

---

## 4. User Stories

### 4.1 Farmer-Facing User Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| F-US-01 | As a farmer, I want to select my district from a searchable dropdown so that I can receive location-specific predictions. | Dropdown contains all 763+ Indian districts. Search returns results within 200ms. Auto-complete suggests districts as the user types. Default selection is based on browser geolocation if available. |
| F-US-02 | As a farmer, I want to select my crop type from a curated list of 10 major Indian crops so that the system can apply crop-specific risk models. | Crop list includes: Paddy (Rice), Wheat, Maize, Ragi (Finger Millet), Cotton, Sugarcane, Soybean, Groundnut, Mustard, and Potato. Each crop has associated growth stages. |
| F-US-03 | As a farmer, I want to select my crop's growth stage from a crop-specific list so that risk calculations account for stage-specific vulnerabilities. | Growth stages vary by crop—for example, rice has nursery, transplanting, tillering, panicle initiation, flowering, and grain filling. Selection is guided by icons and simple descriptions. |
| F-US-04 | As a farmer, I want to receive a single composite crop health score (0-100) so that I can quickly understand my crop's overall status. | Score is displayed as a circular gauge with a color gradient (green >70, yellow 40-70, red <40). Score calculation runs server-side and is cached for 6 hours. |
| F-US-05 | As a farmer, I want to see a 7-day risk forecast so that I can plan interventions proactively. | Forecast shows daily risk levels for each of the three channels (drought stress, pest pressure, nutrient deficiency) with icons and simple text. |
| F-US-06 | As a farmer, I want to receive 3-5 specific interventions so that I can take immediate action. | Each recommendation includes: (1) action type (e.g., irrigation, fertilizer, pest control), (2) quantity (e.g., "2 liters per sq meter," "urea 15 kg/acre"), (3) timing (e.g., "today," "within 48 hours"), and (4) estimated cost (e.g., "₹250/acre"). |
| F-US-07 | As a farmer, I want to read recommendations in my preferred language (English, Hindi, or Kannada) so that I can understand them clearly. | Language toggle switches all content. Default language is based on the selected district's primary language. Translations are provided by Claude API. |
| F-US-08 | As a farmer, I want to hear recommendations read aloud in Kannada so that I can use the app without reading. | Voice button triggers Web Speech API synthesis in Kannada (kn-IN). Playback controls (play, pause, stop) are visible. Speech rate is adjustable (0.8x to 1.2x). |
| F-US-09 | As a farmer, I want the interface to be usable on a basic smartphone so that I do not need an expensive device or stable internet. | App loads in under 5 seconds on 3G networks. Total page weight is under 500KB. UI is responsive from 320px width and above. Touch targets are minimum 44x44px. |

### 4.2 Extension Officer-Facing User Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| E-US-01 | As an extension officer, I want to see a district-level summary dashboard so that I can prioritize my field visits. | Dashboard shows aggregate crop health score, distribution across villages, and trend over the past 7 days. |
| E-US-02 | As an extension officer, I want to filter risk data by crop, growth stage, and risk channel so that I can generate targeted advisories. | Filters are multi-select. Filter changes reflect within 1 second. |
| E-US-03 | As an extension officer, I want to generate a downloadable advisory PDF so that I can share it with farmer groups. | PDF includes district name, date, risk summary, and 3-5 recommendations in the selected language. File size is under 500KB. |
| E-US-04 | As an extension officer, I want to view historical risk data so that I can compare the current season with previous seasons. | Historical data is displayed as a line chart with selectable time ranges (7 days, 30 days, 90 days, 1 year). |

---

## 5. Functional Requirements

### 5.1 Core Functional Requirements

| ID | Requirement | Description | Priority |
|----|-------------|-------------|-----------|
| FR-01 | District Selection | The system shall provide a searchable dropdown containing all Indian districts (minimum 763 districts) with geocoding to lat/long coordinates. | Must Have |
| FR-02 | Crop Selection | The system shall provide a selection of 10 major Indian crops: Paddy, Wheat, Maize, Ragi, Cotton, Sugarcane, Soybean, Groundnut, Mustard, and Potato. | Must Have |
| FR-03 | Growth Stage Selection | The system shall provide crop-specific growth stages with icons and simple visual descriptions. | Must Have |
| FR-04 | Weather Data Ingestion | The system shall fetch live weather data from Open-Meteo API using district centroid coordinates. Required data points: temperature, precipitation, relative humidity, wind speed, and evapotranspiration. | Must Have |
| FR-05 | NDVI Satellite Data Ingestion | The system shall fetch NDVI data from Sentinel-2/MODIS or a proxy source (e.g., aggregated NDVI API) for the district. Data shall be no older than 14 days. | Must Have |
| FR-06 | Three-Channel Risk Scoring | The system shall compute three separate risk scores: drought stress, pest pressure, and nutrient deficiency—each on a 0-100 scale. | Must Have |
| FR-07 | Composite Health Score | The system shall compute a weighted composite crop health score (0-100) from the three channel scores. Default weights: drought 40%, pest 30%, nutrient 30%. | Must Have |
| FR-08 | 7-Day Forecast | The system shall generate a 7-day forecast for each risk channel based on weather predictions from Open-Meteo. | Must Have |
| FR-09 | Recommendation Generation | The system shall generate 3-5 interventions via Claude API that are quantity-aware, crop-specific, growth-stage-aware, and locally calibrated. | Must Have |
| FR-10 | Multi-Language Output | The system shall deliver recommendations in English, Hindi, and Kannada. Language shall be selectable on the UI. | Must Have |
| FR-11 | Voice Readout | The system shall provide a voice readout button that uses Web Speech API to read recommendations in Kannada (kn-IN). | Should Have |
| FR-12 | Extension Dashboard | The system shall provide a dashboard for extension officers with district-level aggregation, filtering, and export capabilities. | Should Have |

### 5.2 Data Flow and Processing Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-13 | Data Caching | Weather data shall be cached for a minimum of 6 hours. NDVI data shall be cached for a minimum of 24 hours. Cache invalidation shall be automatic on expiry. |
| FR-14 | Fallback Data | If live API data is unavailable, the system shall use the most recent cached data with a visible "data may be outdated" indicator. |
| FR-15 | Error Handling | All API errors shall be caught and displayed to the user in plain language with a suggestion to retry. No technical error messages shall be exposed to the end user. |
| FR-16 | Input Validation | All user inputs (district, crop, growth stage) shall be validated before submission. Invalid combinations shall be prevented at the UI level. |

### 5.3 Data Source Specifications

| Data Source | API / Source | Data Points | Refresh Rate |
|------------|--------------|-------------|---------------|
| Weather | Open-Meteo API | Temperature (max/min), precipitation, relative humidity, wind speed, evapotranspiration (ET0) | Every 6 hours |
| NDVI | Sentinel-2 / MODIS (viagee or equivalent proxy) | NDVI value (0-1 scale), cloud cover percentage | Every 14 days (minimum) |
| District Geocoding | local GeoJSON of Indian districts | District centroid lat/long | Static (updated quarterly) |
| Crop Calendars | Embedded reference data | Growth stage windows by crop and region | Static (updated annually) |

### 5.4 Risk Scoring Engine Specifications

| Risk Channel | Input Variables | Scoring Logic | Weight in Composite |
|-------------|----------------|---------------|---------------------|
| Drought Stress | Precipitation deficit (last 14 days vs. historical average), soil moisture proxy (derived from precipitation + ET0), NDVI trend (deviation from 14-day moving average), temperature anomaly | Composite score: (precipitation deficit × 0.3) + (soil moisture × 0.3) + (NDVI deviation × 0.25) + (temperature anomaly × 0.15), normalized to 0-100 | 40% |
| Pest Pressure | Humidity >70% days, temperature range favorable to pests (25-35°C), NDVI sudden decline (>0.1 drop in 14 days), historical pest outbreak correlation | Composite score: (humidity × 0.25) + (temperature × 0.25) + (NDVI decline × 0.35) + (historical correlation × 0.15), normalized to 0-100 | 30% |
| Nutrient Deficiency | NDVI below crop-specific threshold for growth stage, precipitation pattern (excess rain leaches nutrients), crop-specific nutrient stress indicators from reference data | Composite score: (NDVI below threshold × 0.5) + (precipitation pattern × 0.25) + (crop-specific indicators × 0.25), normalized to 0-100 | 30% |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| Metric | Requirement | Rationale |
|--------|-------------|-----------|
| Page Load Time | <5 seconds on 3G network (500 Kbps) | Farmers may rely on mobile data with limited bandwidth. |
| Time to First Score | <10 seconds from form submission to score display (including API calls) | User drop-off increases significantly beyond 10 seconds. |
| API Response Time | <3 seconds for weather and NDVI data fetch (excluding external API latency) | Assumes external APIs respond within 5 seconds. |
| Cache Hit Ratio | >80% for weather data, >90% for NDVI data | Reduces external API dependency and improves speed. |
| Concurrent Users | Support 1000 simultaneous users per district (scalable arch) | Baseline for MVP; auto-scaling for production. |

### 6.2 Accessibility Requirements

| Requirement | Standard | Implementation |
|--------------|----------|----------------|
| Color Contrast | WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text) | Gauge colors use #22c55e (green, OK), #eab308 (yellow, warning), #ef4444 (red, danger) against #ffffff background. |
| Touch Targets | Minimum 44x44px | All buttons and interactive elements meet this requirement. |
| Screen Reader Support | WCAG 2.1 A | All UI elements have appropriate aria-labels and roles. Voice readout serves as an alternative to reading. |
| Font Scalability | UI scales from 100% to 200% browser zoom without horizontal scroll | Responsive layout from 320px to 1920px width. |
| Keyboard Navigation | Full keyboard operability | Tab order follows visual flow; focus indicators are visible. |

### 6.3 Language and Localization Requirements

| Language | Script | Locale Code | Status |
|----------|--------|-------------|--------|
| English | Latin | en-IN | Primary (default for MVP) |
| Hindi | Devanagari | hi-IN | Full support (MVP) |
| Kannada | Kannada | kn-IN | Full support (MVP) — high priority for judging |
| Telugu | Telugu | te-IN | Out of Scope (Phase 2) |
| Tamil | Tamil | ta-IN | Out of Scope (Phase 2) |
| Marathi | Devanagari | mr-IN | Out of Scope (Phase 2) |
| Bengali | Bengali | bn-IN | Out of Scope (Phase 2) |

All non-English translations shall be provided via Claude API at runtime. Static fallback translations shall be cached for offline resilience.

### 6.4 Reliability Requirements

| Metric | Requirement |
|--------|-------------|
| Uptime | 99.5% (excluding planned maintenance) |
| Data Freshness | Weather data no older than 6 hours; NDVI data no older than 14 days |
| Error Rate | <1% of requests result in visible errors to end users |
| Graceful Degradation | System remains usable with cached data when external APIs are unavailable |

### 6.5 Security Requirements

| Requirement | Implementation |
|--------------|----------------|
| No PII Storage | System does not store personally identifiable information. No user accounts required for MVP. |
| HTTPS | All traffic is encrypted via TLS 1.2+. |
| Input Sanitization | All user inputs are sanitized before processing to prevent injection attacks. |
| API Rate Limiting | External API calls are rate-limited to prevent quota exhaustion. |

### 6.6 Mobile Responsiveness Requirements

| Screen Width | Layout Behavior |
|-------------|----------------|
| <576px (mobile portrait) | Single column, stacked elements, full-width buttons, bottom navigation |
| 576-768px (mobile landscape / tablet portrait) | Single column with side padding, larger text |
| 768-992px (tablet landscape) | Two-column layout for results dashboard |
| >992px (desktop) | Centered container (max-width 1200px), side panels for details |

---

## 7. Out-of-Scope Items

The following items are explicitly out of scope for the MVP (Version 1.0) and may be considered for Phase 2 or later:

| Item | Reason for Exclusion |
|------|-------------------|
| **User Accounts / Authentication** | Not required for MVP; adds complexity. Data is session-based. |
| **Push Notifications** | Requires accounts and push infrastructure; SMS fallback is cost-prohibitive. |
| **Soil Sensor Integration** | Requires hardware deployment partnerships and maintenance; beyond MVP scope. |
| **Crop Insurance Integration** | Requires regulatory approvals and insurance partner onboarding; business development, not product. |
| **Market Price Integration** | Agricultural market data (Agmarknet) is a separate data ecosystem; out of scope unless integrated via API in Phase 2. |
| **Regional Languages Beyond Hindi and Kannada** | Translation QA and voice synthesis support for Telugu, Tamil, Marathi, Bengali requires additional TTS voices and human review. |
| **Farm-Level Precision (Plot-Level NDVI)** | Requires user to draw polygons on a map; adds UI complexity and boundary data requirements. |
| **Historical Pest Outbreak Database** | Requires data partnership with state agriculture departments; manual data entry is unscalable. |
| **Fertilizer and Pesticide Brand Recommendations** | Product endorsements raise regulatory and trust concerns; stick to generic recommendations (e.g., "urea" not "Urea-N"). |
| **Offline Mode Without Cache** | Full offline functionality requires Progressive Web App (PWA) implementation with local storage; MVP uses HTTP caching only. |
| **Weather Alert SMS Integration** | Requires carrier partnerships and transactional SMS costs. |
| **Multi-Day Forecast Beyond 7 Days** | Weather prediction accuracy degrades significantly beyond 7 days; keep to 7 for MVP. |

---

## 8. Success Metrics

### 8.1 Product Metrics

| Metric | Definition | Target (MVP) | Measurement |
|--------|------------|--------------|--------------|
| Crop Health Score Computation Rate | Percentage of requests that successfully return a composite score | >95% | Server-side logs |
| Time to First Score | Median time from form submission to score display | <10 seconds | Client-side performance API |
| Recommendation Accuracy | Percentage of recommendations that are syntactically valid and quantity-aware | >90% | Claude API response sampling |
| Voice Readup Completion Rate | Percentage of users who start voice playback and complete it | >70% | Client-side event tracking |
| Error Rate | Percentage of requests resulting in user-visible error messages | <2% | Server-side logs |

### 8.2 Business Metrics

| Metric | Definition | Target (MVP) | Measurement |
|--------|------------|--------------|--------------|
| Adoption | Number of unique users who complete at least one risk query | 5,000+ in first 3 months | Analytics (anonymous session count) |
| Retention | Percentage of users who return within 7 days | >40% | Session analytics |
| Recommendation Actionability | Self-reported usefulness score (1-5 scale) | >3.5 | In-app survey (optional, shown once per session) |
| Language Distribution | Percentage of users using Kannada vs. Hindi vs. English | Kannada >30%, Hindi >30%, English >20% | Language toggle analytics |

### 8.3 Technical Metrics

| Metric | Definition | Target (MVP) |
|--------|------------|--------------|
| Uptime | System availability | 99.5% |
| Page Load | Time to interactive on 3G | <5 seconds |
| API Latency | Weather + NDVI + scoring pipeline | <8 seconds (P95) |
| Cache Hit Rate | Weather data | >80% |

### 8.4 Accessibility Metrics

| Metric | Definition | Target (MVP) |
|--------|------------|--------------|
| Lighthouse Accessibility Score | Automated accessibility audit | >80 |
| Voice User Percentage | Users who engage voice readout at least once | >25% |
| Mobile Session Percentage | Sessions on viewport width <576px | >70% |

---

## 9. Technical Architecture Overview

### 9.1 System Architecture Diagram (Textual)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Backend   │────▶│  External   │
│  (Browser)  │     │  (Server)   │     │    APIs     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   ▼                   ▼
       │            ┌─────────────┐     ┌─────────────┐
       │            │   Cache     │     │  Open-Meteo │
       │            │ (Redis/     │     │    API      │
       │            │  In-Memory) │     └─────────────┘
       │            └─────────────┘            │
       │                   │                   ▼
       ▼                   │            ┌─────────────┐
┌─────────────┐            │            │  NDVI API   │
│    UI       │◀───────────┴──────────────│  (Proxy)    │
│ (HTML/CSS/  │                         └─────────────┘
│  JS)        │
└─────────────┘
       │
       ▼
┌──���─���────────────────────────────────────────┐
│            Risk Scoring Engine              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │   Drought   │ │    Pest     │ │ Nutrient││
│  │   Stress   │ │   Pressure  │ │Deficiency│
│  │   Score    │ │    Score    │ │  Score  ││
│  └─────────────┘ └─────────────┘ └─────────┘│
└─────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│         Recommendation Generator            │
│        (Claude API - Text Model)           │
└─────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│          Multi-Language Controller         │
│     (English / Hindi / Kannada Output)      │
│     + Web Speech API (Voice Readout)       │
└─────────────────────────────────────────────┘
```

### 9.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) | No framework required for MVP; lightweight and fast. Alternatives: React or Vue only if state management becomes complex. |
| Styling | CSS Grid + Flexbox + Custom Properties | Responsive without Bootstrap dependency. |
| Backend | Node.js (Express) or Python (FastAPI) | FastAPI recommended for Python-native ML/Scoring libraries. |
| External APIs | Open-Meteo (weather), Sentinel-2/MODIS (NDVI proxy), Claude API (recommendations) | Open-Meteo requires no API key. Claude API for language generation. |
| Caching | Redis (production) or in-memory (MVP) | Reduces API calls and improves response time. |
| Deployment | Vercel/Netlify (frontend) + Render/Railway (backend) | Free tier available; rapid deployment. |

---

## 10. Appendix

### 10.1 Crop List with Growth Stages

| Crop | Growth Stages |
|------|--------------|
| Paddy (Rice) | Nursery, Transplanting, Tillering, Panicle Initiation, Flowering, Grain Filling, Maturity |
| Wheat | Sowing, Germination, Tillering, Jointing, Flowering, Grain Filling, Maturity |
| Maize | Sowing, Emergence, V6 (6 leaves), V12 (12 leaves), VT (tasseling), R1 (silking), Grain Filling, Maturity |
| Ragi (Finger Millet) | Sowing, Tillering, Stem Elongation, Flowering, Grain Filling, Maturity |
| Cotton | Sowing, Emergence, Squaring, Flowering, Boll Formation, Boll Opening, Picking |
| Sugarcane | Planting, Germination, Tillering, Grand Growth, Ripening, Harvest |
| Soybean | Emergence, Vegetative (V1-Vn), Flowering, Pod Development, Seed Filling, Maturity |
| Groundnut | Sowing, Emergence, Pegging, Flowering, Pod Development, Kernel Fill, Harvest |
| Mustard | Sowing, vegetative, Flowering, Siliqua Development, Seed Fill, Maturity |
| Potato | Planting, Emergence, Vegetative, Tuber Initiation, Tuber Bulking, Maturity |

### 10.2 Risk Score Thresholds

| Composite Score | Status | Color | Action |
|----------------|--------|-------|--------|
| 70-100 | Healthy | Green (#22c55e) | Continue current practices. Monitor. |
| 40-69 | At Risk | Yellow (#eab308) | Review recommendations. Take at least one intervention. |
| 0-39 | Critical | Red (#ef4444) | Immediate intervention required. Prioritize actions. |

### 10.3 Data Freshness Indicators

| Data Type | Fresh | Stale | Indicator |
|-----------|-------|-------|------------|
| Weather | <6 hours | >6 hours | "Weather data updated X hours ago" |
| NDVI | <14 days | >14 days | "Satellite data may be outdated" |
| Score | <24 hours | >24 hours | "Risk score based on data from X" |

### 10.4 Glossary

| Term | Definition |
|------|------------|
| NDVI | Normalized Difference Vegetation Index—a measure of crop greenness derived from satellite reflectance. |
| Evapotranspiration (ET0) | Reference evapotranspiration—the sum of evaporation and plant transpiration. |
| Crop Health Score | Composite 0-100 score reflecting overall crop vitality based on drought, pest, and nutrient channels. |
| Growth Stage | The phase of crop development (e.g., vegetative, flowering, grain filling). |
| Claude API | Anthropic's Claude language model API for generating natural language recommendations. |
| Web Speech API | Browser API for text-to-speech synthesis. |
| Open-Meteo | Open-source weather API providing free weather data without API keys. |

---

*Document Version: 1.0*  
*Last Updated: April 23, 2026*  
*Author: Product Team, FasalRakshak*  
*Status: Ready for Development Team Review*