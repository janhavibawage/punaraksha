import { historicalAQI, wards } from "../data/mock";

export interface ForecastWardResult {
  wardId: string;
  wardName: string;
  mape: number;
  series: Array<{
    day: string;
    actual: number;
    predicted: number;
  }>;
}

export interface ForecastEvalResult {
  overallMape: number;
  wardResults: ForecastWardResult[];
}

export function runForecastEval(): ForecastEvalResult {
  const wardResults = historicalAQI.map((wardHistory) => {
    const training = wardHistory.days.slice(0, -7);
    const actual = wardHistory.days.slice(-7);
    const predicted = predictNextSeven(training);
    const mape = meanAbsolutePercentageError(actual, predicted);

    return {
      wardId: wardHistory.wardId,
      wardName: wards.find((ward) => ward.wardId === wardHistory.wardId)?.wardName ?? wardHistory.wardId,
      mape,
      series: actual.map((actualValue, index) => ({
        day: `D${index + 1}`,
        actual: actualValue,
        predicted: predicted[index],
      })),
    };
  });

  return {
    overallMape: wardResults.reduce((total, result) => total + result.mape, 0) / wardResults.length,
    wardResults,
  };
}

function predictNextSeven(training: number[]) {
  const recent = training.slice(-7);
  const previous = training.slice(-14, -7);
  const trend = recent.reduce((total, value, index) => total + (value - (previous[index] ?? value)), 0) / recent.length;
  const dailyTrend = trend / 7;
  const smoothedLast = recent.reduce((total, value) => total + value, 0) / recent.length;

  return Array.from({ length: 7 }, (_, index) => Math.round(smoothedLast + dailyTrend * (index + 1)));
}

function meanAbsolutePercentageError(actual: number[], predicted: number[]) {
  const total = actual.reduce((sum, actualValue, index) => {
    return sum + Math.abs((actualValue - predicted[index]) / actualValue);
  }, 0);

  return (total / actual.length) * 100;
}
