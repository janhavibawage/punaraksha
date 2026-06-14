import type { GrievanceCategory, Severity } from "../agents/types";

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(iso));
}

export function formatPercent(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatCategory(category?: GrievanceCategory) {
  if (!category) {
    return "Unclassified";
  }

  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function severityClass(severity?: Severity) {
  switch (severity) {
    case "critical":
      return "bg-rose-100 text-rose-700 ring-rose-200";
    case "high":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "medium":
      return "bg-sky-100 text-sky-700 ring-sky-200";
    case "low":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

export function riskTone(score: number) {
  if (score >= 78) {
    return "from-rose-500 to-amber-500 text-white";
  }

  if (score >= 62) {
    return "from-amber-500 to-yellow-400 text-slate-950";
  }

  if (score >= 48) {
    return "from-sky-500 to-teal-400 text-white";
  }

  return "from-emerald-500 to-lime-400 text-slate-950";
}
