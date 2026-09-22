"use client";

import { ErrorPanel } from "@/components/layout/error-panel";

export default function ResearchError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPanel
      message="We encountered an error while loading the research page. Please try again."
      onRetry={reset}
    />
  );
}
