"use client";

import { History, Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { SearchHistoryItem } from "./actions";
import { getCategoryConfig } from "./research-config";

export function ResearchHistoryPanel({
  searchHistory,
  showHistory,
  setShowHistory,
  onHistoryClick,
  onToggleBookmark,
  onDelete,
}: {
  searchHistory: SearchHistoryItem[];
  showHistory: boolean;
  setShowHistory: (value: boolean | ((prev: boolean) => boolean)) => void;
  onHistoryClick: (item: SearchHistoryItem) => void;
  onToggleBookmark: (searchId: string, e: React.MouseEvent) => void;
  onDelete: (searchId: string, e: React.MouseEvent) => void;
}) {
  return (
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
                              className="group relative rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50"
                            >
                              <button
                                type="button"
                                className="w-full text-left p-3 pr-20 transition-[color,background-color,border-color,transform,box-shadow,opacity]"
                                onClick={() => onHistoryClick(item)}
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
                                      {formatDate(new Date(item.timestamp))}
                                    </p>
                                  </div>
                                </div>
                              </button>
                              <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => onToggleBookmark(item.id, e)}
                                  className="p-1.5 rounded-md hover:bg-slate-700 transition-colors"
                                  title={item.isBookmarked ? "Remove bookmark" : "Bookmark"}
                                >
                                  {item.isBookmarked ? (
                                    <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
                                  ) : (
                                    <Bookmark className="h-3.5 w-3.5 text-slate-400 hover:text-amber-400" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => onDelete(item.id, e)}
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
  );
}
