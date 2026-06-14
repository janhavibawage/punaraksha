import { useEffect, useMemo, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Gauge,
  RadioTower,
  ShieldAlert,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricTile } from "../components/MetricTile";
import { SafetyZoneAlertPanel } from "../components/SafetyZoneAlertPanel";
import type { Grievance, GrievanceCategory, Severity } from "../agents/types";
import { routeGrievance } from "../agents/grievanceAgent";
import { classifyText } from "../agents/llmClient";
import { sampleComplaints, wardForecasts, wards } from "../data/mock";
import { useGrievanceStore } from "../store/useGrievanceStore";
import { formatCategory, riskTone } from "../utils/format";

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

const severityWeight: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const funnelColors = ["#0f766e", "#0284c7", "#16a34a", "#d97706", "#64748b", "#e11d48"];

export function DashboardPage() {
  const grievances = useGrievanceStore((state) => state.grievances);
  const loadBackendState = useGrievanceStore((state) => state.loadBackendState);

  useEffect(() => {
    void loadBackendState();
  }, [loadBackendState]);

  const demoGrievances = useMemo(() => makeDemoGrievances(), []);
  const cases = grievances.length > 0 ? grievances : demoGrievances;
  const isDemoBaseline = grievances.length === 0;

  const activeCases = cases.filter((item) => item.status !== "resolved").length;
  const resolvedCases = cases.filter((item) => item.status === "resolved").length;
  const escalatedCases = cases.filter((item) => item.status === "escalated").length;
  const avgAqi = Math.round(wardForecasts.reduce((total, ward) => total + ward.currentAQI, 0) / wardForecasts.length);
  const criticalWards = wardForecasts.filter(
    (ward) => ward.trend === "critical" || ward.forecast7day.slice(0, 3).some((aqi) => aqi > 200),
  ).length;

  const forecastData = Array.from({ length: 7 }, (_, index) => {
    const values = wardForecasts.map((ward) => ward.forecast7day[index]);
    const cityAvg = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    return {
      day: `D${index + 1}`,
      cityAvg,
      upperBand: cityAvg + 24,
      peak: Math.max(...values),
    };
  });

  const wardInsights = wards
    .map((ward) => {
      const forecast = wardForecasts.find((item) => item.wardId === ward.wardId);
      const wardCases = cases.filter((caseItem) => caseItem.wardId === ward.wardId);
      const severeLoad = wardCases.reduce((total, caseItem) => total + severityWeight[caseItem.severity ?? "low"], 0);
      const peakAqi = Math.max(...(forecast?.forecast7day ?? [forecast?.currentAQI ?? 0]));
      const riskScore = Math.min(
        100,
        Math.round(ward.safetyRisk * 0.42 + (peakAqi / 250) * 35 + Math.min(23, severeLoad * 3.5)),
      );

      return {
        ...ward,
        currentAQI: forecast?.currentAQI ?? 0,
        peakAqi,
        trend: forecast?.trend ?? "stable",
        caseCount: wardCases.length,
        severeLoad,
        riskScore,
        riskLevel: riskScore >= 82 ? "Critical" : riskScore >= 68 ? "High" : riskScore >= 52 ? "Watch" : "Stable",
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  const topWard = wardInsights[0];

  const funnelData = [
    { stage: "Filed", value: cases.length },
    { stage: "Classified", value: cases.filter((item) => item.category).length },
    { stage: "Routed", value: cases.filter((item) => item.assignedTo).length },
    { stage: "Notified", value: cases.filter((item) => ["notified", "resolved", "escalated"].includes(item.status)).length },
    { stage: "Resolved", value: resolvedCases },
    { stage: "Escalated", value: escalatedCases },
  ];

  const now = Date.now();
  const slaData = [
    {
      status: "On track",
      value: cases.filter((item) => item.status === "notified" && hoursUntil(item.slaDeadline, now) > 6).length,
      color: "#16a34a",
    },
    {
      status: "Due soon",
      value: cases.filter((item) => item.status === "notified" && hoursUntil(item.slaDeadline, now) <= 6 && hoursUntil(item.slaDeadline, now) >= 0).length,
      color: "#d97706",
    },
    {
      status: "Breached",
      value: cases.filter((item) => item.status === "escalated" || hoursUntil(item.slaDeadline, now) < 0).length,
      color: "#e11d48",
    },
    {
      status: "Resolved",
      value: resolvedCases,
      color: "#64748b",
    },
  ];

  const heatRows = wards.map((ward) => {
    const cells = categories.map((category) => {
      const score = cases
        .filter((caseItem) => caseItem.wardId === ward.wardId && caseItem.category === category)
        .reduce((total, caseItem) => total + severityWeight[caseItem.severity ?? "low"], 0);
      return { category, score };
    });
    return { ward, cells };
  });

  const maxHeat = Math.max(1, ...heatRows.flatMap((row) => row.cells.map((cell) => cell.score)));

  const leaderboardData = wardInsights
    .map((ward) => ({
      ward: ward.wardName,
      responseScore: ward.responseScore,
      escalationRisk: Math.max(0, 100 - ward.responseScore + Math.round(ward.severeLoad * 4)),
    }))
    .sort((a, b) => b.escalationRisk - a.escalationRisk)
    .slice(0, 6);

  const categoryTotals = categories
    .map((category) => ({
      category: formatCategory(category),
      severity: cases
        .filter((caseItem) => caseItem.category === category)
        .reduce((total, caseItem) => total + severityWeight[caseItem.severity ?? "low"], 0),
    }))
    .sort((a, b) => b.severity - a.severity);

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950">
        <img
          src="/images/punaraksha-hero.png"
          alt="Pune civic safety and air quality monitoring scene"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.42]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/45" />
        <div className="relative mx-auto grid min-h-[430px] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-md bg-white/12 px-3 py-1 text-sm font-semibold text-teal-100 ring-1 ring-white/15">
              Pune civic command dashboard
            </span>
            <h1 className="mt-5 text-5xl font-semibold leading-tight text-white sm:text-6xl">PunaRaksha</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-100">
              A clear official view of ward risk, public complaints, SLA pressure, and air-quality intervention readiness.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusPill label={isDemoBaseline ? "Demo baseline" : "Live database"} />
              <StatusPill label={`${topWard.wardName} highest risk`} />
              <StatusPill label={`${criticalWards} AQI watch wards`} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="Open cases" value={String(activeCases)} detail="Cases still needing civic action" icon={ClipboardList} tone="teal" />
            <MetricTile label="SLA breaches" value={String(escalatedCases)} detail="Escalated or overdue cases" icon={AlertTriangle} tone="rose" />
            <MetricTile label="Highest risk" value={String(topWard.riskScore)} detail={`${topWard.wardName} ward risk index`} icon={ShieldAlert} tone="amber" />
            <MetricTile label="Avg AQI" value={String(avgAqi)} detail="Current citywide ward average" icon={Activity} tone="sky" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Operational Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Key indicators are shown first. Detailed intelligence is available below for officers and admins.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-100">Stable</span>
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-100">Watch</span>
              <span className="rounded-md bg-rose-50 px-2.5 py-1 text-rose-700 ring-1 ring-rose-100">Critical</span>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <SafetyZoneAlertPanel />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            title="Ward Risk Command Map"
            subtitle="Main ward priority view. Each tile combines safety, AQI, and complaint severity."
            action={`${wardInsights.length} wards`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {wardInsights.map((ward) => (
                <div key={ward.wardId} className={`min-h-28 rounded-lg bg-gradient-to-br p-3 shadow-sm ${riskTone(ward.riskScore)}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{ward.wardName}</p>
                      <p className="mt-1 text-xs font-semibold opacity-80">{ward.riskLevel}</p>
                    </div>
                    <span className="rounded-md bg-white/20 px-2 py-1 text-xs font-semibold">{ward.wardId}</span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold">{ward.riskScore}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold opacity-90">
                    <span>AQI {ward.currentAQI}</span>
                    <span>Peak {ward.peakAqi}</span>
                    <span>Cases {ward.caseCount}</span>
                    <span>{ward.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="AQI Forecast With Risk Threshold"
            subtitle="Shows city average, ward peak, and the AQI 200 danger threshold."
            action="7 days"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 12, right: 18, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <ReferenceLine y={200} stroke="#e11d48" strokeDasharray="5 5" label={{ value: "AQI 200", fontSize: 12, fill: "#e11d48" }} />
                  <Area type="monotone" dataKey="upperBand" stroke="transparent" fill="url(#aqiBand)" />
                  <Line type="monotone" dataKey="cityAvg" name="City avg" stroke="#0f766e" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="peak" name="Ward peak" stroke="#e11d48" strokeWidth={3} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Complaint Funnel" subtitle="Compact view of the civic response pipeline." action={`${cases.length} cases`}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="stage" width={72} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={entry.stage} fill={funnelColors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="SLA Health" subtitle="Healthy queue, urgent queue, breaches, and closures." action="response control">
            <div className="grid gap-3 md:grid-cols-4">
              {slaData.map((item) => (
                <div key={item.status} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-500">{item.status}</span>
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <details className="mt-5 rounded-lg border border-slate-200 bg-white shadow-sm">
          <summary className="cursor-pointer px-5 py-4 text-lg font-semibold text-slate-950">
            Detailed Intelligence
            <span className="ml-3 text-sm font-medium text-slate-500">Category heat, response pressure, and recommendations</span>
          </summary>
          <div className="border-t border-slate-200 p-5">
            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <Panel
                title="Ward x Category Heat Matrix"
                subtitle="Complaint clusters by ward, weighted by severity."
                action="severity weighted"
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[820px]">
                    <div className="grid grid-cols-[130px_repeat(8,1fr)] gap-1 text-xs font-semibold text-slate-500">
                      <div />
                      {categories.map((category) => (
                        <div key={category} className="truncate px-1 text-center">
                          {formatCategory(category)}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 space-y-1">
                      {heatRows.map((row) => (
                        <div key={row.ward.wardId} className="grid grid-cols-[130px_repeat(8,1fr)] gap-1">
                          <div className="flex min-h-9 items-center rounded-md bg-slate-100 px-2 text-xs font-semibold text-slate-700">
                            {row.ward.wardName}
                          </div>
                          {row.cells.map((cell) => (
                            <div
                              key={cell.category}
                              className="flex min-h-9 items-center justify-center rounded-md text-xs font-semibold"
                              style={heatCellStyle(cell.score, maxHeat)}
                              title={`${row.ward.wardName} ${formatCategory(cell.category)}: ${cell.score}`}
                            >
                              {cell.score || ""}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel title="Response Pressure Leaderboard" subtitle="Wards at risk of escalation." action="top 6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaderboardData} margin={{ top: 12, right: 14, left: -14, bottom: 48 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="ward" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="escalationRisk" name="Escalation risk" fill="#e11d48" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="responseScore" name="Response score" fill="#0f766e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <Panel title="Category Load" subtitle="Complaint categories by severity-weighted pressure." action="priority">
                <div className="space-y-3">
                  {categoryTotals.slice(0, 6).map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-800">{item.category}</span>
                        <span className="shrink-0 text-slate-500">{item.severity} pressure</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-civic"
                          style={{ width: `${Math.min(100, (item.severity / Math.max(1, categoryTotals[0]?.severity ?? 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Command Recommendations" subtitle="Plain-English actions from dashboard signals." action="next moves">
                <div className="grid gap-3 md:grid-cols-3">
                  <Recommendation icon={Gauge} title="Focus Ward" text={`${topWard.wardName} needs the next field review: risk ${topWard.riskScore}, AQI peak ${topWard.peakAqi}.`} />
                  <Recommendation icon={TimerReset} title="SLA Watch" text={`${slaData[1].value + slaData[2].value} case(s) need attention before trust drops.`} />
                  <Recommendation icon={RadioTower} title="AQI Action" text={`${criticalWards} ward(s) cross the AQI watch threshold; prepare dust control and advisories.`} />
                </div>
              </Panel>
            </div>
          </div>
        </details>
      </section>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{action}</span>
      </div>
      {children}
    </section>
  );
}

function StatusPill({ label }: { label: string }) {
  return <span className="rounded-md bg-white/12 px-3 py-1 text-sm font-semibold text-slate-100 ring-1 ring-white/15">{label}</span>;
}

function Recommendation({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-civic" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function makeDemoGrievances(): Grievance[] {
  const statuses: Grievance["status"][] = [
    "notified",
    "notified",
    "escalated",
    "resolved",
    "notified",
    "triaged",
    "resolved",
    "notified",
  ];

  return sampleComplaints.map((complaint, index) => {
    const classification = classifyText(complaint.text);
    const filedAt = new Date();
    filedAt.setHours(filedAt.getHours() - index * 5);
    const deadline = new Date(filedAt);
    deadline.setHours(deadline.getHours() + (classification.severity === "critical" ? 4 : classification.severity === "high" ? 24 : 72));
    const status = statuses[index % statuses.length];

    return {
      id: `demo-${index}`,
      text: complaint.text,
      wardId: complaint.wardId,
      timestamp: filedAt.toISOString(),
      category: classification.category,
      severity: classification.severity,
      confidence: classification.confidence,
      assignedTo: routeGrievance(classification.category, complaint.wardId),
      status,
      slaDeadline: deadline.toISOString(),
      noticeDraft: undefined,
    };
  });
}

function hoursUntil(deadline: string | undefined, now: number) {
  if (!deadline) {
    return Number.POSITIVE_INFINITY;
  }

  return (new Date(deadline).getTime() - now) / 36e5;
}

function heatCellStyle(score: number, maxScore: number) {
  if (score === 0) {
    return {
      backgroundColor: "#f8fafc",
      color: "#94a3b8",
    };
  }

  const opacity = 0.18 + (score / maxScore) * 0.72;
  return {
    backgroundColor: `rgba(225, 29, 72, ${opacity})`,
    color: opacity > 0.52 ? "#ffffff" : "#9f1239",
  };
}
