import { useState, useEffect, useRef } from "react";
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
  "Fitness", "Motivation", "Crypto", "Travel", "Food",
  "Tech", "Cricket", "Bollywood", "Gaming", "Finance",
  "Business", "Education", "Fashion", "Yoga", "Skincare",
  "Comedy", "Real Estate", "Jobs", "IPL", "AI"
];

const DATE_FILTERS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last Week", value: "week" },
  { label: "All", value: "all" },
];

const NICHE_TOPIC_MAP: Record<string, string[]> = {
  finance: ["Finance", "MutualFunds", "StockMarket", "Crypto", "PersonalFinance", "RealEstate"],
  "stock market": ["StockMarket", "Finance"],
  "mutual funds": ["MutualFunds", "Finance"],
  crypto: ["Crypto", "Finance"],
  "personal finance": ["PersonalFinance", "Finance"],
  fitness: ["Fitness", "WeightLoss", "Yoga"],
  "weight loss": ["WeightLoss", "Fitness"],
  yoga: ["Yoga", "Fitness"],
  tech: ["Tech", "AINews"],
  ai: ["AINews", "Tech"],
  "ai news": ["AINews", "Tech"],
  business: ["Business"],
  cricket: ["Cricket", "IPL"],
  ipl: ["IPL", "Cricket"],
  bollywood: ["Bollywood"],
  travel: ["Travel"],
  food: ["Food"],
  gaming: ["Gaming"],
  education: ["Education"],
  fashion: ["Fashion"],
  motivation: ["Motivation"],
  skincare: ["Skincare"],
  comedy: ["Comedy"],
  "real estate": ["RealEstate", "Finance"],
  jobs: ["Jobs"],
};

const getCategoryImage = (headline: string) => {
  const h = headline.toLowerCase();
  if (h.includes('cricket') || h.includes('ipl')) return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400';
  if (h.includes('fitness') || h.includes('workout') || h.includes('gym')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400';
  if (h.includes('ai') || h.includes('tech') || h.includes('chatgpt')) return 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400';
  if (h.includes('bollywood') || h.includes('movie') || h.includes('film')) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
  if (h.includes('travel') || h.includes('tourism')) return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400';
  if (h.includes('food') || h.includes('recipe') || h.includes('cooking')) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400';
  if (h.includes('stock') || h.includes('market') || h.includes('invest') || h.includes('finance')) return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400';
  if (h.includes('fashion') || h.includes('style')) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400';
  if (h.includes('gaming') || h.includes('game')) return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400';
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

const isToday = (dateStr: string) => new Date(dateStr).toDateString() === new Date().toDateString();
const isYesterday = (dateStr: string) => {
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  return new Date(dateStr).toDateString() === yesterday.toDateString();
};
const isLastWeek = (dateStr: string) => {
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  return new Date(dateStr) >= weekAgo;
};

const getRelatedTopics = (q: string): string[] => {
  const q_lower = q.toLowerCase().trim();
  for (const [niche, topics] of Object.entries(NICHE_TOPIC_MAP)) {
    if (niche === q_lower || niche.includes(q_lower) || q_lower.includes(niche)) return topics;
  }
  return [q.trim()];
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    getNews().then((data) => {
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
      } else setFilteredArticles(sorted);
    }).catch(() => setError("Failed to load news")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchInput.trim().length > 0) {
      const filtered = SUGGESTED.filter(s => s.toLowerCase().includes(searchInput.toLowerCase()) && s.toLowerCase() !== searchInput.toLowerCase()).slice(0, 6);
      setDropdownSuggestions(filtered); setShowDropdown(filtered.length > 0);
    } else { setShowDropdown(false); setDropdownSuggestions([]); }
  }, [searchInput]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filterByQuery = (list: NewsArticle[], q: string) => {
    if (!q.trim()) return list;
    const relatedTopics = getRelatedTopics(q);
    const topicMatches = list.filter(item => {
      const topic = (item.topicName || item.topic || item.tag || '').trim();
      return relatedTopics.some(t => t.toLowerCase() === topic.toLowerCase());
    });
    if (topicMatches.length > 0) return topicMatches;
    const q_lower = q.toLowerCase().trim();
    return list.filter(item => {
      const text = ((item.title || item.headline || '') + ' ' + (item.summary || '') + ' ' + (item.topicName || item.topic || item.tag || '')).toLowerCase();
      if (q_lower.length <= 2) { const wb = new RegExp(`\\b${q_lower}\\b`, 'i'); return wb.test(text); }
      return text.includes(q_lower);
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

  const applyAllFilters = (list: NewsArticle[], q: string, date: string) => {
    let result = filterByDate(list, date);
    if (q.trim()) { const searched = filterByQuery(result, q); result = searched.length > 0 ? searched : result; }
    return result;
  };

  const handleSearch = (q: string) => {
    setQuery(q); setSearchInput(q); setShowDropdown(false);
    setFilteredArticles(applyAllFilters(articles, q, dateFilter));
  };

  const handleDateFilter = (filter: string) => {
    setDateFilter(filter);
    setFilteredArticles(applyAllFilters(articles, query, filter));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ Sticky header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-pink-500" />
          <h1 className="text-lg font-bold text-foreground">News Feed</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
        <div>
          <h2 className="font-semibold text-foreground mb-1">Latest for Creators</h2>
          <p className="text-xs text-muted-foreground">Stay updated with trending news for your niche</p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input ref={inputRef} type="text" value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(searchInput); if (e.key === "Escape") setShowDropdown(false); }}
              onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
              placeholder="Search news (e.g. Finance, Fitness, Cricket)..."
              className="w-full pl-11 pr-9 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
            />
            {searchInput && (
              <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showDropdown && dropdownSuggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              {dropdownSuggestions.map((s, i) => (
                <button key={i} onClick={() => handleSearch(s)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date filter */}
        <div className="flex gap-2">
          {DATE_FILTERS.map((f) => (
            <button key={f.value} onClick={() => handleDateFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${dateFilter === f.value ? "text-white border-transparent" : "border-border text-muted-foreground hover:text-foreground"}`}
              style={dateFilter === f.value ? { background: "linear-gradient(135deg, #E8B84B, #C17D20)" } : {}}
            >{f.label}</button>
          ))}
        </div>

        {/* Suggested chips */}
        {!query && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Try searching:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button key={s} onClick={() => handleSearch(s)} className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{s}</button>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <p className="text-xs text-muted-foreground">{filteredArticles.length} articles {query ? `for "${query}"` : ''}</p>
        )}

        {loading && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}
        {error && <div className="text-center py-16 text-red-400">{error}</div>}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No news found {query ? `for "${query}"` : ''}</p>
            <p className="text-xs mt-1">Try a different filter or search term</p>
          </div>
        )}

        {!loading && !error && filteredArticles.length > 0 && (
          <div className="space-y-3">
            {filteredArticles.map((item, i) => {
              const headline = item.title || item.headline || "Untitled";
              const summary = item.summary || "";
              const source = item.sourceName || item.source || "";
              const date = item.published_at || item.publishedAt || item.date || "";
              const topic = item.topicName || item.topic || item.tag || "";
              const timeAgo = getTimeAgo(date);
              const thumbnail = item.image_url;
              return (
                <motion.div key={item.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border rounded-2xl p-4 hover:border-pink-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {thumbnail && (
                      <img src={thumbnail} alt={headline} className="w-20 h-16 rounded-xl object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-medium text-foreground text-sm leading-snug">{headline}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          {summary && (
                            <button onClick={() => setSelectedArticle(item)} className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap">Summary</button>
                          )}
                          {item.url && (
                            <button onClick={() => window.open(item.url, '_blank')} className="text-muted-foreground hover:text-foreground transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {source && <span className="text-xs text-muted-foreground">{source}</span>}
                        {source && timeAgo && <span className="text-xs text-muted-foreground">·</span>}
                        {timeAgo && <span className="text-xs text-pink-500 font-medium">{timeAgo}</span>}
                        {topic && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0 cursor-pointer hover:bg-primary/20" onClick={() => handleSearch(topic)}>{topic}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Popup */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-semibold text-foreground pr-4">{selectedArticle.title || selectedArticle.headline}</h2>
                <button onClick={() => setSelectedArticle(null)} className="text-muted-foreground hover:text-foreground flex-shrink-0"><X className="w-5 h-5" /></button>
              </div>
              <img src={selectedArticle.image_url || getCategoryImage(selectedArticle.title || selectedArticle.headline || '')}
                alt={selectedArticle.title || selectedArticle.headline}
                className="w-full h-40 object-cover rounded-xl mb-4"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'; }}
              />
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{selectedArticle.summary || "No summary available."}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{selectedArticle.sourceName || selectedArticle.source}</span>
                {selectedArticle.url && (
                  <button onClick={() => window.open(selectedArticle.url, '_blank')} className="flex items-center gap-1 text-sm text-primary hover:underline">
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
