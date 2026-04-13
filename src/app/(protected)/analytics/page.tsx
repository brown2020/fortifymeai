"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdherenceChart from "@/components/analytics/AdherenceChart";
import MetricsTrendChart from "@/components/analytics/MetricsTrendChart";
import SupplementBreakdown from "@/components/analytics/SupplementBreakdown";
import StreakCard from "@/components/dashboard/StreakCard";
import AdherenceRing from "@/components/dashboard/AdherenceRing";
import AchievementBadge from "@/components/dashboard/AchievementBadge";
import { getRecentDoseLogs } from "@/lib/services/doseLogService";
import { getHealthMetricsTrend } from "@/lib/services/healthMetricsService";
import { getUserStats, getAchievementProgress, getStreakInfo } from "@/lib/services/userStatsService";
import { getUserSupplements } from "@/lib/services/supplementService";
import { DoseLog } from "@/lib/models/dose-log";
import { HealthMetricsTrend } from "@/lib/models/health-metrics";
import { ACHIEVEMENTS } from "@/lib/models/user-stats";
import { Supplement } from "@/lib/models/supplement";
import { TrendingUp, Award, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [healthTrend, setHealthTrend] = useState<HealthMetricsTrend[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<
    { achievement: typeof ACHIEVEMENTS[number]; progress: number; earned: boolean }[]
  >([]);
  const [streakInfo, setStreakInfo] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    isActiveToday: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [logs, health, , supps, achievements, streak] = await Promise.all([
        getRecentDoseLogs(user.uid, timeRange),
        getHealthMetricsTrend(user.uid, timeRange),
        getUserStats(user.uid),
        getUserSupplements(user.uid),
        getAchievementProgress(user.uid),
        getStreakInfo(user.uid),
      ]);

      setDoseLogs(logs);
      setHealthTrend(health);
      setSupplements(supps);
      setAchievementProgress(achievements);
      setStreakInfo(streak);
    } catch {
      addToast("Failed to load analytics data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [user, timeRange, addToast]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Calculate adherence chart data
  const adherenceData = useMemo(() => {
    return doseLogs.map((log) => ({
      dateId: log.dateId,
      adherence: log.completionRate,
    })).reverse();
  }, [doseLogs]);

  // Calculate supplement breakdown
  const supplementBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    doseLogs.forEach((log) => {
      log.entries.forEach((entry) => {
        if (entry.taken) {
          counts[entry.supplementName] = (counts[entry.supplementName] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .map(([name, doses]) => ({ name, doses }))
      .sort((a, b) => b.doses - a.doses);
  }, [doseLogs]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-700/50 rounded" />
            <div className="grid gap-6 md:grid-cols-3">
              <div className="h-48 bg-slate-800/30 rounded-2xl" />
              <div className="h-48 bg-slate-800/30 rounded-2xl" />
              <div className="h-48 bg-slate-800/30 rounded-2xl" />
            </div>
            <div className="h-80 bg-slate-800/30 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const doseStats = {
    totalTaken: doseLogs.reduce((sum, log) => sum + log.entries.filter((e) => e.taken).length, 0),
    totalScheduled: doseLogs.reduce((sum, log) => sum + log.entries.length, 0),
  };
  const overallAdherence = doseStats.totalScheduled > 0
    ? Math.round((doseStats.totalTaken / doseStats.totalScheduled) * 100)
    : 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-slate-400">
              Track your supplement journey and progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 14, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === days
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{doseStats.totalTaken}</div>
              <div className="text-sm text-slate-400">Doses Taken</div>
            </div>
          </div>

          <div className="glass-card p-6 flex items-center gap-4">
            <AdherenceRing percentage={overallAdherence} size={80} />
            <div>
              <div className="text-sm text-slate-400">Overall Adherence</div>
              <div className="text-xs text-slate-500">Last {timeRange} days</div>
            </div>
          </div>

          <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Award className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {achievementProgress.filter((a) => a.earned).length}
              </div>
              <div className="text-sm text-slate-400">Achievements</div>
            </div>
          </div>

          <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{supplements.length}</div>
              <div className="text-sm text-slate-400">Supplements</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AdherenceChart data={adherenceData} />
          <SupplementBreakdown data={supplementBreakdown} />
        </div>

        {/* Health Metrics & Streak */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MetricsTrendChart data={healthTrend} />
          </div>
          <StreakCard
            currentStreak={streakInfo.currentStreak}
            longestStreak={streakInfo.longestStreak}
            isActiveToday={streakInfo.isActiveToday}
          />
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {achievementProgress.slice(0, 16).map(({ achievement, progress, earned }) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  earned={earned}
                  progress={progress}
                  size="sm"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
