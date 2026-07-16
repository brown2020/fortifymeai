import {
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  UserStats,
  ACHIEVEMENTS,
} from "../models/user-stats";
import { format } from "date-fns";

/**
 * Get user stats
 */
async function getUserStats(userId: string): Promise<UserStats | null> {
  const docRef = doc(db, `users/${userId}/stats`, "current");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserStats;
  }

  return null;
}

/**
 * Get streak information
 */
export async function getStreakInfo(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  isActiveToday: boolean;
}> {
  const stats = await getUserStats(userId);
  const today = format(new Date(), "yyyy-MM-dd");

  if (!stats) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: "",
      isActiveToday: false,
    };
  }

  return {
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastActiveDate: stats.lastActiveDate,
    isActiveToday: stats.lastActiveDate === today,
  };
}

/**
 * Get achievement progress
 */
export async function getAchievementProgress(
  userId: string
): Promise<{ achievement: typeof ACHIEVEMENTS[number]; progress: number; earned: boolean }[]> {
  const stats = await getUserStats(userId);
  const earnedIds = stats?.achievements.map((a) => a.id) ?? [];

  return ACHIEVEMENTS.map((achievement) => {
    const earned = earnedIds.includes(achievement.id);
    let progress = 0;

    if (stats) {
      switch (achievement.type) {
        case "streak":
          progress = Math.min((stats.currentStreak / achievement.requirement) * 100, 100);
          break;
        case "milestone":
          progress = Math.min((stats.totalDosesTaken / achievement.requirement) * 100, 100);
          break;
        case "consistency":
          progress = Math.min((stats.adherenceRate / achievement.requirement) * 100, 100);
          break;
        case "explorer":
          progress = Math.min(
            (stats.totalSupplementsTracked / achievement.requirement) * 100,
            100
          );
          break;
        case "researcher":
          progress = Math.min(
            (stats.totalResearchQueries / achievement.requirement) * 100,
            100
          );
          break;
      }
    }

    return { achievement, progress, earned };
  });
}
