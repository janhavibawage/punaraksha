import { BellRing, CheckCircle2, RadioTower } from "lucide-react";
import type { Intervention } from "../../agents/types";

interface InterventionCardProps {
  intervention: Intervention;
  onNotify: (id: string) => void;
}

export function InterventionCard({ intervention, onNotify }: InterventionCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-civic">
            <RadioTower className="h-4 w-4" aria-hidden="true" />
            Day {intervention.triggerDay} trigger
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{intervention.wardName}</h3>
          <p className="mt-1 text-sm text-slate-500">Projected AQI {intervention.triggerAQI}</p>
        </div>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
            intervention.status === "notified"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-amber-50 text-amber-700 ring-amber-200"
          }`}
        >
          {intervention.status}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {intervention.proposedActions.map((action) => (
          <li key={action} className="flex gap-2 text-sm leading-6 text-slate-700">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>{action}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onNotify(intervention.id)}
        disabled={intervention.status === "notified"}
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-civic disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <BellRing className="h-4 w-4" aria-hidden="true" />
        Notify Ward Officer
      </button>
    </article>
  );
}
