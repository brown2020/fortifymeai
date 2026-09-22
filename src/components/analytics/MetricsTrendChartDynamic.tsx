"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const MetricsTrendChart = dynamic(() => import("./MetricsTrendChart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse rounded-xl bg-slate-800/50" aria-hidden />
  ),
});

export default function MetricsTrendChartDynamic(
  props: ComponentProps<typeof MetricsTrendChart>
) {
  return <MetricsTrendChart {...props} />;
}
