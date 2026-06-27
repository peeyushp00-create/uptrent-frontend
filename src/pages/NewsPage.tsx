import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2, X, Search, RefreshCw, TrendingUp, Sparkles, AlertTriangle, ArrowUpRight, SlidersHorizontal, Calendar, FileText, ArrowUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PRIMARY = "#7C3AED";
const SECONDARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #7C3AED)";
const PRIMARY_CONTAINER = "#ede9fe";
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
  PersonalFinance: "💵", Tech: "💻", AINews: "🤖", Sports: "🏏",
  Bollywood: "🎬", Business: "💼", Fitness: "💪",
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
  business: "Business", cricket: "Sports", ipl: "Sports", sports: "Sports",
  bollywood: "Bollywood", travel: "Travel", food: "Food",
  gaming: "Gaming", education: "Education", fashion: "Fashion",
  motivation: "Motivation", skincare: "Skincare",
};

const NICHE_TO_TOPIC: Record<string, string> = {
  "Finance": "Finance", "Fitness": "Fitness", "Tech": "Tech",
  "Sports": "Sports", "Bollywood": "Bollywood", "Business": "Business",
  "Food": "Food", "Travel": "Travel", "Gaming": "Gaming",
  "Education": "Education", "Fashion": "Fashion", "Motivation": "Motivation",
  "Skincare": "Skincare", "Yoga": "Yoga", "Crypto": "Crypto",
  "Comedy": "Comedy", "Other": "Business",
};

const TOPIC_IMAGES: Record<string, string[]> = {
  Finance:       ['photo-1611974789855-9c2a0a7236a3','photo-1590283603385-17ffb3a7f29f','photo-1579532537598-459ecdaf39cc','photo-1460925895917-afdab827c52f'],
  StockMarket:   ['photo-1611974789855-9c2a0a7236a3','photo-1590283603385-17ffb3a7f29f','photo-1535320903710-d993d3d77d29','photo-1642543348745-03b1219733d9'],
  MutualFunds:   ['photo-1579532537598-459ecdaf39cc','photo-1460925895917-afdab827c52f','photo-1611974789855-9c2a0a7236a3','photo-1590283603385-17ffb3a7f29f'],
  Crypto:        ['photo-1518546305927-5a555bb7020d','photo-1622630998477-20aa696ecb05','photo-1639762681485-074b7f938ba0','photo-1642790551116-18e150f248e3'],
  PersonalFinance:['photo-1579621970563-ebec7560ff3e','photo-1450101499163-c8848c66ca85','photo-1554224155-6726b3ff858f','photo-1556742044-3c52d6e88c62'],
  Tech:          ['photo-1677442135703-1787eea5ce01','photo-1518770660439-4636190af475','photo-1531297484001-80022131f5a1','photo-1504384308090-c894fdcc538d'],
  AINews:        ['photo-1677442135703-1787eea5ce01','photo-1620712943543-bcc4688e7485','photo-1655720828018-edd2daec9349','photo-1676401869516-7e935b3fec35'],
  Sports:        ['photo-1540747913346-19e32dc3e97e','photo-1461896836934-ffe607ba8211','photo-1517649763962-0c623066013b','photo-1574629810360-7efbbe195018'],
  Bollywood:     ['photo-1489599849927-2ee91cede3ba','photo-1478720568477-152d9b164e26','photo-1524985069026-dd778a71c7b4','photo-1615986201152-7686a4867f30'],
  Business:      ['photo-1507003211169-0a1dd7228f2d','photo-1454165804606-c3d57bc86b40','photo-1486406146926-c627a92ad1ab','photo-1664575600796-ffa828c5cb6e'],
  Fitness:       ['photo-1534438327276-14e5300c3a48','photo-1571019613454-1cb2f99b2d8b','photo-1517836357463-d25dfeac3438','photo-1490645935967-10de6ba17061'],
  WeightLoss:    ['photo-1571019613454-1cb2f99b2d8b','photo-1534438327276-14e5300c3a48','photo-1490645935967-10de6ba17061','photo-1544367567-0f2fcb009e0b'],
  Travel:        ['photo-1476514525535-07fb3b4ae5f1','photo-1501854140801-50d01698950b','photo-1488646953014-85cb44e25828','photo-1503220317375-aaad61436b1b'],
  Food:          ['photo-1504674900247-0877df9cc836','photo-1546069901-ba9599a7e63c','photo-1555396273-367ea4eb4db5','photo-1565299624946-b28f40a0ae38'],
  Gaming:        ['photo-1542751371-adc38448a05e','photo-1493711662062-fa541adb3fc8','photo-1559963110-71b394e7494d','photo-1518644961665-ed172691aaa1'],
  Education:     ['photo-1503676260728-1c00da094a0b','photo-1456513080510-7bf3a84b82f8','photo-1522202176988-66273c2fd55f','photo-1571260899304-425eee4c7efc'],
  Fashion:       ['photo-1558618666-fcd25c85cd64','photo-1469334031218-e382a71b716b','photo-1483985988355-763728e1935b','photo-1445205170230-053b83016050'],
  Motivation:    ['photo-1519834785169-98be25ec3f84','photo-1499728603263-13726abce5fd','photo-1548506651-e329ed07a75f','photo-1593642632559-0c6d3fc62b89'],
  Skincare:      ['photo-1556228578-0d85b1a4d571','photo-1596755389378-c31d21fd1273','photo-1570172619644-dfd03ed5d881','photo-1552693673-1bf958298935'],
  Yoga:          ['photo-1506126613408-eca07ce68773','photo-1545205597-3d9d02c29597','photo-1599901860904-17e6ed7083a0','photo-1575052814086-f385e2e2ad1b'],
  Comedy:        ['photo-1527224857830-43a7acc85260','photo-1516280440614-37939bbacd81','photo-1543465077-db45d34b88a5','photo-1489278353717-f64c6ee8a4d2'],
  RealEstate:    ['photo-1560518883-ce09059eeffa','photo-1570129477492-45c003edd2be','photo-1448630360428-65456885c650','photo-1512917774080-9991f1c4c750'],
  Jobs:          ['photo-1507003211169-0a1dd7228f2d','photo-1454165804606-c3d57bc86b40','photo-1521737852567-6949f3f9f2b5','photo-1499750310107-5fef28a66643'],
};

const GENERIC_IMAGES = [
  'photo-1504711434969-e33886168f5c','photo-1495020689067-958852a7765e',
  'photo-1504465073898-4d85a65c61d1','photo-1557858310-9052820906f7',
];

function getCategoryImage(headline: string, topic?: string, seed?: string): string {
  const pool = (topic && TOPIC_IMAGES[topic]) || (() => {
    const h = headline.toLowerCase();
    if (h.includes('cricket') || h.includes('sports') || h.includes('match')) return TOPIC_IMAGES.Sports;
    if (h.includes('fitness') || h.includes('workout')) return TOPIC_IMAGES.Fitness;
    if (h.includes('ai') || h.includes('tech')) return TOPIC_IMAGES.Tech;
    if (h.includes('bollywood') || h.includes('movie')) return TOPIC_IMAGES.Bollywood;
    if (h.includes('travel')) return TOPIC_IMAGES.Travel;
    if (h.includes('food') || h.includes('recipe')) return TOPIC_IMAGES.Food;
    if (h.includes('stock') || h.includes('finance') || h.includes('market')) return TOPIC_IMAGES.Finance;
    if (h.includes('crypto') || h.includes('bitcoin')) return TOPIC_IMAGES.Crypto;
    if (h.includes('gaming') || h.includes('game')) return TOPIC_IMAGES.Gaming;
    return GENERIC_IMAGES;
  })();
  const key = seed || headline;
  const idx = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % pool.length;
  return `https://images.unsplash.com/${pool[idx]}?w=600&auto=format&fit=crop`;
}

const getTimeAgo = (dateStr: string, t: any) => {
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
  if (topic === 'Sports') {
    if (isHigh) return { level: 'high', text: 'Big sports news — perfect timing for reaction/analysis Reels' };
    return { level: 'medium', text: 'Sports update — good for engagement with sports audience' };
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
    Sports: { bg: '#fff3e0', text: '#e65100' },
    Bollywood: { bg: '#fce4ec', text: '#880e4f' },
    Fitness: { bg: '#f3e5f5', text: '#6a1b9a' },
    Gaming: { bg: '#e8eaf6', text: '#283593' },
    Food: { bg: '#fff8e1', text: '#f57f17' },
    Travel: { bg: '#e0f7fa', text: '#006064' },
    Crypto: { bg: '#ede9fe', text: '#4527a0' },
  };
  return colors[topic] || { bg: '#ede9fe', text: '#4527a0' };
};

export default function NewsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
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
  const [activeCategory, setActiveCategory] = useState('All News');
  const [region, setRegion] = useState<'in' | 'global'>('in');
  const [showScrollTop, setShowScrollTop] = useState(false);
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

  const fetchNews = async (filter: string, topicQuery?: string, trending?: string | null, date?: string, regionOverride?: 'in' | 'global') => {
    setLoading(true); setError(null);
    try {
      const activeRegion = regionOverride || region;
      let url = `${BASE}/api/news?filter=${filter}&region=${activeRegion}`;
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
    } catch { setError(t('common.error')); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetch(`${BASE}/api/news?filter=today&region=${region}`)
      .then(r => r.json()).then(data => setAllArticles(Array.isArray(data) ? data : [])).catch(() => {});
  }, [region]);

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

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleRegionChange = (newRegion: 'in' | 'global') => {
    if (newRegion === region) return;
    setRegion(newRegion);
    setTrendingFilter(null); setQuery(''); setSearchInput(''); setCustomDate(null);
    fetchNews(dateFilter, undefined, null, undefined, newRegion);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews(dateFilter, query || undefined, trendingFilter, customDate || undefined);
    setRefreshing(false);
  };

  const handleGenerateScript = (article: NewsArticle) => {
    const headline = article.title || article.headline || '';
    const prompt = `Write a short-form video script based on this news: "${headline}". ${article.summary ? `Context: ${article.summary}` : ''}`;
    navigate('/scripts', { state: { prompt } });
  };

  const impactData = selectedArticle ? getImpact(selectedArticle.topic || '', selectedArticle.summary || '') : null;
  const keyPoints = selectedArticle ? extractKeyPoints(selectedArticle.summary || '') : [];

  const filterLabel = customDate
    ? new Date(customDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : DATE_FILTERS.find(f => f.value === dateFilter)?.label || t('news.today');

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-xl text-[#7C3AED] dark:text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('news.title')}
          </h1>
          {userNiches.length > 0 && !query && !trendingFilter && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
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

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757684]" />
            <input ref={inputRef} type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(searchInput); }}
              onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
              placeholder={t('common.search') + ' topics...'}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#c5c5d4] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-[#191c1d] placeholder:text-[#757684] outline-none text-sm transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20" />
            {searchInput && (
              <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#191c1d]">
                <X className="w-4 h-4" />
              </button>
            )}
            {showDropdown && dropdownSuggestions.length > 0 && (
              <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-[#c5c5d4] dark:border-gray-600 rounded-xl shadow-lg z-50 overflow-hidden">
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
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#c5c5d4] dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-[#454652] dark:text-gray-300 hover:border-[#7C3AED] transition-colors whitespace-nowrap"
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

        {/* Region toggle */}
        <div className="flex gap-1.5">
          <button onClick={() => handleRegionChange('in')}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={region === 'in' ? { background: PRIMARY, color: '#fff' } : { background: '#e7e8e9', color: '#454652' }}>
            🇮🇳 India
          </button>
          <button onClick={() => handleRegionChange('global')}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={region === 'global' ? { background: PRIMARY, color: '#fff' } : { background: '#e7e8e9', color: '#454652' }}>
            🌍 Global
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {trendingTopics.length > 0 ? (
            <>
              <button
                onClick={() => { setTrendingFilter(null); setQuery(''); setSearchInput(''); fetchNews(dateFilter, undefined, null); }}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={!trendingFilter ? { background: PRIMARY, color: '#fff' } : { background: '#e7e8e9', color: '#454652' }}>
                {t('news.all')}
              </button>
              {trendingTopics.map(tt => (
                <button key={tt.topic} onClick={() => handleTrendingFilter(tt.topic)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={trendingFilter === tt.topic ? { background: PRIMARY, color: '#fff' } : { background: '#e7e8e9', color: '#454652' }}>
                  {tt.emoji} {tt.topic}
                </button>
              ))}
            </>
          ) : (
            ['All News', 'Finance', 'Tech', 'Sports', 'Bollywood', 'Fitness'].map(cat => (
              <button key={cat}
                onClick={() => { setActiveCategory(cat); if (cat !== 'All News') handleTrendingFilter(cat); else { setTrendingFilter(null); fetchNews(dateFilter, undefined, null); } }}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={activeCategory === cat ? { background: PRIMARY, color: '#fff' } : { background: '#e7e8e9', color: '#454652' }}>
                {cat}
              </button>
            ))
          )}
        </div>

        {/* Article count */}
        {!loading && (
          <p className="text-xs text-[#757684]">
            <span className="font-semibold" style={{ color: PRIMARY }}>{articles.length}</span> {t('home.articles')}
            {(query || trendingFilter) && <span> for "<span style={{ color: PRIMARY }}>{trendingFilter || query}</span>"</span>}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
            <p className="text-sm text-[#757684]">{t('news.loading')}</p>
          </div>
        )}

        {error && <div className="text-center py-16 text-red-500 text-sm">{error}</div>}

        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: PRIMARY_CONTAINER }}>📰</div>
            <p className="font-semibold text-[#191c1d] dark:text-white">{t('news.no_news')}</p>
            <p className="text-sm text-[#757684]">Fresh news will appear here soon</p>
            <button onClick={() => { setCustomDate(null); setTrendingFilter(null); handleDateFilter('all'); }}
              className="text-sm px-5 py-2.5 rounded-full text-white font-semibold mt-1"
              style={{ background: PRIMARY_GRAD }}>
              Show All News
            </button>
          </div>
        )}

        {/* Articles */}
        {!loading && !error && articles.length > 0 && (
          <div className="flex flex-col gap-4">
            {articles.map((item, i) => {
              const headline = item.title || item.headline || "Untitled";
              const timeAgo = getTimeAgo(item.published_at || '', t);
              const topic = item.topic || '';
              const tagStyle = getTagStyle(topic);
              const isFeatured = i === 0;

              if (isFeatured) {
                return (
                  <motion.article key={item.id || i}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-[#e1e3e4] dark:border-gray-700 cursor-pointer transition-transform active:scale-[0.98]"
                    onClick={() => setSelectedArticle(item)}>
                    <div className="relative h-52 w-full">
                      <img src={item.image_url || getCategoryImage(headline, topic, item.id)} alt={headline}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline, topic, item.id); }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {topic && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase" style={{ background: SECONDARY_CONTAINER, color: '#491d8a' }}>
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
                      {item.summary && <p className="text-sm text-[#454652] dark:text-gray-300 line-clamp-2">{item.summary}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: PRIMARY }}>
                          <Sparkles className="w-3 h-3" /> View Insights
                        </span>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleGenerateScript(item)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
                            <FileText className="w-4 h-4" style={{ color: '#757684' }} />
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

              return (
                <motion.article key={item.id || i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(36,56,156,0.12)' }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-[#e1e3e4] dark:border-gray-700 cursor-pointer transition-all duration-300 group"
                  onClick={() => setSelectedArticle(item)}>
                  <div className="flex gap-0 p-4 group-hover:hidden">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        {topic && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: tagStyle.bg, color: tagStyle.text }}>
                            {TOPIC_EMOJIS[topic] || '📰'} {topic}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-[#191c1d] dark:text-white leading-snug line-clamp-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {headline}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{item.source}</span>
                          <span className="text-[#757684] text-[10px]">• {timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleGenerateScript(item)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
                            <FileText className="w-3.5 h-3.5" style={{ color: '#757684' }} />
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
                      <img src={item.image_url || getCategoryImage(headline, topic, item.id)} alt=""
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline, topic, item.id); }} />
                    </div>
                  </div>
                  <div className="hidden group-hover:block">
                    <div className="relative h-40 w-full">
                      <img src={item.image_url || getCategoryImage(headline, topic, item.id)} alt={headline}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline, topic, item.id); }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {topic && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase" style={{ background: SECONDARY_CONTAINER, color: '#491d8a' }}>
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
                      <h3 className="font-bold text-base text-[#191c1d] dark:text-white leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>{headline}</h3>
                      {item.summary && <p className="text-sm text-[#454652] dark:text-gray-300 line-clamp-3 leading-relaxed">{item.summary}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: PRIMARY }}>
                          <Sparkles className="w-3 h-3" /> Tap for insights
                        </span>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleGenerateScript(item)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
                            <FileText className="w-3.5 h-3.5" style={{ color: '#757684' }} />
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

      {/* Article Detail Popup */}
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
              <div className="relative h-44">
                <img src={selectedArticle.image_url || getCategoryImage(selectedArticle.title || selectedArticle.headline || '', selectedArticle.topic, selectedArticle.id)}
                  alt="" className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(selectedArticle.title || selectedArticle.headline || '', selectedArticle.topic, selectedArticle.id); }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60">
                  <X className="w-4 h-4" />
                </button>
                {selectedArticle.topic && (
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase text-white" style={{ background: SECONDARY }}>
                      {TOPIC_EMOJIS[selectedArticle.topic] || '📰'} {selectedArticle.topic}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                <h2 className="font-bold text-lg text-[#191c1d] dark:text-white leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {selectedArticle.title || selectedArticle.headline}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#757684]">
                  {selectedArticle.source && <span className="font-semibold" style={{ color: PRIMARY }}>{selectedArticle.source}</span>}
                  {selectedArticle.published_at && <span>{getTimeAgo(selectedArticle.published_at, t)}</span>}
                </div>
                {keyPoints.length > 0 && (
                  <div className="rounded-xl p-4 space-y-2.5" style={{ background: '#ede9fe' }}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: SECONDARY }} />
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: SECONDARY }}>Key Highlights</p>
                    </div>
                    {keyPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: SECONDARY }} />
                        <p className="text-sm leading-relaxed" style={{ color: '#000000' }}>{point}.</p>
                      </div>
                    ))}
                  </div>
                )}
                {keyPoints.length === 0 && selectedArticle.summary && (
                  <p className="text-sm text-[#454652] dark:text-gray-300 leading-relaxed">{selectedArticle.summary}</p>
                )}
                {impactData && (
                  <div className="rounded-xl p-4"
                    style={{ background: impactData.level === 'high' ? '#fff3e0' : impactData.level === 'medium' ? '#e8f5e9' : '#f3e5f5', border: `1px solid ${impactData.level === 'high' ? '#ffcc80' : impactData.level === 'medium' ? '#a5d6a7' : '#ce93d8'}` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {impactData.level === 'high' ? <AlertTriangle className="w-4 h-4 text-orange-500" />
                        : impactData.level === 'medium' ? <TrendingUp className="w-4 h-4 text-green-600" />
                        : <ArrowUpRight className="w-4 h-4 text-purple-600" />}
                      <p className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: impactData.level === 'high' ? '#e65100' : impactData.level === 'medium' ? '#2e7d32' : '#6a1b9a' }}>
                        {impactData.level === 'high' ? '🔥 High Impact' : impactData.level === 'medium' ? '📈 Medium Impact' : '✅ Low Impact'} for Creators
                      </p>
                    </div>
                    <p className="text-sm" style={{ color: impactData.level === 'high' ? '#bf360c' : impactData.level === 'medium' ? '#1b5e20' : '#4a148c' }}>
                      {impactData.text}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleGenerateScript(selectedArticle)}
                    className="flex-1 py-2.5 rounded-xl border border-[#c5c5d4] text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-[#454652]">
                    <FileText className="w-4 h-4" />
                    Generate Script
                  </button>
                  {selectedArticle.url && (
                    <button onClick={() => window.open(selectedArticle.url, '_blank')}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                      style={{ background: PRIMARY_GRAD }}>
                      {t('news.read_more')} <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: PRIMARY }}>
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}