import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, TrendingUp, Flame, Target, Sparkles, Hash,
  Lightbulb, Clock, ArrowRight, Play, Eye, Heart,
} from "lucide-react";
import SEO from "@/components/SEO";
import { useTheme } from "@/contexts/ThemeContext";
import { getReelThumbnailSrc, getReelAltText, handleReelThumbnailError } from "@/lib/reelThumbnail";
import { interpretReelSearchResponse } from "@/lib/reelSearchStatus";
import { getPageState, setPageState } from "@/lib/pageCache";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Insight {
  summary: string;
  demand: "low" | "medium" | "high";
  competition: "low" | "medium" | "high";
  growth: "declining" | "stable" | "rising";
  opportunityScore: number;
  viralityScore: number;
  saturation: "low" | "medium" | "high";
  bestPostingTime: string;
  recommendations: {
    topics: string[];
    gaps: string[];
    hookStyles: string[];
    formats: string[];
    keywords: string[];
    hashtags: string[];
  };
}

function levelColor(level: string) {
  if (level === "high" || level === "rising") return "text-green-600";
  if (level === "medium" || level === "stable") return "text-amber-600";
  return "text-muted-foreground";
}

export default function DiscoverPage() {
  const { theme } = useTheme();
  const location = useLocation();
  const _saved = getPageState("discover");
  const initialQuery = (location.state as any)?.q || (location.state as any)?.query || _saved?.query || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [reels, setReels] = useState<any[]>(_saved?.reels ?? []);
  const [insight, setInsight] = useState<Insight | null>(_saved?.insight ?? null);
  const [error, setError] = useState("");

  const research = async (term = query) => {
    const topic = term.trim();
    if (!topic || loading) return;
    setLoading(true);
    setError("");
    setInsight(null);
    try {
      const reelsRes = await fetch(`${BASE}/api/instagram/search?keyword=${encodeURIComponent(topic)}&mode=keyword&page=1&limit=15`);
      const reelsData = reelsRes.ok ? await reelsRes.json().catch(() => null) : null;
      const outcome = interpretReelSearchResponse(reelsRes.ok, reelsData, true);
      setReels(outcome.videos);

      const insightRes = await fetch(`${BASE}/api/discover/insight`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: topic, reels: outcome.videos }),
      });
      const insightData = await insightRes.json().catch(() => ({}));
      if (!insightRes.ok) {
        setError(insightData.error || "Couldn't generate a research report right now.");
      } else {
        setInsight(insightData.insight);
      }
      setPageState("discover", { query: topic, reels: outcome.videos, insight: insightData.insight ?? null });
    } catch (e) {
      setError("Something went wrong — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`theme-redesign ${theme} min-h-screen bg-background text-foreground`}>
      <SEO title="Discover — SocialRum" noindex />

      <header className="sticky top-0 z-40 bg-card border-b border-border px-5 h-16 flex items-center">
        <h1 className="font-heading font-bold text-xl text-primary">Discover</h1>
        <p className="text-sm text-muted-foreground ml-3 hidden sm:block">Research any topic before you make it</p>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 pb-28 space-y-5">
        <div className="panel p-4">
          <p className="text-sm text-muted-foreground mb-3">Enter a topic or niche to get a full content research report</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") research(); }}
                placeholder="e.g. personal finance, home workouts, IPL..."
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground outline-none text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              onClick={() => research()}
              disabled={loading || !query.trim()}
              className="px-5 py-3 rounded-xl text-primary-foreground font-bold text-sm bg-primary disabled:opacity-60 hover:shadow-lg transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Research</>}
            </button>
          </div>
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="panel p-6 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Pulling real reels and building your research report…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {insight && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">Opportunity Report</h2>
              <span className="ml-auto chip">Score {insight.opportunityScore}/100</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{insight.summary}</p>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Demand</p>
                <p className={`text-sm font-bold capitalize ${levelColor(insight.demand)}`}>{insight.demand}</p>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Competition</p>
                <p className={`text-sm font-bold capitalize ${levelColor(insight.competition)}`}>{insight.competition}</p>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Growth</p>
                <p className={`text-sm font-bold capitalize ${levelColor(insight.growth)}`}>{insight.growth}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" /> Best posting time: <span className="font-semibold text-foreground">{insight.bestPostingTime}</span>
            </div>

            {insight.recommendations?.topics?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-primary" /> Angles to try</p>
                <div className="space-y-1.5">
                  {insight.recommendations.topics.map((topic, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insight.recommendations?.hashtags?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-primary" /> Hashtags</p>
                <div className="flex flex-wrap gap-2">
                  {insight.recommendations.hashtags.map((h, i) => (
                    <span key={i} className="chip">#{h}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {reels.length > 0 && !loading && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Trending reels for "{query}"</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {reels.slice(0, 15).map((reel: any, i: number) => (
                <div
                  key={reel.id || i}
                  onClick={() => reel.permalink && window.open(reel.permalink, "_blank")}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group bg-card"
                  style={{ aspectRatio: "9/16" }}
                >
                  <img
                    src={getReelThumbnailSrc(reel.thumbnail)}
                    alt={getReelAltText(reel.caption, reel.username)}
                    referrerPolicy="no-referrer" loading="lazy" decoding="async"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={handleReelThumbnailError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-[9px] font-semibold line-clamp-2 leading-tight mb-1">{reel.caption}</p>
                    <div className="flex items-center gap-2">
                      <Eye className="w-2.5 h-2.5 text-white/70" />
                      <span className="text-[8px] text-white/70">{reel.views ?? "—"}</span>
                      <Heart className="w-2.5 h-2.5 text-white/70" />
                      <span className="text-[8px] text-white/70">{reel.likes ?? "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !insight && reels.length === 0 && !error && (
          <div className="panel p-8 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-primary" />
            <p className="text-sm font-semibold">Research any topic before you make it</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Get real demand, competition, and growth signals, plus content angles and hashtags — grounded in actual trending reels.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
