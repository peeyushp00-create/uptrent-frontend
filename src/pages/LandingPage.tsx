import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, FileText, Newspaper, BarChart2, Bell, ChevronRight, Sparkles, ArrowUpRight } from "lucide-react";

const PRIMARY = "#24389c";
const SECONDARY = "#6f48b2";
const PRIMARY_GRAD = "linear-gradient(135deg, #24389c, #6f48b2)";
const PRIMARY_CONTAINER = "#dee0ff";
const SECONDARY_CONTAINER = "#ede7f6";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const QUICK_ACTIONS = [
  { icon: FileText, label: "Generate Script", path: "/scripts", color: PRIMARY, bg: PRIMARY_CONTAINER },
  { icon: Newspaper, label: "News Feed", path: "/news", color: SECONDARY, bg: SECONDARY_CONTAINER },
  { icon: TrendingUp, label: "Trending", path: "/trending", color: "#006928", bg: "#e8f5e9" },
  { icon: BarChart2, label: "Analyzer", path: "/instagram/analyzer", color: "#e65100", bg: "#fff3e0" },
];

const TOPIC_EMOJIS: Record<string, string> = {
  Finance: "📈", StockMarket: "📊", MutualFunds: "💰", Crypto: "🪙",
  Tech: "💻", AINews: "🤖", Cricket: "🏏", IPL: "🏆", Bollywood: "🎬",
  Business: "💼", Fitness: "💪", Travel: "✈️", Food: "🍳", Gaming: "🎮",
  Education: "📚", Fashion: "👗", Motivation: "🚀", Skincare: "✨",
};

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Creator';
  const userNiches: string[] = user?.user_metadata?.niches || (user?.user_metadata?.niche ? [user.user_metadata.niche] : []);

  const [news, setNews] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [scripts, setScripts] = useState<any[]>(() => JSON.parse(localStorage.getItem("ig_script_history") || "[]"));
  const [loadingNews, setLoadingNews] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetch(`${BASE}/api/news?filter=today`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        if (userNiches.length > 0) {
          const filtered = list.filter((a: any) => userNiches.some(n => a.topic?.toLowerCase().includes(n.toLowerCase())));
          setNews(filtered.slice(0, 3).length >= 2 ? filtered.slice(0, 3) : list.slice(0, 3));
        } else {
          setNews(list.slice(0, 3));
        }
        // Compute trending from news
        const counts: Record<string, number> = {};
        list.forEach((a: any) => { if (a.topic) counts[a.topic] = (counts[a.topic] || 0) + 1; });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
        setTrending(sorted.map(([topic, count]) => ({ topic, count })));
      })
      .catch(() => {})
      .finally(() => setLoadingNews(false));
  }, []);

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return 'Yesterday';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center justify-between">
        <h1 className="font-bold text-xl text-[#24389c] dark:text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          SocialRum
        </h1>
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5 text-[#757684]" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-6">

        {/* Greeting */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-[#24389c] dark:text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {greeting}, {userName}! 👋
          </h2>
          <p className="text-sm text-[#757684] mt-1">
            {userNiches.length > 0 ? `Your niches: ${userNiches.slice(0, 3).join(', ')}` : "Let's create some viral content today."}
          </p>
        </motion.section>

        {/* Stats Row */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3">
          {[
            { label: 'Scripts', value: scripts.length, icon: FileText, color: PRIMARY, bg: PRIMARY_CONTAINER },
            { label: 'News Today', value: news.length, icon: Newspaper, color: SECONDARY, bg: SECONDARY_CONTAINER },
            { label: 'Trending', value: trending.length, icon: TrendingUp, color: '#006928', bg: '#e8f5e9' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: stat.bg }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{stat.value}</p>
              <p className="text-xs text-[#757684] font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.section>

        {/* Quick Actions */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="font-bold text-base text-[#191c1d] dark:text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} onClick={() => navigate(action.path)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition-all active:scale-[0.98] text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: action.bg }}>
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <span className="text-sm font-semibold text-[#191c1d] dark:text-white">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Trending Topics */}
        {trending.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Trending in Your Niches</h3>
              <button onClick={() => navigate('/trending')} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {trending.map((t, i) => (
                <button key={i} onClick={() => navigate('/news')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-[#e1e3e4] dark:border-gray-700 text-xs font-semibold whitespace-nowrap hover:border-[#24389c] hover:text-[#24389c] transition-colors">
                  <span>{TOPIC_EMOJIS[t.topic] || '📰'}</span>
                  <span className="text-[#191c1d] dark:text-white">{t.topic}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>{t.count}</span>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Latest News */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Latest News</h3>
            <button onClick={() => navigate('/news')} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loadingNews ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] animate-pulse h-20" />
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="space-y-3">
              {news.map((item, i) => (
                <button key={i} onClick={() => navigate('/news')}
                  className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition-all text-left active:scale-[0.98]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.topic && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: SECONDARY_CONTAINER, color: SECONDARY }}>
                          {TOPIC_EMOJIS[item.topic] || '📰'} {item.topic}
                        </span>
                      )}
                      <span className="text-[10px] text-[#757684]">{getTimeAgo(item.published_at)}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#191c1d] dark:text-white line-clamp-2 leading-snug">
                      {item.title || item.headline}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 shrink-0 text-[#757684]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-[#e1e3e4] text-center">
              <p className="text-sm text-[#757684]">No news yet — check back soon!</p>
            </div>
          )}
        </motion.section>

        {/* Recent Scripts */}
        {scripts.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Recent Scripts</h3>
              <button onClick={() => navigate('/scripts')} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {scripts.slice(0, 3).map((s, i) => (
                <button key={i} onClick={() => navigate('/scripts')}
                  className="w-full bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-[#e1e3e4] dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition-all text-left active:scale-[0.98]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: PRIMARY_GRAD }}>
                    {s.topic?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#191c1d] dark:text-white truncate">{s.topic}</p>
                    <p className="text-xs text-[#757684]">{s.duration}s · {s.mode}</p>
                  </div>
                  <Sparkles className="w-4 h-4 shrink-0" style={{ color: SECONDARY }} />
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}