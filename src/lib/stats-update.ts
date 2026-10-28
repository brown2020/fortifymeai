import { getNewAchievements } from "@/lib/models/user-stats";
import { previousDateId } from "@/lib/date-id";

export type StatsState = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalDosesTaken: number;
  totalDosesLogged: number;
  totalSupplementsTracked: number;
  totalResearchQueries: number;
  adherenceRate: number;
  weeklyAdherence: number[];
  achievementIds: string[];
};

export function emptyStats(): StatsState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    totalDosesTaken: 0,
    totalDosesLogged: 0,
    totalSupplementsTracked: 0,
    totalResearchQueries: 0,
    adherenceRate: 0,
    weeklyAdherence: [],
    achievementIds: [],
  };
}

export function parseStatsState(value: unknown): StatsState {
  const base = emptyStats();
  if (!value || typeof value !== "object") return base;
  const record = value as Record<string, unknown>;
  const numberField = (key: keyof StatsState) =>
    typeof record[key] === "number" && Number.isFinite(record[key] as number)
      ? (record[key] as number)
      : base[key];

  const achievementIds = Array.isArray(record.achievements)
    ? record.achievements.flatMap((achievement) => {
        if (!achievement || typeof achievement !== "object") return [];
        const id = (achievement as { id?: unknown }).id;
        return typeof id === "string" ? [id] : [];
      })
    : [];

  return {
    currentStreak: numberField("currentStreak") as number,
    longestStreak: numberField("longestStreak") as number,
    lastActiveDate:
      typeof record.lastActiveDate === "string" ? record.lastActiveDate : "",
    totalDosesTaken: numberField("totalDosesTaken") as number,
    totalDosesLogged: numberField("totalDosesLogged") as number,
    totalSupplementsTracked: numberField("totalSupplementsTracked") as number,
    totalResearchQueries: numberField("totalResearchQueries") as number,
    adherenceRate: numberField("adherenceRate") as number,
    weeklyAdherence: Array.isArray(record.weeklyAdherence)
      ? record.weeklyAdherence.filter((item): item is number => typeof item === "number")
      : [],
    achievementIds,
  };
}

function withAchievements(stats: StatsState, previousIds: string[]): StatsState {
  const unlocked = getNewAchievements(stats, previousIds);
  return {
    ...stats,
    achievementIds: [...previousIds, ...unlocked.map((achievement) => achievement.id)],
  };
}

export function applyDoseActivity(
  previous: StatsState,
  input: {
    dateId: string;
    takenCount: number;
    takenDelta: number;
    supplementCount: number;
  }
): StatsState {
  let currentStreak = previous.currentStreak;
  let lastActiveDate = previous.lastActiveDate;

  if (input.takenCount > 0 && previous.lastActiveDate !== input.dateId) {
    const continued = previous.lastActiveDate === previousDateId(input.dateId);
    currentStreak = continued ? previous.currentStreak + 1 : 1;
    lastActiveDate = input.dateId;
  }

  const next: StatsState = {
    ...previous,
    currentStreak,
    longestStreak: Math.max(previous.longestStreak, currentStreak),
    lastActiveDate,
    totalDosesTaken: Math.max(0, previous.totalDosesTaken + input.takenDelta),
    totalDosesLogged:
      input.takenDelta > 0
        ? previous.totalDosesLogged + 1
        : previous.totalDosesLogged,
    totalSupplementsTracked: input.supplementCount,
  };

  return withAchievements(next, previous.achievementIds);
}

export function applyResearchQuery(previous: StatsState): StatsState {
  const next: StatsState = {
    ...previous,
    totalResearchQueries: previous.totalResearchQueries + 1,
  };
  return withAchievements(next, previous.achievementIds);
}
