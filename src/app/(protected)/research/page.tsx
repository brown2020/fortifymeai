"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  BookOpen,
  History,
  Loader2,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Sparkles,
  FlaskConical,
  Timer,
  AlertTriangle,
  Layers,
  FileText,
  ChevronRight,
  X,
  Lightbulb,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

// Research categories configuration
const RESEARCH_CATEGORIES: {
  id: ResearchCategory;
  label: string;
  icon: typeof Sparkles;
  description: string;
  color: string;
}[] = [
  {
    id: "general",
    label: "Overview",
    icon: Sparkles,
    description: "Comprehensive supplement information",
    color: "text-emerald-400",
  },
  {
    id: "benefits",
    label: "Benefits",
    icon: FlaskConical,
    description: "Therapeutic effects and health benefits",
    color: "text-violet-400",
  },
  {
    id: "dosing",
    label: "Dosing",
    icon: Timer,
    description: "Dosage, timing, and optimization",
    color: "text-cyan-400",
  },
  {
    id: "interactions",
    label: "Interactions",
    icon: AlertTriangle,
    description: "Drug and supplement interactions",
    color: "text-amber-400",
  },
  {
    id: "stacking",
    label: "Stacking",
    icon: Layers,
    description: "Combining supplements for synergy",
    color: "text-rose-400",
  },
  {
    id: "evidence",
    label: "Evidence",
    icon: FileText,
    description: "Scientific research analysis",
    color: "text-sky-400",
  },
];

// Quick query templates for each category
const QUICK_QUERIES: Record<ResearchCategory, string[]> = {
  general: [
    "What is Vitamin D3 and what are its main uses?",
    "Tell me about Magnesium Glycinate",
    "What should I know about Omega-3 fish oil?",
    "Overview of Ashwagandha supplement",
  ],
  benefits: [
    "What are the cognitive benefits of Lion's Mane mushroom?",
    "How does Creatine help with muscle building?",
    "Sleep benefits of Magnesium before bed",
    "Anti-inflammatory benefits of Turmeric/Curcumin",
  ],
  dosing: [
    "Optimal Vitamin D3 dosage for deficiency",
    "When should I take Magnesium for sleep?",
    "Loading phase for Creatine supplementation",
    "Best time to take B-complex vitamins",
  ],
  interactions: [
    "Does Vitamin K interact with blood thinners?",
    "Can I take Ashwagandha with antidepressants?",
    "Magnesium and medication interactions",
    "Fish oil and blood pressure medication",
  ],
  stacking: [
    "Best supplements to stack with Creatine for gains",
    "Sleep stack: Magnesium + L-Theanine + ?",
    "Nootropic stack for focus and memory",
    "Anti-aging supplement combinations",
  ],
  evidence: [
    "What does the research say about Vitamin D and immunity?",
    "Clinical trials on Ashwagandha for anxiety",
    "Meta-analyses on Omega-3 for heart health",
    "Evidence for NAC supplementation benefits",
  ],
};

// Popular supplements for quick access
const POPULAR_SUPPLEMENTS = [
  "Vitamin D3",
  "Magnesium",
  "Omega-3",
  "Vitamin B12",
  "Ashwagandha",
  "Creatine",
  "Lion's Mane",
  "NAC",
];

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
  const completionRef = useRef("");
  const prevIsLoadingRef = useRef(false);

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
    if (user) {
      const history = await getSearchHistory(user.uid, 15);
      setSearchHistory(history);
    }
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
      if (prevIsLoadingRef.current && !isLoading && lastSearchQuery) {
        const finalCompletion = completionRef.current;
        if (finalCompletion) {
          setCurrentResult(finalCompletion);
          try {
            await saveSearch(lastSearchQuery, finalCompletion, activeCategory);
            await loadSearchHistory();
          } catch (error) {
            console.error("Failed to save search:", error);
          }
        }
      }
    };

    saveCompletedSearch();
    prevIsLoadingRef.current = isLoading;
  }, [isLoading, lastSearchQuery, activeCategory, loadSearchHistory]);

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
    setHistoryResult("");
    setHistoryQuery("");
    setCurrentResult("");
    baseHandleSubmit(e);
  };

  const handleQuickQuery = (query: string) => {
    setInput(query);
    setLastSearchQuery(query); // Capture query for saving
    setHistoryResult("");
    setHistoryQuery("");
    setCurrentResult("");
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
      if (user) {
        await deleteSearch(user.uid, searchId);
        await loadSearchHistory();
      }
    } catch (error) {
      console.error("Failed to delete search:", error);
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
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
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
  const displayedQuery = historyQuery || (completion ? input : "");

  const getCategoryConfig = (categoryId: ResearchCategory) => {
    return (
      RESEARCH_CATEGORIES.find((c) => c.id === categoryId) ||
      RESEARCH_CATEGORIES[0]
    );
  };

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
              defaultValue="general"
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
                <div
                  className="stagger-4"
                  style={{ animation: "slide-up 0.5s ease-out" }}
                >
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="h-5 w-5 text-amber-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Quick Queries
                      </h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {QUICK_QUERIES[activeCategory].map((query, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickQuery(query)}
                          className="text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 
                            border border-slate-700/50 hover:border-slate-600/50
                            text-slate-300 hover:text-white text-sm transition-all
                            flex items-center gap-2 group"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                          <span className="line-clamp-2">{query}</span>
                        </button>
                      ))}
                    </div>

                    {/* Popular Supplements */}
                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-3">
                        Popular supplements:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SUPPLEMENTS.map((supplement) => (
                          <button
                            key={supplement}
                            onClick={() =>
                              handleQuickQuery(`Tell me about ${supplement}`)
                            }
                            className="px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-emerald-500/20 
                              border border-slate-700/50 hover:border-emerald-500/30
                              text-slate-300 hover:text-emerald-300 text-sm transition-all"
                          >
                            {supplement}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="glass-card border-rose-500/30 p-4">
                  <div className="flex items-center gap-3 text-rose-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p>{error.message}</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && !completion && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Researching...</p>
                      <p className="text-sm text-slate-400">
                        Analyzing scientific literature
                      </p>
                    </div>
                  </div>
                  <SkeletonText lines={6} />
                </div>
              )}

              {/* Result Display */}
              {displayedResult && (
                <div ref={resultRef} className="glass-card overflow-hidden">
                  {/* Result Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          activeCategory === "interactions"
                            ? "warning"
                            : "default"
                        }
                      >
                        {getCategoryConfig(activeCategory).label}
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
            <div className="lg:col-span-1">
              <div className="glass-card sticky top-4">
                <CardHeader className="border-b border-slate-700/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-slate-400" />
                      <CardTitle className="text-base font-semibold text-white">
                        Recent
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="h-8 px-2 text-slate-400 hover:text-white text-xs"
                    >
                      {showHistory ? "Hide" : "Show"}
                    </Button>
                  </div>
                </CardHeader>

                {showHistory && (
                  <CardContent className="p-4">
                    {searchHistory.length > 0 ? (
                      <ul className="space-y-2">
                        {searchHistory.map((item) => {
                          const categoryConfig = getCategoryConfig(
                            item.category
                          );
                          const CategoryIcon = categoryConfig.icon;
                          return (
                            <li
                              key={item.id}
                              className="group relative p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 
                                border border-transparent hover:border-slate-700/50 
                                cursor-pointer transition-all"
                              onClick={() => handleHistoryClick(item)}
                            >
                              <div className="flex items-start gap-2">
                                <CategoryIcon
                                  className={`h-4 w-4 mt-0.5 ${categoryConfig.color}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-200 font-medium line-clamp-2">
                                    {item.query}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(
                                      item.timestamp
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) =>
                                    handleToggleBookmark(item.id, e)
                                  }
                                  className="p-1.5 rounded-md hover:bg-slate-700 transition-colors"
                                  title={
                                    item.isBookmarked
                                      ? "Remove bookmark"
                                      : "Bookmark"
                                  }
                                >
                                  {item.isBookmarked ? (
                                    <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
                                  ) : (
                                    <Bookmark className="h-3.5 w-3.5 text-slate-400 hover:text-amber-400" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => handleDelete(item.id, e)}
                                  className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="text-center py-8">
                        <History className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">
                          No recent searches
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
