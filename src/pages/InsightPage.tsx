import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Eye, Heart, Share2, MessageCircle, Bookmark,
  Flame, Megaphone, Sparkles, Clock, Music2, AlertCircle,
  BarChart2, ThumbsUp, Target, MousePointerClick, TrendingUp,
  Play, Instagram, Youtube, ArrowRight, Hash
} from "lucide-react";

const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const BLUE_G = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const G = "#E8B84B";
const B = "#3B82F6";

export default function InsightPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const item = state?.item;

  if (!item) {
    navigate("/");
    return null;
  }

  const platform = item.platform;
  const accentColor = platform === "instagram" ? G : B;
  const accentGrad = platform === "instagram" ? GOLD : BLUE_G;
  const isIG = platform === "instagram";

  const stats = isIG ? [
    { icon: Eye, label: "Views", val: item.views, color: accentColor },
    { icon: Heart, label: "Likes", val: item.likes, color: "#ef4444" },
    { icon: Share2, label: "Shares", val: item.shares, color: G },
    { icon: MessageCircle, label: "Comments", val: item.comments, color: "#8b5cf6" },
    { icon: Clock, label: "Watch Time", val: item.watchTime, color: "#22c55e" },
    { icon: Bookmark, label: "Save Rate", val: item.saveRate, color: "#f59e0b" },
  ] : [
    { icon: Eye, label: "Views", val: item.views, color: B },
    { icon: ThumbsUp, label: "Likes", val: item.likes, color: "#22c55e" },
    { icon: Share2, label: "Shares", val: item.shares, color: accentColor },
    { icon: MessageCircle, label: "Comments", val: item.comments, color: "#8b5cf6" },
    { icon: MousePointerClick, label: "CTR", val: item.ctr, color: B },
    { icon: TrendingUp, label: "Avg Viewed", val: item.avgView, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {isIG ? <Instagram className="w-4 h-4" style={{ color: accentColor }} /> : <Youtube className="w-4 h-4" style={{ color: accentColor }} />}
            <h1 className="text-base font-bold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
              {isIG ? "Reel" : "Short"} Insights
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: item.virality >= 90 ? accentColor : item.virality >= 80 ? "#22c55e" : "#555",
              color: item.virality >= 90 && isIG ? "#000" : "#fff", fontFamily: "Inter,sans-serif" }}>
            <Flame className="w-3 h-3" /> {item.virality}/100
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-4">

        {/* ── THUMBNAIL + CREATOR ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden" style={{ height: 280 }}>
          <img src={item.thumbnail} alt={item.caption} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.1) 60%)" }} />

          {/* Play button */}
          {item.isVideo && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {item.boosted && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: B, color: "#fff", fontFamily: "Inter,sans-serif" }}>
                <Megaphone className="w-3 h-3" /> Boosted
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: item.virality >= 90 ? accentColor : "#22c55e",
                color: item.virality >= 90 && isIG ? "#000" : "#fff", fontFamily: "Inter,sans-serif" }}>
              <Flame className="w-3 h-3" />
              {item.virality >= 90 ? "Extremely Viral" : item.virality >= 80 ? "High Potential" : "Above Average"}
            </div>
          </div>

          {/* Creator + caption at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white text-sm font-medium mb-2 leading-snug" style={{ fontFamily: "Inter,sans-serif" }}>{item.caption}</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: accentGrad, color: isIG ? "#111" : "#fff" }}>
                {item.avatar}
              </div>
              <div>
                <p className="text-white text-xs font-semibold" style={{ fontFamily: "Inter,sans-serif" }}>{item.name}</p>
                <p className="text-white/60 text-xs" style={{ fontFamily: "Inter,sans-serif" }}>@{item.user}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── VIRALITY SCORE ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5" style={{ background: `${accentColor}0D`, border: `1px solid ${accentColor}25` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor, fontFamily: "Inter,sans-serif" }}>
              Virality Score
            </p>
            <span className="text-3xl font-bold" style={{ color: accentColor, fontFamily: "'Cormorant Garamond',serif" }}>
              {item.virality}<span className="text-lg">/100</span>
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-border">
            <motion.div initial={{ width: 0 }} animate={{ width: `${item.virality}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="h-2.5 rounded-full" style={{ background: accentGrad }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: "Inter,sans-serif" }}>
            {item.virality >= 90 ? "🔥 Top 5% of all content — extremely viral"
              : item.virality >= 80 ? "📈 Top 15% — high viral potential"
              : "✅ Above average — performing well"}
          </p>
        </motion.div>

        {/* ── BOOST STATUS ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-4 border border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>
            Boost Status
          </p>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: item.boosted ? "#3B82F615" : "#22c55e15" }}>
              {item.boosted ? <Megaphone className="w-5 h-5 text-blue-400" /> : <Sparkles className="w-5 h-5 text-green-400" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
                {item.boosted ? "Paid Promotion (Boosted)" : "100% Organic Viral"}
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
                {item.boosted
                  ? "This content used paid ads to amplify reach. Some views are paid."
                  : "No paid promotion used. The algorithm pushed this completely organically."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── STATS GRID ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 border border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>
            {isIG ? "Engagement Breakdown" : "Performance Metrics"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex flex-col items-center p-3 rounded-2xl gap-1.5 bg-background">
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                <p className="text-sm font-bold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{s.val}</p>
                <p className="text-xs text-muted-foreground" style={{ fontSize: 10, fontFamily: "Inter,sans-serif" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── YOUTUBE EXTRAS ── */}
        {!isIG && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="space-y-3">
            <div className="rounded-2xl p-4 border border-border bg-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>
                Audience Retention
              </p>
              <div className="flex items-start gap-2">
                <BarChart2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} />
                <p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{item.retention}</p>
              </div>
            </div>
            <div className="rounded-2xl p-4 border border-border bg-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>
                Thumbnail Hook
              </p>
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} />
                <p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{item.thumbHook}</p>
              </div>
            </div>
            <div className="rounded-2xl p-4 border border-border bg-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>
                Top Comment
              </p>
              <p className="text-sm text-foreground italic" style={{ fontFamily: "Inter,sans-serif" }}>{item.topComment}</p>
            </div>
          </motion.div>
        )}

        {/* ── WHY IT WENT VIRAL ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-4" style={{ background: "#22c55e0D", border: "1px solid #22c55e25" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#22c55e", fontFamily: "Inter,sans-serif" }}>
            Why It Went Viral
          </p>
          <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "Inter,sans-serif" }}>{item.reason}</p>
        </motion.div>

        {/* ── HOOK ANALYSIS ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl p-4 border border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>
            Hook Analysis
          </p>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
            <p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{item.hook}</p>
          </div>
        </motion.div>

        {/* ── AUDIO + HASHTAGS ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 border border-border bg-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Audio Used</p>
            <div className="flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
              <p className="text-xs text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{item.audio}</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 border border-border bg-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Hashtags</p>
            <div className="flex flex-wrap gap-1">
              {item.hashtags.map((h: string, i: number) => (
                <span key={i} className="text-xs px-1.5 py-0.5 rounded-md"
                  style={{ background: `${accentColor}15`, color: accentColor, fontFamily: "Inter,sans-serif" }}>{h}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── WHAT TO LEARN ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-4 border border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>
            What You Can Learn From This
          </p>
          <div className="space-y-2">
            {[
              `Post at peak times when your audience is most active`,
              `Use the ${item.audio} style audio — it's trending right now`,
              `${item.boosted ? "Consider boosting your best posts to amplify organic reach" : "Great organic content doesn't need a budget — focus on the hook"}`,
              `High save rate = algorithm push. Make your content worth saving`,
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: accentGrad, color: isIG ? "#111" : "#fff", fontSize: 10 }}>
                  {i + 1}
                </div>
                <p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate(isIG ? "/scripts" : "/youtube/script", { state: { topic: item.niche } })}
          className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: accentGrad, color: isIG ? "#111" : "#fff", fontFamily: "Inter,sans-serif" }}>
          <Sparkles className="w-4 h-4" />
          Generate {isIG ? "Reel Script" : "YouTube Script"} for {item.niche}
          <ArrowRight className="w-4 h-4" />
        </motion.button>

      </div>
    </div>
  );
}