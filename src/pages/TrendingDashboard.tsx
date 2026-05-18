import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, TrendingUp, Flame, RefreshCw, ChevronRight, Sparkles, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PRIMARY = "#7C3AED";
const SECONDARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #7C3AED)";
const PRIMARY_CONTAINER = "#ede9fe";
const SECONDARY_CONTAINER = "#ede9fe";
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
  { bg: SECONDARY_CONTAINER, text: SECONDARY },
  { bg: '#e8f5e9', text: '#2e7d32' },
  { bg: '#fff3e0', text: '#e65100' },
  { bg: '#fce4ec', text: '#880e4f' },
  { bg: '#e3f2fd', text: '#1565c0' },
];

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

  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE}/api/news?filter=today`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // Trending topics
      const counts: Record<string, number> = {};
      list.forEach((a: any) => { if (a.topic) counts[a.topic] = (counts[a.topic] || 0) + 1; });
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([topic, count], i) => ({ topic, count, emoji: TOPIC_EMOJIS[topic] || '📰', rank: i + 1 }));

      setTrending(sorted);
      setNews(list.slice(0, 6));

      // Content ideas based on trending
      const topTopics = sorted.slice(0, 4);
      const generatedIdeas = topTopics.flatMap(t => [
        { title: `Top 5 ${t.topic} tips for 2026`, tag: 'EDUCATIONAL', tagColor: SECONDARY_CONTAINER, tagText: SECONDARY, topic: t.topic },
        { title: `React to: Latest ${t.topic} news`, tag: 'TRENDING', tagColor: '#fff3e0', tagText: '#e65100', topic: t.topic },
      ]);
      setIdeas(generatedIdeas.slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

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
        <h1 className="font-bold text-xl text-[#7C3AED] dark:text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
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
            placeholder="Search trending topics..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#c5c5d4] bg-white dark:bg-gray-800 dark:border-gray-600 text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none text-sm focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={activeFilter === f ? { background: PRIMARY_GRAD, color: '#fff' } : { background: '#e7e8e9', color: '#454652' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Viral Hashtags */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Viral Topics
            </h2>
            <span className="text-xs font-bold" style={{ color: PRIMARY }}>{filteredTrending.length} topics</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-4 border border-[#e1e3e4] animate-pulse h-24" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredTrending.slice(0, 8).map((t, i) => {
                const colorStyle = HASHTAG_COLORS[i % HASHTAG_COLORS.length];
                return (
                  <motion.button key={t.topic}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate('/news')}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700 text-left hover:shadow-md transition-all active:scale-[0.98]">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{t.emoji}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: colorStyle.bg, color: colorStyle.text }}>
                        #{t.rank}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t.topic}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" style={{ color: colorStyle.text }} />
                      <span className="text-xs font-semibold" style={{ color: colorStyle.text }}>{t.count} articles</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>

        {/* Content Ideas */}
        {ideas.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Content Ideas For You
              </h2>
            </div>
            <div className="space-y-3">
              {ideas.map((idea, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                    style={{ background: SECONDARY_CONTAINER }}>
                    {TOPIC_EMOJIS[idea.topic] || '💡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: idea.tagColor, color: idea.tagText }}>
                        {idea.tag}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-[#191c1d] dark:text-white leading-snug">{idea.title}</p>
                  </div>
                  <button onClick={() => navigate('/scripts')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors hover:opacity-80"
                    style={{ background: PRIMARY_GRAD }}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Latest News */}
        {news.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Trending News
              </h2>
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded mb-1.5 inline-block"
                        style={{ background: SECONDARY_CONTAINER, color: SECONDARY }}>
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
      </main>
    </div>
  );
}
