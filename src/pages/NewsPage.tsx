import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2, X, Search, RefreshCw, TrendingUp, Sparkles, AlertTriangle, ArrowUpRight, SlidersHorizontal, Calendar, Bookmark, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PRIMARY = "#24389c";
const SECONDARY = "#6f48b2";
const PRIMARY_GRAD = "linear-gradient(135deg, #24389c, #6f48b2)";
const PRIMARY_CONTAINER = "#dee0ff";
const SECONDARY_CONTAINER = "#b78efe";

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
  if (h.includes('cricket') || h.includes('ipl')) return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600';
  if (h.includes('fitness') || h.includes('workout')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600';
  if (h.includes('ai') || h.includes('tech')) return 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600';
  if (h.includes('bollywood') || h.includes('movie')) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
  if (h.includes('travel')) return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600';
  if (h.includes('food') || h.includes('recipe')) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600';
  if (h.includes('stock') || h.includes('finance') || h.includes('market')) return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600';
  if (h.includes('crypto') || h.includes('bitcoin')) return 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600';
  if (h.includes('gaming') || h.includes('game')) return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600';
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600';
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
  if (isHigh) return { level: 'high', text: 'High impact story — create content around this now for maximum reach' };
  return { level: 'medium', text: 'Relevant update for your niche — good content opportunity' };
};

const getTagStyle = (topic: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    Finance: { bg: '#e8f5e9', text: '#2e7d32' },
    Tech: { bg: '#e3f2fd', text: '#1565c0' },
    Cricket: { bg: '#fff3e0', text: '#e65100' },
    Bollywood: { bg: '#fce4ec', text: '#880e4f' },
    Fitness: { bg: '#f3e5f5', text: '#6a1b9a' },
    Gaming: { bg: '#e8eaf6', text: '#283593' },
    Food: { bg: '#fff8e1', text: '#f57f17' },
    Travel: { bg: '#e0f7fa', text: '#006064' },
    Crypto: { bg: '#ede7f6', text: '#4527a0' },
  };
  return colors[topic] || { bg: '#ede7f6', text: '#4527a0' };
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
  const [pickerDay, setPickerDay] = useState('');
  const [pickerMonth, setPickerMonth] = useState('');
  const [pickerYear, setPickerYear] = useState('');
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('All News');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const trendingTopics = useMemo<TrendingTopic[]>(() => {
    const counts: Record<string, number> = {};
    allArticles.forEach(a => { if (a.topic) counts[a.topic] = (counts[a.topic] || 0) + 1; });
    const userTopics = userNiches.map(n => NICHE_TO_TOPIC[n] || n).filter(Boolean);
    return Object.entries(counts)
      .filter(([topic]) => userTopics.length === 0 || userTopics.some(t => t.toLowerCase() === topic.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic, count]) => ({ topic, count, emoji: TOPIC_EMOJIS[topic] || '📰' }));
  }, [allArticles, userNiches]);

  const fetchNews = async (filter: string, topicQuery?: string, trending?: string | null, date?: string) => {
    setLoading(true); setError(null);
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
    } catch { setError("Failed to load news"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetch(`${BASE}/api/news?filter=today`)
      .then(r => r.json()).then(data => setAllArticles(Array.isArray(data) ? data : [])).catch(() => {});
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

  const toggleSave = (id: string) => {
    setSavedArticles(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const impactData = selectedArticle ? getImpact(selectedArticle.topic || '', selectedArticle.summary || '') : null;
  const keyPoints = selectedArticle ? extractKeyPoints(selectedArticle.summary || '') : [];

  const filterLabel = customDate
    ? new Date(customDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : DATE_FILTERS.find(f => f.value === dateFilter)?.label || 'Today';

  const categories = ['All News', ...Array.from(new Set(trendingTopics.map(t => t.topic))).slice(0, 5)];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-xl text-[#24389c] dark:text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            News Feed
          </h1>
          {userNiches.length > 0 && !query && !trendingFilter && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
              For You
            </span>
          )}
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] dark:hover:bg-gray-800 transition-colors disabled:opacity-40">
          <RefreshCw className={`w-5 h-5 text-[#757684] ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-4 pb-28 space-y-4">

        {/* ── Search + Filter ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757684]" />
            <input ref={inputRef} type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(searchInput); }}
              onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
              placeholder="Search topics..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#c5c5d4] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-[#191c1d] placeholder:text-[#757684] outline-none text-sm transition-all focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20" />
            {searchInput && (
              <button onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#191c1d]">
                <X className="w-4 h-4" />
              </button>
            )}
            {showDropdown && dropdownSuggestions.length > 0 && (
              <div ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-[#c5c5d4] dark:border-gray-600 rounded-xl shadow-lg z-50 overflow-hidden">
                {dropdownSuggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSearch(s)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#191c1d] dark:text-white hover:bg-[#f3f4f5] dark:hover:bg-gray-700 text-left">
                    <Search className="w-3.5 h-3.5 text-[#757684] shrink-0" />{s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter button */}
          <div className="relative">
            <button onClick={() => setShowFilterMenu(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#c5c5d4] dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-[#454652] dark:text-gray-300 hover:border-[#24389c] transition-colors whitespace-nowrap"
              style={(dateFilter !== 'today' || customDate) ? { borderColor: PRIMARY, color: PRIMARY } : {}}>
              <SlidersHorizontal className="w-4 h-4" />
              {filterLabel}
            </button>
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-[#c5c5d4] dark:border-gray-600 rounded-xl shadow-lg z-50 overflow-hidden min-w-[200px]">
                {DATE_FILTERS.map(f => (
                  <button key={f.value}
                    onClick={(e) => { e.stopPropagation(); handleDateFilter(f.value); setShowFilterMenu(false); setShowDatePicker(false); }}
                    className="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-[#f3f4f5] dark:hover:bg-gray-700 text-left gap-4"
                    style={dateFilter === f.value && !customDate ? { color: PRIMARY } : { color: 'hsl(var(--foreground))' }}>
                    <span className="font-medium">{f.label}</span>
                    <span className="text-xs text-[#757684]">{f.desc}</span>
                    {dateFilter === f.value && !customDate && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRIMARY }} />}
                  </button>
                ))}
                <div className="border-t border-[#e1e3e4] dark:border-gray-700" />
                <button onClick={(e) => { e.stopPropagation(); setShowDatePicker(prev => !prev); }}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-[#f3f4f5] dark:hover:bg-gray-700"
                  style={customDate ? { color: PRIMARY } : { color: 'hsl(var(--foreground))' }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{customDate ? filterLabel : 'Pick a Date'}</span>
                  </div>
                  {customDate && <div className="w-1.5 h-1.5 rounded-full" style={{ background: PRIMARY }} />}
                </button>

                {showDatePicker && (
                  <div className="px-4 pb-4 pt-2 space-y-3 border-t border-[#e1e3e4] dark:border-gray-700" onClick={e => e.stopPropagation()}>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-[#757684] mb-1">Day</p>
                        <select value={pickerDay} onChange={e => setPickerDay(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-[#c5c5d4] dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none">
                          <option value="">DD</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                            <option key={d} value={String(d).padStart(2, '0')}>{String(d).padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-[#757684] mb-1">Month</p>
                        <select value={pickerMonth} onChange={e => setPickerMonth(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-[#c5c5d4] dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none">
                          <option value="">MM</option>
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                            <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-[#757684] mb-1">Year</p>
                        <select value={pickerYear} onChange={e => setPickerYear(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-[#c5c5d4] dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none">
                          <option value="">YYYY</option>
                          {[2025, 2026].map(y => <option key={y} value={String(y)}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCustomDate(null); setPickerDay(''); setPickerMonth(''); setPickerYear(''); setDateFilter('today'); setShowDatePicker(false); setShowFilterMenu(false); fetchNews('today', query || undefined, trendingFilter); }}
                        className="flex-1 py-2 rounded-lg border border-[#c5c5d4] text-xs text-[#757684] hover:text-[#191c1d]">
                        Reset
                      </button>
                      <button onClick={() => {
                        if (!pickerDay || !pickerMonth || !pickerYear) return;
                        const dateStr = `${pickerYear}-${pickerMonth}-${pickerDay}`;
                        setCustomDate(dateStr); setDateFilter('custom');
                        setShowDatePicker(false); setShowFilterMenu(false);
                        fetchNews('custom', undefined, null, dateStr);
                      }} disabled={!pickerDay || !pickerMonth || !pickerYear}
                        className="flex-1 py-2 rounded-lg text-white text-xs font-medium disabled:opacity-40"
                        style={{ background: PRIMARY_GRAD }}>
                        Show News
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Category chips ── */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {trendingTopics.length > 0 ? (
            <>
              <button
                onClick={() => { setTrendingFilter(null); setQuery(''); setSearchInput(''); fetchNews(dateFilter, undefined, null); }}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={!trendingFilter
                  ? { background: PRIMARY, color: '#fff' }
                  : { background: '#e7e8e9', color: '#454652' }}>
                All News
              </button>
              {trendingTopics.map(t => (
                <button key={t.topic}
                  onClick={() => handleTrendingFilter(t.topic)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={trendingFilter === t.topic
                    ? { background: PRIMARY, color: '#fff' }
                    : { background: '#e7e8e9', color: '#454652' }}>
                  {t.emoji} {t.topic}
                </button>
              ))}
            </>
          ) : (
            ['All News', 'Finance', 'Tech', 'Cricket', 'Bollywood', 'Fitness'].map(cat => (
              <button key={cat}
                onClick={() => { setActiveCategory(cat); if (cat !== 'All News') handleTrendingFilter(cat); else { setTrendingFilter(null); fetchNews(dateFilter, undefined, null); } }}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={activeCategory === cat
                  ? { background: PRIMARY, color: '#fff' }
                  : { background: '#e7e8e9', color: '#454652' }}>
                {cat}
              </button>
            ))
          )}
        </div>

        {/* ── Article count ── */}
        {!loading && (
          <p className="text-xs text-[#757684]">
            <span className="font-semibold" style={{ color: PRIMARY }}>{articles.length}</span> articles
            {(query || trendingFilter) && <span> for "<span style={{ color: PRIMARY }}>{trendingFilter || query}</span>"</span>}
            {!query && !trendingFilter && userNiches.length > 0 && <span> · personalized</span>}
          </p>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
            <p className="text-sm text-[#757684]">Loading news...</p>
          </div>
        )}

        {error && <div className="text-center py-16 text-red-500 text-sm">{error}</div>}

        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: PRIMARY_CONTAINER }}>📰</div>
            <p className="font-semibold text-[#191c1d] dark:text-white">No news found</p>
            <p className="text-sm text-[#757684]">Fresh news will appear here soon</p>
            <button onClick={() => { setCustomDate(null); setTrendingFilter(null); handleDateFilter('all'); }}
              className="text-sm px-5 py-2.5 rounded-full text-white font-semibold mt-1"
              style={{ background: PRIMARY_GRAD }}>
              Show All News
            </button>
          </div>
        )}

        {/* ── Articles ── */}
        {!loading && !error && articles.length > 0 && (
          <div className="flex flex-col gap-4">
            {articles.map((item, i) => {
              const headline = item.title || item.headline || "Untitled";
              const timeAgo = getTimeAgo(item.published_at || '');
              const topic = item.topic || '';
              const tagStyle = getTagStyle(topic);
              const isSaved = savedArticles.has(item.id || String(i));
              const isFeatured = i === 0;

              if (isFeatured) {
                // ── Featured card (large image) ──
                return (
                  <motion.article key={item.id || i}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-[#e1e3e4] dark:border-gray-700 cursor-pointer transition-transform active:scale-[0.98]"
                    onClick={() => setSelectedArticle(item)}>
                    <div className="relative h-52 w-full">
                      <img src={item.image_url || getCategoryImage(headline)} alt={headline}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline); }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {topic && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                            style={{ background: SECONDARY_CONTAINER, color: '#491d8a' }}>
                            {TOPIC_EMOJIS[topic] || '📰'} {topic}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{item.source}</span>
                        <span className="text-[#757684] text-[10px]">• {timeAgo}</span>
                      </div>
                      <h2 className="font-bold text-lg text-[#191c1d] dark:text-white leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {headline}
                      </h2>
                      {item.summary && (
                        <p className="text-sm text-[#454652] dark:text-gray-300 line-clamp-2">{item.summary}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-3">
                          {item.summary && (
                            <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: PRIMARY }}>
                              <Sparkles className="w-3 h-3" /> View Insights
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleSave(item.id || String(i))}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
                              style={{ color: isSaved ? PRIMARY : '#757684' }} />
                          </button>
                          {item.url && (
                            <button onClick={() => window.open(item.url, '_blank')}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
                              <ExternalLink className="w-4 h-4 text-[#757684]" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              }

              // ── Regular card (horizontal layout with hover expand) ──
              return (
                <motion.article key={item.id || i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(36,56,156,0.12)' }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-[#e1e3e4] dark:border-gray-700 cursor-pointer transition-all duration-300 group"
                  onClick={() => setSelectedArticle(item)}>
                  {/* Collapsed: horizontal layout */}
                  <div className="flex gap-0 p-4 group-hover:hidden">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        {topic && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                            style={{ background: tagStyle.bg, color: tagStyle.text }}>
                            {TOPIC_EMOJIS[topic] || '📰'} {topic}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-[#191c1d] dark:text-white leading-snug line-clamp-2"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {headline}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{item.source}</span>
                          <span className="text-[#757684] text-[10px]">• {timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleSave(item.id || String(i))}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`}
                              style={{ color: isSaved ? PRIMARY : '#757684' }} />
                          </button>
                          {item.url && (
                            <button onClick={() => window.open(item.url, '_blank')}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
                              <ExternalLink className="w-3.5 h-3.5 text-[#757684]" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 ml-3">
                      <img src={item.image_url || getCategoryImage(headline)} alt=""
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline); }} />
                    </div>
                  </div>

                  {/* Expanded: shown on hover */}
                  <div className="hidden group-hover:block">
                    <div className="relative h-40 w-full">
                      <img src={item.image_url || getCategoryImage(headline)} alt={headline}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline); }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {topic && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                            style={{ background: SECONDARY_CONTAINER, color: '#491d8a' }}>
                            {TOPIC_EMOJIS[topic] || '📰'} {topic}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{item.source}</span>
                        <span className="text-[#757684] text-[10px]">• {timeAgo}</span>
                      </div>
                      <h3 className="font-bold text-base text-[#191c1d] dark:text-white leading-snug"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {headline}
                      </h3>
                      {item.summary && (
                        <p className="text-sm text-[#454652] dark:text-gray-300 line-clamp-3 leading-relaxed">
                          {item.summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: PRIMARY }}>
                          <Sparkles className="w-3 h-3" /> Tap for insights
                        </span>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleSave(item.id || String(i))}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`}
                              style={{ color: isSaved ? PRIMARY : '#757684' }} />
                          </button>
                          {item.url && (
                            <button onClick={() => window.open(item.url, '_blank')}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
                              <ExternalLink className="w-3.5 h-3.5 text-[#757684]" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Article Detail Popup ── */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedArticle(null)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

              {/* Image */}
              <div className="relative h-44">
                <img src={selectedArticle.image_url || getCategoryImage(selectedArticle.title || selectedArticle.headline || '')}
                  alt="" className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60">
                  <X className="w-4 h-4" />
                </button>
                {selectedArticle.topic && (
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase text-white"
                      style={{ background: SECONDARY }}>
                      {TOPIC_EMOJIS[selectedArticle.topic] || '📰'} {selectedArticle.topic}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Title */}
                <h2 className="font-bold text-lg text-[#191c1d] dark:text-white leading-snug"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {selectedArticle.title || selectedArticle.headline}
                </h2>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-[#757684]">
                  {selectedArticle.source && <span className="font-semibold" style={{ color: PRIMARY }}>{selectedArticle.source}</span>}
                  {selectedArticle.published_at && <span>{getTimeAgo(selectedArticle.published_at)}</span>}
                </div>

                {/* Key Highlights */}
                {keyPoints.length > 0 && (
                  <div className="rounded-xl p-4 space-y-2.5" style={{ background: '#ede7f6' }}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: SECONDARY }} />
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: SECONDARY }}>Key Highlights</p>
                    </div>
                    {keyPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: SECONDARY }} />
                        <p className="text-sm text-[#191c1d] dark:text-gray-200 leading-relaxed">{point}.</p>
                      </div>
                    ))}
                  </div>
                )}

                {keyPoints.length === 0 && selectedArticle.summary && (
                  <p className="text-sm text-[#454652] dark:text-gray-300 leading-relaxed">{selectedArticle.summary}</p>
                )}

                {/* Creator Impact */}
                {impactData && (
                  <div className="rounded-xl p-4"
                    style={{
                      background: impactData.level === 'high' ? '#fff3e0' : impactData.level === 'medium' ? '#e8f5e9' : '#f3e5f5',
                      border: `1px solid ${impactData.level === 'high' ? '#ffcc80' : impactData.level === 'medium' ? '#a5d6a7' : '#ce93d8'}`,
                    }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {impactData.level === 'high' ? <AlertTriangle className="w-4 h-4 text-orange-500" />
                        : impactData.level === 'medium' ? <TrendingUp className="w-4 h-4 text-green-600" />
                        : <ArrowUpRight className="w-4 h-4 text-purple-600" />}
                      <p className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: impactData.level === 'high' ? '#e65100' : impactData.level === 'medium' ? '#2e7d32' : '#6a1b9a' }}>
                        {impactData.level === 'high' ? '🔥 High Impact' : impactData.level === 'medium' ? '📈 Medium Impact' : '✅ Low Impact'} for Creators
                      </p>
                    </div>
                    <p className="text-sm"
                      style={{ color: impactData.level === 'high' ? '#bf360c' : impactData.level === 'medium' ? '#1b5e20' : '#4a148c' }}>
                      {impactData.text}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => toggleSave(selectedArticle.id || '')}
                    className="flex-1 py-2.5 rounded-xl border border-[#c5c5d4] text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                    style={savedArticles.has(selectedArticle.id || '') ? { background: PRIMARY_CONTAINER, color: PRIMARY, borderColor: PRIMARY } : { color: '#454652' }}>
                    <Bookmark className={`w-4 h-4 ${savedArticles.has(selectedArticle.id || '') ? 'fill-current' : ''}`} />
                    {savedArticles.has(selectedArticle.id || '') ? 'Saved' : 'Save'}
                  </button>
                  {selectedArticle.url && (
                    <button onClick={() => window.open(selectedArticle.url, '_blank')}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                      style={{ background: PRIMARY_GRAD }}>
                      Read Full <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}