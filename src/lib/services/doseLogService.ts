import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { DoseLog, DoseLogEntry, DoseLogFormData, DoseLogStats } from "../models/dose-log";
import { ScheduleTime } from "../models/supplement";
import { format, subDays, startOfDay, parseISO } from "date-fns";

/**
 * Get date ID in YYYY-MM-DD format
 */
export function getDateId(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get dose log for a specific date
 */
export async function getDoseLog(
  userId: string,
  dateId: string
): Promise<DoseLog | null> {
  const docRef = doc(db, `users/${userId}/doseLogs`, dateId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as DoseLog;
  }

  return null;
}

/**
 * Get dose logs for a date range
 */
export async function getDoseLogsRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DoseLog[]> {
  const startDateId = getDateId(startDate);
  const endDateId = getDateId(endDate);

  const logsQuery = query(
    collection(db, `users/${userId}/doseLogs`),
    where("dateId", ">=", startDateId),
    where("dateId", "<=", endDateId),
    orderBy("dateId", "desc")
  );

  const querySnapshot = await getDocs(logsQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DoseLog[];
}

/**
 * Get recent dose logs (last N days)
 */
export async function getRecentDoseLogs(
  userId: string,
  days: number = 7
): Promise<DoseLog[]> {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  return getDoseLogsRange(userId, startDate, endDate);
}

/**
 * Log or update a dose entry
 */
export async function logDose(
  userId: string,
  data: DoseLogFormData & { supplementName: string }
): Promise<void> {
  const dateId = getDateId();
  const docRef = doc(db, `users/${userId}/doseLogs`, dateId);
  const existingLog = await getDoc(docRef);

  const entryId = `${data.supplementId}_${data.scheduledTime}`;
  const entry: DoseLogEntry = {
    id: entryId,
    supplementId: data.supplementId,
    supplementName: data.supplementName,
    scheduledTime: data.scheduledTime,
    taken: data.taken,
    skipped: data.skipped ?? false,
    skipReason: data.skipReason,
    actualTime: data.actualTime ? Timestamp.fromDate(data.actualTime) : undefined,
    dosageAmount: data.dosageAmount,
    dosageUnit: data.dosageUnit,
    notes: data.notes,
  };

  if (existingLog.exists()) {
    const logData = existingLog.data() as DoseLog;
    const entries = logData.entries.filter((e) => e.id !== entryId);
    entries.push(entry);

    const completionRate = calculateCompletionRate(entries);

    await setDoc(docRef, {
      ...logData,
      entries,
      completionRate,
      updatedAt: serverTimestamp(),
    });
  } else {
    const newLog: Omit<DoseLog, "id" | "createdAt" | "updatedAt"> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      userId,
      dateId,
      entries: [entry],
      completionRate: entry.taken ? 100 : 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, newLog);
  }
}

/**
 * Remove a dose entry
 */
export async function removeDoseEntry(
  userId: string,
  dateId: string,
  entryId: string
): Promise<void> {
  const docRef = doc(db, `users/${userId}/doseLogs`, dateId);
  const existingLog = await getDoc(docRef);

  if (existingLog.exists()) {
    const logData = existingLog.data() as DoseLog;
    const entries = logData.entries.filter((e) => e.id !== entryId);
    const completionRate = calculateCompletionRate(entries);

    await setDoc(docRef, {
      ...logData,
      entries,
      completionRate,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Calculate completion rate from entries
 */
function calculateCompletionRate(entries: DoseLogEntry[]): number {
  if (entries.length === 0) return 0;
  const taken = entries.filter((e) => e.taken).length;
  return Math.round((taken / entries.length) * 100);
}

/**
 * Get dose log statistics for a date range
 */
export async function getDoseLogStats(
  userId: string,
  days: number = 7
): Promise<DoseLogStats> {
  const logs = await getRecentDoseLogs(userId, days);

  let totalScheduled = 0;
  let totalTaken = 0;
  let totalSkipped = 0;

  logs.forEach((log) => {
    log.entries.forEach((entry) => {
      totalScheduled++;
      if (entry.taken) totalTaken++;
      if (entry.skipped) totalSkipped++;
    });
  });

  const totalMissed = totalScheduled - totalTaken - totalSkipped;
  const adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

  return {
    totalScheduled,
    totalTaken,
    totalSkipped,
    totalMissed,
    adherenceRate,
  };
}

/**
 * Check if a specific dose was taken
 */
export async function isDoseTaken(
  userId: string,
  supplementId: string,
  scheduledTime: ScheduleTime,
  dateId?: string
): Promise<boolean> {
  const targetDateId = dateId || getDateId();
  const log = await getDoseLog(userId, targetDateId);

  if (!log) return false;

  const entry = log.entries.find(
    (e) => e.supplementId === supplementId && e.scheduledTime === scheduledTime
  );

  return entry?.taken ?? false;
}

/**
 * Get all dose entries for a specific supplement
 */
export async function getSupplementDoseHistory(
  userId: string,
  supplementId: string,
  limitDays: number = 30
): Promise<{ dateId: string; entries: DoseLogEntry[] }[]> {
  const logs = await getRecentDoseLogs(userId, limitDays);

  return logs
    .map((log) => ({
      dateId: log.dateId,
      entries: log.entries.filter((e) => e.supplementId === supplementId),
    }))
    .filter((item) => item.entries.length > 0);
}
