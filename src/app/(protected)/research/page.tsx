"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  BookOpen,
  Loader2,
  Copy,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { useCompletion } from "@ai-sdk/react";
import {
  saveSearch,
  getSearchHistory,
  deleteSearch,
  toggleBookmark,
  type SearchHistoryItem,
  type ResearchCategory,
} from "./actions";
import { useAuthStore } from "@/lib/store/auth-store";
import ReactMarkdown from "react-markdown";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  RESEARCH_CATEGORIES,
  getCategoryConfig,
} from "./research-config";
import { ResearchQuickPanel } from "./ResearchQuickPanel";
import { ResearchHistoryPanel } from "./ResearchHistoryPanel";




export default function Research() {
  const { user } = useAuthStore();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<ResearchCategory>("general");
  const [historyResult, setHistoryResult] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [currentResult, setCurrentResult] = useState("");

  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [lastSearchCategory, setLastSearchCategory] =
    useState<ResearchCategory>("general");
  const completionRef = useRef("");
  const prevIsLoadingRef = useRef(false);

  const resetDisplayedResult = useCallback(() => {
    completionRef.current = "";
    setHistoryResult("");
    setHistoryQuery("");
    setCurrentResult("");
  }, []);

  const {
    completion,
    input,
    setInput,
    handleInputChange,
    handleSubmit: baseHandleSubmit,
    isLoading,
    error,
    stop,
  } = useCompletion({
    api: "/api/research",
    body: { category: activeCategory },
    streamProtocol: "text",
  });

  // Keep a reference to the completion as it streams
  useEffect(() => {
    if (completion) {
      completionRef.current = completion;
    }
  }, [completion]);

  const loadSearchHistory = useCallback(async () => {
    if (!user) return;
    const history = await getSearchHistory(15);
    setSearchHistory(history);
  }, [user]);

  // Load history on mount
  useEffect(() => {
    if (user) {
      loadSearchHistory();
    }
  }, [user, loadSearchHistory]);

  // Save search when loading completes
  useEffect(() => {
    const saveCompletedSearch = async () => {
      // Detect transition from loading to not loading
      if (prevIsLoadingRef.current && !isLoading && !error && lastSearchQuery) {
        const finalCompletion = completionRef.current;
        if (finalCompletion) {
          setCurrentResult(finalCompletion);
          try {
            await saveSearch(
              lastSearchQuery,
              finalCompletion,
              lastSearchCategory
            );
            await loadSearchHistory();
          } catch {
            // Save failed — search result is still displayed to user
          }
        }
      }
    };

    saveCompletedSearch();
    prevIsLoadingRef.current = isLoading;
  }, [error, isLoading, lastSearchQuery, lastSearchCategory, loadSearchHistory]);

  // Auto-scroll to result when new content arrives
  useEffect(() => {
    if (completion && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [completion]);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLastSearchQuery(input); // Capture query before submit
    setLastSearchCategory(activeCategory); // Capture category used for this search
    resetDisplayedResult();
    baseHandleSubmit(e);
  };

  const handleQuickQuery = (query: string) => {
    setInput(query);
    setLastSearchQuery(query); // Capture query for saving
    setLastSearchCategory(activeCategory); // Capture category used for this search
    resetDisplayedResult();
    // Focus input and trigger search after state update
    setTimeout(() => {
      inputRef.current?.form?.requestSubmit();
    }, 100);
  };

  const handleHistoryClick = (item: SearchHistoryItem) => {
    setHistoryResult(item.response);
    setHistoryQuery(item.query);
    setActiveCategory(item.category);
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async (searchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!user) return;
      await deleteSearch(searchId);
      await loadSearchHistory();
    } catch {
      // Delete failed silently — list stays unchanged
    }
  };

  const handleToggleBookmark = async (
    searchId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await toggleBookmark(searchId);
      await loadSearchHistory();
    } catch {
      // Bookmark toggle failed silently — list stays unchanged
    }
  };

  const handleCopyResult = async () => {
    const textToCopy = historyResult || completion;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayedResult = isLoading
    ? completion
    : historyResult || currentResult || completion;
  const displayedQuery =
    historyQuery || (displayedResult ? lastSearchQuery : "");
  const displayedCategory: ResearchCategory =
    historyResult || historyQuery ? activeCategory : lastSearchCategory;


  return (
    <div className="min-h-screen page-transition">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

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
                            focus:outline-none text-lg rounded-xl"
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
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
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
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Start Your Research
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Search for any supplement to discover benefits, optimal
                    dosing, potential interactions, and the latest scientific
                    evidence.
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
