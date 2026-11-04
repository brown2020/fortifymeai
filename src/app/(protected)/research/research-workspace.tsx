"use client";

import type { ChangeEvent, FormEvent, RefObject } from "react";
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

export function ResearchCategoryTabs({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: ResearchCategory;
  onCategoryChange: (value: ResearchCategory) => void;
}) {
  return (
    <div
      className="mb-6 stagger-2"
      style={{ animation: "slide-up 0.5s ease-out" }}
    >
      <Tabs
        value={activeCategory}
        onValueChange={(value) => onCategoryChange(value as ResearchCategory)}
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
  );
}

export function ResearchSearchForm({
  input,
  inputRef,
  activeCategory,
  isLoading,
  onInputChange,
  onSearch,
  onStop,
}: {
  input: string;
  inputRef: RefObject<HTMLInputElement | null>;
  activeCategory: ResearchCategory;
  isLoading: boolean;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onStop: () => void;
}) {
  const categoryLabel = getCategoryConfig(activeCategory).label.toLowerCase();

  return (
    <div className="stagger-3" style={{ animation: "slide-up 0.5s ease-out" }}>
      <form onSubmit={onSearch}>
        <div className="glass-card p-1">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                value={input}
                onChange={onInputChange}
                placeholder={`Ask about any supplement (${categoryLabel})...`}
                className="w-full h-14 pl-12 pr-4 bg-transparent text-white placeholder-slate-400 
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-lg rounded-xl"
              />
              <Search className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
            </div>
            <div className="flex gap-2 p-2">
              {isLoading ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onStop}
                  className="h-10 px-4 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : null}
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
  );
}

export function ResearchResultCard({
  displayedResult,
  displayedCategory,
  displayedQuery,
  isLoading,
  copied,
  resultRef,
  onCopy,
}: {
  displayedResult: string;
  displayedCategory: ResearchCategory;
  displayedQuery: string;
  isLoading: boolean;
  copied: boolean;
  resultRef: RefObject<HTMLDivElement | null>;
  onCopy: () => void;
}) {
  const badgeVariant =
    displayedCategory === "interactions" ? "warning" : "default";

  return (
    <div ref={resultRef} className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <Badge variant={badgeVariant}>
            {getCategoryConfig(displayedCategory).label}
          </Badge>
          {displayedQuery ? (
            <span className="text-sm text-slate-400 truncate max-w-md">
              {displayedQuery}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopy}
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
      <CardContent className="p-6">
        <div className={`markdown-content ${isLoading ? "typing-cursor" : ""}`}>
          <ReactMarkdown components={{ img: () => null }}>
            {displayedResult}
          </ReactMarkdown>
        </div>
      </CardContent>
    </div>
  );
}

export function ResearchEmptyState() {
  return (
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
        Search for any supplement to discover benefits, optimal dosing,
        potential interactions, and the latest scientific evidence.
      </p>
      <p className="text-slate-500 text-sm">
        Try a quick query below or type your own question above.
      </p>
    </div>
  );
}

export function ResearchMainColumn({
  input,
  inputRef,
  activeCategory,
  isLoading,
  error,
  displayedResult,
  displayedCategory,
  displayedQuery,
  copied,
  resultRef,
  onInputChange,
  onSearch,
  onStop,
  onQuickQuery,
  onCopy,
}: {
  input: string;
  inputRef: RefObject<HTMLInputElement | null>;
  activeCategory: ResearchCategory;
  isLoading: boolean;
  error: { message?: string } | null | undefined;
  displayedResult: string;
  displayedCategory: ResearchCategory;
  displayedQuery: string;
  copied: boolean;
  resultRef: RefObject<HTMLDivElement | null>;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onStop: () => void;
  onQuickQuery: (query: string) => void;
  onCopy: () => void;
}) {
  const showQuickQueries = !displayedResult && !isLoading;
  const showEmpty = !displayedResult && !error && !isLoading;

  return (
    <div className="lg:col-span-3 space-y-6">
      <ResearchSearchForm
        input={input}
        inputRef={inputRef}
        activeCategory={activeCategory}
        isLoading={isLoading}
        onInputChange={onInputChange}
        onSearch={onSearch}
        onStop={onStop}
      />
      {showQuickQueries ? (
        <ResearchQuickPanel
          activeCategory={activeCategory}
          onQuickQuery={onQuickQuery}
        />
      ) : null}
      {error ? (
        <div
          role="alert"
          className="glass-card p-4 text-sm text-rose-300 border border-rose-500/30"
        >
          {error.message || "Research failed. Please try again."}
        </div>
      ) : null}
      {displayedResult ? (
        <ResearchResultCard
          displayedResult={displayedResult}
          displayedCategory={displayedCategory}
          displayedQuery={displayedQuery}
          isLoading={isLoading}
          copied={copied}
          resultRef={resultRef}
          onCopy={onCopy}
        />
      ) : null}
      {showEmpty ? <ResearchEmptyState /> : null}
    </div>
  );
}
