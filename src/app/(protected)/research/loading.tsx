import { BookOpen, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
                <BookOpen className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          </header>

          {/* Category Tabs */}
          <div className="mb-6">
            <Skeleton className="h-12 w-full max-w-2xl rounded-xl" />
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search */}
              <Skeleton className="h-16 w-full rounded-2xl" />

              {/* Quick Queries */}
              <div className="glass-card p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid sm:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-slate-400" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
