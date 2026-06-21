"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Pill, RotateCcw } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendPasswordReset } = useAuthStore();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setStatus("");
      setError("");
      setLoading(true);
      await sendPasswordReset(email);
      setStatus(
        "If an account exists for that email, a password reset link is on the way."
      );
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "We could not send a reset link. Try again."));
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

      <div className="relative max-w-md w-full mx-auto px-4 pt-8">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
              <Pill className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xl font-bold gradient-text">Fortify.me</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset your password</h1>
          <p className="text-slate-400">Send yourself a secure reset link.</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {status && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                {status}
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {error}
              </div>
            )}

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

            <Button type="submit" isLoading={loading} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              Send reset link
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
