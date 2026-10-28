"use server";

import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { AuthzError, requireVerifiedSession } from "@/lib/require-user";
import { recordResearchQuery } from "@/lib/stats-store";
import { clampHistoryLimit } from "@/lib/history-limit";

export type ResearchCategory =
  | "general"
  | "benefits"
  | "dosing"
  | "interactions"
  | "stacking"
  | "evidence";

export interface SearchHistoryItem {
  id: string;
  query: string;
  response: string;
  category: ResearchCategory;
  timestamp: Date;
  isBookmarked: boolean;
}

const CATEGORIES = [
  "general",
  "benefits",
  "dosing",
  "interactions",
  "stacking",
  "evidence",
] as const;

const saveSearchSchema = z.object({
  query: z.string().trim().min(1).max(8_000),
  response: z.string().max(100_000),
  category: z.enum(CATEGORIES),
});

async function verifiedUserId(): Promise<string | null> {
  try {
    const session = await requireVerifiedSession();
    return session.uid;
  } catch (error) {
    if (error instanceof AuthzError) return null;
    return null;
  }
}

export async function saveSearch(
  query: string,
  response: string,
  category: ResearchCategory = "general"
): Promise<{ success: boolean; id?: string }> {
  const userId = await verifiedUserId();
  if (!userId) return { success: false };

  const parsed = saveSearchSchema.safeParse({ query, response, category });
  if (!parsed.success) return { success: false };

  try {
    const docRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .add({
        query: parsed.data.query,
        response: parsed.data.response,
        category: parsed.data.category,
        timestamp: FieldValue.serverTimestamp(),
        isBookmarked: false,
      });

    try {
      await recordResearchQuery(userId);
    } catch {
      // History is saved even if the derived stats document cannot be updated.
    }

    return { success: true, id: docRef.id };
  } catch {
    return { success: false };
  }
}

export async function getSearchHistory(
  limit: number = 20
): Promise<SearchHistoryItem[]> {
  try {
    const userId = await verifiedUserId();
    if (!userId) return [];
    const searchesSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .orderBy("timestamp", "desc")
      .limit(clampHistoryLimit(limit))
      .get();

    return searchesSnapshot.docs.map((doc) => {
      const data = doc.data();
      const category = CATEGORIES.includes(data.category) ? data.category : "general";
      return {
        id: doc.id,
        query: typeof data.query === "string" ? data.query : "",
        response: typeof data.response === "string" ? data.response : "",
        category,
        timestamp: data.timestamp?.toDate?.() || new Date(),
        isBookmarked: data.isBookmarked === true,
      };
    });
  } catch {
    return [];
  }
}

export async function deleteSearch(searchId: string): Promise<{ success: boolean }> {
  if (!searchId || searchId.length > 200 || searchId.includes("/")) {
    return { success: false };
  }
  try {
    const userId = await verifiedUserId();
    if (!userId) return { success: false };
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .doc(searchId)
      .delete();
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function toggleBookmark(
  searchId: string
): Promise<{ success: boolean; isBookmarked: boolean }> {
  if (!searchId || searchId.length > 200 || searchId.includes("/")) {
    throw new Error("Invalid search");
  }
  const session = await requireVerifiedSession();
  const userId = session.uid;

  const searchRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("searches")
    .doc(searchId);

  const newBookmarked = await adminDb.runTransaction(async (tx) => {
    const searchDoc = await tx.get(searchRef);

    if (!searchDoc.exists) {
      throw new Error("Search not found");
    }

    const currentBookmarked = searchDoc.data()?.isBookmarked === true;
    const toggled = !currentBookmarked;

    tx.update(searchRef, {
      isBookmarked: toggled,
      bookmarkedAt: toggled ? FieldValue.serverTimestamp() : null,
    });

    return toggled;
  });

  return { success: true, isBookmarked: newBookmarked };
}
