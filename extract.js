const fs = require('fs');

const mdContent = fs.readFileSync('CROP_KNOWLEDGE_BASE.md', 'utf-8');

const extractJson = (regexPattern) => {
    const match = mdContent.match(regexPattern);
    return match ? JSON.parse(match[1]) : null;
};

const growthStagesData = extractJson(/## 2\. Growth Stage Metadata[^{]*({[\s\S]*?})\s*```/);
const riskWeightsData = extractJson(/## 4\. Risk Weight Matrix[^{]*({[\s\S]*?})\s*```/);

if (!growthStagesData || !riskWeightsData) {
    console.error("Failed to extract JSONs");
    process.exit(1);
}

const growthStages = growthStagesData.growthStages;
const weightsData = riskWeightsData.weights;

const result = {};

for (const cropId of Object.keys(growthStages)) {
    result[cropId] = {};
    for (const stage of growthStages[cropId]) {
        const stageId = stage.id;
        const weights = weightsData[cropId]?.[stageId] || { drought: 0.33, pest: 0.33, nutrient: 0.34 };
        
        result[cropId][stageId] = {
            droughtSensitivity: stage.droughtSensitivity,
            pestWindow: stage.pestPressure.active,
            nutrientDemand: { N: stage.nutrientDemand.n },
            weights: weights
        };
    }
}

fs.mkdirSync('server/src/data', { recursive: true });
fs.writeFileSync('server/src/data/cropKnowledge.json', JSON.stringify(result, null, 2));
console.log("Successfully wrote cropKnowledge.json");
