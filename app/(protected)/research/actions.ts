"use server";

import { openai } from "../../../lib/openai";
import { adminDb } from "../../../lib/firebase-admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { SESSION_COOKIE_NAME } from "../../../lib/constants";
import { verifySessionToken } from "../../../lib/session";

async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    throw new Error("Please sign in to use the research feature");
  }

  const session = await verifySessionToken(sessionCookie);
  if (!session?.uid) {
    throw new Error("Invalid session. Please sign in again.");
  }

  return session.uid;
}

export async function searchSupplement(query: string) {
  try {
    const userId = await verifySession();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable expert in dietary supplements. Provide accurate, scientific information about supplements, including benefits, risks, interactions, and dosage recommendations. Always include references to scientific studies when available.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await adminDb.collection("users").doc(userId).collection("searches").add({
      query,
      response: content,
      timestamp: FieldValue.serverTimestamp(),
    });

    return { content };
  } catch (error) {
    console.error(
      "Search error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}

export async function getSearchHistory(userId: string) {
  try {
    const searchesSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    return searchesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        query: data.query || "",
        response: data.response || "",
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("History error:", errorMessage);
    return [];
  }
}

export async function deleteSearch(userId: string, searchId: string) {
  try {
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
