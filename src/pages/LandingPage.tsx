import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  TrendingUp, Sparkles, Newspaper, FileText,
  Check, Star, ArrowRight, Zap, Target,
  Instagram, Youtube, ChevronDown,
  BarChart2, Users, Menu, X
} from "lucide-react";

const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const G = "#E8B84B";
const C = {
  bg: "#0A0A0A", card: "#141414", card2: "#1A1A1A",
  border: "#222", text: "#F0EAD6", muted: "#5A5A5A",
};

const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "How it Works", id: "howitworks" },
  { label: "Testimonials", id: "testimonials" },
  { label: "Pricing", id: "pricing" },
];

const features = [
  { icon: TrendingUp, title: "Trending Topics", desc: "Discover what India is watching — real-time trending data across 20+ niches before anyone else.", tag: "Live" },
  { icon: Sparkles, title: "AI Script Generator", desc: "Generate ready-to-film Reel and YouTube scripts with hooks, body, and CTA in under 10 seconds.", tag: "AI" },
  { icon: Newspaper, title: "Creator News Feed", desc: "Curated niche news delivered daily so you never run out of timely content ideas.", tag: "Daily" },
  { icon: Target, title: "SEO Optimizer", desc: "Rank higher on YouTube with AI-generated titles, descriptions, and tags built for the algorithm.", tag: "YouTube" },
  { icon: BarChart2, title: "Channel Analyzer", desc: "Deep-dive into any Instagram or YouTube channel — content pillars, ideas, and growth gaps.", tag: "Insights" },
  { icon: Zap, title: "Viral Hook Engine", desc: "Stop the scroll with AI hooks engineered from millions of viral Indian creator posts.", tag: "Viral" },
];

const steps = [
  { num: "01", title: "Pick Your Niche", desc: "Tell SocialRum your content niche — finance, fitness, comedy, tech or any of 20+ categories." },
  { num: "02", title: "Discover Trends", desc: "See what's trending right now in your niche across Instagram Reels and YouTube Shorts." },
  { num: "03", title: "Generate Content", desc: "One click to get a full script, viral hook, SEO tags or content ideas — ready to film." },
  { num: "04", title: "Go Viral", desc: "Post with confidence knowing your content is built on real data and AI-powered strategy." },
];

const testimonials = [
  { name: "Rahul Sharma", handle: "@rahulfinance", niche: "Finance · 280K", text: "SocialRum helped me go from 5K to 50K in 3 months. The trending topics feature is insane — I always post at the right time.", avatar: "RS", stars: 5 },
  { name: "Priya Mehta", handle: "@priyafitness", niche: "Fitness · 120K", text: "Script generation alone saves me 4 hours a week. The hooks it writes are actually better than what I used to write myself.", avatar: "PM", stars: 5 },
  { name: "Arjun Kapoor", handle: "@arjuntech", niche: "Tech · 95K", text: "The SEO optimizer took my YouTube views from 2K to 40K per video. I wish I had this 2 years ago.", avatar: "AK", stars: 5 },
  { name: "Sneha Rao", handle: "@snehalifestyle", niche: "Lifestyle · 67K", text: "Finally a tool made for Indian creators. The Hinglish script option alone is worth the subscription.", avatar: "SR", stars: 5 },
  { name: "Vikram Das", handle: "@vikramcricket", niche: "Cricket · 210K", text: "I post IPL content and SocialRum's live news feed means I'm always first. My engagement doubled.", avatar: "VD", stars: 5 },
  { name: "Anjali Nair", handle: "@anjalifood", niche: "Food · 88K", text: "The channel analyzer showed me exactly what top food creators do differently. Changed my whole strategy.", avatar: "AN", stars: 5 },
];

const freeF = ["3 script generations/month", "Basic trending topics", "News feed (5 articles/day)"];
const proF = ["Unlimited script generations", "Full trending data — 20+ niches", "Complete news feed", "YouTube SEO optimizer", "Channel analyzer", "Instagram analyzer", "Priority support"];

const REELS = [
  { bg: "#1a1a3a", emoji: "💪", tag: "Fitness", views: "12.4M" },
  { bg: "#0d2b0d", emoji: "📈", tag: "Finance", views: "8.7M" },
  { bg: "#2b0d0d", emoji: "🏏", tag: "Cricket", views: "18.9M" },
  { bg: "#0d1a2b", emoji: "🤖", tag: "Tech", views: "5.2M" },
  { bg: "#2b2010", emoji: "🍳", tag: "Food", views: "9.3M" },
  { bg: "#0d2b2b", emoji: "✈️", tag: "Travel", views: "15.1M" },
  { bg: "#2b1a2b", emoji: "😂", tag: "Comedy", views: "11.4M" },
  { bg: "#1a2b10", emoji: "🧘", tag: "Yoga", views: "6.8M" },
];

const EMOJIS = ["❤️", "🔥", "👍", "💬", "🔁", "⭐", "😍", "🎉", "💯", "👏"];

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [annual, setAnnual] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number; y: number; dx: number }[]>([]);
  const emojiIdRef = useRef(0);

  // Orbit ring canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H * 0.52;
    const Rx = W * 0.42;
    const Ry = H * 0.22;
    const N = REELS.length;

    function drawCard(x: number, y: number, scale: number, alpha: number, reel: typeof REELS[0], angle: number) {
      const w = 72 * scale;
      const h = 118 * scale;
      ctx!.save();
      ctx!.globalAlpha = alpha;
      ctx!.translate(x, y);
      // Slight rotation following orbit
      ctx!.rotate(Math.sin(angle) * 0.08);
      ctx!.beginPath();
      (ctx as any).roundRect(-w / 2, -h / 2, w, h, 10 * scale);
      ctx!.fillStyle = reel.bg;
      ctx!.fill();
      // Gradient overlay
      const grad = ctx!.createLinearGradient(-w / 2, -h / 2, -w / 2, h / 2);
      grad.addColorStop(0, "rgba(255,255,255,0.08)");
      grad.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx!.fillStyle = grad;
      ctx!.fill();
      // Border
      ctx!.strokeStyle = `rgba(255,255,255,${0.12 * alpha})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();
      // Emoji
      ctx!.font = `${22 * scale}px serif`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText(reel.emoji, 0, -10 * scale);
      // Tag
      ctx!.font = `${8 * scale}px DM Sans, sans-serif`;
      ctx!.fillStyle = `rgba(255,255,255,${0.7 * alpha})`;
      ctx!.fillText(reel.tag.toUpperCase(), 0, 10 * scale);
      // Views
      ctx!.font = `${7 * scale}px DM Sans, sans-serif`;
      ctx!.fillStyle = `rgba(255,255,255,${0.45 * alpha})`;
      ctx!.fillText(reel.views + " views", 0, 22 * scale);
      // Play icon
      ctx!.beginPath();
      ctx!.arc(0, -28 * scale, 9 * scale, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(255,255,255,${0.15 * alpha})`;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(-3 * scale, -31 * scale);
      ctx!.lineTo(5 * scale, -28 * scale);
      ctx!.lineTo(-3 * scale, -25 * scale);
      ctx!.closePath();
      ctx!.fillStyle = `rgba(255,255,255,${0.8 * alpha})`;
      ctx!.fill();
      ctx!.restore();
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // Draw orbit ellipse (only bottom half — semi orbit)
      ctx!.save();
      ctx!.strokeStyle = "rgba(255,255,255,0.04)";
      ctx!.lineWidth = 1;
      ctx!.setLineDash([4, 8]);
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, Rx, Ry, 0, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.restore();

      // Collect items with z depth for sorting
      const items = REELS.map((reel, i) => {
        const a = angleRef.current + i * (Math.PI * 2 / N);
        const x = cx + Rx * Math.cos(a);
        const y = cy + Ry * Math.sin(a);
        const z = Math.sin(a); // -1 to 1
        const scale = 0.55 + 0.45 * ((z + 1) / 2);
        const alpha = 0.35 + 0.65 * ((z + 1) / 2);
        return { x, y, z, scale, alpha, reel, a };
      });

      // Sort back to front
      items.sort((a, b) => a.z - b.z);
      items.forEach(item => {
        drawCard(item.x, item.y, item.scale, item.alpha, item.reel, item.a);
      });

      angleRef.current += 0.006;
      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Floating emojis
  useEffect(() => {
    const interval = setInterval(() => {
      const id = emojiIdRef.current++;
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const x = 20 + Math.random() * 60; // % from left
      const y = 40 + Math.random() * 40; // % from top of hero
      const dx = (Math.random() - 0.5) * 80;
      setFloatingEmojis(prev => [...prev.slice(-12), { id, emoji, x, y, dx }]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .cg { font-family: 'Cormorant Garamond', serif !important; }
        .dm { font-family: 'DM Sans', sans-serif !important; }
        .gold-text { background: linear-gradient(135deg,#E8B84B,#C17D20); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .teal-text { background: linear-gradient(135deg,#14BBA6,#22D3EE); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#2a2a2a; border-radius:4px; }
        .nav-link { position:relative; transition:color .2s; }
        .nav-link:hover { color:#E8B84B !important; }
        .feature-card:hover { border-color:#E8B84B25 !important; transform:translateY(-4px); }
        .feature-card { transition: all .25s ease; }
        .float-emoji { position:absolute; pointer-events:none; font-size:20px; animation: floatUp 2s ease-out forwards; z-index:5; }
        @keyframes floatUp {
          0% { opacity:1; transform:translate(0,0) scale(0.5); }
          40% { opacity:1; transform:translate(var(--dx), -60px) scale(1.1); }
          100% { opacity:0; transform:translate(var(--dx2), -130px) scale(0.7); }
        }
        .grain { position:fixed; inset:0; pointer-events:none; z-index:1; opacity:0.02;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:200px; }
      `}</style>

      <div className="grain" />

      {/* ── NAVBAR ── */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="flex items-center justify-between px-6 md:px-16 py-5 fixed top-0 left-0 right-0 z-50"
        style={{ background: `${C.bg}cc`, borderBottom: `1px solid ${C.border}20`, backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <motion.img whileHover={{ rotate: 8, scale: 1.05 }} src="/logo.png" alt="SocialRum" className="w-8 h-8 rounded-xl" />
          <span className="cg font-bold text-xl" style={{ color: C.text }}>SocialRum</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)}
              className="nav-link dm text-sm bg-transparent border-none cursor-pointer"
              style={{ color: C.muted }}>{l.label}</button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="nav-link dm text-sm" style={{ color: C.muted }}>Login</button>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 24px #E8B84B30" }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="dm px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: GOLD, color: "#0A0A0A" }}>
            Start Free
          </motion.button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{ color: C.muted }}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-4 right-4 z-40 p-4 flex flex-col gap-2 rounded-2xl"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className="dm text-sm py-2.5 text-left" style={{ color: C.muted }}>{l.label}</button>
            ))}
            <div className="border-t my-1" style={{ borderColor: C.border }} />
            <button onClick={() => navigate("/signup")} className="dm py-3 rounded-xl text-sm font-semibold"
              style={{ background: GOLD, color: "#0A0A0A" }}>Start Free</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative flex flex-col items-center text-center pt-28 pb-8 overflow-hidden"
        style={{ minHeight: "100vh" }}>

        {/* Background glow orbs */}
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, #E8B84B, transparent 65%)", filter: "blur(80px)" }} />
        <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 12, repeat: Infinity, delay: 3 }}
          className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(circle, #14BBA6, transparent 70%)", filter: "blur(100px)" }} />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(${C.border}40 1px, transparent 1px), linear-gradient(90deg, ${C.border}40 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)"
        }} />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full dm text-xs font-medium mb-6 relative z-10"
          style={{ background: "#E8B84B0D", border: "1px solid #E8B84B25", color: G, letterSpacing: ".12em" }}>
          <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: G }} />
          <Sparkles className="w-3 h-3" />
          BUILT FOR INDIA'S CREATORS
        </motion.div>

        {/* Static headline — all 3 words */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 mb-5">
          <h1 className="cg font-bold leading-none" style={{ fontSize: "clamp(52px, 9vw, 100px)" }}>
            <span style={{ color: C.text }}>Discover. </span>
            <span className="gold-text italic">Create. </span>
            <span className="teal-text italic">Go Viral.</span>
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="dm text-base max-w-md leading-relaxed mb-8 relative z-10" style={{ color: C.muted }}>
          AI tools built for Indian creators on Instagram and YouTube.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex items-center gap-4 flex-wrap justify-center mb-2 relative z-10">
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 40px #E8B84B35" }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl dm font-semibold text-base"
            style={{ background: GOLD, color: "#0A0A0A" }}>
            Start for Free <ArrowRight className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl dm font-medium text-base transition-all"
            style={{ border: `1px solid ${C.border}`, background: C.card, color: C.text }}>
            Login
          </motion.button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          className="dm text-xs mb-6 relative z-10" style={{ color: "#303030" }}>
          No credit card · Free forever plan · 10,000+ creators
        </motion.p>

        {/* Platform pills */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="flex items-center gap-3 mb-4 relative z-10">
          {[{ icon: Instagram, label: "Instagram Reels", color: "#14BBA6" }, { icon: Youtube, label: "YouTube Shorts", color: "#FF6B6B" }].map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl dm text-xs"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted }}>
              <p.icon className="w-3.5 h-3.5" style={{ color: p.color }} /> {p.label}
            </div>
          ))}
        </motion.div>

        {/* ── ORBIT RING CANVAS ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}
          className="relative z-10 w-full" style={{ maxWidth: 700 }}>

          {/* Floating emojis */}
          {floatingEmojis.map(e => (
            <div key={e.id} className="float-emoji"
              style={{
                left: `${e.x}%`,
                top: `${e.y}%`,
                "--dx": `${e.dx}px`,
                "--dx2": `${e.dx * 1.4}px`,
              } as any}>
              {e.emoji}
            </div>
          ))}

          <canvas ref={canvasRef} width={700} height={280}
            style={{ width: "100%", height: "auto", display: "block" }} />
        </motion.div>

        {/* Scroll cue */}
        <motion.button animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
          onClick={() => scrollTo("features")}
          className="flex flex-col items-center gap-1.5 mt-4 relative z-10 bg-transparent border-none cursor-pointer"
          style={{ color: C.muted }}>
          <span className="dm text-xs" style={{ letterSpacing: ".14em" }}>EXPLORE</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "20+", label: "Niches Covered" },
            { val: "10K+", label: "Scripts Generated" },
            { val: "154", label: "Trending Daily" },
            { val: "99%", label: "Creator Satisfaction" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.09 }}>
              <p className="cg font-bold gold-text" style={{ fontSize: 42 }}>{s.val}</p>
              <p className="dm text-xs mt-1" style={{ color: C.muted, letterSpacing: ".06em" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 md:px-16 py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
            <p className="dm text-xs uppercase mb-3" style={{ color: G, letterSpacing: ".2em" }}>Features</p>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2 className="cg font-bold" style={{ fontSize: "clamp(36px,5vw,60px)", color: C.text, lineHeight: 1.1 }}>
                Everything You Need<br /><span className="italic gold-text">to Go Viral</span>
              </h2>
              <p className="dm text-sm max-w-xs" style={{ color: C.muted, lineHeight: 1.7 }}>
                AI tools built specifically for Indian content creators on Instagram and YouTube.
              </p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="feature-card rounded-2xl p-6"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "#E8B84B0D", border: "1px solid #E8B84B20" }}>
                    <f.icon className="w-5 h-5" style={{ color: G }} />
                  </div>
                  <span className="dm text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "#E8B84B0D", color: G, border: "1px solid #E8B84B20" }}>{f.tag}</span>
                </div>
                <h3 className="dm font-semibold text-base mb-2" style={{ color: C.text }}>{f.title}</h3>
                <p className="dm text-sm leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="howitworks" style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
        className="px-6 md:px-16 py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <p className="dm text-xs uppercase mb-3" style={{ color: G, letterSpacing: ".2em" }}>Process</p>
            <h2 className="cg font-bold" style={{ fontSize: "clamp(36px,5vw,60px)", color: C.text }}>
              From Zero to <span className="italic gold-text">Viral</span><br />in 4 Steps
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px z-0"
                    style={{ background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
                )}
                <div className="relative z-10">
                  <div className="cg font-bold text-4xl mb-4 gold-text">{s.num}</div>
                  <h3 className="dm font-semibold text-base mb-2" style={{ color: C.text }}>{s.title}</h3>
                  <p className="dm text-sm leading-relaxed" style={{ color: C.muted }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="px-6 md:px-16 py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
            <p className="dm text-xs uppercase mb-3" style={{ color: G, letterSpacing: ".2em" }}>Testimonials</p>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2 className="cg font-bold" style={{ fontSize: "clamp(36px,5vw,60px)", color: C.text, lineHeight: 1.1 }}>
                Loved by <span className="italic gold-text">Creators</span><br />Across India
              </h2>
              <div className="flex items-center gap-2 dm text-sm" style={{ color: C.muted }}>
                <Users className="w-4 h-4" style={{ color: G }} />
                10,000+ active creators
              </div>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-6 transition-all"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5" style={{ fill: G, color: G }} />
                  ))}
                </div>
                <p className="dm text-sm leading-relaxed mb-5" style={{ color: C.muted }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center dm text-xs font-bold"
                    style={{ background: GOLD, color: "#0A0A0A" }}>{t.avatar}</div>
                  <div>
                    <p className="dm font-semibold text-sm" style={{ color: C.text }}>{t.name}</p>
                    <p className="dm text-xs" style={{ color: C.muted }}>{t.niche}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
        className="px-6 md:px-16 py-28">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="dm text-xs uppercase mb-3" style={{ color: G, letterSpacing: ".2em" }}>Pricing</p>
            <h2 className="cg font-bold mb-4" style={{ fontSize: "clamp(36px,5vw,60px)", color: C.text }}>
              Simple, <span className="italic gold-text">Honest</span> Pricing
            </h2>
            <p className="dm text-sm" style={{ color: C.muted }}>Start free. Upgrade only when you're ready.</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="dm text-sm" style={{ color: annual ? C.muted : C.text }}>Monthly</span>
              <button onClick={() => setAnnual(!annual)}
                className="w-12 h-6 rounded-full transition-all relative"
                style={{ background: annual ? GOLD : C.border }}>
                <motion.div animate={{ x: annual ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white" />
              </button>
              <span className="dm text-sm" style={{ color: annual ? C.text : C.muted }}>
                Annual <span className="dm text-xs px-2 py-0.5 rounded-full ml-1"
                  style={{ background: "#E8B84B15", color: G }}>Save 30%</span>
              </span>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              className="rounded-2xl p-8" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
              <h3 className="cg font-bold text-2xl mb-1" style={{ color: C.text }}>Free</h3>
              <p className="dm text-sm mb-6" style={{ color: C.muted }}>Perfect to get started</p>
              <div className="mb-6 flex items-end gap-1">
                <span className="cg font-bold" style={{ fontSize: 52, color: C.text, lineHeight: 1 }}>₹0</span>
                <span className="dm text-sm mb-2" style={{ color: C.muted }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {freeF.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 dm text-sm" style={{ color: C.muted }}>
                    <Check className="w-4 h-4 shrink-0" style={{ color: G }} />{f}
                  </li>
                ))}
              </ul>
              <motion.button whileHover={{ borderColor: "#E8B84B50" }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/signup")}
                className="w-full py-3.5 rounded-xl dm font-medium text-sm transition-all"
                style={{ border: `1px solid ${C.border}`, color: C.text }}>
                Get Started Free
              </motion.button>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ boxShadow: "0 0 60px #E8B84B12" }}
              className="rounded-2xl p-8 relative transition-all"
              style={{ background: C.bg, border: `1px solid #E8B84B40` }}>
              <motion.div animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full dm text-xs font-semibold"
                style={{ background: GOLD, color: "#0A0A0A" }}>✦ Most Popular</motion.div>
              <h3 className="cg font-bold text-2xl mb-1" style={{ color: C.text }}>Pro</h3>
              <p className="dm text-sm mb-6" style={{ color: C.muted }}>For serious creators</p>
              <div className="mb-6 flex items-end gap-1">
                <span className="cg font-bold gold-text" style={{ fontSize: 52, lineHeight: 1 }}>
                  {annual ? "₹559" : "₹799"}
                </span>
                <span className="dm text-sm mb-2" style={{ color: C.muted }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {proF.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 dm text-sm" style={{ color: C.muted }}>
                    <Check className="w-4 h-4 shrink-0" style={{ color: G }} />{f}
                  </li>
                ))}
              </ul>
              <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 30px #E8B84B25" }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/signup")}
                className="w-full py-3.5 rounded-xl dm font-semibold text-sm"
                style={{ background: GOLD, color: "#0A0A0A" }}>
                Start Pro Trial
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-16 py-32 relative overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.09, 0.04] }} transition={{ duration: 9, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, #E8B84B, transparent 65%)", filter: "blur(80px)" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center relative z-10">
          <p className="dm text-xs uppercase mb-4" style={{ color: G, letterSpacing: ".2em" }}>Get Started</p>
          <h2 className="cg font-bold mb-5" style={{ fontSize: "clamp(44px,7vw,88px)", color: C.text, lineHeight: 1.05 }}>
            Ready to<br /><span className="italic gold-text">Go Viral?</span>
          </h2>
          <p className="dm text-base mb-10 max-w-md mx-auto" style={{ color: C.muted, lineHeight: 1.7 }}>
            Join 10,000+ Indian creators using SocialRum to grow faster on Instagram and YouTube.
          </p>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 50px #E8B84B35" }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 px-12 py-5 rounded-2xl dm font-semibold text-base mx-auto"
            style={{ background: GOLD, color: "#0A0A0A" }}>
            Start for Free Today <ArrowRight className="w-4 h-4" />
          </motion.button>
          <p className="dm text-xs mt-4" style={{ color: "#2A2A2A" }}>No credit card · Free forever plan · Cancel anytime</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-16 py-10" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SocialRum" className="w-7 h-7 rounded-lg" />
            <span className="cg font-bold text-lg" style={{ color: C.text }}>SocialRum</span>
          </div>
          <div className="flex items-center gap-6 dm text-xs" style={{ color: C.muted }}>
            <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
            <span className="cursor-pointer hover:text-white transition-colors">Contact</span>
          </div>
          <p className="dm text-xs" style={{ color: "#2A2A2A" }}>© 2026 SocialRum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}