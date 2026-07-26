import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Sparkles, Instagram, Youtube, Play, Heart, Eye,
  RefreshCw, Loader2, TrendingUp, FileText, Newspaper, Users, AlertTriangle, WifiOff, Send, ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';
import { getReelThumbnailSrc, getReelAltText, handleReelThumbnailError } from "@/lib/reelThumbnail";
import { interpretReelSearchResponse } from "@/lib/reelSearchStatus";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const HOME_REELS_SESSION_KEY = "home_reels_session";
type ViewFilter = "all" | "10k-10m" | "10k-50k" | "50k-500k" | "500k-1m" | "1m-10m";

const VIEW_FILTER_OPTIONS: { value: ViewFilter; label: string; min?: number; max?: number }[] = [
  { value: "all", label: "All reels" },
  { value: "10k-10m", label: "10K–10M views", min: 10_000, max: 10_000_000 },
  { value: "10k-50k", label: "10K–50K views", min: 10_000, max: 50_000 },
  { value: "50k-500k", label: "50K–500K views", min: 50_000, max: 500_000 },
  { value: "500k-1m", label: "500K–1M views", min: 500_000, max: 1_000_000 },
  { value: "1m-10m", label: "1M–10M views", min: 1_000_000, max: 10_000_000 },
];

function filterInstagramVideos(videos: any[], filter: ViewFilter) {
  const range = VIEW_FILTER_OPTIONS.find(option => option.value === filter) || VIEW_FILTER_OPTIONS[0];
  if (range.value === "all") return videos;
  return videos.filter(video => {
    const views = Number(video.views);
    return Number.isFinite(views) && views >= range.min! && views <= range.max!;
  });
}

function loadHomeReelsSession() {
  try {
    const raw = sessionStorage.getItem(HOME_REELS_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ✅ Instagram CDN thumbnails are referrer-blocked → route them through our proxy
const proxyImg = (url?: string) =>
  url && /(cdninstagram\.com|fbcdn\.net)/i.test(url)
    ? `${BASE}/api/instagram/img?u=${encodeURIComponent(url)}`
    : (url || "");

// ✅ Maps our raw reel/video object (from HikerAPI / YouTube search) into the
// shape InsightPage expects (item.platform, item.virality as a number, etc.)
function toInsightItem(video: any, isIG: boolean, niche?: string) {
  const hashtags = (video.caption || '')
    .match(/#[a-zA-Z0-9_]+/g)?.slice(0, 8) || [];

 return {
    id: video.id,
    platform: isIG ? 'instagram' : 'youtube',
    user: video.username || video.channel_title || 'unknown',
    name: video.full_name || video.channel_title || video.username || 'Unknown',
    avatar: (video.full_name || video.username || '?')[0]?.toUpperCase(),
    profile_pic_url: proxyImg(video.profile_pic_url),
    thumbnail: proxyImg(video.thumbnail),
    caption: video.caption || video.title || '',
    isVideo: true,
    instagramUrl: isIG ? video.permalink : undefined,
    youtubeUrl: !isIG ? video.permalink : undefined,
    views: formatMetric(video.views),
    likes: formatNum(Number(video.likes) || 0),
    comments: formatNum(Number(video.comments) || 0),
    shares: formatNum(Number(video.shares) || 0),
    virality: video.virality?.score ?? 0,
    boosted: false,
    hashtags,
    audio: video.audio_title || undefined,
    niche: niche || undefined,
  };
}

const WORDS = ["Discover.", "Create.", "Go Viral."];

const FLOATING_TAGS = [
  { text: "#FinanceTips", x: "8%", y: "20%", delay: 0 },
  { text: "#Cricket2026", x: "75%", y: "15%", delay: 0.3 },
  { text: "#Viral", x: "85%", y: "45%", delay: 0.6 },
  { text: "#Reels", x: "5%", y: "60%", delay: 0.9 },
  { text: "#Shorts", x: "80%", y: "70%", delay: 1.2 },
  { text: "#AIContent", x: "10%", y: "80%", delay: 1.5 },
];

function formatNum(n: number) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function formatMetric(value: unknown) {
  if (value === null || value === undefined || value === '') return 'N/A';
  const number = Number(value);
  return Number.isFinite(number) ? formatNum(number) : 'N/A';
}

type AssistantCta = { label: string; feature: "trending" | "scripts" | "studio" | "news"; query?: string };
type AssistantMsg =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; cta?: AssistantCta; pending?: boolean };

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const restored = useRef(loadHomeReelsSession()).current;

  const [platform, setPlatform] = useState<"Instagram" | "YouTube">(() => {
    if (restored?.platform === "Instagram" || restored?.platform === "YouTube") {
      return restored.platform;
    }
    const saved = localStorage.getItem("platform");
    return saved === "youtube" ? "YouTube" : "Instagram";
  });
  const [instagramSearchMode, setInstagramSearchMode] = useState<"keyword" | "hashtag">(
    restored?.instagramSearchMode === "hashtag" ? "hashtag" : "keyword"
  );

  // ✅ Restore search + results from sessionStorage on mount so navigating
  // away (e.g. to /insight) and back doesn't lose the user's search.
  // Restore submitted results, but leave the visible input ready for a new search.
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState(restored?.search || "");
  const [searchRequestId, setSearchRequestId] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [videos, setVideos] = useState<any[]>(restored?.videos || []);
  const [viewFilter, setViewFilter] = useState<ViewFilter>(
    VIEW_FILTER_OPTIONS.some(option => option.value === restored?.viewFilter)
      ? restored.viewFilter
      : "all"
  );
  const [videosLoading, setVideosLoading] = useState(false);
  // Distinguishes *why* the results grid is empty — a successful search with
  // zero matches reads very differently from "we couldn't reach the server"
  // or "the reel provider is temporarily down". 'idle' = no search run yet.
  const [videosStatus, setVideosStatus] = useState<"idle" | "ok" | "network_error" | "upstream_unavailable">(
    restored?.videos?.length ? "ok" : "idle"
  );
  const [videosMessage, setVideosMessage] = useState<string | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [chipsLoading, setChipsLoading] = useState(false);
  const [ytConnecting, setYtConnecting] = useState(false);
  const [platformStats, setPlatformStats] = useState({ news: 0, topics: 0 });

  const ytChannel = user?.user_metadata?.youtube_channel || null;
  const isIG = platform === "Instagram";
  const viewFilteredVideos = isIG ? filterInstagramVideos(videos, viewFilter) : videos;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('youtube') === 'connected') {
      window.history.replaceState({}, '', '/home');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const handleCustom = (e: any) => {
      const nextPlatform = e.detail === "youtube" ? "YouTube" : "Instagram";
      if (platform === nextPlatform) return;
      setPlatform(nextPlatform);
      setVideos([]); setSearch(''); setSubmittedSearch('');
      try { sessionStorage.removeItem(HOME_REELS_SESSION_KEY); } catch { }
    };
    window.addEventListener("platformChanged", handleCustom);
    return () => window.removeEventListener("platformChanged", handleCustom);
  }, [platform]);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [newsRes, topicsRes] = await Promise.all([
          fetch(`${BASE}/api/news?filter=today`),
          fetch(`${BASE}/api/topics?type=instagram`),
        ]);
        const newsData = await newsRes.json();
        const topicsData = await topicsRes.json();
        setPlatformStats({
          news: Array.isArray(newsData) ? newsData.length : 0,
          topics: Array.isArray(topicsData) ? topicsData.length : 0,
        });
      } catch { }
    };
    fetchStats();
  }, []);

  const fetchSuggestions = async () => {
    setChipsLoading(true);
    const niches = user?.user_metadata?.niches?.join(',') || '';
    const channelContext = ytChannel?.channel_name ? `,${ytChannel.channel_name}` : '';
    const p = isIG ? 'instagram' : 'youtube';
    try {
      const userLanguage = localStorage.getItem('userLanguage') || 'english';
      const res = await fetch(`${BASE}/api/topics/suggestions?platform=${p}&niches=${encodeURIComponent(niches + channelContext)}&language=${userLanguage}`);
      const data = await res.json();
      setChips(data.suggestions || []);
    } catch { } finally { setChipsLoading(false); }
  };

  useEffect(() => { fetchSuggestions(); }, [platform]);

  // ✅ Search: Instagram → Indian reel search, YouTube → existing search
  const PAGE_SIZE = 12; // show up to 12 reels per search/load
  const DISCOVERY_POOL_SIZE = 50;
  const [videosHasMore, setVideosHasMore] = useState(restored?.hasMore || false);
  const [videosLoadingMore, setVideosLoadingMore] = useState(false);
  const videosPageRef = useRef(restored?.page || 1);
  const skipNextSearchEffect = useRef(Boolean(restored?.videos?.length));

  // ✅ Persist current search results so they survive navigating to /insight
  // and back (or a refresh) within the same browser session.
  const saveSession = (
    nextSearch: string,
    nextVideos: any[],
    nextHasMore: boolean,
    nextPage: number,
    nextViewFilter: ViewFilter = viewFilter,
  ) => {
    try {
      sessionStorage.setItem(HOME_REELS_SESSION_KEY, JSON.stringify({
        search: nextSearch,
        videos: nextVideos,
        hasMore: nextHasMore,
        page: nextPage,
        platform,
        instagramSearchMode,
        viewFilter: nextViewFilter,
      }));
    } catch { }
  };

  useEffect(() => {
    const keyword = submittedSearch.trim();
    if (!keyword) {
      setVideosLoading(false);
      setVideos([]); setVideosHasMore(false); setVideosStatus("idle"); setVideosMessage(null);
      try { sessionStorage.removeItem(HOME_REELS_SESSION_KEY); } catch { }
      return;
    }

    // Skip the very first run if we just restored a matching search from
    // sessionStorage — avoids re-fetching page 1 and wiping Load More progress.
    if (skipNextSearchEffect.current) {
      skipNextSearchEffect.current = false;
      return;
    }

    const controller = new AbortController();
    const fetchVideos = async () => {
      setVideosLoading(true);
      videosPageRef.current = 1;
      try {
        const res = isIG
          ? await fetch(`${BASE}/api/instagram/search?keyword=${encodeURIComponent(keyword)}&mode=${instagramSearchMode}&page=1&limit=${DISCOVERY_POOL_SIZE}`, { signal: controller.signal })
          : await fetch(`${BASE}/api/search/youtube?q=${encodeURIComponent(keyword)}`, { signal: controller.signal });

        const data = res.ok ? await res.json().catch(() => null) : null;
        const outcome = interpretReelSearchResponse(res.ok, data, isIG);

        const qualifiedVideos = outcome.videos;
        const hasMore = isIG
          ? filterInstagramVideos(qualifiedVideos, viewFilter).length > PAGE_SIZE
          : outcome.hasMore;

        setVideos(qualifiedVideos);
        setVideosHasMore(hasMore);
        setVideosStatus(outcome.status);
        setVideosMessage(outcome.message);
        if (outcome.status !== "network_error") saveSession(keyword, qualifiedVideos, hasMore, 1);
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error(e);
        setVideos([]); setVideosHasMore(false);
        setVideosStatus("network_error"); setVideosMessage(null);
      } finally {
        if (!controller.signal.aborted) setVideosLoading(false);
      }
    };

    fetchVideos();
    return () => controller.abort();
  }, [submittedSearch, searchRequestId, platform, instagramSearchMode]);

  const submitSearch = (term = search) => {
    const keyword = term.trim();
    if (!keyword || videosLoading) return;
    setSearch(keyword);
    setSubmittedSearch(keyword);
    setSearchRequestId(id => id + 1);
  };

  const clearResults = () => {
    setSearch("");
    setSubmittedSearch("");
    setVideos([]);
    setVideosHasMore(false);
    setVideosStatus("idle");
    setVideosMessage(null);
    setViewFilter("all");
    videosPageRef.current = 1;
    try { sessionStorage.removeItem(HOME_REELS_SESSION_KEY); } catch { }
  };

  const changeViewFilter = (nextFilter: ViewFilter) => {
    const filtered = filterInstagramVideos(videos, nextFilter);
    const hasMore = filtered.length > PAGE_SIZE;
    setViewFilter(nextFilter);
    videosPageRef.current = 1;
    setVideosHasMore(hasMore);
    saveSession(submittedSearch, videos, hasMore, 1, nextFilter);
  };

  const openInsight = (video: any) => {
    // Save synchronously before leaving so browser Back restores this exact grid.
    saveSession(submittedSearch, videos, videosHasMore, videosPageRef.current);
    navigate('/insight', {
      state: { item: toInsightItem(video, isIG, submittedSearch) },
    });
  };

  const loadMoreVideos = () => {
    if (!isIG || videosLoadingMore) return;
    setVideosLoadingMore(true);
    const nextPage = videosPageRef.current + 1;
    const hasMore = nextPage * PAGE_SIZE < viewFilteredVideos.length;
    videosPageRef.current = nextPage;
    setVideosHasMore(hasMore);
    saveSession(submittedSearch, videos, hasMore, nextPage);
    setVideosLoadingMore(false);
  };

  const handleYtConnect = async () => {
    if (!user?.id) { navigate('/login'); return; }
    setYtConnecting(true);
    try {
      const res = await fetch(`${BASE}/api/youtube/oauth/url?userId=${user.id}`);
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { console.error(e); setYtConnecting(false); }
  };

  // ── Ask-anything assistant (new — ported from the Lovable redesign's home
  // chat composer, rewired onto our own Express endpoint at /api/home/intent
  // instead of its Lovable-gateway version). Sits above the existing search;
  // doesn't replace it. ──
  const [assistantMessages, setAssistantMessages] = useState<AssistantMsg[]>([]);
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantSending, setAssistantSending] = useState(false);
  const assistantStarted = assistantMessages.length > 0;
  const niche = (user?.user_metadata?.niches?.[0] || 'content').toLowerCase();
  const firstName = (user?.user_metadata?.full_name || user?.email || 'there').split(/[\s@]/)[0];

  function runAssistantCta(cta: AssistantCta) {
    const q = cta.query?.trim() || niche;
    if (cta.feature === "trending") navigate(isIG ? `/instagram/analyzer` : `/youtube/trending`, { state: { query: q } });
    else if (cta.feature === "scripts") navigate('/scripts', { state: { topic: q, niche } });
    else if (cta.feature === "studio") navigate('/studio');
    else if (cta.feature === "news") navigate('/news');
  }

  async function submitAssistant(e: React.FormEvent) {
    e.preventDefault();
    const q = assistantQuery.trim();
    if (!q || assistantSending) return;
    setAssistantQuery("");
    setAssistantMessages((prev) => [...prev, { role: "user", text: q }, { role: "assistant", text: "", pending: true }]);
    setAssistantSending(true);
    try {
      const res = await fetch(`${BASE}/api/home/intent`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q, niche, name: firstName }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.mode === "research") {
        setAssistantMessages((prev) => prev.filter((m) => !(m.role === "assistant" && m.pending)));
        navigate('/discover', { state: { q: data.topic || q } });
        return;
      }
      const answer = data.answer || (data.error ? `Sorry — I couldn't answer that (${data.error}).` : "Sorry — I couldn't answer that just now.");
      setAssistantMessages((prev) => {
        const next = prev.filter((m) => !(m.role === "assistant" && m.pending));
        next.push({ role: "assistant", text: answer });
        return next;
      });
    } catch (err) {
      setAssistantMessages((prev) => {
        const next = prev.filter((m) => !(m.role === "assistant" && m.pending));
        next.push({ role: "assistant", text: `Sorry — something went wrong: ${(err as Error).message}` });
        return next;
      });
    } finally {
      setAssistantSending(false);
    }
  }

  return (
    <div
      className={`theme-redesign ${theme} min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col items-center px-5 py-12`}
      data-platform={isIG ? undefined : "youtube"}
    >

      {/* BG blob */}
      <motion.div animate={{ scale:[1,1.15,1], opacity:[0.06,0.12,0.06] }} transition={{ duration:10, repeat:Infinity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none rounded-full bg-primary"
        style={{ filter:"blur(80px)" }} />

      {/* Floating tags */}
      {FLOATING_TAGS.map((tag, i) => (
        <motion.div key={i}
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:[0,0.6,0.6,0], y:[20,0,0,-20] }}
          transition={{ duration:4, delay:tag.delay, repeat:Infinity, repeatDelay:3 }}
          className="absolute hidden md:block text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none bg-secondary text-primary"
          style={{ left:tag.x, top:tag.y }}>
          {tag.text}
        </motion.div>
      ))}

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center gap-8">

        {/* Headline */}
        <div className="text-center space-y-3">
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
            className="eyebrow chip text-primary">
            <motion.span animate={{ opacity:[1,0.2,1] }} transition={{ duration:1.5, repeat:Infinity }}
              className="w-1.5 h-1.5 rounded-full inline-block bg-primary" />
            {t('home.badge')}
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="font-heading text-5xl md:text-6xl font-bold leading-tight">
            <AnimatePresence mode="wait">
              <motion.span key={wordIndex}
                initial={{ opacity:0, y:30, filter:'blur(8px)' }}
                animate={{ opacity:1, y:0, filter:'blur(0px)' }}
                exit={{ opacity:0, scale:0.95, filter:'blur(8px)' }}
                transition={{ duration:0.3 }}
                className="block overflow-hidden gradient-text">
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
            <span className="block text-foreground text-3xl md:text-4xl mt-1">
              {ytChannel && !isIG
                ? `Welcome, ${ytChannel.channel_name.split(' ')[0]}!`
                : 'Content that gets discovered'}
            </span>
          </motion.h1>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
            className="text-muted-foreground text-base max-w-md mx-auto">
            {ytChannel && !isIG
              ? `${formatNum(Number(ytChannel.subscribers || 0))} ${t('home.subscribers')} · ${formatNum(Number(ytChannel.video_count || 0))} ${t('home.videos')} · Let's grow 🚀`
              : t('home.subtitle')}
          </motion.p>
        </div>

        {/* Ask-anything composer (new) */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }} className="w-full">
          {!assistantStarted ? (
            <form onSubmit={submitAssistant} className="w-full">
              <div className="chat-input-glow flex items-center gap-3 rounded-2xl border border-input bg-card py-2 pl-4 pr-2">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <input
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  placeholder="Ask anything — what should I post today?"
                  className="flex-1 bg-transparent outline-none text-[15px] py-3 placeholder:text-muted-foreground min-w-0"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={assistantSending || !assistantQuery.trim()}
                  className="shrink-0 grid place-items-center size-10 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="panel flex flex-col gap-3 p-4 max-h-[360px] overflow-y-auto">
              {assistantMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "user" ? (
                    <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md text-sm bg-primary text-primary-foreground">
                      {m.text}
                    </div>
                  ) : (
                    <div className="max-w-[92%] text-sm leading-relaxed text-foreground">
                      {m.pending ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-current animate-pulse" />
                          <span className="size-1.5 rounded-full bg-current animate-pulse [animation-delay:120ms]" />
                          <span className="size-1.5 rounded-full bg-current animate-pulse [animation-delay:240ms]" />
                        </span>
                      ) : (
                        <>
                          <div>{m.text}</div>
                          {m.cta && (
                            <button
                              onClick={() => runAssistantCta(m.cta!)}
                              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                            >
                              {m.cta.label} <ArrowRight className="size-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <form onSubmit={submitAssistant} className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  placeholder="Reply…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                <button type="submit" disabled={assistantSending || !assistantQuery.trim()} className="text-primary disabled:opacity-40">
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          )}
        </motion.div>

        {/* Channel connect / status */}
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.5 }}
          className="flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            {isIG ? (
              <motion.button key="ig"
                initial={{ opacity:0, scale:0.9, y:8 }} animate={{ opacity:1, scale:1, y:0 }}
                exit={{ opacity:0, scale:0.9, y:-8 }} transition={{ duration:0.3 }}
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-[var(--redesign-shadow-glow)]">
                <Instagram className="w-4 h-4" /> {t('home.connect_instagram')}
              </motion.button>
            ) : ytChannel ? (
              <motion.div key="yt-connected"
                initial={{ opacity:0, scale:0.9, y:8 }} animate={{ opacity:1, scale:1, y:0 }}
                exit={{ opacity:0, scale:0.9, y:-8 }} transition={{ duration:0.3 }}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-border bg-secondary">
                {ytChannel.channel_thumbnail && <img src={ytChannel.channel_thumbnail} alt="" className="w-9 h-9 rounded-full shrink-0" />}
                <div className="text-left">
                  <p className="text-sm font-bold text-primary">{ytChannel.channel_name}</p>
                  <div className="flex gap-3">
                    <span className="text-xs text-muted-foreground">{formatNum(Number(ytChannel.subscribers || 0))} {t('home.subscribers')}</span>
                    <span className="text-xs text-muted-foreground">{formatNum(Number(ytChannel.video_count || 0))} {t('home.videos')}</span>
                  </div>
                </div>
                <button onClick={() => navigate('/settings')} className="text-xs text-muted-foreground hover:text-foreground ml-1">⚙️</button>
              </motion.div>
            ) : (
              <motion.button key="yt-connect"
                initial={{ opacity:0, scale:0.9, y:8 }} animate={{ opacity:1, scale:1, y:0 }}
                exit={{ opacity:0, scale:0.9, y:-8 }} transition={{ duration:0.3 }}
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
                onClick={handleYtConnect} disabled={ytConnecting}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold bg-primary text-primary-foreground disabled:opacity-70 shadow-[var(--redesign-shadow-glow)]">
                {ytConnecting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('home.connecting')}</>
                  : <><Youtube className="w-4 h-4" /> {t('home.connect_youtube')}</>}
              </motion.button>
            )}
          </AnimatePresence>
          <p className="text-xs text-muted-foreground">
            {!isIG && ytChannel ? '✅ ' + t('home.connected') : t('home.connect_hint')}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }} className="w-full">
          {isIG && (
            <div className="flex gap-2 mb-2" aria-label="Instagram search mode">
              {(["keyword", "hashtag"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInstagramSearchMode(mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    instagramSearchMode === mode ? "bg-primary text-primary-foreground border-primary" : "bg-card text-primary border-primary"
                  }`}
                >
                  {mode === "keyword" ? "Keyword" : "# Hashtag"}
                </button>
              ))}
            </div>
          )}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitSearch(); }}
                placeholder={isIG ? (instagramSearchMode === "hashtag" ? "Search a hashtag (without #)..." : t('home.search_placeholder_ig')) : ytChannel ? `Search ${ytChannel.channel_name} niche...` : t('home.search_placeholder_yt')}
                className={`w-full pl-11 pr-10 py-4 rounded-2xl text-sm bg-card text-foreground placeholder:text-muted-foreground outline-none transition-all border-2 ${search ? "border-primary ring-4 ring-primary/15" : "border-border"}`} />
              {search && <button onClick={() => { setSearch(''); setSubmittedSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="w-4 h-4" /></button>}
            </div>
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              onClick={() => submitSearch()}
              disabled={!search.trim() || videosLoading}
              className="px-6 py-4 rounded-2xl text-primary-foreground font-bold text-sm flex items-center gap-2 bg-primary disabled:opacity-50">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Video Results */}
        <AnimatePresence>
          {(videosLoading || videosStatus !== "idle") && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="w-full">
              <div className="flex items-center gap-2 mb-3">
                {isIG ? <Instagram className="w-4 h-4 text-primary" /> : <Youtube className="w-4 h-4 text-primary" />}
                <p className="text-xs font-bold uppercase tracking-wider flex-1 text-primary">
                  {isIG ? 'Instagram Reels' : 'YouTube Shorts'} for "{submittedSearch}"
                </p>
                {isIG && (
                  <select
                    value={viewFilter}
                    onChange={event => changeViewFilter(event.target.value as ViewFilter)}
                    className="rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-semibold text-foreground outline-none focus:border-primary"
                    aria-label="Filter reels by views"
                  >
                    {VIEW_FILTER_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={clearResults}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label="Clear reel results"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
              {videosLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="bg-card rounded-2xl animate-pulse" style={{ aspectRatio:'9/16' }} />)}
                </div>
              ) : viewFilteredVideos.length === 0 ? (
                <div data-testid="reels-empty-state" className="flex flex-col items-center text-center gap-2 py-10 px-4 rounded-2xl border border-border bg-card">
                  {videosStatus === "network_error" ? (
                    <>
                      <WifiOff className="w-6 h-6 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">Couldn't reach the server</p>
                      <p className="text-xs text-muted-foreground max-w-xs">Check your connection and try again.</p>
                    </>
                  ) : videosStatus === "upstream_unavailable" ? (
                    <>
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                      <p className="text-sm font-semibold text-foreground">Reel search is temporarily unavailable</p>
                      <p className="text-xs text-muted-foreground max-w-xs">{videosMessage || "The reel provider is temporarily down. Please try again shortly."}</p>
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">No reels in this view range found for "{submittedSearch}"</p>
                      <p className="text-xs text-muted-foreground max-w-xs">Try a different keyword.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {viewFilteredVideos.slice(0, isIG ? videosPageRef.current * PAGE_SIZE : viewFilteredVideos.length).map((video, i) => (
                    <motion.div key={video.id || i}
                      initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                      transition={{ delay:i * 0.05 }}
                      onClick={() => openInsight(video)}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group bg-card"
                      style={{ aspectRatio:'9/16' }}>
                      <img src={getReelThumbnailSrc(video.thumbnail)} alt={getReelAltText(video.caption, video.username)}
                        referrerPolicy="no-referrer" loading="lazy" decoding="async"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={handleReelThumbnailError} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-white text-[8px] font-bold ${isIG ? "bg-gradient-to-br from-fuchsia-500 to-purple-600" : "bg-red-600"}`}>
                        {isIG ? 'Reels' : 'Shorts'}
                      </div>
                      {video.virality?.label && (
                        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-white text-[8px] font-bold ${video.virality.score >= 65 ? 'bg-green-600' : 'bg-primary'}`}>
                          {video.virality.label}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (video.permalink) window.open(video.permalink, '_blank');
                          }}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur">
                          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-[9px] font-semibold line-clamp-2 leading-tight mb-1">{video.caption}</p>
                        <div className="flex items-center gap-2">
                          <Eye className="w-2.5 h-2.5 text-white/70" />
                          <span className="text-[8px] text-white/70">{formatMetric(video.views)}</span>
                          <Heart className="w-2.5 h-2.5 text-white/70" />
                          <span className="text-[8px] text-white/70">{formatNum(Number(video.likes) || 0)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {!videosLoading && isIG && videosHasMore && (
                <button
                  onClick={loadMoreVideos}
                  disabled={videosLoadingMore}
                  className="mx-auto mt-4 block px-6 py-2.5 rounded-full text-sm font-semibold text-primary-foreground bg-primary transition-transform active:scale-95 disabled:opacity-60 flex items-center gap-2">
                  {videosLoadingMore ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : 'Load More'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Chip Suggestions */}
        {!search && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }} className="w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {ytChannel && !isIG ? `🎯 ${t('home.trending_ideas')}` : isIG ? t('home.trending_ideas') : t('home.popular_topics')}
              </p>
              <button onClick={fetchSuggestions} disabled={chipsLoading}
                className="flex items-center gap-1 text-xs font-bold transition-colors disabled:opacity-40 text-primary">
                <RefreshCw className={`w-3 h-3 ${chipsLoading ? 'animate-spin' : ''}`} />
                {t('home.refresh')}
              </button>
            </div>
            {chipsLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-8 w-24 rounded-full bg-card animate-pulse border border-border" />)}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="wait">
                  {chips.map((chip, i) => (
                    <motion.button key={`${platform}-${chip}`}
                      initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                      exit={{ opacity:0, scale:0.8 }} transition={{ delay:i * 0.03 }}
                      onClick={() => submitSearch(chip)}
                      whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
                      className={`chip transition-all hover:shadow-sm ${i < 6 && isIG ? "border-primary/40" : ""}`}>
                      {i < 6 && isIG && <span className="text-primary">🔥</span>}
                      {chip}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick nav */}
        {!search && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
            className="flex gap-3 flex-wrap justify-center">
            {[
              { label: t('home.news_feed'), path:"/news" },
              { label: t('home.scripts'), path:"/scripts" },
              { label: t('home.trending'), path:"/trending" },
            ].map((item, i) => (
              <button key={i} onClick={() => navigate(item.path)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:border-primary hover:text-primary transition-colors">
                {item.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Dashboard Stats */}
        {!search && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.0 }}
            className="w-full space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('home.dashboard_stats')}</p>

            {ytChannel && !isIG && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Users, label: t('home.subscribers'), val: formatNum(Number(ytChannel.subscribers || 0)) },
                  { icon: Eye, label: t('home.total_views'), val: formatNum(Number(ytChannel.total_views || 0)) },
                  { icon: FileText, label: t('home.videos'), val: formatNum(Number(ytChannel.video_count || 0)) },
                ].map((stat, i) => (
                  <motion.div key={i}
                    initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                    transition={{ delay: 1.1 + i * 0.05 }}
                    className="rounded-2xl p-3 text-center border border-border bg-secondary">
                    <stat.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="font-bold text-sm text-foreground">{stat.val}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Newspaper, label: t('home.todays_news'), val: platformStats.news, sublabel: t('home.articles'), path: '/news' },
                { icon: TrendingUp, label: t('home.trending_topics'), val: platformStats.topics, sublabel: t('home.topics'), path: '/trending' },
              ].map((stat, i) => (
                <motion.button key={i}
                  initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay: 1.2 + i * 0.05 }}
                  onClick={() => navigate(stat.path)}
                  className="rounded-2xl p-4 text-left border border-border bg-secondary hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-semibold text-primary">View →</span>
                  </div>
                  <p className="font-bold text-xl text-foreground">{stat.val}</p>
                  <p className="text-xs text-muted-foreground">{stat.sublabel} · {stat.label}</p>
                </motion.button>
              ))}
            </div>

            {user?.user_metadata?.niches?.length > 0 && (
              <div className="bg-card rounded-2xl p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{t('home.your_niches')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.user_metadata.niches.map((niche: string) => (
                    <span key={niche} onClick={() => submitSearch(niche)}
                      className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity bg-secondary text-primary">
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
