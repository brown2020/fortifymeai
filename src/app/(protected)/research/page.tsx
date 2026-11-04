"use client";

import { BookOpen } from "lucide-react";
import type { ResearchCategory } from "./actions";
import { ResearchHistoryPanel } from "./ResearchHistoryPanel";
import { useResearchPage } from "./useResearchPage";
import { PageBackground } from "@/components/layout/page-background";
import { ResearchCategoryTabs, ResearchMainColumn } from "./research-workspace";

export default function Research() {
  const {
    input,
    handleInputChange,
    inputRef,
    activeCategory,
    setActiveCategory,
    searchHistory,
    showHistory,
    setShowHistory,
    isLoading,
    error,
    displayedResult,
    displayedCategory,
    displayedQuery,
    copied,
    onSearch,
    handleQuickQuery,
    handleHistoryClick,
    handleDelete,
    handleToggleBookmark,
    handleCopyResult,
    stop,
    resultRef,
  } = useResearchPage();

  return (
    <div className="min-h-screen page-transition">
      <PageBackground />

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header
            className="mb-8 stagger-1"
            style={{ animation: "slide-up 0.5s ease-out" }}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
                <BookOpen className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  Supplement Research
                </h1>
                <p className="text-slate-400 mt-1">
                  AI-powered insights backed by science
                </p>
              </div>
            </div>
          </header>

          <ResearchCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={(value) =>
              setActiveCategory(value as ResearchCategory)
            }
          />

          <div className="grid lg:grid-cols-4 gap-6">
            <ResearchMainColumn
              input={input}
              inputRef={inputRef}
              activeCategory={activeCategory}
              isLoading={isLoading}
              error={error}
              displayedResult={displayedResult}
              displayedCategory={displayedCategory}
              displayedQuery={displayedQuery}
              copied={copied}
              resultRef={resultRef}
              onInputChange={handleInputChange}
              onSearch={onSearch}
              onStop={stop}
              onQuickQuery={handleQuickQuery}
              onCopy={handleCopyResult}
            />
            <ResearchHistoryPanel
              searchHistory={searchHistory}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
              onHistoryClick={handleHistoryClick}
              onToggleBookmark={handleToggleBookmark}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
