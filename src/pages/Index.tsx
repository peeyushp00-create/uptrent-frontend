import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Instagram, Youtube, Sparkles, TrendingUp, Zap,
  ArrowRight, X, Heart, Eye, MessageCircle, Share2,
  Bookmark, ExternalLink, ChevronRight, Flame, BadgeCheck,
  BarChart2, Megaphone, Clock, Hash, Music2, AlertCircle
} from "lucide-react";

const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const BLUE = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const G = "#E8B84B";

const instagramChips = [
  "Fitness", "Motivation", "Stock Market", "Crypto",
  "Travel", "Food", "Tech", "Business",
  "Fashion", "Gaming", "Comedy", "Cricket",
  "Education", "Yoga", "Entrepreneur", "Bollywood",
];

const youtubeChips = [
  "Tech Reviews", "Finance", "Motivation", "Gaming",
  "Travel Vlog", "Cooking", "Education", "Fitness",
  "Comedy", "Cricket", "Business", "Music",
  "Self Improvement", "Crypto", "Cars", "Movies",
];

const WORDS = ["Discover.", "Create.", "Go Viral."];

// ── Dummy reel generator ──
function generateReels(niche: string) {
  const templates: Record<string, any[]> = {
    fitness: [
      { user: "beerbiceps", name: "Ranveer Allahbadia", views: "4.2M", likes: "320K", comments: "8.4K", shares: "42K", caption: `Top 5 morning habits for ${niche} gains 💪🔥`, hashtags: ["#fitness", "#morningroutine", "#gains"], boosted: false, virality: 96, watchTime: "92%", saveRate: "18%", hook: "First 3 seconds shows dramatic transformation", audio: "Trending — Heeriye (Remix)", reason: "Transformation thumbnail + trending audio + posted 7AM" },
      { user: "priyafitness", name: "Priya Mehta", views: "2.8M", likes: "198K", comments: "5.1K", shares: "28K", caption: `This ${niche} mistake is costing you results ❌`, hashtags: ["#fitnessmistakes", "#workout", "#india"], boosted: true, virality: 88, watchTime: "85%", saveRate: "22%", hook: "Controversial opener — 'You're doing it wrong'", audio: "Original Audio", reason: "Boosted post + mistake-based hook drives saves" },
      { user: "techburner_fit", name: "Shlok Srivastava", views: "1.9M", likes: "145K", comments: "3.2K", shares: "19K", caption: `30 day ${niche} challenge results 🚀`, hashtags: ["#30daychallenge", "#transformation"], boosted: false, virality: 82, watchTime: "88%", saveRate: "31%", hook: "Before/after split screen in first second", audio: "Trending — Kesariya Beat", reason: "Challenge format + high save rate = algorithm push" },
    ],
    finance: [
      { user: "sharan_hegde", name: "Sharan Hegde", views: "6.1M", likes: "480K", comments: "12K", shares: "95K", caption: `How I made ₹1 Lakh from ${niche} in 30 days 📈`, hashtags: ["#personalfinance", "#investing", "#india"], boosted: false, virality: 98, watchTime: "94%", saveRate: "42%", hook: "Exact income screenshot in first frame", audio: "Trending — Lo-fi Study", reason: "Income proof + massive save rate triggered explore page" },
      { user: "akshat_shrivastava", name: "Akshat Shrivastava", views: "3.4M", likes: "265K", comments: "9.8K", shares: "67K", caption: `${niche} secrets banks don't want you to know 🤫`, hashtags: ["#finance", "#moneyhacks", "#stockmarket"], boosted: true, virality: 91, watchTime: "89%", saveRate: "38%", hook: "Secret reveal format drives curiosity", audio: "Suspense Trending Audio", reason: "Boosted + secret-reveal format + high shares" },
      { user: "rahul_finance", name: "Rahul Sharma", views: "2.1M", likes: "167K", comments: "4.5K", shares: "38K", caption: `Best ${niche} apps in India 2024 💰`, hashtags: ["#financeapps", "#investing", "#money"], boosted: false, virality: 79, watchTime: "81%", saveRate: "29%", hook: "App list format — people save for reference", audio: "Original VO", reason: "List format = high saves = algorithm rewards" },
    ],
    cricket: [
      { user: "cricketaddicter", name: "Cricket Addict", views: "8.9M", likes: "720K", comments: "24K", shares: "180K", caption: `Virat Kohli's secret ${niche} training method 🏏`, hashtags: ["#cricket", "#virat", "#ipl"], boosted: false, virality: 99, watchTime: "97%", saveRate: "15%", hook: "Kohli name in caption = instant click", audio: "Trending IPL Anthem", reason: "Celebrity name + trending moment + IPL season timing" },
      { user: "ipl_highlights", name: "IPL Highlights", views: "5.2M", likes: "410K", comments: "18K", shares: "120K", caption: `Top 10 sixes in ${niche} history 🔥`, hashtags: ["#ipl", "#cricket", "#sixers"], boosted: true, virality: 94, watchTime: "93%", saveRate: "11%", hook: "Countdown format keeps people watching till end", audio: "Stadium Crowd Roar", reason: "Boosted + countdown format + high completion rate" },
      { user: "cricket_fanatic", name: "Cricket Fanatic", views: "3.1M", likes: "245K", comments: "8.9K", shares: "72K", caption: `This ${niche} shot nobody talks about 😱`, hashtags: ["#cricket", "#shots", "#viral"], boosted: false, virality: 86, watchTime: "91%", saveRate: "19%", hook: "Mystery format — 'nobody talks about'", audio: "Dramatic Music Trending", reason: "Surprise element + mystery hook = high shares" },
    ],
  };

  const niche_lower = niche.toLowerCase();
  let base = templates.fitness;
  if (niche_lower.includes("finance") || niche_lower.includes("stock") || niche_lower.includes("crypto") || niche_lower.includes("money") || niche_lower.includes("invest")) base = templates.finance;
  if (niche_lower.includes("cricket") || niche_lower.includes("ipl")) base = templates.cricket;

  return base.map((r, i) => ({
    ...r,
    id: `reel-${i}`,
    thumbnail: `https://picsum.photos/seed/${niche_lower.replace(/\s/g, '')}-${i}/400/700`,
    niche,
  }));
}

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");
  const [insightReel, setInsightReel] = useState<any>(null);

  const words = WORDS;

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % words.length), 2400);
    return () => clearInterval(interval);
  }, []);

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    setReels([]);
    setSearched("");
  };

  const handleSearch = async (q?: string) => {
    const query = q || search;
    if (!query.trim()) return;
    setSearch(query);

    if (platform === "youtube") {
      navigate("/youtube/seo", { state: { query } });
      return;
    }

    setLoading(true);
    setSearched(query);
    setReels([]);
    await new Promise(r => setTimeout(r, 1200));
    setReels(generateReels(query));
    setLoading(false);
  };

  const chips = platform === "instagram" ? instagramChips : youtubeChips;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        .cg { font-family: 'Cormorant Garamond', serif !important; }
        .gold-text { background: linear-gradient(135deg,#E8B84B,#C17D20); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .reel-card { transition: transform .2s, border-color .2s; }
        .reel-card:hover { transform: translateY(-4px); border-color: #E8B84B30 !important; }
        .chip-btn:hover { border-color: #E8B84B50 !important; color: #E8B84B !important; }
        .search-inp:focus { border-color: #E8B84B50 !important; box-shadow: 0 0 0 3px #E8B84B0A; }
      `}</style>

      <div className="flex-1 flex flex-col min-h-screen bg-background">

        {/* ── HERO ── */}
        <div className="flex flex-col items-center px-6 pt-10 pb-6 relative overflow-hidden">
          {/* ambient glow */}
          <motion.div animate={{ opacity: [0.03, 0.07, 0.03] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none rounded-full"
            style={{ background: `radial-gradient(ellipse, ${G}, transparent 70%)`, filter: "blur(60px)" }} />

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-5 w-full max-w-2xl relative z-10">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "#E8B84B0D", border: "1px solid #E8B84B22", color: G, letterSpacing: ".1em" }}>
              <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: G }} />
              <Sparkles className="w-3 h-3" />
              AI-POWERED · INDIA'S CREATOR TOOLKIT
            </motion.div>

            {/* Animated headline */}
            <div className="cg text-5xl md:text-7xl font-bold text-center leading-tight" style={{ minHeight: "1.2em" }}>
              <AnimatePresence mode="wait">
                <motion.span key={wordIndex}
                  initial={{ opacity: 0, y: 20, letterSpacing: ".3em", filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: ".01em", filter: "blur(0)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className={wordIndex === 1 ? "gold-text italic" : wordIndex === 2 ? "italic" : ""}
                  style={{ display: "inline-block", color: wordIndex === 0 ? "hsl(var(--foreground))" : wordIndex === 2 ? "#C17D20" : undefined }}>
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="text-sm text-center text-muted-foreground max-w-md" style={{ fontFamily: "Inter,sans-serif" }}>
              Search any niche to see top performing reels, viral insights and what's working right now
            </p>

            {/* Platform toggle */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-card border border-border">
              {(["instagram", "youtube"] as const).map(p => (
                <button key={p} onClick={() => switchPlatform(p)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={platform === p ? { background: GOLD, color: "#111", fontWeight: 600 } : { color: "hsl(var(--muted-foreground))" }}>
                  {p === "instagram" ? <Instagram className="w-4 h-4" /> : <Youtube className="w-4 h-4" />}
                  {p === "instagram" ? "Instagram" : "YouTube"}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder={platform === "instagram" ? "Search niche (e.g. Fitness, Finance, Cricket)..." : "Search YouTube video ideas..."}
                  className="search-inp w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  style={{ fontFamily: "Inter,sans-serif" }} />
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleSearch()}
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2"
                style={{ background: GOLD, color: "#111", fontFamily: "Inter,sans-serif" }}>
                <Search className="w-4 h-4" />
                Search
              </motion.button>
            </div>

            {/* Chips — only when no results */}
            {!searched && (
              <div className="space-y-2 w-full">
                <p className="text-xs text-muted-foreground text-center" style={{ fontFamily: "Inter,sans-serif" }}>
                  {platform === "instagram" ? "🔥 Trending niches" : "Trending topics"}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {chips.map(chip => (
                    <motion.button key={chip} onClick={() => handleSearch(chip)} whileTap={{ scale: 0.96 }}
                      className="chip-btn px-3.5 py-1.5 rounded-full text-xs border border-border bg-card text-muted-foreground transition-all"
                      style={{ fontFamily: "Inter,sans-serif" }}>
                      {chip}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── RESULTS ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="w-7 h-7" style={{ color: G }} />
            </motion.div>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
              Finding top reels for <span style={{ color: G }}>"{search}"</span>...
            </p>
          </div>
        )}

        {searched && !loading && reels.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-24 max-w-5xl mx-auto w-full">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-foreground text-sm" style={{ fontFamily: "Inter,sans-serif" }}>
                  Top Reels — <span style={{ color: G }}>#{searched}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "Inter,sans-serif" }}>
                  {reels.length} reels · Click <span style={{ color: G }}>Insights</span> to see why they went viral
                </p>
              </div>
              <button onClick={() => { setSearched(""); setReels([]); setSearch(""); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: "Inter,sans-serif" }}>
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            {/* 3-column reel grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reels.map((reel, i) => (
                <motion.div key={reel.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="reel-card bg-card border border-border rounded-2xl overflow-hidden">

                  {/* Thumbnail */}
                  <div className="relative aspect-[9/14] overflow-hidden">
                    <img src={reel.thumbnail} alt={reel.caption}
                      className="w-full h-full object-cover" />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 40%, transparent 70%)" }} />

                    {/* Boosted badge */}
                    {reel.boosted && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: "#3B82F6", color: "#fff", fontFamily: "Inter,sans-serif" }}>
                        <Megaphone className="w-3 h-3" /> Boosted
                      </div>
                    )}

                    {/* Virality score */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: reel.virality >= 90 ? "#E8B84B" : reel.virality >= 80 ? "#22c55e" : "#888",
                        color: "#000", fontFamily: "Inter,sans-serif" }}>
                      <Flame className="w-3 h-3" /> {reel.virality}
                    </div>

                    {/* Bottom stats */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-medium mb-2 line-clamp-2 leading-snug" style={{ fontFamily: "Inter,sans-serif" }}>
                        {reel.caption}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-white/80 text-xs" style={{ fontFamily: "Inter,sans-serif" }}>
                          <Eye className="w-3 h-3" /> {reel.views}
                        </div>
                        <div className="flex items-center gap-1 text-white/80 text-xs" style={{ fontFamily: "Inter,sans-serif" }}>
                          <Heart className="w-3 h-3" /> {reel.likes}
                        </div>
                        <div className="flex items-center gap-1 text-white/80 text-xs" style={{ fontFamily: "Inter,sans-serif" }}>
                          <Share2 className="w-3 h-3" /> {reel.shares}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="p-3 flex items-center justify-between" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: GOLD, color: "#111" }}>
                        {reel.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate" style={{ fontFamily: "Inter,sans-serif" }}>
                          {reel.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate" style={{ fontFamily: "Inter,sans-serif" }}>
                          @{reel.user}
                        </p>
                      </div>
                    </div>
                    {/* ✅ INSIGHTS BUTTON */}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setInsightReel(reel)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0"
                      style={{ background: GOLD, color: "#111", fontFamily: "Inter,sans-serif" }}>
                      <BarChart2 className="w-3 h-3" /> Insights
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── INSIGHTS POPUP ── */}
        <AnimatePresence>
          {insightReel && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
              onClick={() => setInsightReel(null)}>
              <motion.div initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.96 }}
                onClick={e => e.stopPropagation()}
                className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden"
                style={{ maxHeight: "90vh", overflowY: "auto" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#E8B84B15" }}>
                      <BarChart2 className="w-4 h-4" style={{ color: G }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>Reel Insights</p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>@{insightReel.user}</p>
                    </div>
                  </div>
                  <button onClick={() => setInsightReel(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-5">

                  {/* Virality score */}
                  <div className="rounded-2xl p-4" style={{ background: `${G}0D`, border: `1px solid ${G}25` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: G, fontFamily: "Inter,sans-serif" }}>
                        Virality Score
                      </p>
                      <span className="text-2xl font-bold cg" style={{ color: G }}>{insightReel.virality}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${insightReel.virality}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-2 rounded-full" style={{ background: GOLD }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: "Inter,sans-serif" }}>
                      {insightReel.virality >= 90 ? "🔥 Extremely viral — top 5% of all reels" :
                        insightReel.virality >= 80 ? "📈 High viral potential — top 15%" : "✅ Above average performance"}
                    </p>
                  </div>

                  {/* Boost status */}
                  <div className="rounded-2xl p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>
                      Boost Status
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: insightReel.boosted ? "#3B82F615" : "#22c55e15" }}>
                        {insightReel.boosted
                          ? <Megaphone className="w-5 h-5 text-blue-400" />
                          : <Sparkles className="w-5 h-5 text-green-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
                          {insightReel.boosted ? "Paid Promotion (Boosted)" : "Organic Viral"}
                        </p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
                          {insightReel.boosted
                            ? "This reel used paid ads to amplify reach. Views are partly paid."
                            : "100% organic reach. Algorithm pushed this naturally."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Engagement stats */}
                  <div className="rounded-2xl p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>
                      Engagement Breakdown
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Eye, label: "Views", val: insightReel.views, color: "#3B82F6" },
                        { icon: Heart, label: "Likes", val: insightReel.likes, color: "#ef4444" },
                        { icon: MessageCircle, label: "Comments", val: insightReel.comments, color: "#8b5cf6" },
                        { icon: Share2, label: "Shares", val: insightReel.shares, color: G },
                        { icon: Clock, label: "Watch Time", val: insightReel.watchTime, color: "#22c55e" },
                        { icon: Bookmark, label: "Save Rate", val: insightReel.saveRate, color: "#f59e0b" },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "hsl(var(--background))" }}>
                          <s.icon className="w-4 h-4 shrink-0" style={{ color: s.color }} />
                          <div>
                            <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{s.label}</p>
                            <p className="text-sm font-bold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{s.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why it went viral */}
                  <div className="rounded-2xl p-4" style={{ background: "#22c55e0D", border: "1px solid #22c55e25" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#22c55e", fontFamily: "Inter,sans-serif" }}>
                      Why It Went Viral
                    </p>
                    <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "Inter,sans-serif" }}>
                      {insightReel.reason}
                    </p>
                  </div>

                  {/* Hook analysis */}
                  <div className="rounded-2xl p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>
                      Hook Analysis
                    </p>
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: G }} />
                      <p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightReel.hook}</p>
                    </div>
                  </div>

                  {/* Audio & Hashtags */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Audio</p>
                      <div className="flex items-center gap-1.5">
                        <Music2 className="w-3.5 h-3.5 shrink-0" style={{ color: G }} />
                        <p className="text-xs text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightReel.audio}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Hashtags</p>
                      <div className="flex flex-wrap gap-1">
                        {insightReel.hashtags.map((h: string, i: number) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{ background: `${G}15`, color: G, fontFamily: "Inter,sans-serif" }}>{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setInsightReel(null); navigate("/scripts", { state: { topic: insightReel.niche } }); }}
                    className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: GOLD, color: "#111", fontFamily: "Inter,sans-serif" }}>
                    <Sparkles className="w-4 h-4" />
                    Generate Script for {insightReel.niche}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}