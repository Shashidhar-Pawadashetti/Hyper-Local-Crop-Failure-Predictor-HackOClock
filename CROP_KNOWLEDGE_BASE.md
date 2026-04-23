# FasalRakshak Crop Knowledge Base

**Version:** 1.0  
**Date:** April 23, 2026  
**Purpose:** Structured crop domain knowledge for risk scoring engine  
**Format:** JSON-embedded markdown, importable by Node.js

---

## Contents

1. [Crop Definitions (`crops.json`)](#1-crop-definitions-cropsjson)
2. [Growth Stage Metadata (`growth_stages.json`)](#2-growth-stage-metadata-growth_stagesjson)
3. [Karnataka Planting Calendar (`planting_calendar.json`)](#3-karnataka-planting-calendar-planting_calendarjson)
4. [Risk Weight Matrix (`risk_weights.json`)](#4-risk-weight-matrix-risk_weightsjson)
5. [Import Utility](#5-import-utility)

---

## 1. Crop Definitions (`crops.json`)

```json
{
  "crops": [
    {
      "id": "rice",
      "name": {
        "en": "Rice (Paddy)",
        "hi": "धान (चावल)",
        "kn": "ಅಕ್ಕಿ"
      },
      "category": "cereal",
      "scientificName": "Oryza sativa",
      "commonVarieties": ["BPT-5204", "MTU-1010", "IR-64", "Rashi", "Kavya"],
      "icon": "🌾"
    },
    {
      "id": "wheat",
      "name": {
        "en": "Wheat",
        "hi": "गेहूं",
        "kn": "ಗೋದಿ"
      },
      "category": "cereal",
      "scientificName": "Triticum aestivum",
      "commonVarieties": ["HD-2967", "PBW-550", "DBW-17", "Raj-3077"],
      "icon": "🌾"
    },
    {
      "id": "sugarcane",
      "name": {
        "en": "Sugarcane",
        "hi": "गन्ना",
        "kn": "ಕಬ್ಬು"
      },
      "category": "cash",
      "scientificName": "Saccharum officinarum",
      "commonVarieties": ["Co-86032", "Co-0218", "Co-238", "Co-9198"],
      "icon": "🎋"
    },
    {
      "id": "cotton",
      "name": {
        "en": "Cotton",
        "hi": "कपास",
        "kn": "ಹತ್ತಿ"
      },
      "category": "fiber",
      "scientificName": "Gossypium hirsutum",
      "commonVarieties": ["MCU-5", "Bunny", "Mahala", "NCS-145"],
      "icon": "☁️"
    },
    {
      "id": "maize",
      "name": {
        "en": "Maize",
        "hi": "मक्का",
        "kn": "ಮೆಕ್ಕೋಕಾಯಿ"
      },
      "category": "cereal",
      "scientificName": "Zea mays",
      "commonVarieties": ["PMH-1", "HQPM-1", "DHM-117", "Ganga-2"],
      "icon": "🌽"
    },
    {
      "id": "groundnut",
      "name": {
        "en": "Groundnut",
        "hi": "मूंगफली",
        "kn": "ಶೇಂಚಿ"
      },
      "category": "oilseed",
      "scientificName": "Arachis hypogaea",
      "commonVarieties": ["JL-24", "TG-37A", "K-134", "GG-7"],
      "icon": "🥜"
    },
    {
      "id": "soybean",
      "name": {
        "en": "Soybean",
        "hi": "सोयाबीन",
        "kn": "ಸೋಯಾಬೀನ್"
      },
      "category": "oilseed",
      "scientificName": "Glycine max",
      "commonVarieties": ["JS-335", "MAC-3", "PK-1029", "JS-93-05"],
      "icon": "🫘"
    },
    {
      "id": "tomato",
      "name": {
        "en": "Tomato",
        "hi": "टमाटर",
        "kn": "ಟೊಮೇಟೊ"
      },
      "category": "vegetable",
      "scientificName": "Solanum lycopersicum",
      "commonVarieties": ["Rashmi", "Surya", "Pusa Ruby", "Arka Vikram"],
      "icon": "🍅"
    },
    {
      "id": "onion",
      "name": {
        "en": "Onion",
        "hi": "प्याज",
        "kn": "ಈರುಳ್ಕಿ"
      },
      "category": "vegetable",
      "scientificName": "Allium cepa",
      "commonVarieties": ["Arka Niketan", "Pusa Red", "Bhima Super", "Basanti"],
      "icon": "🧅"
    },
    {
      "id": "jowar",
      "name": {
        "en": "Jowar (Sorghum)",
        "hi": "ज्वार",
        "kn": "ಜೋಳ"
      },
      "category": "cereal",
      "scientificName": "Sorghum bicolor",
      "commonVarieties": ["CSV-15", "CSV-20", "SPV-462", "M-35-1"],
      "icon": "🌿"
    }
  ]
}
```

---

## 2. Growth Stage Metadata (`growth_stages.json`)

```json
{
  "growthStages": {
    "rice": [
      {
        "id": "nursery",
        "name": { "en": "Nursery", "hi": "नर्सरी", "kn": "ತೋಟ/" },
        "duration": { "min": 18, "max": 25 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "leaf_hopper", "mealybug"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "low" },
        "criticalTemp": { "min": 20, "max": 35 },
        "criticalRainfall": { "min": 4, "max": 8, "unit": "mm/day" }
      },
      {
        "id": "transplanting",
        "name": { "en": "Transplanting", "hi": "रोपाई", "kn": "ನರ್ಸರಿ ನಾಟಿಸುವ ಸಮಯ" },
        "duration": { "min": 1, "max": 3 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "gall_midge"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 25, "max": 35 },
        "criticalRainfall": { "min": 8, "max": 15, "unit": "mm/day" }
      },
      {
        "id": "tillering",
        "name": { "en": "Tillering", "hi": "कल्ले निकलना", "kn": "ಕಲ್ಲಿ ಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "leaf_folder", "brown_plant_hopper"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 22, "max": 33 },
        "criticalRainfall": { "min": 6, "max": 10, "unit": "mm/day" }
      },
      {
        "id": "panicle_init",
        "name": { "en": "Panicle Initiation", "hi": "बाली निकलना", "kn": "ಬಾಹಿ ಹೊಮ್ಮುವ ಸಮಯ" },
        "duration": { "min": 12, "max": 18 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "gall_midge", "rice_bug"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "high" },
        "criticalTemp": { "min": 25, "max": 35 },
        "criticalRainfall": { "min": 5, "max": 10, "unit": "mm/day" }
      },
      {
        "id": "flowering",
        "name": { "en": "Flowering", "hi": "फूल आना", "kn": "ಹೂಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 10, "max": 15 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "rice_bug", "brown_plant_hopper"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "high" },
        "criticalTemp": { "min": 25, "max": 35 },
        "criticalRainfall": { "min": 4, "max": 8, "unit": "mm/day" }
      },
      {
        "id": "grain_fill",
        "name": { "en": "Grain Filling", "hi": "दाना भरना", "kn": "ಕಾಳು ತುಂಬುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "medium", "p": "medium", "k": "high" },
        "criticalTemp": { "min": 20, "max": 32 },
        "criticalRainfall": { "min": 3, "max": 6, "unit": "mm/day" }
      }
    ],
    "wheat": [
      {
        "id": "sowing",
        "name": { "en": "Sowing", "hi": "बुवाई", "kn": "ಬಿತ್ತನೆ ಸಮಯ" },
        "duration": { "min": 1, "max": 3 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["termite", "aphid"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "low" },
        "criticalTemp": { "min": 15, "max": 25 },
        "criticalRainfall": { "min": 15, "max": 30, "unit": "mm/season" }
      },
      {
        "id": "germination",
        "name": { "en": "Germination", "hi": "अंकुरण", "kn": "ಮೊಳಕೆ ಎಲೆ ." },
        "duration": { "min": 10, "max": 15 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "low", "p": "medium", "k": "low" },
        "criticalTemp": { "min": 15, "max": 25 },
        "criticalRainfall": { "min": 20, "max": 40, "unit": "mm/month" }
      },
      {
        "id": "tillering",
        "name": { "en": "Tillering", "hi": "कल्ले निकलना", "kn": "ಕಲ್ಲಿ ಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["aphid", "termite"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 10, "max": 25 },
        "criticalRainfall": { "min": 25, "max": 50, "unit": "mm/month" }
      },
      {
        "id": "jointing",
        "name": { "en": "Jointing", "hi": "जोड़ बनना", "kn": "ಸೈದಿರಾಹಾ ಹೊಮ್ಮುವ ಸಮಯ" },
        "duration": { "min": 15, "max": 20 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["rust", "mildew", "aphid"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 12, "max": 25 },
        "criticalRainfall": { "min": 20, "max": 40, "unit": "mm/month" }
      },
      {
        "id": "flowering",
        "name": { "en": "Flowering", "hi": "फूल आना", "kn": "ಹೂಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 10, "max": 15 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["rust", "mildew", "wheat_buzzard"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "high" },
        "criticalTemp": { "min": 15, "max": 25 },
        "criticalRainfall": { "min": 20, "max": 35, "unit": "mm/month" }
      },
      {
        "id": "grain_fill",
        "name": { "en": "Grain Filling", "hi": "दाना भरना", "kn": "ಕಾಳು ತುಂಬುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "medium", "p": "medium", "k": "high" },
        "criticalTemp": { "min": 15, "max": 28 },
        "criticalRainfall": { "min": 15, "max": 30, "unit": "mm/month" }
      }
    ],
    "sugarcane": [
      {
        "id": "planting",
        "name": { "en": "Planting", "hi": "रोपाई", "kn": "ನಾಟಿಸುವ ಸಮಯ" },
        "duration": { "min": 1, "max": 3 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["termite", "early_shoot_borer"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "low" },
        "criticalTemp": { "min": 25, "max": 40 },
        "criticalRainfall": { "min": 25, "max": 50, "unit": "mm/planting" }
      },
      {
        "id": "germination",
        "name": { "en": "Germination", "hi": "अंकुरण", "kn": "ಮೊಳಕೆ ಬರುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["early_shoot_borer", "mealybug"]
        },
        "nutrientDemand": { "n": "medium", "p": "medium", "k": "low" },
        "criticalTemp": { "min": 25, "max": 38 },
        "criticalRainfall": { "min": 50, "max": 100, "unit": "mm/month" }
      },
      {
        "id": "tillering",
        "name": { "en": "Tillering", "hi": "कल्ले निकलना", "kn": "ಕಲ್ಲಿ ಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 45, "max": 60 },
        "droughtSensitivity": "medium",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "pyrilla"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 25, "max": 38 },
        "criticalRainfall": { "min": 100, "max": 200, "unit": "mm/month" }
      },
      {
        "id": "grand_growth",
        "name": { "en": "Grand Growth", "hi": "तेजी से वृद्धि", "kn": "ದೊಡ್ಡ ಬೆಳವಣಿಗೆ ಸಮಯ" },
        "duration": { "min": 90, "max": 120 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "pyrilla", "mealybug"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "high" },
        "criticalTemp": { "min": 25, "max": 38 },
        "criticalRainfall": { "min": 150, "max": 300, "unit": "mm/month" }
      },
      {
        "id": "ripening",
        "name": { "en": "Ripening", "hi": "पकना", "kn": "ಬೆಳಗುವ ಸಮಯ" },
        "duration": { "min": 30, "max": 45 },
        "droughtSensitivity": "medium",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "low", "p": "low", "k": "high" },
        "criticalTemp": { "min": 15, "max": 35 },
        "criticalRainfall": { "min": 25, "max": 50, "unit": "mm/month" }
      }
    ],
    "cotton": [
      {
        "id": "sowing",
        "name": { "en": "Sowing", "hi": "बुवाई", "kn": "ಬಿತ್ತನೆ ಸಮಯ" },
        "duration": { "min": 1, "max": 3 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["aphid", "thrips", "termite"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 25, "max": 40 },
        "criticalRainfall": { "min": 20, "max": 40, "unit": "mm/season" }
      },
      {
        "id": "emergence",
        "name": { "en": "Emergence", "hi": "अंकुरण", "kn": "ಮೊಳಕೆ ಬರುವ ಸಮಯ" },
        "duration": { "min": 7, "max": 10 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["aphid", "jassid"]
        },
        "nutrientDemand": { "n": "low", "p": "medium", "k": "low" },
        "criticalTemp": { "min": 25, "max": 35 },
        "criticalRainfall": { "min": 15, "max": 30, "unit": "mm/emergence" }
      },
      {
        "id": "vegetative",
        "name": { "en": "Vegetative", "hi": "वानस्पतिक", "kn": "ಸಸಿ ಬೆಳವಣಿಗೆ ಸಮಯ" },
        "duration": { "min": 45, "max": 60 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["bollworm", "whitefly", "mealybug", "red_cotton_bug"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 25, "max": 38 },
        "criticalRainfall": { "min": 50, "max": 100, "unit": "mm/month" }
      },
      {
        "id": "flowering",
        "name": { "en": "Flowering", "hi": "फूल आना", "kn": "ಹೂಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["bollworm", "pink_bollworm", "spider_mite"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "high" },
        "criticalTemp": { "min": 25, "max": 35 },
        "criticalRainfall": { "min": 40, "max": 80, "unit": "mm/month" }
      },
      {
        "id": "boll_formation",
        "name": { "en": "Boll Formation", "hi": "फल लगना", "kn": "ಹಣ್ಣು ಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 25, "max": 35 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["bollworm", "pink_bollworm", "spider_mite"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "high" },
        "criticalTemp": { "min": 25, "max": 35 },
        "criticalRainfall": { "min": 40, "max": 80, "unit": "mm/month" }
      },
      {
        "id": "boll_opening",
        "name": { "en": "Boll Opening", "hi": "फल फूटना", "kn": "ಹಣ್ಣು ಬಿರಿಯುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "medium",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "low", "p": "low", "k": "medium" },
        "criticalTemp": { "min": 20, "max": 35 },
        "criticalRainfall": { "min": 10, "max": 25, "unit": "mm/month" }
      }
    ],
    "maize": [
      {
        "id": "sowing",
        "name": { "en": "Sowing", "hi": "बुवाई", "kn": "ಬಿತ್ತನೆ ಸಮಯ" },
        "duration": { "min": 1, "max": 2 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["termite", "cutworm"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "low" },
        "criticalTemp": { "min": 20, "max": 35 },
        "criticalRainfall": { "min": 20, "max": 35, "unit": "mm/season" }
      },
      {
        "id": "emergence",
        "name": { "en": "Emergence", "hi": "अंकुरण", "kn": "ಮೊಳಕೆ ಬರುವ ಸಮಯ" },
        "duration": { "min": 7, "max": 10 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["cutworm", "aphid"]
        },
        "nutrientDemand": { "n": "low", "p": "medium", "k": "low" },
        "criticalTemp": { "min": 20, "max": 30 },
        "criticalRainfall": { "min": 15, "max": 25, "unit": "mm/emergence" }
      },
      {
        "id": "vegetative_early",
        "name": { "en": "Early Vegetative", "hi": "प्रारंभिक वानस्पतिक", "kn": "ಮುಂಚಿನ ಸಸಿ ಬೆಳವಣಿಗೆ" },
        "duration": { "min": 20, "max": 25 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "fall_armyworm"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 22, "max": 32 },
        "criticalRainfall": { "min": 30, "max": 50, "unit": "mm/month" }
      },
      {
        "id": "vegetative_late",
        "name": { "en": "Late Vegetative", "hi": "पश्चिमिक वानस्पतिक", "kn": "ತಡಮೆಯ ಸಸಿ ಬೆಳವಣಿಗೆ" },
        "duration": { "min": 20, "max": 25 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "fall_armyworm", "aphid"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "high" },
        "criticalTemp": { "min": 22, "max": 32 },
        "criticalRainfall": { "min": 40, "max": 60, "unit": "mm/month" }
      },
      {
        "id": "tasseling",
        "name": { "en": "Tasseling", "hi": "बाली निकलना", "kn": "ತಾಯಿ ಹೊಮ್ಮುವ ಸಮಯ" },
        "duration": { "min": 5, "max": 10 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "fall_armyworm"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "high" },
        "criticalTemp": { "min": 25, "max": 32 },
        "criticalRainfall": { "min": 25, "max": 40, "unit": "mm/tasseling" }
      },
      {
        "id": "grain_fill",
        "name": { "en": "Grain Filling", "hi": "दाना भरना", "kn": "ಕಾಳು ತುಂಬುವ ಸಮಯ" },
        "duration": { "min": 25, "max": 35 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "medium", "p": "medium", "k": "high" },
        "criticalTemp": { "min": 20, "max": 30 },
        "criticalRainfall": { "min": 20, "max": 35, "unit": "mm/month" }
      }
    ],
    "groundnut": [
      {
        "id": "sowing",
        "name": { "en": "Sowing", "hi": "बुवाई", "kn": "ಬಿತ್ತನೆ ಸಮಯ" },
        "duration": { "min": 1, "max": 2 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["termite", "cutworm"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 25, "max": 35 },
        "criticalRainfall": { "min": 20, "max": 35, "unit": "mm/season" }
      },
      {
        "id": "emergence",
        "name": { "en": "Emergence", "hi": "अंकुरण", "kn": "ಮೊಳಕೆ ಬರುವ ಸಮಯ" },
        "duration": { "min": 8, "max": 12 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["aphid", "thrips"]
        },
        "nutrientDemand": { "n": "low", "p": "medium", "k": "low" },
        "criticalTemp": { "min": 24, "max": 33 },
        "criticalRainfall": { "min": 15, "max": 25, "unit": "mm/emergence" }
      },
      {
        "id": "vegetative",
        "name": { "en": "Vegetative", "hi": "वानस्पतिक", "kn": "ಸಸಿ ಬೆಳವಣಿಗೆ ಸಮಯ" },
        "duration": { "min": 25, "max": 35 },
        "droughtSensitivity": "medium",
        "pestPressure": {
          "active": true,
          "pests": ["leaf_miner", "aphid", "jassid"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 24, "max": 33 },
        "criticalRainfall": { "min": 40, "max": 60, "unit": "mm/month" }
      },
      {
        "id": "flowering",
        "name": { "en": "Flowering", "hi": "फूल आना", "kn": "ಹೂಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["leaf_miner", "spider_mite"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 24, "max": 33 },
        "criticalRainfall": { "min": 50, "max": 80, "unit": "mm/month" }
      },
      {
        "id": "pod_dev",
        "name": { "en": "Pod Development", "hi": "फल विकास", "kn": "ಹಣ್ಣು ಬೆಳವಣಿಗೆ" },
        "duration": { "min": 30, "max": 40 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["pod_borer", "termite"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "high" },
        "criticalTemp": { "min": 22, "max": 32 },
        "criticalRainfall": { "min": 40, "max": 70, "unit": "mm/month" }
      },
      {
        "id": "kernel_fill",
        "name": { "en": "Kernel Filling", "hi": "दाना भरना", "kn": "ಕಾಳು ತುಂಬುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "low", "p": "medium", "k": "high" },
        "criticalTemp": { "min": 20, "max": 30 },
        "criticalRainfall": { "min": 25, "max": 45, "unit": "mm/month" }
      }
    ],
    "soybean": [
      {
        "id": "sowing",
        "name": { "en": "Sowing", "hi": "बुवाई", "kn": "ಬಿತ್ತನೆ ಸಮಯ" },
        "duration": { "min": 1, "max": 2 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["termite", "cutworm"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 24, "max": 35 },
        "criticalRainfall": { "min": 25, "max": 40, "unit": "mm/season" }
      },
      {
        "id": "emergence",
        "name": { "en": "Emergence", "hi": "अंकुरण", "kn": "ಮೊಳಕೆ ಬರುವ ಸಮಯ" },
        "duration": { "min": 7, "max": 10 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["cutworm", "aphid"]
        },
        "nutrientDemand": { "n": "low", "p": "medium", "k": "low" },
        "criticalTemp": { "min": 20, "max": 30 },
        "criticalRainfall": { "min": 15, "max": 25, "unit": "mm/emergence" }
      },
      {
        "id": "vegetative",
        "name": { "en": "Vegetative", "hi": "वानस्पतिक", "kn": "ಸಸಿ ಬೆಳವಣಿಗೆ" },
        "duration": { "min": 30, "max": 40 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["stem_fly", "girdle_beetle", "whitefly"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 22, "max": 32 },
        "criticalRainfall": { "min": 40, "max": 60, "unit": "mm/month" }
      },
      {
        "id": "flowering",
        "name": { "en": "Flowering", "hi": "फूल आना", "kn": "ಹೂಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 15, "max": 20 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["pod_borer", "whitefly"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 24, "max": 32 },
        "criticalRainfall": { "min": 40, "max": 60, "unit": "mm/month" }
      },
      {
        "id": "pod_dev",
        "name": { "en": "Pod Development", "hi": "फल विकास", "kn": "ಹಣ್ಣು ಬೆಳವಣಿಗೆ" },
        "duration": { "min": 20, "max": 25 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["pod_borer", "beetle"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "high" },
        "criticalTemp": { "min": 22, "max": 30 },
        "criticalRainfall": { "min": 35, "max": 55, "unit": "mm/month" }
      },
      {
        "id": "seed_fill",
        "name": { "en": "Seed Filling", "hi": "दाना भरना", "kn": "ಬೀಜ ತುಂಬುವ ಸಮಯ" },
        "duration": { "min": 20, "max": 25 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "low", "p": "medium", "k": "high" },
        "criticalTemp": { "min": 20, "max": 28 },
        "criticalRainfall": { "min": 20, "max": 35, "unit": "mm/month" }
      }
    ],
    "tomato": [
      {
        "id": "nursery",
        "name": { "en": "Nursery", "hi": "नर्सरी", "kn": "ತೋಟ" },
        "duration": { "min": 25, "max": 35 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["aphid", "whitefly", "thrips"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 20, "max": 30 },
        "criticalRainfall": { "min": 4, "max": 8, "unit": "mm/week" }
      },
      {
        "id": "transplanting",
        "name": { "en": "Transplanting", "hi": "रोपाई", "kn": "ನಾಟಿಸುವ ಸಮಯ" },
        "duration": { "min": 1, "max": 2 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["aphid", "nematode"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 20, "max": 30 },
        "criticalRainfall": { "min": 6, "max": 10, "unit": "mm/week" }
      },
      {
        "id": "vegetative",
        "name": { "en": "Vegetative", "hi": "वानस्पतिक", "kn": "ಸಸಿ ಬೆಳವಣಿಗೆ" },
        "duration": { "min": 25, "max": 35 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["aphid", "whitefly", "mealybug", "tomato_leaf_miner"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 18, "max": 28 },
        "criticalRainfall": { "min": 25, "max": 50, "unit": "mm/month" }
      },
      {
        "id": "flowering",
        "name": { "en": "Flowering", "hi": "फूल आना", "kn": "ಹೂಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 15, "max": 20 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["fruit_borer", "whitefly", "tomato_leaf_miner"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "high" },
        "criticalTemp": { "min": 18, "max": 28 },
        "criticalRainfall": { "min": 20, "max": 40, "unit": "mm/month" }
      },
      {
        "id": "fruiting",
        "name": { "en": "Fruiting", "hi": "फल लगना", "kn": "ಹಣ್ಣು ಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 30, "max": 45 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["fruit_borer", "mealybug", "spider_mite"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "high" },
        "criticalTemp": { "min": 20, "max": 30 },
        "criticalRainfall": { "min": 25, "max": 50, "unit": "mm/month" }
      }
    ],
    "onion": [
      {
        "id": "sowing",
        "name": { "en": "Sowing", "hi": "बुवाई", "kn": "ಬಿತ್ತನೆ ಸಮಯ" },
        "duration": { "min": 1, "max": 2 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["thrips", "onion_maggot"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "medium" },
        "criticalTemp": { "min": 15, "max": 30 },
        "criticalRainfall": { "min": 4, "max": 8, "unit": "mm/week" }
      },
      {
        "id": "vegetative",
        "name": { "en": "Vegetative", "hi": "वानस्पतिक", "kn": "ಸಸಿ ಬೆಳವಣಿಗೆ" },
        "duration": { "min": 45, "max": 60 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["thrips", "purple_blotch", "stem_phytium"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 15, "max": 28 },
        "criticalRainfall": { "min": 20, "max": 40, "unit": "mm/month" }
      },
      {
        "id": "bulb_init",
        "name": { "en": "Bulb Initiation", "hi": "गांठ बनना", "kn": "ಬಲ್ಬ್ ರೂಟಿಂಗ್" },
        "duration": { "min": 20, "max": 30 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["thrips", "onion_maggot"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "high" },
        "criticalTemp": { "min": 18, "max": 30 },
        "criticalRainfall": { "min": 15, "max": 30, "unit": "mm/month" }
      },
      {
        "id": "bulb_dev",
        "name": { "en": "Bulb Development", "hi": "गांठ विकास", "kn": "ಬಲ್ಬ್ ಬೆಳವಣಿಗೆ" },
        "duration": { "min": 30, "max": 45 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": true,
          "pests": ["thrips", "purple_blotch"]
        },
        "nutrientDemand": { "n": "medium", "p": "medium", "k": "high" },
        "criticalTemp": { "min": 20, "max": 32 },
        "criticalRainfall": { "min": 15, "max": 30, "unit": "mm/month" }
      },
      {
        "id": "harvest_ready",
        "name": { "en": "Harvest Ready", "hi": "कटाई के लिए तैयार", "kn": "ಕುಯಿಲು ಸಿದ್ಧ" },
        "duration": { "min": 5, "max": 10 },
        "droughtSensitivity": "low",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "low", "p": "low", "k": "low" },
        "criticalTemp": { "min": 20, "max": 35 },
        "criticalRainfall": { "min": 5, "max": 10, "unit": "mm/month" }
      }
    ],
    "jowar": [
      {
        "id": "sowing",
        "name": { "en": "Sowing", "hi": "बुवाई", "kn": "ಬಿತ್ತನೆ ಸಮಯ" },
        "duration": { "min": 1, "max": 2 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["termite", "shoot_fly"]
        },
        "nutrientDemand": { "n": "medium", "p": "high", "k": "low" },
        "criticalTemp": { "min": 25, "max": 38 },
        "criticalRainfall": { "min": 25, "max": 40, "unit": "mm/season" }
      },
      {
        "id": "emergence",
        "name": { "en": "Emergence", "hi": "अंकुरण", "kn": "ಮೊಳಕೆ ಬರುವ ಸಮಯ" },
        "duration": { "min": 7, "max": 10 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["shoot_fly", "stem_borer"]
        },
        "nutrientDemand": { "n": "low", "p": "medium", "k": "low" },
        "criticalTemp": { "min": 24, "max": 35 },
        "criticalRainfall": { "min": 15, "max": 25, "unit": "mm/emergence" }
      },
      {
        "id": "vegetative",
        "name": { "en": "Vegetative", "hi": "वानस्पतिक", "kn": "ಸಸಿ ಬೆಳವಣಿಗೆ" },
        "duration": { "min": 35, "max": 45 },
        "droughtSensitivity": "medium",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "midge", "aphid"]
        },
        "nutrientDemand": { "n": "high", "p": "medium", "k": "medium" },
        "criticalTemp": { "min": 25, "max": 35 },
        "criticalRainfall": { "min": 40, "max": 60, "unit": "mm/month" }
      },
      {
        "id": "flowering",
        "name": { "en": "Flowering", "hi": "फूल आना", "kn": "ಹೂಬಿಡುವ ಸಮಯ" },
        "duration": { "min": 15, "max": 20 },
        "droughtSensitivity": "critical",
        "pestPressure": {
          "active": true,
          "pests": ["stem_borer", "grain_midge"]
        },
        "nutrientDemand": { "n": "high", "p": "high", "k": "high" },
        "criticalTemp": { "min": 25, "max": 35 },
        "criticalRainfall": { "min": 30, "max": 50, "unit": "mm/month" }
      },
      {
        "id": "grain_fill",
        "name": { "en": "Grain Filling", "hi": "दाना भरना", "kn": "ಕಾಳು ತುಂಬುವ ಸಮಯ" },
        "duration": { "min": 25, "max": 35 },
        "droughtSensitivity": "high",
        "pestPressure": {
          "active": false,
          "pests": []
        },
        "nutrientDemand": { "n": "medium", "p": "medium", "k": "high" },
        "criticalTemp": { "min": 20, "max": 32 },
        "criticalRainfall": { "min": 20, "max": 35, "unit": "mm/month" }
      }
    ]
  }
}
```

---

## 3. Karnataka Planting Calendar (`planting_calendar.json`)

```json
{
  "karnatakaCalendar": {
    "state": "Karnataka",
    "seasons": [
      {
        "id": "kharif",
        "name": { "en": "Kharif (Monsoon)", "hi": "खरीफ", "kn": "ಖರೀಫ್" },
        "months": ["June", "July", "August", "September", "October"],
        "monsoon": "South-West Monsoon"
      },
      {
        "id": "rabi",
        "name": { "en": "Rabi (Post-Monsoon)", "hi": "रबी", "kn": "ರಬೀ" },
        "months": ["October", "November", "December", "January", "February", "March"],
        "monsoon": "North-East Monsoon"
      },
      {
        "id": "summer",
        "name": { "en": "Summer", "hi": "गर्मी", "kn": "ಬೇಸಿಗೆ" },
        "months": ["February", "March", "April", "May"],
        "monsoon": "Irrigation dependent"
      }
    ],
    "cropSchedules": [
      {
        "cropId": "rice",
        "kharif": {
          "sowingStart": "June 1",
          "sowingEnd": "July 15",
          "transplantingStart": "July 1",
          "transplantingEnd": "August 15",
          "harvestStart": "November",
          "harvestEnd": "January",
          "districts": ["Mysore", "Mandya", "Hassan", "Dharwad", "Belgaum", "Koppal", "Raichur", "Bellary"]
        },
        "rabi": {
          "sowingStart": "October 15",
          "sowingEnd": "November 30",
          "transplantingStart": "November 1",
          "transplantingEnd": "December 15",
          "harvestStart": "February",
          "harvestEnd": "April",
          "districts": ["Mysore", "Mandya", "Hassan"]
        }
      },
      {
        "cropId": "wheat",
        "rabi": {
          "sowingStart": "November 1",
          "sowingEnd": "December 15",
          "harvestStart": "March",
          "harvestEnd": "May",
          "districts": ["Belgaum", "Bijapur", "Gulbarga", "Raichur", "Koppal"]
        }
      },
      {
        "cropId": "sugarcane",
        "kharif": {
          "plantingStart": "January",
          "plantingEnd": "March",
          "harvestStart": "December",
          "harvestEnd": "March",
          "districts": ["Belgaum", "Bagalkot", "Bijapur", "Dharwad", "Uttara Kannada"]
        },
        "rabi": {
          "plantingStart": "September",
          "plantingEnd": "November",
          "harvestStart": "December",
          "harvestEnd": "May",
          "districts": ["Belgaum", "Bagalkot"]
        }
      },
      {
        "cropId": "cotton",
        "kharif": {
          "sowingStart": "June 1",
          "sowingEnd": "July 15",
          "harvestStart": "October",
          "harvestEnd": "January",
          "districts": ["Raichur", "Koppal", "Gulbarga", "Bijapur", "Belgaum", "Dharwad"]
        }
      },
      {
        "cropId": "maize",
        "kharif": {
          "sowingStart": "June 1",
          "sowingEnd": "July 15",
          "harvestStart": "September",
          "harvestEnd": "November",
          "districts": ["Tumkur", "Kolar", "Bangalore Rural", "Mysore", "Mandya", "Chitradurga", "Dharwad"]
        },
        "rabi": {
          "sowingStart": "October 15",
          "sowingEnd": "November 30",
          "harvestStart": "January",
          "harvestEnd": "March",
          "districts": ["Tumkur", "Kolar", "Mandya"]
        },
        "summer": {
          "sowingStart": "February",
          "sowingEnd": "April",
          "harvestStart": "May",
          "harvestEnd": "July",
          "districts": ["Tumkur", "Kolar"]
        }
      },
      {
        "cropId": "groundnut",
        "kharif": {
          "sowingStart": "June 1",
          "sowingEnd": "July 15",
          "harvestStart": "September",
          "harvestEnd": "November",
          "districts": ["Tumkur", "Chitradurga", "Kolar", "Bangalore Rural", "Mandya", "Hassan"]
        },
        "rabi": {
          "sowingStart": "September",
          "sowingEnd": "October",
          "harvestStart": "December",
          "harvestEnd": "February",
          "districts": ["Tumkur", "Kolar"]
        },
        "summer": {
          "sowingStart": "January",
          "sowingEnd": "February",
          "harvestStart": "April",
          "harvestEnd": "June",
          "districts": ["Tumkur", "Kolar"]
        }
      },
      {
        "cropId": "soybean",
        "kharif": {
          "sowingStart": "June 1",
          "sowingEnd": "July 15",
          "harvestStart": "September",
          "harvestEnd": "November",
          "districts": ["Belgaum", "Bagalkot", "Bijapur", "Gulbarga", "Raichur", "Koppal"]
        }
      },
      {
        "cropId": "tomato",
        "kharif": {
          "sowingStart": "June",
          "sowingEnd": "July",
          "transplantingStart": "July",
          "transplantingEnd": "August",
          "harvestStart": "October",
          "harvestEnd": "January",
          "districts": ["Kolar", "Tumkur", "Mysore", "Hassan", "Dharwad", "Uttara Kannada"]
        },
        "rabi": {
          "sowingStart": "October",
          "sowingEnd": "November",
          "transplantingStart": "November",
          "transplantingEnd": "December",
          "harvestStart": "January",
          "harvestEnd": "April",
          "districts": ["Kolar", "Tumkur", "Mysore"]
        },
        "summer": {
          "sowingStart": "February",
          "sowingEnd": "March",
          "transplantingStart": "March",
          "transplantingEnd": "April",
          "harvestStart": "May",
          "harvestEnd": "July",
          "districts": ["Kolar"]
        }
      },
      {
        "cropId": "onion",
        "kharif": {
          "sowingStart": "May",
          "sowingEnd": "June",
          "transplantingStart": "June",
          "transplantingEnd": "July",
          "harvestStart": "September",
          "harvestEnd": "November",
          "districts": ["Dharwad", "Belgaum", "Bagalkot", "Bijapur"]
        },
        "rabi": {
          "sowingStart": "October",
          "sowingEnd": "November",
          "transplantingStart": "November",
          "transplantingEnd": "December",
          "harvestStart": "February",
          "harvestEnd": "April",
          "districts": ["Dharwad", "Belgaum", "Bagalkot"]
        },
        "summer": {
          "sowingStart": "January",
          "sowingEnd": "February",
          "transplantingStart": "February",
          "transplantingEnd": "March",
          "harvestStart": "April",
          "harvestEnd": "June",
          "districts": ["Dharwad"]
        }
      },
      {
        "cropId": "jowar",
        "kharif": {
          "sowingStart": "June 1",
          "sowingEnd": "July 15",
          "harvestStart": "September",
          "harvestEnd": "November",
          "districts": ["Gulbarga", "Raichur", "Koppal", "Bijapur", "Bagalkot", "Belgaum", "Dharwad"]
        },
        "rabi": {
          "sowingStart": "October 15",
          "sowingEnd": "November 30",
          "harvestStart": "January",
          "harvestEnd": "March",
          "districts": ["Gulbarga", "Raichur", "Koppal"]
        }
      }
    ]
  }
}
```

---

## 4. Risk Weight Matrix (`risk_weights.json`)

```json
{
  "meta": {
    "description": "Risk channel weights by crop and growth stage",
    "formula": "composite_score = (drought_weight × drought_score) + (pest_weight × pest_score) + (nutrient_weight × nutrient_score)",
    "version": "1.0",
    "lastUpdated": "2026-04-23"
  },
  "weights": {
    "rice": {
      "nursery": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "transplanting": { "drought": 0.45, "pest": 0.25, "nutrient": 0.30 },
      "tillering": { "drought": 0.40, "pest": 0.35, "nutrient": 0.25 },
      "panicle_init": { "drought": 0.50, "pest": 0.30, "nutrient": 0.20 },
      "flowering": { "drought": 0.50, "pest": 0.30, "nutrient": 0.20 },
      "grain_fill": { "drought": 0.35, "pest": 0.25, "nutrient": 0.40 }
    },
    "wheat": {
      "sowing": { "drought": 0.50, "pest": 0.25, "nutrient": 0.25 },
      "germination": { "drought": 0.45, "pest": 0.20, "nutrient": 0.35 },
      "tillering": { "drought": 0.40, "pest": 0.30, "nutrient": 0.30 },
      "jointing": { "drought": 0.40, "pest": 0.35, "nutrient": 0.25 },
      "flowering": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "grain_fill": { "drought": 0.35, "pest": 0.20, "nutrient": 0.45 }
    },
    "sugarcane": {
      "planting": { "drought": 0.50, "pest": 0.30, "nutrient": 0.20 },
      "germination": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "tillering": { "drought": 0.35, "pest": 0.40, "nutrient": 0.25 },
      "grand_growth": { "drought": 0.40, "pest": 0.35, "nutrient": 0.25 },
      "ripening": { "drought": 0.30, "pest": 0.20, "nutrient": 0.50 }
    },
    "cotton": {
      "sowing": { "drought": 0.50, "pest": 0.30, "nutrient": 0.20 },
      "emergence": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "vegetative": { "drought": 0.35, "pest": 0.40, "nutrient": 0.25 },
      "flowering": { "drought": 0.40, "pest": 0.40, "nutrient": 0.20 },
      "boll_formation": { "drought": 0.45, "pest": 0.35, "nutrient": 0.20 },
      "boll_opening": { "drought": 0.30, "pest": 0.25, "nutrient": 0.45 }
    },
    "maize": {
      "sowing": { "drought": 0.50, "pest": 0.25, "nutrient": 0.25 },
      "emergence": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "vegetative_early": { "drought": 0.40, "pest": 0.35, "nutrient": 0.25 },
      "vegetative_late": { "drought": 0.40, "pest": 0.35, "nutrient": 0.25 },
      "tasseling": { "drought": 0.50, "pest": 0.30, "nutrient": 0.20 },
      "grain_fill": { "drought": 0.35, "pest": 0.20, "nutrient": 0.45 }
    },
    "groundnut": {
      "sowing": { "drought": 0.50, "pest": 0.25, "nutrient": 0.25 },
      "emergence": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "vegetative": { "drought": 0.35, "pest": 0.35, "nutrient": 0.30 },
      "flowering": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "pod_dev": { "drought": 0.50, "pest": 0.25, "nutrient": 0.25 },
      "kernel_fill": { "drought": 0.45, "pest": 0.20, "nutrient": 0.35 }
    },
    "soybean": {
      "sowing": { "drought": 0.50, "pest": 0.25, "nutrient": 0.25 },
      "emergence": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "vegetative": { "drought": 0.40, "pest": 0.35, "nutrient": 0.25 },
      "flowering": { "drought": 0.50, "pest": 0.30, "nutrient": 0.20 },
      "pod_dev": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "seed_fill": { "drought": 0.40, "pest": 0.20, "nutrient": 0.40 }
    },
    "tomato": {
      "nursery": { "drought": 0.45, "pest": 0.35, "nutrient": 0.20 },
      "transplanting": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "vegetative": { "drought": 0.35, "pest": 0.40, "nutrient": 0.25 },
      "flowering": { "drought": 0.45, "pest": 0.35, "nutrient": 0.20 },
      "fruiting": { "drought": 0.40, "pest": 0.35, "nutrient": 0.25 }
    },
    "onion": {
      "sowing": { "drought": 0.50, "pest": 0.30, "nutrient": 0.20 },
      "vegetative": { "drought": 0.40, "pest": 0.35, "nutrient": 0.25 },
      "bulb_init": { "drought": 0.50, "pest": 0.25, "nutrient": 0.25 },
      "bulb_dev": { "drought": 0.40, "pest": 0.30, "nutrient": 0.30 },
      "harvest_ready": { "drought": 0.20, "pest": 0.20, "nutrient": 0.60 }
    },
    "jowar": {
      "sowing": { "drought": 0.50, "pest": 0.25, "nutrient": 0.25 },
      "emergence": { "drought": 0.45, "pest": 0.30, "nutrient": 0.25 },
      "vegetative": { "drought": 0.35, "pest": 0.35, "nutrient": 0.30 },
      "flowering": { "drought": 0.50, "pest": 0.30, "nutrient": 0.20 },
      "grain_fill": { "drought": 0.35, "pest": 0.20, "nutrient": 0.45 }
    }
  },
  "droughtSensitivityMapping": {
    "low": { "multiplier": 0.7 },
    "medium": { "multiplier": 1.0 },
    "high": { "multiplier": 1.3 },
    "critical": { "multiplier": 1.6 }
  }
}
```

---

## 5. Import Utility

```typescript
// src/config/crops.ts

import cropsData from './crops.json';
import growthStagesData from './growth_stages.json';
import plantingCalendarData from './planting_calendar.json';
import riskWeightsData from './risk_weights.json';

export interface Crop {
  id: string;
  name: { en: string; hi: string; kn: string };
  category: string;
  scientificName: string;
  commonVarieties: string[];
  icon: string;
}

export interface GrowthStage {
  id: string;
  name: { en: string; hi: string; kn: string };
  duration: { min: number; max: number };
  droughtSensitivity: 'low' | 'medium' | 'high' | 'critical';
  pestPressure: {
    active: boolean;
    pests: string[];
  };
  nutrientDemand: {
    n: 'low' | 'medium' | 'high';
    p: 'low' | 'medium' | 'high';
    k: 'low' | 'medium' | 'high';
  };
  criticalTemp: { min: number; max: number };
  criticalRainfall: { min: number; max: number; unit: string };
}

export interface RiskWeights {
  drought: number;
  pest: number;
  nutrient: number;
}

export class CropKnowledgeBase {
  private static instance: CropKnowledgeBase;
  
  private crops: Crop[] = cropsData.crops;
  private stages: Record<string, GrowthStage[]> = growthStagesData.growthStages;
  private calendar: any = plantingCalendarData.karnatakaCalendar;
  private weights: Record<string, Record<string, RiskWeights>> = riskWeightsData.weights;
  
  private constructor() {}
  
  static getInstance(): CropKnowledgeBase {
    if (!CropKnowledgeBase.instance) {
      CropKnowledgeBase.instance = new CropKnowledgeBase();
    }
    return CropKnowledgeBase.instance;
  }
  
  getCrop(cropId: string): Crop | undefined {
    return this.crops.find(c => c.id === cropId);
  }
  
  getAllCrops(): Crop[] {
    return this.crops;
  }
  
  getStages(cropId: string): GrowthStage[] {
    return this.stages[cropId] || [];
  }
  
  getStage(cropId: string, stageId: string): GrowthStage | undefined {
    return this.stages[cropId]?.find(s => s.id === stageId);
  }
  
  getWeight(cropId: string, stageId: string): RiskWeights | undefined {
    return this.weights[cropId]?.[stageId];
  }
  
  getDroughtMultiplier(sensitivity: string): number {
    const mapping: Record<string, number> = {
      low: 0.7,
      medium: 1.0,
      high: 1.3,
      critical: 1.6
    };
    return mapping[sensitivity] || 1.0;
  }
  
  getPlantingSchedule(cropId: string, season: 'kharif' | 'rabi' | 'summer'): any {
    const schedule = this.calendar.cropSchedules.find(
      (s: any) => s.cropId === cropId
    );
    return schedule?.[season];
  }
}

export const cropKB = CropKnowledgeBase.getInstance();
```

---

*Document Version: 1.0*  
*Last Updated: April 23, 2026*  
*Author: Data Engineering Team, FasalRakshak*  
*Format: JSON-embedded markdown, importable by Node.js*