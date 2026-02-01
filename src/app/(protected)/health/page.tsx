"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MetricsForm from "@/components/health/MetricsForm";
import MetricsCard from "@/components/health/MetricsCard";
import SideEffectForm from "@/components/health/SideEffectForm";
import SideEffectList from "@/components/health/SideEffectList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getTodayHealthMetrics,
  saveHealthMetrics,
  getRecentHealthMetrics,
} from "@/lib/services/healthMetricsService";
import {
  getRecentSideEffects,
  logSideEffect,
  resolveSideEffect,
  deleteSideEffect,
} from "@/lib/services/sideEffectsService";
import { getUserSupplements } from "@/lib/services/supplementService";
import { HealthMetricEntry, HealthMetricFormData } from "@/lib/models/health-metrics";
import { SideEffectEntry, SideEffectFormData } from "@/lib/models/side-effects";
import { Supplement } from "@/lib/models/supplement";
import { Activity, AlertTriangle, Plus, Heart } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

export default function HealthPage() {
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [todayMetrics, setTodayMetrics] = useState<HealthMetricEntry | null>(null);
  const [yesterdayMetrics, setYesterdayMetrics] = useState<HealthMetricEntry | null>(null);
  const [sideEffects, setSideEffects] = useState<SideEffectEntry[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSideEffectForm, setShowSideEffectForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [metrics, effects, supps, recentMetrics] = await Promise.all([
        getTodayHealthMetrics(user.uid),
        getRecentSideEffects(user.uid, 30),
        getUserSupplements(user.uid),
        getRecentHealthMetrics(user.uid, 2),
      ]);

      setTodayMetrics(metrics);
      setSideEffects(effects);
      setSupplements(supps);

      // Get yesterday's metrics for comparison
      if (recentMetrics.length > 1) {
        setYesterdayMetrics(recentMetrics[1]);
      }
    } catch (error) {
      console.error("Error loading health data:", error);
      addToast("Failed to load health data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMetrics = async (data: HealthMetricFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await saveHealthMetrics(user.uid, data);
      const updated = await getTodayHealthMetrics(user.uid);
      setTodayMetrics(updated);
      addToast("Health check-in saved successfully", "success");
    } catch (error) {
      console.error("Error saving metrics:", error);
      addToast("Failed to save health check-in", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogSideEffect = async (data: SideEffectFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const supplementNames = data.supplementIds.map(
        (id) => supplements.find((s) => s.id === id)?.name || "Unknown"
      );
      await logSideEffect(user.uid, data, supplementNames);
      const updated = await getRecentSideEffects(user.uid, 30);
      setSideEffects(updated);
      setShowSideEffectForm(false);
      addToast("Side effect logged successfully", "success");
    } catch (error) {
      console.error("Error logging side effect:", error);
      addToast("Failed to log side effect", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveSideEffect = async (id: string, resolution?: string) => {
    if (!user) return;
    try {
      await resolveSideEffect(user.uid, id, resolution);
      const updated = await getRecentSideEffects(user.uid, 30);
      setSideEffects(updated);
      addToast("Side effect marked as resolved", "success");
    } catch (error) {
      console.error("Error resolving side effect:", error);
      addToast("Failed to resolve side effect", "error");
    }
  };

  const handleDeleteSideEffect = async (id: string) => {
    if (!user) return;
    try {
      await deleteSideEffect(user.uid, id);
      const updated = await getRecentSideEffects(user.uid, 30);
      setSideEffects(updated);
      addToast("Side effect deleted", "success");
    } catch (error) {
      console.error("Error deleting side effect:", error);
      addToast("Failed to delete side effect", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-700/50 rounded" />
            <div className="h-96 bg-slate-800/30 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const unresolvedCount = sideEffects.filter((e) => !e.resolved).length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Health Tracking</h1>
            <p className="text-slate-400">
              Monitor your wellbeing and track side effects
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unresolvedCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {unresolvedCount} unresolved
                </span>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList>
            <TabsTrigger value="checkin" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Daily Check-in
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Side Effects
              {unresolvedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">
                  {unresolvedCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checkin" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-400" />
                      How are you feeling today?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricsForm
                      initialData={todayMetrics || undefined}
                      onSubmit={handleSaveMetrics}
                      isSubmitting={isSubmitting}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <MetricsCard
                  metrics={{
                    energyLevel: todayMetrics?.energyLevel,
                    sleepQuality: todayMetrics?.sleepQuality,
                    mood: todayMetrics?.mood,
                    focus: todayMetrics?.focus,
                    stressLevel: todayMetrics?.stressLevel,
                    sleepHours: todayMetrics?.sleepHours,
                  }}
                  previousMetrics={
                    yesterdayMetrics
                      ? {
                          energyLevel: yesterdayMetrics.energyLevel,
                          sleepQuality: yesterdayMetrics.sleepQuality,
                          mood: yesterdayMetrics.mood,
                          focus: yesterdayMetrics.focus,
                          stressLevel: yesterdayMetrics.stressLevel,
                          sleepHours: yesterdayMetrics.sleepHours,
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-6">
            {showSideEffectForm ? (
              <SideEffectForm
                supplements={supplements}
                onSubmit={handleLogSideEffect}
                onCancel={() => setShowSideEffectForm(false)}
                isSubmitting={isSubmitting}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Recent Side Effects
                  </h2>
                  <Button onClick={() => setShowSideEffectForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Side Effect
                  </Button>
                </div>

                <SideEffectList
                  sideEffects={sideEffects}
                  onResolve={handleResolveSideEffect}
                  onDelete={handleDeleteSideEffect}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
