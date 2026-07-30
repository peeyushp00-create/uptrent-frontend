import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sparkles, FileText, UserPlus, Bell, BellRing, Bookmark, BookmarkCheck,
  Flame, Eye, Target, Users, TrendingUp, BarChart2, Loader2, Globe, Rocket, ChevronDown,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import SEO from "@/components/SEO";
import { getReelThumbnailSrc, getReelAltText, handleReelThumbnailError } from "@/lib/reelThumbnail";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TRACKED_KEY = "research:tracked_trends";
const SAVED_KEY = "research:saved_reports";

const formatNum = (n?: number) => {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
};

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

interface ResearchReel {
  id: string;
  permalink: string;
  thumbnail: string | null;
  caption: string;
  views: number;
  likes: number;
  rank: number;
  outlier_multiplier: number;
}

interface ResearchSummary {
  summary: string;
  opportunity: string;
  competition: string;
  growth: string;
  audience: string;
}

const STAT_TILES: { key: keyof Omit<ResearchSummary, "summary">; label: string; icon: typeof Target }[] = [
  { key: "opportunity", label: "Opportunity", icon: Target },
  { key: "competition", label: "Competition", icon: Users },
  { key: "growth", label: "Growth", icon: TrendingUp },
  { key: "audience", label: "Audience", icon: BarChart2 },
];

type BreakdownKey = "breakdown" | "winning" | "replicate";

const BREAKDOWN_CHIPS: { key: BreakdownKey; icon: typeof BarChart2; label: string; subtitle: string; color: string }[] = [
  { key: "breakdown", icon: BarChart2, label: "View Breakdown", subtitle: "The numbers behind this niche", color: "#22c55e" },
  { key: "winning", icon: Globe, label: "Why It's Winning", subtitle: "What's driving the trend", color: "#ec4899" },
  { key: "replicate", icon: Rocket, label: "Replicate This", subtitle: "Your practical playbook", color: "#a855f7" },
];

export default function ResearchResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const query = ((location.state as any)?.query || "").trim();

  const platform: "Instagram" | "YouTube" =
    localStorage.getItem("platform") === "youtube" ? "YouTube" : "Instagram";

  const [reels, setReels] = useState<ResearchReel[]>([]);
  const [count, setCount] = useState(0);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [reelsError, setReelsError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const [summary, setSummary] = useState<ResearchSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [tracked, setTracked] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(TRACKED_KEY) || "[]"); } catch { return []; }
  });
  const [saved, setSaved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; }
  });
  const isTracked = tracked.includes(query.toLowerCase());
  const isSaved = saved.includes(query.toLowerCase());

  const [openBreakdown, setOpenBreakdown] = useState<BreakdownKey | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const breakdownContent: Record<BreakdownKey, string | undefined> = {
    breakdown: summary ? [summary.opportunity, summary.competition].filter(Boolean).join(" ") : undefined,
    winning: summary?.growth,
    replicate: summary?.audience,
  };

  const avgViews = reels.length ? Math.round(reels.reduce((s, r) => s + (r.views || 0), 0) / reels.length) : 0;
  const avgLikes = reels.length ? Math.round(reels.reduce((s, r) => s + (r.likes || 0), 0) / reels.length) : 0;
  const avgMultiplier = reels.length
    ? (reels.reduce((s, r) => s + (r.outlier_multiplier || 0), 0) / reels.length).toFixed(1)
    : "0";

  useEffect(() => {
    if (!query || platform !== "Instagram") return;
    setReelsLoading(true);
    setReelsError(false);
    setVisibleCount(5);
    fetch(`${BASE}/api/instagram/research?keyword=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setReels(data.reels || []);
        setCount(data.count || 0);
      })
      .catch(() => setReelsError(true))
      .finally(() => setReelsLoading(false));

    setSummaryLoading(true);
    fetch(`${BASE}/api/instagram/research/summary?keyword=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setSummary(data); })
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, [query]);

  const toggleTrack = () => {
    const key = query.toLowerCase();
    setTracked((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      localStorage.setItem(TRACKED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleSave = () => {
    const key = query.toLowerCase();
    setSaved((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  };

  if (!query) {
    return (
      <div className={`theme-redesign ${theme} min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-5`}>
        <p className="text-muted-foreground text-sm">No research topic given.</p>
        <button onClick={() => navigate("/home")} className="text-primary text-sm font-semibold">
          ← Back to Home
        </button>
      </div>
    );
  }

  if (platform !== "Instagram") {
    return (
      <div className={`theme-redesign ${theme} min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-5 text-center`}>
        <p className="text-foreground font-semibold">Reel-based research is Instagram-only for now.</p>
        <p className="text-muted-foreground text-sm max-w-sm">Switch to Instagram from the sidebar to research &ldquo;{query}&rdquo;.</p>
        <button onClick={() => navigate("/home")} className="text-primary text-sm font-semibold">
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className={`theme-redesign ${theme} min-h-screen bg-background text-foreground px-5 pt-8 pb-16`}>
      <SEO title={`Market intelligence for ${titleCase(query)} — SocialRum`} noindex />

      <div className="w-full max-w-4xl mx-auto space-y-6">

        <button onClick={() => navigate("/home")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3.5" /> Ask another question
        </button>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" /> AI Research Result
          </span>
          <h1
            className="text-3xl md:text-4xl font-bold leading-[1.1] tracking-[-0.01em] text-foreground"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          >
            Market intelligence for {titleCase(query)}
          </h1>
          <p className="text-sm text-muted-foreground">
            You asked: <em className="italic">&ldquo;{query}&rdquo;</em>
          </p>
        </div>

        {/* AI Summary card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel p-5 space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" /> AI Summary · #{query.replace(/\s+/g, "").toUpperCase()}
          </span>

          <p className="text-[15px] leading-relaxed text-foreground">
            {summary?.summary || "Reading every reel, extracting patterns, and drafting your next-move recommendations…"}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STAT_TILES.map(({ key, label, icon: Icon }) => (
              <div key={key} className="rounded-xl p-3.5 bg-secondary/60 border border-border">
                <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                  <Icon className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-xs text-foreground leading-snug">
                  {summary ? summary[key] : <span className="text-muted-foreground">…</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => navigate("/scripts", { state: { topic: query, niche: query } })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:shadow-lg transition-all"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--ring)))" }}
            >
              <FileText className="size-4" /> Generate Script
            </button>
            <button
              onClick={() => navigate("/instagram/analyzer")}
              className="chip"
            >
              <UserPlus className="size-3.5" /> Analyze Competitor
            </button>
            <button onClick={toggleTrack} className="chip">
              {isTracked ? <BellRing className="size-3.5 text-primary" /> : <Bell className="size-3.5" />}
              {isTracked ? "Tracking" : "Track Trend"}
            </button>
            <button onClick={toggleSave} className="chip">
              {isSaved ? <BookmarkCheck className="size-3.5 text-primary" /> : <Bookmark className="size-3.5" />}
              {isSaved ? "Saved" : "Save Research"}
            </button>
          </div>
        </motion.div>

        {summaryLoading && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Building AI report from {count || "…"} reels…
          </p>
        )}

        {/* Breakdown chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {BREAKDOWN_CHIPS.map(({ key, icon: Icon, label, subtitle, color }) => (
            <button
              key={key}
              onClick={() => setOpenBreakdown((cur) => (cur === key ? null : key))}
              className="panel flex items-center gap-3 p-3 text-left hover:bg-accent/40 transition-colors"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ background: `${color}22`, color }}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              </div>
              <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${openBreakdown === key ? "rotate-180" : ""}`} />
            </button>
          ))}
        </div>

        {openBreakdown && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="panel p-4 text-sm leading-relaxed text-foreground">
            {breakdownContent[openBreakdown] || (
              <span className="text-muted-foreground">Still building this part of the report…</span>
            )}
          </motion.div>
        )}

        {/* Top performing reels */}
        {(reelsLoading || reels.length > 0) && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
                Top Performing Reels
              </h2>
              <p className="text-sm text-muted-foreground">The proof behind the analysis · tap any reel for the full breakdown</p>
            </div>

            <button
              onClick={() => setAdvancedOpen((v) => !v)}
              className="panel w-full flex items-center gap-3 p-3 text-left hover:bg-accent/40 transition-colors"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-400">
                <Sparkles className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Optional</p>
                <p className="text-sm font-semibold text-foreground">Advanced insights</p>
              </div>
              <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
            </button>

            {advancedOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="panel p-4 grid grid-cols-3 gap-3 text-center -mt-2">
                {reelsLoading ? (
                  <p className="col-span-3 text-xs text-muted-foreground">Crunching the numbers…</p>
                ) : (
                  <>
                    <div>
                      <p className="text-lg font-bold text-foreground">{formatNum(avgViews)}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg views</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{formatNum(avgLikes)}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg likes</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{avgMultiplier}×</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg outlier</p>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <Flame className="size-3.5" /> Top Performing Reels Right Now
              </span>
              <h3 className="text-xl font-bold text-foreground">The reels behind this report</h3>
              <p className="text-sm text-muted-foreground">Tap any reel to open the full AI breakdown.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {reelsLoading
                ? [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="rounded-xl animate-pulse bg-secondary" style={{ aspectRatio: "9/16" }} />
                  ))
                : reels.slice(0, visibleCount).map((reel) => (
                    <div
                      key={reel.id}
                      onClick={() => reel.permalink && window.open(reel.permalink, "_blank")}
                      className="relative rounded-xl overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: "9/16", background: "#1a1a2e" }}
                    >
                      <img
                        src={getReelThumbnailSrc(reel.thumbnail)}
                        alt={getReelAltText(reel.caption, undefined)}
                        referrerPolicy="no-referrer" loading="lazy" decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={handleReelThumbnailError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/30" />

                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                        <Flame className="size-3 text-orange-400" />
                        <span className="text-[10px] font-bold text-white">#{reel.rank}</span>
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                        <Eye className="size-3 text-white/80" />
                        <span className="text-[10px] font-semibold text-white">{formatNum(reel.views)}</span>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: "hsl(var(--primary))" }}>
                          {reel.outlier_multiplier}×
                        </span>
                      </div>
                    </div>
                  ))}
            </div>

            {!reelsLoading && visibleCount < reels.length && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setVisibleCount((v) => v + 5)}
                  className="chip"
                >
                  Load more ({reels.length - visibleCount} more)
                </button>
              </div>
            )}

            {reelsError && !reelsLoading && (
              <p className="text-xs text-muted-foreground text-center py-3">Couldn&apos;t load reels for this topic right now.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
