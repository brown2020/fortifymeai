"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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


export function useResearchPage() {

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


  return {
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
  };
}
