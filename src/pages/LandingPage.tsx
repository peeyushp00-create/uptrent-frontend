import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

/* ─── THEME ─── */
const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const WORDS = ["Discover.", "Create.", "Go Viral."];

/* ─── TYPES ─── */
interface ReelData {
  user: string;
  initials: string;
  avatarColor: string;
  caption: string;
  audio: string;
  likes: string;
  comments: string;
  gradient: string[];
  bars: number[];
  tag: string;
  tagColor: string;
}

/* ─── REEL DATA ─── */
const REELS: ReelData[] = [
  {
    user: "priya.creates",
    initials: "PC",
    avatarColor: "#FF6B9D",
    caption: "Morning vlog vibes ☀️",
    audio: "Original audio · priya",
    likes: "84K",
    comments: "1.2K",
    gradient: ["#1a0533", "#4B0082", "#7B2D8B", "#FF6B9D", "#FFB347", "#FF6B35"],
    bars: [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.7, 0.5, 1.0, 0.6, 0.4],
    tag: "VLOG",
    tagColor: "#FF6B9D",
  },
  {
    user: "techtalkindia",
    initials: "TT",
    avatarColor: "#00BFFF",
    caption: "AI tools that blew my mind 🤯",
    audio: "Trending · Lo-fi Beats",
    likes: "210K",
    comments: "3.4K",
    gradient: ["#001a33", "#0066CC", "#00BFFF", "#7FFFD4", "#00FF7F", "#228B22"],
    bars: [0.6, 0.9, 0.4, 0.8, 1.0, 0.5, 0.7, 0.9, 0.3, 0.6, 0.8, 0.5],
    tag: "TECH",
    tagColor: "#00BFFF",
  },
  {
    user: "dancewithmeg",
    initials: "DM",
    avatarColor: "#FFD700",
    caption: "New hook tutorial 🔥 save this!",
    audio: "APT · Rose ft. Bruno Mars",
    likes: "520K",
    comments: "8.9K",
    gradient: ["#2d1b00", "#8B4513", "#D2691E", "#F4A460", "#FFD700", "#FFA500"],
    bars: [1.0, 0.6, 0.8, 0.4, 0.9, 0.7, 1.0, 0.5, 0.8, 0.6, 0.9, 0.7],
    tag: "DANCE",
    tagColor: "#FFD700",
  },
  {
    user: "foodiedelhi",
    initials: "FD",
    avatarColor: "#FF4500",
    caption: "Street food in 60 sec 🍜",
    audio: "Kya Karein · AP Dhillon",
    likes: "145K",
    comments: "2.1K",
    gradient: ["#0d1f0d", "#006400", "#228B22", "#90EE90", "#00FA9A", "#48D1CC"],
    bars: [0.5, 0.8, 0.6, 1.0, 0.4, 0.7, 0.9, 0.5, 0.8, 0.3, 0.7, 0.9],
    tag: "FOOD",
    tagColor: "#FF4500",
  },
  {
    user: "comedykings",
    initials: "CK",
    avatarColor: "#DA70D6",
    caption: "POV: mom finds ur reels 😂",
    audio: "Pasoori · Ali Sethi",
    likes: "1.1M",
    comments: "22K",
    gradient: ["#1a001a", "#800080", "#DA70D6", "#FFB6C1", "#FF69B4", "#DC143C"],
    bars: [0.7, 1.0, 0.5, 0.8, 0.6, 0.9, 0.4, 1.0, 0.7, 0.5, 0.8, 0.6],
    tag: "COMEDY",
    tagColor: "#DA70D6",
  },
  {
    user: "sketchbyrohan",
    initials: "SR",
    avatarColor: "#4169E1",
    caption: "Timelapse art drop 🎨",
    audio: "Calm Instrumentals",
    likes: "67K",
    comments: "890",
    gradient: ["#0a0a1a", "#191970", "#4169E1", "#87CEEB", "#E0F7FA", "#B0E0E6"],
    bars: [0.3, 0.6, 0.8, 0.5, 0.7, 1.0, 0.4, 0.8, 0.6, 0.9, 0.5, 0.7],
    tag: "ART",
    tagColor: "#4169E1",
  },
];

/* ─── PHONE COMPONENT ─── */
interface ReelPhoneProps {
  reel: ReelData;
  index: number;
}

function ReelPhone({ reel, index }: ReelPhoneProps) {
  const angle = (index / 6) * 360;
  const animDelay = index * 0.4;
  const gradientStr = `linear-gradient(180deg, ${reel.gradient
    .map((color, i) => `${color} ${Math.round((i / (reel.gradient.length - 1)) * 100)}%`)
    .join(", ")})`;

  return (
    <div className="reel-phone" style={{ transform: `rotateY(${angle}deg) translateZ(280px)` }}>
      <div
        className="reel-scroll-bg"
        style={{ background: gradientStr, animationDuration: `${4 + index * 0.7}s`, animationDelay: `${-animDelay}s` }}
      />
      <div className="phone-notch" />
      <div className="reel-top-bar">
        <div className="reel-avatar" style={{ background: reel.avatarColor }}>{reel.initials}</div>
        <span className="reel-username">@{reel.user}</span>
        <span className="reel-follow">Follow</span>
      </div>
      <div className="reel-center">
        <div className="reel-tag" style={{ color: reel.tagColor, borderColor: reel.tagColor }}>{reel.tag}</div>
        <div className="reel-wave">
          {reel.bars.map((h, i) => (
            <div key={i} className="wave-bar" style={{ height: `${h * 28}px`, background: reel.tagColor, animationDelay: `${i * 0.08}s`, opacity: 0.85 }} />
          ))}
        </div>
      </div>
      <div className="reel-bottom">
        <div className="reel-music-row">
          <div className="reel-disc" style={{ borderColor: reel.tagColor, animationDuration: `${3 + index * 0.2}s` }}>
            <div className="reel-disc-inner" style={{ background: reel.avatarColor }} />
          </div>
          <span className="reel-audio">{reel.audio}</span>
        </div>
        <div className="reel-caption-text">{reel.caption}</div>
      </div>
      <div className="reel-actions">
        <div className="reel-action"><div className="action-icon heart-icon">♥</div><span className="action-count">{reel.likes}</span></div>
        <div className="reel-action"><div className="action-icon">💬</div><span className="action-count">{reel.comments}</span></div>
        <div className="reel-action"><div className="action-icon">↗</div><span className="action-count">Share</span></div>
        <div className="reel-share-disc" style={{ background: reel.avatarColor, animationDuration: `${2.5 + index * 0.3}s` }}>♪</div>
      </div>
      <div className="reel-progress">
        <div className="reel-progress-fill" style={{ background: reel.tagColor, animationDuration: `${5 + index * 0.5}s` }} />
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [wordIdx, setWordIdx] = useState<number>(0);
  const [wordVisible, setWordVisible] = useState<boolean>(true);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx((w) => (w + 1) % WORDS.length);
        setWordVisible(true);
      }, 350);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#0A0A0A", color: "#F0EAD6", minHeight: "100vh", margin: 0, padding: 0, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        .carousel-scene {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          perspective: 1100px;
          pointer-events: none;
          z-index: 0;
        }
        .carousel-ring {
          width: 200px; height: 380px;
          transform-style: preserve-3d;
          animation: carouselSpin 28s linear infinite;
          position: relative;
        }
        @keyframes carouselSpin {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
        .reel-phone {
          position: absolute;
          width: 130px; height: 230px;
          left: 50%; top: 50%;
          margin-left: -65px; margin-top: -115px;
          border-radius: 20px; overflow: hidden;
          background: #111;
          border: 1.5px solid rgba(255,255,255,0.14);
          box-shadow: 0 0 0 3px rgba(0,0,0,0.6), 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .reel-scroll-bg {
          position: absolute; inset: 0;
          width: 100%; height: 300%; top: -100%;
          animation: reelScroll linear infinite;
        }
        @keyframes reelScroll {
          0%   { transform: translateY(0%); }
          100% { transform: translateY(33.33%); }
        }
        .phone-notch {
          position: absolute; top: 7px; left: 50%; transform: translateX(-50%);
          width: 32px; height: 5px; background: #000; border-radius: 3px; z-index: 10;
        }
        .reel-top-bar {
          position: absolute; top: 18px; left: 8px; right: 8px;
          display: flex; align-items: center; gap: 5px; z-index: 5;
        }
        .reel-avatar {
          width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 6px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .reel-username {
          font-size: 7px; font-weight: 600; color: #fff; flex: 1;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }
        .reel-follow {
          font-size: 6.5px; font-weight: 700; color: #fff;
          border: 1px solid rgba(255,255,255,0.8); border-radius: 4px;
          padding: 1.5px 5px; flex-shrink: 0;
        }
        .reel-center {
          position: absolute; top: 50%; left: 8px; right: 36px;
          transform: translateY(-50%);
          display: flex; flex-direction: column; align-items: flex-start; gap: 8px; z-index: 5;
        }
        .reel-tag {
          font-size: 7px; font-weight: 800; letter-spacing: 0.1em;
          border: 1px solid; border-radius: 4px; padding: 2px 5px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.6);
        }
        .reel-wave { display: flex; align-items: flex-end; gap: 2px; height: 30px; }
        .wave-bar {
          width: 4px; border-radius: 2px;
          animation: wavePulse 0.8s ease-in-out infinite alternate;
          transform-origin: bottom;
        }
        @keyframes wavePulse {
          0%   { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
        .reel-bottom {
          position: absolute; bottom: 14px; left: 8px; right: 36px;
          display: flex; flex-direction: column; gap: 4px; z-index: 5;
        }
        .reel-music-row { display: flex; align-items: center; gap: 4px; }
        .reel-disc {
          width: 14px; height: 14px; border-radius: 50%; border: 1px solid;
          display: flex; align-items: center; justify-content: center;
          animation: discSpin linear infinite; flex-shrink: 0;
        }
        @keyframes discSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .reel-disc-inner { width: 5px; height: 5px; border-radius: 50%; opacity: 0.9; }
        .reel-audio {
          font-size: 6.5px; color: rgba(255,255,255,0.85);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 70px; text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }
        .reel-caption-text {
          font-size: 7px; font-weight: 500; color: #fff;
          line-height: 1.3; text-shadow: 0 1px 4px rgba(0,0,0,0.9);
        }
        .reel-actions {
          position: absolute; right: 6px; bottom: 30px;
          display: flex; flex-direction: column; align-items: center; gap: 9px; z-index: 5;
        }
        .reel-action { display: flex; flex-direction: column; align-items: center; gap: 1px; }
        .action-icon { font-size: 13px; line-height: 1; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.7)); }
        .heart-icon { animation: heartBeat 2s ease-in-out infinite; }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.25); }
        }
        .action-count { font-size: 5.5px; font-weight: 700; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
        .reel-share-disc {
          width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: #fff;
          animation: discSpin linear infinite;
          box-shadow: 0 0 6px rgba(0,0,0,0.5);
        }
        .reel-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.2); z-index: 5; }
        .reel-progress-fill { height: 100%; animation: progressPlay linear infinite; border-radius: 1px; }
        @keyframes progressPlay {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
        .hero-word {
          font-size: clamp(52px, 8vw, 96px);
          font-weight: 800;
          letter-spacing: -3px;
          line-height: 1;
          background: linear-gradient(135deg, #FFFFFF 0%, #E8B84B 50%, #C17D20 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: opacity 0.3s ease, transform 0.35s ease;
        }
        .hero-word.hidden { opacity: 0; transform: translateY(-14px); }
        .hero-word.visible { opacity: 1; transform: translateY(0px); }
        .cta-btn {
          background: ${GOLD};
          color: #000;
          padding: 15px 36px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 15px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: -apple-system, sans-serif;
          box-shadow: 0 6px 32px rgba(232,184,75,0.4);
          letter-spacing: 0.02em;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-btn:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 10px 40px rgba(232,184,75,0.55);
        }
        .pill {
          font-size: 12px;
          color: rgba(240,234,214,0.55);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 5px 12px;
        }
        @media (max-width: 768px) {
          .carousel-ring { transform: scale(0.6) !important; }
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section
        ref={heroRef}
        style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
      >

        {/* BACKGROUND: 3D carousel */}
        <div className="carousel-scene">
          <div className="carousel-ring">
            {REELS.map((reel, i) => (
              <ReelPhone key={i} reel={reel} index={i} />
            ))}
          </div>
        </div>

        {/* OVERLAY: dark vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.92) 100%)",
          backdropFilter: "blur(1.5px)",
          zIndex: 1,
        }} />

        {/* FOREGROUND: hero content — z-index 10 ensures it's always on top */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            maxWidth: "560px",
            padding: "0 24px",
            textAlign: "center",
          }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#E8B84B", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}
            >
              <Sparkles size={14} />
              Built for creators
            </motion.div>

            {/* Cycling word */}
            <div style={{ minHeight: "90px", display: "flex", alignItems: "center" }}>
              <div className={`hero-word ${wordVisible ? "visible" : "hidden"}`}>
                {WORDS[wordIdx]}
              </div>
            </div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: "#5A5A5A", maxWidth: "440px", fontSize: "16px", lineHeight: "1.6", margin: 0 }}
            >
              Trending topics, AI scripts, SEO tools and news —{" "}
              everything an Indian creator needs.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button className="cta-btn" onClick={() => navigate("/signup")}>
                Start Free <ArrowRight size={16} />
              </button>
            </motion.div>

            {/* Social proof pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}
            >
              {["10K+ Creators", "Free to start", "Made in India 🇮🇳"].map((label) => (
                <span key={label} className="pill">{label}</span>
              ))}
            </motion.div>

          </div>
        </motion.div>

      </section>
    </div>
  );
}