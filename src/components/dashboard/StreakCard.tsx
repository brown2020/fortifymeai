"use client";

import { Flame, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  className?: string;
}

export default function StreakCard({
  currentStreak,
  longestStreak,
  isActiveToday,
  className,
}: StreakCardProps) {
  const getStreakColor = () => {
    if (currentStreak >= 30) return "text-amber-400";
    if (currentStreak >= 14) return "text-orange-400";
    if (currentStreak >= 7) return "text-emerald-400";
    return "text-slate-400";
  };

  const getStreakMessage = () => {
    if (!isActiveToday) return "Log today to keep your streak!";
    if (currentStreak >= 100) return "Incredible dedication!";
    if (currentStreak >= 30) return "One month strong!";
    if (currentStreak >= 14) return "Two weeks going!";
    if (currentStreak >= 7) return "One week down!";
    if (currentStreak >= 3) return "Building momentum!";
    return "Keep it going!";
  };

  return (
    <div className={cn("glass-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Streak</h3>
        {isActiveToday ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active Today
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Not Logged Yet
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          "p-3 rounded-xl bg-gradient-to-br",
          currentStreak > 0
            ? "from-orange-500/20 to-amber-500/20 border border-orange-500/30"
            : "from-slate-500/20 to-slate-600/20 border border-slate-500/30"
        )}>
          <Flame className={cn("h-8 w-8", getStreakColor())} />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-4xl font-bold", getStreakColor())}>
              {currentStreak}
            </span>
            <span className="text-slate-400 text-lg">
              day{currentStreak !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-sm text-slate-400">{getStreakMessage()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <div>
            <div className="text-sm text-slate-400">Longest</div>
            <div className="font-semibold text-white">{longestStreak} days</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" />
          <div>
            <div className="text-sm text-slate-400">Status</div>
            <div className="font-semibold text-white">
              {isActiveToday ? "On Track" : "Pending"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
