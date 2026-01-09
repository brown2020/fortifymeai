"use client";

import { Supplement } from "@/lib/models/supplement";
import { Calendar, Clock, Edit, Trash2, Pill, MoreVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";

interface SupplementCardProps {
  supplement: Supplement;
  onEdit: (supplement: Supplement) => void;
  onDelete: (id: string) => void;
}

export default function SupplementCard({
  supplement,
  onEdit,
  onDelete,
}: SupplementCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const scheduleLabelByTime = {
    morning: "Morning",
    midday: "Midday",
    evening: "Evening",
    bedtime: "Bedtime",
  } as const;

  const scheduleText =
    supplement.scheduleTimes?.length
      ? supplement.scheduleTimes.map((t) => scheduleLabelByTime[t]).join(", ")
      : null;

  const handleDelete = async () => {
    if (isDeleting) return;

    if (confirm("Are you sure you want to delete this supplement?")) {
      setIsDeleting(true);
      try {
        await onDelete(supplement.id);
      } catch (error) {
        console.error("Error deleting supplement:", error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="glass-card p-6 card-hover group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 
            border border-emerald-500/20 shrink-0">
            <Pill className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {supplement.name}
            </h3>
            {supplement.brand && (
              <p className="text-sm text-slate-400 truncate">{supplement.brand}</p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowActions(!showActions)}
            className="h-8 w-8 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showActions && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowActions(false)} 
              />
              <div className="absolute right-0 top-full mt-1 z-20 glass-card p-2 min-w-[140px]">
                <button
                  onClick={() => {
                    setShowActions(false);
                    onEdit(supplement);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-300 
                    hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-rose-400 
                    hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {(supplement.dosage || supplement.frequency) && (
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-lg bg-slate-800/50">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <span className="text-slate-300">
              {supplement.dosage && supplement.frequency
                ? `${supplement.dosage}, ${supplement.frequency}`
                : supplement.dosage || supplement.frequency}
            </span>
          </div>
        )}

        {scheduleText && (
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-lg bg-slate-800/50">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-slate-300">Schedule: {scheduleText}</span>
          </div>
        )}

        {supplement.startDate && (
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-lg bg-slate-800/50">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <span className="text-slate-300">
              Started {formatDate(supplement.startDate.toDate())}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {supplement.notes && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-sm text-slate-400 line-clamp-2 whitespace-pre-line">
            {supplement.notes}
          </p>
        </div>
      )}
    </div>
  );
}
