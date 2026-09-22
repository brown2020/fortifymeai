import { PageBackground } from "@/components/layout/page-background";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <PageBackground />
      <div className="relative max-w-7xl mx-auto px-4 space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
