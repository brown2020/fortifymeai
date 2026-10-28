import type { DoseLog, DoseLogEntry } from "@/lib/models/dose-log";

export type DoseSlot = DoseLogEntry["scheduledTime"];

const DOSE_SLOTS = new Set<DoseSlot>([
  "morning",
  "midday",
  "evening",
  "bedtime",
  "anytime",
]);

export type SupplementScheduleSource = {
  id: string;
  name?: string;
  dosage?: string;
  frequency?: string;
  scheduleTimes?: unknown;
};

export type PlannedDose = {
  entryId: string;
  time: DoseSlot;
  supplementId: string;
  name: string;
  dosage?: string;
  frequency?: string;
};

export function scheduleTimesFor(value: unknown): DoseSlot[] {
  if (!Array.isArray(value)) return ["anytime"];
  const times = value.filter((time): time is DoseSlot =>
    typeof time === "string" && DOSE_SLOTS.has(time as DoseSlot)
  );
  return times.length > 0 ? times : ["anytime"];
}

export function plannedDoses(supplements: SupplementScheduleSource[]): PlannedDose[] {
  const doses: PlannedDose[] = [];
  for (const supplement of supplements) {
    const name = supplement.name?.trim() || "Untitled";
    for (const time of scheduleTimesFor(supplement.scheduleTimes)) {
      doses.push({
        entryId: `${supplement.id}:${time}`,
        time,
        supplementId: supplement.id,
        name,
        dosage: supplement.dosage,
        frequency: supplement.frequency,
      });
    }
  }
  return doses;
}

export function groupPlannedDoses(
  doses: PlannedDose[]
): Record<DoseSlot, PlannedDose[]> {
  const grouped: Record<DoseSlot, PlannedDose[]> = {
    morning: [],
    midday: [],
    evening: [],
    bedtime: [],
    anytime: [],
  };
  for (const dose of doses) {
    grouped[dose.time].push(dose);
  }
  return grouped;
}

const DATE_ID = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateId(dateId: string): boolean {
  return DATE_ID.test(dateId);
}

export function isValidDoseToggle(dateId: string, entryId: string): boolean {
  return (
    isValidDateId(dateId) &&
    entryId.length > 0 &&
    entryId.length <= 200 &&
    !entryId.includes("/")
  );
}

export function buildDoseEntries(
  supplements: SupplementScheduleSource[],
  takenEntryIds: string[]
): { entries: DoseLogEntry[]; completionRate: number; takenCount: number } {
  const taken = new Set(takenEntryIds);
  const entries: DoseLogEntry[] = plannedDoses(supplements).map((dose) => ({
    id: dose.entryId,
    supplementId: dose.supplementId,
    supplementName: dose.name,
    scheduledTime: dose.time,
    taken: taken.has(dose.entryId),
    skipped: false,
  }));
  const takenCount = entries.filter((entry) => entry.taken).length;
  const completionRate =
    entries.length === 0 ? 0 : Math.round((takenCount / entries.length) * 100);
  return { entries, completionRate, takenCount };
}

function synthesizeEntry(entryId: string): DoseLogEntry {
  const splitAt = entryId.lastIndexOf(":");
  const supplementId = splitAt > 0 ? entryId.slice(0, splitAt) : entryId;
  const rawTime = splitAt > 0 ? entryId.slice(splitAt + 1) : "anytime";
  const scheduledTime = DOSE_SLOTS.has(rawTime as DoseSlot)
    ? (rawTime as DoseSlot)
    : "anytime";
  return {
    id: entryId,
    supplementId,
    supplementName: "Supplement",
    scheduledTime,
    taken: true,
    skipped: false,
  };
}

function parseEntry(value: unknown): DoseLogEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.supplementId !== "string") {
    return null;
  }
  const scheduledTime = DOSE_SLOTS.has(record.scheduledTime as DoseSlot)
    ? (record.scheduledTime as DoseSlot)
    : "anytime";
  return {
    id: record.id,
    supplementId: record.supplementId,
    supplementName:
      typeof record.supplementName === "string" && record.supplementName
        ? record.supplementName
        : "Supplement",
    scheduledTime,
    taken: record.taken === true,
    skipped: record.skipped === true,
    skipReason:
      record.skipReason === "forgot" ||
      record.skipReason === "side_effects" ||
      record.skipReason === "ran_out" ||
      record.skipReason === "intentional" ||
      record.skipReason === "other"
        ? record.skipReason
        : undefined,
    notes: typeof record.notes === "string" ? record.notes : undefined,
  };
}

/** Accepts the dashboard `takenEntryIds` shape and the full `entries` shape. */
export function normalizeDoseLog(
  id: string,
  data: Record<string, unknown> | undefined
): DoseLog {
  const source = data ?? {};
  const takenEntryIds = Array.isArray(source.takenEntryIds)
    ? source.takenEntryIds.filter((entry): entry is string => typeof entry === "string")
    : [];

  let entries: DoseLogEntry[] = [];
  if (Array.isArray(source.entries)) {
    entries = source.entries.flatMap((entry) => {
      const parsed = parseEntry(entry);
      return parsed ? [parsed] : [];
    });
  }
  if (entries.length === 0 && takenEntryIds.length > 0) {
    entries = takenEntryIds.map(synthesizeEntry);
  }

  const completionRate =
    typeof source.completionRate === "number" && Number.isFinite(source.completionRate)
      ? source.completionRate
      : entries.length === 0
        ? 0
        : Math.round((entries.filter((entry) => entry.taken).length / entries.length) * 100);

  return {
    id,
    userId: typeof source.userId === "string" ? source.userId : "",
    dateId: typeof source.dateId === "string" ? source.dateId : id,
    entries,
    completionRate,
    createdAt: source.createdAt as DoseLog["createdAt"],
    updatedAt: source.updatedAt as DoseLog["updatedAt"],
  };
}
