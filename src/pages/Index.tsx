import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Sparkles, Instagram, Youtube } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PRIMARY = "#7C3AED";
const SECONDARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #6D28D9)";
const YT_GRAD = "linear-gradient(135deg, #ff0000, #cc0000)";
const PRIMARY_CONTAINER = "#ede9fe";

const IG_CHIPS = ["Fitness", "Finance", "Cricket", "Bollywood", "Tech", "Food", "Travel", "Gaming", "Motivation", "Skincare", "Yoga", "Crypto"];
const YT_CHIPS = ["YouTube SEO", "Shorts Strategy", "Thumbnails", "Tech Reviews", "Gaming", "Finance", "Vlogs", "Education", "Cooking", "Motivation", "Comedy", "Music"];

const WORDS = ["Discover.", "Create.", "Go Viral."];

const FLOATING_TAGS = [
  { text: "#FinanceTips", x: "8%", y: "20%", delay: 0 },
  { text: "#Cricket2026", x: "75%", y: "15%", delay: 0.3 },
  { text: "#Viral", x: "85%", y: "45%", delay: 0.6 },
  { text: "#Reels", x: "5%", y: "60%", delay: 0.9 },
  { text: "#Shorts", x: "80%", y: "70%", delay: 1.2 },
  { text: "#AIContent", x: "10%", y: "80%", delay: 1.5 },
];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<"Instagram" | "YouTube">(() => {
    const saved = localStorage.getItem("platform");
    return saved === "youtube" ? "YouTube" : "Instagram";
  });
  const [search, setSearch] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const chips = platform === "Instagram" ? IG_CHIPS : YT_CHIPS;

  // Sync with sidebar
  useEffect(() => {
    const handleCustom = (e: any) => {
      setPlatform(e.detail === "youtube" ? "YouTube" : "Instagram");
    };
    window.addEventListener("platformChanged", handleCustom);
    return () => window.removeEventListener("platformChanged", handleCustom);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % WORDS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (!search.trim()) return;
    if (platform === "Instagram") navigate("/insight", { state: { query: search } });
    else navigate("/youtube/seo", { state: { query: search } });
  };

  const handleChip = (chip: string) => {
    setSearch(chip);
    if (platform === "Instagram") navigate("/insight", { state: { query: chip } });
    else navigate("/youtube/seo", { state: { query: chip } });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900 relative overflow-hidden flex flex-col items-center justify-center px-5 py-12">

      {/* Floating background blobs */}
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none rounded-full"
        style={{ background: `radial-gradient(ellipse, ${PRIMARY}40, transparent 65%)`, filter: "blur(80px)" }} />
      <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 12, repeat: Infinity, delay: 3 }}
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] pointer-events-none rounded-full"
        style={{ background: `radial-gradient(circle, ${SECONDARY}40, transparent 70%)`, filter: "blur(80px)" }} />

      {/* Floating hashtag tags */}
      {FLOATING_TAGS.map((tag, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 0.6, 0.6, 0], y: [20, 0, 0, -20] }}
          transition={{ duration: 4, delay: tag.delay, repeat: Infinity, repeatDelay: 3 }}
          className="absolute hidden md:block text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none"
          style={{ left: tag.x, top: tag.y, background: PRIMARY_CONTAINER, color: PRIMARY }}>
          {tag.text}
        </motion.div>
      ))}

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center gap-8">

        {/* Animated headline */}
        <div className="text-center space-y-3">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: PRIMARY }} />
            AI-powered content discovery
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <AnimatePresence mode="wait">
              <motion.span key={wordIndex}
                initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
                transition={{ duration: 0.5 }}
                className="block"
                style={{ background: PRIMARY_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
            <span className="block text-[#191c1d] dark:text-white text-3xl md:text-4xl mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Content that gets discovered
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-[#757684] text-base max-w-md mx-auto">
            Find viral ideas for Instagram Reels & YouTube Shorts — built for Indian creators
          </motion.p>
        </div>

        {/* Platform Toggle */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="flex gap-1 p-1.5 rounded-2xl shadow-sm"
          style={{ background: 'white', border: '1px solid #e1e3e4' }}>
          {(['Instagram', 'YouTube'] as const).map(tab => (
            <motion.button key={tab}
              onClick={() => {
                setPlatform(tab);
                setSearch('');
                const p = tab === "Instagram" ? "instagram" : "youtube";
                localStorage.setItem("platform", p);
                window.dispatchEvent(new CustomEvent("platformChanged", { detail: p }));
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
           style={platform === tab
  ? { background: tab === 'Instagram' ? PRIMARY_GRAD : YT_GRAD, color: '#fff' }
  : { color: '#757684' }}
              whileTap={{ scale: 0.97 }}>
              {tab === 'Instagram'
                ? <Instagram className="w-4 h-4" />
                : <Youtube className="w-4 h-4" />}
              {tab}
            </motion.button>
          ))}
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="w-full">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757684]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder={platform === "Instagram" ? "Search reels ideas (e.g. Fitness, Finance)..." : "Search YouTube topics (e.g. Tech review, Shorts)..."}
                className="w-full pl-11 pr-10 py-4 rounded-2xl text-sm text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none transition-all"
                style={{ background: 'white', border: `2px solid ${search ? (platform === 'Instagram' ? PRIMARY : '#ff0000') : '#e1e3e4'}`, boxShadow: search ? `0 0 0 4px ${platform === 'Instagram' ? PRIMARY : '#ff0000'}15` : 'none' }} />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#191c1d]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <motion.button onClick={handleSearch} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="px-6 py-4 rounded-2xl text-white font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all"
              style={{ background: platform === 'Instagram' ? PRIMARY_GRAD : YT_GRAD }}>
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Chips */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="w-full">
          <p className="text-xs font-semibold text-[#757684] uppercase tracking-wider mb-3">
            {platform === "Instagram" ? "🔥 Trending Niches" : "📺 Popular Topics"}
          </p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="wait">
              {chips.map((chip, i) => (
                <motion.button key={`${platform}-${chip}`}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.03 }}
                  onClick={() => handleChip(chip)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 rounded-full text-xs font-bold transition-all border hover:shadow-sm"
                  style={search === chip
                    ? { background: PRIMARY_GRAD, color: '#fff', borderColor: 'transparent' }
                    : { background: 'white', borderColor: '#e1e3e4', color: '#454652' }}>
                  {chip}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick nav */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex gap-3 flex-wrap justify-center">
          {[
            { label: "📰 News Feed", path: "/news" },
            { label: "✍️ Scripts", path: "/scripts" },
            { label: "📈 Trending", path: "/trending" },
          ].map((item, i) => (
            <button key={i} onClick={() => navigate(item.path)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#e1e3e4] bg-white text-[#454652] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
              {item.label}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
