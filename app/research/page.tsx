"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Search, BookOpen, History, Loader2, Trash2 } from "lucide-react";
import { searchSupplement, getSearchHistory, deleteSearch } from "./actions";
import { useAuth } from "../../contexts/AuthContext";

type SearchHistory = {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
};

export default function Research() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  useEffect(() => {
    if (user) {
      loadSearchHistory();
    }
  }, [user]);

  const loadSearchHistory = async () => {
    if (user) {
      const history = await getSearchHistory(user.uid);
      setSearchHistory(history);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const { content } = await searchSupplement(query);
      setResult(content || "");
      await loadSearchHistory();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item: SearchHistory) => {
    setQuery(item.query);
    setResult(item.response);
  };

  const handleDelete = async (searchId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the history item click
    try {
      if (user) {
        await deleteSearch(user.uid, searchId);
        await loadSearchHistory(); // Reload the history after deletion
      }
    } catch (error) {
      console.error("Failed to delete search:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Supplement Research
              </h1>
              <p className="text-gray-600 mt-2">
                Learn about supplements with AI-powered insights
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Search Section */}
            <div className="md:col-span-2 space-y-6">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about any supplement..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {result && (
                <div className="bg-white rounded-xl shadow-xs p-6">
                  <div
                    className="prose prose-blue max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: result.replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              )}

              {!result && !error && !loading && (
                <div className="bg-white rounded-xl shadow-xs p-6 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start Your Research
                  </h3>
                  <p className="text-gray-600">
                    Search for any supplement to learn about its benefits,
                    risks, and scientific evidence
                  </p>
                </div>
              )}
            </div>

            {/* Search History Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-xs p-6">
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
                          <div>
                            <p className="text-gray-900 font-medium">
                              {item.query}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                            title="Delete search"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm">No recent searches</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
