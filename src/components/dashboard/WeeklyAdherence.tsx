"use client";

import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface WeeklyAdherenceProps {
  adherenceData: number[]; // 7 days of adherence percentages, index 0 = oldest
  className?: string;
}

export default function WeeklyAdherence({
  adherenceData,
  className,
}: WeeklyAdherenceProps) {
  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-500";
    if (percentage >= 70) return "bg-amber-500";
    if (percentage >= 50) return "bg-orange-500";
    if (percentage > 0) return "bg-rose-500";
    return "bg-slate-700";
  };

  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(today, 6 - i);
    return {
      label: format(date, "EEE"),
      date: format(date, "MMM d"),
      percentage: adherenceData[i] ?? 0,
    };
  });

  const maxHeight = 60;

  return (
    <div className={cn("glass-card p-6", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Overview</h3>

      <div className="flex items-end justify-between gap-2 h-24">
        {days.map((day, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="relative w-full flex items-end justify-center"
              style={{ height: maxHeight }}
            >
              <div
                className={cn(
                  "w-full max-w-8 rounded-t-md transition-all duration-300",
                  getBarColor(day.percentage)
                )}
                style={{
                  height: `${Math.max((day.percentage / 100) * maxHeight, 4)}px`,
                }}
                title={`${day.percentage}%`}
              />
            </div>
            <span className="text-xs text-slate-400">{day.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-400">90%+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-slate-400">70-89%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-400">&lt;70%</span>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          Avg:{" "}
          <span className="font-medium text-white">
            {Math.round(
              adherenceData.reduce((a, b) => a + b, 0) / Math.max(adherenceData.filter(d => d > 0).length, 1)
            )}%
          </span>
        </div>
      </div>
    </div>
  );
}
