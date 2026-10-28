"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireVerifiedSession } from "@/lib/require-user";
import {
  buildDoseEntries,
  isValidDateId,
  isValidDoseToggle,
  type SupplementScheduleSource,
} from "@/lib/dose-log-record";
import { recordDoseActivity } from "@/lib/stats-store";

async function requireUserId(): Promise<string> {
  const session = await requireVerifiedSession();
  return session.uid;
}

function stringIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string")
    : [];
}

export async function getDoseLogTakenEntryIds(dateId: string): Promise<string[]> {
  const userId = await requireUserId();
  if (!isValidDateId(dateId)) {
    return [];
  }
  const doc = await adminDb
    .collection("users")
    .doc(userId)
    .collection("doseLogs")
    .doc(dateId)
    .get();

  return stringIds(doc.data()?.takenEntryIds);
}

export async function toggleDoseEntry(dateId: string, entryId: string): Promise<{
  taken: boolean;
}> {
  const userId = await requireUserId();
  if (!isValidDoseToggle(dateId, entryId)) {
    throw new Error("Invalid dose entry");
  }

  const docRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("doseLogs")
    .doc(dateId);

  const supplementSnap = await adminDb
    .collection("supplements")
    .where("userId", "==", userId)
    .get();
  const supplements: SupplementScheduleSource[] = supplementSnap.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      id: doc.id,
      name: typeof data.name === "string" ? data.name : "Untitled",
      dosage: typeof data.dosage === "string" ? data.dosage : undefined,
      frequency: typeof data.frequency === "string" ? data.frequency : undefined,
      scheduleTimes: data.scheduleTimes,
    };
  });

  const result = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const existing = snap.data();
    const takenEntryIds = stringIds(existing?.takenEntryIds);
    const isTaken = takenEntryIds.includes(entryId);
    const nextTaken = isTaken
      ? takenEntryIds.filter((id) => id !== entryId)
      : [...takenEntryIds, entryId];
    const built = buildDoseEntries(supplements, nextTaken);

    const payload = {
      userId,
      dateId,
      takenEntryIds: nextTaken,
      entries: built.entries,
      completionRate: built.completionRate,
      updatedAt: FieldValue.serverTimestamp(),
      ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    };

    if (!snap.exists) {
      tx.set(docRef, payload);
    } else {
      tx.set(docRef, payload, { merge: true });
    }

    return { taken: !isTaken, takenCount: built.takenCount, takenDelta: isTaken ? -1 : 1 };
  });

  try {
    await recordDoseActivity(userId, {
      dateId,
      takenCount: result.takenCount,
      takenDelta: result.takenDelta,
      supplementCount: supplements.length,
    });
  } catch {
    // The dose log is already saved. Stats are derived and can catch up later.
  }

  return { taken: result.taken };
}