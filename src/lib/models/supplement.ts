import { Timestamp } from "firebase/firestore";

export type ScheduleTime = "morning" | "midday" | "evening" | "bedtime";

export interface Supplement {
  id: string;
  name: string;
  brand?: string;
  dosage?: string;
  frequency?: string;
  scheduleTimes?: ScheduleTime[];
  notes?: string;
  startDate?: Timestamp;
  imageUrl?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SupplementFormData {
  name: string;
  brand?: string;
  dosage?: string;
  frequency?: string;
  scheduleTimes?: ScheduleTime[];
  notes?: string;
  startDate?: Date;
  imageUrl?: string;
}
