import { classifyGrievance } from "../agents/grievanceAgent";
import type { GrievanceCategory } from "../agents/types";
import { labeledComplaints } from "./evalData";

const categories: GrievanceCategory[] = [
  "air_quality",
  "garbage",
  "water_supply",
  "noise",
  "road_damage",
  "encroachment",
  "tree_safety",
  "other",
];

export interface CategoryMetric {
  category: GrievanceCategory;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface NlpEvalResult {
  accuracy: number;
  severityAccuracy: number;
  total: number;
  categoryMetrics: CategoryMetric[];
  confusionMatrix: Record<GrievanceCategory, Record<GrievanceCategory, number>>;
}

export async function runNlpEval(): Promise<NlpEvalResult> {
  const predictions = await Promise.all(
    labeledComplaints.map(async (entry) => ({
      entry,
      prediction: await classifyGrievance({ text: entry.text }),
    })),
  );

  const correctCategory = predictions.filter(({ entry, prediction }) => entry.trueCategory === prediction.category).length;
  const correctSeverity = predictions.filter(({ entry, prediction }) => entry.trueSeverity === prediction.severity).length;

  const confusionMatrix = makeEmptyMatrix();
  predictions.forEach(({ entry, prediction }) => {
    confusionMatrix[entry.trueCategory][prediction.category] += 1;
  });

  const categoryMetrics = categories.map((category) => {
    const tp = confusionMatrix[category][category];
    const fp = categories.reduce((total, trueCategory) => {
      return trueCategory === category ? total : total + confusionMatrix[trueCategory][category];
    }, 0);
    const fn = categories.reduce((total, predictedCategory) => {
      return predictedCategory === category ? total : total + confusionMatrix[category][predictedCategory];
    }, 0);
    const precision = safeDivide(tp, tp + fp);
    const recall = safeDivide(tp, tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

    return {
      category,
      precision,
      recall,
      f1,
      support: predictions.filter(({ entry }) => entry.trueCategory === category).length,
    };
  });

  return {
    accuracy: correctCategory / predictions.length,
    severityAccuracy: correctSeverity / predictions.length,
    total: predictions.length,
    categoryMetrics,
    confusionMatrix,
  };
}

function makeEmptyMatrix() {
  return categories.reduce(
    (matrix, trueCategory) => {
      matrix[trueCategory] = categories.reduce(
        (row, predictedCategory) => {
          row[predictedCategory] = 0;
          return row;
        },
        {} as Record<GrievanceCategory, number>,
      );
      return matrix;
    },
    {} as Record<GrievanceCategory, Record<GrievanceCategory, number>>,
  );
}

function safeDivide(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}
