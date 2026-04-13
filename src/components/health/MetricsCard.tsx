"use client";

import { cn } from "@/lib/utils";
import { HEALTH_METRICS } from "@/lib/models/health-metrics";
import { Zap, Moon, Smile, Target, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricsCardProps {
  metrics: {
    energyLevel?: number;
    sleepQuality?: number;
    mood?: number;
    focus?: number;
    stressLevel?: number;
    sleepHours?: number;
  };
  previousMetrics?: {
    energyLevel?: number;
    sleepQuality?: number;
    mood?: number;
    focus?: number;
    stressLevel?: number;
    sleepHours?: number;
  };
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Moon,
  Smile,
  Target,
  Activity,
};

export default function MetricsCard({
  metrics,
  previousMetrics,
  className,
}: MetricsCardProps) {
  const getScoreColor = (value: number, isStress = false) => {
    // For stress, lower is better
    const effectiveValue = isStress ? 11 - value : value;
    if (effectiveValue >= 8) return "text-emerald-400";
    if (effectiveValue >= 6) return "text-amber-400";
    if (effectiveValue >= 4) return "text-orange-400";
    return "text-rose-400";
  };

  const getTrend = (current?: number, previous?: number, isStress = false) => {
    if (current === undefined || previous === undefined) return null;
    const diff = current - previous;
    // For stress, going down is good
    const isImprovement = isStress ? diff < 0 : diff > 0;
    const isDecline = isStress ? diff > 0 : diff < 0;

    if (Math.abs(diff) < 0.5) {
      return { icon: Minus, color: "text-slate-400", label: "Stable" };
    }
    if (isImprovement) {
      return { icon: TrendingUp, color: "text-emerald-400", label: `+${Math.abs(diff).toFixed(1)}` };
    }
    if (isDecline) {
      return { icon: TrendingDown, color: "text-rose-400", label: `-${Math.abs(diff).toFixed(1)}` };
    }
    return null;
  };

  const renderMetric = (
    key: keyof typeof HEALTH_METRICS,
    value?: number
  ) => {
    const info = HEALTH_METRICS[key];
    const Icon = iconMap[info.icon] || Activity;
    const isStress = key === "stressLevel";
    const trend = getTrend(
      value,
      previousMetrics?.[key],
      isStress
    );

    return (
      <div
        key={key}
        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-700/50">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
          <span className="text-sm text-slate-300">{info.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <div className={cn("flex items-center gap-1", trend.color)}>
              <trend.icon className="h-3 w-3" />
              <span className="text-xs">{trend.label}</span>
            </div>
          )}
          <span
            className={cn(
              "text-lg font-semibold",
              value !== undefined ? getScoreColor(value, isStress) : "text-slate-500"
            )}
          >
            {value ?? "-"}
          </span>
        </div>
      </div>
    );
  };

  const hasAnyMetric = Object.values(metrics).some((v) => v !== undefined);

  if (!hasAnyMetric) {
    return (
      <div className={cn("glass-card p-6", className)}>
        <h3 className="text-lg font-semibold text-white mb-4">Today&apos;s Check-in</h3>
        <p className="text-slate-400 text-center py-8">
          No health metrics logged today.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-6", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Today&apos;s Check-in</h3>
      <div className="space-y-2">
        {(Object.keys(HEALTH_METRICS) as (keyof typeof HEALTH_METRICS)[]).map(
          (key) => renderMetric(key, metrics[key])
        )}
        {metrics.sleepHours !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <Moon className="h-4 w-4 text-slate-400" />
              </div>
              <span className="text-sm text-slate-300">Sleep Duration</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {metrics.sleepHours}h
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
