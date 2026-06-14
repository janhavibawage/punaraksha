import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { runNlpEval, type NlpEvalResult } from "../../evals/nlpEval";
import { formatCategory, formatPercent } from "../../utils/format";

export function NlpEvalPanel() {
  const [result, setResult] = useState<NlpEvalResult | null>(null);

  useEffect(() => {
    let mounted = true;
    runNlpEval().then((nextResult) => {
      if (mounted) {
        setResult(nextResult);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const strongest = useMemo(() => {
    if (!result) {
      return undefined;
    }

    return [...result.categoryMetrics].sort((a, b) => b.f1 - a.f1)[0];
  }, [result]);

  if (!result) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Running classifier eval against labeled complaints
        </div>
      </section>
    );
  }

  const categories = result.categoryMetrics.map((metric) => metric.category);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-civic">
            <BrainCircuit className="h-4 w-4" aria-hidden="true" />
            NLP Eval
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Classifier hits {formatPercent(result.accuracy)} accuracy across {result.total} complaints.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Strongest category: {strongest ? formatCategory(strongest.category) : "n/a"} at{" "}
            {strongest ? formatPercent(strongest.f1) : "0%"} F1. Severity accuracy is{" "}
            {formatPercent(result.severityAccuracy)}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <Score label="Category" value={formatPercent(result.accuracy)} />
          <Score label="Severity" value={formatPercent(result.severityAccuracy)} />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="py-2 pr-4 font-semibold">Category</th>
              <th className="px-4 py-2 font-semibold">Precision</th>
              <th className="px-4 py-2 font-semibold">Recall</th>
              <th className="px-4 py-2 font-semibold">F1</th>
              <th className="px-4 py-2 font-semibold">Support</th>
            </tr>
          </thead>
          <tbody>
            {result.categoryMetrics.map((metric) => (
              <tr key={metric.category} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4 font-semibold text-slate-800">{formatCategory(metric.category)}</td>
                <td className="px-4 py-3">{formatPercent(metric.precision)}</td>
                <td className="px-4 py-3">{formatPercent(metric.recall)}</td>
                <td className="px-4 py-3">{formatPercent(metric.f1)}</td>
                <td className="px-4 py-3">{metric.support}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-950">Confusion Matrix</h3>
        <table className="mt-3 min-w-[720px] text-center text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-500">True / Pred</th>
              {categories.map((category) => (
                <th key={category} className="p-2 font-semibold text-slate-600">
                  {formatCategory(category)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((trueCategory) => (
              <tr key={trueCategory}>
                <th className="p-2 text-left font-semibold text-slate-700">{formatCategory(trueCategory)}</th>
                {categories.map((predictedCategory) => {
                  const value = result.confusionMatrix[trueCategory][predictedCategory];
                  const isHit = trueCategory === predictedCategory && value > 0;
                  return (
                    <td
                      key={predictedCategory}
                      className={`border border-white p-2 font-semibold ${
                        isHit ? "bg-emerald-100 text-emerald-800" : value > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Score({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
