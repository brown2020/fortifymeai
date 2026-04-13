"use client";

import { cn } from "@/lib/utils";
import {
  Flame,
  Trophy,
  Award,
  Medal,
  Target,
  Star,
  Crown,
  Footprints,
  Package,
  Boxes,
  Search,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import type { Achievement } from "@/lib/models/user-stats";
import type { Timestamp } from "firebase/firestore";

interface AchievementBadgeProps {
  achievement: Omit<Achievement, "earnedAt"> & { earnedAt?: Timestamp | Date };
  earned: boolean;
  progress?: number;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Trophy,
  Award,
  Medal,
  Target,
  Star,
  Crown,
  Footprints,
  Package,
  Boxes,
  Search,
  BookOpen,
  GraduationCap,
};

export default function AchievementBadge({
  achievement,
  earned,
  progress = 0,
  size = "md",
  showProgress = true,
  className,
}: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Award;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center transition-all",
          sizeClasses[size],
          earned
            ? "bg-gradient-to-br from-amber-500/30 to-yellow-500/30 border-2 border-amber-500/50"
            : "bg-slate-800/50 border-2 border-slate-700/50"
        )}
      >
        <Icon
          className={cn(
            iconSizes[size],
            earned ? "text-amber-400" : "text-slate-500"
          )}
        />
        {!earned && showProgress && progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-700/30"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              className="text-emerald-500/50"
            />
          </svg>
        )}
        {earned && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Star className="h-3 w-3 text-white fill-white" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p
          className={cn(
            "font-medium",
            textSizes[size],
            earned ? "text-white" : "text-slate-500"
          )}
        >
          {achievement.name}
        </p>
        {showProgress && !earned && (
          <p className="text-xs text-slate-500">{Math.round(progress)}%</p>
        )}
      </div>
    </div>
  );
}
