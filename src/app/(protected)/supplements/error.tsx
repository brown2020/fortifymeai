"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupplementsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Supplements page error:", error);
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
            We encountered an error while loading your supplements. Please try again.
          </p>
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
