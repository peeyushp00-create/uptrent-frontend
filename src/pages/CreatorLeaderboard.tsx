import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RefreshCw, Flame, Eye, Users, Zap, Instagram } from "lucide-react";

const PRIMARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #6D28D9)";
const PRIMARY_CONTAINER = "#ede9fe";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

type GrowthTagType = "Hot" | "Rising" | "Stable";

interface Creator {
  id: string;
  platform: "instagram";
  username: string;
  display_name: string;
  niche: string;
  profile_pic_url: string | null;
  followers: number;
  followers_display: string;
  avg_views: number;
  avg_views_display: string;
  engagement_rate: string;
  is_verified: boolean;
  combined_score: number;
  growth_tag: GrowthTagType;
  profile_url: string;
  rank: number;
}

const NICHE_EMOJIS: Record<string, string> = {
  Comedy: "😂", Finance: "📈", Tech: "💻", Motivation: "🚀",
  Fashion: "👗", Travel: "✈️", Food: "🍳", Business: "💼",
  Education: "📚", Gaming: "🎮", Fitness: "💪", News: "📰",
  "Food & Health": "🥗", Skincare: "✨", Bollywood: "🎬",
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function GrowthTag({ tag }: { tag: GrowthTagType }) {
  const config: Record<GrowthTagType, { bg: string; color: string; icon: string }> = {
    Hot:    { bg: "#fee2e2", color: "#dc2626", icon: "🔥" },
    Rising: { bg: PRIMARY_CONTAINER, color: PRIMARY, icon: "📈" },
    Stable: { bg: "#f0fdf4", color: "#16a34a", icon: "✅" },
  };
  const c = config[tag];
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color }}>
      {c.icon} {tag}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#e7e8e9] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: PRIMARY_GRAD }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color: PRIMARY }}>{score}</span>
    </div>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
        style={{ background: PRIMARY_GRAD }}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img src={src} alt={name} onError={() => setErr(true)}
      className="w-12 h-12 rounded-full object-cover shrink-0 border-2"
      style={{ borderColor: PRIMARY + "40" }} />
  );
}

function CreatorCard({ creator, index }: { creator: Creator; index: number }) {
  const isTop3 = creator.rank <= 3;
  const rankColor = RANK_COLORS[creator.rank - 1] || "#9ca3af";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 border dark:border-gray-700 transition-all hover:shadow-md"
      style={{ borderColor: isTop3 ? rankColor + "60" : "#e1e3e4" }}>

      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm shrink-0"
          style={{ background: isTop3 ? rankColor + "20" : "#f3f4f5", color: isTop3 ? rankColor : "#9ca3af" }}>
          {isTop3 ? RANK_MEDALS[creator.rank - 1] : creator.rank}
        </div>

        <Avatar src={creator.profile_pic_url} name={creator.display_name} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-[#191c1d] dark:text-white truncate">
              {creator.display_name}
            </span>
            {creator.is_verified && (
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill={PRIMARY}>
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-[#757684]">
              {NICHE_EMOJIS[creator.niche] || "🎯"} {creator.niche}
            </span>
            <GrowthTag tag={creator.growth_tag} />
          </div>
        </div>

        <a href={creator.profile_url} target="_blank" rel="noopener noreferrer"
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
          style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}>
          <Instagram className="w-4 h-4 text-white" />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#f3f4f5] dark:border-gray-700">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <Users className="w-3 h-3 text-[#757684]" />
            <span className="text-[10px] text-[#757684]">Followers</span>
          </div>
          <span className="text-sm font-bold text-[#191c1d] dark:text-white">{creator.followers_display}</span>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <Eye className="w-3 h-3 text-[#757684]" />
            <span className="text-[10px] text-[#757684]">Avg Views</span>
          </div>
          <span className="text-sm font-bold text-[#191c1d] dark:text-white">{creator.avg_views_display}</span>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <Zap className="w-3 h-3 text-[#757684]" />
            <span className="text-[10px] text-[#757684]">Engagement</span>
          </div>
          <span className="text-sm font-bold text-[#191c1d] dark:text-white">{creator.engagement_rate}%</span>
        </div>
      </div>

      <div className="mt-3">
        <span className="text-[10px] text-[#757684] font-medium">SocialRum Score</span>
        <ScoreBar score={creator.combined_score} />
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#e7e8e9]" />
        <div className="w-12 h-12 rounded-full bg-[#e7e8e9]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#e7e8e9] rounded w-2/3" />
          <div className="h-3 bg-[#e7e8e9] rounded w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-[#e7e8e9] rounded-lg" />)}
      </div>
      <div className="mt-3 h-2 bg-[#e7e8e9] rounded-full" />
    </div>
  );
}

export default function CreatorLeaderboard() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (force = false) => {
    setError(null);
    try {
      const url = `${BASE}/api/leaderboard${force ? "?refresh=1" : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();
      setCreators(data.instagram || []);
      if (data.fetched_at) setCachedAt(data.fetched_at);
    } catch (err: unknown) {
      console.error(err);
      setError("Could not load leaderboard. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchLeaderboard(true); };

  const timeAgo = cachedAt
    ? (() => {
        const mins = Math.round((Date.now() - new Date(cachedAt).getTime()) / 60000);
        if (mins < 60) return `${mins}m ago`;
        return `${Math.round(mins / 60)}h ago`;
      })()
    : null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" style={{ color: PRIMARY }} />
          <div>
            <h1 className="font-bold text-xl dark:text-white leading-none" style={{ color: PRIMARY, fontFamily: "Roboto,sans-serif" }}>
              Creator Leaderboard
            </h1>
            {timeAgo && (
              <p className="text-[10px] text-[#757684] leading-none mt-0.5">Updated {timeAgo}</p>
            )}
          </div>
        </div>
        <button onClick={handleRefresh} disabled={refreshing || loading}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f3f4f5] transition-colors disabled:opacity-40">
          <RefreshCw className={`w-5 h-5 text-[#757684] ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-4">

        {/* Hero banner */}
        <div className="rounded-2xl p-4 text-white" style={{ background: PRIMARY_GRAD }}>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">India's Top Instagram Creators</span>
          </div>
          <p className="text-lg font-black leading-snug">Real-time rankings based on followers, views & engagement</p>
          <p className="text-xs opacity-70 mt-1">Updated every 24 hours · Top 10 Indian Creators</p>
        </div>

        {/* Score legend */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Followers", weight: "40%", icon: <Users className="w-3.5 h-3.5" /> },
            { label: "Avg Views", weight: "30%", icon: <Eye className="w-3.5 h-3.5" /> },
            { label: "Engagement", weight: "30%", icon: <Zap className="w-3.5 h-3.5" /> },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-[#e1e3e4] dark:border-gray-700 text-center">
              <div className="flex justify-center mb-1" style={{ color: PRIMARY }}>{item.icon}</div>
              <p className="text-[10px] text-[#757684]">{item.label}</p>
              <p className="text-sm font-black" style={{ color: PRIMARY }}>{item.weight}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button onClick={() => fetchLeaderboard()} className="mt-2 text-xs font-bold" style={{ color: PRIMARY }}>
              Try again
            </button>
          </div>
        )}

        {/* List */}
        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : creators.map((creator, i) => (
                  <CreatorCard key={creator.id} creator={creator} index={i} />
                ))}
          </motion.div>
        </AnimatePresence>

        {!loading && creators.length === 0 && !error && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm text-[#757684]">No creators loaded yet. Try refreshing.</p>
          </div>
        )}
      </main>
    </div>
  );
}