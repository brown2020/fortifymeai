import { Timestamp } from "firebase/firestore";
import { ScheduleTime } from "./supplement";

/**
 * Individual dose log entry with detailed tracking
 */
export interface DoseLogEntry {
  id: string;
  supplementId: string;
  supplementName: string;
  scheduledTime: ScheduleTime;
  actualTime?: Timestamp;
  dosageAmount?: number;
  dosageUnit?: string;
  taken: boolean;
  skipped: boolean;
  skipReason?: "forgot" | "side_effects" | "ran_out" | "intentional" | "other";
  notes?: string;
}

/**
 * Daily dose log containing all entries for a specific date
 */
export interface DoseLog {
  id: string;
  userId: string;
  dateId: string; // YYYY-MM-DD format
  entries: DoseLogEntry[];
  completionRate: number; // 0-100 percentage
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Form data for logging a dose
 */
export interface DoseLogFormData {
  supplementId: string;
  scheduledTime: ScheduleTime;
  taken: boolean;
  skipped?: boolean;
  skipReason?: DoseLogEntry["skipReason"];
  actualTime?: Date;
  dosageAmount?: number;
  dosageUnit?: string;
  notes?: string;
}

/**
 * Summary statistics for dose logs
 */
export interface DoseLogStats {
  totalScheduled: number;
  totalTaken: number;
  totalSkipped: number;
  totalMissed: number;
  adherenceRate: number;
}
