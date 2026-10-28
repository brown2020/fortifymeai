import { Metadata } from "next";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { type GroupedDoseEntries } from "@/components/dashboard/today-schedule";
import { getLocalDateId, recentLocalDateIds } from "@/lib/date-id";
import { groupPlannedDoses, plannedDoses } from "@/lib/dose-log-record";
import { getDoseLogTakenEntryIds } from "./actions";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard | Fortify.me",
};


async function getSupplementCount(userId: string): Promise<number> {
  try {
    const snapshot = await adminDb
      .collection("supplements")
      .where("userId", "==", userId)
      .count()
      .get();
    return snapshot.data().count;
  } catch {
    return 0;
  }
}

async function getTodaysSchedule(userId: string): Promise<GroupedDoseEntries> {
  const empty: GroupedDoseEntries = {
    morning: [],
    midday: [],
    evening: [],
    bedtime: [],
    anytime: [],
  };

  try {
    // Filter by userId and sort in memory so this does not need a composite index.
    const snapshot = await adminDb
      .collection("supplements")
      .where("userId", "==", userId)
      .get();

    const supplements = snapshot.docs
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        const createdAt = data.createdAt as { toMillis?: () => number } | undefined;
        return {
          id: doc.id,
          name: typeof data.name === "string" ? data.name : "Untitled",
          dosage: typeof data.dosage === "string" ? data.dosage : undefined,
          frequency: typeof data.frequency === "string" ? data.frequency : undefined,
          scheduleTimes: data.scheduleTimes,
          createdAtMs: createdAt?.toMillis?.() ?? 0,
        };
      })
      .sort((a, b) => b.createdAtMs - a.createdAtMs);

    return groupPlannedDoses(plannedDoses(supplements));
  } catch {
    return empty;
  }
}

async function getSearchCount(userId: string): Promise<number> {
  try {
    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .count()
      .get();
    return snapshot.data().count;
  } catch {
    return 0;
  }
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const dateId = getLocalDateId();
  const last7DateIds = recentLocalDateIds(7);
  
  let userName = "User";
  let userEmail = "";
  let supplementCount = 0;
  let searchCount = 0;
  let todaysSchedule: GroupedDoseEntries = {
    morning: [],
    midday: [],
    evening: [],
    bedtime: [],
    anytime: [],
  };
  let takenEntryIds: string[] = [];
  let daysActiveLast7 = 0;
  
  if (sessionToken) {
    const payload = await verifySessionToken(sessionToken);
    if (payload) {
      try {
        const userRecord = await adminAuth.getUser(payload.uid as string);
        userEmail = userRecord.email || "";
        userName = userRecord.displayName || userEmail.split("@")[0];
        
        // Get counts
        supplementCount = await getSupplementCount(payload.uid as string);
        searchCount = await getSearchCount(payload.uid as string);
        todaysSchedule = await getTodaysSchedule(payload.uid as string);
        takenEntryIds = await getDoseLogTakenEntryIds(dateId);

        // Days active (last 7 days) = any dose marked taken that day
        const logs = await Promise.all(
          last7DateIds.map((d) => getDoseLogTakenEntryIds(d).catch(() => []))
        );
        daysActiveLast7 = logs.filter((ids) => ids.length > 0).length;
      } catch {
        // Dashboard will show default values if data fetch fails
      }
    }
  }


  return (
    <DashboardView
      userName={userName}
      supplementCount={supplementCount}
      searchCount={searchCount}
      todaysSchedule={todaysSchedule}
      takenEntryIds={takenEntryIds}
      daysActiveLast7={daysActiveLast7}
      dateId={dateId}
    />
  );
}
