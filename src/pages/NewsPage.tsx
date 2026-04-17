import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, ExternalLink, Loader2, X, Search } from "lucide-react";
import { getNews } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface NewsArticle {
  id?: string;
  title?: string;
  headline?: string;
  summary?: string;
  source?: string;
  sourceName?: string;
  date?: string;
  publishedAt?: string;
  published_at?: string;
  tag?: string;
  topicName?: string;
  topic?: string;
  url?: string;
}

const SUGGESTED = [
  "Fitness", "Motivation", "Stock Market", "Crypto",
  "Travel", "Food", "Tech", "Cricket", "Bollywood", "Gaming"
];

export default function NewsPage() {
  const location = useLocation();
  const initialQuery = (location.state as any)?.query || "";
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getNews()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.articles ?? data?.data ?? [];
        setArticles(list);
        if (initialQuery) {
          filterArticles(list, initialQuery);
        } else {
          setFilteredArticles(list);
        }
      })
      .catch(() => setError("Failed to load news"))
      .finally(() => setLoading(false));
  }, []);

  const filterArticles = (list: NewsArticle[], q: string) => {
    if (!q.trim()) {
      setFilteredArticles(list);
      return;
    }
    const q_lower = q.toLowerCase();
    const terms = q_lower.split(' ');
    const filtered = list.filter((item) => {
      const text = (
        (item.title || item.headline || '') + ' ' +
        (item.summary || '') + ' ' +
        (item.topicName || item.topic || item.tag || '')
      ).toLowerCase();
      return terms.some(term => text.includes(term));
    });
    setFilteredArticles(filtered);
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    setSearchInput(q);
    filterArticles(articles, q);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="w-6 h-6" /> News Feed
        </h1>
        <p className="text-muted-foreground mt-1">Search any topic to find related news</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(searchInput)}
          placeholder="Search news (e.g. Fitness, Cricket, Tech)..."
          className="flex-1 px-5 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
        />
        <button
          onClick={() => handleSearch(searchInput)}
          className="px-6 py-3 rounded-xl text-white font-medium text-sm flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* Suggested chips */}
      {!query && (
        <div className="flex flex-wrap gap-2 mb-6">
          <p className="w-full text-xs text-muted-foreground mb-1">Try searching:</p>
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              className="px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {query && !loading && (
        <p className="text-xs text-muted-foreground mb-4">
          {filteredArticles.length} articles found for "{query}"
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {error && <div className="text-center py-16 text-red-400">{error}</div>}
      {!loading && !error && filteredArticles.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No news found {query ? `for "${query}"` : ""}</p>
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      )}

      {!loading && !error && filteredArticles.length > 0 && (
        <div className="grid gap-4">
          {filteredArticles.map((item, i) => {
            const headline = item.title || item.headline || "Untitled";
            const summary = item.summary || "";
            const source = item.sourceName || item.source || "";
            const date = item.publishedAt || item.published_at || item.date || "";
            const topic = item.topicName || item.topic || item.tag || "";

            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{headline}</h3>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {source && <span className="text-xs text-muted-foreground">{source}</span>}
                      {source && date && <span className="text-xs text-muted-foreground">·</span>}
                      {date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(date).toLocaleDateString()}
                        </span>
                      )}
                      {topic && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                          {topic}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 mt-1">
                    {summary && (
                      <button
                        onClick={() => setSelectedArticle(item)}
                        className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Summary
                      </button>
                    )}
                    {item.url && (
                      <button
                        onClick={() => window.open(item.url, '_blank')}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary Popup */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-semibold text-foreground pr-4">
                  {selectedArticle.title || selectedArticle.headline}
                </h2>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {selectedArticle.summary || "No summary available."}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {selectedArticle.sourceName || selectedArticle.source}
                </span>
                {selectedArticle.url && (
                  <button
                    onClick={() => window.open(selectedArticle.url, '_blank')}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Read full article <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}