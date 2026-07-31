import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Copy, Check, Loader2, Youtube, X,
  TrendingUp, Users, Eye, Video, BarChart2,
  Target, Lightbulb, ArrowRight, Plus, Trash2, UserPlus,
  ChevronLeft,
} from "lucide-react";
import SEO from "@/components/SEO";
import { useTranslation } from 'react-i18next';
import { getPageState, setPageState } from '@/lib/pageCache';
import { useTheme } from "@/contexts/ThemeContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
// Theme-driven — resolves to red because these components render inside a
// `.theme-redesign[data-platform="youtube"]` wrapper (see index.css).
const YT_GRAD = "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))";
const YT_COLOR = "hsl(var(--primary))";
const YT_CONTAINER = "hsl(var(--primary) / 0.12)";

const POPULAR_CHANNELS = [
  "MrBeast", "CarryMinati", "Technical Guruji", "Bhuvan Bam",
  "Amit Bhadana", "Triggered Insaan", "Dhruv Rathee",
  "Ranveer Allahbadia", "Slayy Point", "Ashish Chanchlani",
];

interface CompetitorCard {
  channelName: string;
  thumbnail?: string;
  subscribers?: string;
  engagement_rate?: string;
  savedAt: number;
  fullData?: any;
}

function VideoGrid({ title, videos, isShorts = false }: { title: string; videos: any[]; isShorts?: boolean }) {
  const [visible, setVisible] = useState(isShorts ? 6 : 4);
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Video className="w-4 h-4 text-red-500" />
        <h3 className="font-bold text-sm text-foreground">{title}</h3>
      </div>
      {isShorts ? (
        <div className="grid grid-cols-3 gap-2">
          {videos.slice(0, visible).map((v) => (
            <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
              className="relative rounded-xl overflow-hidden group block" style={{ aspectRatio: '9/16', background: '#1a1a2e' }}>
              <img src={v.thumbnail} alt={v.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-white text-[8px] font-bold bg-red-600">SHORT</div>
              <div className="absolute bottom-0 left-0 right-0 p-1.5">
                <p className="text-[8px] text-white/90 line-clamp-2 leading-tight mb-1">{v.title}</p>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-2.5 h-2.5 text-white/70" />
                  <span className="text-[8px] text-white/70">{v.views_formatted}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {videos.slice(0, visible).map((v) => (
            <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
              className="flex gap-3 p-2 rounded-xl hover:bg-accent transition-colors group">
              <div className="relative shrink-0 rounded-lg overflow-hidden" style={{ width: 96, height: 54, background: '#1a1a2e' }}>
                <img src={v.thumbnail} alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{v.title}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" />{v.views_formatted} views</span>
                  <span className="text-[10px] text-muted-foreground">❤️ {v.likes_formatted}</span>
                  <span className="text-[10px] text-muted-foreground">💬 {v.comments_formatted}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      {videos.length > visible && (
        <button onClick={() => setVisible(v => v + (isShorts ? 6 : 4))}
          className="mx-auto mt-3 block px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: YT_GRAD }}>
          Load More
        </button>
      )}
    </div>
  );
}

function CompetitorDetail({ competitor, onBack, onCopy, copied }: {
  competitor: CompetitorCard; onBack: () => void;
  onCopy: (text: string, key: string) => void; copied: string | null;
}) {
  const result = competitor.fullData;
  const stats = result?.channelStats;
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      data-platform="youtube"
      className={`theme-redesign ${theme} fixed inset-0 z-50 bg-background overflow-y-auto`}>
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 h-14 flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: YT_COLOR }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-sm font-bold text-foreground truncate">{competitor.channelName}</span>
      </header>
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-28 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: YT_GRAD }}>
          <div className="flex items-center gap-3 mb-3">
            {stats?.thumbnail ? (
              <img src={stats.thumbnail} alt={competitor.channelName} className="w-14 h-14 rounded-full object-cover border-2 border-white/30" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
                {competitor.channelName[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-base truncate">{stats?.name || competitor.channelName}</p>
              <p className="text-xs text-white/70 mt-0.5">Competitor · YouTube</p>
            </div>
          </div>
          {result?.summary && <p className="text-sm text-white/90 leading-relaxed">{result.summary}</p>}
        </div>
        {stats && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-red-500" />
              <h2 className="font-bold text-sm text-foreground">Channel Stats</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: t('home.subscribers'), val: stats.subscribers, color: '#cc0000' },
                { label: t('home.total_views'), val: stats.total_views, color: '#ff6b35' },
                { label: t('home.videos'), val: stats.video_count, color: '#ff9900' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: YT_CONTAINER }}>
                  <p className="font-bold text-sm" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Avg Views', val: stats.avg_views, icon: '👁️' },
                { label: 'Avg Likes', val: stats.avg_likes, icon: '❤️' },
                { label: 'Avg Comments', val: stats.avg_comments, icon: '💬' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-2.5 text-center bg-muted">
                  <p className="text-base">{s.icon}</p>
                  <p className="font-bold text-sm text-foreground">{s.val}</p>
                  <p className="text-[9px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {stats.engagement_rate && (
              <div className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#e8f5e9' }}>
                <span className="text-xs font-bold text-green-700">📊 Engagement Rate: {stats.engagement_rate}</span>
              </div>
            )}
            {stats.description && <p className="text-xs text-muted-foreground mt-3 line-clamp-3">{stats.description}</p>}
          </div>
        )}
        {result?.niche && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-red-500">Niche</p>
              </div>
              {result.niche_score && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                  🎯 {result.niche_score}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: YT_GRAD }}>
                {result.niche}
              </span>
            </div>
            {result.sub_niches?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.sub_niches.map((sub: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: YT_CONTAINER, color: YT_COLOR }}>
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {result?.content_pillars?.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-red-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-red-500">What Kind of Content They Make</p>
            </div>
            <div className="space-y-2">
              {result.content_pillars.map((pillar: string, i: number) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: YT_CONTAINER }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: YT_GRAD }}>{i + 1}</div>
                  <p className="text-sm text-foreground">{pillar}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {result?.video_ideas?.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-orange-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Their Typical Video Ideas</p>
            </div>
            <div className="space-y-2">
              {result.video_ideas.map((idea: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted">
                  <span className="text-xs text-muted-foreground mt-0.5 w-5 shrink-0 font-bold">{i + 1}.</span>
                  <p className="text-sm text-foreground flex-1 leading-snug">{idea}</p>
                  <button onClick={() => onCopy(idea, `comp-idea-${i}`)} className="shrink-0">
                    {copied === `comp-idea-${i}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {result?.growth_tips?.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-green-500">Why They Grow Fast</p>
            </div>
            <div className="space-y-2">
              {result.growth_tips.map((tip: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {result?.competitor_insights && (
          <div className="rounded-2xl p-4" style={{ background: YT_CONTAINER, border: '1px solid hsl(var(--primary) / 0.3)' }}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-red-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-red-500">Key Insight</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{result.competitor_insights}</p>
          </div>
        )}
        {result?.shorts?.length > 0 && <VideoGrid title={`Shorts (${result.shorts.length})`} videos={result.shorts} isShorts />}
        {result?.videos?.length > 0 && <VideoGrid title={`Recent Videos (${result.videos.length})`} videos={result.videos} />}
      </div>
    </motion.div>
  );
}

export default function YouTubeAnalyzer() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const _saved = getPageState('ytAnalyzer');

  const [channelUrl, setChannelUrl] = useState(() => _saved?.channelUrl ?? (localStorage.getItem('yt_search_channel') || ""));
  const [loading, setLoading] = useState(false);

  const [searchResult, setSearchResult] = useState<any>(() => {
    if (_saved?.searchResult !== undefined) return _saved.searchResult;
    try {
      const saved = localStorage.getItem('yt_search_result');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [copied, setCopied] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [competitors, setCompetitors] = useState<CompetitorCard[]>(() => {
    if (_saved?.competitors) return _saved.competitors;
    try { return JSON.parse(localStorage.getItem('yt_competitors') || '[]'); } catch { return []; }
  });

  // ── Page-state persistence ──
  const _stateRef = useRef<any>({});
  useEffect(() => {
    _stateRef.current = { channelUrl, searchResult, competitors };
  });
  useEffect(() => () => { setPageState('ytAnalyzer', _stateRef.current); }, []);
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [compInput, setCompInput] = useState('');
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState('');
  const [openCompetitor, setOpenCompetitor] = useState<CompetitorCard | null>(null);

  useEffect(() => { localStorage.setItem('yt_search_channel', channelUrl); }, [channelUrl]);
  useEffect(() => { localStorage.setItem('yt_competitors', JSON.stringify(competitors)); }, [competitors]);

  useEffect(() => {
    if (channelUrl.trim().length > 0) {
      const filtered = POPULAR_CHANNELS.filter(s =>
        s.toLowerCase().includes(channelUrl.toLowerCase()) && s.toLowerCase() !== channelUrl.toLowerCase()
      ).slice(0, 5);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else { setShowDropdown(false); setDropdownSuggestions([]); }
  }, [channelUrl]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const handleClearSearch = () => {
    setChannelUrl(''); setSearchResult(null);
    localStorage.removeItem('yt_search_result');
    localStorage.removeItem('yt_search_channel');
  };

  const handleAnalyzeSearch = async (channel?: string) => {
    const target = channel || channelUrl;
    if (!target.trim()) return;
    setChannelUrl(target); setShowDropdown(false); setLoading(true); setSearchResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: target }),
      });
      const data = await res.json();
      setSearchResult(data);
      localStorage.setItem('yt_search_result', JSON.stringify(data));
      localStorage.setItem('yt_search_channel', target);
    } catch { setSearchResult({ error: 'Failed to analyze channel. Try again.' }); }
    finally { setLoading(false); }
  };

  const addCompetitor = async () => {
    const clean = compInput.trim();
    if (!clean) return;
    if (competitors.find(c => c.channelName.toLowerCase() === clean.toLowerCase())) {
      setCompError('Already added'); return;
    }
    setCompLoading(true); setCompError('');
    try {
      const res = await fetch(`${BASE}/api/youtube/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: clean }),
      });
      const fullData = res.ok ? await res.json() : null;
      const stats = fullData?.channelStats;
      const card: CompetitorCard = {
        channelName: stats?.name || clean,
        thumbnail: stats?.thumbnail,
        subscribers: stats?.subscribers,
        engagement_rate: stats?.engagement_rate,
        savedAt: Date.now(),
        fullData,
      };
      setCompetitors(prev => [card, ...prev]);
      setCompInput('');
      setAddingCompetitor(false);
    } catch { setCompError('Failed to fetch. Try again.'); }
    finally { setCompLoading(false); }
  };

  const removeCompetitor = (channelName: string) => {
    setCompetitors(prev => prev.filter(c => c.channelName !== channelName));
  };

  return (
    <div data-platform="youtube" className={`theme-redesign ${theme} min-h-screen bg-background`}>
      <SEO title="YouTube Analyzer — SocialRum" noindex />
      <AnimatePresence>
        {openCompetitor && (
          <CompetitorDetail competitor={openCompetitor} onBack={() => setOpenCompetitor(null)} onCopy={copyText} copied={copied} />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-card border-b border-border px-5 h-16 flex items-center">
        <div className="flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-500" />
          <h1 className="font-bold text-xl text-foreground">Channel Analyzer</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 pb-28 space-y-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input ref={inputRef} value={channelUrl} onChange={e => setChannelUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAnalyzeSearch(); if (e.key === "Escape") setShowDropdown(false); }}
                    onFocus={e => { e.target.style.borderColor = 'hsl(var(--primary) / 0.6)'; if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                    onBlur={e => { e.target.style.borderColor = ''; }}
                    placeholder="Channel name (e.g. MrBeast, Dhruv Rathee)"
                    className="w-full pl-11 pr-9 py-3.5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all" />
                  {channelUrl && <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="w-4 h-4" /></button>}
                </div>
                <button onClick={() => handleAnalyzeSearch()} disabled={loading || !channelUrl.trim()}
                  className="px-5 py-3.5 rounded-2xl text-white text-sm font-bold disabled:opacity-50" style={{ background: YT_GRAD }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              {showDropdown && (
                <div ref={dropdownRef} className="absolute top-full left-0 mt-1 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden" style={{ width: 'calc(100% - 60px)' }}>
                  {dropdownSuggestions.map((s, i) => (
                    <button key={i} onClick={() => handleAnalyzeSearch(s)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent text-left">
                      <Youtube className="w-3.5 h-3.5 shrink-0 text-red-500" />{s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!channelUrl && !searchResult && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Popular Indian Channels</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CHANNELS.map(ch => (
                    <button key={ch} onClick={() => handleAnalyzeSearch(ch)}
                      className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-red-300 hover:text-red-500 transition-colors">
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
              </div>
            )}
            {searchResult && !searchResult.error && !loading && <AnalysisResults result={searchResult} onCopy={copyText} copied={copied} />}
            {searchResult?.error && <p className="text-sm text-center text-red-500">{searchResult.error}</p>}
        </motion.div>

        {/* Competitor Tracker */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-red-500" />
              <h2 className="font-bold text-sm text-foreground">Competitor Tracker</h2>
              {competitors.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: YT_CONTAINER, color: YT_COLOR }}>
                  {competitors.length}
                </span>
              )}
            </div>
            {!addingCompetitor && (
              <button onClick={() => { setAddingCompetitor(true); setCompError(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-md"
                style={{ background: YT_GRAD }}>
                <Plus className="w-3.5 h-3.5" /> Add Competitor
              </button>
            )}
          </div>
          <AnimatePresence>
            {addingCompetitor && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                    <input autoFocus type="text" value={compInput} onChange={e => setCompInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addCompetitor(); if (e.key === 'Escape') setAddingCompetitor(false); }}
                      placeholder="Channel name (e.g. Dhruv Rathee)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground outline-none text-sm focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all" />
                  </div>
                  <button onClick={addCompetitor} disabled={compLoading || !compInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ background: YT_GRAD }}>
                    {compLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                  </button>
                  <button onClick={() => { setAddingCompetitor(false); setCompInput(''); setCompError(''); }}
                    className="px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {compError && <p className="text-red-500 text-xs mb-2">{compError}</p>}
                {compLoading && (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-muted mb-2">
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    <p className="text-xs text-muted-foreground">Fetching {compInput}…</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {competitors.length === 0 && !addingCompetitor ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: YT_CONTAINER }}>
                <Users className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground">Add competitors to track and compare their channels</p>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              {competitors.map((comp) => (
                <motion.div key={comp.channelName} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:border-red-300 hover:bg-accent/10 transition-all"
                  onClick={() => setOpenCompetitor(comp)}>
                  {comp.thumbnail ? (
                    <img src={comp.thumbnail} alt={comp.channelName} className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: YT_GRAD }}>
                      {comp.channelName[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{comp.channelName}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {comp.subscribers && <span className="text-xs text-muted-foreground"><span className="font-semibold text-muted-foreground">{comp.subscribers}</span> subs</span>}
                      {comp.engagement_rate && <span className="text-xs text-muted-foreground"><span className="font-semibold text-green-600">{comp.engagement_rate}</span> eng.</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(comp.channelName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors hidden sm:block"
                      style={{ background: YT_CONTAINER, color: YT_COLOR }}
                    >
                      View Channel
                    </a>
                    <button onClick={e => { e.stopPropagation(); removeCompetitor(comp.channelName); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AnalysisResults({ result, onCopy, copied, hideStats = false }: { result: any; onCopy: (text: string, key: string) => void; copied: string | null; hideStats?: boolean }) {
  const { t } = useTranslation();
  const stats = result.channelStats;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {stats && !hideStats && (
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-4">
            {stats.thumbnail && <img src={stats.thumbnail} alt="" className="w-12 h-12 rounded-full shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base text-foreground truncate">{stats.name}</p>
              {stats.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{stats.description}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: t('home.subscribers'), val: stats.subscribers, color: '#cc0000' },
              { label: t('home.total_views'), val: stats.total_views, color: '#ff6b35' },
              { label: t('home.videos'), val: stats.video_count, color: '#ff9900' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: YT_CONTAINER }}>
                <p className="font-bold text-sm" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Avg Views', val: stats.avg_views, icon: '👁️' },
              { label: 'Avg Likes', val: stats.avg_likes, icon: '❤️' },
              { label: 'Avg Comments', val: stats.avg_comments, icon: '💬' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-2.5 text-center bg-muted">
                <p className="text-base">{s.icon}</p>
                <p className="font-bold text-sm text-foreground">{s.val}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          {stats.engagement_rate && (
            <div className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#e8f5e9' }}>
              <span className="text-xs font-bold text-green-700">📊 Engagement Rate: {stats.engagement_rate}</span>
            </div>
          )}
        </div>
      )}
      {result.summary && (
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">Channel Summary</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
        </div>
      )}
      {result.niche && (
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-red-500">Niche</p>
            </div>
            {result.niche_score && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                🎯 {result.niche_score}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: YT_GRAD }}>
              {result.niche}
            </span>
          </div>
          {result.sub_niches?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.sub_niches.map((sub: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: YT_CONTAINER, color: YT_COLOR }}>
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {result.content_pillars?.length > 0 && (
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">Content Pillars</p>
          </div>
          <div className="space-y-2">
            {result.content_pillars.map((pillar: string, i: number) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: YT_CONTAINER }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: YT_GRAD }}>{i + 1}</div>
                <p className="text-sm text-foreground">{pillar}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.video_ideas?.length > 0 && (
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-orange-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Video Ideas for You</p>
          </div>
          <div className="space-y-2">
            {result.video_ideas.map((idea: string, i: number) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted">
                <span className="text-xs text-muted-foreground mt-0.5 w-5 shrink-0 font-bold">{i + 1}.</span>
                <p className="text-sm text-foreground flex-1 leading-snug">{idea}</p>
                <button onClick={() => onCopy(idea, `idea-${i}`)} className="shrink-0">
                  {copied === `idea-${i}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.growth_tips?.length > 0 && (
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-green-500">Growth Tips</p>
          </div>
          <div className="space-y-2">
            {result.growth_tips.map((tip: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.competitor_insights && (
        <div className="rounded-2xl p-4" style={{ background: YT_CONTAINER, border: '1px solid hsl(var(--primary) / 0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">Key Insight</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{result.competitor_insights}</p>
        </div>
      )}
      {result.shorts?.length > 0 && <VideoGrid title={`Shorts (${result.shorts.length})`} videos={result.shorts} isShorts />}
      {result.videos?.length > 0 && <VideoGrid title={`Recent Videos (${result.videos.length})`} videos={result.videos} />}
    </motion.div>
  );
}
