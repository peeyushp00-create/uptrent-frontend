import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, Sparkles, Newspaper, FileText,
  Check, Star, ArrowRight, Zap, Target,
  Instagram, Youtube, Play, ChevronDown
} from "lucide-react";

const GOLD = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const GOLD_SOLID = "#3B82F6";
const C = {
  bg: "#111111", card: "#1C1C1C", border: "#2E2E2E",
  text: "#EDE0C8", muted: "#6B6B6B", subtle: "#242424"
};

const features = [
  { icon: TrendingUp, title: "Trending Topics", description: "Discover what's trending across 20+ niches in real time." },
  { icon: Sparkles, title: "AI Script Generator", description: "Generate ready-to-film scripts with hooks, body and CTA in seconds." },
  { icon: Newspaper, title: "Live News Feed", description: "Stay updated with the latest news to create timely content." },
  { icon: FileText, title: "Content Ideas", description: "Get AI-powered content suggestions tailored to your niche." },
  { icon: Target, title: "SEO Optimization", description: "Find the best titles, descriptions and tags for maximum reach." },
  { icon: Zap, title: "Quick Hooks", description: "Generate viral hooks that stop the scroll in the first 3 seconds." },
];

const testimonials = [
  { name: "Rahul Sharma", handle: "@rahulfinance", niche: "Finance Creator", text: "Uptrent helped me grow from 5K to 50K followers in 3 months. The trending topics feature is a game changer!", avatar: "RS", stars: 5 },
  { name: "Priya Mehta", handle: "@priyafitness", niche: "Fitness Creator", text: "I used to spend hours writing scripts. Now Uptrent generates them in seconds and they perform way better!", avatar: "PM", stars: 5 },
  { name: "Arjun Kapoor", handle: "@arjuntech", niche: "Tech Creator", text: "The AI chat feature is incredible. It's like having a personal content strategist available 24/7.", avatar: "AK", stars: 5 },
];

const freeFeatures = ["3 script generations per month", "Limited trending topics", "Basic news feed", "AI chat (5 messages/day)"];
const proFeatures = ["Unlimited script generations", "Full trending data (20+ niches)", "Complete news feed", "Unlimited AI chat", "SEO optimization", "Content calendar", "Priority support"];

const STATS = [
  { value: "20+", label: "Niches Covered" },
  { value: "10K+", label: "Scripts Generated" },
  { value: "154", label: "Trending Topics" },
  { value: "99%", label: "Creator Satisfaction" },
];

const HEADLINE_WORDS = ["Discover.", "Create.", "Go Viral."];

const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "Testimonials", id: "testimonials" },
  { label: "Pricing", id: "pricing" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const i = setInterval(() => setWordIndex(w => (w + 1) % HEADLINE_WORDS.length), 2000);
    return () => clearInterval(i);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,700&display=swap');
        .cg { font-family: 'Cormorant Garamond', serif !important; }
        .gold-text { background: linear-gradient(135deg, #3B82F6, #1D4ED8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hover-gold:hover { color: #3B82F6 !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between px-6 md:px-16 py-4 sticky top-0 z-50"
        style={{ background: `${C.bg}ee`, borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2">
          <motion.img whileHover={{ rotate: 10 }} src="/logo.png" alt="Uptrent" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg cg" style={{ color: C.text }}>Uptrent</span>
        </div>

        {/* ✅ Nav links with scroll-to */}
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: C.muted }}>
          {NAV_LINKS.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="hover-gold cursor-pointer transition-colors bg-transparent border-none outline-none"
              style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="px-4 py-2 text-sm transition-colors hover-gold" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>
            Login
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: GOLD, color: "#111", fontFamily: "Inter, sans-serif" }}
          >
            Get Started Free
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative flex flex-col items-center text-center px-6 py-24 md:py-36 gap-10 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.09, 0.04] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #3B82F6, transparent 65%)", filter: "blur(60px)" }}
        />
        <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 14, repeat: Infinity, delay: 3 }}
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #1D4ED8, transparent 70%)", filter: "blur(80px)" }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center gap-8 max-w-4xl relative z-10">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium uppercase"
            style={{ background: "#3B82F612", border: "1px solid #3B82F630", color: GOLD_SOLID, letterSpacing: "0.14em" }}
          >
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD_SOLID }} />
            <Sparkles className="w-3 h-3" />
            AI-Powered · Built for Indian Creators
          </motion.div>

          {/* Headline */}
          <div className="flex flex-col items-center gap-2">
            <motion.p initial={{ opacity: 0, letterSpacing: "0.5em" }} animate={{ opacity: 1, letterSpacing: "0.2em" }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-xs uppercase tracking-widest" style={{ color: "#3A3A3A", fontFamily: "Inter, sans-serif" }}>
              The Creator's AI Toolkit
            </motion.p>
            <div className="cg text-6xl md:text-8xl font-bold" style={{ minHeight: "1.3em" }}>
              <AnimatePresence mode="wait">
                <motion.span key={wordIndex}
                  initial={{ opacity: 0, y: 24, letterSpacing: "0.35em", filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.01em", filter: "blur(0)" }}
                  exit={{ opacity: 0, y: -18, letterSpacing: "0.18em", filter: "blur(5px)" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className={wordIndex === 1 ? "gold-text italic" : wordIndex === 2 ? "italic" : ""}
                  style={{ display: "inline-block", color: wordIndex === 0 ? C.text : wordIndex === 2 ? "#1D4ED8" : undefined }}
                >
                  {HEADLINE_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base md:text-lg max-w-xl mt-2" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>
              Discover trending topics, generate AI scripts, find viral hashtags and grow your audience — all in one platform.
            </motion.p>
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center gap-4 flex-wrap justify-center">
            <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 30px #3B82F630" }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base"
              style={{ background: GOLD, color: "#111", fontFamily: "Inter, sans-serif" }}>
              Start for Free <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, borderColor: "#3B82F650" }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-medium text-base transition-all"
              style={{ border: `1px solid ${C.border}`, background: C.card, color: C.text, fontFamily: "Inter, sans-serif" }}>
              <Play className="w-4 h-4" style={{ color: GOLD_SOLID }} /> Watch Demo
            </motion.button>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
            className="text-xs" style={{ color: "#3A3A3A", fontFamily: "Inter, sans-serif" }}>
            No credit card required · Free plan available · 10,000+ creators
          </motion.p>

          {/* Platform badges */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5 }}
            className="flex items-center gap-4">
            {[{ icon: Instagram, label: "Instagram" }, { icon: Youtube, label: "YouTube" }].map((p, i) => (
              <motion.div key={i} whileHover={{ scale: 1.06, borderColor: "#3B82F650" }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
                style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, fontFamily: "Inter, sans-serif" }}>
                <p.icon className="w-4 h-4" style={{ color: GOLD_SOLID }} /> {p.label}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Mockup */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl relative z-10 mt-4">
          <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${C.border}`, background: "#171717" }}>
              <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F56" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#27C93F" }} />
              <div className="flex-1 mx-4 px-3 py-1 rounded-lg text-xs text-center" style={{ background: C.bg, color: C.muted, fontFamily: "Inter, sans-serif" }}>uptrent.app</div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { topic: "Fitness & Gym", posts: "2.4K posts", trend: "🔥 Hot", score: 95 },
                { topic: "Stock Market", posts: "1.8K posts", trend: "📈 Rising", score: 82 },
                { topic: "Cricket & IPL", posts: "3.1K posts", trend: "🔥 Hot", score: 98 },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                  whileHover={{ borderColor: "#3B82F640", scale: 1.02 }}
                  className="rounded-xl p-4 transition-all"
                  style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-4 h-4" style={{ color: GOLD_SOLID }} />
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#3B82F615", color: GOLD_SOLID, fontFamily: "Inter, sans-serif" }}>{item.trend}</span>
                  </div>
                  <p className="font-semibold text-sm mb-1" style={{ color: C.text, fontFamily: "Inter, sans-serif" }}>{item.topic}</p>
                  <p className="text-xs mb-3" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>{item.posts}</p>
                  <div className="w-full h-1 rounded-full" style={{ background: C.border }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ delay: 1 + i * 0.2, duration: 0.8 }}
                      className="h-1 rounded-full" style={{ background: GOLD }} />
                  </div>
                  <p className="text-xs mt-1 text-right" style={{ color: GOLD_SOLID, fontFamily: "Inter, sans-serif" }}>{item.score}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          onClick={() => scrollTo("features")}
          className="flex flex-col items-center gap-1 mt-4 bg-transparent border-none cursor-pointer" style={{ color: C.muted }}>
          <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.12em" }}>SCROLL</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.card }}>
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <p className="text-4xl font-bold cg gold-text">{s.value}</p>
              <p className="text-sm mt-1" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 md:px-16 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD_SOLID, letterSpacing: "0.18em", fontFamily: "Inter, sans-serif" }}>Features</p>
            <h2 className="cg text-4xl md:text-5xl font-bold mb-4" style={{ color: C.text }}>Everything to Go Viral</h2>
            <p className="text-base" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>Powerful AI tools built specifically for Indian content creators</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                whileHover={{ borderColor: "#3B82F640", y: -4 }}
                className="rounded-2xl p-6 transition-all cursor-default"
                style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "#3B82F615", border: "1px solid #3B82F625" }}>
                  <f.icon className="w-5 h-5" style={{ color: GOLD_SOLID }} />
                </motion.div>
                <h3 className="font-semibold mb-2" style={{ color: C.text, fontFamily: "Inter, sans-serif" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }} className="px-6 md:px-16 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD_SOLID, letterSpacing: "0.18em", fontFamily: "Inter, sans-serif" }}>Testimonials</p>
            <h2 className="cg text-4xl md:text-5xl font-bold mb-4" style={{ color: C.text }}>Loved by Creators</h2>
            <p className="text-base" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>See what creators across India are saying</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ borderColor: "#3B82F630", y: -4 }}
                className="rounded-2xl p-6 transition-all"
                style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: GOLD, color: "#111" }}>{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: C.text, fontFamily: "Inter, sans-serif" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>{t.niche}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-6 md:px-16 py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD_SOLID, letterSpacing: "0.18em", fontFamily: "Inter, sans-serif" }}>Pricing</p>
            <h2 className="cg text-4xl md:text-5xl font-bold mb-4" style={{ color: C.text }}>Simple Pricing</h2>
            <p className="text-base" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>Start free, upgrade when you're ready</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="rounded-2xl p-8" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <h3 className="cg font-bold text-2xl mb-1" style={{ color: C.text }}>Free</h3>
              <p className="text-sm mb-5" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>Perfect to get started</p>
              <div className="mb-6">
                <span className="cg text-5xl font-bold" style={{ color: C.text }}>₹0</span>
                <span className="text-sm ml-1" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: GOLD_SOLID }} />{f}
                  </li>
                ))}
              </ul>
              <motion.button whileHover={{ borderColor: "#3B82F650", color: GOLD_SOLID }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all"
                style={{ border: `1px solid ${C.border}`, color: C.text, fontFamily: "Inter, sans-serif" }}>
                Get Started Free
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              whileHover={{ boxShadow: "0 0 40px #3B82F615" }}
              className="rounded-2xl p-8 relative transition-all"
              style={{ background: C.card, border: `1px solid #3B82F650` }}>
              <motion.div animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: GOLD, color: "#111", fontFamily: "Inter, sans-serif" }}>
                ✦ Most Popular
              </motion.div>
              <h3 className="cg font-bold text-2xl mb-1" style={{ color: C.text }}>Pro</h3>
              <p className="text-sm mb-5" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>For serious creators</p>
              <div className="mb-6">
                <span className="cg text-5xl font-bold gold-text">₹799</span>
                <span className="text-sm ml-1" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {proFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: GOLD_SOLID }} />{f}
                  </li>
                ))}
              </ul>
              <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 24px #3B82F630" }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-xl font-semibold text-sm"
                style={{ background: GOLD, color: "#111", fontFamily: "Inter, sans-serif" }}>
                Start Pro Trial
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: C.card, borderTop: `1px solid ${C.border}` }} className="px-6 md:px-16 py-24 relative overflow-hidden">
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.07, 0.03] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #3B82F6, transparent 65%)", filter: "blur(60px)" }}
        />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: GOLD_SOLID, letterSpacing: "0.18em", fontFamily: "Inter, sans-serif" }}>Get Started</p>
          <h2 className="cg text-4xl md:text-6xl font-bold mb-4" style={{ color: C.text }}>Ready to Go Viral?</h2>
          <p className="text-base mb-8" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>
            Join 10,000+ creators using Uptrent to grow faster on Instagram and YouTube
          </p>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 40px #3B82F630" }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 px-10 py-4 rounded-2xl font-semibold text-base mx-auto"
            style={{ background: GOLD, color: "#111", fontFamily: "Inter, sans-serif" }}>
            Start for Free Today <ArrowRight className="w-4 h-4" />
          </motion.button>
          <p className="text-xs mt-4" style={{ color: "#3A3A3A", fontFamily: "Inter, sans-serif" }}>No credit card · Free forever plan · Cancel anytime</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-16 py-8" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Uptrent" className="w-6 h-6 rounded" />
            <span className="font-bold text-sm cg" style={{ color: C.text }}>Uptrent</span>
          </div>
          <p className="text-xs" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>© 2026 Uptrent Media. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs" style={{ color: C.muted, fontFamily: "Inter, sans-serif" }}>
            <span className="hover-gold cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover-gold cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
