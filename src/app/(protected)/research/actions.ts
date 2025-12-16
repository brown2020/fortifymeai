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

export interface BookmarkedResearch {
  id: string;
  query: string;
  response: string;
  category: ResearchCategory;
  timestamp: Date;
  title?: string;
  notes?: string;
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
  } catch (error) {
    console.error(
      "Save search error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
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
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("History error:", errorMessage);
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
  } catch (error) {
    console.error(
      "Delete error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}

/**
 * Toggle bookmark status on a search
 */
export async function toggleBookmark(
  searchId: string
): Promise<{ success: boolean; isBookmarked: boolean }> {
  try {
    const userId = await verifySession();

    const searchRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .doc(searchId);

    const searchDoc = await searchRef.get();
    
    if (!searchDoc.exists) {
      throw new Error("Search not found");
    }

    const currentBookmarked = searchDoc.data()?.isBookmarked || false;
    const newBookmarked = !currentBookmarked;

    await searchRef.update({
      isBookmarked: newBookmarked,
      bookmarkedAt: newBookmarked ? FieldValue.serverTimestamp() : null,
    });

    return { success: true, isBookmarked: newBookmarked };
  } catch (error) {
    console.error(
      "Toggle bookmark error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}

/**
 * Get all bookmarked research items
 */
export async function getBookmarkedResearch(): Promise<BookmarkedResearch[]> {
  try {
    const userId = await verifySession();

    const bookmarksSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .where("isBookmarked", "==", true)
      .orderBy("bookmarkedAt", "desc")
      .limit(50)
      .get();

    return bookmarksSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        query: data.query || "",
        response: data.response || "",
        category: data.category || "general",
        timestamp: data.timestamp?.toDate() || new Date(),
        title: data.title,
        notes: data.notes,
      };
    });
  } catch (error) {
    console.error(
      "Get bookmarks error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return [];
  }
}

/**
 * Update bookmark with custom title and notes
 */
export async function updateBookmarkDetails(
  searchId: string,
  title?: string,
  notes?: string
): Promise<{ success: boolean }> {
  try {
    const userId = await verifySession();

    await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .doc(searchId)
      .update({
        title: title || null,
        notes: notes || null,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error(
      "Update bookmark error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}

/**
 * Get search statistics for the user
 */
export async function getSearchStats(): Promise<{
  totalSearches: number;
  totalBookmarks: number;
  categoryCounts: Record<ResearchCategory, number>;
}> {
  try {
    const userId = await verifySession();

    const searchesSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .get();

    const categoryCounts: Record<ResearchCategory, number> = {
      general: 0,
      benefits: 0,
      dosing: 0,
      interactions: 0,
      stacking: 0,
      evidence: 0,
    };

    let totalBookmarks = 0;

    searchesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const category = (data.category || "general") as ResearchCategory;
      if (categoryCounts[category] !== undefined) {
        categoryCounts[category]++;
      }
      if (data.isBookmarked) {
        totalBookmarks++;
      }
    });

    return {
      totalSearches: searchesSnapshot.size,
      totalBookmarks,
      categoryCounts,
    };
  } catch (error) {
    console.error(
      "Get stats error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      totalSearches: 0,
      totalBookmarks: 0,
      categoryCounts: {
        general: 0,
        benefits: 0,
        dosing: 0,
        interactions: 0,
        stacking: 0,
        evidence: 0,
      },
    };
  }
}

/**
 * Clear all search history (excluding bookmarks)
 */
export async function clearSearchHistory(): Promise<{ success: boolean; deletedCount: number }> {
  try {
    const userId = await verifySession();

    const searchesSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .where("isBookmarked", "==", false)
      .get();

    const batch = adminDb.batch();
    let deletedCount = 0;

    searchesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    await batch.commit();

    return { success: true, deletedCount };
  } catch (error) {
    console.error(
      "Clear history error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}
