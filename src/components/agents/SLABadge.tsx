import { Clock, CheckCircle2, TriangleAlert } from "lucide-react";
import type { GrievanceStatus } from "../../agents/types";

interface SLABadgeProps {
  deadline?: string;
  status: GrievanceStatus;
  now: string;
}

export function SLABadge({ deadline, status, now }: SLABadgeProps) {
  if (status === "resolved") {
    return <Badge icon={CheckCircle2} className="bg-emerald-50 text-emerald-700 ring-emerald-200" label="Resolved" />;
  }

  if (status === "escalated") {
    return <Badge icon={TriangleAlert} className="bg-rose-50 text-rose-700 ring-rose-200" label="Escalated" />;
  }

  if (!deadline) {
    return <Badge icon={Clock} className="bg-slate-100 text-slate-600 ring-slate-200" label="SLA pending" />;
  }

  const hours = Math.ceil((new Date(deadline).getTime() - new Date(now).getTime()) / 36e5);
  const className =
    hours <= 6
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : hours <= 24
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  return <Badge icon={Clock} className={className} label={`${Math.max(hours, 0)}h left`} />;
}

function Badge({
  icon: Icon,
  className,
  label,
}: {
  icon: typeof Clock;
  className: string;
  label: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
