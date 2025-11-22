"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SupplementFormData } from "@/lib/models/supplement";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const supplementSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.string().optional(),
});

type SupplementFormValues = z.infer<typeof supplementSchema>;

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
      notes: values.notes,
      startDate: values.startDate ? new Date(values.startDate) : undefined,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <CardTitle>
          {initialData?.name ? "Edit Supplement" : "Add New Supplement"}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Vitamin D3"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              placeholder="Nature's Bounty"
              {...form.register("brand")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="5000 IU"
                {...form.register("dosage")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                placeholder="Once daily"
                {...form.register("frequency")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              id="startDate"
              {...form.register("startDate")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Additional notes about this supplement..."
              {...form.register("notes")}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : initialData?.name
                ? "Update"
                : "Add"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
