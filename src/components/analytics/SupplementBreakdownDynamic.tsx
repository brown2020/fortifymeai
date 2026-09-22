"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const SupplementBreakdown = dynamic(() => import("./SupplementBreakdown"), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse rounded-xl bg-slate-800/50" aria-hidden />
  ),
});

export default function SupplementBreakdownDynamic(
  props: ComponentProps<typeof SupplementBreakdown>
) {
  return <SupplementBreakdown {...props} />;
}
