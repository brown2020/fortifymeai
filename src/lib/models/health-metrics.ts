import { Timestamp } from "firebase/firestore";

/**
 * Health metric entry for daily check-ins
 */
export interface HealthMetricEntry {
  id: string;
  userId: string;
  date: Timestamp;
  dateId: string; // YYYY-MM-DD format

  // Core metrics (1-10 scale)
  energyLevel?: number;
  sleepQuality?: number;
  mood?: number;
  focus?: number;
  stressLevel?: number;

  // Quantitative metrics
  sleepHours?: number;
  weight?: number;
  weightUnit?: "kg" | "lbs";

  // Blood pressure
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };

  // Custom metrics defined by user
  customMetrics?: Record<string, number>;

  // General notes
  notes?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Form data for health metric check-in
 */
export interface HealthMetricFormData {
  energyLevel?: number;
  sleepQuality?: number;
  mood?: number;
  focus?: number;
  stressLevel?: number;
  sleepHours?: number;
  weight?: number;
  weightUnit?: "kg" | "lbs";
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  customMetrics?: Record<string, number>;
  notes?: string;
}

/**
 * Predefined metric definitions
 */
export const HEALTH_METRICS = {
  energyLevel: {
    label: "Energy Level",
    description: "How energetic do you feel today?",
    icon: "Zap",
    color: "yellow",
  },
  sleepQuality: {
    label: "Sleep Quality",
    description: "How well did you sleep last night?",
    icon: "Moon",
    color: "indigo",
  },
  mood: {
    label: "Mood",
    description: "How is your overall mood?",
    icon: "Smile",
    color: "green",
  },
  focus: {
    label: "Focus",
    description: "How well can you concentrate?",
    icon: "Target",
    color: "blue",
  },
  stressLevel: {
    label: "Stress Level",
    description: "How stressed do you feel? (1=low, 10=high)",
    icon: "Activity",
    color: "red",
  },
} as const;

/**
 * Health metrics trend data for charts
 */
export interface HealthMetricsTrend {
  dateId: string;
  date: Date;
  energyLevel?: number;
  sleepQuality?: number;
  mood?: number;
  focus?: number;
  stressLevel?: number;
  sleepHours?: number;
}
