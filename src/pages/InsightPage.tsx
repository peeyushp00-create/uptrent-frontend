import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Eye, Heart, Share2, MessageCircle, Bookmark,
  Flame, Megaphone, Sparkles, Clock, Music2, AlertCircle,
  BarChart2, ThumbsUp, Target, MousePointerClick, TrendingUp,
  Play, Instagram, Youtube, ArrowRight, CheckCircle2, Zap, Award
} from "lucide-react";

const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const BLUE_G = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const G = "#E8B84B";
const B = "#3B82F6";

export default function InsightPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const item = state?.item;

  if (!item) { navigate("/"); return null; }

  const platform = item.platform;
  const isIG = platform === "instagram";
  const ac = isIG ? G : B;
  const ag = isIG ? GOLD : BLUE_G;

  const engagementStats = isIG ? [
    { icon: Eye, label: "Views", val: item.views, color: "#60A5FA", bg: "#3B82F610" },
    { icon: Heart, label: "Likes", val: item.likes, color: "#F87171", bg: "#ef444410" },
    { icon: MessageCircle, label: "Comments", val: item.comments, color: "#A78BFA", bg: "#8b5cf610" },
    { icon: Share2, label: "Shares", val: item.shares, color: ac, bg: `${ac}15` },
    { icon: Clock, label: "Watch Time", val: item.watchTime || "N/A", color: "#34D399", bg: "#22c55e10" },
    { icon: Bookmark, label: "Save Rate", val: item.saveRate || "N/A", color: "#FBBF24", bg: "#f59e0b10" },
  ] : [
    { icon: Eye, label: "Views", val: item.views, color: "#60A5FA", bg: "#3B82F610" },
    { icon: ThumbsUp, label: "Likes", val: item.likes, color: "#34D399", bg: "#22c55e10" },
    { icon: MessageCircle, label: "Comments", val: item.comments, color: "#A78BFA", bg: "#8b5cf610" },
    { icon: Share2, label: "Shares", val: item.shares, color: ac, bg: `${ac}15` },
    { icon: MousePointerClick, label: "CTR", val: item.ctr || "N/A", color: "#60A5FA", bg: "#3B82F610" },
    { icon: TrendingUp, label: "Avg Viewed", val: item.avgView || "N/A", color: "#FBBF24", bg: "#f59e0b10" },
  ];

  const viralityColor = item.virality >= 90 ? "#F59E0B" : item.virality >= 80 ? "#34D399" : "#60A5FA";

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .cg { font-family: 'Cormorant Garamond', serif !important; }
        .dm { font-family: 'DM Sans', sans-serif !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Sticky header */}
      <div className="sticky top-0 z-20 px-4 py-3"
        style={{ background: "hsl(var(--background)/0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-accent"
            style={{ border: "1px solid hsl(var(--border))" }}>
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            {isIG
              ? <Instagram className="w-4 h-4" style={{ color: ac }} />
              : <Youtube className="w-4 h-4" style={{ color: ac }} />}
            <h1 className="dm font-semibold text-foreground text-sm">
              {isIG ? "Reel" : "Short"} Insights
            </h1>
            <span className="dm text-xs text-muted-foreground">@{item.user}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full dm text-xs font-bold"
            style={{ background: `${viralityColor}18`, border: `1px solid ${viralityColor}35`, color: viralityColor }}>
            <Flame className="w-3 h-3" /> {item.virality}/100
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-28 space-y-3">

        {/* Hero thumbnail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative rounded-3xl overflow-hidden"
          style={{ height: 320 }}>
          <img src={item.thumbnail} alt={item.caption} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/600/400`; }} />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.95) 100%)" }} />

         {item.isVideo && (
  <a href={item.youtubeUrl || `https://youtube.com/shorts/${item.id}`}
    target="_blank" rel="noopener noreferrer"
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center"
    style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.3)" }}
    onClick={e => e.stopPropagation()}>
    <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
  </a>
)}

          <div className="absolute top-4 left-4 flex gap-2">
            {item.boosted && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full dm text-xs font-semibold"
                style={{ background: "rgba(59,130,246,0.85)", color: "#fff" }}>
                <Megaphone className="w-3 h-3" /> Boosted
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full dm text-xs font-semibold"
              style={{ background: isIG ? "rgba(232,184,75,0.85)" : "rgba(59,130,246,0.85)", color: isIG ? "#111" : "#fff" }}>
              <Flame className="w-3 h-3" />
              {item.virality >= 90 ? "Viral 🔥" : item.virality >= 80 ? "Trending 📈" : "Rising ✅"}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="dm font-medium text-white text-sm mb-3 leading-snug line-clamp-2">{item.caption}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center dm text-xs font-bold"
                  style={{ background: ag, color: isIG ? "#111" : "#fff" }}>{item.avatar}</div>
                <div>
                  <p className="dm font-semibold text-white text-xs">{item.name}</p>
                  <p className="dm text-white/50 text-xs">@{item.user}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-white/80 dm text-xs"><Eye className="w-3 h-3" />{item.views}</div>
                <div className="flex items-center gap-1 text-white/80 dm text-xs"><Heart className="w-3 h-3" />{item.likes}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Virality score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="rounded-2xl p-5"
          style={{ background: `${viralityColor}0C`, border: `1px solid ${viralityColor}28` }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="dm text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: viralityColor, letterSpacing: ".14em" }}>
                Virality Score
              </p>
              <p className="dm text-xs text-muted-foreground">Based on engagement, reach and algorithm signals</p>
            </div>
            <div className="text-right">
              <span className="cg font-bold" style={{ fontSize: 44, color: viralityColor, lineHeight: 1 }}>{item.virality}</span>
              <span className="dm text-sm text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full" style={{ background: "hsl(var(--border))" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.virality}%` }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="h-3 rounded-full" style={{ background: ag }} />
          </div>
          <p className="dm text-xs mt-2" style={{ color: viralityColor }}>
            {item.virality >= 90 ? "🔥 Top 5% — Extremely Viral"
              : item.virality >= 80 ? "📈 Top 15% — High Potential"
              : "✅ Above Average"}
          </p>
        </motion.div>

        {/* Boost + Content Type */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className="rounded-2xl p-4 bg-card border border-border">
            <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3" style={{ letterSpacing: ".12em" }}>Boost Status</p>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: item.boosted ? "#3B82F612" : "#22c55e12" }}>
                {item.boosted ? <Megaphone className="w-4 h-4 text-blue-400" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
              </div>
              <p className="dm font-semibold text-foreground text-sm">
                {item.boosted ? "Paid Boost" : "Organic"}
              </p>
            </div>
            <p className="dm text-xs text-muted-foreground">
              {item.boosted ? "Paid ads used to amplify reach" : "Algorithm pushed this naturally"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.45 }}
            className="rounded-2xl p-4 bg-card border border-border">
            <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3" style={{ letterSpacing: ".12em" }}>Platform</p>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ac}12` }}>
                {isIG ? <Instagram className="w-4 h-4" style={{ color: ac }} /> : <Youtube className="w-4 h-4" style={{ color: ac }} />}
              </div>
              <p className="dm font-semibold text-foreground text-sm">{isIG ? "Instagram" : "YouTube"}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {(item.hashtags || []).slice(0, 3).map((h: string, i: number) => (
                <span key={i} className="dm text-xs px-1.5 py-0.5 rounded-md"
                  style={{ background: `${ac}12`, color: ac }}>{h}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Engagement stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.45 }}
          className="rounded-2xl p-5 bg-card border border-border">
          <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4" style={{ letterSpacing: ".12em" }}>
            {isIG ? "Engagement Breakdown" : "Performance Metrics"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {engagementStats.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.18 + i * 0.05 }}
                className="flex flex-col gap-2 p-3 rounded-xl"
                style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                <p className="dm font-bold text-foreground text-sm leading-none">{s.val}</p>
                <p className="dm text-muted-foreground" style={{ fontSize: 10 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* YouTube extras */}
        {!isIG && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.45 }}
            className="space-y-3">
            {item.retention && (
              <div className="rounded-2xl p-4 bg-card border border-border">
                <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2" style={{ letterSpacing: ".12em" }}>Audience Retention</p>
                <div className="flex items-start gap-2">
                  <BarChart2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} />
                  <p className="dm text-sm text-foreground">{item.retention}</p>
                </div>
              </div>
            )}
            {item.thumbHook && (
              <div className="rounded-2xl p-4 bg-card border border-border">
                <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2" style={{ letterSpacing: ".12em" }}>Thumbnail Hook</p>
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} />
                  <p className="dm text-sm text-foreground">{item.thumbHook}</p>
                </div>
              </div>
            )}
            {item.topComment && (
              <div className="rounded-2xl p-4 bg-card border border-border">
                <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2" style={{ letterSpacing: ".12em" }}>Top Comment</p>
                <p className="dm text-sm text-foreground italic">{item.topComment}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Why it went viral */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.45 }}
          className="rounded-2xl p-4"
          style={{ background: "#22c55e0C", border: "1px solid #22c55e28" }}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-green-400" />
            <p className="dm text-xs font-semibold uppercase tracking-widest" style={{ color: "#22c55e", letterSpacing: ".12em" }}>Why It Went Viral</p>
          </div>
          <p className="dm text-sm text-foreground leading-relaxed">{item.reason || "Strong engagement signals triggered algorithm push"}</p>
        </motion.div>

        {/* Hook analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="rounded-2xl p-4 bg-card border border-border">
          <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2" style={{ letterSpacing: ".12em" }}>Hook Analysis</p>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ac }} />
            <p className="dm text-sm text-foreground">{item.hook || "Strong opening grabs attention immediately"}</p>
          </div>
        </motion.div>

        {/* Audio + hashtags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.45 }}
          className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-card border border-border">
            <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2" style={{ letterSpacing: ".12em" }}>Audio</p>
            <div className="flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 shrink-0" style={{ color: ac }} />
              <p className="dm text-xs text-foreground">{item.audio || "Original audio"}</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 bg-card border border-border">
            <p className="dm text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2" style={{ letterSpacing: ".12em" }}>Hashtags</p>
            <div className="flex flex-wrap gap-1">
              {(item.hashtags || []).slice(0, 4).map((h: string, i: number) => (
                <span key={i} className="dm text-xs px-1.5 py-0.5 rounded-md"
                  style={{ background: `${ac}15`, color: ac }}>{h}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* What you can learn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.45 }}
          className="rounded-2xl p-4"
          style={{ background: `${ac}0A`, border: `1px solid ${ac}22` }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4" style={{ color: ac }} />
            <p className="dm text-xs font-semibold uppercase tracking-widest" style={{ color: ac, letterSpacing: ".12em" }}>What You Can Learn</p>
          </div>
          <div className="space-y-3">
            {[
              `Use trending audio in your ${item.niche} content for extra algorithm boost`,
              item.boosted ? "Boosting works when organic content is already strong" : "Strong organic content beats paid promotion — focus on your hook",
              `High ${isIG ? "save rate" : "watch time"} = algorithm push — make content worth ${isIG ? "saving" : "finishing"}`,
              `Post at peak times when your ${item.niche} audience is most active`,
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 dm text-xs font-bold"
                  style={{ background: ag, color: isIG ? "#111" : "#fff", fontSize: 10 }}>
                  {i + 1}
                </div>
                <p className="dm text-sm text-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.45 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(isIG ? "/scripts" : "/youtube/script", { state: { topic: item.niche } })}
          className="w-full py-4 rounded-2xl dm font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: ag, color: isIG ? "#111" : "#fff" }}>
          <Sparkles className="w-4 h-4" />
          Generate {isIG ? "Reel Script" : "YouTube Script"} for {item.niche}
          <ArrowRight className="w-4 h-4" />
        </motion.button>

      </div>
    </div>
  );
}