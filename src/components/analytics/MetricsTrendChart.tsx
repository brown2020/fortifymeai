"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { HealthMetricsTrend } from "@/lib/models/health-metrics";
import { useState } from "react";

interface MetricsTrendChartProps {
  data: HealthMetricsTrend[];
  className?: string;
}

const METRICS_CONFIG = {
  energyLevel: { label: "Energy", color: "#facc15" },
  sleepQuality: { label: "Sleep", color: "#818cf8" },
  mood: { label: "Mood", color: "#4ade80" },
  focus: { label: "Focus", color: "#38bdf8" },
  stressLevel: { label: "Stress", color: "#f87171" },
};

type MetricKey = keyof typeof METRICS_CONFIG;

export default function MetricsTrendChart({ data, className }: MetricsTrendChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricKey>>(
    new Set(["energyLevel", "mood", "sleepQuality"])
  );

  const chartData = data.map((d) => ({
    ...d,
    date: format(d.date, "MMM d"),
  }));

  const toggleMetric = (metric: MetricKey) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(metric)) {
        next.delete(metric);
      } else {
        next.add(metric);
      }
      return next;
    });
  };

  return (
    <div className={cn("glass-card p-6", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Health Metrics Trend</h3>

      {/* Metric toggles */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.entries(METRICS_CONFIG) as [MetricKey, { label: string; color: string }][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                visibleMetrics.has(key)
                  ? "border-current"
                  : "border-slate-700 text-slate-500"
              )}
              style={{
                backgroundColor: visibleMetrics.has(key) ? `${config.color}20` : undefined,
                borderColor: visibleMetrics.has(key) ? `${config.color}50` : undefined,
                color: visibleMetrics.has(key) ? config.color : undefined,
              }}
            >
              {config.label}
            </button>
          )
        )}
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
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#f8fafc" }}
            />
            {(Object.entries(METRICS_CONFIG) as [MetricKey, { label: string; color: string }][]).map(
              ([key, config]) =>
                visibleMetrics.has(key) && (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={config.label}
                    stroke={config.color}
                    strokeWidth={2}
                    dot={{ fill: config.color, strokeWidth: 0, r: 3 }}
                    activeDot={{ fill: config.color, strokeWidth: 0, r: 5 }}
                    connectNulls
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-400">No health metrics data yet</p>
        </div>
      )}
    </div>
  );
}
