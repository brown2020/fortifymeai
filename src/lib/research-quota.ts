import { adminDb } from "@/lib/firebase-admin";
import {
  nextRateLimit,
  parseRateLimitState,
  type RateLimitDecision,
  type RateLimitState,
} from "@/lib/rate-limit";

const memoryByUser = new Map<string, RateLimitState>();

function consumeMemoryQuota(uid: string, now: number): RateLimitDecision {
  if (memoryByUser.size > 1000) {
    for (const [key, value] of memoryByUser) {
      if (now - value.windowStartMs >= 60_000) {
        memoryByUser.delete(key);
      }
    }
  }

  const decision = nextRateLimit(memoryByUser.get(uid) ?? null, now);
  if (decision.allowed) {
    memoryByUser.set(uid, decision.state);
  }
  return decision;
}

/**
 * Shared per-user quota in Firestore, with the in-memory limiter as a
 * fallback when Admin Firestore is unavailable. Denied requests are not written.
 */
export async function consumeResearchQuota(
  uid: string,
  now: number = Date.now()
): Promise<RateLimitDecision> {
  const ref = adminDb.collection("researchRateLimits").doc(uid);
  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const decision = nextRateLimit(
        snap.exists ? parseRateLimitState(snap.data()) : null,
        now
      );
      if (decision.allowed) {
        tx.set(ref, decision.state);
      }
      return decision;
    });
  } catch {
    return consumeMemoryQuota(uid, now);
  }
}
