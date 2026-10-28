"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/require-user";

async function deleteInBatches(
  refs: FirebaseFirestore.DocumentReference[]
): Promise<void> {
  for (let index = 0; index < refs.length; index += 400) {
    const batch = adminDb.batch();
    for (const ref of refs.slice(index, index + 400)) {
      batch.delete(ref);
    }
    await batch.commit();
  }
}

async function deleteCollection(
  collection: FirebaseFirestore.CollectionReference
): Promise<void> {
  const snapshot = await collection.get();
  for (const doc of snapshot.docs) {
    const nested = await doc.ref.listCollections();
    for (const child of nested) {
      await deleteCollection(child);
    }
  }
  await deleteInBatches(snapshot.docs.map((doc) => doc.ref));
}

export async function deleteAccount(): Promise<{ success: true }> {
  const session = await requireSession();
  const userId = session.uid;

  const supplements = await adminDb
    .collection("supplements")
    .where("userId", "==", userId)
    .get();
  await deleteInBatches(supplements.docs.map((doc) => doc.ref));

  const userRef = adminDb.collection("users").doc(userId);
  const collections = await userRef.listCollections();
  for (const collection of collections) {
    await deleteCollection(collection);
  }
  await userRef.delete().catch(() => undefined);
  await adminDb.collection("researchRateLimits").doc(userId).delete().catch(() => undefined);
  try {
    await adminAuth.deleteUser(userId);
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";
    if (code !== "auth/user-not-found") {
      throw error;
    }
  }

  return { success: true };
}
