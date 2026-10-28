import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { ACHIEVEMENTS } from "@/lib/models/user-stats";
import {
  applyDoseActivity,
  applyResearchQuery,
  parseStatsState,
  type StatsState,
} from "@/lib/stats-update";

function achievementRecords(state: StatsState, existing: unknown) {
  const previous = new Map<string, Record<string, unknown>>();
  if (Array.isArray(existing)) {
    for (const achievement of existing) {
      if (!achievement || typeof achievement !== "object") continue;
      const id = (achievement as { id?: unknown }).id;
      if (typeof id === "string") {
        previous.set(id, achievement as Record<string, unknown>);
      }
    }
  }

  return state.achievementIds.flatMap((id) => {
    const definition = ACHIEVEMENTS.find((achievement) => achievement.id === id);
    if (!definition) return [];
    const stored = previous.get(id);
    return [
      {
        ...definition,
        earnedAt: stored?.earnedAt ?? FieldValue.serverTimestamp(),
      },
    ];
  });
}

function statsPayload(state: StatsState, existing: Record<string, unknown> | undefined, userId: string) {
  return {
    userId,
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    lastActiveDate: state.lastActiveDate,
    totalDosesTaken: state.totalDosesTaken,
    totalDosesLogged: state.totalDosesLogged,
    totalSupplementsTracked: state.totalSupplementsTracked,
    totalResearchQueries: state.totalResearchQueries,
    adherenceRate: state.adherenceRate,
    weeklyAdherence: state.weeklyAdherence,
    achievements: achievementRecords(state, existing?.achievements),
    memberSince: existing?.memberSince ?? FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function writeStats(
  userId: string,
  update: (current: StatsState) => StatsState
): Promise<void> {
  const ref = adminDb.collection("users").doc(userId).collection("stats").doc("current");
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = snap.exists ? (snap.data() as Record<string, unknown>) : undefined;
    const next = update(parseStatsState(existing));
    tx.set(ref, statsPayload(next, existing, userId));
  });
}

export async function recordDoseActivity(
  userId: string,
  input: {
    dateId: string;
    takenCount: number;
    takenDelta: number;
    supplementCount: number;
  }
): Promise<void> {
  await writeStats(userId, (current) => applyDoseActivity(current, input));
}

export async function recordResearchQuery(userId: string): Promise<void> {
  await writeStats(userId, (current) => applyResearchQuery(current));
}
