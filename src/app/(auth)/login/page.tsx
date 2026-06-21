"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/store/auth-store";
import { Mail, ArrowLeft, Sparkles, Pill, Send } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; path=/; samesite=lax`;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState(ROUTES.dashboard);
  const { signIn, signInWithGoogle, sendEmailSignInLink } = useAuthStore();

  const searchParamCallbackUrl = useMemo(
    () => searchParams.get("callbackUrl"),
    [searchParams]
  );

  useEffect(() => {
    const redirectCookie = getCookieValue("redirect_url");
    setCallbackUrl(
      getSafeRedirectPath(searchParamCallbackUrl || redirectCookie, ROUTES.dashboard)
    );
  }, [searchParamCallbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      setStatus("");
      setLoading(true);
      const user = await signIn(email, password);
      clearCookie("redirect_url");
      router.push(user.emailVerified ? callbackUrl : ROUTES.verifyEmail);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not sign you in."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setStatus("");
      setLoading(true);
      await signInWithGoogle();
      clearCookie("redirect_url");
      router.push(callbackUrl);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not sign you in with Google."));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLink = async () => {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    try {
      setError("");
      setStatus("");
      setLoading(true);
      await sendEmailSignInLink(email);
      setStatus("Check your email for a secure sign-in link.");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not send a sign-in link."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 page-transition">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

      <div className="relative max-w-md w-full mx-auto px-4 pt-8">
        {/* Back link */}
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 
              border border-emerald-500/20">
              <Pill className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xl font-bold gradient-text">Fortify.me</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {error}
              </div>
            )}
            {status && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                {status}
              </div>
            )}

            <div className="space-y-4">
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <PasswordField
                id="password"
                name="password"
                label="Password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                href={ROUTES.forgotPassword}
                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Forgot password?
              </Link>
              <button
                type="button"
                onClick={handleEmailLink}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                Email me a link
              </button>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                isLoading={loading}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Sign in
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                variant="outline"
                disabled={loading}
                className="w-full gap-2"
              >
                <Image
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Sign in with Google
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES.signup}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
