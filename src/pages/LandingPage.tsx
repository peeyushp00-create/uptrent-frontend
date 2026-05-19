import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
  { num: '01', title: 'Creator News Feed', desc: 'Curated industry news, platform updates, and creator economy signals — filtered for what actually matters to your niche.', tags: ['YouTube', 'Instagram', 'TikTok'] },
  { num: '02', title: 'AI Script Generator', desc: 'Go from idea to full video script in 60 seconds. Trained on viral hooks, retention patterns, and your channel voice.', tags: ['Hook', 'Body', 'CTA', 'Hinglish'] },
  { num: '03', title: 'Content Analyzer', desc: "Deep-dive analytics on your existing content. Identify what's working, what's losing viewers, and what to create next.", tags: ['Retention', 'Drop-off'] },
  { num: '04', title: 'Trending Topics', desc: 'Real-time trend detection across YouTube and Instagram before they peak — publish first, win the algorithm.', tags: ['#AIVideoEditing ↑ 340%', '#CreatorEconomy ↑ 128%'] },
  { num: '05', title: 'YouTube SEO', desc: 'Keyword research, title optimization, tag suggestions, and thumbnail analysis — everything to rank on page one.', tags: ['Keywords', 'Titles', 'Tags'] },
];

const STEPS = [
  { num: '01', title: 'Connect Your Channels', sub: 'YouTube & Instagram in 2 minutes', desc: 'Link your accounts securely. SocialRum reads your performance data, audience demographics, and content library — no manual uploads needed.', note: 'OAuth 2.0 secure. Read-only access. Revoke anytime.' },
  { num: '02', title: 'Let AI Analyze & Generate', sub: 'Scripts, trends, and SEO — automated', desc: "Our AI engine scans trending topics in your niche, analyzes your top-performing content, and generates scripts tailored to your audience's watch patterns.", note: 'Processes 150+ content signals per channel per day.' },
  { num: '03', title: 'Publish & Rank Faster', sub: 'From insight to upload in record time', desc: 'Act on SEO recommendations, publish optimized content, and track performance gains — all from one dark, distraction-free workspace.', note: 'Avg. 3.2× faster content-to-publish workflow.' },
];

const STATS = [
  { value: '5',    label: 'Creator Tools' },
  { value: '20+',  label: 'Content Niches' },
  { value: 'Free', label: 'Early Access Tier' },
  { value: '100%', label: 'Made for India' },
];

// Minimalist gradient blocks instead of images for the background
const ABSTRACT_CARDS = [
  { id: 1, bg: 'bg-gradient-to-br from-purple-600/20 to-black/40', border: 'border-purple-500/10' },
  { id: 2, bg: 'bg-gradient-to-tr from-indigo-600/20 to-black/40', border: 'border-indigo-500/10' },
  { id: 3, bg: 'bg-gradient-to-bl from-pink-600/10 to-black/40', border: 'border-pink-500/10' },
  { id: 4, bg: 'bg-gradient-to-tl from-purple-800/20 to-black/40', border: 'border-purple-400/10' },
  { id: 5, bg: 'bg-gradient-to-r from-violet-600/20 to-black/40', border: 'border-violet-500/10' },
];

const TypingScript = () => {
  const hooks = ["Generating viral hook...", "Analyzing retention metrics...", "Structuring body layout...", "Optimizing keyword vectors..."];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % hooks.length), 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <motion.span key={index} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.3 }}>
      {hooks[index]}
    </motion.span>
  );
};

export default function LandingPage() {
 const rootRef = useRef<HTMLDivElement>(null);
const emailRef = useRef<HTMLInputElement>(null);
const otpRef = useRef<HTMLInputElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [step, setStep] = useState('email');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen bg-[#03000a] text-white font-sans overflow-x-hidden selection:bg-purple-500/30">
      
      {/* 1. DYNAMIC AURORA BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-700/20 blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-800/20 blur-[140px]"
        />
        {/* Subtle Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-20 transition-all duration-500 ${scrolled ? 'bg-[#03000a]/70 backdrop-blur-xl border-b border-purple-500/10 shadow-lg' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-[#03000a] rounded-[7px] flex items-center justify-center">
              <div className="w-2 h-2 rounded-sm bg-purple-400 shadow-[0_0_10px_#a855f7]" />
            </div>
          </div>
          <span className="font-bold tracking-tight text-lg">SocialRum</span>
        </div>
        <ul className="hidden lg:flex items-center gap-10 list-none text-sm text-gray-400 font-medium">
          {['Features', 'How It Works', 'Early Access'].map(item => (
            <li key={item}><a href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors duration-300">{item}</a></li>
          ))}
        </ul>
        <a href="#early-access" className="bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 backdrop-blur-md">
          Be the First to Know
        </a>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-16 z-10 pt-20 overflow-hidden">
        
        {/* 2. THE BACKGROUND REELS (Abstract Minimalist Stream) */}
        <div className="absolute left-[-20%] md:left-[-10%] top-[-20%] w-[120%] h-[140%] z-0 pointer-events-none opacity-30 md:opacity-40 rotate-[-12deg] blur-[1px]">
          <div className="flex gap-4 lg:gap-8 h-full">
            {/* Abstract Lane 1 */}
            <motion.div animate={{ y: [0, -1000] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex flex-col gap-6 w-1/3 pt-[200px]">
              {[...ABSTRACT_CARDS, ...ABSTRACT_CARDS, ...ABSTRACT_CARDS].map((card, i) => (
                <div key={`bg1-${i}`} className={`w-full aspect-[9/16] rounded-3xl border ${card.border} ${card.bg} backdrop-blur-sm`} />
              ))}
            </motion.div>
            {/* Abstract Lane 2 */}
            <motion.div animate={{ y: [-1000, 0] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="flex flex-col gap-6 w-1/3">
              {[...ABSTRACT_CARDS, ...ABSTRACT_CARDS, ...ABSTRACT_CARDS].reverse().map((card, i) => (
                <div key={`bg2-${i}`} className={`w-full aspect-[9/16] rounded-3xl border ${card.border} ${card.bg} backdrop-blur-sm`} />
              ))}
            </motion.div>
            {/* Abstract Lane 3 */}
            <motion.div animate={{ y: [0, -1000] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="flex flex-col gap-6 w-1/3 pt-[400px]">
              {[...ABSTRACT_CARDS, ...ABSTRACT_CARDS, ...ABSTRACT_CARDS].map((card, i) => (
                <div key={`bg3-${i}`} className={`w-full aspect-[9/16] rounded-3xl border ${card.border} ${card.bg} backdrop-blur-sm`} />
              ))}
            </motion.div>
          </div>
          {/* Edge Fading Mask */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#03000a_70%)]" />
        </div>

        {/* 3. FOREGROUND MAIN CONTENT GRID */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10 relative">
          
          {/* TEXT CONTENT */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="border border-purple-500/20 bg-purple-500/10 text-purple-300 text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-full font-semibold mb-6 backdrop-blur-md">
              • Priority Waitlist Open
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="text-6xl sm:text-7xl md:text-8xl lg:text-[90px] font-extrabold tracking-tighter leading-[0.9] m-0 relative">
              Social<br className="hidden lg:block"/>
              <span className="bg-gradient-to-br from-white via-white to-purple-500 bg-clip-text text-transparent">Rum</span>
            </motion.h1>

            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "100%", opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} className="h-[2px] bg-gradient-to-r from-purple-600 via-purple-400 to-transparent w-full max-w-[300px] mt-6 mb-6" />

            <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              Create Content <span className="text-purple-400">That Actually</span><br className="hidden md:block" /> Gets Discovered
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="text-gray-400 text-sm md:text-base max-w-md leading-relaxed mt-5">
              SocialRum brings YouTube and Instagram creators a unified AI workspace — trending topics, script generation, and SEO in one premium dashboard.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
              <a href="#early-access" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm px-8 py-4 rounded-full transition-all shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] hover:-translate-y-1 flex justify-center items-center gap-2">
                Get Early Access <span>→</span>
              </a>
            </motion.div>
          </div>

          {/* DASHBOARD WIDGET INTERFACE */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 50 }} 
            className="w-full max-w-[500px] mx-auto lg:mx-0 lg:ml-auto"
          >
            {/* Floating Animation Wrapper */}
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="bg-[#0b0616]/60 border border-white/10 rounded-[32px] p-6 lg:p-8 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
              {/* Internal Dashboard Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-6">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_#a855f7]" /> Dashboard Active
              </div>

              {/* Dashboard Modules */}
              <div className="space-y-4 relative z-10">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:bg-black/60 transition-colors duration-300">
                  <p className="text-[10px] text-gray-500 tracking-widest uppercase mb-3 font-semibold">Trending Now</p>
                  <div className="space-y-2">
                    {[['#AIVideoEditing', 'Trending', 'text-purple-400'], ['#CreatorEconomy2026', 'Rising', 'text-indigo-400'], ['#YouTubeShorts', 'Hot', 'text-pink-400']].map(([tag, status, color]) => (
                      <div key={tag} className="flex justify-between items-center text-xs text-gray-300">
                        <span className="font-medium">{tag}</span> <span className={`${color} text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full`}>↑ {status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:bg-black/60 transition-colors duration-300">
                  <p className="text-[10px] text-gray-500 tracking-widest uppercase mb-2 font-semibold">AI Script Generator</p>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-gray-400 flex items-center justify-between min-h-[40px] font-mono shadow-inner">
                    <AnimatePresence mode="wait">
                      <TypingScript />
                    </AnimatePresence>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:bg-black/60 transition-colors duration-300">
                  <div className="flex justify-between items-center text-[10px] mb-2 font-semibold">
                    <span className="text-gray-500 tracking-widest uppercase">SEO Score</span>
                    <span className="text-purple-400 font-bold">AI Ready</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: "0%" }} animate={{ width: "85%" }} transition={{ duration: 2, delay: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_#a855f7]" />
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* STATS SECTION */}
      <div className="bg-white/[0.02] border-y border-white/5 py-12 px-6 flex justify-center gap-16 md:gap-24 flex-wrap relative z-20 backdrop-blur-sm">
        {STATS.map((s, i) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl md:text-5xl font-black bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">{s.value}</div>
            <div className="text-[11px] md:text-xs text-gray-400 font-bold tracking-widest uppercase mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-32 relative z-20">
        <div className="text-center mb-16">
          <p className="text-purple-500 text-xs font-bold tracking-widest uppercase mb-3">Platform Features</p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Every tool a serious creator needs.</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">Built specifically for YouTube and Instagram creators who want to grow faster without guessing.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} key={f.num} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                <span className="text-sm font-bold text-purple-400">{f.num}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 min-h-[60px]">{f.desc}</p>
              <div className="flex gap-2 flex-wrap">
                {f.tags.map(tag => <span key={tag} className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">{tag}</span>)}
              </div>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="border border-dashed border-white/10 bg-transparent rounded-3xl flex items-center justify-center p-8 text-center min-h-[250px]">
            <div>
              <div className="w-10 h-10 border-2 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-bold text-gray-300 mb-1">More Modules Loading</p>
              <p className="text-xs text-gray-600">The platform is actively expanding.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 relative z-20 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="text-center mb-16">
          <p className="text-purple-500 text-xs font-bold tracking-widest uppercase mb-3">System Architecture</p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">From zero to algorithm-ready.</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">No complex configuration frameworks. Link your data points and let the engine process signals in the background.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

          {STEPS.map((s, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.2 }} key={s.num} className="relative bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm z-10">
              <div className="text-5xl font-black text-white/5 absolute top-4 right-6">{s.num}</div>
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm mb-6 shadow-[0_0_15px_rgba(124,58,237,0.5)]">{s.num}</div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-purple-400 text-xs font-semibold mb-4 uppercase tracking-wider">{s.sub}</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">{s.desc}</p>
              <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                <p className="text-[10px] text-gray-400 italic font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 block" /> {s.note}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EARLY ACCESS MODULE */}
      <section id="early-access" className="max-w-5xl mx-auto px-6 py-32 relative z-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-gradient-to-br from-[#0a0516] to-[#03000a] border border-purple-500/20 rounded-[40px] p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center shadow-[0_0_100px_rgba(124,58,237,0.1)] relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

          <div>
            <p className="text-purple-500 text-xs font-bold tracking-widest uppercase mb-4">Limited Allocation</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">Secure Your Workspace.</h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">Join the waitlist to receive your creator terminal profile before the public rollout.</p>
            <ul className="space-y-4">
              {['Beta Access to all 5 core modules', 'Founding Creator Badge', 'Guaranteed Free Early Tier'].map(item => (
                <li key={item} className="flex items-center gap-4 text-sm text-gray-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs flex-shrink-0">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-black/40 border border-white/5 p-8 rounded-[32px] backdrop-blur-md relative z-10">
            {step === 'done' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-white" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Workspace Reserved!</h3>
                <p className="text-sm text-gray-400 mb-6">We'll notify <strong className="text-white font-medium">{userEmail}</strong> when your terminal is active.</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-xl font-bold mb-2 text-white">Request Access Pass</h3>
                <p className="text-xs text-gray-400 mb-6">Enter your details to generate your secure token.</p>
                <div className="space-y-4 mb-8">
                  <input type="text" placeholder="Creator Handle (e.g. @username)" className="w-full bg-[#03000a] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner" />
                  <input ref={emailRef} type="email" placeholder="Email Address" className="w-full bg-[#03000a] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner" />
                </div>
                <button onClick={() => { if(emailRef.current?.value) { setUserEmail(emailRef.current.value); setStep('done'); } }} className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-2xl transition-colors shadow-lg flex justify-center items-center gap-2">
                  Generate Token →
                </button>
              </motion.div>
            )}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6 relative z-20 bg-[#03000a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-[#03000a] rounded-[5px]" />
          </div>
          <span className="text-base font-bold tracking-tight">SocialRum</span>
        </div>
        <ul className="flex gap-6 text-xs text-gray-500 font-medium">
          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
        </ul>
        <span className="text-xs text-gray-600">© 2026 SocialRum · Unified Analytics Platform</span>
      </footer>
    </div>
  );
}