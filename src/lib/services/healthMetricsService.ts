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
async function getHealthMetrics(
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
async function getHealthMetricsRange(
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
