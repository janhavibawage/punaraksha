import {
  AlarmClock,
  BellRing,
  Bot,
  Camera,
  FileText,
  GitBranch,
  MapPinned,
  RadioTower,
  Siren,
} from "lucide-react";
import type { AgentAction } from "../../agents/types";
import { formatTime } from "../../utils/format";

const iconByAction = {
  classified: Bot,
  routed: GitBranch,
  notice_drafted: FileText,
  sla_set: AlarmClock,
  escalated: Siren,
  intervention_proposed: RadioTower,
  officer_notified: BellRing,
  evidence_checked: Camera,
};

interface AgentTimelineProps {
  actions: AgentAction[];
}

export function AgentTimeline({ actions }: AgentTimelineProps) {
  return (
    <div className="flex h-full min-h-[520px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Agent Timeline</h2>
            <p className="text-sm text-slate-500">{actions.length} visible actions</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
            <MapPinned className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {actions.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Agent actions will stream here as complaints and forecasts are processed.
          </div>
        ) : (
          <ol className="space-y-3">
            {actions.map((action) => {
              const Icon = iconByAction[action.actionType];
              return (
                <li key={action.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-civic ring-1 ring-slate-200">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase text-slate-500">{action.agent}</span>
                        <span className="text-xs text-slate-400">{formatTime(action.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-800">{action.detail}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
