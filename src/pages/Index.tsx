import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Instagram, Youtube, Play, Heart, Eye, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PRIMARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #6D28D9)";
const YT_GRAD = "linear-gradient(135deg, #ff0000, #cc0000)";
const PRIMARY_CONTAINER = "#ede9fe";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const IG_CHIPS = ["Fitness", "Finance", "Cricket", "Bollywood", "Tech", "Food", "Travel", "Gaming", "Motivation", "Skincare", "Yoga", "Crypto"];
const YT_CHIPS = ["YouTube SEO", "Shorts Strategy", "Tech Reviews", "Gaming", "Finance", "Vlogs", "Education", "Cooking", "Motivation", "Comedy", "Music"];
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
  const searchTimeout = useRef<any>(null);

  const [platform, setPlatform] = useState<"Instagram" | "YouTube">(() => {
    const saved = localStorage.getItem("platform");
    return saved === "youtube" ? "YouTube" : "Instagram";
  });
  const [search, setSearch] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [videos, setVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const chips = platform === "Instagram" ? IG_CHIPS : YT_CHIPS;

  // Sync with sidebar
  useEffect(() => {
    const handleCustom = (e: any) => {
      setPlatform(e.detail === "youtube" ? "YouTube" : "Instagram");
      setVideos([]);
    };
    window.addEventListener("platformChanged", handleCustom);
    return () => window.removeEventListener("platformChanged", handleCustom);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 1800);
    return () => clearInterval(interval);
  }, []);

  // Fetch videos on search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!search.trim()) { setVideos([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setVideosLoading(true);
      try {
        const endpoint = platform === "YouTube" ? "youtube" : "instagram";
        const res = await fetch(`${BASE}/api/search/${endpoint}?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setVideos(data.items || []);
      } catch (e) { console.error(e); }
      finally { setVideosLoading(false); }
    }, 600);
  }, [search, platform]);

  const handleSearch = () => {
    if (!search.trim()) return;
    if (platform === "Instagram") navigate("/insight", { state: { query: search } });
    else navigate("/youtube/seo", { state: { query: search } });
  };

  const handleChip = (chip: string) => {
    setSearch(chip);
  };

  const isIG = platform === "Instagram";
  const activeGrad = isIG ? PRIMARY_GRAD : YT_GRAD;
  const activeShadow = isIG ? '0 4px 20px #7C3AED40' : '0 4px 20px #ff000040';
  const activeColor = isIG ? PRIMARY : '#ff0000';

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900 relative overflow-hidden flex flex-col items-center px-5 py-12">

      {/* Floating background blobs */}
      <motion.div animate={{ scale:[1,1.15,1], opacity:[0.06,0.12,0.06] }} transition={{ duration:10, repeat:Infinity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none rounded-full"
        style={{ background:`radial-gradient(ellipse, ${activeColor}40, transparent 65%)`, filter:"blur(80px)" }} />

      {/* Floating hashtag tags */}
      {FLOATING_TAGS.map((tag, i) => (
        <motion.div key={i}
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:[0,0.6,0.6,0], y:[20,0,0,-20] }}
          transition={{ duration:4, delay:tag.delay, repeat:Infinity, repeatDelay:3 }}
          className="absolute hidden md:block text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none"
          style={{ left:tag.x, top:tag.y, background:PRIMARY_CONTAINER, color:PRIMARY }}>
          {tag.text}
        </motion.div>
      ))}

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center gap-8">

        {/* Headline */}
        <div className="text-center space-y-3">
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background:PRIMARY_CONTAINER, color:PRIMARY }}>
            <motion.span animate={{ opacity:[1,0.2,1] }} transition={{ duration:1.5, repeat:Infinity }}
              className="w-1.5 h-1.5 rounded-full inline-block" style={{ background:PRIMARY }} />
            AI-powered content discovery
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="text-5xl md:text-6xl font-bold leading-tight">
            <AnimatePresence mode="wait">
              <motion.span key={wordIndex}
                initial={{ opacity:0, y:30, filter:'blur(8px)' }}
                animate={{ opacity:1, y:0, filter:'blur(0px)' }}
                exit={{ opacity:0, y:-30, filter:'blur(8px)' }}
                transition={{ duration:0.5 }}
                className="block"
                style={{ background:activeGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
            <span className="block text-[#191c1d] dark:text-white text-3xl md:text-4xl mt-1">
              Content that gets discovered
            </span>
          </motion.h1>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
            className="text-[#757684] text-base max-w-md mx-auto">
            Find viral ideas for Instagram Reels & YouTube Shorts — built for Indian creators
          </motion.p>
        </div>

        {/* Connect Channel Button */}
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.5 }}
          className="flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.button key={platform}
              initial={{ opacity:0, scale:0.9, y:8 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.9, y:-8 }}
              transition={{ duration:0.3 }}
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{ background:activeGrad, boxShadow:activeShadow }}>
              {isIG ? <Instagram className="w-4 h-4" /> : <Youtube className="w-4 h-4" />}
              Connect {platform}
            </motion.button>
          </AnimatePresence>
          <p className="text-xs text-[#757684]">Connect your channel to get personalized content ideas</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }} className="w-full">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757684]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder={isIG ? "Search reels ideas (e.g. Fitness, Finance)..." : "Search YouTube topics (e.g. Tech review, Shorts)..."}
                className="w-full pl-11 pr-10 py-4 rounded-2xl text-sm text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none transition-all"
                style={{ background:'white', border:`2px solid ${search ? activeColor : '#e1e3e4'}`, boxShadow:search ? `0 0 0 4px ${activeColor}15` : 'none' }} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <motion.button onClick={handleSearch} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              className="px-6 py-4 rounded-2xl text-white font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all"
              style={{ background:activeGrad }}>
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Video Results */}
        <AnimatePresence>
          {(videosLoading || videos.length > 0) && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="w-full">
              <div className="flex items-center gap-2 mb-3">
                {isIG ? <Instagram className="w-4 h-4" style={{ color:activeColor }} /> : <Youtube className="w-4 h-4" style={{ color:activeColor }} />}
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color:activeColor }}>
                  {isIG ? 'Instagram Reels' : 'YouTube Shorts'} for "{search}"
                </p>
              </div>

              {videosLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="bg-white rounded-2xl animate-pulse" style={{ aspectRatio:'9/16' }} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {videos.slice(0, 9).map((video, i) => (
                    <motion.a key={video.id}
                      initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                      transition={{ delay:i * 0.05 }}
                      href={video.youtubeUrl || video.instagramUrl || '#'}
                      target="_blank" rel="noopener noreferrer"
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ aspectRatio:'9/16', background:'#1a1a2e' }}>
                      {/* Thumbnail */}
                      <img src={video.thumbnail} alt={video.caption}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      {/* Platform badge */}
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-white text-[8px] font-bold"
                        style={{ background: isIG ? 'linear-gradient(45deg,#f09433,#bc1888)' : '#FF0000' }}>
                        {isIG ? 'Reels' : 'Shorts'}
                      </div>

                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:'rgba(255,255,255,0.2)', backdropFilter:'blur(4px)' }}>
                          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-[9px] font-semibold line-clamp-2 leading-tight mb-1">{video.caption}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5 text-white/70" />
                            <span className="text-[8px] text-white/70 font-medium">{video.views}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5 text-white/70" />
                            <span className="text-[8px] text-white/70 font-medium">{video.likes}</span>
                          </div>
                        </div>
                      </div>

                      {/* External link on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}

              {/* View more button */}
              {videos.length > 0 && (
                <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
                  onClick={handleSearch}
                  className="w-full mt-3 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all"
                  style={{ borderColor:activeColor, color:activeColor }}>
                  View Full Analysis →
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chips — only show when no search */}
        {!search && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }} className="w-full">
            <p className="text-xs font-semibold text-[#757684] uppercase tracking-wider mb-3">
              {isIG ? "🔥 Trending Niches" : "📺 Popular Topics"}
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="wait">
                {chips.map((chip, i) => (
                  <motion.button key={`${platform}-${chip}`}
                    initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                    exit={{ opacity:0, scale:0.8 }} transition={{ delay:i * 0.03 }}
                    onClick={() => handleChip(chip)} whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
                    className="px-4 py-2 rounded-full text-xs font-bold transition-all border hover:shadow-sm"
                    style={{ background:'white', borderColor:'#e1e3e4', color:'#454652' }}>
                    {chip}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Quick nav */}
        {!search && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
            className="flex gap-3 flex-wrap justify-center">
            {[
              { label:"📰 News Feed", path:"/news" },
              { label:"✍️ Scripts", path:"/scripts" },
              { label:"📈 Trending", path:"/trending" },
            ].map((item, i) => (
              <button key={i} onClick={() => navigate(item.path)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#e1e3e4] bg-white text-[#454652] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}