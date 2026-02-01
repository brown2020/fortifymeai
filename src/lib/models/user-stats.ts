import { Timestamp } from "firebase/firestore";

/**
 * Achievement types
 */
export type AchievementType =
  | "streak"
  | "milestone"
  | "consistency"
  | "explorer"
  | "researcher";

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  requirement: number; // e.g., 7 for 7-day streak
  earnedAt?: Timestamp;
}

/**
 * User statistics and gamification data
 */
export interface UserStats {
  userId: string;

  // Streak tracking
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD

  // Totals
  totalDosesTaken: number;
  totalDosesLogged: number;
  totalSupplementsTracked: number;
  totalResearchQueries: number;

  // Adherence
  adherenceRate: number; // 0-100 percentage
  weeklyAdherence: number[]; // Last 7 days adherence

  // Achievements
  achievements: Achievement[];

  // Timestamps
  memberSince: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Available achievements
 */
export const ACHIEVEMENTS: Omit<Achievement, "earnedAt">[] = [
  // Streak achievements
  {
    id: "streak_3",
    type: "streak",
    name: "Getting Started",
    description: "Log supplements for 3 days in a row",
    icon: "Flame",
    requirement: 3,
  },
  {
    id: "streak_7",
    type: "streak",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "Flame",
    requirement: 7,
  },
  {
    id: "streak_14",
    type: "streak",
    name: "Fortnight Focus",
    description: "Maintain a 14-day streak",
    icon: "Flame",
    requirement: 14,
  },
  {
    id: "streak_30",
    type: "streak",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "Flame",
    requirement: 30,
  },
  {
    id: "streak_60",
    type: "streak",
    name: "Two Month Titan",
    description: "Maintain a 60-day streak",
    icon: "Flame",
    requirement: 60,
  },
  {
    id: "streak_100",
    type: "streak",
    name: "Century Club",
    description: "Maintain a 100-day streak",
    icon: "Trophy",
    requirement: 100,
  },
  {
    id: "streak_365",
    type: "streak",
    name: "Year of Wellness",
    description: "Maintain a 365-day streak",
    icon: "Crown",
    requirement: 365,
  },

  // Milestone achievements
  {
    id: "doses_10",
    type: "milestone",
    name: "First Steps",
    description: "Log 10 doses",
    icon: "Footprints",
    requirement: 10,
  },
  {
    id: "doses_100",
    type: "milestone",
    name: "Committed",
    description: "Log 100 doses",
    icon: "Award",
    requirement: 100,
  },
  {
    id: "doses_500",
    type: "milestone",
    name: "Dedicated",
    description: "Log 500 doses",
    icon: "Medal",
    requirement: 500,
  },
  {
    id: "doses_1000",
    type: "milestone",
    name: "Health Champion",
    description: "Log 1,000 doses",
    icon: "Trophy",
    requirement: 1000,
  },

  // Consistency achievements
  {
    id: "adherence_80",
    type: "consistency",
    name: "Reliable",
    description: "Maintain 80% adherence for a week",
    icon: "Target",
    requirement: 80,
  },
  {
    id: "adherence_90",
    type: "consistency",
    name: "Highly Consistent",
    description: "Maintain 90% adherence for a week",
    icon: "Target",
    requirement: 90,
  },
  {
    id: "adherence_100",
    type: "consistency",
    name: "Perfect Week",
    description: "Achieve 100% adherence for a full week",
    icon: "Star",
    requirement: 100,
  },

  // Explorer achievements
  {
    id: "supplements_3",
    type: "explorer",
    name: "Beginner Stack",
    description: "Track 3 different supplements",
    icon: "Package",
    requirement: 3,
  },
  {
    id: "supplements_5",
    type: "explorer",
    name: "Growing Stack",
    description: "Track 5 different supplements",
    icon: "Package",
    requirement: 5,
  },
  {
    id: "supplements_10",
    type: "explorer",
    name: "Supplement Enthusiast",
    description: "Track 10 different supplements",
    icon: "Boxes",
    requirement: 10,
  },

  // Researcher achievements
  {
    id: "research_5",
    type: "researcher",
    name: "Curious Mind",
    description: "Perform 5 AI research queries",
    icon: "Search",
    requirement: 5,
  },
  {
    id: "research_25",
    type: "researcher",
    name: "Knowledge Seeker",
    description: "Perform 25 AI research queries",
    icon: "BookOpen",
    requirement: 25,
  },
  {
    id: "research_100",
    type: "researcher",
    name: "Research Expert",
    description: "Perform 100 AI research queries",
    icon: "GraduationCap",
    requirement: 100,
  },
];

/**
 * Check if an achievement should be unlocked
 */
export function checkAchievementUnlock(
  achievement: Omit<Achievement, "earnedAt">,
  stats: Partial<UserStats>
): boolean {
  switch (achievement.type) {
    case "streak":
      return (stats.currentStreak ?? 0) >= achievement.requirement;
    case "milestone":
      return (stats.totalDosesTaken ?? 0) >= achievement.requirement;
    case "consistency":
      return (stats.adherenceRate ?? 0) >= achievement.requirement;
    case "explorer":
      return (stats.totalSupplementsTracked ?? 0) >= achievement.requirement;
    case "researcher":
      return (stats.totalResearchQueries ?? 0) >= achievement.requirement;
    default:
      return false;
  }
}

/**
 * Get newly unlocked achievements
 */
export function getNewAchievements(
  stats: Partial<UserStats>,
  existingAchievementIds: string[]
): Omit<Achievement, "earnedAt">[] {
  return ACHIEVEMENTS.filter(
    (achievement) =>
      !existingAchievementIds.includes(achievement.id) &&
      checkAchievementUnlock(achievement, stats)
  );
}
