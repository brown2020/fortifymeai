"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function SignUpError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sign up error:", error);
  }, [error]);

  return (
    <div className="min-h-screen pt-20 pb-12 page-transition">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

      <div className="relative max-w-md mx-auto px-4 pt-20">
        <div className="glass-card p-8 text-center">
          <div className="p-4 rounded-2xl bg-rose-500/10 w-fit mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-400 mb-6">
            {error.message || "We encountered an error. Please try again."}
          </p>
          <div className="space-y-3">
            <Button onClick={reset} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Link href={ROUTES.home}>
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
