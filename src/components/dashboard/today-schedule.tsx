"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { toggleDoseEntry } from "@/app/(protected)/dashboard/actions";
import { cn } from "@/lib/utils";

export type ScheduleTime = "morning" | "midday" | "evening" | "bedtime" | "anytime";

export type DoseEntry = {
  entryId: string;
  time: ScheduleTime;
  supplementId: string;
  name: string;
  dosage?: string;
  frequency?: string;
};

export type GroupedDoseEntries = Record<ScheduleTime, DoseEntry[]>;

const TIME_LABELS: Record<ScheduleTime, string> = {
  morning: "Morning",
  midday: "Midday",
  evening: "Evening",
  bedtime: "Bedtime",
  anytime: "Anytime",
};

export function TodaySchedule({
  dateId,
  groups,
  initialTakenEntryIds,
}: {
  dateId: string;
  groups: GroupedDoseEntries;
  initialTakenEntryIds: string[];
}) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [takenEntryIds, setTakenEntryIds] = useState<Set<string>>(
    () => new Set(initialTakenEntryIds)
  );

  const allEntries = useMemo(() => {
    return (Object.keys(groups) as ScheduleTime[])
      .flatMap((k) => groups[k])
      .filter(Boolean);
  }, [groups]);

  const totalCount = allEntries.length;
  const takenCount = useMemo(() => {
    let count = 0;
    for (const entry of allEntries) {
      if (takenEntryIds.has(entry.entryId)) count += 1;
    }
    return count;
  }, [allEntries, takenEntryIds]);

  const percent =
    totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleToggle = (entryId: string) => {
    const prev = new Set(takenEntryIds);
    const wasTaken = prev.has(entryId);

    // optimistic
    const optimistic = new Set(prev);
    if (wasTaken) optimistic.delete(entryId);
    else optimistic.add(entryId);
    setTakenEntryIds(optimistic);

    startTransition(async () => {
      try {
        const res = await toggleDoseEntry(dateId, entryId);
        setTakenEntryIds((current) => {
          const next = new Set(current);
          if (res.taken) next.add(entryId);
          else next.delete(entryId);
          return next;
        });
      } catch (e) {
        setTakenEntryIds(prev);
        addToast(
          e instanceof Error ? e.message : "Failed to update dose log.",
          "error"
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {totalCount === 0
            ? "No scheduled items today."
            : `${takenCount}/${totalCount} taken • ${percent}%`}
        </p>
        {isPending && (
          <p className="text-xs text-slate-500">Saving…</p>
        )}
      </div>

      {(
        [
          "morning",
          "midday",
          "evening",
          "bedtime",
          "anytime",
        ] as const
      ).map((time) => {
        const items = groups[time];
        if (!items.length) return null;

        const takenInGroup = items.filter((e) => takenEntryIds.has(e.entryId))
          .length;

        return (
          <div
            key={time}
            className="rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/15">
                  <Clock className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{TIME_LABELS[time]}</p>
                  <p className="text-xs text-slate-500">
                    {takenInGroup}/{items.length} taken
                  </p>
                </div>
              </div>
            </div>

            <ul className="divide-y divide-slate-700/50">
              {items.map((entry) => {
                const isTaken = takenEntryIds.has(entry.entryId);
                return (
                  <li
                    key={entry.entryId}
                    className="px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{entry.name}</p>
                      {(entry.dosage || entry.frequency) && (
                        <p className="text-xs text-slate-400 truncate">
                          {[entry.dosage, entry.frequency]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant={isTaken ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleToggle(entry.entryId)}
                      className={cn(
                        "gap-2 shrink-0",
                        isTaken && "border border-emerald-500/30"
                      )}
                      aria-pressed={isTaken}
                    >
                      {isTaken ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-400" />
                      )}
                      {isTaken ? "Taken" : "Take"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

