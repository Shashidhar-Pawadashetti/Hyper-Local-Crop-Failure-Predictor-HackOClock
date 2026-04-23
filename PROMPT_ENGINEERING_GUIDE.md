# Prompt Engineering Guide — FasalRakshak AI Recommendation Layer

**Version:** 1.0  
**Date:** April 23, 2026  
**Model:** Claude Sonnet 4 (claude-sonnet-4-20250514)  
**Provider:** Anthropic API

---

## Table of Contents

1. [System Prompt](#1-system-prompt)
2. [User Message Template](#2-user-message-template)
3. [Output Format Specification](#3-output-format-specification)
4. [Worked Examples](#4-worked-examples)
5. [Prompt Tuning Guidelines](#5-prompt-tuning-guidelines)
6. [Fallback Strategy](#6-fallback-strategy)
7. [Token and Cost Estimates](#7-token-and-cost-estimates)

---

## 1. System Prompt

```text
You are an agricultural expert AI assistant for FasalRakshak, a crop failure prediction system used by small and marginal farmers in India. Your role is to generate actionable, quantity-aware recommendations that help farmers protect their crops during the growing season.

## Core Principles

1. **Actionable Specificity**: Every recommendation must include specific quantities (e.g., "15 kg/acre", "2 liters/sq meter"), timing (e.g., "today", "within 48 hours", "after next rain"), and estimated cost in INR.

2. **Language Accessibility**: Recommendations are output in three languages — English, Hindi (Devanagari), and Kannada (Kannada script). Use simple language appropriate for farmers with primary-level education (Grade 5 reading level).

3. **Safety First**: Never recommend pesticide or chemical application during flowering if it may harm pollinators. Always suggest protective equipment. If unsure about chemical quantities, recommend consulting local agricultural extension officers.

4. **Cultural Context**: Consider local farming practices in Karnataka, Maharashtra, Gujarat, Punjab, Haryana, Tamil Nadu, and Andhra Pradesh. Recommend only readily available inputs.

5. **Conservative Estimates**: Provide cost estimates that err on the side of being higher rather than lower. Farmers have limited budgets.

6. **Sequential Actions**: When multiple interventions are needed, prioritize in the order they should be performed. Critical interventions first.

## Risk Channel Definitions

- **Drought Stress (0–100)**: Based on precipitation deficit, soil moisture, evapotranspiration, and NDVI decline. Higher = more urgent irrigation need.
- **Pest Pressure (0–100)**: Based on weather conditions favorable to pests, humidity, temperature, and historical outbreaks. Higher = more urgent pest control need.
- **Nutrient Deficiency (0–100)**: Based on NDVI below crop-specific thresholds and nutrient leaching from excess rain. Higher = more urgent fertilizer need.

## Composite Health Score

- **70–100**: Healthy — Continue current practices, monitor weekly.
- **40–69**: At Risk — Review recommendations, take at least one intervention.
- **0–39**: Critical — Immediate intervention required, prioritize actions.

## Input Data Structure

You will receive a JSON object with:
- Crop name and variety (if known)
- District and state
- Growth stage
- Risk scores (drought, pest, nutrient, composite)
- 7-day weather summary
- NDVI value and delta from baseline
- Soil type (clay/sandy/loam/silty)

## Output Requirements

1. Output ONLY valid JSON — no explanatory text, no markdown code blocks.
2. Each recommendation must have: type, urgency, action, and reason.
3. Reason must be one sentence, plain language, Grade 5 reading level.
4. Provide recommendations in all three languages (kn, hi, en).
5. Always include estimated cost in INR where applicable.
6. Maximum 5 recommendations per language — prioritize by urgency.

## Prohibited Content

- Do NOT recommend specific brand names (use generic names: "urea" not "Urea-N").
- Do NOT recommend application during active flowering if using pesticides.
- Do NOT recommend inputs that require specialized equipment most farmers don't have.
- Do NOT make definitive disease diagnoses — recommend visiting a Krishi Vigyan Kendra.
- Do NOT recommend expensive inputs that could create financial hardship.

## Tone and Voice

- Direct and practical: "Apply X" not "Consider applying X."
- Reassuring but serious: Don't minimize risk, but don't cause alarm.
- Localized: Use local crop names and farming terminology.
- Respectful of traditional knowledge: Frame recommendations as complementary to farmer experience.
```

---

## 2. User Message Template

```json
{
  "prompt": "Generate crop recommendations for a {crop_name} farmer in {district}, {state}. Crop is in {growth_stage} stage. Weather forecast for next 7 days: temperature range {min_temp}°C to {max_temp}°C, total rainfall: {rainfall_mm}mm, average humidity: {humidity}%. Current NDVI: {ndvi_value} (baseline delta: {ndvi_delta}). Soil type: {soil_type}. Risk scores: drought {drought_score}/100, pest {pest_score}/100, nutrient {nutrient_score}/100, composite {composite_score}/100. Output JSON with kannada, hindi, english recommendations.",
  "temperature": 0.3,
  "max_tokens": 2000
}
```

### Full User Message (Template with Substitution)

```
Generate crop recommendations in JSON format with kannada, hindi, and english fields.

Crop: {crop_name}
District: {district}, {state}
Growth Stage: {growth_stage}

Risk Scores:
- Drought Stress: {drought_score}/100
- Pest Pressure: {pest_score}/100
- Nutrient Deficiency: {nutrient_score}/100
- Composite Health: {composite_score}/100

Weather (7-day forecast):
- Temperature: {min_temp}°C to {max_temp}°C
- Total Rainfall: {rainfall_mm}mm
- Average Humidity: {humidity}%

NDVI:
- Current Value: {ndvi_value}
- Delta from Baseline: {ndvi_delta}

Soil Type: {soil_type}

Output JSON structure:
{
  "kannada": [
    {
      "type": "irrigation|fertilizer|pesticide|monitoring|other",
      "urgency": "immediate|within3days|thisweek",
      "action": "specific instruction with quantities and timing",
      "reason": "one sentence explanation"
    }
  ],
  "hindi": [...],
  "english": [...]
}

Prioritize by urgency. Each recommendation must have quantities where applicable. Include estimated cost in INR.
```

---

## 3. Output Format Specification

### JSON Schema

```typescript
interface Recommendation {
  type: 'irrigation' | 'fertilizer' | 'pesticide' | 'monitoring' | 'other';
  urgency: 'immediate' | 'within3days' | 'thisweek';
  action: string;      // Specific instruction with quantity + timing
  reason: string;     // One sentence, Grade 5 reading level
}

interface LanguageGroup {
  recommendations: Recommendation[];
  estimatedCostINR?: number;  // Total estimated cost for all recommendations
  primaryConcern: string;      // Main risk to address
}

interface Output {
  kannada: LanguageGroup;
  hindi: LanguageGroup;
  english: LanguageGroup;
  metadata: {
    crop: string;
    district: string;
    state: string;
    growthStage: string;
    compositeScore: number;
    generatedAt: string;  // ISO 8601
    model: string;        // Model used
  };
}
```

### Example Output

```json
{
  "kannada": {
    "recommendations": [
      {
        "type": "irrigation",
        "urgency": "immediate",
        "action": "ಇಂದು ಮತ್ತು ನಾಳೆ ಬೆಳಗ್ಗೆ ಪ್ರತಿ ಚದರ ಮೀಟರ್‌ಗೆ 2 ಲೀಟರ್ ನೀರು ಹಾಕಿ",
        "reason": "ಮಣ್ಣಿನ ತೇವಾಂಶವು ತುಂಬಾ ಕಡಿಮೆ ಇದೆ, ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿಲ್ಲ."
      },
      {
        "type": "fertilizer",
        "urgency": "within3days",
        "action": "ಮುಂದಿನ ಮಳೆಯ 5 ದಿನಗಳ ನಂತರ 15 ಕಿಲೋಗ್ರಾಂ/ಎಕರೆ ಯೂರಿಯಾ ಹಾಕಿ",
        "reason": "ಸಸಿ ಬೆಳವಣಿಗೆ ಸಮಯದಲ್ಲಿ ನೈಟ್ರೋಜನ್ ಅಗತ್ಯವಿದೆ."
      }
    ],
    "estimatedCostINR": 860,
    "primaryConcern": "ಬರಗಾಲದ ಒತ್ತಡ"
  },
  "hindi": { ... },
  "english": { ... },
  "metadata": {
    "crop": "ragi",
    "district": "Dharwad",
    "state": "Karnataka",
    "growthStage": "vegetative",
    "compositeScore": 52,
    "generatedAt": "2026-04-23T10:30:15.000Z",
    "model": "claude-sonnet-4-20250514"
  }
}
```

### Field Constraints

| Field | Constraint |
|-------|------------|
| `type` | One of: irrigation, fertilizer, pesticide, monitoring, other |
| `urgency` | One of: immediate, within3days, thisweek |
| `action` | Must include quantity (e.g., "15 kg", "2 liters") where applicable |
| `action` | Must include timing (e.g., "today", "within 48 hours", "after next rain") |
| `reason` | Maximum 25 words |
| `reason` | No technical jargon — explain like speaking to a Grade 5 student |

---

## 4. Worked Examples

### Example 1: High Drought Stress — Ragi in Karnataka

**Input:**

```json
{
  "crop_name": "Ragi (Finger Millet)",
  "district": "Dharwad",
  "state": "Karnataka",
  "growth_stage": "vegetative",
  "drought_score": 82,
  "pest_score": 28,
  "nutrient_score": 45,
  "composite_score": 38,
  "min_temp": 24,
  "max_temp": 36,
  "rainfall_mm": 0,
  "humidity": 35,
  "ndvi_value": 0.52,
  "ndvi_delta": -0.15,
  "soil_type": "red_clay"
}
```

**Expected Output:**

```json
{
  "kannada": {
    "recommendations": [
      {
        "type": "irrigation",
        "urgency": "immediate",
        "action": "ತಕ್ಷಣ ನೀರಾವರಿ ಮಾಡಿ. ಪ್ರತಿ ಚದರ ಮೀಟರ್‌ಗೆ 2 ಲೀಟರ್ ನೀರು ಹಾಕಿ. ನಾಳೆ ಬೆಳಗ್ಗೆ ಮತ್ತೆ ನೀರಾವರಿ ಮಾಡಿ.",
        "reason": "ಮಣ್ಣು ಬಹಳ ಒಣಗಿದೆ, ಸಸಿ ಸಾಯುವ ಅಪಾಯವಿದೆ."
      },
      {
        "type": "fertilizer",
        "urgency": "within3days",
        "action": "ಮಳೆ ಬಂದ 5 ದಿನಗಳ ನಂತರ ಎಕರೆಗೆ 15 ಕಿಲೋಗ್ರಾಂ ಯೂರಿಯಾ ಹಾಕಿ.",
        "reason": "ಈ ಹಂತದಲ್ಲಿ ಸಸಿಗೆ ನೈಟ್ರೋಜನ್ ಬಹಳ ಅಗತ್ಯ."
      },
      {
        "type": "monitoring",
        "urgency": "thisweek",
        "action": "ಪ್ರತಿ ದಿನ ಬೆಳಿಗ್ಗೆ ಬೆಳೆ ತಪಾಸಿಸಿ. ಎಲೆಗಳ ಬಣ್ಣ ಹಳಿಯದಿದ್ದರೆ ತುಂಬಾ ಕಡಿಮೆ ಬರಗಾಲ ಎಂದು ತಿಳಿಯಿರಿ.",
        "reason": "ಸತತ ತಪಾಸಣೆಯಿಂದ ಸಮಸ್ಯೆ ಮೊದಲೇ ತಿಳಿಯಬಹುದು."
      }
    ],
    "estimatedCostINR": 360,
    "primaryConcern": "ಬರಗಾಲದ ಒತ್ತಡ — ತಕ್ಷಣ ನೀರಾವರಿ ಅಗತ್ಯ"
  },
  "hindi": {
    "recommendations": [
      {
        "type": "irrigation",
        "urgency": "immediate",
        "action": "तुरंत सिं���ा��� करें। प्रति वर्ग मीटर 2 लीटर पानी लगाएं। कल सुबह दोबारा सिंचाई करें।",
        "reason": "मिट्टी बहुत सूखी है और फसल के मरने का खतरा है।"
      },
      {
        "type": "fertilizer",
        "urgency": "within3days",
        "action": "अगली बारिश के 5 दिन बाद प्रति एकड़ 15 किलो यूरिया टॉप ड्रेसिंग करें।",
        "reason": "वानस्पतिक चरण में पौधे को नाइट्रोजन की जरूरत होती है।"
      },
      {
        "type": "monitoring",
        "urgency": "thisweek",
        "action": "हर सुबह फसल की जांच करें। पत्तियों का रंग पीला हो तो समझें कि तनाव है।",
        "reason": "नियमित जांच से समस्या जल्दी पकड़ में आती है।"
      }
    ],
    "estimatedCostINR": 360,
    "primaryConcern": "सूखे का तनाव — तुरंत सिंचाई जरूरी"
  },
  "english": {
    "recommendations": [
      {
        "type": "irrigation",
        "urgency": "immediate",
        "action": "Irrigate immediately. Apply 2 liters of water per square meter. Repeat irrigation tomorrow morning.",
        "reason": "Soil is very dry and the crop is at risk of dying."
      },
      {
        "type": "fertilizer",
        "urgency": "within3days",
        "action": "Apply urea 15 kg/acre 5 days after next rainfall event.",
        "reason": "The crop needs nitrogen during the vegetative growth stage."
      },
      {
        "type": "monitoring",
        "urgency": "thisweek",
        "action": "Check the crop every morning. Yellow leaves mean the plant is under stress.",
        "reason": "Regular checking helps catch problems early."
      }
    ],
    "estimatedCostINR": 360,
    "primaryConcern": "Drought stress — irrigation needed immediately"
  },
  "metadata": {
    "crop": "ragi",
    "district": "Dharwad",
    "state": "Karnataka",
    "growthStage": "vegetative",
    "compositeScore": 38,
    "generatedAt": "2026-04-23T10:30:15.000Z",
    "model": "claude-sonnet-4-20250514"
  }
}
```

---

### Example 2: High Pest Pressure — Cotton in Gujarat

**Input:**

```json
{
  "crop_name": "Cotton",
  "district": "Ahmedabad",
  "state": "Gujarat",
  "growth_stage": "boll_formation",
  "drought_score": 35,
  "pest_score": 78,
  "nutrient_score": 42,
  "composite_score": 45,
  "min_temp": 28,
  "max_temp": 38,
  "rainfall_mm": 12,
  "humidity": 72,
  "ndvi_value": 0.65,
  "ndvi_delta": -0.08,
  "soil_type": "black_cotton"
}
```

**Expected Output (abbreviated):**

```json
{
  "kannada": {
    "recommendations": [
      {
        "type": "pesticide",
        "urgency": "immediate",
        "action": "ತಕ್ಷಣ ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ 0.3 ಮಿ.ಲೀ./ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಹಾಕಿ ಸಿಂಡಿಕೇಟ್ ಮಾಡಿ. ಹೂ ಬಿಡುವ ಸಮಯದಲ್ಲಿ ಮಾಡಬದ್ರಿ ಬಿಟ್ಟಿರಿ.",
        "reason": "ಸಿಂಡಿಕೇಟ್ ಸಮಯದಲ್ಲಿ ಕೀಟನಾಶಕಗಳು ಚಿಟ್ಟೆಗಳಿಗೆ ಹಾನಿ ಮಾಡಬಹುದು."
      },
      {
        "type": "monitoring",
        "urgency": "immediate",
        "action": "ಈಗಲೇ ಬೆಳೆಯನ್ನು ತಪಾಸಿಸಿ. ಎಲೆಗಳ ಕೆಳಭಾಗದಲ್ಲಿ ಚಿಟ್ಟೆಗಳು ಇದೆಯೇ ನೋಡಿ.",
        "reason": "ಬೇಗನೆ ಕೀಟ ಪತ್ತೆ ಮಾಡಿದರೆ ನಿಯಂತ್ರಣ ಸುಲಭ."
      }
    ],
    "estimatedCostINR": 450,
    "primaryConcern": "ಕೀಟಗಳ ಒತ್ತಡ — ತಕ್ಷಣ ಕ್ರಮ ಬೇಕು"
  }
  // ... hindi and english similar
}
```

---

### Example 3: Nutrient Deficiency — Wheat in Punjab

**Input:**

```json
{
  "crop_name": "Wheat",
  "district": "Ludhiana",
  "state": "Punjab",
  "growth_stage": "jointing",
  "drought_score": 25,
  "pest_score": 32,
  "nutrient_score": 72,
  "composite_score": 48,
  "min_temp": 8,
  "max_temp": 18,
  "rainfall_mm": 45,
  "humidity": 65,
  "ndvi_value": 0.48,
  "ndvi_delta": -0.18,
  "soil_type": "alluvial"
}
```

**Expected Output (abbreviated):**

```json
{
  "english": {
    "recommendations": [
      {
        "type": "fertilizer",
        "urgency": "immediate",
        "action": "Apply urea 45 kg/acre as top dressing today or tomorrow.",
        "reason": "NDVI is low and the crop needs nitrogen now for stem growth."
      },
      {
        "type": "fertilizer",
        "urgency": "within3days",
        "action": "Apply DAP (Di-Ammonium Phosphate) 25 kg/acre for phosphorus.",
        "reason": "Jointing stage needs phosphorus for strong stem development."
      },
      {
        "type": "monitoring",
        "urgency": "thisweek",
        "action": "Check leaves for yellowing between veins, which means nitrogen is needed.",
        "reason": "Leaf color tells you if more fertilizer is needed."
      }
    ],
    "estimatedCostINR": 1850,
    "primaryConcern": "Nutrient deficiency — urgent fertilizer needed"
  }
  // ... hindi and kannada similar
}
```

---

## 5. Prompt Tuning Guidelines

### 5.1 Temperature Setting

| Scenario | Temperature | Rationale |
|----------|-------------|-----------|
| Normal operations | 0.3 | Balanced creativity and reliability |
| High-stakes (low composite score <40) | 0.2 | More conservative, focused output |
| Complex cases (multiple risk channels) | 0.4 | Slightly more creative for diverse recommendations |

### 5.2 Max Tokens

| Composite Score | Max Tokens | Notes |
|----------------|------------|-------|
| 70–100 | 800 | Fewer interventions likely needed |
| 40–69 | 1200 | Moderate interventions |
| 0–39 | 2000 | Full response with 4–5 recommendations |

### 5.3 System Prompt Iteration Log

| Version | Change | Impact |
|---------|--------|--------|
| 1.0 | Initial prompt | Baseline |
| 1.1 | Added "no brand names" rule | Eliminated product endorsement |
| 1.2 | Added "no pesticides during flowering" | Safety rule added |
| 1.3 | Added cost estimates in INR | More actionable |
| 1.4 | Added Grade 5 reading level requirement | Better accessibility |

### 5.4 Tuning Triggers

If you observe any of the following, tune the prompt:

| Symptom | Likely Cause | Fix |
|---------|------------|-----|
| Recommendations lack quantities | Action field too vague | Add "must include quantities" to instructions |
| Responses too long | No word limit | Add "maximum 25 words per reason" |
| Technical jargon used | Tone too academic | Add "explain like speaking to a farmer" |
| No cost estimates | Not emphasized | Add "always include estimated cost in INR" |
| Pesticides recommended during flowering | Safety not emphasized | Add explicit flowering prohibition |

### 5.5 A/B Testing Guidance

Run A/B tests when:

1. Introducing new recommendation types (e.g., biological pest control)
2. Supporting new crop types
3. Expanding to new regions
4. Adding new languages

**Test variables:**
- System prompt wording
- Example quality and relevance
- Temperature setting
- Max token count

**Success metrics:**
- Quantities included (target: >95%)
- Actionability score (target: >4.0/5.0)
- Language accuracy (target: >98%)
- User-reported usefulness (target: >4.0/5.0)

---

## 6. Fallback Strategy

### 6.1 Fallback Tiers

```
┌──────────────────────────────────────────────────────────────┐
│                    FALLBACK HIERARCHY                        │
├──────────────────────────────────────────────────────────────┤
│ Tier 1: Claude API (Primary)                                 │
│   - Model: claude-sonnet-4-20250514                         │
│   - Temperature: 0.3                                        │
│   - Max tokens: 2000                                        │
├──────────────────────────────────────────────────────────────┤
│ Tier 2: Claude API Retry (Same model, retry once)            │
│   - Delay: 2 seconds                                        │
│   - Timeout: 30 seconds                                     │
├───────���─���────────────────────────────────────────────────────┤
│ Tier 3:Claude API (Haiku fallback)                          │
│   - Model: claude-3-haiku-20240307                         │
│   - Keep system prompt, shorter max_tokens                  │
│   - Only if Sonnet fails                                    │
├──────────────────────────────────────────────────────────────┤
│ Tier 4: Template-Based Fallback (Rule-based)                │
│   - Use hardcoded templates by risk level                    │
│   - No AI generation                                        │
│   - Show "AI recommendations unavailable" warning            │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Template-Based Fallback (Tier 4)

```typescript
const TEMPLATE_RECOMMENDATIONS = {
  high_drought: {
    kannada: [
      {
        type: "irrigation",
        urgency: "immediate",
        action: "ತಕ್ಷಣ ನೀರಾವರಿ ಮಾಡಿ. ಪ್ರತಿ ಚದರ ಮೀಟರ್‌ಗೆ 2 ಲೀಟರ್ ನೀರು ಹಾಕಿ.",
        reason: "ಬರಗಾಲದ ಒತ್ತಡವು ಹೆಚ್ಚಾಗಿದೆ."
      }
    ],
    hindi: [
      {
        type: "irrigation",
        urgency: "immediate", 
        action: "तुरंत सिंचाई करें। प्रति वर्ग मीटर 2 लीटर पानी लगाएं।",
        reason: "सूखे का तनाव बहुत अधिक है।"
      }
    ],
    english: [
      {
        type: "irrigation",
        urgency: "immediate",
        action: "Irrigate immediately. Apply 2 liters of water per square meter.",
        reason: "Drought stress is critically high."
      }
    ]
  },
  high_pest: {
    // ... similar structure
  },
  high_nutrient: {
    // ... similar structure
  },
  critical_composite: {
    // ... combines all three
  }
};
```

### 6.3 Error Handling Code

```typescript
async function generateRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
  try {
    // Tier 1: Primary API call
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: formatUserMessage(input)
      }]
    });
    
    return parseResponse(response);
    
  } catch (error: any) {
    if (error?.type === 'rate_limit' || error?.status === 429) {
      // Tier 2: Retry after delay
      await sleep(2000);
      return retryWithExponentialBackoff(input, 1);
    }
    
    if (error?.type === 'api_error' || error?.status >= 500) {
      // Tier 3: Try Haiku fallback
      return useHaikuFallback(input);
    }
    
    // Tier 4: Template fallback
    console.warn('AI recommendations unavailable, using template fallback');
    return useTemplateFallback(input);
  }
}
```

### 6.4 User-Facing Error Messages

| Error | English | Hindi | Kannada |
|-------|----------|-------|---------|
| API timeout | "Service temporarily busy. Please try again in a minute." | "सेवा अभी व्यस्त है। कृपया एक मिनट में पुनः प्रयास करें।" | "ಸೇವೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿಲ್ಲ. ದಯವಿಟ���ಟ��� ಒಂದು ನಿಮಿಷದಲ್ಲಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." |
| Rate limit | "Too many requests. Please wait 30 seconds." | "बहुत सारे अनुरोध हैं। कृपया 30 सेकंड प्रतीक्षा करें।" | "ಹೆಚ್ಚಿನ ವಿನಂತಿಗಳು. 30 ಸೆಕೆಂಡ್ ನಂತರ ಪ್ರಯತ್ನಿಸಿ." |
| Full failure | "Unable to generate AI recommendations. Showing general guidance." | "AI सिफारिशें उत्पन्न करने में असमर्थ। सामान्य मार्गदर्शन दिखा रहे हैं।" | "AI ಶಿಫಾರಸುಗಳನ್ನು ರಚಿಸಲಾಗಲ್ಲ. ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನ ತೋರಿಸಲಾಗುತ್ತದೆ." |

---

## 7. Token and Cost Estimates

### 7.1 Token Breakdown

| Component | Approximate Tokens |
|-----------|-------------------|
| System prompt | ~800 tokens |
| User message (with data) | ~300 tokens |
| Output (3 languages × 4 recommendations) | ~600 tokens |
| **Total per request** | **~1,700 tokens** |

### 7.2 Cost Calculation

```
Pricing (Claude Sonnet 4):
- Input: $3.00 per million tokens
- Output: $15.00 per million tokens

Calculation:
- Input tokens: 800 + 300 = 1,100
- Output tokens: 600

Cost = (1,100 × $3.00 / 1,000,000) + (600 × $15.00 / 1,000,000)
Cost = $0.0033 + $0.0090
Cost = $0.0123 per request
Cost in INR: ~₹1.03 per request (at 83 INR/USD)
```

### 7.3 Cost by Scenario

| Composite Score | Expected Tokens | Cost (USD) | Cost (INR) |
|----------------|-----------------|-----------|------------|
| 70–100 (Healthy) | ~1,200 | $0.009 | ~₹0.75 |
| 40–69 (At Risk) | ~1,500 | $0.011 | ~₹0.90 |
| 0–39 (Critical) | ~2,000 | $0.015 | ~₹1.25 |

### 7.4 Monthly Cost Projection

**Assumptions:**
- 5,000 unique users per month
- Average 2 requests per user (analyze + recommend)
- Average request: 1,500 tokens

```
Monthly requests: 5,000 × 2 = 10,000
Monthly token input: 10,000 × 1,100 = 11,000,000
Monthly token output: 10,000 × 600 = 6,000,000

Monthly cost = (11,000,000 × $3.00 / 1,000,000) + (6,000,000 × $15.00 / 1,000,000)
Monthly cost = $33.00 + $90.00
Monthly cost = $123.00
Monthly cost in INR: ~₹10,200
```

### 7.5 Cost Optimization Strategies

| Strategy | Impact | Implementation |
|----------|--------|---------------|
| Cache recommendations | 30–50% reduction | Cache by input hash, 12-hour TTL |
| Use Haiku for retries | 80% cost reduction | Haiku costs $0.0008 per 1K tokens |
| Batching | 10–20% reduction | Not applicable (real-time) |
| Truncate examples | 15% reduction | Use 1 example instead of 3 |

---

## Appendix: Quick Reference

### System Prompt Memory Dump

```
ROLE: Agricultural expert for Indian farmers
LANGUAGES: English, Hindi (Devanagari), Kannada
AUDIENCE: Small/marginal farmers, primary education
OUTPUT: JSON with type, urgency, action, reason per recommendation
CONSTRAINTS: No brands, no flowering pesticides, quantities required
```

### Sample Input → Output Mapping

| Input | Composite Score | Expected # Recommendations |
|-------|----------------|------------------------|
| Drought 82, Pest 28, Nutrient 45 | 38 | 3 (prioritize irrigation) |
| Drought 35, Pest 78, Nutrient 42 | 45 | 3 (prioritize pest control) |
| Drought 25, Pest 32, Nutrient 72 | 48 | 3 (prioritize fertilizer) |
| Drought 90, Pest 85, Nutrient 80 | 15 | 5 (all channels critical) |

---

*Document Version: 1.0*  
*Last Updated: April 23, 2026*  
*Author: AI Engineering Team, FasalRakshak*  
*Model: Claude Sonnet 4 (claude-sonnet-4-20250514)*