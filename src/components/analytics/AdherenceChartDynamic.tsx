"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const AdherenceChart = dynamic(() => import("./AdherenceChart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse rounded-xl bg-slate-800/50" aria-hidden />
  ),
});

export default function AdherenceChartDynamic(
  props: ComponentProps<typeof AdherenceChart>
) {
  return <AdherenceChart {...props} />;
}
