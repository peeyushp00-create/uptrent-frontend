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

const VIDEO_CARDS = [
  { id: 1, platform: 'youtube', title: 'How I Got 100K Subs in 30 Days', views: '2.4M', duration: '0:58', thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&q=80', channel: '@CreatorPro' },
  { id: 2, platform: 'instagram', title: 'Morning Routine That Changed My Life', views: '890K', duration: '0:30', thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80', channel: '@LifeWithAlex' },
  { id: 3, platform: 'youtube', title: 'AI Tools Every Creator Needs in 2026', views: '1.1M', duration: '0:45', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80', channel: '@TechCreator' },
  { id: 4, platform: 'instagram', title: 'Street Food Tour in Tokyo', views: '3.7M', duration: '0:60', thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80', channel: '@FoodieWorld' },
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
  const rootRef = useRef(null);
  const emailRef = useRef(null);
  const otpRef = useRef(null);

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
      
      {/* MOTION GRAPHIC BACKGROUND */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.09) 0%, transparent 65%)' }} 
      />
      
      <motion.div 
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'fixed', inset: -20, zIndex: 1, pointerEvents: 'none', opacity: 0.025, backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)', backgroundSize: '60px 60px' }} 
      />

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-20 transition-all duration-300 ${scrolled ? 'bg-[#03000a]/80 backdrop-blur-md border-b border-purple-500/10 shadow-lg' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-sm bg-purple-500 shadow-[0_0_10px_#a855f7]" />
          </div>
          <span className="font-semibold tracking-tight text-lg">SocialRum</span>
        </div>
        <ul className="hidden lg:flex items-center gap-10 list-none text-sm text-gray-400 font-medium">
          {['Features', 'How It Works', 'Early Access'].map(item => (
            <li key={item}><a href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors">{item}</a></li>
          ))}
        </ul>
        <button className="bg-purple-600/20 border border-purple-500/30 px-4 py-2 rounded-full text-xs font-semibold hover:bg-purple-600 transition-all duration-200 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
          Be the First to Know
        </button>
      </nav>

      {/* HERO HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-16 z-10 pt-20">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: ACTIVE INFINITE ROLLING REELS MODULE */}
          <div className="lg:col-span-3 hidden lg:flex gap-4 h-[520px] overflow-hidden relative group">
            {/* Soft Overlay Shadows for Fade Effect Top/Bottom */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#03000a] to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#03000a] to-transparent z-20 pointer-events-none" />

            {/* Reel Lane 1 */}
            <motion.div 
              animate={{ y: [0, -560] }} 
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-4 w-1/2"
            >
              {[...VIDEO_CARDS, ...VIDEO_CARDS].map((card, idx) => (
                <div key={`${card.id}-lane1-${idx}`} className="bg-white/[0.02] border border-white/5 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-purple-950/20">
                    <img src={card.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
                    <span className="absolute top-2 left-2 text-[8px] font-bold bg-red-600 px-1.5 py-0.5 rounded">Shorts</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 flex flex-col justify-end p-2.5">
                      <p className="text-[10px] font-semibold tracking-tight line-clamp-2 leading-tight">{card.title}</p>
                      <div className="flex justify-between items-center text-[8px] text-gray-400 mt-1">
                        <span>{card.channel}</span>
                        <span className="text-purple-400 font-bold">{card.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Reel Lane 2 */}
            <motion.div 
              animate={{ y: [-560, 0] }} 
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="flex flex-col gap-4 w-1/2 mt-8"
            >
              {[...VIDEO_CARDS, ...VIDEO_CARDS].reverse().map((card, idx) => (
                <div key={`${card.id}-lane2-${idx}`} className="bg-white/[0.02] border border-white/5 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-purple-950/20">
                    <img src={card.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
                    <span className="absolute top-2 left-2 text-[8px] font-bold bg-purple-600 px-1.5 py-0.5 rounded">Reels</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 flex flex-col justify-end p-2.5">
                      <p className="text-[10px] font-semibold tracking-tight line-clamp-2 leading-tight">{card.title}</p>
                      <div className="flex justify-between items-center text-[8px] text-gray-400 mt-1">
                        <span>{card.channel}</span>
                        <span className="text-purple-400 font-bold">{card.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* CENTER COLUMN: TEXT ENGINE HEADINGS */}
          <div className="lg:col-span-6 flex flex-col items-center text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="border border-purple-500/30 bg-purple-500/5 text-purple-300 text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-full font-semibold mb-6">
              • Now Accepting Early Access
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-6xl md:text-8xl font-extrabold tracking-tighter m-0 relative select-none">
              Social<span className="bg-gradient-to-b from-white via-white to-purple-500 bg-clip-text text-transparent">Rum</span>
              <div className="absolute -bottom-1 left-[-5%] w-[110%] h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[0.5px]" />
            </motion.h1>

            <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-2xl md:text-4xl font-bold tracking-tight text-white mt-8 leading-tight">
              Create Content <span className="text-purple-400">That Actually</span><br />Gets Discovered
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="text-gray-400 text-sm max-w-md leading-relaxed mt-4">
              SocialRum brings YouTube and Instagram creators a unified AI workspace — trending topics, script generation, content analysis, and SEO in one dark premium dashboard.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex items-center gap-6 mt-8">
              <a href="#early-access" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-6 py-3 rounded-full transition-all shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center gap-2">
                Be the First to Know <span>→</span>
              </a>
              <a href="#features" className="text-sm text-gray-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
                Explore Features <span className="text-xs">▼</span>
              </a>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE LIVE DASHBOARD UI */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-3 hidden lg:block">
            <div className="bg-[#0b0616]/70 border border-white/5 rounded-3xl p-5 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-purple-500/10 blur-xl rounded-full" />
              
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Dashboard
              </div>

              {/* Widget 1 */}
              <div className="bg-black/30 border border-white/[0.03] rounded-xl p-3 mb-3">
                <p className="text-[9px] text-gray-500 tracking-wider uppercase mb-2">Trending Now</p>
                {[['#AIVideoEditing', 'Trending'], ['#CreatorEconomy2026', 'Rising'], ['#YouTubeShorts', 'Hot']].map(([tag, status]) => (
                  <div key={tag} className="flex justify-between text-xs py-1 text-gray-300">
                    <span>{tag}</span> <span className="text-purple-400 text-[10px] font-medium">↑ {status}</span>
                  </div>
                ))}
              </div>

              {/* Widget 2 */}
              <div className="bg-black/30 border border-white/[0.03] rounded-xl p-3 mb-3">
                <p className="text-[9px] text-gray-500 tracking-wider uppercase mb-1.5">Script Generator</p>
                <div className="bg-black/20 border border-white/5 rounded-lg p-2 text-xs text-gray-400 flex items-center justify-between min-h-[32px]">
                  <AnimatePresence mode="wait">
                    <TypingScript />
                  </AnimatePresence>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                </div>
              </div>

              {/* Widget 3 */}
              <div className="bg-black/30 border border-white/[0.03] rounded-xl p-3">
                <div className="flex justify-between items-center text-[9px] mb-1.5">
                  <span className="text-gray-500 tracking-wider uppercase">SEO Score</span>
                  <span className="text-purple-400 font-bold">AI Ready</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div animate={{ width: ["0%", "85%"] }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* STATS SECTION */}
      <div className="bg-purple-500/[0.01] border-y border-purple-500/10 py-12 px-6 flex justify-center gap-16 md:gap-24 flex-wrap relative z-20">
        {STATS.map((s, i) => (
          <div key={s.label} className="text-center sr-reveal">
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-b from-white to-purple-300 bg-clip-text text-transparent">{s.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28 relative z-20">
        <p className="text-purple-500 text-xs font-bold tracking-widest uppercase mb-3 sr-reveal">Platform Features</p>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 sr-reveal sr-d1">Every tool a serious creator needs.</h2>
        <p className="text-gray-500 text-sm md:text-base max-w-lg mb-16 sr-reveal sr-d2">Built specifically for YouTube and Instagram creators who want to grow faster without guessing.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sr-reveal-s sr-d2">
          {FEATURES.map(f => (
            <div key={f.num} className="sr-feature-item group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <span className="text-xs font-bold text-purple-400">{f.num}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-4 min-h-[60px]">{f.desc}</p>
              <div className="flex gap-2 flex-wrap">
                {f.tags.map(tag => <span key={tag} className="sr-feature-tag">{tag}</span>)}
              </div>
            </div>
          ))}
          <div className="border border-white/5 bg-white/[0.01] rounded-3xl flex items-center justify-center p-6 text-center min-h-[200px]">
            <div>
              <p className="font-bold text-gray-400 mb-1">More Modules Loading</p>
              <p className="text-xs text-gray-600">The ultimate AI creator platform is actively expanding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 relative z-20">
        <p className="text-purple-500 text-xs font-bold tracking-widest uppercase mb-3 sr-reveal">System Architecture</p>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 sr-reveal sr-d1">From zero to algorithm-ready in one session.</h2>
        <p className="text-gray-500 text-sm max-w-lg mb-16 sr-reveal sr-d2">No complex configuration frameworks. Link your data points and let the engine process signals in the background.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.num} className={`sr-step-card sr-reveal sr-d${i+1}`}>
              <div className="sr-step-num">{s.num}</div>
              <h3 className="text-lg font-bold text-white mb-1.5">{s.title}</h3>
              <p className="text-purple-400 text-xs font-medium mb-4">{s.sub}</p>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              <p className="text-[11px] text-purple-400/40 italic mt-4">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EARLY ACCESS MODULE */}
      <section id="early-access" className="max-w-6xl mx-auto px-6 py-20 pb-32 relative z-20">
        <div className="border border-purple-500/10 bg-purple-500/[0.01] rounded-[32px] p-8 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-purple-500/5 blur-3xl rounded-full" />
          
          <div className="lg:col-span-7 sr-reveal-l">
            <p className="text-purple-500 text-xs font-bold tracking-widest uppercase mb-3">Priority Waitlist</p>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-4">Be the First to Know &amp; Create.</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">Secure your creator terminal profile before public rollout deployment operations begin.</p>
            <div className="flex flex-col gap-3.5">
              {['Beta Access — Operate full pipeline parameters before launch', 'Founding Creator Badge — Strategic system profile identifier', 'Free Early Access Tier — Guarded workspace allocations'].map(item => (
                <div key={item} className="flex items-center gap-3 text-xs md:text-sm text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" strokeWidth={3} stroke="#c084fc"><polyline points="2,6 5,9 10,3"/></svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-black/40 border border-white/5 p-6 md:p-8 rounded-2xl z-10 sr-reveal-r">
            {step === 'done' && (
              <div className="text-center py-6 sr-fade-in">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Workspace Reserved! 🎉</h3>
                <p className="text-xs text-gray-500 mb-6">Your parameters have been logged successfully.</p>
                <div className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs px-4 py-2 rounded-full font-medium">
                  Verified — {userEmail}
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="sr-fade-in">
                <h3 className="text-lg font-bold mb-1">Verify Identity Pass</h3>
                <p className="text-xs text-gray-400 mb-6">Enter transmission key code processed to <span className="text-purple-400 font-medium">{userEmail}</span></p>
                <input ref={otpRef} type="text" inputMode="numeric" maxLength={6} placeholder="000000" className="sr-input tracking-[0.3em] text-center text-lg font-bold" />
                {errorMsg && <p className="text-xs text-red-400 text-center mt-3">{errorMsg}</p>}
                <button onClick={() => setStep('done')} className="sr-ea-btn mt-4">Confirm Registration Code</button>
              </div>
            )}

            {step === 'email' && (
              <div className="sr-fade-in">
                <h3 className="text-lg font-bold mb-1">Request Terminal Allocation</h3>
                <p className="text-xs text-gray-400 mb-6">Input creator email handle vectors below.</p>
                <div className="flex flex-col gap-3">
                  <input id="sr-name-input" type="text" placeholder="Creator Handle Name" className="sr-input" />
                  <input ref={emailRef} type="email" placeholder="alias@domain.com" className="sr-input" />
                </div>
                {errorMsg && <p className="text-xs text-red-400 text-center mt-3">{errorMsg}</p>}
                <button onClick={() => { setUserEmail(emailRef.current?.value || ''); setStep('otp'); }} className="sr-ea-btn mt-4">Generate Token Key →</button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-purple-500/10 px-8 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-20 bg-[#03000a]">
        <span className="text-sm font-bold tracking-tight">SocialRum</span>
        <span className="text-xs text-gray-600">© 2026 SocialRum · Made for High-Growth Creators</span>
      </footer>
    </div>
  );
}