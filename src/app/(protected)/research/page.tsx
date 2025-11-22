"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, BookOpen, History, Loader2, Trash2 } from "lucide-react";
import { useCompletion } from "@ai-sdk/react";
import { saveSearch, getSearchHistory, deleteSearch } from "./actions";
import { useAuthStore } from "@/lib/store/auth-store";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchHistory = {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
};

export default function Research() {
  const { user } = useAuthStore();
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [historyResult, setHistoryResult] = useState("");
  
  const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
    api: "/api/research",
    onFinish: async (prompt, completion) => {
      await saveSearch(prompt, completion);
      await loadSearchHistory();
    }
  });

  const loadSearchHistory = useCallback(async () => {
    if (user) {
      const history = await getSearchHistory(user.uid);
      setSearchHistory(history);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSearchHistory();
    }
  }, [user, loadSearchHistory]);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    setHistoryResult("");
    handleSubmit(e);
  };

  const handleHistoryClick = (item: SearchHistory) => {
    // We can't easily set 'input' of useCompletion, but we can set displayed result
    setHistoryResult(item.response);
    // Ideally we would also set the input field value, but useCompletion controls it.
    // We can just show the result.
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

  const displayedResult = isLoading ? completion : (historyResult || completion);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Supplement Research
            </h1>
            <p className="text-muted-foreground mt-2">
              Learn about supplements with AI-powered insights
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Search Section */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={onSearch}>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about any supplement..."
                    className="pl-10 py-6"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-auto px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error.message}
              </div>
            )}

            {displayedResult && (
              <Card>
                <CardContent className="pt-6">
                  <div className="prose prose-blue prose-lg max-w-none markdown-content">
                    <ReactMarkdown>{displayedResult}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {!displayedResult && !error && !isLoading && (
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start Your Research
                    </h3>
                    <p className="text-muted-foreground">
                    Search for any supplement to learn about its benefits, risks,
                    and scientific evidence
                    </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search History Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                    <History className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-semibold">Recent Searches</h2>
                </div>
                {searchHistory.length > 0 ? (
                    <ul className="space-y-3">
                    {searchHistory.map((item, index) => (
                        <li
                        key={index}
                        className="text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-sm group relative"
                        onClick={() => handleHistoryClick(item)}
                        >
                        <div className="flex justify-between items-start">
                            <div className="pr-6">
                            <p className="text-gray-900 font-medium truncate">
                                {item.query}
                            </p>
                            <p className="text-gray-500 text-xs">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </p>
                            </div>
                            <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 absolute right-2 top-2"
                            title="Delete search"
                            >
                            <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm">No recent searches</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
