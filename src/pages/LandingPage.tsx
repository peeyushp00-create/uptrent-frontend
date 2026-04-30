import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, Sparkles, Newspaper, FileText,
  Check, Star, ArrowRight, Zap, Target,
  Instagram, Youtube, ChevronDown, Play,
  BarChart2, Users, Flame, Menu, X
} from "lucide-react";

const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const G = "#E8B84B";
const C = { bg: "#0A0A0A", card: "#141414", card2: "#1A1A1A", border: "#222", text: "#F0EAD6", muted: "#5A5A5A", subtle: "#1E1E1E" };

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
  { num: "01", title: "Pick Your Niche", desc: "Tell Uptrent your content niche — finance, fitness, comedy, tech or any of 20+ categories." },
  { num: "02", title: "Discover Trends", desc: "See what's trending right now in your niche across Instagram Reels and YouTube Shorts." },
  { num: "03", title: "Generate Content", desc: "One click to get a full script, viral hook, SEO tags or content ideas — ready to film." },
  { num: "04", title: "Go Viral", desc: "Post with confidence knowing your content is built on real data and AI-powered strategy." },
];

const testimonials = [
  { name: "Rahul Sharma", handle: "@rahulfinance", niche: "Finance · 280K", text: "Uptrent helped me go from 5K to 50K in 3 months. The trending topics feature is insane — I always post at the right time.", avatar: "RS", stars: 5 },
  { name: "Priya Mehta", handle: "@priyafitness", niche: "Fitness · 120K", text: "Script generation alone saves me 4 hours a week. The hooks it writes are actually better than what I used to write myself.", avatar: "PM", stars: 5 },
  { name: "Arjun Kapoor", handle: "@arjuntech", niche: "Tech · 95K", text: "The SEO optimizer took my YouTube views from 2K to 40K per video. I wish I had this 2 years ago.", avatar: "AK", stars: 5 },
  { name: "Sneha Rao", handle: "@snehalifestyle", niche: "Lifestyle · 67K", text: "Finally a tool made for Indian creators. The Hinglish script option alone is worth the subscription.", avatar: "SR", stars: 5 },
  { name: "Vikram Das", handle: "@vikramcricket", niche: "Cricket · 210K", text: "I post IPL content and Uptrent's live news feed means I'm always first. My engagement doubled.", avatar: "VD", stars: 5 },
  { name: "Anjali Nair", handle: "@anjalifood", niche: "Food · 88K", text: "The channel analyzer showed me exactly what top food creators do differently. Changed my whole strategy.", avatar: "AN", stars: 5 },
];

const freeF = ["3 script generations/month", "Basic trending topics", "News feed (5 articles/day)", "AI chat (5 messages/day)"];
const proF = ["Unlimited script generations", "Full trending data — 20+ niches", "Complete news feed", "Unlimited AI chat", "YouTube SEO optimizer", "Channel analyzer", "Instagram analyzer", "Priority support"];

const WORDS = ["Discover.", "Create.", "Go Viral."];

export default function LandingPage() {
  const navigate = useNavigate();
  const [wordIdx, setWordIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [annual, setAnnual] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const i = setInterval(() => setWordIdx(w => (w + 1) % WORDS.length), 2200);
    return () => clearInterval(i);
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
        .gold-text { background: linear-gradient(135deg,#E8B84B,#C17D20); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .grain { position:fixed; inset:0; pointer-events:none; z-index:1; opacity:0.025; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size:200px; }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#2a2a2a; border-radius:4px; }
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px; background:#E8B84B; transition:.3s; }
        .nav-link:hover::after { width:100%; }
        .nav-link:hover { color:#E8B84B !important; }
        .feature-card:hover { border-color:#E8B84B25 !important; transform:translateY(-4px); }
        .feature-card { transition: all .25s ease; }
        .testi-card:hover { border-color:#E8B84B20 !important; }
      `}</style>

      {/* Grain overlay */}
      <div className="grain" />

      {/* ── NAVBAR ── */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="flex items-center justify-between px-6 md:px-16 py-5 fixed top-0 left-0 right-0 z-50"
        style={{ background: `${C.bg}cc`, borderBottom: `1px solid ${C.border}20`, backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <motion.img whileHover={{ rotate: 8, scale: 1.05 }} src="/logo.png" alt="Uptrent" className="w-8 h-8 rounded-xl" />
          <span className="cg font-bold text-xl" style={{ color: C.text, letterSpacing: ".01em" }}>Uptrent</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)}
              className="nav-link dm text-sm bg-transparent border-none cursor-pointer transition-colors"
              style={{ color: C.muted }}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="dm text-sm transition-colors nav-link" style={{ color: C.muted }}>Login</button>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 24px #E8B84B30" }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="dm px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: GOLD, color: "#0A0A0A" }}>
            Start Free
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{ color: C.muted }}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 p-4 flex flex-col gap-2"
            style={{ background: C.card, border: `1px solid ${C.border}`, margin: "0 16px", borderRadius: "16px" }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="dm text-sm py-2.5 text-left transition-colors" style={{ color: C.muted }}>{l.label}</button>
            ))}
            <div className="border-t my-1" style={{ borderColor: C.border }} />
            <button onClick={() => navigate("/signup")} className="dm py-3 rounded-xl text-sm font-semibold text-center" style={{ background: GOLD, color: "#0A0A0A" }}>Start Free</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative flex flex-col items-center text-center px-6 pt-36 pb-20 overflow-hidden" style={{ minHeight: "100vh" }}>
        {/* BG glow */}
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, #E8B84B, transparent 65%)", filter: "blur(80px)" }} />
        <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.03, 0.07, 0.03] }} transition={{ duration: 14, repeat: Infinity, delay: 4 }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(circle, #C17D20, transparent 70%)", filter: "blur(100px)" }} />

        {/* Decorative grid lines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(${C.border}40 1px, transparent 1px), linear-gradient(90deg, ${C.border}40 1px, transparent 1px)`,
          backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)"
        }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center gap-7 max-w-4xl relative z-10">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-2 px-5 py-2 rounded-full dm text-xs font-medium"
            style={{ background: "#E8B84B0D", border: "1px solid #E8B84B25", color: G, letterSpacing: ".12em" }}>
            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: G }} />
            <Sparkles className="w-3 h-3" />
            BUILT FOR INDIA'S CREATORS
          </motion.div>

          {/* Headline */}
          <div>
            <motion.p initial={{ opacity: 0, letterSpacing: "0.6em" }} animate={{ opacity: 1, letterSpacing: "0.22em" }} transition={{ delay: 0.3, duration: 1 }}
              className="dm text-xs uppercase mb-3" style={{ color: "#383838", letterSpacing: "0.22em" }}>
              The AI Creator Toolkit
            </motion.p>
            <div className="cg font-bold leading-none" style={{ fontSize: "clamp(56px, 9vw, 110px)", minHeight: "1.25em" }}>
              <AnimatePresence mode="wait">
                <motion.span key={wordIdx}
                  initial={{ opacity: 0, y: 30, letterSpacing: "0.4em", filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.01em", filter: "blur(0)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className={wordIdx === 1 ? "gold-text italic" : wordIdx === 2 ? "italic" : ""}
                  style={{ display: "inline-block", color: wordIdx === 0 ? C.text : wordIdx === 2 ? "#C17D20" : undefined }}>
                  {WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="dm text-base md:text-lg max-w-lg leading-relaxed" style={{ color: C.muted }}>
            Trending topics, AI scripts, SEO tools and news — everything an Indian Instagram and YouTube creator needs in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="flex items-center gap-4 flex-wrap justify-center">
            <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 40px #E8B84B35" }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl dm font-semibold text-base"
              style={{ background: GOLD, color: "#0A0A0A" }}>
              Start for Free <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, borderColor: "#E8B84B40" }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl dm font-medium text-base transition-all"
              style={{ border: `1px solid ${C.border}`, background: C.card, color: C.text }}>
              <Play className="w-4 h-4" style={{ color: G }} /> See Demo
            </motion.button>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="dm text-xs" style={{ color: "#303030" }}>
            No credit card · Free forever plan · 10,000+ creators
          </motion.p>

          {/* Platform pills */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
            className="flex items-center gap-3">
            {[{ icon: Instagram, label: "Instagram Reels" }, { icon: Youtube, label: "YouTube Shorts" }].map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl dm text-xs"
                style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted }}>
                <p.icon className="w-3.5 h-3.5" style={{ color: G }} /> {p.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero mockup */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mt-16 relative z-10">
          {/* Glow under mockup */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 rounded-full pointer-events-none"
            style={{ background: "#E8B84B", filter: "blur(40px)", opacity: 0.08 }} />
          <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ background: "#0E0E0E", borderBottom: `1px solid ${C.border}` }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F56" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#27C93F" }} />
              </div>
              <div className="flex-1 mx-6 px-4 py-1.5 rounded-lg dm text-xs text-center" style={{ background: C.bg, color: "#383838" }}>
                app.uptrent.com/trending
              </div>
              <div className="flex items-center gap-2 dm text-xs" style={{ color: "#383838" }}>
                <Sparkles className="w-3 h-3" style={{ color: G }} /> AI Active
              </div>
            </div>
            {/* Mockup content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { topic: "Fitness & Gym", posts: "2.4K posts", trend: "🔥 Hot", score: 95, tag: "Fitness" },
                { topic: "Stock Market", posts: "1.8K posts", trend: "📈 Rising", score: 82, tag: "Finance" },
                { topic: "Cricket & IPL", posts: "3.1K posts", trend: "🔥 Hot", score: 98, tag: "Cricket" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.15 }}
                  className="rounded-xl p-4" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="dm text-xs px-2 py-0.5 rounded-full" style={{ background: "#E8B84B12", color: G }}>#{item.tag}</span>
                    <span className="dm text-xs" style={{ color: C.muted }}>{item.trend}</span>
                  </div>
                  <p className="dm font-semibold text-sm mb-1" style={{ color: C.text }}>{item.topic}</p>
                  <p className="dm text-xs mb-3" style={{ color: C.muted }}>{item.posts}</p>
                  <div className="w-full h-1 rounded-full" style={{ background: C.border }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ delay: 1.2 + i * 0.2, duration: 1 }}
                      className="h-1 rounded-full" style={{ background: GOLD }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="dm text-xs" style={{ color: C.muted }}>Trend Score</span>
                    <span className="dm text-xs font-semibold" style={{ color: G }}>{item.score}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Bottom bar */}
            <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: `1px solid ${C.border}`, background: "#0E0E0E" }}>
              <div className="flex items-center gap-4">
                {[{ icon: TrendingUp, label: "154 Topics" }, { icon: FileText, label: "Scripts" }, { icon: BarChart2, label: "Analytics" }].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 dm text-xs" style={{ color: C.muted }}>
                    <item.icon className="w-3 h-3" style={{ color: G }} />{item.label}
                  </div>
                ))}
              </div>
              <div className="dm text-xs px-3 py-1 rounded-full" style={{ background: "#E8B84B12", color: G }}>● Live</div>
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.button animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
          onClick={() => scrollTo("features")}
          className="flex flex-col items-center gap-1.5 mt-16 relative z-10 bg-transparent border-none cursor-pointer" style={{ color: C.muted }}>
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
                className="feature-card rounded-2xl p-6 cursor-default"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#E8B84B0D", border: "1px solid #E8B84B20" }}>
                    <f.icon className="w-5 h-5" style={{ color: G }} />
                  </div>
                  <span className="dm text-xs px-2.5 py-1 rounded-full" style={{ background: "#E8B84B0D", color: G, border: "1px solid #E8B84B20" }}>{f.tag}</span>
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
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px -translate-y-1/2 z-0" style={{ background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
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
                className="testi-card rounded-2xl p-6 transition-all"
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
      <section id="pricing" style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }} className="px-6 md:px-16 py-28">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="dm text-xs uppercase mb-3" style={{ color: G, letterSpacing: ".2em" }}>Pricing</p>
            <h2 className="cg font-bold mb-4" style={{ fontSize: "clamp(36px,5vw,60px)", color: C.text }}>
              Simple, <span className="italic gold-text">Honest</span> Pricing
            </h2>
            <p className="dm text-sm" style={{ color: C.muted }}>Start free. Upgrade only when you're ready.</p>
            {/* Annual toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="dm text-sm" style={{ color: annual ? C.muted : C.text }}>Monthly</span>
              <button onClick={() => setAnnual(!annual)}
                className="w-12 h-6 rounded-full transition-all relative"
                style={{ background: annual ? GOLD : C.border }}>
                <motion.div animate={{ x: annual ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white" />
              </button>
              <span className="dm text-sm" style={{ color: annual ? C.text : C.muted }}>
                Annual <span className="dm text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "#E8B84B15", color: G }}>Save 30%</span>
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
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

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              whileHover={{ boxShadow: "0 0 60px #E8B84B12" }}
              className="rounded-2xl p-8 relative transition-all"
              style={{ background: C.bg, border: `1px solid #E8B84B40` }}>
              <motion.div animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full dm text-xs font-semibold"
                style={{ background: GOLD, color: "#0A0A0A" }}>
                ✦ Most Popular
              </motion.div>
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
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center relative z-10">
          <p className="dm text-xs uppercase mb-4" style={{ color: G, letterSpacing: ".2em" }}>Get Started</p>
          <h2 className="cg font-bold mb-5" style={{ fontSize: "clamp(44px,7vw,88px)", color: C.text, lineHeight: 1.05 }}>
            Ready to<br /><span className="italic gold-text">Go Viral?</span>
          </h2>
          <p className="dm text-base mb-10 max-w-md mx-auto" style={{ color: C.muted, lineHeight: 1.7 }}>
            Join 10,000+ Indian creators using Uptrent to grow faster on Instagram and YouTube.
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
            <img src="/logo.png" alt="Uptrent" className="w-7 h-7 rounded-lg" />
            <span className="cg font-bold text-lg" style={{ color: C.text }}>Uptrent</span>
          </div>
          <div className="flex items-center gap-6 dm text-xs" style={{ color: C.muted }}>
            <span className="nav-link cursor-pointer">Privacy Policy</span>
            <span className="nav-link cursor-pointer">Terms of Service</span>
            <span className="nav-link cursor-pointer">Contact</span>
          </div>
          <p className="dm text-xs" style={{ color: "#2A2A2A" }}>© 2026 Uptrent Media. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}