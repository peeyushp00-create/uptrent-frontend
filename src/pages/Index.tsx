import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Instagram, Youtube, Sparkles, X, Heart, Eye,
  MessageCircle, Share2, Bookmark, ArrowRight, Flame,
  Megaphone, Clock, Music2, AlertCircle, BarChart2,
  TrendingUp, ThumbsUp, Play, Target, MousePointerClick, Loader2
} from "lucide-react";

const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const BLUE_G = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const G = "#E8B84B";
const B = "#3B82F6";
const PAGE_SIZE = 9;

const instagramChips = ["Fitness","Motivation","Stock Market","Crypto","Travel","Food","Tech","Business","Fashion","Gaming","Comedy","Cricket","Education","Yoga","Entrepreneur","Bollywood"];
const youtubeChips = ["Tech Reviews","Finance","Motivation","Gaming","Travel Vlog","Cooking","Education","Fitness","Comedy","Cricket","Business","Music","Self Improvement","Crypto","Cars","Movies"];
const WORDS = ["Discover.", "Create.", "Go Viral."];

// ── Reel templates — 9 per niche ──
function generateReels(niche: string) {
  const all = [
    { user: "beerbiceps", name: "Ranveer Allahbadia", views: "4.2M", likes: "320K", comments: "8.4K", shares: "42K", caption: `Top 5 morning habits for ${niche} 💪🔥`, hashtags: ["#fitness","#morningroutine","#gains"], boosted: false, virality: 96, watchTime: "92%", saveRate: "18%", hook: "Dramatic transformation in first 3 seconds", audio: "Trending — Heeriye (Remix)", reason: "Transformation thumbnail + trending audio + posted at 7AM IST peak scroll time" },
    { user: "priyafitness", name: "Priya Mehta", views: "2.8M", likes: "198K", comments: "5.1K", shares: "28K", caption: `This ${niche} mistake costs you results ❌`, hashtags: ["#mistake","#workout","#india"], boosted: true, virality: 88, watchTime: "85%", saveRate: "22%", hook: "'You're doing it wrong' controversial opener", audio: "Original Audio", reason: "Boosted + mistake-based hook drives saves and debate comments" },
    { user: "techburner_fit", name: "Shlok Srivastava", views: "1.9M", likes: "145K", comments: "3.2K", shares: "19K", caption: `30 day ${niche} challenge results 🚀`, hashtags: ["#30daychallenge","#transformation"], boosted: false, virality: 82, watchTime: "88%", saveRate: "31%", hook: "Before/after split screen in first second", audio: "Trending — Kesariya Beat", reason: "Challenge format + high save rate = algorithm keeps pushing it" },
    { user: "sharan_hegde", name: "Sharan Hegde", views: "6.1M", likes: "480K", comments: "12K", shares: "95K", caption: `How I grew my ${niche} audience to 1M 📈`, hashtags: ["#growth","#creator","#india"], boosted: false, virality: 98, watchTime: "94%", saveRate: "42%", hook: "Income/milestone screenshot in first frame", audio: "Trending — Lo-fi Study", reason: "Milestone proof + massive save rate triggered explore page push" },
    { user: "akshat_shriv", name: "Akshat Shrivastava", views: "3.4M", likes: "265K", comments: "9.8K", shares: "67K", caption: `${niche} secrets nobody tells beginners 🤫`, hashtags: ["#secrets","#beginner","#tips"], boosted: true, virality: 91, watchTime: "89%", saveRate: "38%", hook: "Secret reveal format creates curiosity gap", audio: "Suspense Trending Audio", reason: "Boosted + secret-reveal + high shares = massive amplification" },
    { user: "rahul_creator", name: "Rahul Sharma", views: "2.1M", likes: "167K", comments: "4.5K", shares: "38K", caption: `Best tools for ${niche} in 2024 💰`, hashtags: ["#tools","#tips","#india"], boosted: false, virality: 79, watchTime: "81%", saveRate: "29%", hook: "List format — people save for reference", audio: "Original VO", reason: "List format = high saves = algorithm rewards with consistent reach" },
    { user: "cricketaddicter", name: "Cricket Addict", views: "8.9M", likes: "720K", comments: "24K", shares: "180K", caption: `Top 10 ${niche} moments of 2024 🔥`, hashtags: ["#top10","#viral","#trending"], boosted: false, virality: 99, watchTime: "97%", saveRate: "15%", hook: "Countdown format keeps viewers watching till end", audio: "Trending Anthem 2024", reason: "Top-10 countdown + trending moment timing = guaranteed viral" },
    { user: "sneha_creates", name: "Sneha Rao", views: "1.5M", likes: "118K", comments: "2.8K", shares: "22K", caption: `POV: You finally understand ${niche} 😂`, hashtags: ["#pov","#relatable","#funny"], boosted: false, virality: 76, watchTime: "78%", saveRate: "12%", hook: "POV format = instant relatability from first frame", audio: "Trending Comedy Audio", reason: "Relatable format + comedy = high shares among friends" },
    { user: "vikram_content", name: "Vikram Das", views: "2.7M", likes: "210K", comments: "5.9K", shares: "48K", caption: `I tried ${niche} for 7 days — honest review 😤`, hashtags: ["#honestreviews","#7days","#results"], boosted: true, virality: 84, watchTime: "86%", saveRate: "26%", hook: "Challenge + promise of honest result = viewers stay till end", audio: "Emotional Piano Trending", reason: "Boosted + authenticity angle + promised payoff = high completion" },
  ];
  return all.map((r, i) => ({ ...r, id: `reel-${i}`, thumbnail: `https://picsum.photos/seed/${niche.replace(/\s/g,'').toLowerCase()}-r${i}/400/700`, niche }));
}

// ── Shorts templates — 9 per niche ──
function generateShorts(niche: string) {
  const all = [
    { user: "techburner", name: "Tech Burner", views: "12.4M", likes: "890K", comments: "18K", shares: "145K", caption: `${niche} truth nobody tells you 📱`, hashtags: ["#truth","#shorts","#viral"], boosted: false, virality: 97, ctr: "14.2%", avgView: "68%", retention: "High drop at 0:08 then steady till end", hook: "Split screen comparison in first 2 seconds", thumbHook: "RED 'WRONG' text on thumbnail drives fear clicks", audio: "Trending Tech Beat", topComment: "'Finally someone said the truth!' — 42K likes", reason: "Controversial opinion + comparison format + trending topic timing" },
    { user: "techguruji", name: "Technical Guruji", views: "8.7M", likes: "620K", comments: "24K", shares: "98K", caption: `This ₹999 ${niche} gadget changed my life 🔥`, hashtags: ["#gadget","#shorts","#india"], boosted: true, virality: 92, ctr: "11.8%", avgView: "61%", retention: "Strong first 15 seconds then gradual drop", hook: "Product reveal with price shock in first second", thumbHook: "Price highlighted in yellow = curiosity + affordability", audio: "Upbeat Background Music", topComment: "'Ordering this right now!' — 28K likes", reason: "Boosted + price shock + India-affordable = massive saves and orders" },
    { user: "geekyshivam", name: "Geeky Shivam", views: "5.2M", likes: "410K", comments: "9.8K", shares: "67K", caption: `AI tool for ${niche} that nobody is using 🤖`, hashtags: ["#ai","#productivity","#shorts"], boosted: false, virality: 85, ctr: "9.4%", avgView: "74%", retention: "Very high — people rewatch for tool names", hook: "Bold claim opener with specific number", thumbHook: "Robot emoji + shocked face = click magnet combo", audio: "Futuristic Sound Effect Trending", topComment: "'What tool is this?!' — 18K likes", reason: "AI curiosity + high rewatch rate + people share to friends" },
    { user: "mortalofficial", name: "Mortal", views: "18.9M", likes: "1.4M", comments: "45K", shares: "310K", caption: `Impossible ${niche} challenge completed 🎮🔥`, hashtags: ["#challenge","#shorts","#viral"], boosted: false, virality: 98, ctr: "18.2%", avgView: "91%", retention: "Almost perfect retention — highlights hold attention", hook: "Impossible goal stated in first half second", thumbHook: "Intense face + impossible number = must click", audio: "Hype Music + Sound Effects", topComment: "'How is this even possible?!' — 92K likes", reason: "Clutch moments + challenge format + underdog story = viral guaranteed" },
    { user: "sharan_shorts", name: "Sharan Hegde", views: "15.1M", likes: "1.1M", comments: "32K", shares: "220K", caption: `This ${niche} mistake costs crores every year 💸`, hashtags: ["#mistake","#money","#india"], boosted: false, virality: 99, ctr: "16.5%", avgView: "82%", retention: "Almost no drop-off — fear of missing info keeps watching", hook: "Fear-based opener with exact rupee amount", thumbHook: "₹ symbol + crying emoji drives loss aversion click", audio: "Urgent News-style Beat", topComment: "'I made this mistake last year!' — 89K likes", reason: "Fear + loss aversion + Indian money psychology = unstoppable viral" },
    { user: "akshat_shorts", name: "Akshat Shrivastava", views: "9.3M", likes: "720K", comments: "19K", shares: "165K", caption: `How I turned ₹10K into ₹2L with ${niche} 📈`, hashtags: ["#investing","#returns","#shorts"], boosted: false, virality: 94, ctr: "13.7%", avgView: "79%", retention: "People rewatch for exact steps — high rewatch rate", hook: "Personal income proof with exact rupee numbers", thumbHook: "Graph going up + exact return % = aspirational click", audio: "Motivational Lo-fi Beat", topComment: "'Which stocks?' — 55K likes", reason: "Income proof + exact numbers + aspirational story = massive saves" },
    { user: "scout_yt", name: "Scout", views: "11.4M", likes: "870K", comments: "28K", shares: "195K", caption: `Secret ${niche} trick nobody knows 😱`, hashtags: ["#secret","#tips","#shorts"], boosted: false, virality: 93, ctr: "15.4%", avgView: "88%", retention: "Rewatch heavy — people copy the trick multiple times", hook: "Tutorial reveal with 'nobody knows' FOMO hook", thumbHook: "Game/niche UI + surprised creator face", audio: "Trending Beat India 2024", topComment: "'Bhai OP trick!' — 47K likes", reason: "Tutorial + FOMO + high rewatch value = algorithm pushes it hard" },
    { user: "ca_rachit", name: "CA Rachit", views: "6.8M", likes: "540K", comments: "14K", shares: "112K", caption: `${niche} hacks experts don't share 🤫`, hashtags: ["#hacks","#expert","#shorts"], boosted: true, virality: 89, ctr: "12.1%", avgView: "71%", retention: "Drops at 45s but strong open hook", hook: "Professional calling out own industry = credibility + drama", thumbHook: "Professional logo + 'SECRET' text = trust + curiosity combo", audio: "Whispering Sound Effect Trending", topComment: "'Sending this to my dad!' — 31K likes", reason: "Boosted + professional credibility + secret reveal = massive shares" },
    { user: "dynamo_gaming", name: "Dynamo Gaming", views: "7.6M", likes: "590K", comments: "16K", shares: "98K", caption: `${niche} in 60 seconds — everything you need 🎯`, hashtags: ["#60seconds","#shorts","#fastlearning"], boosted: false, virality: 83, ctr: "10.8%", avgView: "76%", retention: "Consistent throughout — speed keeps people watching", hook: "Speed run format — packs maximum value in minimum time", thumbHook: "Stopwatch + topic keyword = urgency + value promise", audio: "Fast Upbeat Trending Music", topComment: "'Best 60 seconds of my day!' — 21K likes", reason: "Speed format + value density + shareable as 'send this to a friend'" },
  ];
  return all.map((r, i) => ({ ...r, id: `short-${i}`, thumbnail: `https://picsum.photos/seed/${niche.replace(/\s/g,'').toLowerCase()}-s${i}/400/700`, niche }));
}

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState("");
  const [insightItem, setInsightItem] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 2400);
    return () => clearInterval(interval);
  }, []);

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p); localStorage.setItem("platform", p);
    setAllItems([]); setSearched(""); setSearch(""); setVisibleCount(PAGE_SIZE);
  };

  const handleSearch = async (q?: string) => {
    const query = q || search;
    if (!query.trim()) return;
    setSearch(query); setLoading(true); setSearched(query);
    setAllItems([]); setVisibleCount(PAGE_SIZE);
    await new Promise(r => setTimeout(r, 1200));
    setAllItems(platform === "instagram" ? generateReels(query) : generateShorts(query));
    setLoading(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await new Promise(r => setTimeout(r, 800));
    setVisibleCount(c => c + PAGE_SIZE);
    setLoadingMore(false);
  };

  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;
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
        .item-card:hover{transform:translateY(-4px);border-color:#E8B84B30!important}
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
                : "Search any niche to see top Shorts, hook analysis, CTR, retention and viral secrets"}
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
                      className="px-3.5 py-1.5 rounded-full text-xs border border-border bg-card text-muted-foreground transition-all"
                      style={{ fontFamily: "Inter,sans-serif" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}50`; (e.currentTarget as HTMLElement).style.color = accentColor; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ""; (e.currentTarget as HTMLElement).style.color = ""; }}>
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

        {/* ── RESULTS ── */}
        {searched && !loading && visibleItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-12 max-w-5xl mx-auto w-full">

            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-foreground text-sm" style={{ fontFamily: "Inter,sans-serif" }}>
                  Top {platform === "instagram" ? "Reels" : "Shorts"} — <span style={{ color: accentColor }}>#{searched}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "Inter,sans-serif" }}>
                  Showing {visibleItems.length} of {allItems.length} · Click <span style={{ color: accentColor }}>Insights</span> to see why they went viral
                </p>
              </div>
              <button onClick={() => { setSearched(""); setAllItems([]); setSearch(""); setVisibleCount(PAGE_SIZE); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: "Inter,sans-serif" }}>
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleItems.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % PAGE_SIZE) * 0.07 }}
                  className="item-card bg-card border border-border rounded-2xl overflow-hidden">

                  {/* Thumbnail */}
                  <div className="relative aspect-[9/14] overflow-hidden">
                    <img src={item.thumbnail} alt={item.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.1) 70%)" }} />

                    {platform === "youtube" && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    )}

                    {item.boosted && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: B, color: "#fff", fontFamily: "Inter,sans-serif" }}>
                        <Megaphone className="w-3 h-3" /> Boosted
                      </div>
                    )}

                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: item.virality >= 90 ? accentColor : item.virality >= 80 ? "#22c55e" : "#888", color: item.virality >= 90 && platform === "instagram" ? "#000" : "#fff", fontFamily: "Inter,sans-serif" }}>
                      <Flame className="w-3 h-3" /> {item.virality}
                    </div>

                    {platform === "youtube" && item.ctr && (
                      <div className="absolute bottom-16 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: "rgba(59,130,246,0.85)", color: "#fff", fontFamily: "Inter,sans-serif" }}>
                        <MousePointerClick className="w-3 h-3" /> {item.ctr}
                      </div>
                    )}

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

            {/* ✅ LOAD MORE BUTTON */}
            {hasMore && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-8">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleLoadMore} disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold border transition-all disabled:opacity-60"
                  style={{ border: `1px solid ${accentColor}40`, color: accentColor, fontFamily: "Inter,sans-serif", background: `${accentColor}08` }}>
                  {loadingMore
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading more...</>
                    : <><TrendingUp className="w-4 h-4" /> Load More {platform === "instagram" ? "Reels" : "Shorts"} ({allItems.length - visibleCount} remaining)</>}
                </motion.button>
              </motion.div>
            )}

            {/* All loaded message */}
            {!hasMore && allItems.length > 0 && (
              <p className="text-center text-xs text-muted-foreground mt-6" style={{ fontFamily: "Inter,sans-serif" }}>
                ✅ All {allItems.length} {platform === "instagram" ? "reels" : "shorts"} loaded
              </p>
            )}
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

                <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}15` }}>
                      {platform === "instagram" ? <Instagram className="w-4 h-4" style={{ color: accentColor }} /> : <Youtube className="w-4 h-4" style={{ color: accentColor }} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{platform === "instagram" ? "Reel" : "Short"} Insights</p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>@{insightItem.user}</p>
                    </div>
                  </div>
                  <button onClick={() => setInsightItem(null)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Virality */}
                  <div className="rounded-2xl p-4" style={{ background: `${accentColor}0D`, border: `1px solid ${accentColor}25` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor, fontFamily: "Inter,sans-serif" }}>Virality Score</p>
                      <span className="text-2xl font-bold cg" style={{ color: accentColor }}>{insightItem.virality}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${insightItem.virality}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className="h-2 rounded-full" style={{ background: accentGrad }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: "Inter,sans-serif" }}>
                      {insightItem.virality >= 90 ? "🔥 Top 5% — extremely viral" : insightItem.virality >= 80 ? "📈 Top 15% — high viral potential" : "✅ Above average performance"}
                    </p>
                  </div>

                  {/* Boost */}
                  <div className="rounded-2xl p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>Boost Status</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: insightItem.boosted ? "#3B82F615" : "#22c55e15" }}>
                        {insightItem.boosted ? <Megaphone className="w-5 h-5 text-blue-400" /> : <Sparkles className="w-5 h-5 text-green-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.boosted ? "Paid Promotion (Boosted)" : "100% Organic Viral"}</p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: "Inter,sans-serif" }}>
                          {insightItem.boosted ? "Used paid ads to amplify reach. Some views are paid." : "No paid promotion. Algorithm pushed this naturally."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="rounded-2xl p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "Inter,sans-serif" }}>
                      {platform === "instagram" ? "Engagement Breakdown" : "Performance Metrics"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(platform === "instagram" ? [
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
                      ]).map((s, i) => (
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

                  {/* YouTube extras */}
                  {platform === "youtube" && (<>
                    <div className="rounded-2xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Audience Retention</p>
                      <div className="flex items-start gap-2"><BarChart2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} /><p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.retention}</p></div>
                    </div>
                    <div className="rounded-2xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Top Comment</p>
                      <div className="flex items-start gap-2"><MessageCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} /><p className="text-sm text-foreground italic" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.topComment}</p></div>
                    </div>
                    <div className="rounded-2xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Thumbnail Hook</p>
                      <div className="flex items-start gap-2"><Target className="w-4 h-4 shrink-0 mt-0.5" style={{ color: B }} /><p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.thumbHook}</p></div>
                    </div>
                  </>)}

                  {/* Why viral */}
                  <div className="rounded-2xl p-4" style={{ background: "#22c55e0D", border: "1px solid #22c55e25" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#22c55e", fontFamily: "Inter,sans-serif" }}>Why It Went Viral</p>
                    <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.reason}</p>
                  </div>

                  {/* Hook */}
                  <div className="rounded-2xl p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Hook Analysis</p>
                    <div className="flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} /><p className="text-sm text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.hook}</p></div>
                  </div>

                  {/* Audio + hashtags */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Audio</p>
                      <div className="flex items-center gap-1.5"><Music2 className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} /><p className="text-xs text-foreground" style={{ fontFamily: "Inter,sans-serif" }}>{insightItem.audio}</p></div>
                    </div>
                    <div className="rounded-2xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "Inter,sans-serif" }}>Hashtags</p>
                      <div className="flex flex-wrap gap-1">
                        {insightItem.hashtags.map((h: string, i: number) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: `${accentColor}15`, color: accentColor, fontFamily: "Inter,sans-serif" }}>{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setInsightItem(null); navigate(platform === "instagram" ? "/scripts" : "/youtube/script", { state: { topic: insightItem.niche } }); }}
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