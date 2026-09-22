"use client";

import {
  Search,
  BookOpen,
  Loader2,
  Copy,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  RESEARCH_CATEGORIES,
  getCategoryConfig,
} from "./research-config";
import type { ResearchCategory } from "./actions";
import { ResearchQuickPanel } from "./ResearchQuickPanel";
import { ResearchHistoryPanel } from "./ResearchHistoryPanel";
import { useResearchPage } from "./useResearchPage";
import { PageBackground } from "@/components/layout/page-background";

export default function Research() {
  const {
    user,
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

  if (!user) {
    return null;
  }

  return (

    <div className="min-h-screen page-transition">
      {/* Background effects */}
      <PageBackground />

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
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

          {/* Category Tabs */}
          <div
            className="mb-6 stagger-2"
            style={{ animation: "slide-up 0.5s ease-out" }}
          >
            <Tabs
              value={activeCategory}
              onValueChange={(value) =>
                setActiveCategory(value as ResearchCategory)
              }
            >
              <TabsList className="flex-wrap">
                {RESEARCH_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger key={category.id} value={category.id}>
                      <Icon className={`h-4 w-4 ${category.color}`} />
                      <span className="hidden sm:inline">{category.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {RESEARCH_CATEGORIES.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <p className="text-sm text-slate-400 mb-4">
                    {category.description}
                  </p>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search Form */}
              <div
                className="stagger-3"
                style={{ animation: "slide-up 0.5s ease-out" }}
              >
                <form onSubmit={onSearch}>
                  <div className="glass-card p-1">
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <input
                          ref={inputRef}
                          value={input}
                          onChange={handleInputChange}
                          placeholder={`Ask about any supplement (${getCategoryConfig(
                            activeCategory
                          ).label.toLowerCase()})...`}
                          className="w-full h-14 pl-12 pr-4 bg-transparent text-white placeholder-slate-400 
                            focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-lg rounded-xl"
                        />
                        <Search className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
                      </div>
                      <div className="flex gap-2 p-2">
                        {isLoading && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={stop}
                            className="h-10 px-4 text-slate-300 hover:text-white hover:bg-slate-700"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        )}
                        <Button
                          type="submit"
                          disabled={isLoading || !input.trim()}
                          className="h-10 px-6 bg-linear-to-r from-emerald-500 to-teal-500 
                            hover:from-emerald-600 hover:to-teal-600 text-white font-medium
                            glow-on-hover disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Research
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Quick Queries */}
              {!displayedResult && !isLoading && (
                <ResearchQuickPanel
                  activeCategory={activeCategory}
                  onQuickQuery={handleQuickQuery}
                />
              )}

              {displayedResult && (
                <div ref={resultRef} className="glass-card overflow-hidden">
                  {/* Result Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          displayedCategory === "interactions"
                            ? "warning"
                            : "default"
                        }
                      >
                        {getCategoryConfig(displayedCategory).label}
                      </Badge>
                      {displayedQuery && (
                        <span className="text-sm text-slate-400 truncate max-w-md">
                          {displayedQuery}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyResult}
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                        title="Copy response"
                        aria-label="Copy response"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Result Content */}
                  <CardContent className="p-6">
                    <div
                      className={`markdown-content ${
                        isLoading ? "typing-cursor" : ""
                      }`}
                    >
                      <ReactMarkdown>{displayedResult}</ReactMarkdown>
                    </div>
                  </CardContent>
                </div>
              )}

              {/* Empty State */}
              {!displayedResult && !error && !isLoading && (
                <div
                  className="glass-card p-8 text-center stagger-5"
                  style={{ animation: "slide-up 0.5s ease-out" }}
                >
                  <div className="p-4 rounded-2xl bg-slate-800/50 w-fit mx-auto mb-4">
                    <BookOpen className="h-12 w-12 text-slate-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    No research started yet
                  </h2>
                  <p className="text-slate-400 max-w-md mx-auto mb-2">
                    Search for any supplement to discover benefits, optimal
                    dosing, potential interactions, and the latest scientific
                    evidence.
                  </p>
                  <p className="text-slate-500 text-sm">
                    Try a quick query below or type your own question above.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar - Search History */}
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
