"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HealthMetricFormData, HEALTH_METRICS } from "@/lib/models/health-metrics";
import { Zap, Moon, Smile, Target, Activity, Save } from "lucide-react";

interface MetricsFormProps {
  initialData?: Partial<HealthMetricFormData>;
  onSubmit: (data: HealthMetricFormData) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Moon,
  Smile,
  Target,
  Activity,
};

export default function MetricsForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  className,
}: MetricsFormProps) {
  const [formData, setFormData] = useState<HealthMetricFormData>({
    energyLevel: initialData?.energyLevel,
    sleepQuality: initialData?.sleepQuality,
    mood: initialData?.mood,
    focus: initialData?.focus,
    stressLevel: initialData?.stressLevel,
    sleepHours: initialData?.sleepHours,
    notes: initialData?.notes,
  });

  const handleSliderChange = (key: keyof HealthMetricFormData, value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const renderSlider = (
    key: keyof typeof HEALTH_METRICS,
    metricInfo: typeof HEALTH_METRICS[keyof typeof HEALTH_METRICS]
  ) => {
    const Icon = iconMap[metricInfo.icon] || Activity;
    const value = formData[key] as number | undefined;

    return (
      <div key={key} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            <Label className="text-slate-300">{metricInfo.label}</Label>
          </div>
          <span className="text-lg font-semibold text-white">
            {value ?? "-"}/10
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="10"
            value={value ?? 5}
            onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
        <p className="text-xs text-slate-500">{metricInfo.description}</p>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Metrics */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">How are you feeling?</h3>
          {(Object.entries(HEALTH_METRICS) as [keyof typeof HEALTH_METRICS, typeof HEALTH_METRICS[keyof typeof HEALTH_METRICS]][]).map(
            ([key, info]) => renderSlider(key, info)
          )}
        </div>

        {/* Additional Metrics */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Additional Info</h3>

          <div className="space-y-2">
            <Label htmlFor="sleepHours" className="text-slate-300">
              Hours of Sleep
            </Label>
            <Input
              id="sleepHours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={formData.sleepHours ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sleepHours: e.target.value ? parseFloat(e.target.value) : undefined,
                }))
              }
              placeholder="e.g., 7.5"
              className="bg-slate-800/50 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="text-slate-300">
              Weight (optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                value={formData.weight ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    weight: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                placeholder="e.g., 150"
                className="bg-slate-800/50 border-slate-700"
              />
              <select
                value={formData.weightUnit ?? "lbs"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    weightUnit: e.target.value as "kg" | "lbs",
                  }))
                }
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
              >
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">
              Notes
            </Label>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional notes about how you're feeling today..."
              className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700/50">
        <Button type="submit" isLoading={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          Save Check-in
        </Button>
      </div>
    </form>
  );
}
