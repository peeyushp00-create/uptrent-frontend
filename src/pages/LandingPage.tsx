import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const FEATURES = [
  { num: '01', title: 'Creator News Feed', desc: 'Curated industry news, platform updates, and creator economy signals — filtered for what actually matters to your niche.', tags: ['YouTube', 'Instagram', 'TikTok'] },
  { num: '02', title: 'AI Script Generator', desc: 'Go from idea to full video script in 60 seconds. Trained on viral hooks, retention patterns, and your channel voice.', tags: ['Hook', 'Body', 'CTA', 'Hinglish'] },
  { num: '03', title: 'Content Analyzer', desc: "Deep-dive analytics on your existing content. Identify what's working, what's losing viewers, and what to create next.", tags: ['Retention', 'Drop-off'] },
  { num: '04', title: 'Trending Topics', desc: 'Real-time trend detection across YouTube and Instagram before they peak — publish first, win the algorithm.', tags: ['#AIVideoEditing ↑ 340%', '#CreatorEconomy ↑ 128%'] },
  { num: '05', title: 'YouTube SEO', desc: 'Keyword research, title optimization, tag suggestions, and thumbnail analysis — everything to rank on page one.', tags: ['Keywords', 'Titles', 'Tags'] },
];

const STEPS = [
  { num: '01', title: 'Connect Your Channels', sub: 'YouTube & Instagram in 2 minutes', desc: 'Link your accounts securely. SocialRum reads your performance data, audience demographics, and content library.', note: 'OAuth 2.0 secure. Read-only access. Revoke anytime.' },
  { num: '02', title: 'Let AI Analyze & Generate', sub: 'Scripts, trends, and SEO — automated', desc: "Our AI engine scans trending topics in your niche, analyzes your top-performing content, and generates scripts tailored to your audience.", note: 'Processes 150+ content signals per channel per day.' },
  { num: '03', title: 'Publish & Rank Faster', sub: 'From insight to upload in record time', desc: 'Act on SEO recommendations, publish optimized content, and track performance gains — all from one dark premium workspace.', note: 'Avg. 3.2× faster content-to-publish workflow.' },
];

const STATS = [
  { value: '5', label: 'Creator Tools' },
  { value: '20+', label: 'Content Niches' },
  { value: 'Free', label: 'Early Access Tier' },
  { value: '100%', label: 'Made for India' },
];

const VIDEO_CARDS = [
  { id:1,  platform:'youtube',   title:'How I Got 100K Subs in 30 Days',       views:'2.4M', duration:'0:58', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1d6391833-1773075779744.png',  channel:'@CreatorPro',    lane:0, speed:18, startOffset:0   },
  { id:2,  platform:'instagram', title:'Morning Routine That Changed My Life',  views:'890K', duration:'0:30', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1521eb58e-1764644106046.png',  channel:'@LifeWithAlex',  lane:1, speed:22, startOffset:-40 },
  { id:3,  platform:'youtube',   title:'AI Tools Every Creator Needs in 2026', views:'1.1M', duration:'0:45', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1ddab98dc-1773131998650.png',  channel:'@TechCreator',   lane:2, speed:16, startOffset:-20 },
  { id:4,  platform:'instagram', title:'Street Food Tour in Tokyo',            views:'3.7M', duration:'0:60', thumbnail:'https://images.unsplash.com/photo-1516822561562-a6762898eb60?w=200',                 channel:'@FoodieWorld',   lane:3, speed:20, startOffset:-10 },
  { id:5,  platform:'youtube',   title:'Build a SaaS in 24 Hours Challenge',   views:'780K', duration:'0:59', thumbnail:'https://images.unsplash.com/photo-1564756296543-d61bebcd226a?w=200',                 channel:'@DevShorts',     lane:4, speed:19, startOffset:-50 },
  { id:6,  platform:'instagram', title:'Minimalist Home Makeover on Budget',   views:'1.5M', duration:'0:45', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_15eaab260-1772956699125.png',  channel:'@HomeVibes',     lane:5, speed:21, startOffset:-80 },
  { id:7,  platform:'youtube',   title:'Camera Settings for Perfect Reels',    views:'640K', duration:'0:55', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1b0948c90-1771909777566.png',  channel:'@FilmTips',      lane:0, speed:17, startOffset:-70 },
  { id:8,  platform:'instagram', title:'Fitness Transformation 30 Days',       views:'4.3M', duration:'0:30', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_159a50448-1767636094533.png',  channel:'@FitLife',       lane:1, speed:23, startOffset:-45 },
  { id:9,  platform:'youtube',   title:'Grow on YouTube with Zero Budget',     views:'920K', duration:'0:58', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_17b6062b2-1772483137359.png',  channel:'@GrowthHacks',   lane:2, speed:19, startOffset:-90 },
  { id:10, platform:'instagram', title:'Aesthetic Room Tour 2026',             views:'1.2M', duration:'0:45', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_150de2b75-1772333562367.png',  channel:'@AestheticVibes',lane:3, speed:16, startOffset:-35 },
  { id:11, platform:'youtube',   title:'Top 10 Trending Niches Right Now',     views:'3.1M', duration:'0:59', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_126d7e136-1768020582546.png',  channel:'@NicheHunter',   lane:4, speed:20, startOffset:-65 },
  { id:12, platform:'instagram', title:'Skincare Routine for Glowing Skin',    views:'2.9M', duration:'0:30', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_194b951ad-1772304624866.png',  channel:'@GlowUp',        lane:5, speed:18, startOffset:-25 },
];

const TypingScript = () => {
  const hooks = ["Generating viral hook...", "Analyzing retention patterns...", "Structuring body layout...", "Optimizing SEO keywords..."];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex(p => (p + 1) % hooks.length), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.span key={index} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }} transition={{ duration:0.3 }}>
        {hooks[index]}
      </motion.span>
    </AnimatePresence>
  );
};

const TRENDING_NICHES = [
  { name: 'Finance', growth: '+34%', color: '#a78bfa' },
  { name: 'AI & Tech', growth: '+28%', color: '#818cf8' },
  { name: 'Cricket', growth: '+22%', color: '#60a5fa' },
  { name: 'Fitness', growth: '+18%', color: '#34d399' },
];

const TiltCard = ({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle:'preserve-3d', transformPerspective:800, ...style }}
      className={className}>
      {children}
    </motion.div>
  );
};

const HeroTitle = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);
  const translateX = useTransform(x, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(y, [-0.5, 0.5], [-6, 6]);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };
  return (
    <div style={{ position:'relative', marginBottom:8 }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.h1 style={{ margin:0, lineHeight:1, perspective:800, display:'flex', alignItems:'baseline', justifyContent:'center', flexWrap:'nowrap', rotateX, rotateY, translateX, translateY, transformStyle:'preserve-3d' }}>
        {'Social'.split('').map((char, i) => (
          <motion.span key={`s${i}`}
            initial={{ opacity:0, y:60, rotateX:25 }} animate={{ opacity:1, y:0, rotateX:0 }}
            transition={{ duration:0.7, delay: 0.2 + i * 0.06, ease:[0.16,1,0.3,1] }}
            style={{ display:'inline-block', fontFamily:'Arial,Helvetica,sans-serif', fontWeight:900, fontSize:'clamp(42px,10vw,96px)', letterSpacing:'-.02em', color:'#5b21b6', verticalAlign:'baseline', lineHeight:1 }}>
            {char}
          </motion.span>
        ))}
        {'Rum'.split('').map((char, i) => (
          <motion.span key={`r${i}`}
            initial={{ opacity:0, y:60, rotateX:25 }} animate={{ opacity:1, y:0, rotateX:0 }}
            transition={{ duration:0.7, delay: 0.55 + i * 0.07, ease:[0.16,1,0.3,1] }}
            style={{ display:'inline-block', fontFamily:'Arial,Helvetica,sans-serif', fontWeight:900, fontSize:'clamp(42px,10vw,96px)', letterSpacing:'-.02em', background:'linear-gradient(to bottom,#fff,rgba(255,255,255,0.6))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', verticalAlign:'baseline', lineHeight:1 }}>
            {char}
          </motion.span>
        ))}
      </motion.h1>
      <motion.div initial={{ scaleX:0, opacity:0 }} animate={{ scaleX:1, opacity:1 }} transition={{ duration:0.8, delay:0.9, ease:[0.16,1,0.3,1] }}
        style={{ position:'relative', width:'85%', margin:'10px auto 0', height:3, transformOrigin:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, borderRadius:50, background:'linear-gradient(to right,transparent,rgba(139,92,246,0.4),transparent)' }} />
        <motion.div animate={{ opacity:[0.6,1,0.6], boxShadow:['0 0 12px 2px rgba(139,92,246,0.4)','0 0 30px 6px rgba(139,92,246,0.8)','0 0 12px 2px rgba(139,92,246,0.4)'] }}
          transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', inset:0, borderRadius:50, background:'linear-gradient(to right,transparent,#8b5cf6,transparent)' }} />
        <motion.div animate={{ x:['-200%','300%'] }} transition={{ duration:4, repeat:Infinity, repeatDelay:0, ease:'linear' }}
          style={{ position:'absolute', top:0, bottom:0, width:'60%', borderRadius:50, background:'linear-gradient(to right,transparent,rgba(255,255,255,0.7) 40%,rgba(255,255,255,0.9) 50%,rgba(255,255,255,0.7) 60%,transparent)' }} />
      </motion.div>
    </div>
  );
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700;900&display=swap');
  * { box-sizing: border-box; }
  .sr-feature-tag{font-size:11px;font-weight:500;color:#a78bfa;background:rgba(139,92,246,0.1);padding:3px 10px;border-radius:50px;border:1px solid rgba(139,92,246,0.2)}
  .sr-step-card{background:rgba(139,92,246,0.03);border:1px solid rgba(139,92,246,0.12);border-radius:24px;padding:32px;transition:transform .4s,border-color .3s,box-shadow .4s}
  .sr-step-card:hover{transform:translateY(-6px);border-color:rgba(139,92,246,0.35);box-shadow:0 20px 50px rgba(139,92,246,0.12)}
  .sr-step-num{font-family:'Roboto',sans-serif;font-size:48px;font-weight:800;color:rgba(139,92,246,0.12);line-height:1;margin-bottom:16px;letter-spacing:-.03em;transition:color .3s}
  .sr-step-card:hover .sr-step-num{color:rgba(139,92,246,0.3)}
  .sr-input{width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:12px 16px;color:#fff;font-size:14px;font-family:'Roboto',sans-serif;outline:none;transition:border-color .3s,box-shadow .3s}
  .sr-input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,0.15)}
  .sr-input::placeholder{color:rgba(255,255,255,0.25)}
  .sr-ea-btn{width:100%;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600;font-family:'Roboto',sans-serif;cursor:pointer;transition:transform .15s,box-shadow .3s;box-shadow:0 0 30px rgba(124,58,237,0.4);margin-bottom:10px}
  .sr-ea-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 50px rgba(124,58,237,0.6)}
  .sr-ea-btn:disabled{opacity:.5;cursor:not-allowed}
  .sr-fade-in{animation:srFadeIn .4s ease both}
  @keyframes srFadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
  @keyframes srFloatDown{from{transform:translate3d(0,-380px,0)}to{transform:translate3d(0,calc(100vh + 380px),0)}}
  @keyframes srFloatUp{from{transform:translate3d(0,calc(100vh + 380px),0)}to{transform:translate3d(0,-380px,0)}}

  /* Mobile menu */
  .sr-mobile-menu{position:fixed;inset:0;background:rgba(3,0,10,0.97);backdrop-filter:blur(20px);z-index:45;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;transform:translateY(-100%);transition:transform .4s cubic-bezier(.16,1,.3,1)}
  .sr-mobile-menu.open{transform:translateY(0)}
  .sr-mobile-menu a{color:#fff;font-size:22px;text-decoration:none;font-weight:700;letter-spacing:-.02em}

  /* Responsive */
  @media(max-width:1024px){
    .sr-hero-grid{grid-template-columns:1fr !important}
    .sr-side-cards{display:none !important}
    .sr-hero-section{padding:100px 24px 60px !important;min-height:auto !important}
  }
  @media(max-width:768px){
    .sr-nav{padding:0 20px !important}
    .sr-nav-links{display:none !important}
    .sr-nav-cta{display:none !important}
    .sr-hamburger{display:flex !important}
    .sr-hero-section{padding:90px 20px 48px !important}
    .sr-stats{gap:32px !important;padding:32px 20px !important}
    .sr-section{padding:60px 20px !important}
    .sr-ea-section{padding:60px 20px 80px !important}
    .sr-ea-grid{grid-template-columns:1fr !important;gap:32px !important;padding:32px 24px !important}
    .sr-footer{padding:32px 20px !important;flex-direction:column !important;align-items:flex-start !important;gap:24px !important}
    .sr-footer-links{flex-wrap:wrap !important;gap:16px !important}
    .sr-step-card{padding:24px !important}
  }
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState<'email'|'otp'|'done'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeNiche, setActiveNiche] = useState(0);

  const BASE = import.meta.env.VITE_API_URL || 'https://uptrent-backend.onrender.com';

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setActiveNiche(p => (p + 1) % TRENDING_NICHES.length), 2000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSendOTP = async () => {
    const email = emailRef.current?.value.trim() ?? '';
    const name = (document.getElementById('sr-name-input') as HTMLInputElement)?.value.trim() ?? '';
    if (!email || !email.includes('@')) { setErrorMsg('Please enter a valid email.'); return; }
    setLoading(true); setErrorMsg('');
    try {
      const res = await fetch(`${BASE}/api/waitlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, name: name || email.split('@')[0] }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setUserEmail(email); setStep('otp');
    } catch (err: any) { setErrorMsg(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const token = otpRef.current?.value.trim() ?? '';
    if (!token || token.length < 6) { setErrorMsg('Enter the 6-digit code.'); return; }
    setLoading(true); setErrorMsg('');
    try {
      const res = await fetch(`${BASE}/api/waitlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: userEmail, otp: token, action:'verify' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      setStep('done');
    } catch (err: any) { setErrorMsg(err.message || 'Invalid code. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen bg-[#03000a] text-white overflow-x-hidden" style={{ fontFamily:"'Roboto',sans-serif" }}>
      <style>{css}</style>

      {/* Mobile menu */}
      <div className={`sr-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
        <a href="#early-access" onClick={() => setMenuOpen(false)} style={{ color:'#a855f7' }}>Early Access</a>
        <a href="#early-access" onClick={() => setMenuOpen(false)}
          style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', padding:'14px 32px', borderRadius:50, fontSize:15, fontWeight:700 }}>
          Get Early Access
        </a>
      </div>

      {/* Animated bg */}
      <motion.div animate={{ scale:[1,1.06,1], rotate:[0,2,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }}
        style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', background:'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.09), transparent 65%)' }} />
      <motion.div animate={{ y:[0,-15,0], x:[0,10,0] }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
        style={{ position:'fixed', inset:-20, zIndex:1, pointerEvents:'none', opacity:0.025, backgroundImage:'linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />

      {/* Video bg — hidden on mobile for performance */}
      <div className="hidden md:block" style={{ position:'fixed', inset:0, zIndex:2, overflow:'hidden', pointerEvents:'none' }}>
        {[0,1,2,3,4,5].map(laneIndex => {
          const laneCards = VIDEO_CARDS.filter(c => c.lane === laneIndex);
          const isEven = laneIndex % 2 === 0;
          return (
            <div key={laneIndex} style={{ position:'absolute', top:0, bottom:0, left:`${4 + laneIndex * 16}%`, width:140 }}>
              {laneCards.map(card => {
                const isIG = card.platform === 'instagram';
                return (
                  <div key={card.id} style={{ position:'absolute', width:130, top: isEven ? -380 : '100%', animationName: isEven ? 'srFloatDown' : 'srFloatUp', animationDuration:`${card.speed}s`, animationDelay:`${card.startOffset/10}s`, animationTimingFunction:'linear', animationIterationCount:'infinite', willChange:'transform' }}>
                    <div style={{ position:'relative', width:130, height:230, borderRadius:16, overflow:'hidden', background:'rgba(139,92,246,0.05)', border:'1px solid rgba(139,92,246,0.12)', opacity:0.35 }}>
                      <img src={card.thumbnail} alt="" loading="lazy" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.6 }} />
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent,rgba(0,0,0,0.85))' }} />
                      <div style={{ position:'absolute', top:8, left:8, padding:'2px 6px', borderRadius:50, background: isIG ? 'linear-gradient(45deg,#f09433,#bc1888)' : '#FF0000', fontSize:8, fontWeight:700, color:'white' }}>{isIG ? 'Reels' : 'Shorts'}</div>
                      <div style={{ position:'absolute', bottom:8, left:8, right:8 }}>
                        <p style={{ color:'white', fontWeight:600, fontSize:9, lineHeight:1.3, marginBottom:2 }}>{card.title}</p>
                        <span style={{ fontSize:8, fontWeight:700, color: isIG ? '#E1306C' : '#FF0000' }}>{card.views}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* NAVBAR */}
      <nav className="sr-nav" style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 64px', height:72, transition:'all .3s', background: scrolled || menuOpen ? 'rgba(3,0,10,0.95)' : 'transparent', backdropFilter: scrolled || menuOpen ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid rgba(139,92,246,0.1)' : 'none' }}>
        <a href="/home" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', zIndex:51 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:10, height:10, borderRadius:3, background:'#a855f7', boxShadow:'0 0 10px #a855f7' }} />
          </div>
          <span style={{ fontFamily:'Roboto,sans-serif', fontWeight:700, fontSize:18, color:'#fff', letterSpacing:'-.02em' }}>SocialRum</span>
        </a>

        {/* Desktop nav */}
        <ul className="sr-nav-links" style={{ display:'flex', gap:40, listStyle:'none' }}>
          {['Features','How It Works','Early Access'].map(item => (
            <li key={item}><a href={`#${item.toLowerCase().replace(/ /g,'-')}`} style={{ color:'rgba(255,255,255,0.55)', textDecoration:'none', fontSize:14, fontFamily:'Roboto,sans-serif', transition:'color .2s' }} onMouseEnter={e => (e.currentTarget.style.color='#fff')} onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.55)')}>{item}</a></li>
          ))}
        </ul>

        <a href="#early-access" className="sr-nav-cta" style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(139,92,246,0.3)', padding:'10px 22px', borderRadius:50, fontSize:13, fontWeight:600, color:'#fff', textDecoration:'none' }}>
          Be the First to Know
        </a>

        {/* Hamburger */}
        <button className="sr-hamburger" onClick={() => setMenuOpen(!menuOpen)}
          style={{ display:'none', background:'none', border:'none', color:'#fff', cursor:'pointer', padding:4, zIndex:51, flexDirection:'column', gap:5, alignItems:'center', justifyContent:'center' }}>
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
          )}
        </button>
      </nav>

      {/* HERO */}
      <section className="sr-hero-section" style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', padding:'0 64px', zIndex:10, paddingTop:80 }}>
        <div className="sr-hero-grid" style={{ width:'100%', maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.4fr 1fr', gap:40, alignItems:'center' }}>

          {/* LEFT — hidden on mobile */}
          <motion.div className="sr-side-cards" initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, delay:0.3 }}
            style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <TiltCard style={{ background:'rgba(11,6,22,0.85)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:24, padding:20, backdropFilter:'blur(20px)', cursor:'default' }}>
              <p style={{ fontFamily:'Roboto,sans-serif', fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Trending Niches</p>
              {TRENDING_NICHES.map((niche, i) => (
                <motion.div key={niche.name} animate={{ opacity: activeNiche === i ? 1 : 0.4, x: activeNiche === i ? 4 : 0 }} transition={{ duration:0.3 }}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <motion.div animate={activeNiche === i ? { scale:[1,1.3,1] } : {}} transition={{ duration:0.6, repeat:Infinity }}
                      style={{ width:6, height:6, borderRadius:'50%', background: activeNiche === i ? niche.color : 'rgba(255,255,255,0.15)', flexShrink:0 }} />
                    <span style={{ fontSize:13, color:'#fff', fontFamily:'Roboto,sans-serif' }}>{niche.name}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color: niche.color }}>{niche.growth}</span>
                </motion.div>
              ))}
            </TiltCard>

            <TiltCard style={{ background:'rgba(11,6,22,0.85)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:20, padding:18, backdropFilter:'blur(20px)', cursor:'default' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <p style={{ fontFamily:'Roboto,sans-serif', fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>AI Script Ideas</p>
                <motion.div animate={{ rotate:360 }} transition={{ duration:4, repeat:Infinity, ease:'linear' }}
                  style={{ width:16, height:16, borderRadius:'50%', border:'2px solid transparent', borderTopColor:'#8b5cf6', borderRightColor:'#8b5cf6' }} />
              </div>
              {['Top 5 Finance Tips for 2026', 'React to Latest IPL News', 'AI Tools Every Creator Needs'].map((idea, i) => (
                <div key={idea} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width:18, height:18, borderRadius:6, background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:9, color:'#a78bfa', fontWeight:700 }}>{i+1}</span>
                  </div>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontFamily:'Roboto,sans-serif', lineHeight:1.3 }}>{idea}</span>
                </div>
              ))}
            </TiltCard>
          </motion.div>

          {/* CENTER */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
            <motion.div initial={{ opacity:0, y:-20, scale:0.85 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
              style={{ border:'1px solid rgba(139,92,246,0.3)', background:'rgba(139,92,246,0.06)', color:'#c4b5fd', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', padding:'6px 16px', borderRadius:50, fontWeight:600, marginBottom:24, fontFamily:'Roboto,sans-serif', display:'inline-flex', alignItems:'center', gap:8 }}>
              <motion.div animate={{ opacity:[1,0.2,1] }} transition={{ duration:1.5, repeat:Infinity }} style={{ width:6, height:6, borderRadius:'50%', background:'#8b5cf6' }} />
              Now Accepting Early Access
            </motion.div>

            <HeroTitle />

            <motion.h2 initial={{ opacity:0, y:20, filter:'blur(8px)' }} animate={{ opacity:1, y:0, filter:'blur(0px)' }} transition={{ duration:0.8, delay:0.8, ease:[0.16,1,0.3,1] }}
              style={{ fontFamily:'Roboto,sans-serif', fontSize:'clamp(18px,4vw,32px)', fontWeight:700, color:'#fff', marginBottom:16, lineHeight:1.3 }}>
              Create Content{' '}
              <motion.span animate={{ color:['#8b5cf6','#a78bfa','#8b5cf6'] }} transition={{ duration:3, repeat:Infinity }}>That Actually</motion.span>
              <br/>Gets Discovered
            </motion.h2>

            <motion.p initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:1.0, ease:[0.16,1,0.3,1] }}
              style={{ fontFamily:'Roboto,sans-serif', fontSize:14, color:'rgba(255,255,255,0.5)', maxWidth:380, lineHeight:1.8, marginBottom:32, padding:'0 8px' }}>
              SocialRum brings YouTube and Instagram creators a unified AI workspace — trending topics, script generation, content analysis, and SEO in one dark premium dashboard.
            </motion.p>

            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:1.2, ease:[0.16,1,0.3,1] }}
              style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
              <motion.a href="#early-access" whileHover={{ scale:1.06 }} whileTap={{ scale:0.97 }}
                style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontWeight:600, fontSize:14, padding:'14px 28px', borderRadius:50, textDecoration:'none', boxShadow:'0 0 30px rgba(124,58,237,0.5)', display:'inline-flex', alignItems:'center', gap:8 }}>
                Be the First to Know
                <motion.span animate={{ x:[0,4,0] }} transition={{ duration:1.2, repeat:Infinity }}>→</motion.span>
              </motion.a>
              <motion.a href="#features" whileHover={{ color:'#fff' }}
                style={{ fontSize:14, color:'rgba(255,255,255,0.5)', textDecoration:'none', fontFamily:'Roboto,sans-serif', display:'inline-flex', alignItems:'center', gap:6 }}>
                Explore Features
                <motion.span animate={{ y:[0,3,0] }} transition={{ duration:1.2, repeat:Infinity }}>▼</motion.span>
              </motion.a>
            </motion.div>
          </div>

          {/* RIGHT — hidden on mobile */}
          <motion.div className="sr-side-cards" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, delay:0.2 }}>
            <TiltCard style={{ background:'rgba(11,6,22,0.85)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:28, padding:20, backdropFilter:'blur(20px)', boxShadow:'0 30px 60px rgba(0,0,0,0.6)', position:'relative', overflow:'hidden', cursor:'default' }}>
              <div style={{ position:'absolute', top:-30, right:-30, width:96, height:96, background:'rgba(139,92,246,0.12)', filter:'blur(20px)', borderRadius:'50%', pointerEvents:'none' }} />
              <div style={{ display:'flex', alignItems:'center', gap:8, color:'#a78bfa', fontSize:12, fontWeight:700, marginBottom:16, fontFamily:'Roboto,sans-serif' }}>
                <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }} style={{ width:6, height:6, borderRadius:'50%', background:'#8b5cf6' }} />
                Dashboard
              </div>
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:16, padding:14, marginBottom:12 }}>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12, fontFamily:'Roboto,sans-serif' }}>Trending Now</p>
                {[['#AIVideoEditing','Trending'],['#CreatorEconomy2026','Rising'],['#YouTubeShorts','Hot']].map(([tag, status]) => (
                  <div key={tag} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, fontSize:12, color:'#fff', fontFamily:'Roboto,sans-serif' }}>
                    <span>{tag}</span><span style={{ color:'#a78bfa', fontSize:10, fontWeight:600 }}>↑ {status}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:16, padding:14, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'Roboto,sans-serif' }}>Script Generator</p>
                  <motion.div animate={{ rotate:360 }} transition={{ duration:3, repeat:Infinity, ease:'linear' }}
                    style={{ width:20, height:20, borderRadius:6, background:'linear-gradient(135deg,#7c3aed,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#fff' }} />
                  </motion.div>
                </div>
                <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, padding:'8px 12px', fontSize:11, color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:'Roboto,sans-serif', minHeight:32 }}>
                  <TypingScript />
                  <motion.div animate={{ opacity:[1,0,1] }} transition={{ duration:0.8, repeat:Infinity }} style={{ width:1, height:12, background:'#8b5cf6', flexShrink:0, marginLeft:4 }} />
                </div>
              </div>
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:16, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'Roboto,sans-serif' }}>SEO Score</p>
                  <span style={{ color:'#a78bfa', fontWeight:600, fontSize:11, fontFamily:'Roboto,sans-serif' }}>AI Ready</span>
                </div>
                <div style={{ width:'100%', height:6, borderRadius:50, background:'rgba(255,255,255,0.08)', overflow:'hidden', marginBottom:8 }}>
                  <motion.div animate={{ width:['0%','85%'] }} transition={{ duration:1.5, ease:'easeOut', delay:1 }}
                    style={{ height:'100%', borderRadius:50, background:'linear-gradient(90deg,#7c3aed,#a855f7)', boxShadow:'0 0 10px rgba(139,92,246,0.6)' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'Roboto,sans-serif' }}>
                  <span>Low</span><span style={{ color:'#a78bfa', fontWeight:600 }}>85/100</span><span>High</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

        </div>
      </section>

      {/* STATS */}
      <div className="sr-stats" style={{ background:'rgba(139,92,246,0.01)', borderTop:'1px solid rgba(139,92,246,0.08)', borderBottom:'1px solid rgba(139,92,246,0.08)', padding:'48px 32px', display:'flex', justifyContent:'center', gap:64, flexWrap:'wrap', position:'relative', zIndex:20 }}>
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Roboto,sans-serif', fontSize:38, fontWeight:800, letterSpacing:'-.03em', background:'linear-gradient(to bottom,#fff,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{s.value}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:6, fontFamily:'Roboto,sans-serif' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* FEATURES */}
      <section id="features" className="sr-section" style={{ maxWidth:1100, margin:'0 auto', padding:'100px 32px', position:'relative', zIndex:20 }}>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ color:'#8b5cf6', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12, fontFamily:'Roboto,sans-serif' }}>Platform Features</motion.p>
        <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ fontFamily:'Roboto,sans-serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:800, color:'#fff', marginBottom:12, letterSpacing:'-.02em' }}>Every tool a serious creator needs.</motion.h2>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ fontSize:15, color:'rgba(255,255,255,0.4)', maxWidth:500, marginBottom:48, lineHeight:1.7, fontFamily:'Roboto,sans-serif' }}>Built specifically for YouTube and Instagram creators who want to grow faster without guessing.</motion.p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.num} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.08 }} className="sr-step-card">
              <div className="sr-step-num">{f.num}</div>
              <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:17, fontWeight:700, color:'#fff', marginBottom:8, position:'relative', zIndex:1 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7, marginBottom:14, fontFamily:'Roboto,sans-serif', position:'relative', zIndex:1 }}>{f.desc}</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', position:'relative', zIndex:1 }}>
                {f.tags.map(tag => <span key={tag} className="sr-feature-tag">{tag}</span>)}
              </div>
            </motion.div>
          ))}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.4 }}
            className="sr-step-card" style={{ display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
            <div>
              <div className="sr-step-num" style={{ textAlign:'center' }}>+</div>
              <p style={{ fontFamily:'Roboto,sans-serif', fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.2)', marginBottom:8 }}>More coming</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.15)', fontFamily:'Roboto,sans-serif' }}>Platform is actively growing</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="sr-section" style={{ maxWidth:1100, margin:'0 auto', padding:'80px 32px', position:'relative', zIndex:20 }}>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ color:'#8b5cf6', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12, fontFamily:'Roboto,sans-serif' }}>How It Works</motion.p>
        <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ fontFamily:'Roboto,sans-serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:800, color:'#fff', marginBottom:12, letterSpacing:'-.02em' }}>From zero to algorithm-ready in one session.</motion.h2>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ fontSize:15, color:'rgba(255,255,255,0.4)', maxWidth:500, marginBottom:48, lineHeight:1.7, fontFamily:'Roboto,sans-serif' }}>No complex setup. No learning curve. Connect your channels and SocialRum immediately starts surfacing what to create, how to optimize it, and how to rank it.</motion.p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
          {STEPS.map((s, i) => (
            <motion.div key={s.num} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }} className="sr-step-card">
              <div className="sr-step-num">{s.num}</div>
              <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:18, fontWeight:700, color:'#fff', marginBottom:8 }}>{s.title}</h3>
              <p style={{ fontSize:12, fontWeight:600, color:'#8b5cf6', marginBottom:12, fontFamily:'Roboto,sans-serif' }}>{s.sub}</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7, fontFamily:'Roboto,sans-serif' }}>{s.desc}</p>
              <p style={{ marginTop:14, fontSize:11, color:'rgba(139,92,246,0.5)', fontStyle:'italic', fontFamily:'Roboto,sans-serif' }}>{s.note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section id="early-access" className="sr-ea-section" style={{ maxWidth:1100, margin:'0 auto', padding:'80px 32px 120px', position:'relative', zIndex:20 }}>
        <div className="sr-ea-grid" style={{ border:'1px solid rgba(139,92,246,0.1)', background:'rgba(139,92,246,0.02)', borderRadius:32, padding:'64px 56px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, background:'rgba(139,92,246,0.05)', filter:'blur(40px)', borderRadius:'50%', pointerEvents:'none' }} />

          <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}>
            <p style={{ color:'#8b5cf6', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:16, fontFamily:'Roboto,sans-serif' }}>Limited Spots Remaining</p>
            <h2 style={{ fontFamily:'Roboto,sans-serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:800, color:'#fff', marginBottom:16, lineHeight:1.2 }}>Be the First to<br/>Know &amp; Create.</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.7, marginBottom:32, fontFamily:'Roboto,sans-serif' }}>Get early access and founding creator status when SocialRum launches.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {['Beta Access — Use all 5 tools before public launch','Founding Creator Badge — Exclusive profile recognition','Free Early Access Tier — No credit card required','Priority support from the SocialRum team'].map(b => (
                <div key={b} style={{ display:'flex', alignItems:'flex-start', gap:12, fontSize:14, color:'rgba(255,255,255,0.55)', fontFamily:'Roboto,sans-serif' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <svg viewBox="0 0 12 12" style={{ width:10, height:10 }} fill="none" strokeWidth={2.5} stroke="#a78bfa" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
            style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:24, padding:36, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:160, height:160, background:'rgba(139,92,246,0.1)', filter:'blur(30px)', borderRadius:'50%', pointerEvents:'none' }} />

            {step === 'done' && (
              <div className="sr-fade-in" style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ width:64, height:64, background:'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <svg viewBox="0 0 24 24" style={{ width:32, height:32, fill:'none', stroke:'white', strokeWidth:2.5 }}><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>You're In! 🎉</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:20, fontFamily:'Roboto,sans-serif' }}>Welcome to SocialRum early access.<br/>We'll notify you the moment we launch.</p>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:50, padding:'10px 20px', fontSize:13, color:'#a78bfa', fontWeight:500 }}>✅ Verified — {userEmail}</div>
              </div>
            )}

            {step === 'otp' && (
              <div className="sr-fade-in">
                <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>Check your email</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', marginBottom:6, fontFamily:'Roboto,sans-serif' }}>We sent a 6-digit code to</p>
                <p style={{ fontSize:15, color:'#a78bfa', fontWeight:600, marginBottom:24 }}>{userEmail}</p>
                <input ref={otpRef} type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit code" className="sr-input" style={{ letterSpacing:'0.35em', textAlign:'center', fontSize:22, marginBottom:12 }} onKeyDown={e => { if (e.key==='Enter') handleVerifyOTP(); }} />
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleVerifyOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Verifying...' : 'Verify & Get Access →'}</button>
                <button onClick={() => { setStep('email'); setErrorMsg(''); }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:12, cursor:'pointer', display:'block', width:'100%', textAlign:'center', padding:4, fontFamily:'Roboto,sans-serif' }}>← Use a different email</button>
              </div>
            )}

            {step === 'email' && (
              <div>
                <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>Free Early Access</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', marginBottom:24, fontFamily:'Roboto,sans-serif' }}>Enter your email — we'll send you a verification code.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                  <input id="sr-name-input" type="text" placeholder="Your name (optional)" className="sr-input" />
                  <input ref={emailRef} type="email" placeholder="you@example.com" className="sr-input" onKeyDown={e => { if (e.key==='Enter') handleSendOTP(); }} />
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleSendOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Sending code...' : 'Get Early Access →'}</button>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', textAlign:'center', fontFamily:'Roboto,sans-serif' }}>No spam. No credit card. Unsubscribe anytime.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sr-footer" style={{ borderTop:'1px solid rgba(139,92,246,0.1)', padding:'36px 64px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, position:'relative', zIndex:20, background:'#03000a' }}>
        <a href="/home" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:8, height:8, borderRadius:2, background:'#a855f7' }} />
          </div>
          <span style={{ fontFamily:'Roboto,sans-serif', fontWeight:700, fontSize:16, color:'#fff' }}>SocialRum</span>
        </a>
        <div className="sr-footer-links" style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
          {[['Features','#features'],['How It Works','#how-it-works'],['Early Access','#early-access'],['Contact','mailto:hello@socialrum.com']].map(([label,href]) => (
            <a key={label} href={href} style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none', fontSize:13, fontFamily:'Roboto,sans-serif', transition:'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color='#fff')} onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.3)')}>{label}</a>
          ))}
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', fontFamily:'Roboto,sans-serif' }}>© 2026 SocialRum · Built for Indian Creators 🇮🇳</p>
      </footer>
    </div>
  );
}
