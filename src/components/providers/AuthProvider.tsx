'use client';

import { useEffect } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  clearServerSession,
  createServerSession,
  subscribeToAuthBroadcast,
  useAuthStore,
} from '../../lib/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let active = true;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!active) return;
      setLoading(true);

      try {
        if (user) {
          await createServerSession(user);
          if (active) {
            setUser(user);
          }
        } else {
          await clearServerSession();
          if (active) {
            setUser(null);
          }
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
      unsubscribe();
      unsubscribeBroadcast();
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}

