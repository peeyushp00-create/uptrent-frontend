import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, RefreshCw, ChevronRight, Sparkles, ExternalLink, X, Flame, ArrowUpRight, Zap, BarChart2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PRIMARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #6D28D9)";
const PRIMARY_CONTAINER = "#ede9fe";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const TOPIC_EMOJIS: Record<string, string> = {
  Finance: "📈", StockMarket: "📊", MutualFunds: "💰", Crypto: "🪙",
  Tech: "💻", AINews: "🤖", Cricket: "🏏", IPL: "🏆", Bollywood: "🎬",
  Business: "💼", Fitness: "💪", Travel: "✈️", Food: "🍳", Gaming: "🎮",
  Education: "📚", Fashion: "👗", Motivation: "🚀", Skincare: "✨",
  Yoga: "🧘", Comedy: "😂", RealEstate: "🏠",
};

const MICRO_NICHES: Record<string, { name: string; hashtag: string; hot: boolean }[]> = {
  finance: [
    { name: 'Mutual Funds', hashtag: '#MutualFunds', hot: true },
    { name: 'SIP Investing', hashtag: '#SIP', hot: true },
    { name: 'Stock Market', hashtag: '#StockMarket', hot: true },
    { name: 'IPO', hashtag: '#IPO', hot: false },
    { name: 'Crypto', hashtag: '#Crypto', hot: false },
    { name: 'Personal Finance', hashtag: '#PersonalFinance', hot: true },
    { name: 'Tax Saving', hashtag: '#TaxSaving', hot: false },
    { name: 'Real Estate', hashtag: '#RealEstate', hot: false },
  ],
  fitness: [
    { name: 'Home Workout', hashtag: '#HomeWorkout', hot: true },
    { name: 'Weight Loss', hashtag: '#WeightLoss', hot: true },
    { name: 'Yoga', hashtag: '#Yoga', hot: true },
    { name: 'Muscle Building', hashtag: '#GymLife', hot: false },
    { name: 'HIIT Training', hashtag: '#HIIT', hot: false },
    { name: 'Diet & Nutrition', hashtag: '#HealthyEating', hot: true },
    { name: 'Running', hashtag: '#Running', hot: false },
    { name: 'Calisthenics', hashtag: '#Calisthenics', hot: false },
  ],
  cricket: [
    { name: 'IPL 2026', hashtag: '#IPL2026', hot: true },
    { name: 'Virat Kohli', hashtag: '#Kohli', hot: true },
    { name: 'India vs Pakistan', hashtag: '#INDvPAK', hot: true },
    { name: 'T20 Cricket', hashtag: '#T20', hot: false },
    { name: 'Fantasy Cricket', hashtag: '#FantasyCricket', hot: true },
    { name: 'Rohit Sharma', hashtag: '#HitMan', hot: false },
    { name: 'Test Cricket', hashtag: '#TestCricket', hot: false },
    { name: 'Women Cricket', hashtag: '#WomenCricket', hot: false },
  ],
  tech: [
    { name: 'AI Tools', hashtag: '#AITools', hot: true },
    { name: 'ChatGPT', hashtag: '#ChatGPT', hot: true },
    { name: 'Coding Tips', hashtag: '#Coding', hot: false },
    { name: 'Smartphone Review', hashtag: '#TechReview', hot: true },
    { name: 'Electric Vehicles', hashtag: '#EV', hot: true },
    { name: 'Startups', hashtag: '#Startup', hot: false },
    { name: 'Cybersecurity', hashtag: '#CyberSecurity', hot: false },
    { name: 'Web Development', hashtag: '#WebDev', hot: false },
  ],
  bollywood: [
    { name: 'Box Office', hashtag: '#BoxOffice', hot: true },
    { name: 'Movie Reviews', hashtag: '#MovieReview', hot: true },
    { name: 'OTT Releases', hashtag: '#OTT', hot: true },
    { name: 'Celebrity News', hashtag: '#BollywoodGossip', hot: true },
    { name: 'Web Series', hashtag: '#WebSeries', hot: false },
    { name: 'Music Album', hashtag: '#NewMusic', hot: false },
    { name: 'Award Shows', hashtag: '#Awards', hot: false },
    { name: 'Upcoming Movies', hashtag: '#ComingSoon', hot: false },
  ],
  gaming: [
    { name: 'BGMI', hashtag: '#BGMI', hot: true },
    { name: 'Free Fire', hashtag: '#FreeFire', hot: true },
    { name: 'GTA 5', hashtag: '#GTA5', hot: false },
    { name: 'Minecraft', hashtag: '#Minecraft', hot: false },
    { name: 'Valorant', hashtag: '#Valorant', hot: true },
    { name: 'Esports', hashtag: '#Esports', hot: true },
    { name: 'Gaming Setup', hashtag: '#GamingSetup', hot: false },
    { name: 'Mobile Gaming', hashtag: '#MobileGaming', hot: false },
  ],
  food: [
    { name: 'Street Food', hashtag: '#StreetFood', hot: true },
    { name: 'Biryani', hashtag: '#Biryani', hot: true },
    { name: 'Healthy Recipes', hashtag: '#HealthyFood', hot: true },
    { name: 'Vegan Food', hashtag: '#Vegan', hot: false },
    { name: 'Desserts', hashtag: '#Desserts', hot: false },
    { name: 'Quick Recipes', hashtag: '#QuickRecipes', hot: true },
    { name: 'Restaurant Review', hashtag: '#FoodReview', hot: false },
    { name: 'Meal Prep', hashtag: '#MealPrep', hot: false },
  ],
  travel: [
    { name: 'Goa', hashtag: '#Goa', hot: true },
    { name: 'Manali', hashtag: '#Manali', hot: true },
    { name: 'Kerala', hashtag: '#Kerala', hot: false },
    { name: 'Budget Travel', hashtag: '#BudgetTravel', hot: true },
    { name: 'International Travel', hashtag: '#Travel', hot: false },
    { name: 'Solo Travel', hashtag: '#SoloTravel', hot: true },
    { name: 'Road Trip', hashtag: '#RoadTrip', hot: false },
    { name: 'Himachal Pradesh', hashtag: '#Himachal', hot: true },
  ],
  motivation: [
    { name: 'Morning Routine', hashtag: '#MorningRoutine', hot: true },
    { name: 'Self Improvement', hashtag: '#SelfImprovement', hot: true },
    { name: 'Mindset', hashtag: '#Mindset', hot: true },
    { name: 'Atomic Habits', hashtag: '#AtomicHabits', hot: false },
    { name: 'Study Tips', hashtag: '#StudyTips', hot: true },
    { name: 'Stoicism', hashtag: '#Stoicism', hot: false },
    { name: 'Goal Setting', hashtag: '#Goals', hot: false },
    { name: 'Discipline', hashtag: '#Discipline', hot: true },
  ],
  skincare: [
    { name: 'Acne Treatment', hashtag: '#AcneCare', hot: true },
    { name: 'Glass Skin', hashtag: '#GlassSkin', hot: true },
    { name: 'Sunscreen', hashtag: '#Sunscreen', hot: true },
    { name: 'Night Routine', hashtag: '#NightRoutine', hot: false },
    { name: 'Korean Beauty', hashtag: '#KBeauty', hot: true },
    { name: 'Anti Aging', hashtag: '#AntiAging', hot: false },
    { name: 'Budget Skincare', hashtag: '#BudgetSkincare', hot: false },
    { name: 'Oily Skin', hashtag: '#OilySkin', hot: false },
  ],
};

const findMicroNiches = (query: string) => {
  const q = query.toLowerCase().trim();
  for (const [key, niches] of Object.entries(MICRO_NICHES)) {
    if (key.includes(q) || q.includes(key) ||
      niches.some(n => n.name.toLowerCase().includes(q) || n.hashtag.toLowerCase().includes(q))) {
      return { niche: key, niches };
    }
  }
  return null;
};

const StrengthBadge = ({ strength }: { strength: string }) => {
  const config: Record<string, { color: string; bg: string; icon: string }> = {
    Viral:  { color: '#dc2626', bg: '#fee2e2', icon: '🔥' },
    Rising: { color: '#7C3AED', bg: '#ede9fe', icon: '📈' },
    Steady: { color: '#059669', bg: '#d1fae5', icon: '✅' },
    Fading: { color: '#757684', bg: '#f3f4f5', icon: '📉' },
  };
  const c = config[strength] || config.Steady;
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.color }}>
      {c.icon} {strength}
    </span>
  );
};

export default function TrendingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userNiches: string[] = user?.user_metadata?.niches || (user?.user_metadata?.niche ? [user.user_metadata.niche] : []);

  const [trending, setTrending] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [microResult, setMicroResult] = useState<any>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [instagramTopics, setInstagramTopics] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE}/api/news?filter=today`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const counts: Record<string, number> = {};
      list.forEach((a: any) => { if (a.topic) counts[a.topic] = (counts[a.topic] || 0) + 1; });
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([topic, count], i) => ({ topic, count, emoji: TOPIC_EMOJIS[topic] || '📰', rank: i + 1 }));
      setTrending(sorted);
      setNews(list.slice(0, 6));
      const topTopics = sorted.slice(0, 4);
      const generatedIdeas = topTopics.flatMap(t => [
        { title: `Top 5 ${t.topic} tips for 2026`, tag: 'EDUCATIONAL', topic: t.topic },
        { title: `React to: Latest ${t.topic} news`, tag: 'TRENDING', topic: t.topic },
      ]);
      setIdeas(generatedIdeas.slice(0, 6));
      const topicsRes = await fetch(`${BASE}/api/topics?type=instagram`);
      const topicsData = await topicsRes.json();
      if (Array.isArray(topicsData)) setInstagramTopics(topicsData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchTrendAnalysis = async (topic: string) => {
    setAnalysisLoading(true);
    setTrendAnalysis(null);
    try {
      const res = await fetch(`${BASE}/api/topics/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!data.error) {
        setTrendAnalysis(data);
        if (data.micro_niches?.length > 0) setMicroResult({ niche: topic, niches: data.micro_niches });
      }
    } catch (e) { console.error(e); }
    finally { setAnalysisLoading(false); }
  };

  useEffect(() => {
    if (search.trim().length >= 2) {
      const result = findMicroNiches(search);
      setMicroResult(result);
      fetchTrendAnalysis(search.trim());
    } else {
      setMicroResult(null);
      setTrendAnalysis(null);
    }
  }, [search]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };
  const filteredTrending = trending.filter(t =>
    (activeFilter === 'All' || t.topic === activeFilter) &&
    (search === '' || t.topic.toLowerCase().includes(search.toLowerCase()))
  );
  const filters = ['All', ...userNiches.slice(0, 5)];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5" style={{ color: PRIMARY }} />
          <h1 className="font-bold text-xl dark:text-white" style={{ color: PRIMARY, fontFamily:'Roboto,sans-serif' }}>Discovery</h1>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors disabled:opacity-40">
          <RefreshCw className={`w-5 h-5 text-[#757684] ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-5">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757684]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search any niche — Finance, Cricket, Fitness..."
            className="w-full pl-10 pr-10 py-3.5 rounded-2xl border bg-white dark:bg-gray-800 dark:border-gray-600 text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none text-sm transition-all"
            style={{ borderColor: search ? PRIMARY : '#e1e3e4', boxShadow: search ? `0 0 0 3px ${PRIMARY}15` : 'none', fontFamily:'Roboto,sans-serif' }} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── SEARCH RESULTS VIEW ── */}
          {search.trim().length >= 2 ? (
            <motion.div key="search" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-4">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white capitalize" style={{ fontFamily:'Roboto,sans-serif' }}>
                    "{search}" Analysis
                  </h2>
                  <p className="text-xs text-[#757684]">AI-powered trend intelligence</p>
                </div>
                {trendAnalysis && <StrengthBadge strength={trendAnalysis.trend_strength} />}
              </div>

              {/* Loading skeleton */}
              {analysisLoading && (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] animate-pulse">
                      <div className="h-3 bg-[#e7e8e9] rounded w-1/3 mb-3" />
                      <div className="h-4 bg-[#e7e8e9] rounded w-full mb-2" />
                      <div className="h-4 bg-[#e7e8e9] rounded w-2/3" />
                    </div>
                  ))}
                </div>
              )}

              {trendAnalysis && !analysisLoading && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-3">

                  {/* Why trending — hero card */}
                  <div className="rounded-2xl p-4 text-white" style={{ background: PRIMARY_GRAD }}>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">📣 Why It's Trending</p>
                    <p className="text-sm leading-relaxed font-medium">{trendAnalysis.why_trending}</p>
                    {trendAnalysis.trend_origin && (
                      <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                        <span className="text-xs opacity-70">📌 Started by:</span>
                        <span className="text-xs font-bold">{trendAnalysis.trend_origin}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-[#e1e3e4] text-center">
                      <p className="text-xs text-[#757684] mb-1">Opportunity</p>
                      <p className="font-bold text-lg" style={{ color: PRIMARY }}>{trendAnalysis.content_opportunity}<span className="text-xs text-[#757684]">/10</span></p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-[#e1e3e4] text-center">
                      <p className="text-xs text-[#757684] mb-1">Peak Time</p>
                      <p className="font-bold text-xs text-[#191c1d] dark:text-white leading-tight">{trendAnalysis.peak_time?.split(' ').slice(0,3).join(' ')}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-[#e1e3e4] text-center">
                      <p className="text-xs text-[#757684] mb-1">Audience</p>
                      <p className="font-bold text-xs text-[#191c1d] dark:text-white leading-tight line-clamp-2">{trendAnalysis.target_audience?.split(' ').slice(0,3).join(' ')}</p>
                    </div>
                  </div>

                  {/* Best angle */}
                  {trendAnalysis.script_angle && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700">
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>🎯 Best Content Angle</p>
                      <p className="text-sm font-semibold text-[#191c1d] dark:text-white leading-relaxed">{trendAnalysis.script_angle}</p>
                      <button onClick={() => navigate('/scripts', { state: { topic: search } })}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white"
                        style={{ background: PRIMARY_GRAD }}>
                        <Sparkles className="w-3.5 h-3.5" /> Write Script on This
                      </button>
                    </div>
                  )}

                  {/* Micro niches — horizontal scroll pills */}
                  {microResult?.niches?.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700">
                      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: PRIMARY }}>🔍 Micro Niches</p>
                      <div className="space-y-2">
                        {microResult.niches.map((niche: any, i: number) => (
                          <motion.button key={niche.name}
                            initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => navigate('/scripts', { state: { topic: niche.name } })}
                            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all hover:shadow-sm"
                            style={{ background: niche.hot ? PRIMARY_CONTAINER : '#f8f9fa' }}>
                            <div className="flex items-center gap-2">
                              {niche.hot && <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                              <span className="text-sm font-semibold text-[#191c1d] dark:text-white">{niche.name}</span>
                              <span className="text-xs text-[#757684]">{niche.hashtag}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={niche.hot ? { background: '#ff6b3520', color: '#ea580c' } : { background: '#e7e8e9', color: '#757684' }}>
                                {niche.hot ? 'Trending' : 'Stable'}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#757684]" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content types + hashtags side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    {trendAnalysis.best_content_types?.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-[#e1e3e4] dark:border-gray-700">
                        <p className="text-xs font-bold mb-2 text-[#191c1d] dark:text-white">🎬 Content Types</p>
                        <div className="space-y-1">
                          {trendAnalysis.best_content_types.map((t: string) => (
                            <div key={t} className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRIMARY }} />
                              <span className="text-xs text-[#454652] dark:text-gray-300">{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {trendAnalysis.key_hashtags?.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-[#e1e3e4] dark:border-gray-700">
                        <p className="text-xs font-bold mb-2 text-[#191c1d] dark:text-white">🏷️ Hashtags</p>
                        <div className="space-y-1">
                          {trendAnalysis.key_hashtags.slice(0,5).map((h: string) => (
                            <div key={h} className="text-xs font-medium" style={{ color: PRIMARY }}>{h}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top creators */}
                  {trendAnalysis.top_creators?.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700">
                      <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#191c1d] dark:text-white">⭐ Top Creators</p>
                      <div className="flex flex-wrap gap-2">
                        {trendAnalysis.top_creators.map((c: string) => (
                          <span key={c} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#f3f4f5] dark:bg-gray-700 text-[#454652] dark:text-gray-300">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background: PRIMARY_GRAD }}>
                              {c.replace('@','')[0]?.toUpperCase()}
                            </div>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What to avoid */}
                  {trendAnalysis.avoid && (
                    <div className="rounded-2xl p-4 border border-red-100 dark:border-red-900/20 bg-red-50 dark:bg-red-900/10">
                      <p className="text-xs font-bold text-red-600 mb-1.5">⚠️ What to Avoid</p>
                      <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">{trendAnalysis.avoid}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

          ) : (
            /* ── DEFAULT VIEW ── */
            <motion.div key="default" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-5">

              {/* Filter chips */}
              {filters.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
                  {filters.map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)}
                      className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                      style={activeFilter === f ? { background: PRIMARY_GRAD, color:'#fff' } : { background:'#e7e8e9', color:'#454652' }}>
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {/* Trending topics — list style */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white flex items-center gap-2" style={{ fontFamily:'Roboto,sans-serif' }}>
                    <Flame className="w-4 h-4 text-orange-500" /> Trending Right Now
                  </h2>
                  <span className="text-xs font-bold" style={{ color: PRIMARY }}>{filteredTrending.length} topics</span>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-2xl p-4 border border-[#e1e3e4] animate-pulse h-16" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTrending.slice(0, 10).map((t, i) => (
                      <motion.button key={t.topic}
                        initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSearch(t.topic)}
                        className="w-full bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition-all text-left hover:border-[#7C3AED]/30">
                        {/* Rank */}
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                          style={{ background: i < 3 ? PRIMARY_GRAD : '#f3f4f5', color: i < 3 ? '#fff' : '#757684' }}>
                          {i + 1}
                        </div>
                        {/* Emoji + name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{t.emoji}</span>
                            <span className="font-bold text-sm text-[#191c1d] dark:text-white">{t.topic}</span>
                            {i < 3 && <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-[#757684] mt-0.5">{t.count} articles today · tap to analyze →</p>
                        </div>
                        {/* Bar */}
                        <div className="w-16 shrink-0">
                          <div className="h-1.5 rounded-full bg-[#e7e8e9] overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (t.count / (trending[0]?.count || 1)) * 100)}%`, background: PRIMARY_GRAD }} />
                          </div>
                        </div>
                        <TrendingUp className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                      </motion.button>
                    ))}
                  </div>
                )}
              </section>

              {/* Instagram trending from Supabase */}
              {instagramTopics.length > 0 && (
                <section>
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white mb-3 flex items-center gap-2" style={{ fontFamily:'Roboto,sans-serif' }}>
                    <span>📸</span> Instagram Trending
                  </h2>
                  <div className="space-y-2">
                    {instagramTopics.slice(0, 5).map((t, i) => (
                      <motion.div key={t.id}
                        initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-[#191c1d] dark:text-white">{t.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                              style={{ background: t.momentum === 'rising' ? PRIMARY_CONTAINER : '#f3f4f5', color: t.momentum === 'rising' ? PRIMARY : '#757684' }}>
                              {t.momentum === 'rising' ? '📈' : t.momentum === 'stable' ? '➡️' : '📉'} {t.momentum}
                            </span>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {t.hashtags?.slice(0,3).map((h: string) => (
                              <span key={h} className="text-[10px] font-medium" style={{ color: PRIMARY }}>{h}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#757684]">{t.volume} posts</span>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Content ideas */}
              {ideas.length > 0 && (
                <section>
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white mb-3 flex items-center gap-2" style={{ fontFamily:'Roboto,sans-serif' }}>
                    <Sparkles className="w-4 h-4" style={{ color: PRIMARY }} /> Content Ideas
                  </h2>
                  <div className="space-y-2">
                    {ideas.map((idea, i) => (
                      <motion.div key={i}
                        initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0" style={{ background: PRIMARY_CONTAINER }}>
                          {TOPIC_EMOJIS[idea.topic] || '💡'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-1"
                            style={{ background: idea.tag === 'TRENDING' ? '#fff3e0' : PRIMARY_CONTAINER, color: idea.tag === 'TRENDING' ? '#e65100' : PRIMARY }}>
                            {idea.tag}
                          </span>
                          <p className="text-sm font-semibold text-[#191c1d] dark:text-white leading-snug">{idea.title}</p>
                        </div>
                        <button onClick={() => navigate('/scripts')}
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GRAD }}>
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending News */}
              {news.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-base text-[#191c1d] dark:text-white flex items-center gap-2" style={{ fontFamily:'Roboto,sans-serif' }}>
                      <span>📰</span> Trending News
                    </h2>
                    <button onClick={() => navigate('/news')} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {news.slice(0, 4).map((item, i) => (
                      <button key={i} onClick={() => navigate('/news')}
                        className="w-full bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition-all text-left">
                        <div className="flex-1 min-w-0">
                          {item.topic && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block"
                              style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                              {TOPIC_EMOJIS[item.topic] || '📰'} {item.topic}
                            </span>
                          )}
                          <p className="text-sm font-semibold text-[#191c1d] dark:text-white line-clamp-2 leading-snug">
                            {item.title || item.headline}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 shrink-0 text-[#757684]" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}