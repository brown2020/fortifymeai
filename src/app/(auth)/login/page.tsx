"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { PageBackground } from "@/components/layout/page-background";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/auth-social";
import { AuthAlert, AuthBrandHeader, AuthEmailField } from "@/components/auth/auth-fields";

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
  const { signIn, signInWithGoogle, sendEmailSignInLink } = useAuthStore();

  // Prefer server-set redirect cookie over URL param to avoid privileged URL prefill.
  const callbackUrlRef = useRef(ROUTES.dashboard);
  useEffect(() => {
    const redirectCookie = getCookieValue("redirect_url");
    callbackUrlRef.current = getSafeRedirectPath(redirectCookie, ROUTES.dashboard);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      setStatus("");
      setLoading(true);
      const user = await signIn(email, password);
      clearCookie("redirect_url");
      router.push(user.emailVerified ? callbackUrlRef.current : ROUTES.verifyEmail);
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
      router.push(callbackUrlRef.current);
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
      <PageBackground />

      <div className="relative max-w-md w-full mx-auto px-4 pt-8">
        {/* Back link */}
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <AuthBrandHeader
          title="Welcome back"
          subtitle="Sign in to your account to continue"
        />

        {/* Form Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
            {status ? <AuthAlert tone="success">{status}</AuthAlert> : null}

            <div className="space-y-4">
              <AuthEmailField value={email} onChange={setEmail} />

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

              <AuthDivider />
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                disabled={loading}
                label="Sign in with Google"
              />
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

