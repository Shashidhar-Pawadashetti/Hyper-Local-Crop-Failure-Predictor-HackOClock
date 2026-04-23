# FasalRakshak Hackathon Sprint Plan

**Product:** FasalRakshak — Hyper-Local Crop Failure Predictor  
**Duration:** 18 Hours  
**Team Size:** 4 Members  
**Date:** April 23–24, 2026

---

## Team Composition

| Role | Member | Primary Responsibility |
|------|-------|---------------------|
| Backend & Data Engineer | Member 1 | Express API, Open-Meteo/MODIS integration, MongoDB |
| Risk Scoring Engineer | Member 2 | Three-channel scoring algorithm, crop knowledge base |
| AI Integration Engineer | Member 3 | Claude API, prompt engineering, multilingual output |
| Frontend Engineer | Member 4 | React UI, Recharts, Web Speech API, mobile polish |

---

## 1. Hour-by-Hour Timeline

### Hours 0–3: Foundation & Setup

| Hour | Backend & Data Engineer | Risk Scoring Engineer | AI Integration Engineer | Frontend Engineer |
|------|----------------------|---------------------|----------------------|-------------------|
| **0** | Project setup: Initialize Node.js repo, install dependencies (express, prisma, axios, cors, dotenv). Create folder structure. Review existing PRD/architecture docs. | Review CROP_KNOWLEDGE_BASE.md. Extract risk weight matrix. Create TypeScript interfaces for crops/stages. | Review PROMPT_ENGINEERING_GUIDE.md. Set up Anthropic API key. Test Claude API connectivity with simple request. | Initialize React 18 + Vite + Tailwind project. Configure Tailwind with brand colors. Set up React Router. |
| **1** | Set up Express server with basic routes (/health, /crops, /districts). Create district geo JSON (top 50 districts). Configure Prisma with MongoDB. | Create: `src/types/crops.ts` with 10 crop definitions. Create: `src/types/stages.ts` with growth stage interfaces. | Create system prompt file. Build request/response TypeScript types. Test API call with mock data. | Set up App.tsx with routing. Create basic layout components (Header, Footer). Set up AppContext for state. |
| **2** | Implement GET /api/crops (return 10 crops). Implement GET /api/districts (return searchable list). Add CORS and helmet middleware. | Create crop knowledge base JSON structure. Map each crop to growth stages. Define drought sensitivity enums. | Write user message template with placeholder fields. Build output parser function. | Create InputWizard page skeleton with 3-step form. Add progress indicator component. |
| **3** | Test all endpoints with curl. Document API in Postman/curl. Add error handling middleware. | Review and finalize crop-stage mapping. Create `cropKB.ts` loader utility. | Test Claude API with sample input. Verify JSON output parsing. | Create DistrictStep component with search. Create CropStep component with grid display. |

### Hours 3–6: Core Data Flow

| Hour | Backend & Data Engineer | Risk Scoring Engineer | AI Integration Engineer | Frontend Engineer |
|------|----------------------|---------------------|----------------------|-------------------|
| **4** | Implement Open-Meteo weather API integration. Create weather service with caching (6hr TTL). | Create riskEngine service with three-channel scoring. Implement drought calculation: precip deficit + ET0 + NDVI. | Build recommend endpoint request transformer. Prepare full risk payload construction. | Create StageStep component with stage list. Hook up form navigation (Next/Back). |
| **5** | Implement MODIS/Sentinel NDVI fetch (or mock with realistic NDVI data). Create NDVI service. | Implement pest pressure calculation: humidity + temp + NDVI decline. Add historical correlation placeholder. | Create /api/recommend endpoint stub. Pass-through to Claude with formatted prompt. | Wire up InputWizard → API call. Test 3-step form flow. |
| **6** | Integrate weather + NDVI + scoring in /api/analyze endpoint. Create risk payload response. | Implement nutrient deficiency calculation: NDVI threshold + rain leaching. Create composite score: 40% drought, 30% pest, 30% nutrient. | Integrate Claude API call in /recommend. Parse output to structured JSON. Verify 3-language output. | Create RiskDashboard page skeleton. Add ScoreGauge component (circular SVG). |

### Hours 6–9: Integration & Polish

| Hour | Backend & Data Engineer | Risk Scoring Engineer | AI Integration Engineer | Frontend Engineer |
|------|----------------------|---------------------|----------------------|-------------------|
| **7** | **INTEGRATION CHECKPOINT #1 (Hr 8)**. All three data sources integrated. Fix any API response mismatches. Create 7-day forecast logic. | Run scoring algorithm on test data (rice, Dharwad, vegetative). Verify outputs 0-100. | Test Claude with full risk payload for 3 scenarios. Fix prompt issues. Verify Hindi/Kannada output structure. | Create ChannelBars component (3 progress bars with colors). Add animated transitions. |
| **8** | Add data freshness indicators to all responses. Add error handling for API failures. Cache invalidation logic. | Generate risk weight lookup table (10 crops × 6 stages). Add unit tests for scoring (if time permits). | Verify urgency sorting works. Add cost estimation to output. | Fetch and display risk scores from API. Test loading states. |

### Hours 9–12: Frontend Completion

| Hour | Backend & Data Engineer | Risk Scoring Engineer | AI Integration Engineer | Frontend Engineer |
|------|----------------------|---------------------|----------------------|-------------------|
| **9** | Buffer: Fix any remaining backend issues. Add logging. Create fallback mock data for demo. | Add crop-specific thresholds to scoring. Add seasonal adjustments. | Create template-based fallback for Claude failure (Tier 4). Add user-facing error messages in 3 languages. | Create ForecastChart using Recharts. Display 7-day risk forecast. |
| **10** | Optimize API response size. Ensure <500KB page weight. Test on 3G throttle. | Add debug logs for scoring (for demo explanation). Add baseline comparison. | Verify voiceText field for Kannada TTS. Ensure action includes quantities. | Display weather summary. Create weather icons. |
| **11** | Full API endpoint testing. Verify all routes return correct schemas. | Scoring verification with multiple crops/stages. | Test all language combinations. Verify no brand name recommendations. | Create Recommendations page. Display recommendation cards with urgency badges. |
| **12** | **INTEGRATION CHECKPOINT #2 (Hr 14)**. Full stack integration test. Verify end-to-end flow. | Scoring calibration check. Verify composite scores match expected ranges. | Claude output accuracy check. Verify recommended quantities are specific. | Language toggle (EN/HI/KN). Connect state from Dashboard to Recommendations. |

### Hours 12–15: Polish & Demo Prep

| Hour | Backend & Data Engineer | Risk Scoring Engineer | AI Integration Engineer | Frontend Engineer |
|------|----------------------|---------------------|----------------------|-------------------|
| **13** | Performance optimization. Ensure response <3s. Add rate limiting. | Risk score explanation text (for demo). Add "why this score" context. | Add primary concern summary to output. Ensure all recommendations have cost estimates. | Voice readout button with Web Speech API (Kannada). Test TTS playback. |
| **14** | **CHECKPOINT: END-TO-END**. Full flow test: Input → Dashboard → Recommendations. Verify all 3 languages display. | Scoring engine ready. Risk explanation ready. | Recommendations ready in all languages. Fallback ready. | Mobile responsiveness check. Test on 375px viewport. |
| **15** | Buffer: Fix critical bugs only. Ensure /health returns healthy. | Buffer: Calibrate edge cases. | Buffer: Fix any Claude response issues. | Buffer: Fix mobile UI issues. Touch target verification. |

### Hours 15–18: Demo & Wrap-Up

| Hour | Backend & Data Engineer | Risk Scoring Engineer | AI Integration Engineer | Frontend Engineer |
|------|----------------------|---------------------|----------------------|-------------------|
| **16** | Final backend testing. Create demo scenario data (Dharwad, Ragi, vegetative, high drought). | Demo scenario preparation (run scoring, show intermediate values). Prepare to explain algorithm. | Demo scenario recommendations (pre-generated, cached). Prepare fallback voice messages. | Demo walkthrough rehearsal. Take screenshots for presentation. |
| **17** | **BUFFER FOR ISSUES**. Stay online for fixes. | **BUFFER FOR ISSUES**. Stay online for fixes. | **BUFFER FOR ISSUES**. Stay online for fixes. | **BUFFER FOR ISSUES**. Stay online for fixes. Final visual polish. |
| **18** | Demo support. Present backend architecture. | Demo support. Present scoring algorithm. | Demo support. Present AI/prompt layer. | **FINAL PRESENTATION**. Demo the full user flow. |

---

## 2. Dependency Map

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              CRITICAL PATH                                           │
│                                                                                   │
│  Backend Engineer ─────┐                                                           │
│       │                │                                                           │
│       ▼                │     Risk Scoring Engineer                                │
│  /api/analyze ◄────────┤         │                                                  │
│       │                │         ▼                                                  │
│       │                │  riskEngine.calculate() ◄─── cropKB.getWeight()           │
│       ▼                │         │                                                  │
│  weather + NDVI ◄──────┴────────┘                                                  │
│       │                                                                      │
│       ▼                                                                      │
│  /api/recommend ◄─────────────► Claude API (AI Engineer)                            │
│                                         │                                        │
│                                         ▼                                        │
│                              recommendations ◄────────────                          │
│                                         │                                        │
└─────────────────────────────────────────┼────────────────────────────────────────┘
                                          ▼
                              Frontend Engineer ◄──────► Display
                                    (All flow)
```

### What Blocks What

| Blocker | Blocked By | Blocked Item | Mitigation |
|--------|-----------|-------------|------------|
| Crop knowledge base | — | Risk weights loading | Pre-load from JSON at start |
| Weather API integration | — | /api/analyze | Mock data on API failure |
| NDVI data | Weather service | Risk scoring | Use weather proxy |
| Scoring algorithm | Crop KB + Weather | Composite score | Simplified formula |
| Claude API | Risk payload | /recommend | Template fallback |
| Frontend | Backend API | Full flow test | Mock responses |
| Language toggle | Claude + State | Recommendations page | Pre-translate |
| Voice readout | Web Speech API | Kannada TTS | Text-only fallback |

### Parallel Workstreams

```
WORKSTREAM A (Backend)          WORKSTREAM B (Scoring)         WORKSTREAM C (AI)           WORKSTREAM D (Frontend)
─────────────────────────      ──────────────────────────      ────────────────────      ─────────────────────────
Hour 0-3: Setup               Hour 0-3: KB Setup            Hour 0-3: Prompt           Hour 0-3: React Setup
Hour 3-6: Weather+NDVI        Hour 3-6: Drought calc        Hour 3-6: API stub         Hour 3-6: Form flow
Hour 6-9: /analyze            Hour 6-9: Pest+Nutrient       Hour 6-9: Full endpoint    Hour 6-9: Dashboard UI
Hour 9-12: Integration        Hour 9-12: Calibration      Hour 9-12: Output testing   Hour 9-12: Charts, Recs
Hour 12-15: Polish           Hour 12-15: Debug          Hour 12-15: Polish         Hour 12-15: Voice, Mobile
Hour 15-18: Demo support     Hour 15-18: Demo support  Hour 15-18: Demo support   Hour 15-18: Final demo
```

---

## 3. Integration Checkpoints

### Checkpoint 1: Hour 8 — Core Data Flow

```
COMPLETE:
☑ Express server running on port 3000
☑ GET /api/crops returns 10 crops
☑ GET /api/districts returns searchable list
☑ GET /api/analyze returns weather + NDVI + risk scores
☑ Three-channel risk scoring working (drought/pest/nutrient)
☑ Composite score 0-100 with correct weights
☑ Frontend InputWizard form complete (3 steps)
☑ React Router navigation working

TEST SCENARIO:
Input: District=Dharwad, Crop=Ragi, Stage=vegetative
Expected: Returns risk scores for all 3 channels + composite

BLOCKERS AT CHECKPOINT 1:
- If weather API fails → Use mock data
- If NDVI unavailable → Use historical average
- If scoring returns NaN → Use fallback 50/100
```

### Checkpoint 2: Hour 14 — Full Stack Integration

```
COMPLETE:
☑ /api/recommend returns Claude-generated recommendations
☑ 3 languages (EN/HI/KN) in output
☑ Quantity-aware recommendations (kg, liters, timing)
☑ Frontend displays score gauge with color coding
☑ Frontend displays 3 channel bars
☑ Frontend displays 7-day forecast chart
☑ Recommendations page with cards and urgency badges
☑ Language toggle switches all content
☑ Voice readout button functional

TEST SCENARIO:
Complete flow: District → Crop → Stage → Analyze → View Recommendations → Toggle Language → Voice Readout

BLOCKERS AT CHECKPOINT 2:
- If Claude fails → Use template fallbackTier 4
- If voice fails → Show text only
- If language missing → Fallback to English
```

---

## 4. Risk Register

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|------|-----------|-------|------------|-------|
| 1 | **External API unavailability** (Open-Meteo/Claude down) | Medium | Critical | Cache responses; Use mock data; Template fallback | Backend |
| 2 | **NDVI data latency** (>14 days old) | High | Low | Show data freshness indicator; Use weather proxy; | Backend |
| 3 | **Claude JSON output parsing fails** | Medium | High | Validate with Zod; Add try-catch; Use template fallback | AI |
| 4 | **Frontend integration issues** (API response mismatch) | Medium | High | Define shared TypeScript types; Mock responses; | Frontend |
| 5 | **Mobile responsiveness problems** | Low | Medium | Design mobile-first from start; Test on 375px; | Frontend |

### Top 5 Mitigations Summary

1. **All external APIs cache for 6-12 hours** — Prevents demo failure if APIs go down mid-presentation
2. **Template fallback (Tier 4) ready** — If Claude fails, show pre-generated recommendations
3. **Shared TypeScript types** — Backend and Frontend use same interfaces
4. **Mock data for all API responses** — Can demo without any external calls
5. **Demo scenario pre-generated** — Input= Dharwad/Ragi/vegetative cached

---

## 5. Demo Script Outline

### Demo Setup (Pre-Demo)

- [ ] Laptop connected to projector
- [ ] Browser open at FasalRakshak home page
- [ ] Postman/curl ready for backend verification (optional)
- [ ] Network: Use cached responses OR local mock

### Demo Script (5–7 minutes)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ DEMO SCRIPT — FasalRakshak                                 │
│ Presenter: Frontend Engineer                              │
│ Time: ~5 minutes                                      │
└────────────────────────────────────────────────────────────────────────────┘

[OPENING — 30 seconds]
─────────────────────────────────────────────
"Ladies and gentlemen, presenting FasalRakshak — a hyper-local 
crop failure predictor for Indian farmers."

[INPUT FLOW — 1.5 minutes]
─────────────────────────────────────────────
1. Open app → Show landing page in Kannada + English
2. Click "Get Started" → District selector
3. Type "Dharwad" → Select district
4. Click "Next" → Crop grid appears
5. Select "Ragi" (finger millet) → Show crop icon
6. Click "Next" → Growth stage list
7. Select "Vegetative Growth" → Show stage info
8. Click "Analyze" → Loading animation

[RISK DASHBOARD — 1.5 minutes]
─────────────────────────────────────────────
"SYSTEM IS ANALYZING..."

1. Composite score appears: 38/100 (RED gauge)
2. "Composite score is critically low — let's see why"
3. Show 3 channel bars:
   - Drought Stress: 82/100 (HIGH, red bar)
   - Pest Pressure: 28/100 (LOW, green bar)
   - Nutrient Deficiency: 45/100 (MODERATE, yellow bar)
4. "Drought is the main concern — no rainfall in 14 days"
5. Show 7-day forecast: "Drought risk stays high entire week"

[RECOMMENDATIONS — 1.5 minutes]
─────────────────────────────────────────────
"Based on this analysis, here are specific actions..."

1. Click "View Recommendations" → Recommendations page loads
2. Show 3 recommendation cards:
   - Card 1: "Immediate Irrigation" (urgency: immediate)
   - Card 2: "Apply Urea in 5 days" (urgency: within3days) 
   - Card 3: "Monitor crop daily" (urgency: thisweek)
3. Show cost estimate: "Total: ₹360/acre"
4. Toggle language: English → Hindi → Kannada
   - Show Hindi: "तुरंत सिंचाई..."
   - Show Kannada: "ತಕ್ಷಣ ನೀರಾವರಿ..."
5. Click voice button → "Listen in Kannada"
   - Audio plays: "ತಕ್ಷಣ ನೀರಾವರಿ ಮಾಡಿ..."

[CLOSING — 30 seconds]
─────────────────────────────────────────────
"Six crore Indian farmers lose thousands of crores annually to 
preventable crop failures. FasalRakshak gives them the 
data-driven insights they need — in their language, 
on their phone."

"Thank you. Questions?"
```

### Backup Demo (If Tech Fails)

- Show pre-generated screenshots
- Show Postman API responses
- Show Claude API output JSON

---

## 6. Definition of Done — MVP

### Functional Requirements

| # | Requirement | Done |
|---|-------------|------|
| F1 | District selection (searchable dropdown, 50+ districts) | ☐ |
| F2 | Crop selection (10 crops with icons) | ☐ |
| F3 | Growth stage selection (5-6 stages per crop) | ☐ |
| F4 | POST /api/analyze returns weather + NDVI + risk scores | ☐ |
| F5 | Three-channel risk scoring (drought/pest/nutrient) | ☐ |
| F6 | Composite health score 0-100 with gauge display | ☐ |
| F7 | 7-day risk forecast chart | ☐ |
| F8 | POST /api/recommend returns 3-5 recommendations | ☐ |
| F9 | Recommendations include quantities + timing | ☐ |
| F10 | Multi-language output (EN/HI/KN) | ☐ |
| F11 | Language toggle switches all content | ☐ |
| F12 | Voice readout in Kannada (Web Speech API) | ☐ |

### Technical Requirements

| # | Requirement | Done |
|---|-------------|------|
| T1 | Response time <10 seconds end-to-end | ☐ |
| T2 | Mobile responsive (375px+) | ☐ |
| T3 | Touch targets ≥44px | ☐ |
| T4 | Cached data for offline demo | ☐ |
| T5 | Error handling with user messages | ☐ |
| T6 | /health endpoint returns status | ☐ |

### Visual Requirements

| # | Requirement | Done |
|---|-------------|------|
| V1 | Score gauge with color coding (green/yellow/red) | ☐ |
| V2 | Three progress bars with channel labels | ☐ |
| V3 | Recommendation cards with urgency badges | ☐ |
| V4 | Progress indicator in InputWizard | ☐ |
| V5 | Loading states for all async operations | ☐ |

### Minimum Viable Demo Requirements

- [ ] Can select District, Crop, Stage
- [ ] Can see risk score and 3 channels
- [ ] Can see 7-day forecast
- [ ] Can see 3 recommendations with quantities
- [ ] Can toggle language
- [ ] Can play voice in Kannada

---

## 7. Buffer Time Allocation

| Hour Block | Buffer | Purpose |
|-----------|--------|---------|
| Hours 0-8 | 0 hrs | Building core — no buffer |
| Hours 8-14 | 1 hr | Integration issues |
| Hours 14-18 | 2 hrs | Polish + demo prep |

**Total Buffer: ~3 hours across 18-hour sprint**

---

## 8. Critical Path — Single Point of Failure

### **THE SINGLE MOST CRITICAL PATH ITEM:**

┌─���─���────────────────────────────────────────────────────────────────────────┐
│                                                      │
│   Risk Scoring Algorithm (Member 2)                   │
│                                                      │
│   If scoring fails → ALL downstream breaks:            │
│   • /api/analyze returns garbage                   │
│   • Claude gets wrong input                        │
│   • Recommendations are meaningless                 │
│   • Entire demo fails                            │
│                                                      │
└────────────────────────────────────────────────────────────────────────────┘

### Why This is Critical

1. Downstream of every data source (weather, NDVI)
2. Input to Claude API — wrong scores = wrong recommendations
3. The "magic" that makes FasalRakshak valuable
4. Judges will evaluate risk scoring accuracy

### Mitigation (Already in Plan)

- [ ] Crop knowledge base loaded from JSON at hour 1
- [ ] Fallback values: if scoring NaN → return 50/100
- [ ] Pre-defined test scenario validated at hour 7
- [ ] Member 2 stays online through entire demo

### If Member 2 Gets Stuck

- Backup: Use simplified scoring (average of 3 inputs)
- Fallback: Mock scores with realistic values
- Manual: Pre-calculate demo scenario scores

---

## Appendix: Quick Reference

### Key Timepoints

| Hour | Milestone | Owner |
|------|----------|--------|
| 0 | Project setup | All |
| 3 | Basic endpoints + React form | Backend + Frontend |
| 8 | **CHECKPOINT 1** — Core data flow | All |
| 14 | **CHECKPOINT 2** — Full stack | All |
| 18 | Demo complete | All |

### Demo Scenario

```
District: Dharwad, Karnataka
Crop: Ragi (Finger Millet)
Growth Stage: Vegetative
Risk Scores: Drought 82, Pest 28, Nutrient 45 → Composite 38
Weather: No rain 14 days, High temp 36°C, Humidity 35%
Recommendations: 3 (irrigation + fertilizer + monitoring)
```

### Emergency Contacts

- Team group chat for blocking issues
- Use screen share if stuck

---

*Document Version: 1.0*  
*Last Updated: April 23, 2026*  
*Sprint Lead: Team Lead*