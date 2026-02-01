"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DoseLog, DoseLogEntry } from "@/lib/models/dose-log";
import { Check, X, Clock, SkipForward } from "lucide-react";

interface DayDetailProps {
  date: Date;
  doseLog?: DoseLog;
  className?: string;
}

export default function DayDetail({ date, doseLog, className }: DayDetailProps) {
  const getScheduleTimeLabel = (time: string) => {
    switch (time) {
      case "morning":
        return "Morning";
      case "midday":
        return "Midday";
      case "evening":
        return "Evening";
      case "bedtime":
        return "Bedtime";
      default:
        return time;
    }
  };

  const getStatusIcon = (entry: DoseLogEntry) => {
    if (entry.taken) {
      return <Check className="h-4 w-4 text-emerald-400" />;
    }
    if (entry.skipped) {
      return <SkipForward className="h-4 w-4 text-amber-400" />;
    }
    return <X className="h-4 w-4 text-rose-400" />;
  };

  const groupedEntries = doseLog?.entries.reduce((acc, entry) => {
    const time = entry.scheduledTime;
    if (!acc[time]) acc[time] = [];
    acc[time].push(entry);
    return acc;
  }, {} as Record<string, DoseLogEntry[]>);

  return (
    <div className={cn("glass-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {format(date, "EEEE, MMMM d")}
        </h3>
        {doseLog && (
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            doseLog.completionRate >= 80
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : doseLog.completionRate >= 50
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
          )}>
            {doseLog.completionRate}% Complete
          </div>
        )}
      </div>

      {!doseLog || doseLog.entries.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No supplements logged for this day</p>
        </div>
      ) : (
        <div className="space-y-4">
          {["morning", "midday", "evening", "bedtime"].map((timeSlot) => {
            const entries = groupedEntries?.[timeSlot];
            if (!entries || entries.length === 0) return null;

            return (
              <div key={timeSlot}>
                <h4 className="text-sm font-medium text-slate-400 mb-2">
                  {getScheduleTimeLabel(timeSlot)}
                </h4>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1.5 rounded-full",
                          entry.taken
                            ? "bg-emerald-500/20"
                            : entry.skipped
                            ? "bg-amber-500/20"
                            : "bg-rose-500/20"
                        )}>
                          {getStatusIcon(entry)}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {entry.supplementName}
                          </div>
                          {entry.dosageAmount && entry.dosageUnit && (
                            <div className="text-xs text-slate-500">
                              {entry.dosageAmount} {entry.dosageUnit}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {entry.taken ? (
                          <span className="text-xs text-emerald-400">Taken</span>
                        ) : entry.skipped ? (
                          <span className="text-xs text-amber-400">
                            {entry.skipReason || "Skipped"}
                          </span>
                        ) : (
                          <span className="text-xs text-rose-400">Missed</span>
                        )}
                        {entry.actualTime && (
                          <div className="text-xs text-slate-500">
                            {format(entry.actualTime.toDate(), "h:mm a")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Notes section */}
          {doseLog.entries.some((e) => e.notes) && (
            <div className="pt-4 border-t border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Notes</h4>
              {doseLog.entries
                .filter((e) => e.notes)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="text-sm text-slate-300 bg-slate-800/30 rounded-lg p-3 mb-2"
                  >
                    <span className="font-medium">{entry.supplementName}:</span>{" "}
                    {entry.notes}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
