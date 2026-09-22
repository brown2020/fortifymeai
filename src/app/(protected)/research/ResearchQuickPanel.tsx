"use client";

import { Lightbulb, ChevronRight } from "lucide-react";
import type { ResearchCategory } from "./actions";
import { QUICK_QUERIES, POPULAR_SUPPLEMENTS } from "./research-config";

export function ResearchQuickPanel({
  activeCategory,
  onQuickQuery,
}: {
  activeCategory: ResearchCategory;
  onQuickQuery: (query: string) => void;
}) {
  return (
    <div className="stagger-4" style={{ animation: "slide-up 0.5s ease-out" }}>
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Quick Queries</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {QUICK_QUERIES[activeCategory].map((query) => (
            <button
              key={query}
              type="button"
              onClick={() => onQuickQuery(query)}
              className="text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 text-slate-300 hover:text-white text-sm transition-[color,background-color,border-color,transform,box-shadow,opacity] flex items-center gap-2 group"
            >
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              <span className="line-clamp-2">{query}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <p className="text-sm text-slate-400 mb-3">Popular supplements:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SUPPLEMENTS.map((supplement) => (
              <button
                key={supplement}
                type="button"
                onClick={() => onQuickQuery(`Tell me about ${supplement}`)}
                className="px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-emerald-500/20 border border-slate-700/50 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 text-sm transition-[color,background-color,border-color,transform,box-shadow,opacity]"
              >
                {supplement}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
