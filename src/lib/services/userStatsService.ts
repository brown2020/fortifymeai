import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  UserStats,
  Achievement,
  ACHIEVEMENTS,
  getNewAchievements,
} from "../models/user-stats";
import { getRecentDoseLogs, getDoseLogStats } from "./doseLogService";
import { format, differenceInDays, parseISO } from "date-fns";

/**
 * Get user stats
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const docRef = doc(db, `users/${userId}/stats`, "current");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserStats;
  }

  return null;
}

/**
 * Initialize user stats for new users
 */
export async function initializeUserStats(userId: string): Promise<UserStats> {
  const initialStats: Omit<UserStats, "updatedAt"> & {
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    totalDosesTaken: 0,
    totalDosesLogged: 0,
    totalSupplementsTracked: 0,
    totalResearchQueries: 0,
    adherenceRate: 0,
    weeklyAdherence: [0, 0, 0, 0, 0, 0, 0],
    achievements: [],
    memberSince: Timestamp.fromDate(new Date()),
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(db, `users/${userId}/stats`, "current");
  await setDoc(docRef, initialStats);

  return initialStats as UserStats;
}

/**
 * Update user stats (called after logging doses, etc.)
 */
export async function updateUserStats(
  userId: string,
  updates: Partial<{
    dosesTaken: number;
    dosesLogged: number;
    supplementsTracked: number;
    researchQueries: number;
  }>
): Promise<{ stats: UserStats; newAchievements: Achievement[] }> {
  const docRef = doc(db, `users/${userId}/stats`, "current");
  let stats = await getUserStats(userId);

  if (!stats) {
    stats = await initializeUserStats(userId);
  }

  const today = format(new Date(), "yyyy-MM-dd");

  // Update totals
  if (updates.dosesTaken) {
    stats.totalDosesTaken += updates.dosesTaken;
  }
  if (updates.dosesLogged) {
    stats.totalDosesLogged += updates.dosesLogged;
  }
  if (updates.supplementsTracked !== undefined) {
    stats.totalSupplementsTracked = updates.supplementsTracked;
  }
  if (updates.researchQueries) {
    stats.totalResearchQueries += updates.researchQueries;
  }

  // Update streak
  if (stats.lastActiveDate !== today) {
    const lastActive = stats.lastActiveDate ? parseISO(stats.lastActiveDate) : null;
    const todayDate = parseISO(today);

    if (lastActive) {
      const daysDiff = differenceInDays(todayDate, lastActive);

      if (daysDiff === 1) {
        // Consecutive day - increment streak
        stats.currentStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken - reset
        stats.currentStreak = 1;
      }
      // daysDiff === 0 means same day, no change
    } else {
      // First activity
      stats.currentStreak = 1;
    }

    stats.lastActiveDate = today;

    // Update longest streak
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  }

  // Update weekly adherence
  const doseStats = await getDoseLogStats(userId, 7);
  stats.adherenceRate = doseStats.adherenceRate;

  // Calculate daily adherence for the week
  const recentLogs = await getRecentDoseLogs(userId, 7);
  stats.weeklyAdherence = Array(7).fill(0);
  recentLogs.forEach((log) => {
    const logDate = parseISO(log.dateId);
    const daysAgo = differenceInDays(new Date(), logDate);
    if (daysAgo >= 0 && daysAgo < 7) {
      stats!.weeklyAdherence[6 - daysAgo] = log.completionRate;
    }
  });

  // Check for new achievements
  const existingAchievementIds = stats.achievements.map((a) => a.id);
  const newAchievementDefs = getNewAchievements(stats, existingAchievementIds);

  const newAchievements: Achievement[] = newAchievementDefs.map((def) => ({
    ...def,
    earnedAt: Timestamp.fromDate(new Date()),
  }));

  stats.achievements = [...stats.achievements, ...newAchievements];

  // Save updated stats
  await setDoc(docRef, {
    ...stats,
    updatedAt: serverTimestamp(),
  });

  return { stats, newAchievements };
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
 * Get user achievements
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  const stats = await getUserStats(userId);
  return stats?.achievements ?? [];
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

/**
 * Recalculate all stats from dose logs (useful for data recovery)
 */
export async function recalculateStats(userId: string): Promise<UserStats> {
  const logs = await getRecentDoseLogs(userId, 365);

  let totalTaken = 0;
  let totalLogged = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: string | null = null;

  // Sort logs by date ascending
  const sortedLogs = [...logs].sort((a, b) => a.dateId.localeCompare(b.dateId));

  sortedLogs.forEach((log) => {
    totalLogged += log.entries.length;
    totalTaken += log.entries.filter((e) => e.taken).length;

    // Calculate streak
    if (lastDate) {
      const daysDiff = differenceInDays(parseISO(log.dateId), parseISO(lastDate));
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    lastDate = log.dateId;
  });

  // Check if streak is still active
  const today = format(new Date(), "yyyy-MM-dd");
  if (lastDate) {
    const daysSinceLast = differenceInDays(parseISO(today), parseISO(lastDate));
    if (daysSinceLast <= 1) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }
  }

  const stats = await getUserStats(userId);
  const updatedStats: UserStats = {
    userId,
    currentStreak,
    longestStreak,
    lastActiveDate: lastDate ?? "",
    totalDosesTaken: totalTaken,
    totalDosesLogged: totalLogged,
    totalSupplementsTracked: stats?.totalSupplementsTracked ?? 0,
    totalResearchQueries: stats?.totalResearchQueries ?? 0,
    adherenceRate: totalLogged > 0 ? Math.round((totalTaken / totalLogged) * 100) : 0,
    weeklyAdherence: stats?.weeklyAdherence ?? [0, 0, 0, 0, 0, 0, 0],
    achievements: stats?.achievements ?? [],
    memberSince: stats?.memberSince ?? Timestamp.fromDate(new Date()),
    updatedAt: serverTimestamp() as Timestamp,
  };

  const docRef = doc(db, `users/${userId}/stats`, "current");
  await setDoc(docRef, updatedStats);

  return updatedStats;
}
