import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, TrendingUp, FileText, BarChart2, ArrowRight, Sparkles, Instagram, Youtube, ChevronRight } from "lucide-react";
import { useState } from "react";

const PRIMARY = "#24389c";
const SECONDARY = "#6f48b2";
const PRIMARY_GRAD = "linear-gradient(135deg, #24389c, #6f48b2)";
const PRIMARY_CONTAINER = "#dee0ff";
const SECONDARY_CONTAINER = "#ede7f6";

const FEATURES = [
  { icon: TrendingUp, label: "Trending Topics", desc: "Real-time data across 20+ niches", color: PRIMARY, bg: PRIMARY_CONTAINER },
  { icon: FileText, label: "Script Generator", desc: "AI scripts in 8 content styles", color: SECONDARY, bg: SECONDARY_CONTAINER },
  { icon: Search, label: "YouTube SEO", desc: "Tags, titles and descriptions", color: "#2e7d32", bg: "#e8f5e9" },
  { icon: BarChart2, label: "Content Analyzer", desc: "Deep profile insights", color: "#e65100", bg: "#fff3e0" },
];

const RECOMMENDED = [
  { platform: "Instagram", title: "Winning Reel Hooks", desc: "Stop-scroll techniques that work", views: "2.5M views", color: SECONDARY, bg: SECONDARY_CONTAINER },
  { platform: "YouTube", title: "Shorts Algorithm Secret", desc: "Get more views in 2026", views: "1.2M views", color: "#ba1a1a", bg: "#ffdad6" },
  { platform: "Instagram", title: "Visual Storytelling Guide", desc: "Make your reels cinematic", views: "800K views", color: SECONDARY, bg: SECONDARY_CONTAINER },
  { platform: "YouTube", title: "SEO Title Formula", desc: "Rank higher with this trick", views: "650K views", color: "#ba1a1a", bg: "#ffdad6" },
];

const TRENDS = [
  { title: "AI Tools for Creators", tag: "Trending Now", desc: "How creators are using AI to 10x content output" },
  { title: "Short-form SEO Hacks", desc: "Boost reach by 40% with these tags" },
  { title: "Visual Aesthetics 2026", desc: "The 'Raw Tech' look is taking over" },
];

const STATS = [
  { value: "20+", label: "Content Niches" },
  { value: "8", label: "Script Styles" },
  { value: "AI", label: "Powered Tools" },
  { value: "Free", label: "To Get Started" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"Instagram" | "YouTube">("Instagram");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecommended = RECOMMENDED.filter(r => r.platform === activeTab);

  return (
    <div className="min-h-screen bg-[#f8f9fa]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e1e3e4] px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SocialRum" className="w-8 h-8 rounded-xl" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="font-bold text-xl" style={{ fontFamily: 'Montserrat, sans-serif', color: PRIMARY }}>SocialRum</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#c5c5d4] text-[#454652] hover:border-[#24389c] hover:text-[#24389c] transition-colors">
            Login
          </button>
          <button onClick={() => navigate('/signup')}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:shadow-lg transition-all"
            style={{ background: PRIMARY_GRAD }}>
            Get Started Free
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-6 pb-20 space-y-8">

        {/* ── Greeting / Hero ── */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold leading-tight mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: PRIMARY }}>
            Create Content That Gets Discovered
          </h1>
          <p className="text-[#757684] text-base mb-5">
            AI tools built for Indian creators on Instagram and YouTube. Trending topics, scripts, SEO — all in one place.
          </p>
          <button onClick={() => navigate('/signup')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-bold text-sm hover:shadow-lg transition-all"
            style={{ background: PRIMARY_GRAD }}>
            Start for Free <ArrowRight className="w-4 h-4" />
          </button>
        </motion.section>

        {/* ── Search + Filter ── */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#e1e3e4] p-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757684]" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for reels and videos..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#c5c5d4] bg-[#f8f9fa] text-[#191c1d] placeholder:text-[#757684] outline-none text-sm focus:border-[#24389c] focus:ring-2 focus:ring-[#24389c]/20 transition-all" />
          </div>

          {/* Platform toggle */}
          <div className="flex gap-1 p-1 bg-[#f3f4f5] rounded-xl w-fit">
            {(['Instagram', 'YouTube'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-all"
                style={activeTab === tab ? { background: PRIMARY_GRAD, color: '#fff' } : { color: '#757684' }}>
                {tab === 'Instagram' ? <Instagram className="w-3.5 h-3.5" /> : <Youtube className="w-3.5 h-3.5" />}
                {tab}
              </button>
            ))}
          </div>

          {/* Recommended cards */}
          <div>
            <h3 className="font-bold text-sm text-[#191c1d] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Recommended for You
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {filteredRecommended.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate('/signup')}
                  className="shrink-0 w-52 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] overflow-hidden hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
                  <div className="h-28 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${item.bg}, white)` }}>
                    <Sparkles className="w-8 h-8 opacity-30" style={{ color: item.color }} />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ background: item.color }}>
                      {item.platform}
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm text-[#191c1d] line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-[#757684] mt-0.5">{item.views}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Stats ── */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-4 gap-3">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 border border-[#e1e3e4] text-center">
              <p className="text-xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: i % 2 === 0 ? PRIMARY : SECONDARY }}>{s.value}</p>
              <p className="text-[10px] text-[#757684] font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.section>

        {/* ── Quick Actions ── */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-bold text-base text-[#191c1d] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Our Tools
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <button key={i} onClick={() => navigate('/signup')}
                className="bg-white rounded-2xl p-4 border border-[#e1e3e4] flex flex-col items-center text-center hover:shadow-md transition-all active:scale-[0.98] group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{ background: f.bg }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <p className="font-bold text-xs text-[#191c1d]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{f.label}</p>
                <p className="text-[11px] text-[#757684] mt-0.5">{f.desc}</p>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── Latest Trends ── */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-[#191c1d]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Latest Trends</h3>
            <button onClick={() => navigate('/signup')} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {/* Featured trend */}
            <div onClick={() => navigate('/signup')}
              className="relative overflow-hidden rounded-2xl h-44 cursor-pointer active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}>
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white w-fit mb-2"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  TRENDING NOW
                </span>
                <h4 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {TRENDS[0].title}
                </h4>
                <p className="text-white/70 text-xs mt-1">{TRENDS[0].desc}</p>
              </div>
            </div>

            {/* Other trends */}
            {TRENDS.slice(1).map((t, i) => (
              <button key={i} onClick={() => navigate('/signup')}
                className="bg-white rounded-2xl p-4 border border-[#e1e3e4] flex items-center gap-4 hover:shadow-md transition-all text-left active:scale-[0.98]">
                <div className="w-16 h-16 rounded-xl shrink-0" style={{ background: PRIMARY_CONTAINER }} />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-sm text-[#191c1d]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.title}</h5>
                  <p className="text-xs text-[#757684] mt-0.5">{t.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#757684] shrink-0" />
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 text-center" style={{ background: PRIMARY_GRAD }}>
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Ready to Go Viral?
          </h2>
          <p className="text-white/80 text-sm mb-5">Join Indian creators using SocialRum to grow faster</p>
          <button onClick={() => navigate('/signup')}
            className="bg-white font-bold text-sm px-8 py-3 rounded-full hover:shadow-lg transition-all active:scale-[0.98]"
            style={{ color: PRIMARY }}>
            Get Started Free →
          </button>
          <p className="text-white/50 text-xs mt-3">No credit card required</p>
        </motion.section>

        {/* ── Footer ── */}
        <footer className="text-center pt-4 border-t border-[#e1e3e4]">
          <p className="text-xs text-[#757684]">© 2026 SocialRum · Built for Indian Creators 🇮🇳</p>
        </footer>
      </main>
    </div>
  );
}