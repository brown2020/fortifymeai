import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { DoseLog } from "../models/dose-log";
import { format, subDays } from "date-fns";

/**
 * Get date ID in YYYY-MM-DD format
 */
function getDateId(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get dose logs for a date range
 */
async function getDoseLogsRange(
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
