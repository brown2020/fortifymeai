"use client";

import { cn } from "@/lib/utils";

interface AdherenceRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export default function AdherenceRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  className,
  label = "Adherence",
}: AdherenceRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 90) return { stroke: "#10b981", text: "text-emerald-400" }; // emerald
    if (percentage >= 70) return { stroke: "#f59e0b", text: "text-amber-400" }; // amber
    if (percentage >= 50) return { stroke: "#f97316", text: "text-orange-400" }; // orange
    return { stroke: "#ef4444", text: "text-rose-400" }; // rose
  };

  const color = getColor();

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700/50"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold", color.text)}>
          {Math.round(percentage)}%
        </span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
    </div>
  );
}
