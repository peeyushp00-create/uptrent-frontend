import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, Loader2, X, Sparkles, TrendingUp, Hash, Lightbulb,
  User, Users, Heart, MessageCircle, BarChart2, BadgeCheck, Eye,
  Play, Music, Clock, Calendar, Plus, ChevronLeft, Trash2, UserPlus,
} from "lucide-react";
import { useTranslation } from 'react-i18next';

const PRIMARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #9f6fef)";
const PRIMARY_CONTAINER = "#ede9fe";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const HOURS = ['12am','6am','12pm','6pm','11pm'];

const generateHeatmap = () =>
  DAYS.map(day => ({
    day,
    hours: Array.from({ length: 24 }, (_, h) => {
      const isEvening = h >= 18 && h <= 22;
      const isMorning = h >= 6 && h <= 9;
      const isLunch = h >= 12 && h <= 14;
      if (isEvening) return Math.random() > 0.3 ? 3 : 2;
      if (isMorning || isLunch) return Math.random() > 0.5 ? 2 : 1;
      return Math.random() > 0.7 ? 1 : 0;
    }),
  }));

const heatmapColors = ['#e7e8e9', '#b78efe40', '#b78efe80', '#7C3AED'];

const formatNumber = (n: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

const PILLAR_COLORS = [
  { bg: PRIMARY_CONTAINER, text: PRIMARY },
  { bg: '#e8f5e9', text: '#2e7d32' },
  { bg: '#fff3e0', text: '#e65100' },
  { bg: '#fce4ec', text: '#880e4f' },
  { bg: '#e3f2fd', text: '#1565c0' },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface CompetitorCard {
  username: string;
  profile_pic_base64?: string;
  followers?: number;
  engagement_rate?: string;
  is_verified?: boolean;
  savedAt: number;
  fullData?: any;
  hikerData?: any;
}

// ─── Competitor Detail Page ──────────────────────────────────────────────────
function CompetitorDetail({
  competitor,
  onBack,
}: {
  competitor: CompetitorCard;
  onBack: () => void;
}) {
  const result = competitor.fullData;
  const hiker = competitor.hikerData;
  const [copied, setCopied] = useState<string | null>(null);
  const [reelsVisible, setReelsVisible] = useState(9);
  const [imgError, setImgError] = useState(false);
  const [heatmap] = useState(generateHeatmap());

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const proxyImg = (url?: string) =>
    url && /(cdninstagram\.com|fbcdn\.net)/i.test(url)
      ? `${BASE}/api/instagram/img?u=${encodeURIComponent(url)}`
      : url || '';

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 bg-[#f8f9fa] dark:bg-gray-900 overflow-y-auto"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-4 h-14 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: PRIMARY }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-sm font-bold text-[#191c1d] dark:text-white truncate">
          @{competitor.username}
        </span>
        {competitor.is_verified && <BadgeCheck className="w-4 h-4 text-blue-400 shrink-0" />}
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-28 space-y-4">

        {/* Profile Banner */}
        <div className="rounded-2xl p-5" style={{ background: PRIMARY_GRAD }}>
          <div className="flex items-center gap-3 mb-3">
            {result?.stats?.profile_pic_base64 && !imgError ? (
              <img
                src={result.stats.profile_pic_base64}
                alt={competitor.username}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
                {competitor.username[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-white text-base">@{competitor.username}</p>
                {competitor.is_verified && <BadgeCheck className="w-4 h-4 text-blue-300" />}
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                {result?.data_source === 'real' ? '✓ Live data' : 'AI Analysis'} · Competitor
              </p>
            </div>
          </div>
          {result?.summary && (
            <p className="text-sm text-white/90 leading-relaxed">{result.summary}</p>
          )}
        </div>

        {/* Stats */}
        {result?.stats && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Profile Stats</h2>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Followers', value: formatNumber(result.stats.followers), bg: PRIMARY_CONTAINER, color: PRIMARY, Icon: Users },
                { label: 'Engagement', value: `${result.stats.engagement_rate}%`, bg: '#e8f5e9', color: '#2e7d32', Icon: TrendingUp },
                { label: 'Avg Likes', value: formatNumber(result.stats.avg_likes), bg: '#fce4ec', color: '#880e4f', Icon: Heart },
                { label: 'Avg Comments', value: formatNumber(result.stats.avg_comments), bg: '#fff3e0', color: '#e65100', Icon: MessageCircle },
              ].map(({ label, value, bg, color, Icon }) => (
                <div key={label} className="rounded-xl p-3.5" style={{ background: bg }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-xs text-[#757684]">{label}</span>
                  </div>
                  <p className="font-bold text-lg" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
            {result.stats.total_posts && (
              <p className="text-xs text-[#757684] mt-3 text-center">
                Based on {result.stats.total_posts.toLocaleString()} total posts
              </p>
            )}
          </div>
        )}

        {/* Hiker reel stats */}
        {hiker?.stats && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Reels Performance</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Avg Views', value: formatNumber(hiker.stats.avg_views || 0), Icon: Eye, color: PRIMARY, bg: PRIMARY_CONTAINER },
                { label: 'Avg Likes', value: formatNumber(hiker.stats.avg_likes || 0), Icon: Heart, color: '#880e4f', bg: '#fce4ec' },
                { label: 'Avg Comments', value: formatNumber(hiker.stats.avg_comments || 0), Icon: MessageCircle, color: '#e65100', bg: '#fff3e0' },
                { label: 'Engagement', value: `${hiker.stats.engagement_rate || 0}%`, Icon: TrendingUp, color: '#2e7d32', bg: '#e8f5e9' },
              ].map(({ label, value, Icon, color, bg }) => (
                <div key={label} className="rounded-xl p-3.5" style={{ background: bg }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-xs text-[#757684]">{label}</span>
                  </div>
                  <p className="font-bold text-lg" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posting patterns */}
        {hiker?.posting_patterns && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4 flex flex-wrap gap-4">
            {hiker.posting_patterns.best_day && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: PRIMARY }} />
                <span className="text-xs text-[#757684]">Best day:</span>
                <span className="text-sm font-bold text-[#191c1d] dark:text-white">{hiker.posting_patterns.best_day}</span>
              </div>
            )}
            {hiker.posting_patterns.best_hour_ist && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: PRIMARY }} />
                <span className="text-xs text-[#757684]">Best time (IST):</span>
                <span className="text-sm font-bold text-[#191c1d] dark:text-white">{hiker.posting_patterns.best_hour_ist}</span>
              </div>
            )}
          </div>
        )}

        {/* Content Pillars */}
        {result?.content_pillars?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Content Pillars</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.content_pillars.map((pillar: string, i: number) => {
                const s = PILLAR_COLORS[i % PILLAR_COLORS.length];
                return (
                  <span key={i} className="px-4 py-2 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.text }}>
                    {pillar}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Post Types (from reel ideas as proxy) */}
        {result?.reel_ideas?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">What Kind of Content They Post</h2>
            </div>
            <div className="space-y-2">
              {result.reel_ideas.map((idea: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f9fa] dark:hover:bg-gray-700 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: PRIMARY_GRAD }}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#454652] dark:text-gray-200 flex-1">{idea}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Hashtags */}
        {(result?.hashtags?.length > 0 || hiker?.top_hashtags?.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" style={{ color: PRIMARY }} />
                <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Hashtags They Use</h2>
              </div>
              {result?.hashtags?.length > 0 && (
                <button
                  onClick={() => copyText(result.hashtags.map((h: string) => `#${h}`).join(' '), 'hashtags')}
                  className="text-xs font-bold flex items-center gap-1"
                  style={{ color: PRIMARY }}
                >
                  {copied === 'hashtags' ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy all</>}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(result?.hashtags || []).map((tag: string, i: number) => (
                <button
                  key={`r-${i}`}
                  onClick={() => copyText(`#${tag}`, `tag-${i}`)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                  style={i % 3 === 0 ? { background: PRIMARY_CONTAINER, color: PRIMARY } : i % 3 === 1 ? { background: '#e8f5e9', color: '#2e7d32' } : { background: '#e7e8e9', color: '#454652' }}
                >
                  #{tag}
                </button>
              ))}
              {(hiker?.top_hashtags || []).map((h: any, i: number) => (
                <span key={`h-${i}`} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                  {h.tag} <span className="opacity-60">×{h.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* When They Commonly Post — Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">When They Commonly Post</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#757684]">Less</span>
              {heatmapColors.map((c, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />)}
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
                      {row.hours.map((v, hi) => <div key={hi} className="h-5 rounded-sm" style={{ background: heatmapColors[v] }} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-[#757684] mt-3">📍 Peak activity: evenings 6pm–10pm IST</p>
        </div>

        {/* Top Audio */}
        {hiker?.top_audio?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Audio They Use</h2>
            </div>
            <div className="space-y-1.5">
              {hiker.top_audio.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-[#454652] dark:text-gray-200 truncate mr-2">🎵 {a.title}</span>
                  <span className="text-xs text-[#757684] shrink-0">×{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reels Grid */}
        {hiker?.reels?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Play className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Their Reels ({hiker.reels.length})</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {hiker.reels.slice(0, reelsVisible).map((reel: any, i: number) => (
                <div
                  key={reel.id || i}
                  onClick={() => reel.permalink && window.open(reel.permalink, '_blank')}
                  className="relative rounded-xl overflow-hidden cursor-pointer group"
                  style={{ aspectRatio: '9/16', background: '#1a1a2e' }}
                >
                  <img
                    src={proxyImg(reel.thumbnail)}
                    alt={reel.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  {reel.virality?.label && (
                    <div
                      className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-white text-[8px] font-bold"
                      style={{ background: reel.virality.score >= 65 ? '#16a34a' : PRIMARY }}
                    >
                      {reel.virality.label}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-2.5 h-2.5 text-white/80" />
                      <span className="text-[8px] text-white/80">{formatNumber(Number(reel.views) || 0)}</span>
                      <Heart className="w-2.5 h-2.5 text-white/80" />
                      <span className="text-[8px] text-white/80">{formatNumber(Number(reel.likes) || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {hiker.reels.length > reelsVisible && (
              <button
                onClick={() => setReelsVisible(v => v + 9)}
                className="mx-auto mt-3 block px-5 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: PRIMARY }}
              >
                Load More
              </button>
            )}
          </div>
        )}

        {/* Posting Tips */}
        {result?.posting_tips?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Posting Tips from Their Strategy</h2>
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
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function InstagramAnalyzer() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [heatmap] = useState(generateHeatmap());
  const [imgError, setImgError] = useState(false);

  const [hiker, setHiker] = useState<any>(null);
  const [hikerLoading, setHikerLoading] = useState(false);
  const [reelsVisible, setReelsVisible] = useState(9);

  // ── Competitor state ──
  const [competitors, setCompetitors] = useState<CompetitorCard[]>(() => {
    try { return JSON.parse(localStorage.getItem('ig_competitors') || '[]'); } catch { return []; }
  });
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [compInput, setCompInput] = useState('');
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState('');
  const [openCompetitor, setOpenCompetitor] = useState<CompetitorCard | null>(null);

  useEffect(() => {
    localStorage.setItem('ig_competitors', JSON.stringify(competitors));
  }, [competitors]);

  const proxyImg = (url?: string) =>
    url && /(cdninstagram\.com|fbcdn\.net)/i.test(url)
      ? `${BASE}/api/instagram/img?u=${encodeURIComponent(url)}`
      : url || '';

  const analyze = async () => {
    if (!username.trim()) return;
    const clean = username.replace('@', '').trim();
    setLoading(true); setHikerLoading(true);
    setError(''); setResult(null); setHiker(null); setImgError(false); setReelsVisible(9);

    (async () => {
      try {
        const userLanguage = localStorage.getItem('userLanguage') || 'english';
        const res = await fetch(`${BASE}/api/instagram/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: clean, language: userLanguage }),
        });
        if (!res.ok) throw new Error('Failed');
        setResult(await res.json());
      } catch { setError(t('common.error')); }
      finally { setLoading(false); }
    })();

    (async () => {
      try {
        const res = await fetch(`${BASE}/api/hiker/analyze?username=${encodeURIComponent(clean)}`);
        if (res.ok) setHiker(await res.json());
      } catch (e) { console.error(e); }
      finally { setHikerLoading(false); }
    })();
  };

  const addCompetitor = async () => {
    const clean = compInput.replace('@', '').trim();
    if (!clean) return;
    if (competitors.find(c => c.username.toLowerCase() === clean.toLowerCase())) {
      setCompError('Already added'); return;
    }
    setCompLoading(true); setCompError('');
    try {
      const userLanguage = localStorage.getItem('userLanguage') || 'english';
      const [mainRes, hikerRes] = await Promise.allSettled([
        fetch(`${BASE}/api/instagram/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: clean, language: userLanguage }),
        }).then(r => r.ok ? r.json() : null),
        fetch(`${BASE}/api/hiker/analyze?username=${encodeURIComponent(clean)}`).then(r => r.ok ? r.json() : null),
      ]);

      const fullData = mainRes.status === 'fulfilled' ? mainRes.value : null;
      const hikerData = hikerRes.status === 'fulfilled' ? hikerRes.value : null;

      const card: CompetitorCard = {
        username: clean,
        profile_pic_base64: fullData?.stats?.profile_pic_base64,
        followers: fullData?.stats?.followers,
        engagement_rate: fullData?.stats?.engagement_rate,
        is_verified: fullData?.stats?.is_verified,
        savedAt: Date.now(),
        fullData,
        hikerData,
      };
      setCompetitors(prev => [card, ...prev]);
      setCompInput('');
      setAddingCompetitor(false);
    } catch {
      setCompError('Failed to fetch. Try again.');
    } finally {
      setCompLoading(false);
    }
  };

  const removeCompetitor = (username: string) => {
    setCompetitors(prev => prev.filter(c => c.username !== username));
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">

      {/* Competitor detail full-page */}
      <AnimatePresence>
        {openCompetitor && (
          <CompetitorDetail
            competitor={openCompetitor}
            onBack={() => setOpenCompetitor(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center">
        <h1 className="font-bold text-xl" style={{ color: PRIMARY, fontFamily: 'Montserrat, sans-serif' }}>
          {t('analyzer.title')}
        </h1>
        <p className="text-sm text-[#757684] ml-3 hidden sm:block">{t('analyzer.subtitle')}</p>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-5">

        {/* Search Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
          <p className="text-sm text-[#757684] mb-3">{t('analyzer.description')}</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757684] text-sm font-bold">@</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') analyze(); }}
                placeholder={t('analyzer.placeholder')}
                className="w-full pl-8 pr-9 py-3 rounded-xl border border-[#c5c5d4] bg-[#f8f9fa] dark:bg-gray-700 dark:border-gray-600 text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none text-sm focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
              />
              {username && (
                <button
                  onClick={() => { setUsername(''); setResult(null); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#191c1d]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={analyze}
              disabled={loading || !username.trim()}
              className="px-5 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 hover:shadow-lg transition-all"
              style={{ background: PRIMARY_GRAD }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('analyzer.analyze_btn')}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* ── Competitor Tracker ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Competitor Tracker</h2>
              {competitors.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                  {competitors.length}
                </span>
              )}
            </div>
            {!addingCompetitor && (
              <button
                onClick={() => { setAddingCompetitor(true); setCompError(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-md"
                style={{ background: PRIMARY_GRAD }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Competitor
              </button>
            )}
          </div>

          {/* Add input */}
          <AnimatePresence>
            {addingCompetitor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757684] text-sm font-bold">@</span>
                    <input
                      autoFocus
                      type="text"
                      value={compInput}
                      onChange={e => setCompInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addCompetitor(); if (e.key === 'Escape') setAddingCompetitor(false); }}
                      placeholder="Enter competitor username"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#c5c5d4] bg-[#f8f9fa] dark:bg-gray-700 dark:border-gray-600 text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none text-sm focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={addCompetitor}
                    disabled={compLoading || !compInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
                    style={{ background: PRIMARY_GRAD }}
                  >
                    {compLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                  </button>
                  <button
                    onClick={() => { setAddingCompetitor(false); setCompInput(''); setCompError(''); }}
                    className="px-3 py-2.5 rounded-xl border border-[#e1e3e4] dark:border-gray-600 text-[#757684] hover:text-[#191c1d] dark:hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {compError && <p className="text-red-500 text-xs mb-2">{compError}</p>}
                {compLoading && (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-[#f8f9fa] dark:bg-gray-700 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: PRIMARY }} />
                    <p className="text-xs text-[#757684]">Fetching @{compInput.replace('@', '')}…</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Competitor cards */}
          {competitors.length === 0 && !addingCompetitor ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: PRIMARY_CONTAINER }}>
                <Users className="w-5 h-5" style={{ color: PRIMARY }} />
              </div>
              <p className="text-xs text-[#757684]">Add competitors to track and compare their profiles</p>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              {competitors.map((comp) => (
                <motion.div
                  key={comp.username}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#e1e3e4] dark:border-gray-700 cursor-pointer hover:border-[#7C3AED]/40 hover:bg-[#faf9ff] dark:hover:bg-gray-700 transition-all"
                  onClick={() => setOpenCompetitor(comp)}
                >
                  {comp.profile_pic_base64 ? (
                    <img
                      src={comp.profile_pic_base64}
                      alt={comp.username}
                      className="w-10 h-10 rounded-full object-cover border border-[#e1e3e4] shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: PRIMARY_GRAD }}
                    >
                      {comp.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-[#191c1d] dark:text-white truncate">@{comp.username}</p>
                      {comp.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {comp.followers && (
                        <span className="text-xs text-[#757684]">
                          <span className="font-semibold text-[#454652] dark:text-gray-300">{formatNumber(comp.followers)}</span> followers
                        </span>
                      )}
                      {comp.engagement_rate && (
                        <span className="text-xs text-[#757684]">
                          <span className="font-semibold text-green-600">{comp.engagement_rate}%</span> eng.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-[#757684] hidden sm:block">View details</span>
                    <button
                      onClick={e => { e.stopPropagation(); removeCompetitor(comp.username); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#757684] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] p-8 flex flex-col items-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-8 h-8" style={{ color: PRIMARY }} />
            </motion.div>
            <p className="text-sm font-semibold text-[#191c1d] dark:text-white">{t('analyzer.analyzing')} @{username.replace('@', '')}…</p>
            <p className="text-xs text-[#757684]">{t('analyzer.fetching')}</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Profile Banner */}
            <div className="rounded-2xl p-5" style={{ background: PRIMARY_GRAD }}>
              <div className="flex items-center gap-3 mb-3">
                {result.stats?.profile_pic_base64 && !imgError ? (
                  <img
                    src={result.stats.profile_pic_base64}
                    alt={username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    {(result.profile_name || username)[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-white">@{username.replace('@', '')}</p>
                    {result.stats?.is_verified && <BadgeCheck className="w-4 h-4 text-blue-300" />}
                  </div>
                  <p className="text-xs text-white/70">{result.data_source === 'real' ? '✓ Live data' : 'AI Analysis'}</p>
                </div>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">{result.summary}</p>
            </div>

            {/* Stats */}
            {result.stats && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white">{t('analyzer.profile_stats')}</h2>
                  <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                    {t('analyzer.live_data')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3.5" style={{ background: PRIMARY_CONTAINER }}>
                    <div className="flex items-center gap-2 mb-1"><Users className="w-3.5 h-3.5" style={{ color: PRIMARY }} /><span className="text-xs text-[#757684]">{t('analyzer.followers')}</span></div>
                    <p className="font-bold text-lg" style={{ color: PRIMARY }}>{formatNumber(result.stats.followers)}</p>
                  </div>
                  <div className="rounded-xl p-3.5" style={{ background: '#e8f5e9' }}>
                    <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-3.5 h-3.5 text-green-600" /><span className="text-xs text-[#757684]">{t('analyzer.engagement')}</span></div>
                    <p className="font-bold text-lg text-green-700">{result.stats.engagement_rate}%</p>
                  </div>
                  <div className="rounded-xl p-3.5" style={{ background: '#fce4ec' }}>
                    <div className="flex items-center gap-2 mb-1"><Heart className="w-3.5 h-3.5 text-pink-600" /><span className="text-xs text-[#757684]">{t('analyzer.avg_likes')}</span></div>
                    <p className="font-bold text-lg text-pink-700">{formatNumber(result.stats.avg_likes)}</p>
                  </div>
                  <div className="rounded-xl p-3.5" style={{ background: '#fff3e0' }}>
                    <div className="flex items-center gap-2 mb-1"><MessageCircle className="w-3.5 h-3.5 text-orange-600" /><span className="text-xs text-[#757684]">{t('analyzer.avg_comments')}</span></div>
                    <p className="font-bold text-lg text-orange-700">{formatNumber(result.stats.avg_comments)}</p>
                  </div>
                </div>
                {result.stats.total_posts && (
                  <p className="text-xs text-[#757684] mt-3 text-center">
                    {t('analyzer.based_on')} {result.stats.total_posts.toLocaleString()} {t('analyzer.total_posts')}
                  </p>
                )}
              </div>
            )}

            {/* Content Pillars */}
            {result.content_pillars?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white">{t('analyzer.content_pillars')}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.content_pillars.map((pillar: string, i: number) => {
                    const s = PILLAR_COLORS[i % PILLAR_COLORS.length];
                    return <span key={i} className="px-4 py-2 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.text }}>{pillar}</span>;
                  })}
                </div>
              </div>
            )}

            {/* Reel Ideas */}
            {result.reel_ideas?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white">{t('analyzer.reel_ideas')}</h2>
                </div>
                <div className="space-y-2">
                  {result.reel_ideas.map((idea: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f9fa] dark:hover:bg-gray-700 transition-colors">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: PRIMARY_GRAD }}>{i + 1}</div>
                      <p className="text-sm text-[#454652] dark:text-gray-200 flex-1">{idea}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {result.hashtags?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" style={{ color: PRIMARY }} />
                    <h2 className="font-bold text-base text-[#191c1d] dark:text-white">{t('analyzer.hashtags')}</h2>
                  </div>
                  <button onClick={() => copyText(result.hashtags.map((h: string) => `#${h}`).join(' '), 'hashtags')} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
                    {copied === 'hashtags' ? <><Check className="w-3.5 h-3.5 text-green-500" /> {t('scripts.copied')}</> : <><Copy className="w-3.5 h-3.5" /> {t('scripts.copy_all')}</>}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag: string, i: number) => (
                    <button key={i} onClick={() => copyText(`#${tag}`, `tag-${i}`)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                      style={i % 3 === 0 ? { background: PRIMARY_CONTAINER, color: PRIMARY } : i % 3 === 1 ? { background: '#e8f5e9', color: '#2e7d32' } : { background: '#e7e8e9', color: '#454652' }}>
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Heatmap */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base text-[#191c1d] dark:text-white">{t('analyzer.best_time')}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#757684]">Less</span>
                  {heatmapColors.map((c, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />)}
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
                          {row.hours.map((v, hi) => <div key={hi} className="h-5 rounded-sm" style={{ background: heatmapColors[v] }} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#757684] mt-3">📍 {t('analyzer.peak_time')}</p>
            </div>

            {/* Posting Tips */}
            {result.posting_tips?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-base text-[#191c1d] dark:text-white">{t('analyzer.posting_tips')}</h2>
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

            {/* Reels Grid */}
            {result.reels?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Play className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Reels ({result.reels.length})</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {result.reels.map((reel: any, i: number) => (
                    <a key={reel.id || i} href={reel.permalink} target="_blank" rel="noopener noreferrer"
                      className="relative rounded-xl overflow-hidden group block" style={{ aspectRatio: '9/16', background: '#1a1a2e' }}>
                      {reel.thumbnail && (
                        <img
                          src={`${BASE}/api/instagram/img?u=${encodeURIComponent(reel.thumbnail)}`}
                          alt={reel.caption}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-1.5">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-2.5 h-2.5 text-white/80" />
                          <span className="text-[8px] text-white/80">{formatNumber(reel.views || 0)}</span>
                          <Heart className="w-2.5 h-2.5 text-white/80" />
                          <span className="text-[8px] text-white/80">{formatNumber(reel.likes || 0)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Grid */}
            {result.posts?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-sm text-[#191c1d] dark:text-white">Posts ({result.posts.length})</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {result.posts.map((post: any, i: number) => (
                    <a key={post.id || i} href={post.permalink} target="_blank" rel="noopener noreferrer"
                      className="relative rounded-xl overflow-hidden group block" style={{ aspectRatio: '1/1', background: '#1a1a2e' }}>
                      {post.thumbnail && (
                        <img
                          src={`${BASE}/api/instagram/img?u=${encodeURIComponent(post.thumbnail)}`}
                          alt={post.caption}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-2.5 h-2.5 text-white/80" />
                          <span className="text-[8px] text-white/80">{formatNumber(post.likes || 0)}</span>
                          <MessageCircle className="w-2.5 h-2.5 text-white/80" />
                          <span className="text-[8px] text-white/80">{formatNumber(post.comments || 0)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Hiker section */}
        {(hikerLoading || hiker) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-base text-[#191c1d] dark:text-white">Reels & Deep Insights</h2>
            </div>
            {hikerLoading && !hiker ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: PRIMARY }} />
                <p className="text-sm text-[#757684] mt-2">Analyzing reels…</p>
              </div>
            ) : hiker && hiker.reels?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Avg Views', value: formatNumber(hiker.stats?.avg_views || 0), icon: Eye },
                    { label: 'Avg Likes', value: formatNumber(hiker.stats?.avg_likes || 0), icon: Heart },
                    { label: 'Avg Comments', value: formatNumber(hiker.stats?.avg_comments || 0), icon: MessageCircle },
                    { label: 'Engagement', value: `${hiker.stats?.engagement_rate || 0}%`, icon: TrendingUp },
                  ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-3">
                      <s.icon className="w-3.5 h-3.5 mb-1" style={{ color: PRIMARY }} />
                      <p className="font-bold text-base text-[#191c1d] dark:text-white">{s.value}</p>
                      <p className="text-[10px] text-[#757684]">{s.label}</p>
                    </div>
                  ))}
                </div>
                {(hiker.posting_patterns?.best_day || hiker.posting_patterns?.best_hour_ist) && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4 flex flex-wrap gap-4">
                    {hiker.posting_patterns.best_day && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: PRIMARY }} />
                        <span className="text-xs text-[#757684]">Best day:</span>
                        <span className="text-sm font-bold text-[#191c1d] dark:text-white">{hiker.posting_patterns.best_day}</span>
                      </div>
                    )}
                    {hiker.posting_patterns.best_hour_ist && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: PRIMARY }} />
                        <span className="text-xs text-[#757684]">Best time (IST):</span>
                        <span className="text-sm font-bold text-[#191c1d] dark:text-white">{hiker.posting_patterns.best_hour_ist}</span>
                      </div>
                    )}
                  </div>
                )}
                {hiker.top_hashtags?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-3"><Hash className="w-4 h-4" style={{ color: PRIMARY }} /><h3 className="font-bold text-sm text-[#191c1d] dark:text-white">Top Hashtags</h3></div>
                    <div className="flex flex-wrap gap-2">
                      {hiker.top_hashtags.map((h: any, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                          {h.tag} <span className="opacity-60">×{h.count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hiker.top_audio?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-3"><Music className="w-4 h-4" style={{ color: PRIMARY }} /><h3 className="font-bold text-sm text-[#191c1d] dark:text-white">Top Audio</h3></div>
                    <div className="space-y-1.5">
                      {hiker.top_audio.map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-[#454652] dark:text-gray-200 truncate mr-2">🎵 {a.title}</span>
                          <span className="text-xs text-[#757684] shrink-0">×{a.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hiker.top_hooks?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} /><h3 className="font-bold text-sm text-[#191c1d] dark:text-white">Best Hooks</h3></div>
                    <div className="space-y-2.5">
                      {hiker.top_hooks.map((h: any, i: number) => (
                        <div key={i} onClick={() => h.permalink && window.open(h.permalink, '_blank')} className="cursor-pointer p-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-gray-700">
                          <p className="text-sm text-[#191c1d] dark:text-white leading-snug">"{h.hook}"</p>
                          <p className="text-[10px] text-[#757684] mt-0.5">{formatNumber(h.views || 0)} views · {formatNumber(h.likes || 0)} likes</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3"><Play className="w-4 h-4" style={{ color: PRIMARY }} /><h3 className="font-bold text-sm text-[#191c1d] dark:text-white">Reels ({hiker.reels.length})</h3></div>
                  <div className="grid grid-cols-3 gap-2">
                    {hiker.reels.slice(0, reelsVisible).map((reel: any, i: number) => (
                      <div key={reel.id || i} onClick={() => reel.permalink && window.open(reel.permalink, '_blank')}
                        className="relative rounded-xl overflow-hidden cursor-pointer group" style={{ aspectRatio: '9/16', background: '#1a1a2e' }}>
                        <img src={proxyImg(reel.thumbnail)} alt={reel.caption} referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                        {reel.virality?.label && (
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-white text-[8px] font-bold"
                            style={{ background: reel.virality.score >= 65 ? '#16a34a' : PRIMARY }}>
                            {reel.virality.label}
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-1.5">
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-2.5 h-2.5 text-white/80" />
                            <span className="text-[8px] text-white/80">{formatNumber(Number(reel.views) || 0)}</span>
                            <Heart className="w-2.5 h-2.5 text-white/80" />
                            <span className="text-[8px] text-white/80">{formatNumber(Number(reel.likes) || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {hiker.reels.length > reelsVisible && (
                    <button onClick={() => setReelsVisible(v => v + 9)}
                      className="mx-auto mt-3 block px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: PRIMARY }}>
                      Load More
                    </button>
                  )}
                </div>
              </>
            ) : hiker ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5 text-center">
                <p className="text-sm text-[#757684]">No public reels found for this account.</p>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: PRIMARY_CONTAINER }}>
              <User className="w-8 h-8" style={{ color: PRIMARY }} />
            </div>
            <p className="font-bold text-[#191c1d] dark:text-white mb-1">{t('analyzer.empty_title')}</p>
            <p className="text-sm text-[#757684]">{t('analyzer.empty_desc')}</p>
          </div>
        )}
      </main>
    </div>
  );
}