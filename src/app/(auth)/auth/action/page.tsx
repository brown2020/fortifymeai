"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  applyActionCode,
  confirmPasswordReset,
  isSignInWithEmailLink,
  verifyPasswordResetCode,
} from "firebase/auth";
import { CheckCircle2, Mail, ShieldAlert } from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  EMAIL_LINK_STORAGE_KEY,
  useAuthStore,
} from "@/lib/store/auth-store";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/auth/password-field";

export default function AuthAction() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("Checking your secure link...");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [resetReady, setResetReady] = useState(false);
  const { completeEmailLinkSignIn } = useAuthStore();

  const currentLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        if (!mode) {
          throw new Error("Missing action mode.");
        }

        if (mode === "verifyEmail") {
          if (!oobCode) throw new Error("Missing verification code.");
          await applyActionCode(auth, oobCode);
          if (active) {
            setStatus("Email verified. You can continue to your dashboard.");
          }
          return;
        }

        if (mode === "resetPassword") {
          if (!oobCode) throw new Error("Missing reset code.");
          const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
          if (active) {
            setEmail(verifiedEmail);
            setResetReady(true);
            setStatus("Choose a new password for your account.");
          }
          return;
        }

        if (mode === "signIn" && isSignInWithEmailLink(auth, currentLink)) {
          const storedEmail =
            typeof window !== "undefined"
              ? localStorage.getItem(EMAIL_LINK_STORAGE_KEY)
              : "";
          if (!storedEmail) {
            if (active) {
              setNeedsEmail(true);
              setStatus("Confirm your email to finish signing in.");
            }
            return;
          }
          await completeEmailLinkSignIn(storedEmail, currentLink);
          if (active) {
            setStatus("Signed in. Taking you to your dashboard.");
            router.replace(ROUTES.dashboard);
          }
          return;
        }

        throw new Error("Unsupported auth action.");
      } catch (err: unknown) {
        if (active) {
          setError(getAuthErrorMessage(err, "This link is invalid or expired."));
          setStatus("");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [completeEmailLinkSignIn, currentLink, mode, oobCode, router]);

  const handleEmailLinkSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError("");
      setLoading(true);
      await completeEmailLinkSignIn(email, currentLink);
      router.replace(ROUTES.dashboard);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not complete email-link sign-in."));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!oobCode) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("Password updated. You can sign in with your new password.");
      setResetReady(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not reset your password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 page-transition">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

      <div className="relative max-w-md w-full mx-auto px-4 pt-16">
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              {error ? (
                <ShieldAlert className="h-7 w-7 text-rose-400" />
              ) : (
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Secure account link</h1>
            {status && <p className="text-slate-400">{status}</p>}
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {needsEmail && (
            <form onSubmit={handleEmailLinkSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" isLoading={loading} className="w-full">
                Finish sign in
              </Button>
            </form>
          )}

          {resetReady && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-sm text-slate-400">Resetting password for {email}</p>
              <PasswordField
                id="password"
                name="password"
                label="New password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <PasswordField
                id="confirm-password"
                name="confirm-password"
                label="Confirm new password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <Button type="submit" isLoading={loading} className="w-full">
                Save new password
              </Button>
            </form>
          )}

          {!needsEmail && !resetReady && !loading && (
            <div className="space-y-3">
              <Link href={ROUTES.login}>
                <Button variant="outline" className="w-full">
                  Back to sign in
                </Button>
              </Link>
              {!error && (
                <Link href={ROUTES.dashboard}>
                  <Button className="w-full">Continue to dashboard</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
