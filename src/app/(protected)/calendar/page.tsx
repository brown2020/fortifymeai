"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import SupplementCalendar from "@/components/calendar/SupplementCalendar";
import DayDetail from "@/components/calendar/DayDetail";
import { getRecentDoseLogs } from "@/lib/services/doseLogService";
import { DoseLog } from "@/lib/models/dose-log";
import { Calendar } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

export default function CalendarPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLog, setSelectedLog] = useState<DoseLog | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Load 90 days of data for the calendar
      const logs = await getRecentDoseLogs(user.uid, 90);
      setDoseLogs(logs);
    } catch (error) {
      console.error("Error loading calendar data:", error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date, log?: DoseLog) => {
    setSelectedDate(date);
    setSelectedLog(log);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-700/50 rounded" />
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3 h-96 bg-slate-800/30 rounded-2xl" />
              <div className="lg:col-span-2 h-96 bg-slate-800/30 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const logsWithData = doseLogs.filter((log) => log.entries.length > 0);
  const perfectDays = doseLogs.filter((log) => log.completionRate === 100).length;
  const averageAdherence = logsWithData.length > 0
    ? Math.round(logsWithData.reduce((sum, log) => sum + log.completionRate, 0) / logsWithData.length)
    : 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-slate-400">
              View your supplement history and daily logs
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">{logsWithData.length}</div>
            <div className="text-sm text-slate-400">Days Logged</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{perfectDays}</div>
            <div className="text-sm text-slate-400">Perfect Days</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">{averageAdherence}%</div>
            <div className="text-sm text-slate-400">Avg Adherence</div>
          </div>
        </div>

        {/* Calendar and Detail */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SupplementCalendar
              doseLogs={doseLogs}
              onDateSelect={handleDateSelect}
            />
          </div>
          <div className="lg:col-span-2">
            <DayDetail date={selectedDate} doseLog={selectedLog} />
          </div>
        </div>
      </div>
    </div>
  );
}
