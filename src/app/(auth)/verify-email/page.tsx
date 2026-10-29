"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { MailCheck, RefreshCcw, Send, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { auth } from "@/lib/firebase";
import { deleteAccount } from "@/app/(protected)/profile/actions";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { ROUTES } from "@/lib/constants";
import {
  RESEND_COOLDOWN_MS,
  canResendVerification,
  formatVerificationError,
  resendCooldownSeconds,
} from "@/lib/verification-email";
import { Button } from "@/components/ui/button";

const ACCOUNT_SETTLE_MS = 1_500;

export default function VerifyEmail() {
  const router = useRouter();
  const {
    user,
    sendVerificationEmail,
    refreshUser,
    logout,
    verificationNotice,
    clearVerificationNotice,
  } = useAuthStore();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"resend" | "refresh" | "delete" | null>(null);
  const [accountReady, setAccountReady] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [checkingVerification, setCheckingVerification] = useState(true);
  const verifiedCheckStarted = useRef(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      if (!active) return;
      setAccountReady(Boolean(current));
      setAccountEmail(current?.email ?? null);
      if (!current) return;
      if (verifiedCheckStarted.current) return;
      verifiedCheckStarted.current = true;
      try {
        const refreshed = await refreshUser();
        if (!active) return;
        if (refreshed?.emailVerified) {
          window.location.assign(ROUTES.dashboard);
          return;
        }
      } catch {
        // Keep the verify screen so the user can resend or try again.
      }
      if (active) setCheckingVerification(false);
    });

    const settle = window.setTimeout(() => {
      if (!active || auth.currentUser) return;
      setAccountReady(false);
      setCheckingVerification(false);
    }, ACCOUNT_SETTLE_MS);

    return () => {
      active = false;
      unsubscribe();
      window.clearTimeout(settle);
    };
  }, [refreshUser]);

  useEffect(() => {
    if (!verificationNotice) return;
    setError(verificationNotice);
    setStatus("");
    clearVerificationNotice();
  }, [verificationNotice, clearVerificationNotice]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const timer = window.setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (next >= cooldownUntil) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const emailAddress = user?.email || accountEmail;
  const hasAccount = Boolean(user) || accountReady;
  const cooldownSeconds = resendCooldownSeconds(now, cooldownUntil);
  const resendEnabled = canResendVerification(hasAccount, now, cooldownUntil);

  const handleResend = async () => {
    if (!resendEnabled) return;
    try {
      setError("");
      setStatus("");
      setLoading("resend");
      await sendVerificationEmail();
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      setNow(Date.now());
      setStatus("Verification email sent. Check your inbox for the secure link.");
    } catch (err: unknown) {
      setError(formatVerificationError(err));
    } finally {
      setLoading(null);
    }
  };

  const handleRefresh = async () => {
    try {
      setError("");
      setStatus("");
      setLoading("refresh");
      const refreshed = await refreshUser();
      if (refreshed?.emailVerified) {
        setStatus("Email verified. You can continue to your dashboard.");
        router.push(ROUTES.dashboard);
      } else {
        setStatus("Still waiting on verification. Open the link from your email first.");
      }
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not refresh your verification status."));
    } finally {
      setLoading(null);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push(ROUTES.home);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this unverified account and its data? This cannot be undone.")) {
      return;
    }
    try {
      setError("");
      setLoading("delete");
      await deleteAccount();
      const { logout } = useAuthStore.getState();
      await logout();
      router.push(ROUTES.home);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not delete this account."));
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 page-transition">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

      <div className="relative max-w-md w-full mx-auto px-4 pt-16">
        <div className="glass-card p-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <MailCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {checkingVerification ? "Checking verification" : "Verify your email"}
          </h1>
          <p className="text-slate-400 mb-6">
            {checkingVerification
              ? "Confirming whether this email is already verified."
              : emailAddress
                ? error
                  ? `A verification email for ${emailAddress} was not sent.`
                  : `We sent a verification link to ${emailAddress}.`
                : "Sign in, then request a new verification link."}
          </p>

          {status && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
              {status}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {!checkingVerification && (
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleResend}
              isLoading={loading === "resend"}
              disabled={!resendEnabled}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {cooldownSeconds > 0
                ? `Resend available in ${cooldownSeconds}s`
                : "Resend verification email"}
            </Button>
            <Button
              type="button"
              onClick={handleRefresh}
              isLoading={loading === "refresh"}
              disabled={!hasAccount}
              variant="outline"
              className="w-full gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              I verified my email
            </Button>
            <Link href={ROUTES.dashboard}>
              <Button variant="ghost" className="w-full gap-2">
                <ShieldCheck className="h-4 w-4" />
                Continue to dashboard
              </Button>
            </Link>
            <Button
              type="button"
              onClick={handleSignOut}
              variant="ghost"
              className="w-full"
            >
              Sign out
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              isLoading={loading === "delete"}
              disabled={!hasAccount || loading !== null}
              variant="danger"
              className="w-full"
            >
              Delete unverified account
            </Button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
