"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBackground } from "@/components/layout/page-background";

export function ErrorPanel({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen pt-20 pb-12 page-transition">
      <PageBackground />
      <div className="relative max-w-md mx-auto px-4 pt-20">
        <div className="glass-card p-8 text-center">
          <div className="p-4 rounded-2xl bg-rose-500/10 w-fit mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400 mb-6">{message}</p>
          {onRetry ? (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
