import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import {
  ArrowLeft, Eye, Heart, Share2, MessageCircle, Bookmark,
  Flame, Sparkles, Clock, Music2, BarChart2, ThumbsUp,
  Target, MousePointerClick, TrendingUp, Play, Instagram,
  Youtube, ArrowRight, CheckCircle2, Zap, Award, Hash
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function InsightPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const item = state?.item || state?.video;
  const [picError, setPicError] = useState(false);

  if (!item) { navigate("/home"); return null; }

  const isIG = item.platform === "instagram";

  const viralityColor = item.virality >= 90 ? "#f59e0b"
    : item.virality >= 80 ? "#22c55e"
    : item.virality >= 70 ? "#a855f7" : "#60a5fa";

  const stats = isIG ? [
    { icon: Eye,           label: "Views",     val: item.views,              color: "#60a5fa" },
    { icon: Heart,         label: "Likes",     val: item.likes,              color: "#f87171" },
    { icon: MessageCircle, label: "Comments",  val: item.comments,           color: "#a78bfa" },
    { icon: Share2,        label: "Shares",    val: item.shares,             color: "#34d399" },
    { icon: Clock,         label: "Watch Time",val: item.watchTime || "N/A", color: "#fbbf24" },
    { icon: Bookmark,      label: "Save Rate", val: item.saveRate  || "N/A", color: "#f472b6" },
  ] : [
    { icon: Eye,              label: "Views",      val: item.views,           color: "#60a5fa" },
    { icon: ThumbsUp,         label: "Likes",      val: item.likes,           color: "#34d399" },
    { icon: MessageCircle,    label: "Comments",   val: item.comments,        color: "#a78bfa" },
    { icon: Share2,           label: "Shares",     val: item.shares,          color: "#fbbf24" },
    { icon: MousePointerClick,label: "CTR",        val: item.ctr    || "N/A", color: "#60a5fa" },
    { icon: TrendingUp,       label: "Avg Viewed", val: item.avgView|| "N/A", color: "#f472b6" },
  ];

  const tips = [
    `Use trending audio in your ${item.niche} content for extra algorithm boost`,
    item.boosted ? "Boosting works best when organic content is already strong" : "Strong organic content beats paid promotion — focus on your hook first",
    `High ${isIG ? "save rate" : "watch time"} = algorithm push — make content worth ${isIG ? "saving" : "finishing"}`,
    `Post at peak times when your ${item.niche || 'niche'} audience is most active`,
  ];

  return (
    <div data-platform={isIG ? "instagram" : "youtube"} className={`theme-redesign ${theme} min-h-screen bg-background`}>
      <SEO title="Insight — SocialRum" noindex />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-5 h-16 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-accent transition-colors border border-border">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isIG
            ? <Instagram className="w-4 h-4 shrink-0 text-primary" />
            : <Youtube className="w-4 h-4 shrink-0 text-primary" />}
          <h1 className="font-bold text-sm text-foreground truncate">
            {isIG ? "Reel" : "Short"} Insight
          </h1>
          <span className="text-xs text-muted-foreground truncate">@{item.user}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0"
          style={{ background: `${viralityColor}18`, border: `1px solid ${viralityColor}35`, color: viralityColor }}>
          <Flame className="w-3 h-3" /> {item.virality}/100
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-28 space-y-4">

        {/* Thumbnail hero */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          className="relative rounded-3xl overflow-hidden" style={{ height:300 }}>
          <img src={item.thumbnail} alt={item.caption}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/600/400`; }} />
          <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.85))" }} />

          {/* Play button */}
          {item.isVideo && (
            <button
              onClick={() => {
                if (item.youtubeUrl) {
                  const videoId = item.id;
                  window.open(`https://www.youtube.com/shorts/${videoId}`, '_blank');
                } else if (item.instagramUrl) {
                  window.open(item.instagramUrl, '_blank');
                }
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{ background:"rgba(255,255,255,0.2)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.3)" }}>
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </button>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="px-2.5 py-1 rounded-full text-xs font-bold text-primary-foreground bg-gradient-to-br from-primary to-accent">
              {isIG ? 'Reels' : 'Shorts'}
            </div>
            {item.boosted && (
              <div className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-blue-500">
                Boosted
              </div>
            )}
          </div>

          {/* Caption + author */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-3">{item.caption}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.profile_pic_url && !picError ? (
                  <img
                    src={item.profile_pic_url}
                    alt={item.user}
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                    onError={() => setPicError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground bg-gradient-to-br from-primary to-accent">
                    {item.avatar || item.name?.[0] || '?'}
                  </div>
                )}
                <div>
                  <p className="text-white text-xs font-semibold">{item.name}</p>
                  <p className="text-white/60 text-xs">@{item.user}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1 text-white/80 text-xs"><Eye className="w-3 h-3" />{item.views}</div>
                <div className="flex items-center gap-1 text-white/80 text-xs"><Heart className="w-3 h-3" />{item.likes}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Virality score */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Virality Score</p>
              <p className="text-xs text-muted-foreground">Based on engagement, reach & algorithm signals</p>
            </div>
            <span className="text-4xl font-bold" style={{ color: viralityColor }}>{item.virality}<span className="text-sm text-muted-foreground font-normal">/100</span></span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <motion.div initial={{ width:0 }} animate={{ width:`${item.virality}%` }}
              transition={{ duration:1.2, ease:[0.16,1,0.3,1], delay:0.3 }}
              className="h-3 rounded-full bg-gradient-to-br from-primary to-accent" />
          </div>
          <p className="text-xs mt-2 font-semibold" style={{ color: viralityColor }}>
            {item.virality >= 90 ? "🔥 Top 5% — Extremely Viral"
              : item.virality >= 80 ? "📈 Top 15% — High Potential"
              : "✅ Above Average"}
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
          className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {isIG ? "Engagement Breakdown" : "Performance Metrics"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {stats.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.14 + i * 0.04 }}
                className="flex flex-col gap-1.5 p-3 rounded-xl"
                style={{ background:`${s.color}12`, border:`1px solid ${s.color}20` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                <p className="font-bold text-sm text-foreground">{s.val}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Boost + Platform row */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }}
            className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Boost Status</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: item.boosted ? '#3b82f615' : '#22c55e15' }}>
                {item.boosted
                  ? <Zap className="w-4 h-4 text-blue-400" />
                  : <CheckCircle2 className="w-4 h-4 text-green-400" />}
              </div>
              <p className="font-bold text-sm text-foreground">{item.boosted ? "Paid Boost" : "Organic"}</p>
            </div>
            <p className="text-xs text-muted-foreground">{item.boosted ? "Paid ads used to amplify" : "Algorithm pushed naturally"}</p>
          </motion.div>

          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
            className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Platform</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/15">
                {isIG ? <Instagram className="w-4 h-4 text-primary" /> : <Youtube className="w-4 h-4 text-primary" />}
              </div>
              <p className="font-bold text-sm text-foreground">{isIG ? "Instagram" : "YouTube"}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {(item.hashtags || []).slice(0,2).map((h: string, i: number) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-primary/15 text-primary">{h}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Why viral */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-green-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-green-500">Why It Went Viral</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{item.reason || "Strong engagement signals triggered algorithm push"}</p>
        </motion.div>

        {/* Hook + Audio */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
            className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Hook</p>
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
              <p className="text-xs text-foreground">{item.hook || "Strong visual hook"}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.24 }}
            className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Audio</p>
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 shrink-0 text-primary" />
              <p className="text-xs text-foreground">{item.audio || "Trending sound"}</p>
            </div>
          </motion.div>
        </div>

        {/* Hashtags */}
        {(item.hashtags || []).length > 0 && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.26 }}
            className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hashtags Used</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(item.hashtags || []).map((h: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/15 text-primary">{h}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* YT specific */}
        {!isIG && (item.retention || item.thumbHook) && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}
            className="bg-card rounded-2xl p-4 border border-border space-y-3">
            {item.retention && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Audience Retention</p>
                <div className="flex items-start gap-2">
                  <BarChart2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  <p className="text-sm text-foreground">{item.retention}</p>
                </div>
              </div>
            )}
            {item.thumbHook && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Thumbnail Hook</p>
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  <p className="text-sm text-foreground">{item.thumbHook}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* What you can learn */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="rounded-2xl p-4 bg-primary/10 border border-primary/25">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-primary">What You Can Learn</p>
          </div>
          <div className="space-y-2.5">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-primary-foreground text-[10px] font-bold bg-gradient-to-br from-primary to-accent">
                  {i+1}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }}
          whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
          onClick={() => navigate(isIG ? "/scripts" : "/youtube/script", { state: { topic: item.niche } })}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-primary-foreground bg-gradient-to-br from-primary to-accent">
          <Sparkles className="w-4 h-4" />
          Generate {isIG ? "Reel" : "YouTube"} Script for {item.niche || 'this topic'}
          <ArrowRight className="w-4 h-4" />
        </motion.button>

      </div>
    </div>
  );
}
