import { CheckCircle2, FileText, MapPin } from "lucide-react";
import type { Grievance } from "../../agents/types";
import { formatCategory, formatTime, severityClass } from "../../utils/format";
import { EvidenceForensicsCard } from "./EvidenceForensicsCard";
import { SLABadge } from "./SLABadge";

interface GrievanceCardProps {
  grievance: Grievance;
  now: string;
  onResolve: (id: string) => void;
}

export function GrievanceCard({ grievance, now, onResolve }: GrievanceCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-600">
              {grievance.status}
            </span>
            <SLABadge deadline={grievance.slaDeadline} status={grievance.status} now={now} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-800">{grievance.text}</p>
        </div>
        <button
          type="button"
          onClick={() => onResolve(grievance.id)}
          disabled={grievance.status === "resolved"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          title="Mark resolved"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <Info icon={MapPin} label="Ward" value={grievance.wardId} />
        <Info icon={FileText} label="Filed" value={formatTime(grievance.timestamp)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
          {formatCategory(grievance.category)}
        </span>
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${severityClass(grievance.severity)}`}>
          {grievance.severity ?? "severity pending"}
        </span>
        {grievance.confidence ? (
          <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            {Math.round(grievance.confidence * 100)}% confidence
          </span>
        ) : null}
      </div>

      {grievance.assignedTo ? (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700">{grievance.assignedTo}</p>
      ) : null}

      {grievance.evidence ? (
        <div className="mt-4">
          <EvidenceForensicsCard analysis={grievance.evidence} compact />
        </div>
      ) : null}

      {grievance.noticeDraft ? (
        <details className="mt-3 rounded-lg border border-slate-200 bg-white">
          <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-700">Notice draft</summary>
          <p className="border-t border-slate-200 px-3 py-3 text-sm leading-6 text-slate-600">{grievance.noticeDraft}</p>
        </details>
      ) : null}
    </article>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
      <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
      <span className="text-xs font-semibold uppercase">{label}</span>
      <span className="ml-auto font-semibold text-slate-900">{value}</span>
    </div>
  );
}
