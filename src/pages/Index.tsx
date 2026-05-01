import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Instagram, Youtube, Sparkles, X, Heart, Eye,
  MessageCircle, Share2, Bookmark, ArrowRight, Flame,
  Megaphone, Clock, Hash, Music2, AlertCircle, BarChart2,
  TrendingUp, ThumbsUp, Play, Target, Zap, MousePointerClick
} from "lucide-react";

const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const BLUE_G = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const G = "#E8B84B";
const B = "#3B82F6";

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

// ── Instagram Reel Generator ──
function generateReels(niche: string) {
  const templates: Record<string, any[]> = {
    fitness: [
      { user: "beerbiceps", name: "Ranveer Allahbadia", views: "4.2M", likes: "320K", comments: "8.4K", shares: "42K", caption: `Top 5 morning habits for fitness gains 💪🔥`, hashtags: ["#fitness", "#morningroutine", "#gains"], boosted: false, virality: 96, watchTime: "92%", saveRate: "18%", hook: "First 3 seconds shows dramatic transformation", audio: "Trending — Heeriye (Remix)", reason: "Transformation thumbnail + trending audio + posted 7AM IST hits peak scroll time" },
      { user: "priyafitness", name: "Priya Mehta", views: "2.8M", likes: "198K", comments: "5.1K", shares: "28K", caption: `This fitness mistake is costing you results ❌`, hashtags: ["#fitnessmistakes", "#workout", "#india"], boosted: true, virality: 88, watchTime: "85%", saveRate: "22%", hook: "Controversial opener — 'You're doing it wrong'", audio: "Original Audio", reason: "Boosted post + mistake-based hook drives saves and comments" },
      { user: "techburner_fit", name: "Shlok Srivastava", views: "1.9M", likes: "145K", comments: "3.2K", shares: "19K", caption: `30 day fitness challenge results 🚀`, hashtags: ["#30daychallenge", "#transformation"], boosted: false, virality: 82, watchTime: "88%", saveRate: "31%", hook: "Before/after split screen in first second", audio: "Trending — Kesariya Beat", reason: "Challenge format + high save rate = algorithm keeps pushing" },
    ],
    finance: [
      { user: "sharan_hegde", name: "Sharan Hegde", views: "6.1M", likes: "480K", comments: "12K", shares: "95K", caption: `How I made ₹1 Lakh from finance in 30 days 📈`, hashtags: ["#personalfinance", "#investing", "#india"], boosted: false, virality: 98, watchTime: "94%", saveRate: "42%", hook: "Exact income screenshot in first frame", audio: "Trending — Lo-fi Study", reason: "Income proof + massive save rate triggered explore page push" },
      { user: "akshat_shrivastava", name: "Akshat Shrivastava", views: "3.4M", likes: "265K", comments: "9.8K", shares: "67K", caption: `Finance secrets banks don't want you to know 🤫`, hashtags: ["#finance", "#moneyhacks", "#stockmarket"], boosted: true, virality: 91, watchTime: "89%", saveRate: "38%", hook: "Secret reveal format drives curiosity gap", audio: "Suspense Trending Audio", reason: "Boosted + secret-reveal format + high shares amplified reach" },
      { user: "rahul_finance", name: "Rahul Sharma", views: "2.1M", likes: "167K", comments: "4.5K", shares: "38K", caption: `Best finance apps in India 2024 💰`, hashtags: ["#financeapps", "#investing", "#money"], boosted: false, virality: 79, watchTime: "81%", saveRate: "29%", hook: "List format — people save for future reference", audio: "Original VO", reason: "List format = high saves = algorithm rewards with more reach" },
    ],
    cricket: [
      { user: "cricketaddicter", name: "Cricket Addict", views: "8.9M", likes: "720K", comments: "24K", shares: "180K", caption: `Virat Kohli's secret training method 🏏`, hashtags: ["#cricket", "#virat", "#ipl"], boosted: false, virality: 99, watchTime: "97%", saveRate: "15%", hook: "Celebrity name in caption = instant curiosity click", audio: "Trending IPL Anthem", reason: "Kohli name + trending moment + IPL season timing = perfect storm" },
      { user: "ipl_highlights", name: "IPL Highlights", views: "5.2M", likes: "410K", comments: "18K", shares: "120K", caption: `Top 10 sixes in cricket history 🔥`, hashtags: ["#ipl", "#cricket", "#sixers"], boosted: true, virality: 94, watchTime: "93%", saveRate: "11%", hook: "Countdown format keeps watching till the end", audio: "Stadium Crowd Roar", reason: "Boosted + countdown = high completion rate triggers algorithm" },
      { user: "cricket_fanatic", name: "Cricket Fanatic", views: "3.1M", likes: "245K", comments: "8.9K", shares: "72K", caption: `This cricket shot nobody talks about 😱`, hashtags: ["#cricket", "#shots", "#viral"], boosted: false, virality: 86, watchTime: "91%", saveRate: "19%", hook: "Mystery format — 'nobody talks about' creates FOMO", audio: "Dramatic Music Trending", reason: "Surprise + mystery hook = maximum shares from fans" },
    ],
    default: [
      { user: "uptrent_creator1", name: "Top Creator", views: "3.5M", likes: "280K", comments: "7.2K", shares: "55K", caption: `Everything about this niche you need to know 🔥`, hashtags: ["#viral", "#trending", "#india"], boosted: false, virality: 88, watchTime: "87%", saveRate: "24%", hook: "Bold statement opener grabs instant attention", audio: "Trending Audio India", reason: "Educational + save-worthy content always gets algorithm push" },
      { user: "uptrent_creator2", name: "Viral Creator", views: "2.1M", likes: "165K", comments: "4.8K", shares: "32K", caption: `This changed everything for me ✨`, hashtags: ["#viral", "#creator", "#reels"], boosted: true, virality: 81, watchTime: "83%", saveRate: "19%", hook: "Personal story format builds emotional connection", audio: "Emotional Trending Track", reason: "Boosted + story format = strong emotional engagement" },
      { user: "uptrent_creator3", name: "Content Pro", views: "1.7M", likes: "132K", comments: "3.1K", shares: "28K", caption: `Top 5 things nobody tells you about this 💡`, hashtags: ["#tips", "#knowledge", "#viral"], boosted: false, virality: 76, watchTime: "79%", saveRate: "33%", hook: "List format with 'nobody tells you' drives curiosity", audio: "Upbeat Trending Beat", reason: "High save rate from list format = consistent algorithm boost" },
    ],
  };

  const n = niche.toLowerCase();
  let base = templates.default;
  if (n.includes("fitness") || n.includes("gym") || n.includes("workout") || n.includes("yoga")) base = templates.fitness;
  else if (n.includes("finance") || n.includes("stock") || n.includes("crypto") || n.includes("money") || n.includes("invest")) base = templates.finance;
  else if (n.includes("cricket") || n.includes("ipl")) base = templates.cricket;

  return base.map((r, i) => ({
    ...r, id: `reel-${i}`,
    thumbnail: `https://picsum.photos/seed/${n.replace(/\s/g, '')}-reel-${i}/400/700`,
    niche,
  }));
}

// ── YouTube Shorts Generator ──
function generateShorts(niche: string) {
  const templates: Record<string, any[]> = {
    tech: [
      { user: "techburner", name: "Tech Burner", views: "12.4M", likes: "890K", comments: "18K", shares: "145K", caption: `iPhone 16 vs Android — honest truth nobody tells you 📱`, hashtags: ["#iphone", "#android", "#tech"], boosted: false, virality: 97, ctr: "14.2%", avgView: "68%", retention: "High drop at 0:08 then steady", hook: "Split screen comparison in first 2 seconds", thumbHook: "RED text 'WRONG' on thumbnail drives clicks", audio: "Trending Tech Beat", topComment: "'Finally someone said the truth!' — 42K likes", reason: "Comparison format + controversial opinion + trending topic timing" },
      { user: "techguruji", name: "Technical Guruji", views: "8.7M", likes: "620K", comments: "24K", shares: "98K", caption: `This ₹999 gadget changed my life 🔥`, hashtags: ["#gadget", "#tech", "#india"], boosted: true, virality: 92, ctr: "11.8%", avgView: "61%", retention: "Strong first 15 seconds", hook: "Product reveal with price shock", thumbHook: "Price highlighted in yellow on thumbnail", audio: "Upbeat Background Music", topComment: "'Ordering this right now!' — 28K likes", reason: "Boosted + price shock + India-affordable product = massive saves" },
      { user: "geekyshivam", name: "Geeky Shivam", views: "5.2M", likes: "410K", comments: "9.8K", shares: "67K", caption: `AI tool that replaced my entire team 🤖`, hashtags: ["#ai", "#productivity", "#tech"], boosted: false, virality: 85, ctr: "9.4%", avgView: "74%", retention: "Very high — people rewatch for tool names", hook: "Bold claim opener — 'replaced my entire team'", thumbHook: "Robot emoji + shocked face = click magnet", audio: "Futuristic Sound Effect", topComment: "'What tool is this?!' — 18K likes", reason: "AI curiosity + high rewatch + people share to save for later" },
    ],
    finance: [
      { user: "sharan_hegde", name: "Sharan Hegde", views: "15.1M", likes: "1.1M", comments: "32K", shares: "220K", caption: `This one finance mistake costs Indians crores every year 💸`, hashtags: ["#finance", "#money", "#india"], boosted: false, virality: 99, ctr: "16.5%", avgView: "82%", retention: "Almost no drop-off — people fear missing info", hook: "Fear-based opener with exact number", thumbHook: "₹ symbol + crying emoji drives fear clicks", audio: "Urgent News-style Beat", topComment: "'I made this mistake last year!' — 89K likes", reason: "Fear + loss aversion + Indian money psychology = unstoppable viral" },
      { user: "akshat_shriv", name: "Akshat Shrivastava", views: "9.3M", likes: "720K", comments: "19K", shares: "165K", caption: `How I turned ₹10K into ₹2.4L in 8 months 📈`, hashtags: ["#investing", "#stocks", "#wealthbuilding"], boosted: false, virality: 94, ctr: "13.7%", avgView: "79%", retention: "People rewatch for the exact steps", hook: "Personal income proof with exact numbers", thumbHook: "Graph going up + exact return percentage", audio: "Motivational Lo-fi", topComment: "'Which stocks?' — 55K likes", reason: "Income proof + exact numbers + aspirational = massive saves and shares" },
      { user: "ca_rachit", name: "CA Rachit Parikh", views: "6.8M", likes: "540K", comments: "14K", shares: "112K", caption: `Tax saving secrets CAs don't tell their clients 🤫`, hashtags: ["#tax", "#finance", "#india"], boosted: true, virality: 89, ctr: "12.1%", avgView: "71%", retention: "Drops at 45s but strong start", hook: "Secret reveal — professional calling out own industry", thumbHook: "CA logo + 'SECRET' text = trust + curiosity", audio: "Whispering Sound Effect Trending", topComment: "'Sending this to my dad!' — 31K likes", reason: "Boosted + professional credibility + secret format = high shares" },
    ],
    gaming: [
      { user: "mortalofficial", name: "Mortal", views: "18.9M", likes: "1.4M", comments: "45K", shares: "310K", caption: `I carried 4 noobs to Conqueror in BGMI 🎮🔥`, hashtags: ["#bgmi", "#gaming", "#india"], boosted: false, virality: 98, ctr: "18.2%", avgView: "91%", retention: "Almost perfect — gaming highlights hold attention", hook: "Challenge format with impossible goal", thumbHook: "Angry/determined face + game UI = gamer click", audio: "BGMI In-game + Hype Music", topComment: "'How is this even possible?!' — 92K likes", reason: "Clutch moments + challenge format + BGMI India craze = viral guaranteed" },
      { user: "scout_yt", name: "Scout", views: "11.4M", likes: "870K", comments: "28K", shares: "195K", caption: `This BGMI trick nobody knows about 😱`, hashtags: ["#bgmitips", "#gaming", "#shorts"], boosted: false, virality: 93, ctr: "15.4%", avgView: "88%", retention: "Rewatch heavy — people try to copy the trick", hook: "Tutorial reveal with 'nobody knows'", thumbHook: "Game UI + surprised face thumbnail", audio: "Trending Gaming Beat", topComment: "'Bhai OP trick!' — 47K likes", reason: "Tutorial + FOMO + high rewatch value = algorithm loves it" },
      { user: "dynamo_gaming", name: "Dynamo Gaming", views: "7.6M", likes: "590K", comments: "16K", shares: "98K", caption: `1 vs 4 clutch that broke the internet 🎯`, hashtags: ["#clutch", "#bgmi", "#gaming"], boosted: true, virality: 87, ctr: "13.1%", avgView: "85%", retention: "Strong throughout — clutch videos hold viewers", hook: "Dramatic clutch moment shown at start then cut", thumbHook: "1v4 text + intense game moment", audio: "Dramatic Movie Music", topComment: "'Legend!' — 38K likes", reason: "Boosted + underdog story format + pure skill showcase" },
    ],
    default: [
      { user: "creator_one", name: "Top Creator", views: "5.8M", likes: "440K", comments: "11K", shares: "82K", caption: `Everything you need to know about this niche in 60 seconds ⚡`, hashtags: ["#shorts", "#trending", "#india"], boosted: false, virality: 86, ctr: "10.5%", avgView: "72%", retention: "Strong open, slight drop at midpoint", hook: "Speed run format — packs value fast", thumbHook: "Clock emoji + niche keyword = urgency", audio: "Fast Trending Beat", topComment: "'Saved this for later!' — 22K likes", reason: "Value-packed format + high save rate = algorithm push" },
      { user: "creator_two", name: "Viral Shorts", views: "3.9M", likes: "298K", comments: "7.4K", shares: "56K", caption: `I tested this for 30 days — honest results 📊`, hashtags: ["#honest", "#review", "#viral"], boosted: true, virality: 79, ctr: "8.9%", avgView: "68%", retention: "Consistent — viewers want the result", hook: "Time challenge + promised reveal at end", thumbHook: "30 days calendar + result teaser", audio: "Documentary Style Music", topComment: "'This is so honest!' — 16K likes", reason: "Boosted + authenticity + promised payoff = high completion rate" },
      { user: "creator_three", name: "Content King", views: "2.7M", likes: "210K", comments: "5.2K", shares: "38K", caption: `This changed 10 million lives — here's how 🌟`, hashtags: ["#motivation", "#viral", "#shorts"], boosted: false, virality: 74, ctr: "7.8%", avgView: "65%", retention: "Front-loaded — strong hook then gradual drop", hook: "Big number claim — '10 million lives'", thumbHook: "Inspirational background + bold white text", audio: "Emotional Piano Trending", topComment: "'Sharing this with everyone!' — 9K likes", reason: "Inspirational format + share-worthy message = organic spread" },
    ],
  };

  const n = niche.toLowerCase();
  let base = templates.default;
  if (n.includes("tech") || n.includes("gadget") || n.includes("ai") || n.includes("phone")) base = templates.tech;
  else if (n.includes("finance") || n.includes("money") || n.includes("invest") || n.includes("stock") || n.includes("crypto")) base = templates.finance;
  else if (n.includes("gaming") || n.includes("game") || n.includes("bgmi") || n.includes("pubg")) base = templates.gaming;

  return base.map((r, i) => ({
    ...r, id: `short-${i}`,
    thumbnail: `https://picsum.photos/seed/${n.replace(/\s/g, '')}-short-${i}/400/700`,
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
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");
  const [insightItem, setInsightItem] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 2400);
    return () => clearInterval(interval);
  }, []);

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    setItems([]); setSearched(""); setSearch("");
  };

  const handleSearch = async (q?: string) => {
    const query = q || search;
    if (!query.trim()) return;
    setSearch(query);
    setLoading(true);
    setSearched(query);
    setItems([]);
    await new Promise(r => setTimeout(r, 1200));
    setItems(platform === "instagram" ? generateReels(query) : generateShorts(query));
    setLoading(false);
  };

  const chips = platform === "instagram" ? instagramChips : youtubeChips;
  const accentColor = platform === "instagram" ? G : B;
  const accentGrad = platform === "instagram" ? GOLD : BLUE_G;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        .cg{font-family:'Cormorant Garamond',serif!important}
        .gold-text{background:linear-gradient(135deg,#E8B84B,#C17D20);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .blue-text{background:linear-gradient(135deg,#3B82F6,#1D4ED8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        *{box-sizing:border-box}
        .item-card{transition:transform .2s,border-color .2s}
        .item-card:hover{transform:translateY(-4px)}
        .chip-btn:hover{color:var(--chip-accent)!important}
      `}</style>

      <div className="flex-1 flex flex-col min-h-screen bg-background">

        {/* ── HERO ── */}
        <div className="flex flex-col items-center px-6 pt-10 pb-6 relative overflow-hidden">
          <motion.div animate={{ opacity: [0.03, 0.07, 0.03] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none rounded-full"
            style={{ background: `radial-gradient(ellipse, ${accentColor}, transparent 70%)`, filter: "blur(60px)" }} />

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-5 w-full max-w-2xl relative z-10">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
              style={{ background: `${accentColor}0D`, border: `1px solid ${accentColor}25`, color: accentColor, letterSpacing: ".1em", fontFamily: "Inter,sans-serif" }}>
              <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: accentColor }} />
              <Sparkles className="w-3 h-3" />
              {platform === "instagram" ? "INSTAGRAM REELS INTELLIGENCE" : "YOUTUBE SHORTS INTELLIGENCE"}
            </motion.div>

            {/* Headline */}
            <div className="cg text-5xl md:text-7xl font-bold text-center leading-tight" style={{ minHeight: "1.2em" }}>
              <AnimatePresence mode="wait">
                <motion.span key={wordIndex}
                  initial={{ opacity: 0, y: 20, letterSpacing: ".3em", filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: ".01em", filter: "blur(0)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className={wordIndex === 1 ? (platform === "instagram" ? "gold-text" : "blue-text") + " italic" : wordIndex === 2 ? "italic" : ""}
                  style={{ display: "inline-block", color: wordIndex === 0 ? "hsl(var(--foreground))" : wordIndex === 2 ? accentColor : undefined }}>
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="text-sm text-center text-muted-foreground max-w-md" style={{ fontFamily: "Inter,sans-serif" }}>
              {platform === "instagram"
                ? "Search any niche to see top reels, viral insights, boost status and what made them blow up"
                : "Search any niche to see top YouTube Shorts, hook analysis, CTR, retention and viral secrets"}
            </p>

            {/* Platform toggle */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-card border border-border">
              {(["instagram", "youtube"] as const).map(p => (
                <button key={p} onClick={() => switchPlatform(p)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={platform === p
                    ? { background: p === "instagram" ? GOLD : BLUE_G, color: "#fff", fontWeight: 600, fontFamily: "Inter,sans-serif" }
                    : { color: "hsl(var(--muted-foreground))", fontFamily: "Inter,sans-serif" }}>
                  {p === "instagram" ? <Instagram className="w-4 h-4" /> : <Youtube className="w-4 h-4" />}
                  {p === "instagram" ? "Instagram" : "YouTube"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder={platform === "instagram" ? "Search niche (e.g. Fitness, Finance, Cricket)..." : "Search niche (e.g. Tech, Gaming, Finance)..."}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  style={{ fontFamily: "Inter,sans-serif" }}
                  onFocus={e => { e.target.style.borderColor = `${accentColor}50`; e.target.style.boxShadow = `0 0 0 3px ${accentColor}0A`; }}
                  onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = "none"; }} />
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleSearch()}
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2"
                style={{ background: accentGrad, color: platform === "instagram" ? "#111" : "#fff", fontFamily: "Inter,sans-serif" }}>
                <Search className="w-4 h-4" /> Search
              </motion.button>
            </div>

            {/* Chips */}
            {!searched && (
              <div className="space-y-2 w-full">
                <p className="text-xs text-muted-foreground text-center" style={{ fontFamily: "Inter,sans-serif" }}>
                  {platform === "instagram" ? "🔥 Trending niches" : "🎬 Popular topics"}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {chips.map(chip => (
                    <motion.button key={chip} onClick={() => handleSearch(chip)} whileTap={{ scale: 0.96 }}
                      className="chip-btn px-3.5 py-1.5 rounded-full text-xs border border-border bg-card text-muted-foreground transition-all"
                      style={{ fontFamily: "Inter,sans-serif", "--chip-accent": accentColor } as any}
                      onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = `${accentColor}50`; (e.target as HTMLElement).style.color = accentColor; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = ""; (e.target as HTMLElement).style.color = ""; }}>
                      {chip}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              {platform === "instagram"
                ? <Instagram className="w-7 h-7" style={{ color: G }} />
                : <Youtube className="w-7 h-7" style={{ color: B }} />}
            </motion.div>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
              Finding top {platform === "instagram" ? "reels" : "shorts"} for{" "}
              <span style={{ color: accentColor }}>"{search}"</span>...
            </p>
          </div>
        )}

        {/* ── RESULTS GRID ── */}
        {searched && !loading && items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-24 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-foreground text-sm" style={{ fontFamily: "Inter,sans-serif" }}>
                  Top {platform === "instagram" ? "Reels" : "Shorts"} —{" "}
                  <span style={{ color: accentColor }}>#{searched}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "Inter,sans-serif" }}>
                  {items.length} results · Click{" "}
                  <span style={{ color: accentColor }}>Insights</span> to see why they went viral
                </p>
              </div>
              <button onClick={() => { setSearched(""); setItems([]); setSearch(""); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: "Inter,sans-serif" }}>
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="item-card bg-card border border-border rounded-2xl overflow-hidden"
                  style={{ borderColor: "hsl(var(--border))" }}>

                  {/* Thumbnail */}
                  <div className="relative aspect-[9/14] overflow-hidden">
                    <img src={item.thumbnail} alt={item.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.1) 70%)" }} />

                    {/* YouTube play icon */}
                    {platform === "youtube" && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    )}

                    {/* Boosted badge */}
                    {item.boosted && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: B, color: "#fff", fontFamily: "Inter,sans-serif" }}>
                        <Megaphone className="w-3 h-3" /> Boosted
                      </div>
                    )}

                    {/* Virality score */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: item.virality >= 90 ? accentColor : item.virality >= 80 ? "#22c55e" : "#888",
                        color: item.virality >= 90 && platform === "instagram" ? "#000" : "#fff",
                        fontFamily: "Inter,sans-serif"
                      }}>
                      <Flame className="w-3 h-3" /> {item.virality}
                    </div>

                    {/* CTR badge for YouTube */}
                    {platform === "youtube" && item.ctr && (
                      <div className="absolute bottom-16 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: "rgba(59,130,246,0.9)", color: "#fff", fontFamily: "Inter,sans-serif" }}>
                        <MousePointerClick className="w-3 h-3" /> CTR {item.ctr}
                      </div>
                    )}

                    {/* Bottom stats */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-medium mb-2 line-clamp-2 leading-snug" style={{ fontFamily: "Inter,sans-serif" }}>
                        {item.caption}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-white/80 text-xs" style={{ fontFamily: "Inter,sans-serif" }}>
                          <Eye className="w-3 h-3" /> {item.views}
                        </div>
                        <div className="flex items-center gap-1 text-white/80 text-xs" style={{ fontFamily: "Inter,sans-serif" }}>
                          <ThumbsUp className="w-3 h-3" /> {item.likes}
                        </div>
                        <div className="flex items-center gap-1 text-white/80 text-xs" style={{ fontFamily: "Inter,sans-serif" }}>
                          <Share2 className="w-3 h-3" /> {item.shares}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-3 flex items-center justify-between" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: accentGrad, color: platform === "instagram" ? "#111" : "#fff" }}>
                        {item.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate" style={{ fontFamily: "Inter,sans-serif" }}>{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate" style={{ fontFamily: "Inter,sans-serif" }}>@{item.user}</p>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setInsightItem(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0"
                      style={{ background: accentGrad, color: platform === "instagram" ? "#111" : "#fff", fontFamily: "Inter,sans-serif" }}>
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
          {insightItem && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
              onClick={() => setInsightItem(null)}>
              <motion.div initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.96 }}
                onClick={e => e.stopPropagation()}
                className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden"
                style={{ maxHeight: "90vh", overflowY: "auto" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `${accentColor}15` }}>
                      {platform === "instagram"
                        ? <Instagram className="w-4 h-4" style={{ color: accentColor }} />
                        : <Youtube className="w-4 h-4" style={{ color: accentColor }} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
                        {platform === "instagram" ? "Reel" : "Short"} Insights
                      </p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>@{insightItem.user}</p>
                    </div>
                  </div>
                  <button onClick={() => setInsightItem(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">

                  {/* Virality score */}
                  <div className="rounded-2xl p-4" style={{ background: `${accentColor}0D`, border: `1px solid ${accentColor}25` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor, fontFamily: "Inter,sans-serif" }}>
                        Virality Score
                      </p>
                      <span className="text-2xl font-bold cg" style={{ color: accentColor }}>{insightItem.virality}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${insightItem.virality}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-2 rounded-full" style={{ background: accentGrad }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: "Inter,sans-serif" }}>
                      {insightItem.virality >= 90 ? "🔥 Top 5% — extremely viral" :
                        insightItem.virality >= 80 ? "📈 Top 15% — high viral potential" : "✅ Above average performance"}
                    </p>
                  </div>

                  {/* Boost status */}
                  <div className="rounded-2xl p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>Boost Status</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: insightItem.boosted ? "#3B82F615" : "#22c55e15" }}>
                        {insightItem.boosted ? <Megaphone className="w-5 h-5 text-blue-400" /> : <Sparkles className="w-5 h-5 text-green-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
                          {insightItem.boosted ? "Paid Promotion (Boosted)" : "100% Organic Viral"}
                        </p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
                          {insightItem.boosted
                            ? "This used paid ads to boost reach. Some views are paid."
                            : "No paid promotion. Algorithm pushed this organically."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Engagement stats — different for YT vs IG */}
                  <div className="rounded-2xl p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>
                      {platform === "instagram" ? "Engagement Breakdown" : "Performance Metrics"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {platform === "instagram" ? [
                        { icon: Eye, label: "Views", val: insightItem.views, color: accentColor },
                        { icon: Heart, label: "Likes", val: insightItem.likes, color: "#ef4444" },
                        { icon: MessageCircle, label: "Comments", val: insightItem.comments, color: "#8b5cf6" },
                        { icon: Share2, label: "Shares", val: insightItem.shares, color: G },
                        { icon: Clock, label: "Watch Time", val: insightItem.watchTime, color: "#22c55e" },
                        { icon: Bookmark, label: "Save Rate", val: insightItem.saveRate, color: "#f59e0b" },
                      ] : [
                        { icon: Eye, label: "Views", val: insightItem.views, color: B },
                        { icon: ThumbsUp, label: "Likes", val: insightItem.likes, color: "#22c55e" },
                        { icon: MessageCircle, label: "Comments", val: insightItem.comments, color: "#8b5cf6" },
                        { icon: Share2, label: "Shares", val: insightItem.shares, color: accentColor },
                        { icon: MousePointerClick, label: "CTR", val: insightItem.ctr, color: B },
                        { icon: TrendingUp, label: "Avg Viewed", val: insightItem.avgView, color: "#f59e0b" },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-background">
                          <s.icon className="w-4 h-4 shrink-0" style={{ color: s.color }} />
                          <div>
                            <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{s.label}</p>
                            <p className="text-sm font-bold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{s.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* YouTube-specific: retention + top comment */}
                  {platform === "youtube" && (
                    <>
                      <div className="rounded-2xl p-4 border border-border">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>
                          Audience Retention
                        </p>
                        <div className="flex items-start gap-2">
                          <BarChart2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} />
                          <p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.retention}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl p-4 border border-border">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>
                          Top Comment
                        </p>
                        <div className="flex items-start gap-2">
                          <MessageCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} />
                          <p className="text-sm text-foreground italic" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.topComment}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl p-4 border border-border">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>
                          Thumbnail Hook
                        </p>
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} />
                          <p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.thumbHook}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Why it went viral */}
                  <div className="rounded-2xl p-4" style={{ background: "#22c55e0D", border: "1px solid #22c55e25" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#22c55e", fontFamily: "Inter,sans-serif" }}>
                      Why It Went Viral
                    </p>
                    <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.reason}</p>
                  </div>

                  {/* Hook analysis */}
                  <div className="rounded-2xl p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>
                      Hook Analysis
                    </p>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                      <p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.hook}</p>
                    </div>
                  </div>

                  {/* Audio & hashtags */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Audio</p>
                      <div className="flex items-center gap-1.5">
                        <Music2 className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                        <p className="text-xs text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.audio}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Hashtags</p>
                      <div className="flex flex-wrap gap-1">
                        {insightItem.hashtags.map((h: string, i: number) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{ background: `${accentColor}15`, color: accentColor, fontFamily: "Inter,sans-serif" }}>{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setInsightItem(null);
                      if (platform === "instagram") navigate("/scripts", { state: { topic: insightItem.niche } });
                      else navigate("/youtube/script", { state: { topic: insightItem.niche } });
                    }}
                    className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: accentGrad, color: platform === "instagram" ? "#111" : "#fff", fontFamily: "Inter,sans-serif" }}>
                    <Sparkles className="w-4 h-4" />
                    Generate {platform === "instagram" ? "Reel Script" : "YouTube Script"} for {insightItem.niche}
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