import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, Sparkles, Newspaper, FileText,
  Check, Star, ArrowRight, Zap, Target,
  Instagram, Youtube, ChevronDown,
  BarChart2, Users, Menu, X, Crown
} from "lucide-react";

const IG_GRAD = "linear-gradient(135deg, #14BBA6, #22D3EE)";
const IG = "#14BBA6";
const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const G = "#E8B84B";
const C = {
  bg: "#0A0A0A", card: "#141414", border: "#222",
  text: "#F0EAD6", muted: "#5A5A5A",
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

const PLANS = [
  {
    id: "free", label: "FREE", price: "₹0", period: "/month",
    desc: "Perfect to get started", badge: null, badgeColor: null,
    features: ["3 AI script generations/month", "Basic trending topics", "News feed (5 articles/day)", "Instagram Reels explorer"],
    cta: "Get Started Free", ctaStyle: "outline", accent: C.border,
  },
  {
    id: "pro", label: "PRO", price: "₹799", period: "/month",
    desc: "Billed monthly · Cancel anytime", badge: null, badgeColor: null,
    features: ["Unlimited AI script generations", "Full trending data — 20+ niches", "Complete news feed", "YouTube SEO optimizer", "Channel & profile analyzer", "Viral hook engine", "Priority support"],
    cta: "Upgrade to Pro", ctaStyle: "teal", accent: IG,
  },
  {
    id: "quarterly", label: "PRO QUARTERLY", price: "₹699", period: "/month",
    desc: "Billed ₹2,097 every 3 months", badge: "Best Value", badgeColor: IG_GRAD,
    features: ["Everything in Pro Monthly", "Save ₹300 every 3 months", "Quarterly billing flexibility", "Dedicated onboarding support", "Early access to new features"],
    cta: "Get Quarterly", ctaStyle: "teal", accent: IG,
  },
  {
    id: "annual", label: "PRO ANNUAL", price: "₹599", period: "/month",
    desc: "Billed ₹6,708/year · Save 30%", badge: "Most Popular", badgeColor: GOLD,
    features: ["Everything in Pro Quarterly", "Save ₹2,389 vs monthly", "Annual billing — lowest price", "Priority feature requests", "1-on-1 creator consultation"],
    cta: "Get Annual", ctaStyle: "gold", accent: G,
  },
];

const REELS = [
  { grad: ["#1a1a3a", "#2d1f4a"], emoji: "💪", tag: "Fitness", views: "12.4M", likes: "890K" },
  { grad: ["#0d2b0d", "#1a3d2a"], emoji: "📈", tag: "Finance", views: "8.7M", likes: "620K" },
  { grad: ["#2b0d0d", "#3d1a1a"], emoji: "🏏", tag: "Cricket", views: "18.9M", likes: "1.4M" },
  { grad: ["#0d1a2b", "#1a2d3d"], emoji: "🤖", tag: "Tech", views: "5.2M", likes: "410K" },
  { grad: ["#2b2010", "#3d2f18"], emoji: "🍳", tag: "Food", views: "9.3M", likes: "720K" },
  { grad: ["#0d2b2b", "#1a3d3d"], emoji: "✈️", tag: "Travel", views: "15.1M", likes: "1.1M" },
  { grad: ["#2b1a2b", "#3d2b3d"], emoji: "😂", tag: "Comedy", views: "11.4M", likes: "870K" },
  { grad: ["#1a2b10", "#2b3d18"], emoji: "🧘", tag: "Yoga", views: "6.8M", likes: "540K" },
];

const EMOJIS = ["❤️", "🔥", "👍", "💬", "🔁", "⭐", "😍", "🎉", "💯", "👏"];

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number; y: number; dx: number }[]>([]);
  const emojiIdRef = useRef(0);

  // Orbit ring — only front half visible
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H * 0.48;
    const Rx = W * 0.4;
    const Ry = H * 0.2;
    const N = REELS.length;

    function drawCard(x: number, y: number, scale: number, alpha: number, reel: typeof REELS[0]) {
      const w = 78 * scale;
      const h = 128 * scale;
      ctx!.save();
      ctx!.globalAlpha = Math.max(0, alpha);
      ctx!.translate(x, y);

      // Card with gradient background
      const grad = ctx!.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      grad.addColorStop(0, reel.grad[0]);
      grad.addColorStop(1, reel.grad[1]);

      ctx!.beginPath();
      (ctx as any).roundRect(-w / 2, -h / 2, w, h, 12 * scale);
      ctx!.fillStyle = grad;
      ctx!.fill();

      // Glass overlay
      const glassGrad = ctx!.createLinearGradient(-w / 2, -h / 2, -w / 2, h / 2);
      glassGrad.addColorStop(0, "rgba(255,255,255,0.1)");
      glassGrad.addColorStop(0.5, "rgba(255,255,255,0.03)");
      glassGrad.addColorStop(1, "rgba(0,0,0,0.3)");
      ctx!.fillStyle = glassGrad;
      ctx!.fill();

      // Border
      ctx!.strokeStyle = `rgba(255,255,255,${0.15 * alpha})`;
      ctx!.lineWidth = 0.8;
      ctx!.stroke();

      // Thumbnail area (top 60%)
      ctx!.beginPath();
      (ctx as any).roundRect(-w / 2 + 4 * scale, -h / 2 + 4 * scale, w - 8 * scale, h * 0.55, 8 * scale);
      ctx!.fillStyle = "rgba(0,0,0,0.2)";
      ctx!.fill();

      // Big emoji
      ctx!.font = `${28 * scale}px serif`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText(reel.emoji, 0, -h * 0.18);

      // Play button
      ctx!.beginPath();
      ctx!.arc(0, -h * 0.18, 12 * scale, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(255,255,255,0.2)`;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(-4 * scale, -h * 0.18 - 5 * scale);
      ctx!.lineTo(6 * scale, -h * 0.18);
      ctx!.lineTo(-4 * scale, -h * 0.18 + 5 * scale);
      ctx!.closePath();
      ctx!.fillStyle = "rgba(255,255,255,0.9)";
      ctx!.fill();

      // Bottom info area
      const infoY = h * 0.14;

      // Tag pill
      ctx!.beginPath();
      (ctx as any).roundRect(-w / 2 + 5 * scale, infoY - 6 * scale, 36 * scale, 12 * scale, 6 * scale);
      ctx!.fillStyle = "rgba(20,187,166,0.4)";
      ctx!.fill();
      ctx!.font = `${7 * scale}px DM Sans, sans-serif`;
      ctx!.fillStyle = "rgba(255,255,255,0.9)";
      ctx!.textAlign = "left";
      ctx!.fillText(reel.tag, -w / 2 + 8 * scale, infoY);

      // Views
      ctx!.font = `600 ${9 * scale}px DM Sans, sans-serif`;
      ctx!.textAlign = "left";
      ctx!.fillStyle = "rgba(255,255,255,0.95)";
      ctx!.fillText(reel.views, -w / 2 + 5 * scale, infoY + 14 * scale);

      // Heart + likes
      ctx!.font = `${8 * scale}px serif`;
      ctx!.fillText("❤️", -w / 2 + 5 * scale, infoY + 26 * scale);
      ctx!.font = `${8 * scale}px DM Sans, sans-serif`;
      ctx!.fillStyle = "rgba(255,255,255,0.6)";
      ctx!.fillText(reel.likes, -w / 2 + 18 * scale, infoY + 26 * scale);

      ctx!.restore();
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      const items = REELS.map((reel, i) => {
        const a = angleRef.current + i * (Math.PI * 2 / N);
        const x = cx + Rx * Math.cos(a);
        const y = cy + Ry * Math.sin(a);
        const z = Math.sin(a); // -1 back, +1 front
        const scale = 0.5 + 0.5 * ((z + 1) / 2);
        // Only show front half — fade out back half quickly
        const alpha = z > -0.2 ? 0.3 + 0.7 * ((z + 0.2) / 1.2) : 0;
        return { x, y, z, scale, alpha, reel };
      });

      // Sort back to front
      items.sort((a, b) => a.z - b.z);
      items.forEach(item => {
        if (item.alpha > 0.05) {
          drawCard(item.x, item.y, item.scale, item.alpha, item.reel);
        }
      });

      angleRef.current += 0.005;
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
      const x = 15 + Math.random() * 70;
      const y = 30 + Math.random() * 50;
      const dx = (Math.random() - 0.5) * 100;
      setFloatingEmojis(prev => [...prev.slice(-10), { id, emoji, x, y, dx }]);
    }, 450);
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
        .nav-link:hover { color:#14BBA6 !important; }
        .feature-card { transition: all .25s ease; }
        .feature-card:hover { border-color:#14BBA625 !important; transform:translateY(-4px); }
        .plan-card { transition: all .25s ease; }
        .float-emoji { position:absolute; pointer-events:none; font-size:22px; animation: floatUp 2.2s ease-out forwards; z-index:5; }
        @keyframes floatUp {
          0% { opacity:1; transform:translate(0,0) scale(0.4) rotate(0deg); }
          40% { opacity:1; transform:translate(var(--dx), -70px) scale(1.1) rotate(var(--rot)); }
          100% { opacity:0; transform:translate(var(--dx2), -150px) scale(0.7) rotate(var(--rot2)); }
        }
      `}</style>

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
              className="nav-link dm text-sm bg-transparent border-none cursor-pointer transition-colors"
              style={{ color: C.muted }}>{l.label}</button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="nav-link dm text-sm transition-colors" style={{ color: C.muted }}>Login</button>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 24px #14BBA630" }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="dm px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: IG_GRAD, color: "#fff" }}>
            Start Free
          </motion.button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{ color: C.muted }}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-4 right-4 z-40 p-4 flex flex-col gap-2 rounded-2xl"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="dm text-sm py-2.5 text-left" style={{ color: C.muted }}>{l.label}</button>
            ))}
            <div className="border-t my-1" style={{ borderColor: C.border }} />
            <button onClick={() => navigate("/signup")} className="dm py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: IG_GRAD }}>Start Free</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center text-center pt-28 pb-8 overflow-hidden" style={{ minHeight: "100vh" }}>

        {/* Glow orbs */}
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, #14BBA6, transparent 65%)", filter: "blur(100px)" }} />
        <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 12, repeat: Infinity, delay: 3 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(circle, #E8B84B, transparent 70%)", filter: "blur(100px)" }} />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(${C.border}50 1px, transparent 1px), linear-gradient(90deg, ${C.border}50 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)"
        }} />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full dm text-xs font-medium mb-6 relative z-10"
          style={{ background: "#14BBA610", border: "1px solid #14BBA630", color: IG, letterSpacing: ".12em" }}>
          <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: IG }} />
          <Sparkles className="w-3 h-3" />
          BUILT FOR INDIA'S CREATORS
        </motion.div>

        {/* Static headline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 mb-5 px-4">
          <h1 className="cg font-bold leading-tight" style={{ fontSize: "clamp(48px, 8vw, 96px)" }}>
            <span style={{ color: C.text }}>Discover. </span>
            <span className="teal-text italic">Create. </span>
            <span className="gold-text italic">Go Viral.</span>
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="dm text-base max-w-md leading-relaxed mb-8 relative z-10" style={{ color: C.muted }}>
          AI tools built for Indian creators on Instagram and YouTube.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex items-center gap-4 flex-wrap justify-center mb-3 relative z-10">
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 40px #14BBA635" }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl dm font-semibold text-base text-white"
            style={{ background: IG_GRAD }}>
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
          className="dm text-xs mb-4 relative z-10" style={{ color: "#303030" }}>
          No credit card · Free forever plan · 10,000+ creators
        </motion.p>

        {/* Platform pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex items-center gap-3 mb-2 relative z-10">
          {[{ icon: Instagram, label: "Instagram Reels", color: "#14BBA6" }, { icon: Youtube, label: "YouTube Shorts", color: "#FF6B6B" }].map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl dm text-xs"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted }}>
              <p.icon className="w-3.5 h-3.5" style={{ color: p.color }} /> {p.label}
            </div>
          ))}
        </motion.div>

        {/* ── ORBIT RING — front half only ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}
          className="relative z-10 w-full" style={{ maxWidth: 720 }}>
          {floatingEmojis.map(e => (
            <div key={e.id} className="float-emoji"
              style={{
                left: `${e.x}%`, top: `${e.y}%`,
                "--dx": `${e.dx}px`, "--dx2": `${e.dx * 1.5}px`,
                "--rot": `${(Math.random() - 0.5) * 30}deg`,
                "--rot2": `${(Math.random() - 0.5) * 60}deg`,
              } as any}>
              {e.emoji}
            </div>
          ))}
          <canvas ref={canvasRef} width={720} height={300}
            style={{ width: "100%", height: "auto", display: "block" }} />
        </motion.div>

        <motion.button animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
          onClick={() => scrollTo("features")}
          className="flex flex-col items-center gap-1.5 mt-2 relative z-10 bg-transparent border-none cursor-pointer"
          style={{ color: C.muted }}>
          <span className="dm text-xs" style={{ letterSpacing: ".14em" }}>EXPLORE</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{ val: "20+", label: "Niches Covered" }, { val: "10K+", label: "Scripts Generated" }, { val: "154", label: "Trending Daily" }, { val: "99%", label: "Creator Satisfaction" }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.09 }}>
              <p className="cg font-bold teal-text" style={{ fontSize: 42 }}>{s.val}</p>
              <p className="dm text-xs mt-1" style={{ color: C.muted, letterSpacing: ".06em" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 md:px-16 py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
            <p className="dm text-xs uppercase mb-3" style={{ color: IG, letterSpacing: ".2em" }}>Features</p>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2 className="cg font-bold" style={{ fontSize: "clamp(36px,5vw,60px)", color: C.text, lineHeight: 1.1 }}>
                Everything You Need<br /><span className="italic teal-text">to Go Viral</span>
              </h2>
              <p className="dm text-sm max-w-xs" style={{ color: C.muted, lineHeight: 1.7 }}>
                AI tools built specifically for Indian content creators.
              </p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="feature-card rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "#14BBA610", border: "1px solid #14BBA625" }}>
                    <f.icon className="w-5 h-5" style={{ color: IG }} />
                  </div>
                  <span className="dm text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "#14BBA610", color: IG, border: "1px solid #14BBA625" }}>{f.tag}</span>
                </div>
                <h3 className="dm font-semibold text-base mb-2" style={{ color: C.text }}>{f.title}</h3>
                <p className="dm text-sm leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="howitworks" style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }} className="px-6 md:px-16 py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <p className="dm text-xs uppercase mb-3" style={{ color: IG, letterSpacing: ".2em" }}>Process</p>
            <h2 className="cg font-bold" style={{ fontSize: "clamp(36px,5vw,60px)", color: C.text }}>
              From Zero to <span className="italic teal-text">Viral</span><br />in 4 Steps
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
                  <div className="cg font-bold text-4xl mb-4 teal-text">{s.num}</div>
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
            <p className="dm text-xs uppercase mb-3" style={{ color: IG, letterSpacing: ".2em" }}>Testimonials</p>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2 className="cg font-bold" style={{ fontSize: "clamp(36px,5vw,60px)", color: C.text, lineHeight: 1.1 }}>
                Loved by <span className="italic teal-text">Creators</span><br />Across India
              </h2>
              <div className="flex items-center gap-2 dm text-sm" style={{ color: C.muted }}>
                <Users className="w-4 h-4" style={{ color: IG }} /> 10,000+ active creators
              </div>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5" style={{ fill: IG, color: IG }} />
                  ))}
                </div>
                <p className="dm text-sm leading-relaxed mb-5" style={{ color: C.muted }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center dm text-xs font-bold text-white"
                    style={{ background: IG_GRAD }}>{t.avatar}</div>
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
      <section id="pricing" style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }} className="px-6 md:px-16 py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="dm text-xs uppercase mb-3" style={{ color: IG, letterSpacing: ".2em" }}>Pricing</p>
            <h2 className="cg font-bold mb-3" style={{ fontSize: "clamp(36px,5vw,60px)", color: C.text }}>
              Simple, <span className="italic teal-text">Honest</span> Pricing
            </h2>
            <p className="dm text-sm" style={{ color: C.muted }}>Start free. Upgrade only when you're ready.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="plan-card rounded-2xl p-6 flex flex-col relative"
                style={{
                  background: C.bg,
                  border: `1px solid ${plan.badge === "Most Popular" ? G + "50" : plan.badge === "Best Value" ? IG + "50" : C.border}`,
                }}>

                {plan.badge && (
                  <motion.div animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full dm text-xs font-semibold whitespace-nowrap flex items-center gap-1"
                    style={{ background: plan.badgeColor!, color: plan.badge === "Most Popular" ? "#111" : "#fff" }}>
                    {plan.badge === "Most Popular" ? <Crown className="w-3 h-3" /> : "✦"} {plan.badge}
                  </motion.div>
                )}

                <div className="mt-2 mb-4">
                  <p className="dm text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.muted, letterSpacing: ".14em" }}>{plan.label}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="cg font-bold" style={{
                      fontSize: 48, lineHeight: 1,
                      color: plan.id === "annual" ? G : plan.id === "free" ? C.text : IG,
                    }}>{plan.price}</span>
                    <span className="dm text-xs mb-1.5" style={{ color: C.muted }}>{plan.period}</span>
                  </div>
                  <p className="dm text-xs" style={{ color: C.muted }}>{plan.desc}</p>
                </div>

                <div className="w-full h-px mb-4" style={{ background: C.border }} />

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: plan.id === "annual" ? `${G}20` : `${IG}20` }}>
                        <Check className="w-2.5 h-2.5" style={{ color: plan.id === "annual" ? G : IG }} />
                      </div>
                      <span className="dm text-xs leading-relaxed" style={{ color: C.muted }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: plan.id === "free" ? 1 : 1.03 }}
                  whileTap={{ scale: plan.id === "free" ? 1 : 0.97 }}
                  onClick={() => navigate("/signup")}
                  className="w-full py-3 rounded-xl dm font-semibold text-xs flex items-center justify-center gap-1.5"
                  style={
                    plan.ctaStyle === "gold"
                      ? { background: GOLD, color: "#111" }
                      : plan.ctaStyle === "teal"
                      ? { background: IG_GRAD, color: "#fff" }
                      : { border: `1px solid ${C.border}`, color: C.muted, background: "transparent" }
                  }>
                  {plan.id !== "free" && <ArrowRight className="w-3.5 h-3.5" />}
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="dm text-xs text-center mt-6" style={{ color: C.muted }}>
            All payments secured by Razorpay · UPI · Cards · Netbanking
          </motion.p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-16 py-32 relative overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.09, 0.04] }} transition={{ duration: 9, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, #14BBA6, transparent 65%)", filter: "blur(80px)" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center relative z-10">
          <p className="dm text-xs uppercase mb-4" style={{ color: IG, letterSpacing: ".2em" }}>Get Started</p>
          <h2 className="cg font-bold mb-5" style={{ fontSize: "clamp(44px,7vw,88px)", color: C.text, lineHeight: 1.05 }}>
            Ready to<br /><span className="italic teal-text">Go Viral?</span>
          </h2>
          <p className="dm text-base mb-10 max-w-md mx-auto" style={{ color: C.muted, lineHeight: 1.7 }}>
            Join 10,000+ Indian creators using SocialRum to grow faster on Instagram and YouTube.
          </p>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 50px #14BBA635" }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 px-12 py-5 rounded-2xl dm font-semibold text-base mx-auto text-white"
            style={{ background: IG_GRAD }}>
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