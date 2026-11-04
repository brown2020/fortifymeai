"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/components/ui/toaster";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { API_ROUTES, ROUTES } from "@/lib/constants";
import { deleteAccount } from "./actions";
import {
  ProfileAccountCard,
  ProfileDangerZone,
  ProfileHeader,
  ProfileSessionCard,
  ProfileSettingsCard,
} from "./profile-sections";

type SessionMe = { uid: string; email: string | null; emailVerified: boolean };

/** If client auth is slow/cleared, fall back to session cookie via /api/me. */
const PROFILE_ME_WATCHDOG_MS = 8_000;

export default function Profile() {
  const { user, loading: authLoading, logout, sendPasswordReset } = useAuthStore();
  const { addToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sessionMe, setSessionMe] = useState<SessionMe | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [meTimedOut, setMeTimedOut] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setSessionMe(null);
      setMeLoading(false);
      setMeTimedOut(false);
      return;
    }

    let ignore = false;
    const controller = new AbortController();
    setMeLoading(true);
    setMeTimedOut(false);

    const watchdog = window.setTimeout(() => {
      if (ignore) return;
      setMeTimedOut(true);
      setMeLoading(false);
      controller.abort();
    }, PROFILE_ME_WATCHDOG_MS);

    async function loadSession() {
      try {
        const res = await fetch(API_ROUTES.me, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        if (ignore) return;
        if (!res.ok) {
          setSessionMe(null);
          return;
        }
        const data = (await res.json()) as { user?: SessionMe | null };
        if (ignore) return;
        setSessionMe(data.user ?? null);
      } catch {
        if (ignore) return;
        if (controller.signal.aborted) return;
        setSessionMe(null);
      } finally {
        window.clearTimeout(watchdog);
        if (ignore) return;
        setMeLoading(false);
      }
    }

    void loadSession();

    return () => {
      ignore = true;
      window.clearTimeout(watchdog);
      controller.abort();
    };
  }, [user?.email]);

  const displayEmail = user?.email || sessionMe?.email || null;
  const identityLoading = !displayEmail && (authLoading || meLoading) && !meTimedOut;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = ROUTES.home;
    } catch {
      addToast("Failed to sign out. Please try again.", "error");
    }
  };

  const handlePasswordReset = async () => {
    if (!displayEmail) {
      addToast("No email address is available for this account.", "error");
      return;
    }

    try {
      await sendPasswordReset(displayEmail);
      addToast("Password reset email sent.", "success");
    } catch (err: unknown) {
      addToast(getAuthErrorMessage(err, "Failed to send reset email."), "error");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      await logout();
      window.location.href = ROUTES.home;
    } catch {
      addToast("Failed to delete your account. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 page-transition">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader />
        <ProfileAccountCard
          identityLoading={identityLoading}
          displayEmail={displayEmail}
          onPasswordReset={() => {
            void handlePasswordReset();
          }}
        />
        <ProfileSettingsCard
          onComingSoon={() => addToast("This feature is coming soon!", "info")}
        />
        <ProfileSessionCard
          onLogout={() => {
            void handleLogout();
          }}
        />
        <ProfileDangerZone
          showDeleteConfirm={showDeleteConfirm}
          isDeleting={isDeleting}
          onAskDelete={() => setShowDeleteConfirm(true)}
          onCancelDelete={() => setShowDeleteConfirm(false)}
          onConfirmDelete={() => {
            void handleDeleteAccount();
          }}
        />
      </div>
    </div>
  );
}
