import { GitBranch } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { runAgentEval } from "../../evals/agentEval";
import { formatCategory, formatPercent } from "../../utils/format";

export function AgentEvalPanel() {
  const result = runAgentEval();
  const chartData = result.byCategory.map((row) => ({
    category: formatCategory(row.category),
    accuracy: Math.round(row.accuracy * 100),
    total: row.total,
  }));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-civic">
        <GitBranch className="h-4 w-4" aria-hidden="true" />
        Agent Decision Eval
      </div>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
        Routing accuracy is {formatPercent(result.overallAccuracy)} across {result.total} labeled cases.
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        The rule-based agent maps each classified complaint to the expected municipal department and ward office.
      </p>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -12, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={64} />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value}%`, "Accuracy"]} />
            <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} fill="#0f766e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
