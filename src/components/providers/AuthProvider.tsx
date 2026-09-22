'use client';

import { useEffect } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  createServerSession,
  subscribeToAuthBroadcast,
  useAuthStore,
} from '../../lib/store/auth-store';

/** Clears navbar/auth loading if Firebase settle or session POST hangs. */
const AUTH_SETTLE_TIMEOUT_MS = 15_000;

/**
 * Syncs Firebase client auth → server session cookie.
 * Important: a null client user must NOT clear the HTTP-only session cookie.
 * Cookie-only SSR/proxy auth (and server actions) remain valid until explicit logout.
 * Clearing happens only in `logout()` / `clearServerSession` callers.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let active = true;

    const settleTimeout = window.setTimeout(() => {
      if (active) {
        setLoading(false);
      }
    }, AUTH_SETTLE_TIMEOUT_MS);

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!active) return;
      setLoading(true);

      try {
        if (user) {
          await createServerSession(user);
          if (active) {
            setUser(user);
          }
        } else if (active) {
          setUser(null);
        }
      } catch {
        await signOut(auth).catch(() => undefined);
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
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
