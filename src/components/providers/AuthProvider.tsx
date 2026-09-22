"use client";

import { useEffect, useRef } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  createServerSession,
  subscribeToAuthBroadcast,
  useAuthStore,
} from "../../lib/store/auth-store";

/** Clears navbar/auth loading if Firebase settle or session POST hangs. */
const AUTH_SETTLE_TIMEOUT_MS = 15_000;

/**
 * Syncs Firebase client auth → server session cookie.
 * Important: a null client user must NOT clear the HTTP-only session cookie.
 * Cookie-only SSR/proxy auth (and server actions) remain valid until explicit logout.
 * Clearing happens only in `logout()` / `clearServerSession` callers.
 *
 * Publish the client user only after attempting session sync so the navbar does
 * not prefetch protected routes before the cookie exists (that caused 307s back
 * to /login?callbackUrl=… and blocked dashboard/profile after sign-in).
 * Never signOut on sync failure — that hid the avatar and broke /profile.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const initialSettleDone = useRef(false);

  useEffect(() => {
    let active = true;

    const settleTimeout = window.setTimeout(() => {
      if (active) {
        initialSettleDone.current = true;
        setLoading(false);
      }
    }, AUTH_SETTLE_TIMEOUT_MS);

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!active) return;

      // Only gate the navbar on the first auth resolution — token refreshes
      // must not hide the user avatar / Account menu.
      if (!initialSettleDone.current) {
        setLoading(true);
      }

      try {
        if (user) {
          try {
            await createServerSession(user);
          } catch {
            // Keep going — cookie may already be valid from the login path.
          }
          if (active) {
            setUser(user);
          }
        } else if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          initialSettleDone.current = true;
          setLoading(false);
        }
      }
    });

    const unsubscribeBroadcast = subscribeToAuthBroadcast(() => {
      setUser(null);
      setLoading(false);
    });

    return () => {
      active = false;
      window.clearTimeout(settleTimeout);
      unsubscribe();
      unsubscribeBroadcast();
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}
