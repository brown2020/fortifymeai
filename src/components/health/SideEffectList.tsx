"use client";

import { cn } from "@/lib/utils";
import { SideEffectEntry, SIDE_EFFECT_CATEGORIES } from "@/lib/models/side-effects";
import { format } from "date-fns";
import { AlertTriangle, AlertCircle, Info, CheckCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SideEffectListProps {
  sideEffects: SideEffectEntry[];
  onResolve?: (id: string, resolution?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  className?: string;
}

export default function SideEffectList({
  sideEffects,
  onResolve,
  onDelete,
  className,
}: SideEffectListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "severe":
        return AlertTriangle;
      case "moderate":
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case "severe":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "moderate":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
    }
  };

  const handleResolve = async (id: string) => {
    if (onResolve) {
      await onResolve(id, resolution || undefined);
      setResolvingId(null);
      setResolution("");
    }
  };

  if (sideEffects.length === 0) {
    return (
      <div className={cn("glass-card p-6", className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-400/50 mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No Side Effects</h3>
          <p className="text-sm text-slate-400">
            You haven't logged any side effects yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {sideEffects.map((effect) => {
        const Icon = getSeverityIcon(effect.severity);
        const isResolving = resolvingId === effect.id;

        return (
          <div
            key={effect.id}
            className={cn(
              "rounded-lg border p-4",
              effect.resolved
                ? "bg-slate-800/20 border-slate-700/30"
                : getSeverityClasses(effect.severity)
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 mt-0.5",
                    effect.resolved ? "text-slate-500" : ""
                  )}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium",
                        effect.resolved ? "text-slate-400" : "text-white"
                      )}
                    >
                      {effect.symptom}
                    </span>
                    {effect.resolved && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">
                    {SIDE_EFFECT_CATEGORIES[effect.category]?.label} ·{" "}
                    {effect.supplementNames.join(", ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(effect.date.toDate(), "MMM d, yyyy 'at' h:mm a")}
                    {effect.duration && ` · Duration: ${effect.duration}`}
                  </p>
                  {effect.notes && (
                    <p className="text-sm text-slate-400 mt-2">{effect.notes}</p>
                  )}
                  {effect.resolved && effect.resolution && (
                    <p className="text-sm text-emerald-400/80 mt-2">
                      Resolution: {effect.resolution}
                    </p>
                  )}
                </div>
              </div>

              {!effect.resolved && (onResolve || onDelete) && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setOpenMenuId(openMenuId === effect.id ? null : effect.id)
                    }
                    className="h-8 w-8"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {openMenuId === effect.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-10">
                      {onResolve && (
                        <button
                          onClick={() => {
                            setResolvingId(effect.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-emerald-400 hover:bg-slate-700"
                        >
                          Mark as Resolved
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete(effect.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-slate-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isResolving && (
              <div className="mt-4 pt-4 border-t border-current/20 space-y-3">
                <input
                  type="text"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="What helped resolve this? (optional)"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setResolvingId(null);
                      setResolution("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleResolve(effect.id)}>
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
