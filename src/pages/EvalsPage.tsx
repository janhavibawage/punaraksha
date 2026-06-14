import { FlaskConical } from "lucide-react";
import { AgentEvalPanel } from "../components/evals/AgentEvalPanel";
import { ForecastEvalPanel } from "../components/evals/ForecastEvalPanel";
import { NlpEvalPanel } from "../components/evals/NlpEvalPanel";

export function EvalsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-civic">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Model and agent proof
        </div>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">Evals</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Classifier accuracy, routing correctness, and forecast backtesting for the PunaRaksha demo.
        </p>
      </div>

      <div className="space-y-5">
        <NlpEvalPanel />
        <AgentEvalPanel />
        <ForecastEvalPanel />
      </div>
    </main>
  );
}
