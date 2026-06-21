"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, RefreshCcw, Send, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const { user, sendVerificationEmail, refreshUser } = useAuthStore();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"resend" | "refresh" | null>(null);

  const handleResend = async () => {
    try {
      setError("");
      setStatus("");
      setLoading("resend");
      await sendVerificationEmail();
      setStatus("Verification email sent. Check your inbox for the secure link.");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not send a verification email."));
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
      } else {
        setStatus("Still waiting on verification. Open the link from your email first.");
      }
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not refresh your verification status."));
    } finally {
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
          <h1 className="text-3xl font-bold text-white mb-2">Verify your email</h1>
          <p className="text-slate-400 mb-6">
            {user?.email
              ? `We sent a verification link to ${user.email}.`
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

          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleResend}
              isLoading={loading === "resend"}
              disabled={!user}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              Resend verification email
            </Button>
            <Button
              type="button"
              onClick={handleRefresh}
              isLoading={loading === "refresh"}
              disabled={!user}
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
          </div>
        </div>
      </div>
    </div>
  );
}
