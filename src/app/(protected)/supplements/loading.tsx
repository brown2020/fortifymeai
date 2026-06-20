import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const supplementSkeletonCards = [
  "supplement-skeleton-1",
  "supplement-skeleton-2",
  "supplement-skeleton-3",
  "supplement-skeleton-4",
  "supplement-skeleton-5",
  "supplement-skeleton-6",
];

export default function Loading() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">My Supplements</span>
            </div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supplementSkeletonCards.map((card) => (
            <div key={card} className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
