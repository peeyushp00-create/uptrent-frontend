import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Instagram, Youtube, Sparkles, TrendingUp, Zap, ArrowRight } from "lucide-react";

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

const GOLD = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const GOLD_SOLID = "#3B82F6";

const STEPS = [
  { word: "Discover.", color: "#EDE0C8", subtitle: "Find what's trending in your niche right now" },
  { word: "Create.", color: "#3B82F6", subtitle: "Generate scripts, hooks and SEO in seconds" },
  { word: "Go Viral.", color: "#1D4ED8", subtitle: "Reach millions with AI-powered content strategy" },
];

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(i => (i + 1) % STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    if (platform === "instagram") navigate("/trending", { state: { query: search } });
    else navigate("/youtube/seo", { state: { query: search } });
  };

  const handleChip = (chip: string) => {
    if (platform === "instagram") navigate("/trending", { state: { query: chip } });
    else navigate("/youtube/seo", { state: { query: chip } });
  };

  const chips = platform === "instagram" ? instagramChips : youtubeChips;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        .cormorant { font-family: 'Cormorant Garamond', serif !important; }
        .gold-text {
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .chip-item:hover {
          border-color: #3B82F650 !important;
          color: #3B82F6 !important;
        }
        .search-input:focus {
          border-color: #3B82F650 !important;
          box-shadow: 0 0 0 3px #3B82F608 !important;
        }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen relative overflow-hidden">

        {/* Background ambient */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ opacity: [0.03, 0.07, 0.03] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(ellipse, #3B82F6, transparent 65%)", filter: "blur(60px)" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-8 w-full max-w-2xl relative z-10"
        >

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium uppercase tracking-widest"
            style={{ background: "#3B82F610", border: "1px solid #3B82F625", color: GOLD_SOLID, letterSpacing: "0.14em" }}
          >
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: GOLD_SOLID }}
            />
            <Sparkles className="w-3 h-3" />
            AI Content Platform · India
          </motion.div>

          {/* Main headline */}
          <div className="flex flex-col items-center gap-1 text-center">
            {/* Static tagline above */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.16em" }}
              transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: "#3A3A3A", letterSpacing: "0.18em", fontFamily: "Inter, sans-serif" }}
            >
              The Creator&apos;s AI Toolkit
            </motion.p>

            {/* Animated 3-step headline */}
            <div className="cormorant text-6xl md:text-7xl font-bold leading-tight" style={{ minHeight: "1.25em" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={stepIndex}
                  initial={{ opacity: 0, y: 20, letterSpacing: "0.3em", filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.01em", filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, letterSpacing: "0.15em", filter: "blur(4px)" }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  style={{ color: STEPS[stepIndex].color, display: "inline-block" }}
                  className={stepIndex === 1 ? "gold-text" : ""}
                >
                  {STEPS[stepIndex].word}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Step subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${stepIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-sm mt-1"
                style={{ color: "#5A5A5A", fontFamily: "Inter, sans-serif" }}
              >
                {STEPS[stepIndex].subtitle}
              </motion.p>
            </AnimatePresence>

            {/* Step dots */}
            <div className="flex items-center gap-2 mt-4">
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === stepIndex ? 20 : 6, background: i === stepIndex ? GOLD_SOLID : "#2E2E2E" }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 rounded-full cursor-pointer"
                  onClick={() => setStepIndex(i)}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center gap-6"
          >
            {[
              { icon: TrendingUp, label: "154 Topics" },
              { icon: Zap, label: "Scripts in 10s" },
              { icon: Sparkles, label: "20+ Niches" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs uppercase tracking-wider" style={{ color: "#3A3A3A", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>
                <s.icon className="w-3 h-3" style={{ color: GOLD_SOLID }} />
                {s.label}
              </div>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.55, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-px"
            style={{ background: "linear-gradient(90deg, transparent, #3B82F625, transparent)", transformOrigin: "center" }}
          />

          {/* Platform toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: "#1C1C1C", border: "1px solid #2E2E2E" }}
          >
            {(["instagram", "youtube"] as const).map((p) => (
              <button
                key={p}
                onClick={() => switchPlatform(p)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={platform === p
                  ? { background: GOLD, color: "#111", fontWeight: 600, fontFamily: "Inter, sans-serif" }
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
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex gap-3 w-full"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4A4A4A" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={platform === "instagram" ? "Search Instagram content ideas..." : "Search YouTube video ideas..."}
                className="search-input w-full pl-11 pr-5 py-4 rounded-2xl text-sm outline-none transition-all"
                style={{ background: "#1C1C1C", border: "1px solid #2E2E2E", color: "#EDE0C8", fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm"
              style={{ background: GOLD, color: "#111", fontFamily: "Inter, sans-serif" }}
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.6 }}
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
                    className="chip-item px-4 py-2 rounded-full text-xs transition-all"
                    style={{ background: "#1C1C1C", border: "1px solid #2A2A2A", color: "#5A5A5A", fontFamily: "Inter, sans-serif", letterSpacing: "0.04em" }}
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
