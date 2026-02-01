import { Timestamp } from "firebase/firestore";

/**
 * Side effect severity levels
 */
export type SideEffectSeverity = "mild" | "moderate" | "severe";

/**
 * Common side effect categories
 */
export type SideEffectCategory =
  | "digestive"
  | "neurological"
  | "skin"
  | "cardiovascular"
  | "musculoskeletal"
  | "sleep"
  | "mood"
  | "other";

/**
 * Side effect entry
 */
export interface SideEffectEntry {
  id: string;
  userId: string;
  date: Timestamp;
  dateId: string; // YYYY-MM-DD format

  // Associated supplements (can be multiple if unsure which caused it)
  supplementIds: string[];
  supplementNames: string[];

  // Side effect details
  symptom: string;
  category: SideEffectCategory;
  severity: SideEffectSeverity;

  // Duration tracking
  startTime?: Timestamp;
  endTime?: Timestamp;
  duration?: string; // e.g., "2 hours", "ongoing"

  // Resolution
  resolved: boolean;
  resolvedAt?: Timestamp;
  resolution?: string; // What helped resolve it

  // Additional info
  notes?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Form data for logging a side effect
 */
export interface SideEffectFormData {
  supplementIds: string[];
  symptom: string;
  category: SideEffectCategory;
  severity: SideEffectSeverity;
  startTime?: Date;
  duration?: string;
  notes?: string;
}

/**
 * Common side effects for quick selection
 */
export const COMMON_SIDE_EFFECTS: Record<SideEffectCategory, string[]> = {
  digestive: [
    "Nausea",
    "Stomach upset",
    "Diarrhea",
    "Constipation",
    "Bloating",
    "Loss of appetite",
    "Acid reflux",
  ],
  neurological: [
    "Headache",
    "Dizziness",
    "Brain fog",
    "Tingling sensations",
    "Numbness",
  ],
  skin: [
    "Rash",
    "Itching",
    "Acne",
    "Flushing",
    "Dry skin",
  ],
  cardiovascular: [
    "Rapid heartbeat",
    "Heart palpitations",
    "Blood pressure changes",
    "Chest discomfort",
  ],
  musculoskeletal: [
    "Muscle cramps",
    "Joint pain",
    "Muscle weakness",
    "Muscle twitching",
  ],
  sleep: [
    "Insomnia",
    "Drowsiness",
    "Vivid dreams",
    "Difficulty waking",
  ],
  mood: [
    "Anxiety",
    "Irritability",
    "Mood swings",
    "Depression",
    "Restlessness",
  ],
  other: [
    "Fatigue",
    "Increased thirst",
    "Frequent urination",
    "Metallic taste",
    "Other",
  ],
};

/**
 * Side effect category labels and icons
 */
export const SIDE_EFFECT_CATEGORIES: Record<
  SideEffectCategory,
  { label: string; icon: string }
> = {
  digestive: { label: "Digestive", icon: "Utensils" },
  neurological: { label: "Neurological", icon: "Brain" },
  skin: { label: "Skin", icon: "Droplet" },
  cardiovascular: { label: "Cardiovascular", icon: "Heart" },
  musculoskeletal: { label: "Musculoskeletal", icon: "Bone" },
  sleep: { label: "Sleep", icon: "Moon" },
  mood: { label: "Mood", icon: "Smile" },
  other: { label: "Other", icon: "MoreHorizontal" },
};
