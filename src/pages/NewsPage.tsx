import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, ExternalLink, Loader2, X, Search, RefreshCw, TrendingUp, Flame, Sparkles, AlertTriangle, ArrowUpRight, SlidersHorizontal, Calendar } from "lucide-react";
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

interface TrendingTopic {
  topic: string;
  count: number;
  emoji: string;
}

const TOPIC_EMOJIS: Record<string, string> = {
  Finance: "📈", StockMarket: "📊", MutualFunds: "💰", Crypto: "🪙",
  PersonalFinance: "💵", Tech: "💻", AINews: "🤖", Cricket: "🏏",
  IPL: "🏆", Bollywood: "🎬", Business: "💼", Fitness: "💪",
  WeightLoss: "🔥", Travel: "✈️", Food: "🍳", Gaming: "🎮",
  Education: "📚", Fashion: "👗", Motivation: "🚀", Skincare: "✨",
  Yoga: "🧘", Comedy: "😂", RealEstate: "🏠", Jobs: "💼",
};

const DATE_FILTERS = [
  { label: "Today", value: "today", desc: "Last 24 hours" },
  { label: "Yesterday", value: "yesterday", desc: "24–48 hrs ago" },
  { label: "All", value: "all", desc: "Last 7 days" },
];

const NICHE_TOPIC_MAP: Record<string, string> = {
  finance: "Finance", "stock market": "StockMarket", crypto: "Crypto",
  fitness: "Fitness", yoga: "Yoga", tech: "Tech", ai: "AINews",
  business: "Business", cricket: "Cricket", ipl: "IPL",
  bollywood: "Bollywood", travel: "Travel", food: "Food",
  gaming: "Gaming", education: "Education", fashion: "Fashion",
  motivation: "Motivation", skincare: "Skincare",
};

const NICHE_TO_TOPIC: Record<string, string> = {
  "Finance": "Finance", "Fitness": "Fitness", "Tech": "Tech",
  "Cricket": "Cricket", "Bollywood": "Bollywood", "Business": "Business",
  "Food": "Food", "Travel": "Travel", "Gaming": "Gaming",
  "Education": "Education", "Fashion": "Fashion", "Motivation": "Motivation",
  "Skincare": "Skincare", "Yoga": "Yoga", "Crypto": "Crypto",
  "Comedy": "Comedy", "Other": "Business",
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

const extractKeyPoints = (summary: string): string[] => {
  if (!summary) return [];
  const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 3).map(s => s.trim());
};

const getImpact = (topic: string, summary: string): { level: 'high' | 'medium' | 'low'; text: string } => {
  const s = (summary || '').toLowerCase();
  const highImpactWords = ['record', 'historic', 'crash', 'surge', 'ban', 'new high', 'new low', 'billion', 'million', 'major'];
  const isHigh = highImpactWords.some(w => s.includes(w));
  if (topic === 'Finance' || topic === 'StockMarket' || topic === 'Crypto') {
    if (isHigh) return { level: 'high', text: 'Major market movement — content about this could go viral in finance niche' };
    return { level: 'medium', text: 'Good finance content opportunity — your audience will want to know about this' };
  }
  if (topic === 'Cricket' || topic === 'IPL') {
    if (isHigh) return { level: 'high', text: 'Big cricket news — perfect timing for reaction/analysis Reels' };
    return { level: 'medium', text: 'Cricket update — good for engagement with sports audience' };
  }
  if (topic === 'Tech' || topic === 'AINews') {
    if (isHigh) return { level: 'high', text: 'Major tech development — explainer content will get high views' };
    return { level: 'medium', text: 'Tech update — your audience will appreciate a quick breakdown' };
  }
  if (topic === 'Bollywood') {
    if (isHigh) return { level: 'high', text: 'Trending Bollywood news — react immediately for maximum reach' };
    return { level: 'low', text: 'Entertainment update — good for casual content' };
  }
  if (isHigh) return { level: 'high', text: 'High impact story — create content around this now for maximum reach' };
  return { level: 'medium', text: 'Relevant update for your niche — good content opportunity' };
};

export default function NewsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const initialQuery = (location.state as any)?.query || "";
  const userNiches: string[] = user?.user_metadata?.niches || (user?.user_metadata?.niche ? [user.user_metadata.niche] : []);

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [dateFilter, setDateFilter] = useState("today");
  const [trendingFilter, setTrendingFilter] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const trendingTopics = useMemo<TrendingTopic[]>(() => {
    const counts: Record<string, number> = {};
    allArticles.forEach(a => {
      if (a.topic) counts[a.topic] = (counts[a.topic] || 0) + 1;
    });
    const userTopics = userNiches.map(n => NICHE_TO_TOPIC[n] || n).filter(Boolean);
    return Object.entries(counts)
      .filter(([topic]) => userTopics.length === 0 || userTopics.some(t => t.toLowerCase() === topic.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic, count]) => ({ topic, count, emoji: TOPIC_EMOJIS[topic] || '📰' }));
  }, [allArticles, userNiches]);

  const fetchNews = async (filter: string, topicQuery?: string, trending?: string | null, date?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${BASE}/api/news?filter=${filter}`;
      if (date) url += `&date=${date}`;
      const activeQuery = trending || topicQuery;
      if (activeQuery) {
        const q = activeQuery.toLowerCase().trim();
        let topicId = activeQuery;
        for (const [niche, topic] of Object.entries(NICHE_TOPIC_MAP)) {
          if (niche === q || niche.includes(q) || q.includes(niche)) { topicId = topic; break; }
        }
        url += `&topicId=${encodeURIComponent(topicId)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      let list = Array.isArray(data) ? data : [];

      // ✅ Filter by user's niches strictly only if no search/trending
      if (!activeQuery && userNiches.length > 0) {
        const userTopics = userNiches.map(n => NICHE_TO_TOPIC[n] || n).filter(Boolean);
        const nicheFiltered = list.filter((a: NewsArticle) =>
          userTopics.some(t => a.topic?.toLowerCase() === t.toLowerCase())
        );
        if (nicheFiltered.length >= 3) list = nicheFiltered;
      }

      const sorted = list.sort((a: NewsArticle, b: NewsArticle) =>
        new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
      );
      setArticles(sorted);
      if (!activeQuery) setAllArticles(sorted);
    } catch {
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${BASE}/api/news?filter=today`)
      .then(r => r.json())
      .then(data => setAllArticles(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchNews(dateFilter, initialQuery || undefined, null); }, []);

  useEffect(() => {
    if (searchInput.trim().length > 0) {
      const filtered = Object.keys(NICHE_TOPIC_MAP)
        .filter(s => s.includes(searchInput.toLowerCase()) && s !== searchInput.toLowerCase())
        .map(s => s.charAt(0).toUpperCase() + s.slice(1)).slice(0, 6);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
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

  const handleSearch = (q: string) => {
    setQuery(q); setSearchInput(q); setShowDropdown(false);
    setTrendingFilter(null); setCustomDate(null);
    fetchNews(dateFilter, q || undefined, null);
  };

  const handleDateFilter = (filter: string) => {
    setDateFilter(filter); setCustomDate(null);
    fetchNews(filter, query || undefined, trendingFilter);
  };

  const handleTrendingFilter = (topic: string) => {
    if (trendingFilter === topic) {
      setTrendingFilter(null); setQuery(''); setSearchInput('');
      fetchNews(dateFilter, undefined, null);
    } else {
      setTrendingFilter(topic); setQuery(''); setSearchInput('');
      fetchNews(dateFilter, undefined, topic);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews(dateFilter, query || undefined, trendingFilter, customDate || undefined);
    setRefreshing(false);
  };

  const handleCustomDate = () => {
    if (!customDate) return;
    setShowDatePicker(false);
    setDateFilter('custom');
    setQuery(''); setSearchInput(''); setTrendingFilter(null);
    fetchNews('custom', undefined, null, customDate);
  };

  const impactData = selectedArticle ? getImpact(selectedArticle.topic || '', selectedArticle.summary || '') : null;
  const keyPoints = selectedArticle ? extractKeyPoints(selectedArticle.summary || '') : [];

  const filterLabel = customDate
    ? new Date(customDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : DATE_FILTERS.find(f => f.value === dateFilter)?.label || 'Today';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Newspaper className="w-5 h-5" style={{ color: IG }} />
          <h1 className="text-lg font-bold text-foreground">News Feed</h1>
          {userNiches.length > 0 && !query && !trendingFilter && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${IG}15`, color: IG }}>
              For You
            </span>
          )}
          <button onClick={handleRefresh} disabled={refreshing}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">

        {/* Search + Filter + Customize */}
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input ref={inputRef} type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(searchInput); if (e.key === "Escape") setShowDropdown(false); }}
              onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
              placeholder="Search other niches..."
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

          {/* Filter button */}
          <div className="relative">
            <button onClick={() => { setShowFilterMenu(prev => !prev); setShowDatePicker(false); }}
              className="flex items-center gap-1.5 px-3 py-3 rounded-2xl border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              style={(dateFilter !== 'today' || customDate) ? { borderColor: `${IG}50`, color: IG } : {}}>
              <SlidersHorizontal className="w-4 h-4" />
              {filterLabel}
            </button>
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden min-w-[160px]">
                {DATE_FILTERS.map(f => (
                  <button key={f.value}
                    onClick={(e) => { e.stopPropagation(); handleDateFilter(f.value); setShowFilterMenu(false); }}
                    className="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left gap-4"
                    style={dateFilter === f.value && !customDate ? { color: IG } : { color: 'hsl(var(--foreground))' }}>
                    <span className="font-medium">{f.label}</span>
                    <span className="text-xs text-muted-foreground">{f.desc}</span>
                    {dateFilter === f.value && !customDate && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: IG }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customize button */}
          <button
            onClick={() => { setShowDatePicker(prev => !prev); setShowFilterMenu(false); }}
            className="flex items-center gap-1.5 px-3 py-3 rounded-2xl border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            style={customDate ? { borderColor: `${IG}50`, color: IG } : {}}>
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {/* Trending filter */}
        {trendingTopics.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5" style={{ color: IG }} />
              <p className="text-xs font-semibold text-foreground">Trending in Your Niches</p>
              {trendingFilter && (
                <button onClick={() => { setTrendingFilter(null); fetchNews(dateFilter, undefined, null); }}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {trendingTopics.map((t, i) => (
                <motion.button key={t.topic}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleTrendingFilter(t.topic)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap shrink-0"
                  style={trendingFilter === t.topic
                    ? { background: IG_GRAD, color: '#fff', borderColor: 'transparent' }
                    : { background: `${IG}08`, borderColor: `${IG}25`, color: IG }}>
                  <span>{t.emoji}</span>
                  <span>{t.topic}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: trendingFilter === t.topic ? 'rgba(255,255,255,0.25)' : `${IG}20` }}>
                    {t.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <p className="text-xs text-muted-foreground">
            <span style={{ color: IG, fontWeight: 600 }}>{articles.length}</span> articles
            {(query || trendingFilter) && <span> for "<span style={{ color: IG }}>{trendingFilter || query}</span>"</span>}
            {customDate && <span> on <span style={{ color: IG }}>{new Date(customDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></span>}
            {!query && !trendingFilter && !customDate && userNiches.length > 0 && <span> · personalized for your niches</span>}
            {' · '}{filterLabel}
          </p>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: IG }} />
            <p className="text-xs text-muted-foreground">Loading news...</p>
          </div>
        )}

        {error && <div className="text-center py-16 text-red-400">{error}</div>}

        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Newspaper className="w-10 h-10 text-muted-foreground opacity-30" />
            <p className="text-sm font-semibold text-foreground">No news found</p>
            <p className="text-xs text-muted-foreground">
              {customDate ? `No articles found for ${new Date(customDate).toLocaleDateString('en-IN')}` :
               dateFilter === 'yesterday' ? "Yesterday's articles will appear here" : 'Fresh news will appear here soon'}
            </p>
            <button onClick={() => { setCustomDate(null); setTrendingFilter(null); handleDateFilter('all'); }}
              className="text-xs px-4 py-2 rounded-xl text-white mt-1" style={{ background: IG_GRAD }}>
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
              const isTrending = trendingTopics.slice(0, 3).some(t => t.topic === topic);
              const isUserNiche = userNiches.some(n => (NICHE_TO_TOPIC[n] || n).toLowerCase() === topic.toLowerCase());

              return (
                <motion.div key={item.id || i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card border border-border rounded-2xl p-4 transition-all cursor-pointer"
                  onClick={() => setSelectedArticle(item)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${IG}30`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; }}>
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img src={thumbnail || getCategoryImage(headline)} alt={headline}
                        className="w-20 h-16 rounded-xl object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline); }} />
                      {isTrending && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: IG_GRAD }}>
                          <TrendingUp className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2">{headline}</h3>
                        <button onClick={e => { e.stopPropagation(); window.open(item.url, '_blank'); }}
                          className="text-muted-foreground hover:text-foreground p-1 shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.source && <span className="text-xs text-muted-foreground">{item.source}</span>}
                        {item.source && timeAgo && <span className="text-xs text-muted-foreground">·</span>}
                        <span className="text-xs font-medium" style={{ color: IG }}>{timeAgo}</span>
                        {topic && (
                          <Badge variant="secondary" className="text-xs cursor-pointer"
                            style={{ background: isUserNiche ? `${IG}20` : `${IG}10`, color: IG, border: 'none' }}
                            onClick={e => { e.stopPropagation(); handleTrendingFilter(topic); }}>
                            {TOPIC_EMOJIS[topic] || '📰'} {topic}
                          </Badge>
                        )}
                        {item.summary && (
                          <span className="text-xs flex items-center gap-1" style={{ color: IG }}>
                            <Sparkles className="w-3 h-3" /> Insights
                          </span>
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

      {/* ── Date Picker Modal ── */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDatePicker(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-foreground">Pick a Date</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Browse news from any date in the last 7 days</p>
                </div>
                <button onClick={() => setShowDatePicker(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                min={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                value={customDate || new Date().toISOString().split('T')[0]}
                onChange={e => setCustomDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none text-sm mb-5 transition-all"
                onFocus={e => e.target.style.borderColor = `${IG}60`}
                onBlur={e => e.target.style.borderColor = ''} />

              {customDate && (
                <p className="text-xs text-center mb-4" style={{ color: IG }}>
                  📅 {new Date(customDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setCustomDate(null); setDateFilter('today'); setShowDatePicker(false); fetchNews('today', query || undefined, trendingFilter); }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Reset
                </button>
                <button onClick={handleCustomDate} disabled={!customDate}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: IG_GRAD }}>
                  Show News
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Enhanced Summary Popup ── */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-xl overflow-hidden max-h-[85vh] overflow-y-auto">

              <div className="relative">
                <img src={selectedArticle.image_url || getCategoryImage(selectedArticle.title || selectedArticle.headline || '')}
                  alt="" className="w-full h-40 object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <button onClick={() => setSelectedArticle(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70">
                  <X className="w-4 h-4" />
                </button>
                {selectedArticle.topic && (
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs px-2 py-1 rounded-full text-white font-medium" style={{ background: IG_GRAD }}>
                      {TOPIC_EMOJIS[selectedArticle.topic] || '📰'} {selectedArticle.topic}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                <h2 className="font-bold text-foreground text-base leading-snug">
                  {selectedArticle.title || selectedArticle.headline}
                </h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {selectedArticle.source && <span>{selectedArticle.source}</span>}
                  {selectedArticle.published_at && (
                    <span style={{ color: IG }}>{getTimeAgo(selectedArticle.published_at)}</span>
                  )}
                </div>

                {/* Key Highlights */}
                {keyPoints.length > 0 && (
                  <div className="rounded-xl p-4 space-y-2" style={{ background: `${IG}08`, border: `1px solid ${IG}25` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4" style={{ color: IG }} />
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: IG }}>Key Highlights</p>
                    </div>
                    {keyPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: IG }} />
                        <p className="text-sm text-foreground leading-relaxed">{point}.</p>
                      </div>
                    ))}
                  </div>
                )}

                {keyPoints.length === 0 && selectedArticle.summary && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedArticle.summary}</p>
                )}

                {/* Impact */}
                {impactData && (
                  <div className="rounded-xl p-4 space-y-2"
                    style={{
                      background: impactData.level === 'high' ? 'rgba(239,68,68,0.08)' : impactData.level === 'medium' ? 'rgba(234,179,8,0.08)' : 'rgba(34,197,94,0.08)',
                      border: `1px solid ${impactData.level === 'high' ? 'rgba(239,68,68,0.25)' : impactData.level === 'medium' ? 'rgba(234,179,8,0.25)' : 'rgba(34,197,94,0.25)'}`,
                    }}>
                    <div className="flex items-center gap-2">
                      {impactData.level === 'high' ? <AlertTriangle className="w-4 h-4 text-red-400" />
                        : impactData.level === 'medium' ? <ArrowUpRight className="w-4 h-4 text-yellow-400" />
                        : <TrendingUp className="w-4 h-4 text-green-400" />}
                      <p className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: impactData.level === 'high' ? '#f87171' : impactData.level === 'medium' ? '#facc15' : '#4ade80' }}>
                        {impactData.level === 'high' ? '🔥 High Impact' : impactData.level === 'medium' ? '📊 Medium Impact' : '✅ Low Impact'} for Creators
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed"
                      style={{ color: impactData.level === 'high' ? '#fca5a5' : impactData.level === 'medium' ? '#fde68a' : '#86efac' }}>
                      {impactData.text}
                    </p>
                  </div>
                )}

                {selectedArticle.url && (
                  <button onClick={() => window.open(selectedArticle.url, '_blank')}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                    style={{ background: IG_GRAD }}>
                    Read Full Article <ExternalLink className="w-3.5 h-3.5" />
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