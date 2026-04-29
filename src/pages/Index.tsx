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
  const [mounted, setMounted] = useState(false);

  const words = platform === "instagram" ? INSTAGRAM_WORDS : YOUTUBE_WORDS;

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % words.length);
    }, 2500);
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
    <>
      {/* ✅ Inject Cormorant Garamond font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        .cormorant { font-family: 'Cormorant Garamond', serif !important; }
        .gold-text {
          background: linear-gradient(135deg, #E8B84B, #C17D20);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes fadeLetterSpacing {
          0% { opacity: 0; letter-spacing: 0.4em; filter: blur(6px); }
          100% { opacity: 1; letter-spacing: 0.02em; filter: blur(0); }
        }
        .elegant-reveal {
          animation: fadeLetterSpacing 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chip-hover:hover {
          border-color: #E8B84B50 !important;
          color: #E8B84B !important;
        }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen relative overflow-hidden">

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ opacity: [0.04, 0.08, 0.04], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(ellipse, #E8B84B, transparent 70%)", filter: "blur(40px)" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-8 w-full max-w-2xl relative z-10"
        >

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{ background: "#E8B84B10", border: "1px solid #E8B84B25", color: "#E8B84B", letterSpacing: "0.12em" }}
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: GOLD_SOLID }}
            />
            AI-Powered · Indian Creators
          </motion.div>

          {/* Headline — Cormorant Garamond elegant style */}
          <div className="flex flex-col items-center gap-2 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="cormorant text-5xl md:text-7xl font-bold leading-tight tracking-tight"
              style={{ color: "#EDE0C8", letterSpacing: "0.02em" }}
            >
              Discover Viral
            </motion.div>

            {/* Animated cycling word */}
            <div className="cormorant text-5xl md:text-7xl font-bold italic leading-tight" style={{ minHeight: "1.2em" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${platform}-${wordIndex}`}
                  initial={{ opacity: 0, letterSpacing: "0.4em", filter: "blur(8px)" }}
                  animate={{ opacity: 1, letterSpacing: "0.02em", filter: "blur(0px)" }}
                  exit={{ opacity: 0, letterSpacing: "0.2em", filter: "blur(4px)" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="gold-text inline-block"
                >
                  {words[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-sm tracking-widest uppercase mt-2"
              style={{ color: "#4A4A4A", letterSpacing: "0.18em", fontFamily: "Inter, sans-serif" }}
            >
              For {platform === "instagram" ? "Instagram" : "YouTube"} Creators in India
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex items-center gap-8"
          >
            {[
              { icon: TrendingUp, label: "154 Trending" },
              { icon: Zap, label: "Scripts in 10s" },
              { icon: Sparkles, label: "20+ Niches" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs tracking-wider uppercase" style={{ color: "#3A3A3A", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>
                <stat.icon className="w-3 h-3" style={{ color: GOLD_SOLID }} />
                {stat.label}
              </div>
            ))}
          </motion.div>

          {/* Divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-px"
            style={{ background: "linear-gradient(90deg, transparent, #E8B84B30, transparent)", transformOrigin: "center" }}
          />

          {/* Platform toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
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
                  : { color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}
              >
                {p === "instagram" ? <Instagram className="w-4 h-4" /> : <Youtube className="w-4 h-4" />}
                {p === "instagram" ? "Instagram" : "YouTube"}
              </button>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex gap-3 w-full"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4A4A4A" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={platform === "instagram" ? "Search content ideas..." : "Search video ideas..."}
                className="w-full pl-11 pr-5 py-4 rounded-2xl text-sm outline-none transition-all"
                style={{ background: "#1C1C1C", border: "1px solid #2E2E2E", color: "#EDE0C8", fontFamily: "Inter, sans-serif" }}
                onFocus={e => { e.target.style.borderColor = "#E8B84B50"; e.target.style.boxShadow = "0 0 0 3px #E8B84B08"; }}
                onBlur={e => { e.target.style.borderColor = "#2E2E2E"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              className="px-8 py-4 rounded-2xl font-semibold text-sm"
              style={{ background: GOLD, color: "#111", fontFamily: "Inter, sans-serif" }}
            >
              Search
            </motion.button>
          </motion.div>

          {/* Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <p className="text-xs uppercase tracking-widest" style={{ color: "#3A3A3A", letterSpacing: "0.16em", fontFamily: "Inter, sans-serif" }}>
              Trending Now
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <AnimatePresence mode="wait">
                {chips.map((chip, i) => (
                  <motion.button
                    key={`${platform}-${chip}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3 }}
                    onClick={() => handleChip(chip)}
                    className="chip-hover px-4 py-2 rounded-full text-xs transition-all"
                    style={{
                      background: "#1C1C1C",
                      border: "1px solid #2A2A2A",
                      color: "#5A5A5A",
                      fontFamily: "Inter, sans-serif",
                      letterSpacing: "0.04em"
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {chip}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </>
  );
}