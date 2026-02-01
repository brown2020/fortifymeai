"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface AdherenceChartProps {
  data: { dateId: string; adherence: number }[];
  className?: string;
}

export default function AdherenceChart({ data, className }: AdherenceChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    date: format(parseISO(d.dateId), "MMM d"),
  }));

  const average = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + d.adherence, 0) / data.length)
    : 0;

  return (
    <div className={cn("glass-card p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Adherence Trend</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Avg:</span>
          <span className={cn(
            "font-semibold",
            average >= 80 ? "text-emerald-400" :
            average >= 60 ? "text-amber-400" : "text-rose-400"
          )}>
            {average}%
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#f8fafc" }}
              formatter={(value) => [`${value}%`, "Adherence"]}
            />
            <ReferenceLine
              y={80}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="adherence"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }}
              activeDot={{ fill: "#10b981", strokeWidth: 0, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-slate-400">Adherence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-emerald-500/50 border-dashed" />
          <span className="text-sm text-slate-400">80% Goal</span>
        </div>
      </div>
    </div>
  );
}
