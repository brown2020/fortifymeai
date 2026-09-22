"use client";

import { FlaskConical, Package, Plus } from "lucide-react";
import SupplementCard from "@/components/supplements/SupplementCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Supplement } from "@/lib/models/supplement";

const supplementSkeletonCards = [
  "supplement-skeleton-1",
  "supplement-skeleton-2",
  "supplement-skeleton-3",
  "supplement-skeleton-4",
  "supplement-skeleton-5",
  "supplement-skeleton-6",
];

export function SupplementContent({
  isLoading,
  error,
  filteredSupplements,
  searchQuery,
  onRetry,
  onAdd,
  onEdit,
  onDelete,
}: {
  isLoading: boolean;
  error: string | null;
  filteredSupplements: Supplement[];
  searchQuery: string;
  onRetry: () => void;
  onAdd: () => void;
  onEdit: (supplement: Supplement) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center border-rose-500/30">
        <div className="p-4 rounded-2xl bg-rose-500/10 w-fit mx-auto mb-4">
          <FlaskConical className="h-10 w-10 text-rose-400" />
        </div>
        <p className="text-rose-400 mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  if (filteredSupplements.length === 0) {
    const searching = searchQuery.trim() !== "";
    return (
      <div className="glass-card p-12 text-center">
        <div className="p-4 rounded-2xl bg-slate-800/50 w-fit mx-auto mb-4">
          <Package className="h-12 w-12 text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {searching
            ? "No supplements match your search"
            : "No supplements added yet"}
        </h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          {searching
            ? "Try a different search term or add a new supplement"
            : "Start building your supplement collection to track your health journey"}
        </p>
        {!searching ? (
          <Button onClick={onAdd} className="gap-2">
            <Plus className="h-5 w-5" />
            Add Your First Supplement
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSupplements.map((supplement, index) => (
        <div
          key={supplement.id}
          className="stagger-1"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <SupplementCard
            supplement={supplement}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
