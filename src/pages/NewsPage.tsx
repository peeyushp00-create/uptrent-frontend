import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, ExternalLink, Loader2, X, Search } from "lucide-react";
import { getNews } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
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
  image_url?: string;
}

const SUGGESTED = [
  "Fitness", "Motivation", "Stock Market", "Crypto",
  "Travel", "Food", "Tech", "Cricket", "Bollywood", "Gaming"
];

// ✅ Topic filter tabs matching backend niche keys
const TOPIC_FILTERS = [
  { label: "All", value: "" },
  { label: "Finance", value: "Finance" },
  { label: "Stock Market", value: "StockMarket" },
  { label: "Crypto", value: "Crypto" },
  { label: "Mutual Funds", value: "MutualFunds" },
  { label: "Personal Finance", value: "PersonalFinance" },
  { label: "Tech", value: "Tech" },
  { label: "AI", value: "AINews" },
  { label: "Business", value: "Business" },
  { label: "Cricket", value: "Cricket" },
  { label: "IPL", value: "IPL" },
  { label: "Bollywood", value: "Bollywood" },
  { label: "Fitness", value: "Fitness" },
  { label: "Weight Loss", value: "WeightLoss" },
  { label: "Travel", value: "Travel" },
  { label: "Food", value: "Food" },
  { label: "Gaming", value: "Gaming" },
  { label: "Education", value: "Education" },
  { label: "Fashion", value: "Fashion" },
  { label: "Motivation", value: "Motivation" },
  { label: "Skincare", value: "Skincare" },
  { label: "Yoga", value: "Yoga" },
  { label: "Comedy", value: "Comedy" },
  { label: "Real Estate", value: "RealEstate" },
  { label: "Jobs", value: "Jobs" },
];

const DATE_FILTERS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last Week", value: "week" },
  { label: "All", value: "all" },
];

const getCategoryImage = (headline: string) => {
  const h = headline.toLowerCase();
  if (h.includes('cricket') || h.includes('ipl') || h.includes('kohli')) return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400';
  if (h.includes('fitness') || h.includes('workout') || h.includes('gym')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400';
  if (h.includes('ai') || h.includes('tech') || h.includes('chatgpt') || h.includes('software')) return 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400';
  if (h.includes('bollywood') || h.includes('movie') || h.includes('film')) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
  if (h.includes('travel') || h.includes('tourism') || h.includes('trip')) return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400';
  if (h.includes('food') || h.includes('recipe') || h.includes('cooking')) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400';
  if (h.includes('stock') || h.includes('market') || h.includes('invest') || h.includes('finance')) return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400';
  if (h.includes('fashion') || h.includes('style')) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400';
  if (h.includes('gaming') || h.includes('game')) return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400';
  if (h.includes('education') || h.includes('study') || h.includes('exam')) return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400';
  if (h.includes('yoga') || h.includes('meditation') || h.includes('wellness')) return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400';
  if (h.includes('business') || h.includes('startup') || h.includes('entrepreneur')) return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400';
  if (h.includes('crypto') || h.includes('bitcoin')) return 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400';
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400';
};

const getTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return date.toLocaleDateString();
};

const isToday = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

const isYesterday = (dateStr: string) => {
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

const isLastWeek = (dateStr: string) => {
  const date = new Date(dateStr);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return date >= weekAgo;
};

export default function NewsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const initialQuery = (location.state as any)?.query || "";

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [dateFilter, setDateFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState(""); // ✅ new topic filter state

  useEffect(() => {
    setLoading(true);
    setError(null);
    getNews()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.articles ?? data?.data ?? [];
        const sorted = [...list].sort((a, b) => {
          const dateA = new Date(a.published_at || a.publishedAt || a.date || 0).getTime();
          const dateB = new Date(b.published_at || b.publishedAt || b.date || 0).getTime();
          return dateB - dateA;
        });
        setArticles(sorted);
        if (initialQuery) {
          const filtered = filterByQuery(sorted, initialQuery);
          setFilteredArticles(filtered.length > 0 ? filtered : sorted);
        } else {
          setFilteredArticles(sorted);
        }
      })
      .catch(() => setError("Failed to load news"))
      .finally(() => setLoading(false));
  }, []);

  const filterByQuery = (list: NewsArticle[], q: string) => {
    if (!q.trim()) return list;
    const q_lower = q.toLowerCase().trim();
    const terms = q_lower.split(' ').filter(Boolean);
    return list.filter((item) => {
      const topic = (item.topicName || item.topic || item.tag || '').toLowerCase();
      const text = (
        (item.title || item.headline || '') + ' ' +
        (item.summary || '')
      ).toLowerCase();

      return terms.every(term => {
        // Match topic first (e.g. "ai" matches "AINews")
        if (topic.toLowerCase().includes(term)) return true;
        // For short terms (2 chars or less), use word boundary to avoid false matches
        // For longer terms, use simple includes for better recall
        if (term.length <= 2) {
          const wordBoundary = new RegExp(`\\b${term}\\b`, 'i');
          return wordBoundary.test(text);
        }
        return text.includes(term);
      });
    });
  };

  const filterByDate = (list: NewsArticle[], filter: string) => {
    if (filter === 'all') return list;
    return list.filter(item => {
      const date = item.published_at || item.publishedAt || item.date || '';
      if (!date) return false;
      if (filter === 'today') return isToday(date);
      if (filter === 'yesterday') return isYesterday(date);
      if (filter === 'week') return isLastWeek(date);
      return true;
    });
  };

  // ✅ Filter by topic
  const filterByTopic = (list: NewsArticle[], topic: string) => {
    if (!topic) return list;
    return list.filter(item => (item.topic || item.topicName || item.tag || '') === topic);
  };

  // ✅ Apply all filters together
  const applyAllFilters = (
    list: NewsArticle[],
    q: string,
    date: string,
    topic: string
  ) => {
    let result = filterByDate(list, date);
    result = filterByTopic(result, topic);
    if (q.trim()) {
      const searched = filterByQuery(result, q);
      result = searched.length > 0 ? searched : result;
    }
    return result;
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    setSearchInput(q);
    setFilteredArticles(applyAllFilters(articles, q, dateFilter, topicFilter));
  };

  const handleDateFilter = (filter: string) => {
    setDateFilter(filter);
    setFilteredArticles(applyAllFilters(articles, query, filter, topicFilter));
  };

  // ✅ Handle topic filter click
  const handleTopicFilter = (topic: string) => {
    setTopicFilter(topic);
    setQuery("");
    setSearchInput("");
    setFilteredArticles(applyAllFilters(articles, "", dateFilter, topic));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="w-6 h-6" /> News Feed
        </h1>
        <p className="text-muted-foreground mt-1">Latest news for content creators</p>
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

      {/* Date filter buttons */}
      <div className="flex gap-2 mb-4">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleDateFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              dateFilter === f.value
                ? "text-white border-transparent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            style={dateFilter === f.value ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>



      {/* Suggested chips — only show when no topic or query selected */}
      {!query && !topicFilter && (
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
      {!loading && (
        <p className="text-xs text-muted-foreground mb-4">
          {filteredArticles.length} articles
          {topicFilter ? ` in "${TOPIC_FILTERS.find(t => t.value === topicFilter)?.label}"` : ''}
          {query ? ` for "${query}"` : ''}
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
          <p>No news found {query ? `for "${query}"` : topicFilter ? `in "${topicFilter}"` : `for ${dateFilter}`}</p>
          <p className="text-xs mt-1">Try a different filter or search term</p>
        </div>
      )}

      {!loading && !error && filteredArticles.length > 0 && (
        <div className="grid gap-4">
          {filteredArticles.map((item, i) => {
            const headline = item.title || item.headline || "Untitled";
            const summary = item.summary || "";
            const source = item.sourceName || item.source || "";
            const date = item.published_at || item.publishedAt || item.date || "";
            const topic = item.topicName || item.topic || item.tag || "";
            const timeAgo = getTimeAgo(date);
            const thumbnail = item.image_url;

            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt={headline}
                      className="w-24 h-20 rounded-lg object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium text-foreground text-sm leading-snug">{headline}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        {summary && (
                          <button
                            onClick={() => setSelectedArticle(item)}
                            className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
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
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {source && <span className="text-xs text-muted-foreground">{source}</span>}
                      {source && timeAgo && <span className="text-xs text-muted-foreground">·</span>}
                      {timeAgo && (
                        <span className="text-xs text-pink-500 font-medium">{timeAgo}</span>
                      )}
                      {topic && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-primary/10 text-primary border-0 cursor-pointer hover:bg-primary/20"
                          onClick={() => handleTopicFilter(topic)}
                        >
                          {topic}
                        </Badge>
                      )}
                    </div>
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
              <img
                src={selectedArticle.image_url || getCategoryImage(selectedArticle.title || selectedArticle.headline || '')}
                alt={selectedArticle.title || selectedArticle.headline}
                className="w-full h-40 object-cover rounded-lg mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400';
                }}
              />
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