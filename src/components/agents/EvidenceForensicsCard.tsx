import { AlertTriangle, Camera, CheckCircle2, Info, ShieldCheck, X } from "lucide-react";
import type { EvidenceAnalysis, EvidenceSignal } from "../../agents/types";

interface EvidenceForensicsCardProps {
  analysis: EvidenceAnalysis;
  compact?: boolean;
  onClear?: () => void;
}

const verdictCopy = {
  likely_original: "Likely original",
  needs_review: "Needs review",
  suspicious: "Suspicious / possible fake",
};

const verdictTone = {
  likely_original: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  needs_review: "bg-amber-50 text-amber-700 ring-amber-200",
  suspicious: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function EvidenceForensicsCard({ analysis, compact = false, onClear }: EvidenceForensicsCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <img
          src={analysis.previewUrl}
          alt="Complaint evidence preview"
          className={`${compact ? "h-20 w-20" : "h-24 w-24"} shrink-0 rounded-lg object-cover`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ShieldCheck className="h-4 w-4 text-civic" aria-hidden="true" />
                Evidence check
              </div>
              <p className="mt-1 truncate text-xs text-slate-500">{analysis.fileName}</p>
            </div>
            {onClear ? (
              <button
                type="button"
                onClick={onClear}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
                title="Remove image"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${verdictTone[analysis.verdict]}`}>
              {verdictCopy[analysis.verdict]}
            </span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {analysis.authenticityScore}/100
            </span>
            {analysis.imageWidth && analysis.imageHeight ? (
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {analysis.imageWidth} x {analysis.imageHeight}
              </span>
            ) : null}
          </div>

          {!compact ? (
            <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <Meta label="Camera" value={[analysis.cameraMake, analysis.cameraModel].filter(Boolean).join(" ") || "not found"} />
              <Meta label="Captured" value={analysis.capturedAt ? formatDate(analysis.capturedAt) : "not found"} />
              <Meta label="Checked" value={formatDate(analysis.checkedAt)} />
              <Meta label="File time" value={analysis.fileLastModified ? formatDate(analysis.fileLastModified) : "not found"} />
              <Meta label="GPS" value={analysis.gpsPresent ? "present" : "not present"} />
              <Meta label="Software" value={analysis.software || "not found"} />
            </div>
          ) : null}
        </div>
      </div>

      <ul className={`${compact ? "mt-3" : "mt-4"} space-y-2`}>
        {analysis.signals.slice(0, compact ? 3 : analysis.signals.length).map((signal) => (
          <li key={`${signal.label}-${signal.detail}`} className="flex gap-2 text-xs leading-5 text-slate-600">
            <SignalIcon signal={signal} />
            <span>
              <span className="font-semibold text-slate-800">{signal.label}:</span> {signal.detail}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-2.5 py-2">
      <span className="font-semibold uppercase text-slate-400">{label}</span>
      <span className="ml-2 font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function SignalIcon({ signal }: { signal: EvidenceSignal }) {
  if (signal.severity === "good") {
    return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />;
  }

  if (signal.severity === "bad" || signal.severity === "warn") {
    return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />;
  }

  if (signal.label === "No GPS") {
    return <Camera className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />;
  }

  return <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
