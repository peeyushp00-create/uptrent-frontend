import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Instagram, Youtube, Sparkles, TrendingUp, Zap } from "lucide-react";

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

const INSTAGRAM_WORDS = ["Reels", "Stories", "Carousels", "Hooks", "Hashtags"];
const YOUTUBE_WORDS = ["Videos", "Shorts", "Scripts", "Titles", "Thumbnails"];

const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const GOLD_SOLID = "#E8B84B";

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );
  const [wordIndex, setWordIndex] = useState(0);

  const words = platform === "instagram" ? INSTAGRAM_WORDS : YOUTUBE_WORDS;

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [platform]);

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    setWordIndex(0);
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    if (platform === "instagram") navigate("/trending", { state: { query: search } });
    else navigate("/youtube/seo", { state: { query: search } });
  };

  const handleChip = (chip: string) => {
    setSearch(chip);
    if (platform === "instagram") navigate("/trending", { state: { query: chip } });
    else navigate("/youtube/seo", { state: { query: chip } });
  };

  const chips = platform === "instagram" ? instagramChips : youtubeChips;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen relative overflow-hidden">

      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, #E8B84B, transparent)", filter: "blur(60px)" }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, #C17D20, transparent)", filter: "blur(80px)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-8 w-full max-w-2xl relative z-10"
      >

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
          style={{ background: "#E8B84B15", border: "1px solid #E8B84B30", color: GOLD_SOLID }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full"
            style={{ background: GOLD_SOLID }}
          />
          <Sparkles className="w-3 h-3" />
          AI-powered content discovery for Indian creators
        </motion.div>

        {/* Headline */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-6xl font-heading font-bold leading-tight"
            style={{ color: "#EDE0C8" }}
          >
            Create Viral{" "}
            <span style={{ background: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {words[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-base max-w-md"
            style={{ color: "#6B6B6B" }}
          >
            Discover trending topics, generate scripts, and dominate{" "}
            {platform === "instagram" ? "Instagram" : "YouTube"} with AI-powered insights
          </motion.p>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center gap-6"
        >
          {[
            { icon: TrendingUp, label: "154 Trending Topics" },
            { icon: Zap, label: "AI Scripts in 10s" },
            { icon: Sparkles, label: "20+ Niches" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: "#5A5A5A" }}>
              <stat.icon className="w-3.5 h-3.5" style={{ color: GOLD_SOLID }} />
              {stat.label}
            </div>
          ))}
        </motion.div>

        {/* Platform toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="flex items-center gap-1 p-1 rounded-2xl"
          style={{ background: "#1C1C1C", border: "1px solid #2E2E2E" }}
        >
          {(["instagram", "youtube"] as const).map((p) => (
            <button
              key={p}
              onClick={() => switchPlatform(p)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={platform === p
                ? { background: GOLD, color: "#111", fontWeight: 600 }
                : { color: "#6B6B6B" }}
            >
              {p === "instagram" ? <Instagram className="w-4 h-4" /> : <Youtube className="w-4 h-4" />}
              {p === "instagram" ? "Instagram" : "YouTube"}
            </button>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex gap-3 w-full"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6B6B6B" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={platform === "instagram"
                ? "Search Instagram content ideas..."
                : "Search YouTube video ideas..."}
              className="w-full pl-11 pr-5 py-4 rounded-2xl text-sm outline-none transition-all"
              style={{
                background: "#1C1C1C",
                border: "1px solid #2E2E2E",
                color: "#EDE0C8",
              }}
              onFocus={e => { e.target.style.borderColor = "#E8B84B60"; e.target.style.boxShadow = "0 0 0 3px #E8B84B10"; }}
              onBlur={e => { e.target.style.borderColor = "#2E2E2E"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            className="px-8 py-4 rounded-2xl font-semibold text-sm"
            style={{ background: GOLD, color: "#111" }}
          >
            Search
          </motion.button>
        </motion.div>

        {/* Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col items-center gap-3 w-full"
        >
          <p className="text-xs" style={{ color: "#4A4A4A" }}>Trending right now</p>
          <div className="flex flex-wrap justify-center gap-2">
            <AnimatePresence mode="wait">
              {chips.map((chip, i) => (
                <motion.button
                  key={`${platform}-${chip}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  onClick={() => handleChip(chip)}
                  className="px-4 py-2 rounded-full text-sm transition-all"
                  style={{ background: "#1C1C1C", border: "1px solid #2E2E2E", color: "#6B6B6B" }}
                  whileHover={{ borderColor: "#E8B84B50", color: "#E8B84B", scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {chip}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}