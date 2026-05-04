import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles, ArrowRight, TrendingUp, FileText, Search,
  Newspaper, Zap, Users, Star, Check, Menu, X
} from "lucide-react";

/* ─── THEME ─── */
const BRAND = "linear-gradient(135deg, #FF6B35, #FF3CAC)";
const BRAND_SOLID = "#FF6B35";
const BRAND_PINK = "#FF3CAC";
const BG = "#0A0A0A";
const TEXT = "#F5F5F5";
const MUTED = "#888";
const BORDER = "rgba(255,255,255,0.08)";
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
    user: "priya.creates", initials: "PC", avatarColor: "#FF6B9D",
    caption: "Morning vlog vibes ☀️", audio: "Original audio · priya",
    likes: "84K", comments: "1.2K",
    gradient: ["#1a0533", "#4B0082", "#7B2D8B", "#FF6B9D", "#FFB347", "#FF6B35"],
    bars: [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.7, 0.5, 1.0, 0.6, 0.4],
    tag: "VLOG", tagColor: "#FF6B9D",
  },
  {
    user: "techtalkindia", initials: "TT", avatarColor: "#00BFFF",
    caption: "AI tools that blew my mind 🤯", audio: "Trending · Lo-fi Beats",
    likes: "210K", comments: "3.4K",
    gradient: ["#001a33", "#0066CC", "#00BFFF", "#7FFFD4", "#00FF7F", "#228B22"],
    bars: [0.6, 0.9, 0.4, 0.8, 1.0, 0.5, 0.7, 0.9, 0.3, 0.6, 0.8, 0.5],
    tag: "TECH", tagColor: "#00BFFF",
  },
  {
    user: "dancewithmeg", initials: "DM", avatarColor: "#FFD700",
    caption: "New hook tutorial 🔥 save this!", audio: "APT · Rose ft. Bruno Mars",
    likes: "520K", comments: "8.9K",
    gradient: ["#2d1b00", "#8B4513", "#D2691E", "#F4A460", "#FFD700", "#FFA500"],
    bars: [1.0, 0.6, 0.8, 0.4, 0.9, 0.7, 1.0, 0.5, 0.8, 0.6, 0.9, 0.7],
    tag: "DANCE", tagColor: "#FFD700",
  },
  {
    user: "foodiedelhi", initials: "FD", avatarColor: "#FF4500",
    caption: "Street food in 60 sec 🍜", audio: "Kya Karein · AP Dhillon",
    likes: "145K", comments: "2.1K",
    gradient: ["#0d1f0d", "#006400", "#228B22", "#90EE90", "#00FA9A", "#48D1CC"],
    bars: [0.5, 0.8, 0.6, 1.0, 0.4, 0.7, 0.9, 0.5, 0.8, 0.3, 0.7, 0.9],
    tag: "FOOD", tagColor: "#FF4500",
  },
  {
    user: "comedykings", initials: "CK", avatarColor: "#DA70D6",
    caption: "POV: mom finds ur reels 😂", audio: "Pasoori · Ali Sethi",
    likes: "1.1M", comments: "22K",
    gradient: ["#1a001a", "#800080", "#DA70D6", "#FFB6C1", "#FF69B4", "#DC143C"],
    bars: [0.7, 1.0, 0.5, 0.8, 0.6, 0.9, 0.4, 1.0, 0.7, 0.5, 0.8, 0.6],
    tag: "COMEDY", tagColor: "#DA70D6",
  },
  {
    user: "sketchbyrohan", initials: "SR", avatarColor: "#4169E1",
    caption: "Timelapse art drop 🎨", audio: "Calm Instrumentals",
    likes: "67K", comments: "890",
    gradient: ["#0a0a1a", "#191970", "#4169E1", "#87CEEB", "#E0F7FA", "#B0E0E6"],
    bars: [0.3, 0.6, 0.8, 0.5, 0.7, 1.0, 0.4, 0.8, 0.6, 0.9, 0.5, 0.7],
    tag: "ART", tagColor: "#4169E1",
  },
];

/* ─── REEL PHONE ─── */
interface ReelPhoneProps { reel: ReelData; index: number; }

function ReelPhone({ reel, index }: ReelPhoneProps) {
  const angle = (index / 6) * 360;
  const gradientStr = `linear-gradient(180deg, ${reel.gradient
    .map((c, i) => `${c} ${Math.round((i / (reel.gradient.length - 1)) * 100)}%`)
    .join(", ")})`;

  return (
    <div className="reel-phone" style={{ transform: `rotateY(${angle}deg) translateZ(280px)` }}>
      <div className="reel-scroll-bg" style={{ background: gradientStr, animationDuration: `${4 + index * 0.7}s`, animationDelay: `${-(index * 0.4)}s` }} />
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
            <div key={i} className="wave-bar" style={{ height: `${h * 28}px`, background: reel.tagColor, animationDelay: `${i * 0.08}s` }} />
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

/* ─── FEATURE CARD ─── */
interface FeatureCardProps { icon: React.ReactNode; title: string; desc: string; delay: number; }

function FeatureCard({ icon, title, desc, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ borderColor: "rgba(255,107,53,0.4)", y: -4 }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${BORDER}`,
        borderRadius: "20px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "border-color 0.3s, transform 0.3s",
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(255,107,53,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: BRAND_SOLID }}>
        {icon}
      </div>
      <div style={{ fontSize: "17px", fontWeight: 700, color: TEXT }}>{title}</div>
      <div style={{ fontSize: "14px", color: MUTED, lineHeight: "1.6" }}>{desc}</div>
    </motion.div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [wordIdx, setWordIdx] = useState<number>(0);
  const [wordVisible, setWordVisible] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
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
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── NAVBAR ── */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px;
          background: rgba(10,10,10,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid ${BORDER};
        }
        .nav-logo {
          font-size: 22px; font-weight: 900; letter-spacing: -0.5px;
          background: ${BRAND}; -webkit-background-clip: text;
          -webkit-text-fill-color: transparent; background-clip: text;
        }
        .nav-logo span { font-weight: 300; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link { font-size: 14px; color: ${MUTED}; cursor: pointer; transition: color 0.2s; }
        .nav-link:hover { color: ${TEXT}; }
        .nav-cta {
          background: ${BRAND}; color: #fff; border: none; cursor: pointer;
          padding: 9px 22px; border-radius: 10px; font-weight: 700;
          font-size: 13px; font-family: inherit; transition: opacity 0.2s;
        }
        .nav-cta:hover { opacity: 0.85; }
        .nav-mobile-btn { display: none; background: none; border: none; color: ${TEXT}; cursor: pointer; }

        /* ── CAROUSEL ── */
        .carousel-scene {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          perspective: 1100px; pointer-events: none; z-index: 0;
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
          position: absolute; width: 130px; height: 230px;
          left: 50%; top: 50%; margin-left: -65px; margin-top: -115px;
          border-radius: 20px; overflow: hidden; background: #111;
          border: 1.5px solid rgba(255,255,255,0.14);
          box-shadow: 0 0 0 3px rgba(0,0,0,0.6), 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .reel-scroll-bg {
          position: absolute; inset: 0; width: 100%; height: 300%; top: -100%;
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
        .reel-top-bar { position: absolute; top: 18px; left: 8px; right: 8px; display: flex; align-items: center; gap: 5px; z-index: 5; }
        .reel-avatar { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 6px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .reel-username { font-size: 7px; font-weight: 600; color: #fff; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
        .reel-follow { font-size: 6.5px; font-weight: 700; color: #fff; border: 1px solid rgba(255,255,255,0.8); border-radius: 4px; padding: 1.5px 5px; }
        .reel-center { position: absolute; top: 50%; left: 8px; right: 36px; transform: translateY(-50%); display: flex; flex-direction: column; align-items: flex-start; gap: 8px; z-index: 5; }
        .reel-tag { font-size: 7px; font-weight: 800; letter-spacing: 0.1em; border: 1px solid; border-radius: 4px; padding: 2px 5px; }
        .reel-wave { display: flex; align-items: flex-end; gap: 2px; height: 30px; }
        .wave-bar { width: 4px; border-radius: 2px; opacity: 0.85; animation: wavePulse 0.8s ease-in-out infinite alternate; transform-origin: bottom; }
        @keyframes wavePulse { 0% { transform: scaleY(0.3); } 100% { transform: scaleY(1); } }
        .reel-bottom { position: absolute; bottom: 14px; left: 8px; right: 36px; display: flex; flex-direction: column; gap: 4px; z-index: 5; }
        .reel-music-row { display: flex; align-items: center; gap: 4px; }
        .reel-disc { width: 14px; height: 14px; border-radius: 50%; border: 1px solid; display: flex; align-items: center; justify-content: center; animation: discSpin linear infinite; flex-shrink: 0; }
        @keyframes discSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .reel-disc-inner { width: 5px; height: 5px; border-radius: 50%; opacity: 0.9; }
        .reel-audio { font-size: 6.5px; color: rgba(255,255,255,0.85); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70px; }
        .reel-caption-text { font-size: 7px; font-weight: 500; color: #fff; line-height: 1.3; }
        .reel-actions { position: absolute; right: 6px; bottom: 30px; display: flex; flex-direction: column; align-items: center; gap: 9px; z-index: 5; }
        .reel-action { display: flex; flex-direction: column; align-items: center; gap: 1px; }
        .action-icon { font-size: 13px; line-height: 1; }
        .heart-icon { animation: heartBeat 2s ease-in-out infinite; }
        @keyframes heartBeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.25); } }
        .action-count { font-size: 5.5px; font-weight: 700; color: #fff; }
        .reel-share-disc { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; animation: discSpin linear infinite; }
        .reel-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.2); z-index: 5; }
        .reel-progress-fill { height: 100%; animation: progressPlay linear infinite; border-radius: 1px; }
        @keyframes progressPlay { 0% { width: 0%; } 100% { width: 100%; } }

        /* ── HERO WORD ── */
        .hero-word {
          font-size: clamp(52px, 8vw, 96px); font-weight: 800; letter-spacing: -3px; line-height: 1;
          background: linear-gradient(135deg, #FFFFFF 0%, #FF6B35 50%, #FF3CAC 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          transition: opacity 0.3s ease, transform 0.35s ease;
        }
        .hero-word.hidden { opacity: 0; transform: translateY(-14px); }
        .hero-word.visible { opacity: 1; transform: translateY(0px); }

        /* ── BUTTONS ── */
        .cta-btn {
          background: ${BRAND}; color: #fff; padding: 15px 36px; border-radius: 16px;
          font-weight: 700; font-size: 15px; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 8px; font-family: inherit;
          box-shadow: 0 6px 32px rgba(255,107,53,0.35); transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-btn:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 10px 40px rgba(255,107,53,0.5); }
        .cta-btn-outline {
          background: transparent; color: ${TEXT}; padding: 15px 36px; border-radius: 16px;
          font-weight: 600; font-size: 15px; border: 1px solid ${BORDER}; cursor: pointer;
          display: flex; align-items: center; gap: 8px; font-family: inherit; transition: border-color 0.2s, color 0.2s;
        }
        .cta-btn-outline:hover { border-color: rgba(255,107,53,0.5); color: ${BRAND_SOLID}; }

        /* ── SECTIONS ── */
        .section { padding: 100px 48px; max-width: 1200px; margin: 0 auto; }
        .section-label { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${BRAND_SOLID}; margin-bottom: 16px; }
        .section-title { font-size: clamp(32px, 4vw, 48px); font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 16px; }
        .section-sub { font-size: 16px; color: ${MUTED}; line-height: 1.6; max-width: 520px; }

        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 60px; }

        .steps-row { display: flex; gap: 24px; margin-top: 60px; flex-wrap: wrap; }
        .step-card { flex: 1; min-width: 200px; padding: 32px 28px; background: rgba(255,255,255,0.02); border: 1px solid ${BORDER}; border-radius: 20px; display: flex; flex-direction: column; gap: 14px; }
        .step-num { font-size: 40px; font-weight: 900; letter-spacing: -2px; background: ${BRAND}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .stats-row { display: flex; gap: 0; border: 1px solid ${BORDER}; border-radius: 20px; overflow: hidden; margin-top: 60px; flex-wrap: wrap; }
        .stat-item { flex: 1; min-width: 150px; padding: 36px 24px; text-align: center; border-right: 1px solid ${BORDER}; }
        .stat-item:last-child { border-right: none; }
        .stat-num { font-size: 36px; font-weight: 900; background: ${BRAND}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .stat-label { font-size: 13px; color: ${MUTED}; margin-top: 6px; }

        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 60px; }
        .pricing-card { padding: 36px 32px; border-radius: 24px; border: 1px solid ${BORDER}; background: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 20px; }
        .pricing-card.featured { background: rgba(255,107,53,0.06); border-color: rgba(255,107,53,0.35); position: relative; }
        .pricing-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: ${BRAND}; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 16px; border-radius: 20px; white-space: nowrap; }
        .price-amount { font-size: 42px; font-weight: 900; letter-spacing: -2px; }
        .price-period { font-size: 14px; color: ${MUTED}; font-weight: 400; }
        .price-features { display: flex; flex-direction: column; gap: 10px; }
        .price-feature { display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(245,245,245,0.8); }

        .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 60px; }
        .testimonial-card { padding: 28px; background: rgba(255,255,255,0.02); border: 1px solid ${BORDER}; border-radius: 20px; display: flex; flex-direction: column; gap: 16px; }
        .testimonial-stars { display: flex; gap: 4px; color: ${BRAND_SOLID}; }
        .testimonial-text { font-size: 14px; color: rgba(245,245,245,0.7); line-height: 1.6; }
        .testimonial-author { display: flex; align-items: center; gap: 10px; }
        .testimonial-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; }

        .pill { font-size: 12px; color: rgba(245,245,245,0.45); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 5px 12px; }
        .divider { height: 1px; background: ${BORDER}; margin: 0 48px; }

        .footer { border-top: 1px solid ${BORDER}; padding: 48px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
        .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-link { font-size: 13px; color: ${MUTED}; cursor: pointer; transition: color 0.2s; }
        .footer-link:hover { color: ${TEXT}; }

        @media (max-width: 768px) {
          .navbar { padding: 16px 20px; }
          .nav-links { display: none; }
          .nav-mobile-btn { display: block; }
          .section { padding: 80px 20px; }
          .carousel-ring { transform: scale(0.55) !important; }
          .steps-row { flex-direction: column; }
          .stats-row { flex-direction: column; }
          .stat-item { border-right: none; border-bottom: 1px solid ${BORDER}; }
          .stat-item:last-child { border-bottom: none; }
          .footer { flex-direction: column; text-align: center; padding: 32px 20px; }
          .footer-links { justify-content: center; }
          .divider { margin: 0 20px; }
        }
      `}</style>

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className="navbar">
        <div className="nav-logo">Social<span>Rum</span></div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Features</span>
          <span className="nav-link" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How it works</span>
          <span className="nav-link" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>Pricing</span>
          <span className="nav-link" onClick={() => navigate("/login")}>Login</span>
          <button className="nav-cta" onClick={() => navigate("/signup")}>Get Started Free</button>
        </div>
        <button className="nav-mobile-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 65, left: 0, right: 0, background: "rgba(10,10,10,0.97)", backdropFilter: "blur(20px)", zIndex: 99, padding: "24px", display: "flex", flexDirection: "column", gap: "20px", borderBottom: `1px solid ${BORDER}` }}>
          {["Features", "How it works", "Pricing", "Login"].map((item) => (
            <span key={item} className="nav-link" style={{ fontSize: "16px" }} onClick={() => setMenuOpen(false)}>{item}</span>
          ))}
          <button className="cta-btn" style={{ justifyContent: "center" }} onClick={() => navigate("/signup")}>Get Started Free</button>
        </div>
      )}

      {/* ══════════════ HERO ══════════════ */}
      <section ref={heroRef} style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>

        {/* 3D Reel Carousel Background */}
        <div className="carousel-scene">
          <div className="carousel-ring">
            {REELS.map((reel, i) => <ReelPhone key={i} reel={reel} index={i} />)}
          </div>
        </div>

        {/* Dark vignette overlay */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.92) 100%)", backdropFilter: "blur(1.5px)", zIndex: 1 }} />

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", maxWidth: "620px", padding: "0 24px", textAlign: "center" }}>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: BRAND_SOLID, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
              <Sparkles size={14} /> Built for Indian Creators
            </motion.div>

            <div style={{ minHeight: "90px", display: "flex", alignItems: "center" }}>
              <div className={`hero-word ${wordVisible ? "visible" : "hidden"}`}>{WORDS[wordIdx]}</div>
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ color: MUTED, maxWidth: "480px", fontSize: "17px", lineHeight: "1.7", margin: 0 }}>
              Trending topics, AI-powered scripts, SEO tools and creator news —
              everything you need to grow on Instagram, YouTube & more.
            </motion.p>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
              style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <button className="cta-btn" onClick={() => navigate("/signup")}>Start for Free <ArrowRight size={16} /></button>
              <button className="cta-btn-outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>See Features</button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {["10K+ Creators", "Free to start", "No credit card", "Made in India 🇮🇳"].map((label) => (
                <span key={label} className="pill">{label}</span>
              ))}
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <div style={{ padding: "0 48px" }}>
        <motion.div className="stats-row" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {[
            { num: "10K+", label: "Active Creators" },
            { num: "50M+", label: "Views Generated" },
            { num: "500+", label: "Trending Topics Daily" },
            { num: "4.9★", label: "Average Rating" },
          ].map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════ FEATURES ══════════════ */}
      <div className="divider" style={{ marginTop: 80 }} />
      <section id="features" className="section">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-label">Features</div>
          <div className="section-title">Everything a creator needs</div>
          <p className="section-sub">Stop switching between 10 apps. SocialRum brings all your creator tools into one place.</p>
        </motion.div>
        <div className="features-grid">
          <FeatureCard delay={0.1} icon={<TrendingUp size={20} />} title="Trending Topics" desc="Real-time trending topics across Instagram, YouTube and Twitter tailored for Indian audiences." />
          <FeatureCard delay={0.2} icon={<FileText size={20} />} title="AI Script Generator" desc="Generate viral reel scripts, YouTube hooks and captions in seconds using AI." />
          <FeatureCard delay={0.3} icon={<Search size={20} />} title="SEO Tools" desc="Find the best hashtags, keywords and thumbnails to maximise your reach organically." />
          <FeatureCard delay={0.4} icon={<Newspaper size={20} />} title="Creator News" desc="Stay up to date with algorithm changes, brand deals and creator economy news." />
          <FeatureCard delay={0.5} icon={<Zap size={20} />} title="Viral Idea Generator" desc="Never run out of content ideas. Get 30 fresh ideas every day based on your niche." />
          <FeatureCard delay={0.6} icon={<Users size={20} />} title="Collaboration Hub" desc="Find other creators in your niche for collabs, shoutouts and brand partnerships." />
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <div className="divider" />
      <section id="how" className="section">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-label">How it works</div>
          <div className="section-title">Go viral in 3 steps</div>
          <p className="section-sub">From idea to upload in minutes — not days.</p>
        </motion.div>
        <div className="steps-row">
          {[
            { num: "01", title: "Pick a trend", desc: "Browse today's top trending topics filtered by your niche and platform." },
            { num: "02", title: "Generate your script", desc: "Let our AI write a full script, hook and CTA tailored to go viral." },
            { num: "03", title: "Publish & grow", desc: "Use our SEO tools to optimise hashtags, post time and thumbnail — then watch the views roll in." },
          ].map((step, i) => (
            <motion.div key={i} className="step-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <div className="step-num">{step.num}</div>
              <div style={{ fontSize: "17px", fontWeight: 700 }}>{step.title}</div>
              <div style={{ fontSize: "14px", color: MUTED, lineHeight: "1.6" }}>{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <div className="divider" />
      <section className="section">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-label">Testimonials</div>
          <div className="section-title">Creators love SocialRum</div>
        </motion.div>
        <div className="testimonials-grid">
          {[
            { name: "Priya S.", handle: "@priya.creates", avatar: "#FF6B9D", initials: "PS", text: "I went from 2K to 80K followers in 3 months using SocialRum's trending topics and AI scripts. This tool is insane!" },
            { name: "Rahul T.", handle: "@techtalkindia", avatar: "#00BFFF", initials: "RT", text: "The SEO tools alone are worth it. My videos are ranking on YouTube search now for the first time ever." },
            { name: "Meghna D.", handle: "@dancewithmeg", avatar: "#FFD700", initials: "MD", text: "I use the viral idea generator every single day. Never run out of content anymore. 10/10 recommend." },
          ].map((t, i) => (
            <motion.div key={i} className="testimonial-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="testimonial-stars">{[...Array(5)].map((_, j) => <Star key={j} size={14} fill={BRAND_SOLID} color={BRAND_SOLID} />)}</div>
              <div className="testimonial-text">"{t.text}"</div>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: t.avatar }}>{t.initials}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: "12px", color: MUTED }}>{t.handle}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ PRICING ══════════════ */}
      <div className="divider" />
      <section id="pricing" className="section">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-label">Pricing</div>
          <div className="section-title">Simple, honest pricing</div>
          <p className="section-sub">Start free. Upgrade when you're ready to scale.</p>
        </motion.div>
        <div className="pricing-grid">
          {[
            {
              name: "Free", price: "₹0", period: "/month", featured: false,
              features: ["5 trending topics/day", "10 AI scripts/month", "Basic SEO tools", "Creator news feed"],
              cta: "Get Started Free",
            },
            {
              name: "Pro", price: "₹499", period: "/month", featured: true,
              features: ["Unlimited trending topics", "Unlimited AI scripts", "Advanced SEO + analytics", "Viral idea generator", "Collab hub access", "Priority support"],
              cta: "Start Pro Free Trial",
            },
            {
              name: "Agency", price: "₹1499", period: "/month", featured: false,
              features: ["Everything in Pro", "Up to 10 team members", "White-label reports", "Dedicated account manager", "Custom integrations"],
              cta: "Contact Sales",
            },
          ].map((plan, i) => (
            <motion.div key={i} className={`pricing-card ${plan.featured ? "featured" : ""}`} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              {plan.featured && <div className="pricing-badge">Most Popular</div>}
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: plan.featured ? BRAND_SOLID : MUTED, marginBottom: 8 }}>{plan.name}</div>
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              <div className="price-features">
                {plan.features.map((f) => (
                  <div key={f} className="price-feature">
                    <Check size={15} color={BRAND_SOLID} /> {f}
                  </div>
                ))}
              </div>
              <button className={plan.featured ? "cta-btn" : "cta-btn-outline"} style={{ justifyContent: "center", width: "100%" }} onClick={() => navigate("/signup")}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ BOTTOM CTA ══════════════ */}
      <div className="divider" />
      <section className="section" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-title">Ready to go viral?</div>
          <p style={{ color: MUTED, fontSize: "16px", lineHeight: "1.6", marginTop: 12 }}>
            Join 10,000+ Indian creators already using SocialRum to grow faster.
          </p>
        </motion.div>
        <motion.button className="cta-btn" style={{ fontSize: "16px", padding: "16px 40px" }}
          onClick={() => navigate("/signup")}
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} whileHover={{ scale: 1.05 }}>
          Start for Free Today <ArrowRight size={18} />
        </motion.button>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <div className="divider" />
      <footer className="footer">
        <div style={{ fontSize: "20px", fontWeight: 900, background: BRAND, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          SocialRum
        </div>
        <div className="footer-links">
          {["Privacy", "Terms", "Contact", "Blog"].map((l) => (
            <span key={l} className="footer-link">{l}</span>
          ))}
        </div>
        <div style={{ fontSize: "13px", color: MUTED }}>© 2024 SocialRum. Made with ❤️ in India.</div>
      </footer>

    </div>
  );
}