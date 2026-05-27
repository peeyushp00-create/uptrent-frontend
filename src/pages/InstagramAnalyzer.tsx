import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Loader2, X, Sparkles, TrendingUp, Hash, Lightbulb, User, Users, Heart, MessageCircle, BarChart2, BadgeCheck } from "lucide-react";

const PRIMARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #7C3AED)";
const PRIMARY_CONTAINER = "#ede9fe";
const SECONDARY_CONTAINER = "#ede9fe";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const HOURS = ['12am','6am','12pm','6pm','11pm'];

const generateHeatmap = () => {
  return DAYS.map(day => ({
    day,
    hours: Array.from({ length: 24 }, (_, h) => {
      const isMorning = h >= 6 && h <= 9;
      const isLunch = h >= 12 && h <= 14;
      const isEvening = h >= 18 && h <= 22;
      if (isEvening) return Math.random() > 0.3 ? 3 : 2;
      if (isMorning || isLunch) return Math.random() > 0.5 ? 2 : 1;
      return Math.random() > 0.7 ? 1 : 0;
    })
  }));
};

const heatmapColors = ['#e7e8e9', '#b78efe40', '#b78efe80', '#7C3AED'];

const formatNumber = (n: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

export default function InstagramAnalyzer() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [heatmap] = useState(generateHeatmap());
  const [imgError, setImgError] = useState(false);

  const analyze = async () => {
    if (!username.trim()) return;
    setLoading(true); setError(''); setResult(null); setImgError(false);
    try {
      const res = await fetch(`${BASE}/api/instagram/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.replace('@', '') }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data);
    } catch { setError('Failed to analyze. Please try again.'); }
    finally { setLoading(false); }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const PILLAR_COLORS = [
    { bg: PRIMARY_CONTAINER, text: PRIMARY },
    { bg: SECONDARY_CONTAINER, text: PRIMARY },
    { bg: '#e8f5e9', text: '#2e7d32' },
    { bg: '#fff3e0', text: '#e65100' },
    { bg: '#fce4ec', text: '#880e4f' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center">
        <h1 className="font-bold text-xl text-[#7C3AED] dark:text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Content Analyzer
        </h1>
        <p className="text-sm text-[#757684] ml-3 hidden sm:block">Deep-dive into any Instagram profile</p>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-5">

        {/* Search Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
          <p className="text-sm text-[#757684] mb-3">Enter an Instagram username to get content strategy insights</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757684] text-sm font-bold">@</span>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') analyze(); }}
                placeholder="username"
                className="w-full pl-8 pr-9 py-3 rounded-xl border border-[#c5c5d4] bg-[#f8f9fa] dark:bg-gray-700 dark:border-gray-600 text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none text-sm focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" />
              {username && (
                <button onClick={() => { setUsername(''); setResult(null); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#191c1d]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={analyze} disabled={loading || !username.trim()}
              className="px-5 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 hover:shadow-lg transition-all"
              style={{ background: PRIMARY_GRAD }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] p-8 flex flex-col items-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-8 h-8" style={{ color: PRIMARY }} />
            </motion.div>
            <p className="text-sm font-semibold text-[#191c1d] dark:text-white">Analyzing @{username.replace('@', '')}...</p>
            <p className="text-xs text-[#757684]">Fetching real data & building insights</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Profile Summary */}
            <div className="rounded-2xl p-5" style={{ background: PRIMARY_GRAD }}>
              <div className="flex items-center gap-3 mb-3">
                {/* Profile pic */}
                {result.stats?.profile_pic_url && !imgError ? (
                  <img
                    src={result.stats.profile_pic_url}
                    alt={username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {(result.profile_name || username)[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>@{username.replace('@', '')}</p>
                    {result.stats?.is_verified && <BadgeCheck className="w-4 h-4 text-blue-300" />}
                  </div>
                  <p className="text-xs text-white/70">{result.data_source === 'real' ? '✓ Real data' : 'AI Analysis'}</p>
                </div>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">{result.summary}</p>
            </div>

            {/* Real Stats Card */}
            {result.stats && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Profile Stats</h2>
                  <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>Live Data</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3.5" style={{ background: PRIMARY_CONTAINER }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                      <span className="text-xs text-[#757684]">Followers</span>
                    </div>
                    <p className="font-bold text-lg" style={{ color: PRIMARY, fontFamily: 'Montserrat, sans-serif' }}>
                      {formatNumber(result.stats.followers)}
                    </p>
                  </div>
                  <div className="rounded-xl p-3.5" style={{ background: '#e8f5e9' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs text-[#757684]">Engagement</span>
                    </div>
                    <p className="font-bold text-lg text-green-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {result.stats.engagement_rate}%
                    </p>
                  </div>
                  <div className="rounded-xl p-3.5" style={{ background: '#fce4ec' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-3.5 h-3.5 text-pink-600" />
                      <span className="text-xs text-[#757684]">Avg Likes</span>
                    </div>
                    <p className="font-bold text-lg text-pink-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {formatNumber(result.stats.avg_likes)}
                    </p>
                  </div>
                  <div className="rounded-xl p-3.5" style={{ background: '#fff3e0' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-3.5 h-3.5 text-orange-600" />
                      <span className="text-xs text-[#757684]">Avg Comments</span>
                    </div>
                    <p className="font-bold text-lg text-orange-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {formatNumber(result.stats.avg_comments)}
                    </p>
                  </div>
                </div>
                {result.stats.total_posts && (
                  <p className="text-xs text-[#757684] mt-3 text-center">
                    Based on {result.stats.total_posts.toLocaleString()} total posts
                  </p>
                )}
              </div>
            )}

            {/* Content Pillars */}
            {result.content_pillars && result.content_pillars.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Content Pillars</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.content_pillars.map((pillar: string, i: number) => {
                    const style = PILLAR_COLORS[i % PILLAR_COLORS.length];
                    return (
                      <span key={i} className="px-4 py-2 rounded-full text-xs font-bold"
                        style={{ background: style.bg, color: style.text }}>
                        {pillar}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reel Ideas */}
            {result.reel_ideas && result.reel_ideas.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Reel Ideas</h2>
                </div>
                <div className="space-y-2">
                  {result.reel_ideas.map((idea: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f9fa] dark:hover:bg-gray-700 transition-colors">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: PRIMARY_GRAD }}>
                        {i + 1}
                      </div>
                      <p className="text-sm text-[#454652] dark:text-gray-200 flex-1">{idea}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {result.hashtags && result.hashtags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" style={{ color: PRIMARY }} />
                    <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Hashtags</h2>
                  </div>
                  <button onClick={() => copyText(result.hashtags.map((h: string) => `#${h}`).join(' '), 'hashtags')}
                    className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
                    {copied === 'hashtags' ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag: string, i: number) => (
                    <button key={i} onClick={() => copyText(`#${tag}`, `tag-${i}`)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                      style={i % 3 === 0 ? { background: PRIMARY_CONTAINER, color: PRIMARY } : i % 3 === 1 ? { background: SECONDARY_CONTAINER, color: PRIMARY } : { background: '#e7e8e9', color: '#454652' }}>
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Heatmap */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Best Time to Post
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#757684]">Less</span>
                  {heatmapColors.map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
                  ))}
                  <span className="text-[10px] text-[#757684]">More</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[400px]">
                  <div className="flex justify-between text-[9px] font-bold text-[#757684] uppercase mb-1 ml-8">
                    {HOURS.map(h => <span key={h}>{h}</span>)}
                  </div>
                  <div className="space-y-1">
                    {heatmap.map(row => (
                      <div key={row.day} className="flex items-center gap-1">
                        <span className="w-7 text-[9px] font-bold text-[#757684]">{row.day}</span>
                        <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}>
                          {row.hours.map((v, hi) => (
                            <div key={hi} className="h-5 rounded-sm" style={{ background: heatmapColors[v] }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#757684] mt-3">📍 Peak engagement: 6PM–10PM on weekdays</p>
            </div>

            {/* Posting Tips */}
            {result.posting_tips && result.posting_tips.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Posting Tips</h2>
                </div>
                <div className="space-y-2.5">
                  {result.posting_tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: PRIMARY_CONTAINER }}>
                        <span className="text-[9px] font-bold" style={{ color: PRIMARY }}>{i + 1}</span>
                      </div>
                      <p className="text-sm text-[#454652] dark:text-gray-200 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: PRIMARY_CONTAINER }}>
              <User className="w-8 h-8" style={{ color: PRIMARY }} />
            </div>
            <p className="font-bold text-[#191c1d] dark:text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Analyze Any Profile</p>
            <p className="text-sm text-[#757684]">Enter any Instagram username to get real stats, content pillars, reel ideas, hashtags and posting tips</p>
          </div>
        )}
      </main>
    </div>
  );
}