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
} from "firebase/firestore";
import { db } from "../firebase";
import {
  HealthMetricEntry,
  HealthMetricFormData,
  HealthMetricsTrend,
} from "../models/health-metrics";
import { format, subDays, parseISO } from "date-fns";

/**
 * Get date ID in YYYY-MM-DD format
 */
function getDateId(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get health metrics for a specific date
 */
export async function getHealthMetrics(
  userId: string,
  dateId: string
): Promise<HealthMetricEntry | null> {
  const docRef = doc(db, `users/${userId}/healthMetrics`, dateId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as HealthMetricEntry;
  }

  return null;
}

/**
 * Get today's health metrics
 */
export async function getTodayHealthMetrics(
  userId: string
): Promise<HealthMetricEntry | null> {
  return getHealthMetrics(userId, getDateId());
}

/**
 * Get health metrics for a date range
 */
export async function getHealthMetricsRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<HealthMetricEntry[]> {
  const startDateId = getDateId(startDate);
  const endDateId = getDateId(endDate);

  const metricsQuery = query(
    collection(db, `users/${userId}/healthMetrics`),
    where("dateId", ">=", startDateId),
    where("dateId", "<=", endDateId),
    orderBy("dateId", "asc")
  );

  const querySnapshot = await getDocs(metricsQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as HealthMetricEntry[];
}

/**
 * Get recent health metrics (last N days)
 */
export async function getRecentHealthMetrics(
  userId: string,
  days: number = 7
): Promise<HealthMetricEntry[]> {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  return getHealthMetricsRange(userId, startDate, endDate);
}

/**
 * Save health metrics for today
 */
export async function saveHealthMetrics(
  userId: string,
  data: HealthMetricFormData
): Promise<void> {
  const dateId = getDateId();
  const docRef = doc(db, `users/${userId}/healthMetrics`, dateId);
  const existingMetrics = await getDoc(docRef);

  const metricsData: Omit<HealthMetricEntry, "id" | "createdAt" | "updatedAt"> & {
    createdAt: ReturnType<typeof serverTimestamp> | Timestamp;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    userId,
    dateId,
    date: Timestamp.fromDate(new Date()),
    ...data,
    createdAt: existingMetrics.exists()
      ? (existingMetrics.data() as HealthMetricEntry).createdAt
      : serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, metricsData);
}

/**
 * Get health metrics trend data for charts
 */
export async function getHealthMetricsTrend(
  userId: string,
  days: number = 30
): Promise<HealthMetricsTrend[]> {
  const metrics = await getRecentHealthMetrics(userId, days);

  return metrics.map((m) => ({
    dateId: m.dateId,
    date: parseISO(m.dateId),
    energyLevel: m.energyLevel,
    sleepQuality: m.sleepQuality,
    mood: m.mood,
    focus: m.focus,
    stressLevel: m.stressLevel,
    sleepHours: m.sleepHours,
  }));
}

/**
 * Calculate average metrics over a period
 */
export async function getAverageMetrics(
  userId: string,
  days: number = 7
): Promise<Partial<HealthMetricFormData>> {
  const metrics = await getRecentHealthMetrics(userId, days);

  if (metrics.length === 0) return {};

  const totals = {
    energyLevel: 0,
    sleepQuality: 0,
    mood: 0,
    focus: 0,
    stressLevel: 0,
    sleepHours: 0,
  };

  const counts = {
    energyLevel: 0,
    sleepQuality: 0,
    mood: 0,
    focus: 0,
    stressLevel: 0,
    sleepHours: 0,
  };

  metrics.forEach((m) => {
    if (m.energyLevel !== undefined) {
      totals.energyLevel += m.energyLevel;
      counts.energyLevel++;
    }
    if (m.sleepQuality !== undefined) {
      totals.sleepQuality += m.sleepQuality;
      counts.sleepQuality++;
    }
    if (m.mood !== undefined) {
      totals.mood += m.mood;
      counts.mood++;
    }
    if (m.focus !== undefined) {
      totals.focus += m.focus;
      counts.focus++;
    }
    if (m.stressLevel !== undefined) {
      totals.stressLevel += m.stressLevel;
      counts.stressLevel++;
    }
    if (m.sleepHours !== undefined) {
      totals.sleepHours += m.sleepHours;
      counts.sleepHours++;
    }
  });

  return {
    energyLevel: counts.energyLevel > 0 ? Math.round(totals.energyLevel / counts.energyLevel) : undefined,
    sleepQuality: counts.sleepQuality > 0 ? Math.round(totals.sleepQuality / counts.sleepQuality) : undefined,
    mood: counts.mood > 0 ? Math.round(totals.mood / counts.mood) : undefined,
    focus: counts.focus > 0 ? Math.round(totals.focus / counts.focus) : undefined,
    stressLevel: counts.stressLevel > 0 ? Math.round(totals.stressLevel / counts.stressLevel) : undefined,
    sleepHours: counts.sleepHours > 0 ? Math.round((totals.sleepHours / counts.sleepHours) * 10) / 10 : undefined,
  };
}

/**
 * Check if user has logged metrics today
 */
export async function hasLoggedMetricsToday(userId: string): Promise<boolean> {
  const today = await getTodayHealthMetrics(userId);
  return today !== null;
}
