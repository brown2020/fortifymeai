"use server";

import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { verifySessionToken } from "@/lib/session";

async function requireUserId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    throw new Error("Unauthorized");
  }

  const session = await verifySessionToken(sessionToken);
  if (!session?.uid) {
    throw new Error("Unauthorized");
  }

  return session.uid as string;
}

export async function getDoseLogTakenEntryIds(dateId: string): Promise<string[]> {
  const userId = await requireUserId();
  const doc = await adminDb
    .collection("users")
    .doc(userId)
    .collection("doseLogs")
    .doc(dateId)
    .get();

  const data = doc.data();
  const takenEntryIds = Array.isArray(data?.takenEntryIds)
    ? (data?.takenEntryIds.filter((id) => typeof id === "string") as string[])
    : [];

  return takenEntryIds;
}

export async function toggleDoseEntry(dateId: string, entryId: string): Promise<{
  taken: boolean;
}> {
  const userId = await requireUserId();
  const docRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("doseLogs")
    .doc(dateId);

  const result = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const existing = snap.data();
    const takenEntryIds = Array.isArray(existing?.takenEntryIds)
      ? (existing?.takenEntryIds.filter((id) => typeof id === "string") as string[])
      : [];

    const isTaken = takenEntryIds.includes(entryId);

    if (!snap.exists) {
      tx.set(
        docRef,
        {
          dateId,
          takenEntryIds: isTaken ? [] : [entryId],
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return { taken: !isTaken };
    }

    tx.set(
      docRef,
      {
        dateId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    tx.update(docRef, {
      takenEntryIds: isTaken
        ? FieldValue.arrayRemove(entryId)
        : FieldValue.arrayUnion(entryId),
    });

    return { taken: !isTaken };
  });

  return result;
}

