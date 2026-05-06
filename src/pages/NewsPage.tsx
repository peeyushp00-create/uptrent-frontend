import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, ExternalLink, Loader2, X, Search, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const IG = "#14BBA6";
const IG_GRAD = "linear-gradient(135deg, #14BBA6, #0D9488)";

interface NewsArticle {
  id?: string;
  title?: string;
  headline?: string;
  summary?: string;
  source?: string;
  published_at?: string;
  topic?: string;
  url?: string;
  image_url?: string;
}

const SUGGESTED = [
  "Finance", "Cricket", "Tech", "Bollywood", "Fitness",
  "Business", "Crypto", "Travel", "Food", "Gaming",
  "Education", "Fashion", "Yoga", "Skincare", "IPL"
];

const DATE_FILTERS = [
  { label: "Today", value: "today", desc: "Last 24 hours" },
  { label: "Yesterday", value: "yesterday", desc: "24–48 hrs ago" },
  { label: "This Week", value: "week", desc: "2–7 days ago" },
  { label: "All", value: "all", desc: "Last 7 days" },
];

const NICHE_TOPIC_MAP: Record<string, string[]> = {
  finance: ["Finance", "MutualFunds", "StockMarket", "PersonalFinance"],
  "stock market": ["StockMarket", "Finance"],
  crypto: ["Crypto"],
  fitness: ["Fitness", "WeightLoss", "Yoga"],
  yoga: ["Yoga", "Fitness"],
  tech: ["Tech", "AINews"],
  ai: ["AINews", "Tech"],
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
};

const getCategoryImage = (headline: string) => {
  const h = headline.toLowerCase();
  if (h.includes('cricket') || h.includes('ipl')) return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400';
  if (h.includes('fitness') || h.includes('workout')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400';
  if (h.includes('ai') || h.includes('tech')) return 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400';
  if (h.includes('bollywood') || h.includes('movie')) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
  if (h.includes('travel')) return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400';
  if (h.includes('food') || h.includes('recipe')) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400';
  if (h.includes('stock') || h.includes('finance') || h.includes('market')) return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400';
  if (h.includes('crypto') || h.includes('bitcoin')) return 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400';
  if (h.includes('gaming') || h.includes('game')) return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400';
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400';
};

const getTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function NewsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const initialQuery = (location.state as any)?.query || "";

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [dateFilter, setDateFilter] = useState("today");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch from backend with filter param
  const fetchNews = async (filter: string, topicQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${BASE}/api/news?filter=${filter}`;
      if (topicQuery) {
        // Map query to topic IDs
        const q = topicQuery.toLowerCase().trim();
        let topicId = topicQuery;
        for (const [niche, topics] of Object.entries(NICHE_TOPIC_MAP)) {
          if (niche === q || niche.includes(q) || q.includes(niche)) {
            topicId = topics[0];
            break;
          }
        }
        url += `&topicId=${encodeURIComponent(topicId)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setArticles(list.sort((a, b) =>
        new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
      ));
    } catch {
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(dateFilter, initialQuery || undefined);
  }, []);

  useEffect(() => {
    if (searchInput.trim().length > 0) {
      const filtered = SUGGESTED.filter(s =>
        s.toLowerCase().includes(searchInput.toLowerCase()) &&
        s.toLowerCase() !== searchInput.toLowerCase()
      ).slice(0, 6);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
      setDropdownSuggestions([]);
    }
  }, [searchInput]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    setSearchInput(q);
    setShowDropdown(false);
    fetchNews(dateFilter, q || undefined);
  };

  const handleDateFilter = (filter: string) => {
    setDateFilter(filter);
    fetchNews(filter, query || undefined);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews(dateFilter, query || undefined);
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Newspaper className="w-5 h-5" style={{ color: IG }} />
          <h1 className="text-lg font-bold text-foreground">News Feed</h1>
          <button onClick={handleRefresh} disabled={refreshing}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input ref={inputRef} type="text" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSearch(searchInput); if (e.key === "Escape") setShowDropdown(false); }}
            onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
            placeholder="Search news (Finance, Cricket, Tech)..."
            className="w-full pl-11 pr-9 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
            onFocus={e => { e.target.style.borderColor = `${IG}50`; }}
            onBlur={e => { e.target.style.borderColor = ''; }} />
          {searchInput && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          {showDropdown && dropdownSuggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              {dropdownSuggestions.map((s, i) => (
                <button key={i} onClick={() => handleSearch(s)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Date filter tabs */}
        <div className="flex gap-1.5 p-1 rounded-2xl bg-card border border-border overflow-x-auto">
          {DATE_FILTERS.map(f => (
            <button key={f.value} onClick={() => handleDateFilter(f.value)}
              className="flex-1 flex flex-col items-center py-2 px-3 rounded-xl text-xs font-medium transition-all whitespace-nowrap"
              style={dateFilter === f.value
                ? { background: IG_GRAD, color: '#fff' }
                : { color: 'hsl(var(--muted-foreground))' }}>
              <span className="font-semibold">{f.label}</span>
              <span className="opacity-70 text-xs mt-0.5" style={{ fontSize: 9 }}>{f.desc}</span>
            </button>
          ))}
        </div>

        {/* Suggested chips */}
        {!query && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => handleSearch(s)}
                className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground transition-colors"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${IG}50`; (e.currentTarget as HTMLElement).style.color = IG; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.color = ''; }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              <span style={{ color: IG, fontWeight: 600 }}>{articles.length}</span> articles
              {query && <span> for "<span style={{ color: IG }}>{query}</span>"</span>}
              {' · '}{DATE_FILTERS.find(f => f.value === dateFilter)?.label}
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: IG }} />
            <p className="text-xs text-muted-foreground">Loading {DATE_FILTERS.find(f => f.value === dateFilter)?.label.toLowerCase()} news...</p>
          </div>
        )}

        {error && <div className="text-center py-16 text-red-400">{error}</div>}

        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Newspaper className="w-10 h-10 text-muted-foreground opacity-30" />
            <p className="text-sm font-semibold text-foreground">No news for {DATE_FILTERS.find(f => f.value === dateFilter)?.label}</p>
            <p className="text-xs text-muted-foreground">
              {dateFilter === 'yesterday' ? 'Yesterday\'s articles will appear here' :
               dateFilter === 'week' ? 'Older articles will appear here' :
               'Fresh news will appear here soon'}
            </p>
            <button onClick={() => handleDateFilter('all')}
              className="text-xs px-4 py-2 rounded-xl text-white mt-1"
              style={{ background: IG_GRAD }}>
              Show All News
            </button>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="space-y-3">
            {articles.map((item, i) => {
              const headline = item.title || item.headline || "Untitled";
              const date = item.published_at || '';
              const timeAgo = getTimeAgo(date);
              const topic = item.topic || '';
              const thumbnail = item.image_url;
              return (
                <motion.div key={item.id || i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card border border-border rounded-2xl p-4 transition-all"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${IG}30`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; }}>
                  <div className="flex items-start gap-3">
                    {thumbnail && (
                      <img src={thumbnail} alt={headline}
                        className="w-20 h-16 rounded-xl object-cover shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline); }} />
                    )}
                    {!thumbnail && (
                      <img src={getCategoryImage(headline)} alt={headline}
                        className="w-20 h-16 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2">{headline}</h3>
                        <div className="flex gap-1.5 shrink-0">
                          {item.summary && (
                            <button onClick={() => setSelectedArticle(item)}
                              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                              style={{ background: `${IG}15`, color: IG }}>
                              Summary
                            </button>
                          )}
                          {item.url && (
                            <button onClick={() => window.open(item.url, '_blank')}
                              className="text-muted-foreground hover:text-foreground transition-colors p-1">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.source && <span className="text-xs text-muted-foreground">{item.source}</span>}
                        {item.source && timeAgo && <span className="text-xs text-muted-foreground">·</span>}
                        <span className="text-xs font-medium" style={{ color: IG }}>{timeAgo}</span>
                        {topic && (
                          <Badge variant="secondary"
                            className="text-xs cursor-pointer transition-colors"
                            style={{ background: `${IG}12`, color: IG, border: 'none' }}
                            onClick={() => handleSearch(topic)}>
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
      </div>

      {/* Summary Popup */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-semibold text-foreground pr-4 text-sm leading-snug">
                  {selectedArticle.title || selectedArticle.headline}
                </h2>
                <button onClick={() => setSelectedArticle(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img src={selectedArticle.image_url || getCategoryImage(selectedArticle.title || selectedArticle.headline || '')}
                alt="" className="w-full h-40 object-cover rounded-xl mb-4"
                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'; }} />
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {selectedArticle.summary || "No summary available."}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{selectedArticle.source}</span>
                {selectedArticle.url && (
                  <button onClick={() => window.open(selectedArticle.url, '_blank')}
                    className="flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: IG }}>
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