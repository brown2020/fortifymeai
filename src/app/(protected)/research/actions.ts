"use server";

import { adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { verifySessionToken } from "@/lib/session";

// Types
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

// Session verification helper
async function verifySession(): Promise<string> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    throw new Error("Please sign in to use the research feature");
  }

  const session = await verifySessionToken(sessionCookie);
  if (!session?.uid) {
    throw new Error("Invalid session. Please sign in again.");
  }

  return session.uid as string;
}

/**
 * Save a new search to history
 */
export async function saveSearch(
  query: string, 
  response: string, 
  category: ResearchCategory = "general"
): Promise<{ success: boolean; id?: string }> {
  try {
    const userId = await verifySession();

    const docRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .add({
        query,
        response,
        category,
        timestamp: FieldValue.serverTimestamp(),
        isBookmarked: false,
      });

    return { success: true, id: docRef.id };
  } catch {
    return { success: false };
  }
}

/**
 * Get search history with optional limit
 */
export async function getSearchHistory(
  limit: number = 20
): Promise<SearchHistoryItem[]> {
  try {
    const userId = await verifySession();
    const searchesSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return searchesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        query: data.query || "",
        response: data.response || "",
        category: data.category || "general",
        timestamp: data.timestamp?.toDate() || new Date(),
        isBookmarked: data.isBookmarked || false,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Delete a search from history
 */
export async function deleteSearch(
  searchId: string
): Promise<{ success: boolean }> {
  try {
    const userId = await verifySession();
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

/**
 * Toggle bookmark status on a search
 */
export async function toggleBookmark(
  searchId: string
): Promise<{ success: boolean; isBookmarked: boolean }> {
  const userId = await verifySession();

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

    const currentBookmarked = searchDoc.data()?.isBookmarked || false;
    const toggled = !currentBookmarked;

    tx.update(searchRef, {
      isBookmarked: toggled,
      bookmarkedAt: toggled ? FieldValue.serverTimestamp() : null,
    });

    return toggled;
  });

  return { success: true, isBookmarked: newBookmarked };
}
