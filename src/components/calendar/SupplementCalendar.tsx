"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoseLog } from "@/lib/models/dose-log";

interface SupplementCalendarProps {
  doseLogs: DoseLog[];
  onDateSelect?: (date: Date, log?: DoseLog) => void;
  className?: string;
}

export default function SupplementCalendar({
  doseLogs,
  onDateSelect,
  className,
}: SupplementCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Create a map of dateId -> DoseLog for quick lookup
  const logsByDate = useMemo(() => {
    const map = new Map<string, DoseLog>();
    doseLogs.forEach((log) => {
      map.set(log.dateId, log);
    });
    return map;
  }, [doseLogs]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Generate all days to display
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getCompletionColor = (completion: number) => {
    if (completion >= 90) return "bg-emerald-500";
    if (completion >= 70) return "bg-emerald-500/70";
    if (completion >= 50) return "bg-amber-500";
    if (completion > 0) return "bg-rose-500/70";
    return "";
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateId = format(date, "yyyy-MM-dd");
    const log = logsByDate.get(dateId);
    onDateSelect?.(date, log);
  };

  return (
    <div className={cn("glass-card p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
          <div
            key={dayName}
            className="text-center text-xs font-medium text-slate-500 py-2"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayDate) => {
          const dateId = format(dayDate, "yyyy-MM-dd");
          const log = logsByDate.get(dateId);
          const inCurrentMonth = isSameMonth(dayDate, currentMonth);
          const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
          const today = isToday(dayDate);

          return (
            <button
              key={dateId}
              onClick={() => handleDateClick(dayDate)}
              className={cn(
                "relative aspect-square p-1 rounded-lg transition-all",
                "flex flex-col items-center justify-center",
                inCurrentMonth
                  ? "text-white hover:bg-slate-700/50"
                  : "text-slate-600",
                isSelected && "ring-2 ring-emerald-500",
                today && "font-bold"
              )}
            >
              <span className={cn(
                "text-sm",
                today && "text-emerald-400"
              )}>
                {format(dayDate, "d")}
              </span>
              {log && inCurrentMonth && (
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-0.5",
                    getCompletionColor(log.completionRate)
                  )}
                  title={`${log.completionRate}% adherence`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-400">90%+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          <span className="text-xs text-slate-400">70-89%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-400">50-69%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
          <span className="text-xs text-slate-400">&lt;50%</span>
        </div>
      </div>
    </div>
  );
}
