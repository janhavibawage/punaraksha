import { Activity } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { runForecastEval } from "../../evals/forecastEval";

export function ForecastEvalPanel() {
  const result = runForecastEval();
  const worstWard = [...result.wardResults].sort((a, b) => b.mape - a.mape)[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-civic">
        <Activity className="h-4 w-4" aria-hidden="true" />
        Forecast Eval
      </div>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
        Forecast backtest MAPE is {result.overallMape.toFixed(1)}% across Pune wards.
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        The chart shows predicted versus actual AQI for {worstWard.wardName}, the most difficult ward in this test set.
      </p>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={worstWard.series} margin={{ top: 10, right: 18, left: -12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="actual" stroke="#e11d48" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="predicted" stroke="#0f766e" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="py-2 pr-4 font-semibold">Ward</th>
              <th className="px-4 py-2 font-semibold">MAPE</th>
            </tr>
          </thead>
          <tbody>
            {result.wardResults.map((ward) => (
              <tr key={ward.wardId} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4 font-semibold text-slate-800">{ward.wardName}</td>
                <td className="px-4 py-3">{ward.mape.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
