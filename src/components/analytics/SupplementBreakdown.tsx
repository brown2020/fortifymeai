"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface SupplementBreakdownProps {
  data: { name: string; doses: number; color?: string }[];
  className?: string;
}

const COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
];

export default function SupplementBreakdown({ data, className }: SupplementBreakdownProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
  }));

  const totalDoses = data.reduce((sum, item) => sum + item.doses, 0);

  return (
    <div className={cn("glass-card p-6", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Supplement Breakdown</h3>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-400">No dose data yet</p>
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="doses"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  formatter={(value: unknown) => {
                    const num = typeof value === 'number' ? value : 0;
                    return [`${num} doses (${Math.round((num / totalDoses) * 100)}%)`, ''];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Center stat */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalDoses}</div>
              <div className="text-xs text-slate-400">Total Doses</div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-700/50">
            {chartData.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-300 truncate">{item.name}</span>
                <span className="text-sm text-slate-500 ml-auto">{item.doses}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
