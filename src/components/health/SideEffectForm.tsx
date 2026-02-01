"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  SideEffectFormData,
  SideEffectCategory,
  SideEffectSeverity,
  COMMON_SIDE_EFFECTS,
  SIDE_EFFECT_CATEGORIES,
} from "@/lib/models/side-effects";
import { Supplement } from "@/lib/models/supplement";
import { AlertTriangle, X } from "lucide-react";

interface SideEffectFormProps {
  supplements: Supplement[];
  onSubmit: (data: SideEffectFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  className?: string;
}

const severityOptions: { value: SideEffectSeverity; label: string; color: string }[] = [
  { value: "mild", label: "Mild", color: "bg-blue-500/20 border-blue-500/30 text-blue-400" },
  { value: "moderate", label: "Moderate", color: "bg-amber-500/20 border-amber-500/30 text-amber-400" },
  { value: "severe", label: "Severe", color: "bg-rose-500/20 border-rose-500/30 text-rose-400" },
];

export default function SideEffectForm({
  supplements,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: SideEffectFormProps) {
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [category, setCategory] = useState<SideEffectCategory>("other");
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState<SideEffectSeverity>("mild");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const handleSupplementToggle = (supplementId: string) => {
    setSelectedSupplements((prev) =>
      prev.includes(supplementId)
        ? prev.filter((id) => id !== supplementId)
        : [...prev, supplementId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSupplements.length === 0 || !symptom.trim()) return;

    await onSubmit({
      supplementIds: selectedSupplements,
      symptom: symptom.trim(),
      category,
      severity,
      duration: duration || undefined,
      notes: notes || undefined,
    });
  };

  const commonSymptoms = COMMON_SIDE_EFFECTS[category] || [];

  return (
    <div className={cn("glass-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/20">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Log Side Effect</h2>
            <p className="text-sm text-slate-400">
              Track any unwanted effects from your supplements
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-9 w-9 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Select Supplements */}
        <div className="space-y-2">
          <Label className="text-slate-300">
            Related Supplements <span className="text-rose-400">*</span>
          </Label>
          <p className="text-xs text-slate-500">
            Select supplements that might be causing this effect
          </p>
          <div className="flex flex-wrap gap-2">
            {supplements.map((supp) => (
              <button
                key={supp.id}
                type="button"
                onClick={() => handleSupplementToggle(supp.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-colors border",
                  selectedSupplements.includes(supp.id)
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                )}
              >
                {supp.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-slate-300">Category</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.entries(SIDE_EFFECT_CATEGORIES) as [SideEffectCategory, { label: string; icon: string }][]).map(
              ([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setCategory(key);
                    setSymptom("");
                  }}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm transition-colors border",
                    category === key
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                  )}
                >
                  {info.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Symptom */}
        <div className="space-y-2">
          <Label className="text-slate-300">
            Symptom <span className="text-rose-400">*</span>
          </Label>
          {commonSymptoms.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {commonSymptoms.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymptom(s)}
                  className={cn(
                    "px-2 py-1 rounded text-xs transition-colors border",
                    symptom === s
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <input
            type="text"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="Describe the symptom..."
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <Label className="text-slate-300">Severity</Label>
          <div className="flex gap-2">
            {severityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSeverity(option.value)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors border",
                  severity === option.value ? option.color : "bg-slate-800/50 border-slate-700 text-slate-400"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-slate-300">
            Duration (optional)
          </Label>
          <input
            id="duration"
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 2 hours, ongoing..."
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-slate-300">
            Notes (optional)
          </Label>
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details..."
            className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={selectedSupplements.length === 0 || !symptom.trim()}
          >
            Log Side Effect
          </Button>
        </div>
      </form>
    </div>
  );
}
