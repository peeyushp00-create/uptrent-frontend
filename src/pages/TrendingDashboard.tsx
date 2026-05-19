import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Flame, RefreshCw, ChevronRight, Sparkles, ExternalLink, X } from "lucide-react";
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

const HASHTAG_COLORS = [
  { bg: PRIMARY_CONTAINER, text: PRIMARY },
  { bg: '#e8f5e9', text: '#2e7d32' },
  { bg: '#fff3e0', text: '#e65100' },
  { bg: '#fce4ec', text: '#880e4f' },
  { bg: '#e3f2fd', text: '#1565c0' },
  { bg: '#f3e5f5', text: '#6a1b9a' },
];

// Micro niches for each main niche
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

// Find micro niches for search query
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
  const [microResult, setMicroResult] = useState<{ niche: string; niches: { name: string; hashtag: string; hot: boolean }[] } | null>(null);

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
        { title: `Top 5 ${t.topic} tips for 2026`, tag: 'EDUCATIONAL', tagColor: PRIMARY_CONTAINER, tagText: PRIMARY, topic: t.topic },
        { title: `React to: Latest ${t.topic} news`, tag: 'TRENDING', tagColor: '#fff3e0', tagText: '#e65100', topic: t.topic },
      ]);
      setIdeas(generatedIdeas.slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  // Handle search
  useEffect(() => {
    if (search.trim().length >= 2) {
      const result = findMicroNiches(search);
      setMicroResult(result);
    } else {
      setMicroResult(null);
    }
  }, [search]);

  const filteredTrending = trending.filter(t =>
    (activeFilter === 'All' || t.topic === activeFilter) &&
    (search === '' || t.topic.toLowerCase().includes(search.toLowerCase()))
  );

  const filters = ['All', ...userNiches.slice(0, 5)];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center justify-between">
        <h1 className="font-bold text-xl dark:text-white" style={{ color: PRIMARY }}>
          Discovery
        </h1>
        <button onClick={handleRefresh} disabled={refreshing}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors disabled:opacity-40">
          <RefreshCw className={`w-5 h-5 text-[#757684] ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-6">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757684]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search a niche (e.g. Finance, Cricket, Fitness)..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#c5c5d4] bg-white dark:bg-gray-800 dark:border-gray-600 text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none text-sm transition-all"
            style={{ borderColor: search ? PRIMARY : undefined, boxShadow: search ? `0 0 0 3px ${PRIMARY}15` : undefined }} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#191c1d]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── MICRO NICHES VIEW (when searching) ── */}
        <AnimatePresence mode="wait">
          {microResult ? (
            <motion.div key="micro" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: PRIMARY_CONTAINER }}>
                  {TOPIC_EMOJIS[microResult.niche.charAt(0).toUpperCase() + microResult.niche.slice(1)] || '🔍'}
                </div>
                <div>
                  <p className="font-bold text-sm text-[#191c1d] dark:text-white capitalize">{microResult.niche} — Micro Niches</p>
                  <p className="text-xs text-[#757684]">Tap any to generate a script</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {microResult.niches.map((niche, i) => (
                  <motion.button key={niche.name}
                    initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate('/scripts', { state: { topic: niche.name } })}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 border text-left hover:shadow-md transition-all active:scale-[0.98] relative overflow-hidden"
                    style={{ borderColor: niche.hot ? `${PRIMARY}40` : '#e1e3e4' }}>
                    {niche.hot && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ background: 'linear-gradient(135deg, #ff6b35, #f7c59f)', color: '#7c2d12' }}>
                        🔥 HOT
                      </div>
                    )}
                    <p className="font-bold text-sm text-[#191c1d] dark:text-white mb-1">{niche.name}</p>
                    <p className="text-xs font-medium" style={{ color: PRIMARY }}>{niche.hashtag}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {niche.hot ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                          📈 Trending
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f3f4f5] text-[#757684]">
                          Stable
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Quick script button */}
              <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
                onClick={() => navigate('/scripts', { state: { topic: microResult.niche } })}
                className="w-full mt-4 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: PRIMARY_GRAD }}>
                <Sparkles className="w-4 h-4" />
                Generate Script for {microResult.niche.charAt(0).toUpperCase() + microResult.niche.slice(1)}
              </motion.button>
            </motion.div>

          ) : (
            <motion.div key="trending" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-6">

              {/* Filter chips */}
              {filters.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {filters.map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)}
                      className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                      style={activeFilter === f ? { background: PRIMARY_GRAD, color: '#fff' } : { background: '#e7e8e9', color: '#454652' }}>
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {/* Viral Topics */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white">
                    🔥 Trending Right Now
                  </h2>
                  <span className="text-xs font-bold" style={{ color: PRIMARY }}>{filteredTrending.length} topics</span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-4 border border-[#e1e3e4] animate-pulse h-24" />)}
                  </div>
                ) : filteredTrending.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredTrending.slice(0, 8).map((t, i) => {
                      const colorStyle = HASHTAG_COLORS[i % HASHTAG_COLORS.length];
                      return (
                        <motion.button key={t.topic}
                          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => setSearch(t.topic)}
                          className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700 text-left hover:shadow-md transition-all active:scale-[0.98]">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-2xl">{t.emoji}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: colorStyle.bg, color: colorStyle.text }}>
                              #{t.rank}
                            </span>
                          </div>
                          <p className="font-bold text-sm text-[#191c1d] dark:text-white">{t.topic}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3" style={{ color: colorStyle.text }} />
                            <span className="text-xs font-semibold" style={{ color: colorStyle.text }}>{t.count} articles</span>
                          </div>
                          <p className="text-[10px] text-[#757684] mt-1.5">Tap to see micro niches →</p>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[#757684] text-sm">No trending topics found</div>
                )}
              </section>

              {/* Content Ideas */}
              {ideas.length > 0 && (
                <section>
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white mb-3">💡 Content Ideas For You</h2>
                  <div className="space-y-3">
                    {ideas.map((idea, i) => (
                      <motion.div key={i}
                        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ background: PRIMARY_CONTAINER }}>
                          {TOPIC_EMOJIS[idea.topic] || '💡'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-1.5" style={{ background: idea.tagColor, color: idea.tagText }}>
                            {idea.tag}
                          </span>
                          <p className="font-semibold text-sm text-[#191c1d] dark:text-white leading-snug">{idea.title}</p>
                        </div>
                        <button onClick={() => navigate('/scripts')}
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 hover:opacity-80 transition-all"
                          style={{ background: PRIMARY_GRAD }}>
                          <Sparkles className="w-4 h-4 text-white" />
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
                    <h2 className="font-bold text-base text-[#191c1d] dark:text-white">Trending News</h2>
                    <button onClick={() => navigate('/news')} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {news.slice(0, 4).map((item, i) => (
                      <button key={i} onClick={() => navigate('/news')}
                        className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition-all text-left active:scale-[0.98]">
                        <div className="flex-1 min-w-0">
                          {item.topic && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded mb-1.5 inline-block" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
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