"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScheduleTime, SupplementFormData } from "@/lib/models/supplement";
import { X, Pill } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const SCHEDULE_TIME_OPTIONS: { value: ScheduleTime; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "evening", label: "Evening" },
  { value: "bedtime", label: "Bedtime" },
];

const supplementSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  scheduleTimes: z
    .array(z.enum(["morning", "midday", "evening", "bedtime"]))
    .default([]),
  notes: z.string().optional(),
  startDate: z.string().optional(),
});

// Use the schema *input* type so React Hook Form + zodResolver agree on optionality.
// (Zod defaults make fields optional on input, required on output.)
type SupplementFormValues = z.input<typeof supplementSchema>;

interface SupplementFormProps {
  initialData?: Partial<SupplementFormData>;
  onSubmit: (data: SupplementFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function SupplementForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: SupplementFormProps) {
  const form = useForm<SupplementFormValues>({
    resolver: zodResolver(supplementSchema),
    defaultValues: {
      name: initialData?.name || "",
      brand: initialData?.brand || "",
      dosage: initialData?.dosage || "",
      frequency: initialData?.frequency || "",
      scheduleTimes: initialData?.scheduleTimes || [],
      notes: initialData?.notes || "",
      startDate: initialData?.startDate
        ? initialData.startDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  const handleSubmit = async (values: SupplementFormValues) => {
    await onSubmit({
      name: values.name,
      brand: values.brand,
      dosage: values.dosage,
      frequency: values.frequency,
      scheduleTimes: values.scheduleTimes?.length ? values.scheduleTimes : undefined,
      notes: values.notes,
      startDate: values.startDate ? new Date(values.startDate) : undefined,
    });
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 
            border border-emerald-500/20">
            <Pill className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {initialData?.name ? "Edit Supplement" : "Add New Supplement"}
            </h2>
            <p className="text-sm text-slate-400">
              {initialData?.name ? "Update supplement details" : "Add a supplement to your collection"}
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

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">
            Name <span className="text-rose-400">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., Vitamin D3"
            {...form.register("name")}
            className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 
              focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-rose-400">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-slate-300">Brand</Label>
          <Input
            id="brand"
            placeholder="e.g., Nature's Bounty"
            {...form.register("brand")}
            className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 
              focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>

        {/* Dosage & Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dosage" className="text-slate-300">Dosage</Label>
            <Input
              id="dosage"
              placeholder="e.g., 5000 IU"
              {...form.register("dosage")}
              className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 
                focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-slate-300">Frequency</Label>
            <Input
              id="frequency"
              placeholder="e.g., Once daily"
              {...form.register("frequency")}
              className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 
                focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <Label className="text-slate-300">Schedule (optional)</Label>
          <p className="text-xs text-slate-500">
            Pick when you typically take it so the dashboard can build your daily plan.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SCHEDULE_TIME_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2
                  text-sm text-slate-300 hover:bg-slate-800/50 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  value={option.value}
                  {...form.register("scheduleTimes")}
                  className="h-4 w-4 accent-emerald-500"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-slate-300">Start Date</Label>
          <Input
            type="date"
            id="startDate"
            {...form.register("startDate")}
            className="bg-slate-800/50 border-slate-700 text-white 
              focus:border-emerald-500/50 focus:ring-emerald-500/20
              scheme-dark"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-slate-300">Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Additional notes about this supplement..."
            {...form.register("notes")}
            className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 
              focus:border-emerald-500/50 focus:ring-emerald-500/20 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialData?.name ? "Update Supplement" : "Add Supplement"}
          </Button>
        </div>
      </form>
    </div>
  );
}
