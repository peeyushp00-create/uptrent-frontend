import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import SEO from '@/components/SEO';
import JsonLd from '@/components/JsonLd';

const FEATURES = [
  { num: '01', title: 'AI Personalized Script', desc: 'Your niche, your language, your voice — a full ready-to-film script in 60 seconds. Hooks that stop the scroll, bodies that hold retention, CTAs that convert.', tags: ['Hook', 'Body', 'CTA'] },
  { num: '02', title: 'Competitor Analyzer', desc: "See exactly what's winning for top creators in your space — and which gaps they're leaving open. Find the opportunity before everyone else does.", tags: ['Instagram', 'YouTube'] },
  { num: '03', title: 'Content Editing Suite', desc: 'Captions in every Indian language, thumbnails, and descriptions tuned for the algorithm. Write once, optimise everywhere, post in minutes.', tags: ['हिंदी', 'தமிழ்', 'తెలుగు', 'English'] },
  { num: '04', title: 'Trending Reels Analyzer', desc: 'Browse trending Reels by niche or hashtag with real views, likes, and virality scores — spot the format that\'s working before everyone else jumps on it.', tags: ['Instagram', 'YouTube'] },
];

const STEPS = [
  { num: '01', title: 'Connect Your Channels', sub: 'YouTube & Instagram in 2 minutes', desc: 'Link your accounts securely. SocialRum reads your performance data, audience demographics, and content library.', note: 'OAuth2.0 secure. Read-only access. Revoke anytime.' },
  { num: '02', title: 'Let AI Analyze & Generate', sub: 'Scripts, trends, and SEO — automated', desc: 'Our AI engine scans trending topics in your niche, analyzes your top-performing content, and generates scripts tailored to your audience.', note: 'Processes 150+ content signals per channel per day.' },
  { num: '03', title: 'Publish & Rank Faster', sub: 'From insight to upload in record time', desc: 'Act on SEO recommendations, publish optimized content, and track performance gains — all from one dark premium workspace.', note: 'Avg. 3.2× faster content-to-publish workflow.' },
];

// Rendered both as visible copy below and as FAQPage JSON-LD — keep in sync.
// TODO: review before publishing — drafted from the actual feature set and
// pricing already in this codebase (see PricingPage.tsx), not invented.
const FAQ_ITEMS = [
  {
    question: 'What is SocialRum?',
    answer: 'SocialRum is an AI content intelligence platform built for Indian YouTube and Instagram creators. It generates ready-to-film scripts, analyzes competitors, writes multilingual captions, and surfaces trending topics before they peak.',
  },
  {
    question: 'Who is SocialRum for?',
    answer: 'SocialRum is built for Indian creators and small teams making content for YouTube and Instagram, in English or Indian languages like Hindi, Tamil, and Telugu.',
  },
  {
    question: 'What can I do with SocialRum?',
    answer: 'You can generate AI scripts tailored to your niche and language, analyze what’s working for competitors on Instagram and YouTube, write captions in multiple Indian languages, and track trending topics and creator-economy news.',
  },
];

const STATS = [
  { value: '4', label: 'Creator Tools' },
  { value: '20+', label: 'Content Niches' },
  { value: 'Free', label: 'Early Access Tier' },
  { value: '100%', label: 'Made for India' },
];

const VIDEO_CARDS = [
  { id:1,  platform:'youtube',   title:'How I Got 100K Subs in 30 Days',       views:'2.4M', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1d6391833-1773075779744.png',  lane:0, speed:18, startOffset:0 },
  { id:2,  platform:'instagram', title:'Morning Routine That Changed My Life',  views:'890K', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1521eb58e-1764644106046.png',  lane:1, speed:22, startOffset:-40 },
  { id:3,  platform:'youtube',   title:'AI Tools Every Creator Needs in 2026', views:'1.1M', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1ddab98dc-1773131998650.png',  lane:2, speed:16, startOffset:-20 },
  { id:4,  platform:'instagram', title:'Street Food Tour in Tokyo',            views:'3.7M', thumbnail:'https://images.unsplash.com/photo-1516822561562-a6762898eb60?w=200',                 lane:3, speed:20, startOffset:-10 },
  { id:5,  platform:'youtube',   title:'Build a SaaS in 24 Hours Challenge',   views:'780K', thumbnail:'https://images.unsplash.com/photo-1564756296543-d61bebcd226a?w=200',                 lane:4, speed:19, startOffset:-50 },
  { id:6,  platform:'instagram', title:'Minimalist Home Makeover on Budget',   views:'1.5M', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_15eaab260-1772956699125.png',  lane:5, speed:21, startOffset:-80 },
  { id:7,  platform:'youtube',   title:'Camera Settings for Perfect Reels',    views:'640K', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1b0948c90-1771909777566.png',  lane:0, speed:17, startOffset:-70 },
  { id:8,  platform:'instagram', title:'Fitness Transformation 30 Days',       views:'4.3M', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_159a50448-1767636094533.png',  lane:1, speed:23, startOffset:-45 },
  { id:9,  platform:'youtube',   title:'Grow on YouTube with Zero Budget',     views:'920K', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_17b6062b2-1772483137359.png',  lane:2, speed:19, startOffset:-90 },
  { id:10, platform:'instagram', title:'Aesthetic Room Tour 2026',             views:'1.2M', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_150de2b75-1772333562367.png',  lane:3, speed:16, startOffset:-35 },
  { id:11, platform:'youtube',   title:'Top 10 Trending Niches Right Now',     views:'3.1M', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_126d7e136-1768020582546.png',  lane:4, speed:20, startOffset:-65 },
  { id:12, platform:'instagram', title:'Skincare Routine for Glowing Skin',    views:'2.9M', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_194b951ad-1772304624866.png',  lane:5, speed:18, startOffset:-25 },
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
        <motion.div animate={{ x:['-200%','300%'] }} transition={{ duration:4, repeat:Infinity, repeatDelay:0,ease:'linear' }}
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
  select.sr-input{cursor:pointer;appearance:none}
  select.sr-input option{background:#0a0414;color:#fff}
  textarea.sr-input{resize:none}
  .sr-ea-btn{width:100%;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600;font-family:'Roboto',sans-serif;cursor:pointer;transition:transform .15s,box-shadow .3s;box-shadow:0 0 30px rgba(124,58,237,0.4);margin-bottom:10px}
  .sr-ea-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 50px rgba(124,58,237,0.6)}
  .sr-ea-btn:disabled{opacity:.5;cursor:not-allowed}
  .sr-fade-in{animation:srFadeIn .4s ease both}
  @keyframes srFadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
  @keyframes srFloatDown{from{transform:translate3d(0,-380px,0)}to{transform:translate3d(0,calc(100vh + 380px),0)}}
  @keyframes srFloatUp{from{transform:translate3d(0,calc(100vh + 380px),0)}to{transform:translate3d(0,-380px,0)}}
  .sr-mobile-menu{position:fixed;inset:0;background:rgba(3,0,10,0.97);backdrop-filter:blur(20px);z-index:45;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;transform:translateY(-100%);transition:transform .4s cubic-bezier(.16,1,.3,1)}
  .sr-mobile-menu.open{transform:translateY(0)}
  .sr-mobile-menu a{color:#fff;font-size:22px;text-decoration:none;font-weight:700;letter-spacing:-.02em}
  .sr-dot{width:6px;height:6px;border-radius:50%;background:#8b5cf6;animation:srDotPulse 1.5s ease infinite}
  @keyframes srDotPulse{0%,100%{opacity:1}50%{opacity:.2}}
  @media(max-width:1024px){.sr-hero-grid{grid-template-columns:1fr !important}.sr-side-cards{display:none !important}.sr-hero-section{padding:100px 24px 60px !important;min-height:auto !important}}
  @media(max-width:768px){.sr-nav{padding:0 20px !important}.sr-nav-links{display:none !important}.sr-nav-cta{display:none !important}.sr-hamburger{display:flex !important}.sr-hero-section{padding:90px 20px 48px !important}.sr-stats{gap:32px !important;padding:32px 20px !important}.sr-section{padding:60px 20px !important}.sr-ea-section{padding:60px 20px 80px !important}.sr-ea-grid{grid-template-columns:1fr !important;gap:32px !important;padding:32px 24px !important}.sr-footer{padding:32px 20px !important;flex-direction:column !important;align-items:flex-start !important;gap:24px !important}.sr-footer-links{flex-wrap:wrap !important;gap:16px !important}.sr-step-card{padding:24px !important}}
`;

const ScreenSlot = ({ file, label }: { file: string; label: string }) => {
  const [err, setErr] = useState(false);
  return err
    ? <div style={{ width:'100%', aspectRatio:'16/9', background:'rgba(139,92,246,0.04)', border:'1px dashed rgba(139,92,246,0.2)', borderRadius:'0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.2)', fontFamily:'Roboto,sans-serif', textAlign:'center', padding:'0 16px' }}>
          Add screenshot → <code style={{ color:'rgba(139,92,246,0.5)', fontSize:11 }}>/public/screenshots/{file}.webp</code>
        </span>
      </div>
    : <img src={`/screenshots/${file}.webp`} alt={label} loading="lazy" onError={() => setErr(true)}
        style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' }} />;
};

export default function LandingPage() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [activeNiche, setActiveNiche] = useState(0);

  // Referral / form state
  const [step, setStep]             = useState<'form'|'questions'|'sent'|'status'>('form');
  const [formData, setFormData]     = useState({ name:'', email:'', whatsapp:'' });
  const [answers, setAnswers]       = useState({ platform:'', niche:'', language:'', follower_range:'', posting_frequency:'', biggest_struggle:'', weekly_feedback_ok:false });
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const [copied, setCopied]         = useState(false);
  const [stats, setStats]           = useState<{total:number;today:number}|null>(null);
  const [dispTotal, setDispTotal]   = useState(0);
  const [dispToday, setDispToday]   = useState(0);

  const BASE = import.meta.env.VITE_API_URL || 'https://uptrent-backend.onrender.com';

  const getStoredRef = () => {
    const p = new URLSearchParams(window.location.search);
    return p.get('ref') || localStorage.getItem('sr_ref') || '';
  };

  const fetchStatus = async (code: string) => {
    try {
      const r = await fetch(`${BASE}/api/waitlist/status?code=${code}`);
      const d = await r.json();
      if (r.ok) { setStatusData(d); setStep('status'); }
    } catch {}
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    document.title = 'SocialRum – Content Engine for Indian Creators | Scripts, Trends & Captions in Your Language';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const content = 'AI platform for Indian creators — discover trends, write scripts in your own voice & language, and analyse competitors on Instagram & YouTube. Join the waitlist.';
    if (meta) meta.setAttribute('content', content);
    else { meta = document.createElement('meta'); meta.name='description'; meta.content=content; document.head.appendChild(meta); }
  }, []);

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

  // Persist referral code + handle magic-link return
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ref = p.get('ref');
    if (ref) {
      localStorage.setItem('sr_ref', ref);
      const exp = new Date(Date.now() + 30*24*60*60*1000).toUTCString();
      document.cookie = `sr_ref=${encodeURIComponent(ref)}; expires=${exp}; path=/; SameSite=Lax`;
    }
    const code = p.get('code');
    if (code) {
      fetchStatus(code);
      setTimeout(() => document.getElementById('early-access')?.scrollIntoView({ behavior:'smooth' }), 300);
    }
  }, []);

  // Live applicant counter
  useEffect(() => {
    fetch(`${BASE}/api/waitlist/stats`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!stats) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDispTotal(stats.total); setDispToday(stats.today); return;
    }
    const dur = 1200, t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      const e = 1 - (1 - t) ** 3;
      setDispTotal(Math.round(stats.total * e));
      setDispToday(Math.round(stats.today * e));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [stats]);

  const handleNext = () => {
    if (!formData.email || !formData.email.includes('@')) { setErrorMsg('Please enter a valid email.'); return; }
    setErrorMsg(''); setStep('questions');
  };

  const handleSubmit = async () => {
    setLoading(true); setErrorMsg('');
    const p = new URLSearchParams(window.location.search);
    try {
      const res = await fetch(`${BASE}/api/waitlist`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          name: formData.name || formData.email.split('@')[0],
          email: formData.email, whatsapp: formData.whatsapp || null,
          answers, ref: getStoredRef(),
          utm_source: p.get('utm_source')||undefined,
          utm_medium: p.get('utm_medium')||undefined,
          utm_campaign: p.get('utm_campaign')||undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      if (data.already_registered) {
        if (data.referral_code && data.status === 'verified') await fetchStatus(data.referral_code);
        else setErrorMsg("You're already on the list! Check your email for the confirmation link.");
        return;
      }
      setStep('sent');
    } catch (err: any) { setErrorMsg(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen bg-[#03000a] text-white overflow-x-hidden" style={{ fontFamily:"'Roboto',sans-serif" }}>
      <SEO
        title="SocialRum — Content Intelligence for Indian Creators"
        description="SocialRum is an AI content platform for Indian YouTube and Instagram creators. Generate ready-to-film scripts in your language, analyze competitors, write multilingual captions, and track trending topics — free to start."
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SocialRum",
          url: "https://www.socialrum.com",
          logo: "https://www.socialrum.com/socialrum-logo.png",
          description: "SocialRum is an AI content intelligence platform that helps Indian creators write scripts, analyze competitors, and find trending topics in their own language.",
          // TODO: add the Facebook page URL once you give it to me — I'm not
          // including a guessed one, since a wrong sameAs link is worse than
          // a missing one (schema.org sameAs must point to a verified profile).
          sameAs: [
            "https://www.instagram.com/socialrum.official",
            "https://medium.com/@socialrum.official",
            "https://www.reddit.com/user/SocialRum/",
            "https://www.quora.com/profile/SocialRum",
          ],
        }}
      />
      <style>{css}</style>

      {/* Mobile menu */}
      <div className={`sr-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#screenshots" onClick={() => setMenuOpen(false)}>Screenshots</a>
        <a href="#early-access" onClick={() => setMenuOpen(false)} style={{ color:'#a855f7' }}>Early Access</a>
        <a href="#early-access" onClick={() => setMenuOpen(false)}
          style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', padding:'14px 32px', borderRadius:50, fontSize:15, fontWeight:700 }}>
          Apply for Beta
        </a>
      </div>

      {/* Animated bg */}
      <motion.div animate={{ scale:[1,1.06,1], rotate:[0,2,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }}
        style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', background:'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.09), transparent 65%)' }} />
      <motion.div animate={{ y:[0,-15,0], x:[0,10,0] }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
        style={{ position:'fixed', inset:-20, zIndex:1, pointerEvents:'none', opacity:0.025, backgroundImage:'linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />

      {/* Floating video cards */}
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
        <div style={{ display:'flex', alignItems:'center', gap:10, zIndex:51 }}>
          <div style={{ width:36, height:36, borderRadius:10, overflow:'hidden', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src="/socialrum-logo.png" alt="SocialRum" style={{ width:36, height:36, objectFit:'cover', borderRadius:10 }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const dot = document.createElement('div');
                  dot.style.cssText = 'width:10px;height:10px;border-radius:3px;background:#a855f7;box-shadow:0 0 10px #a855f7';
                  parent.appendChild(dot);
                }
              }} />
          </div>
          <span style={{ fontFamily:'Roboto,sans-serif', fontWeight:700, fontSize:18, color:'#fff', letterSpacing:'-.02em' }}>SocialRum</span>
        </div>

        <ul className="sr-nav-links" style={{ display:'flex', gap:40, listStyle:'none', margin:0, padding:0 }}>
          {[['Features','#features'],['Screenshots','#screenshots'],['Blog','/blog'],['Early Access','#early-access']].map(([label,href]) => (
            <li key={label}><a href={href} style={{ color:'rgba(255,255,255,0.55)', textDecoration:'none', fontSize:14, fontFamily:'Roboto,sans-serif', transition:'color .2s' }} onMouseEnter={e => (e.currentTarget.style.color='#fff')} onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.55)')}>{label}</a></li>
          ))}
        </ul>

        <a href="#early-access" className="sr-nav-cta" style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(139,92,246,0.3)', padding:'10px 22px', borderRadius:50, fontSize:13, fontWeight:600, color:'#fff', textDecoration:'none' }}>
          Apply for Beta
        </a>

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

          {/* LEFT */}
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
              <span className="sr-dot" />
              {stats ? `${stats.total} creators in — 50 spots total` : 'Beta open · Only 50 spots'}
            </motion.div>

            <HeroTitle />

            <motion.h2 initial={{ opacity:0, y:20, filter:'blur(8px)' }} animate={{ opacity:1, y:0, filter:'blur(0px)' }} transition={{ duration:0.8, delay:0.8, ease:[0.16,1,0.3,1] }}
              style={{ fontFamily:'Roboto,sans-serif', fontSize:'clamp(18px,4vw,32px)', fontWeight:700, color:'#fff', marginBottom:16, lineHeight:1.3 }}>
              Your competitors are already{' '}
              <motion.span animate={{ color:['#8b5cf6','#a78bfa','#8b5cf6'] }} transition={{ duration:3, repeat:Infinity }}>using AI</motion.span>
              <br/>to plan content. Are you?
            </motion.h2>

            <motion.p initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:1.0, ease:[0.16,1,0.3,1] }}
              style={{ fontFamily:'Roboto,sans-serif', fontSize:14, color:'rgba(255,255,255,0.5)', maxWidth:380, lineHeight:1.8, marginBottom:32, padding:'0 8px' }}>
              Most Indian creators post 3× a week for months and never break through — not because of effort, but because they don't know <em style={{ color:'rgba(255,255,255,0.7)', fontStyle:'normal' }}>what</em> to create. SocialRum fixes that.
            </motion.p>

            {/* Live counter — only shown when API returns data */}
            {stats && (
              <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5, delay:1.3 }}
                style={{ fontSize:12, color:'rgba(139,92,246,0.7)', fontFamily:'Roboto,sans-serif', marginBottom:16 }}>
                <strong style={{ color:'#a78bfa' }}>{dispTotal.toLocaleString()}</strong> creators applied · <strong style={{ color:'#a78bfa' }}>{dispToday}</strong> today
              </motion.p>
            )}

            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:1.2, ease:[0.16,1,0.3,1] }}
              style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
              <motion.a href="#early-access" whileHover={{ scale:1.06 }} whileTap={{ scale:0.97 }}
                style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontWeight:600, fontSize:14, padding:'14px 28px', borderRadius:50, textDecoration:'none', boxShadow:'0 0 30px rgba(124,58,237,0.5)', display:'inline-flex', alignItems:'center', gap:8 }}>
                Apply for Beta
                <motion.span animate={{ x:[0,4,0] }} transition={{ duration:1.2, repeat:Infinity }}>→</motion.span>
              </motion.a>
              <motion.a href="#features" whileHover={{ color:'#fff' }}
                style={{ fontSize:14, color:'rgba(255,255,255,0.5)', textDecoration:'none', fontFamily:'Roboto,sans-serif', display:'inline-flex', alignItems:'center', gap:6 }}>
                Explore Features
                <motion.span animate={{ y:[0,3,0] }} transition={{ duration:1.2, repeat:Infinity }}>▼</motion.span>
              </motion.a>
            </motion.div>
          </div>

          {/* RIGHT */}
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
                    <span>{tag}</span><span style={{ color:'#a78bfa', fontSize:10, fontWeight:600 }}>→ {status}</span>
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
        <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ fontFamily:'Roboto,sans-serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:800, color:'#fff', marginBottom:12, letterSpacing:'-.02em' }}>Stop winging it. Start winning it.</motion.h2>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ fontSize:15, color:'rgba(255,255,255,0.4)', maxWidth:500, marginBottom:48, lineHeight:1.7, fontFamily:'Roboto,sans-serif' }}>Four tools that replace the guesswork — so every video you post has a real shot at the algorithm.</motion.p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.num} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.08 }} className="sr-step-card">
              <div className="sr-step-num">{f.num}</div>
              <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:17, fontWeight:700, color:'#fff', marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7, marginBottom:14, fontFamily:'Roboto,sans-serif' }}>{f.desc}</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {f.tags.map(tag => <span key={tag} className="sr-feature-tag">{tag}</span>)}
              </div>
            </motion.div>
          ))}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.4 }}
            className="sr-step-card" style={{ display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:50, padding:'5px 14px', marginBottom:16 }}>
                <span className="sr-dot" />
                <span style={{ fontSize:11, fontWeight:600, color:'rgba(139,92,246,0.7)', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'Roboto,sans-serif' }}>Coming Soon</span>
              </div>
              <p style={{ fontFamily:'Roboto,sans-serif', fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.25)', marginBottom:8 }}>More tools in the pipeline</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.12)', fontFamily:'Roboto,sans-serif', lineHeight:1.6 }}>YouTube SEO, trending topic radar, thumbnail analyser and more — early access members get every new tool first.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SCREENSHOTS */}
      <section id="screenshots" className="sr-section" style={{ maxWidth:1100, margin:'0 auto', padding:'80px 32px', position:'relative', zIndex:20 }}>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ color:'#8b5cf6', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12, fontFamily:'Roboto,sans-serif' }}>See It In Action</motion.p>
        <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ fontFamily:'Roboto,sans-serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:800, color:'#fff', marginBottom:48, letterSpacing:'-.02em' }}>Built for creators who want results, not just insights.</motion.h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(420px,1fr))', gap:28 }}>
          {[
            { file:'script', label:'AI Personalized Script', desc:'Scripts written in your niche, your language, and your voice — ready to film.' },
            { file:'competitor', label:'Competitor Analyzer', desc:'Deep-dive on any creator profile. Spot the content gaps before your competition does.' },
          ].map((item, i) => (
            <motion.div key={item.file} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i * 0.1 }}
              style={{ background:'rgba(139,92,246,0.03)', border:'1px solid rgba(139,92,246,0.12)', borderRadius:20, overflow:'hidden' }}>
              <ScreenSlot file={item.file} label={item.label} />
              <div style={{ padding:'18px 22px 24px' }}>
                <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:17, fontWeight:700, color:'#fff', marginBottom:7 }}>{item.label}</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7, fontFamily:'Roboto,sans-serif' }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EARLY ACCESS — multi-step referral form */}
      <section id="early-access" className="sr-ea-section" style={{ maxWidth:1100, margin:'0 auto', padding:'80px 32px 120px', position:'relative', zIndex:20 }}>
        <div className="sr-ea-grid" style={{ border:'1px solid rgba(139,92,246,0.1)', background:'rgba(139,92,246,0.02)', borderRadius:32, padding:'64px 56px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, background:'rgba(139,92,246,0.05)', filter:'blur(40px)', borderRadius:'50%', pointerEvents:'none' }} />

          {/* Left: benefits */}
          <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}>
            <p style={{ color:'#8b5cf6', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:16, fontFamily:'Roboto,sans-serif' }}>Limited Spots Remaining</p>
            <h2 style={{ fontFamily:'Roboto,sans-serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:800, color:'#fff', marginBottom:16, lineHeight:1.2 }}>Be the First to<br/>Know &amp; Create.</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.7, marginBottom:32, fontFamily:'Roboto,sans-serif' }}>Get early access and founding creator status when SocialRum launches.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                'Beta Access — Use all 5 tools before public launch',
                'Founding Creator Badge — Exclusive profile recognition',
                'Free Early Access Tier — No credit card required',
                'Priority support from the SocialRum team',
              ].map(b => (
                <div key={b} style={{ display:'flex', alignItems:'flex-start', gap:12, fontSize:14, color:'rgba(255,255,255,0.55)', fontFamily:'Roboto,sans-serif' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <svg viewBox="0 0 12 12" style={{ width:10, height:10 }} fill="none" strokeWidth={2.5} stroke="#a78bfa" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
            style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:24, padding:36, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:160, height:160, background:'rgba(139,92,246,0.1)', filter:'blur(30px)', borderRadius:'50%', pointerEvents:'none' }} />

            {step === 'form' && (
              <div className="sr-fade-in">
                <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>Apply for Beta Access</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', marginBottom:24, lineHeight:1.6, fontFamily:'Roboto,sans-serif' }}>Be among the first Indian creators to get access to SocialRum.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
                  <input type="text" placeholder="Your name (optional)" value={formData.name} onChange={e => setFormData(p => ({ ...p, name:e.target.value }))} className="sr-input" />
                  <input type="email" placeholder="your@email.com *" value={formData.email} onChange={e => setFormData(p => ({ ...p, email:e.target.value }))} className="sr-input" onKeyDown={e => { if (e.key==='Enter') handleNext(); }} />
                  <input type="text" placeholder="WhatsApp number or username (optional)" value={formData.whatsapp} onChange={e => setFormData(p => ({ ...p, whatsapp:e.target.value }))} className="sr-input" />
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleNext} className="sr-ea-btn">Next →</button>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', textAlign:'center', fontFamily:'Roboto,sans-serif' }}>No spam. Unsubscribe anytime.</p>
              </div>
            )}

            {step === 'questions' && (
              <div className="sr-fade-in">
                <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:20, fontWeight:700, color:'#fff', marginBottom:6 }}>Quick questions</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:20, fontFamily:'Roboto,sans-serif' }}>Help us understand your creator journey.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                  <select value={answers.platform} onChange={e => setAnswers(p => ({ ...p, platform:e.target.value }))} className="sr-input">
                    <option value="">Platform you create on *</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="both">Both</option>
                  </select>
                  <select value={answers.niche} onChange={e => setAnswers(p => ({ ...p, niche:e.target.value }))} className="sr-input">
                    <option value="">Your content niche *</option>
                    <option value="finance">Finance</option>
                    <option value="fitness">Fitness &amp; Health</option>
                    <option value="technology">Technology &amp; AI</option>
                    <option value="gaming">Gaming</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="food">Food &amp; Cooking</option>
                    <option value="travel">Travel</option>
                    <option value="education">Education</option>
                    <option value="comedy">Comedy &amp; Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                  <select value={answers.language} onChange={e => setAnswers(p => ({ ...p, language:e.target.value }))} className="sr-input">
                    <option value="">Content language *</option>
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                    <option value="hinglish">Hinglish</option>
                    <option value="tamil">Tamil</option>
                    <option value="telugu">Telugu</option>
                    <option value="bengali">Bengali</option>
                    <option value="kannada">Kannada</option>
                    <option value="marathi">Marathi</option>
                    <option value="other">Other</option>
                  </select>
                  <select value={answers.follower_range} onChange={e => setAnswers(p => ({ ...p, follower_range:e.target.value }))} className="sr-input">
                    <option value="">Current followers *</option>
                    <option value="0-1k">Just starting (0 – 1K)</option>
                    <option value="1k-10k">Growing (1K – 10K)</option>
                    <option value="10k-100k">Established (10K – 100K)</option>
                    <option value="100k+">Large (100K+)</option>
                  </select>
                  <select value={answers.posting_frequency} onChange={e => setAnswers(p => ({ ...p, posting_frequency:e.target.value }))} className="sr-input">
                    <option value="">Posting frequency *</option>
                    <option value="daily">Daily</option>
                    <option value="2-3x_week">2–3× a week</option>
                    <option value="weekly">Weekly</option>
                    <option value="less_than_weekly">Less than weekly</option>
                  </select>
                  <textarea value={answers.biggest_struggle} onChange={e => setAnswers(p => ({ ...p, biggest_struggle:e.target.value }))} placeholder="Biggest content challenge? (optional)" className="sr-input" style={{ height:64 }} />
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:13, color:'rgba(255,255,255,0.45)', fontFamily:'Roboto,sans-serif' }}>
                    <input type="checkbox" checked={answers.weekly_feedback_ok} onChange={e => setAnswers(p => ({ ...p, weekly_feedback_ok:e.target.checked }))} style={{ width:16, height:16, accentColor:'#7c3aed', cursor:'pointer' }} />
                    I'm open to giving weekly feedback during beta
                  </label>
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleSubmit} disabled={loading} className="sr-ea-btn">{loading ? 'Submitting...' : 'Apply for Beta →'}</button>
                <button onClick={() => { setStep('form'); setErrorMsg(''); }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:12, cursor:'pointer', display:'block', width:'100%', textAlign:'center', padding:4, fontFamily:'Roboto,sans-serif' }}>← Back</button>
              </div>
            )}

            {step === 'sent' && (
              <div className="sr-fade-in" style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ width:64, height:64, background:'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <svg viewBox="0 0 24 24" style={{ width:32, height:32, fill:'none', stroke:'white', strokeWidth:2 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <h3 style={{ fontFamily:'Roboto,sans-serif', fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>Check your email!</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:16, fontFamily:'Roboto,sans-serif' }}>
                  We sent a confirmation link to<br/><strong style={{ color:'#a78bfa' }}>{formData.email}</strong>
                </p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', fontFamily:'Roboto,sans-serif' }}>Click the link to confirm your spot and unlock your referral link.</p>
              </div>
            )}

            {step === 'status' && statusData && (
              <div className="sr-fade-in">

                {/* Royalty Badge */}
                <div style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(168,85,247,0.1))', border:'1px solid rgba(168,85,247,0.35)', borderRadius:18, padding:'18px 20px', marginBottom:16, textAlign:'center', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:'rgba(168,85,247,0.15)', filter:'blur(20px)', borderRadius:'50%', pointerEvents:'none' }} />
                  <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', boxShadow:'0 0 24px rgba(139,92,246,0.5)' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path d="M2 20h20M5 20V10l7-7 7 7v10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3 10l9-8 9 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 3L2 11h20L12 3z" fill="rgba(255,255,255,0.15)"/>
                      <circle cx="12" cy="6" r="1.5" fill="#fff"/>
                      <path d="M7 20v-5a2 2 0 012-2h6a2 2 0 012 2v5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize:11, color:'rgba(168,85,247,0.8)', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, fontFamily:'Roboto,sans-serif', marginBottom:4 }}>You've earned</p>
                  <p style={{ fontSize:20, fontWeight:800, color:'#fff', fontFamily:'Roboto,sans-serif', marginBottom:4, letterSpacing:'-0.01em' }}>Beta Royalty Badge 👑</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:'Roboto,sans-serif', lineHeight:1.5 }}>
                    {statusData.status === 'verified'
                      ? 'This exclusive badge will appear on your SocialRum profile at launch — only beta members get it.'
                      : 'Verify your email to activate your Beta Royalty Badge and lock your spot.'}
                  </p>
                </div>

                {/* Tier progress */}
                <div style={{ background:'rgba(139,92,246,0.05)', border:'1px solid rgba(139,92,246,0.14)', borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:11, fontFamily:'Roboto,sans-serif' }}>Reward tiers</p>
                  {[{ l:'Mover',r:1 },{ l:'Locked In',r:3 },{ l:'Founding Creator',r:5 },{ l:'Legend',r:10 }].map(t => {
                    const done = (statusData.referral_count||0) >= t.r;
                    return (
                      <div key={t.l} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:7 }}>
                        <div style={{ width:16,height:16,borderRadius:'50%',background:done?'linear-gradient(135deg,#7c3aed,#a855f7)':'rgba(255,255,255,0.07)',border:done?'none':'1px solid rgba(255,255,255,0.1)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
                          {done && <svg viewBox="0 0 12 12" style={{ width:8,height:8 }} fill="none" strokeWidth={2.5} stroke="#fff" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>}
                        </div>
                        <span style={{ fontSize:13,color:done?'#a78bfa':'rgba(255,255,255,0.3)',flex:1,fontFamily:'Roboto,sans-serif' }}>{t.l}</span>
                        <span style={{ fontSize:11,color:'rgba(255,255,255,0.18)',fontFamily:'Roboto,sans-serif' }}>{t.r} ref{t.r>1?'s':''}</span>
                      </div>
                    );
                  })}
                  {statusData.next_tier && (
                    <div style={{ marginTop:10,padding:'8px 12px',background:'rgba(139,92,246,0.08)',borderRadius:10,fontSize:12,color:'#a78bfa',textAlign:'center',fontFamily:'Roboto,sans-serif' }}>
                      <strong>{statusData.next_tier.referrals_needed}</strong> more referral{statusData.next_tier.referrals_needed!==1?'s':''} → <strong>{statusData.next_tier.label}</strong>
                    </div>
                  )}
                </div>

                {/* Referral link */}
                <div style={{ marginBottom:11 }}>
                  <p style={{ fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:7,fontFamily:'Roboto,sans-serif' }}>Your referral link</p>
                  <div style={{ display:'flex',gap:8 }}>
                    <div style={{ flex:1,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#a78bfa',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {statusData.referral_link}
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(statusData.referral_link); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
                      style={{ background:copied?'rgba(74,222,128,0.1)':'rgba(139,92,246,0.1)',border:`1px solid ${copied?'rgba(74,222,128,0.28)':'rgba(139,92,246,0.28)'}`,borderRadius:10,padding:'10px 14px',color:copied?'#4ADE80':'#a78bfa',fontSize:12,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'Roboto,sans-serif',transition:'all .2s' }}>
                      {copied?'✓ Copied':'Copy'}
                    </button>
                  </div>
                </div>

                <a href={`https://wa.me/?text=${encodeURIComponent(`I just applied for SocialRum's beta — AI that turns trending topics into ready-to-film scripts in your language. Only 50 spots. Apply here: ${statusData.referral_link}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10,width:'100%',background:'#25D366',color:'#fff',borderRadius:12,padding:'13px',fontWeight:700,fontSize:15,textDecoration:'none',marginBottom:8,fontFamily:'Roboto,sans-serif',boxSizing:'border-box' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Share on WhatsApp
                </a>
                <div style={{ display:'flex',gap:8 }}>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(statusData.referral_link)}`} target="_blank" rel="noopener noreferrer"
                    style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(10,102,194,0.1)',border:'1px solid rgba(10,102,194,0.22)',borderRadius:10,padding:'10px',color:'#60a5fa',fontSize:12,textDecoration:'none',fontWeight:600,fontFamily:'Roboto,sans-serif' }}>
                    LinkedIn
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just applied for @SocialRum beta — AI tools for Indian creators. Only 50 spots! ${statusData.referral_link}`)}`} target="_blank" rel="noopener noreferrer"
                    style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:10,padding:'10px',color:'rgba(255,255,255,0.5)',fontSize:12,textDecoration:'none',fontWeight:600,fontFamily:'Roboto,sans-serif' }}>
                    X (Twitter)
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* FAQ — visible copy must match the FAQPage JSON-LD below verbatim
          (see FAQ_ITEMS above). Review before publishing. */}
      <section id="faq" className="sr-section" style={{ maxWidth:800, margin:'0 auto', padding:'80px 32px', position:'relative', zIndex:20 }}>
        <h2 style={{ fontSize:32, fontWeight:700, textAlign:'center', marginBottom:48 }}>Frequently Asked Questions</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} style={{ borderBottom:'1px solid rgba(139,92,246,0.15)', paddingBottom:24 }}>
              <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{item.question}</h3>
              <p style={{ fontSize:15, lineHeight:1.6, color:'rgba(255,255,255,0.65)' }}>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />

      {/* FOOTER */}
      <footer className="sr-footer" style={{ borderTop:'1px solid rgba(139,92,246,0.08)', padding:'32px 64px', display:'flex', flexDirection:'column', gap:20, position:'relative', zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:8, overflow:'hidden', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src="/socialrum-logo.png" alt="SocialRum" style={{ width:28, height:28, objectFit:'cover', borderRadius:8 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <span style={{ fontFamily:'Roboto,sans-serif', fontWeight:700, fontSize:15, color:'rgba(255,255,255,0.6)' }}>SocialRum</span>
          </div>
          <div className="sr-footer-links" style={{ display:'flex', gap:24 }}>
            {[['Features','#features'],['Screenshots','#screenshots'],['Blog','/blog'],['Early Access','#early-access']].map(([label,href]) => (
              <a key={label} href={href}
                style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none', fontSize:13, fontFamily:'Roboto,sans-serif', transition:'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color='rgba(255,255,255,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.3)')}>
                {label}
              </a>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {[
              { href:'https://www.instagram.com/socialrum.official?igsh=d3YxcHM2dXplaGx1', label:'Instagram', path:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              { href:'https://www.linkedin.com/company/socialrum/', label:'LinkedIn', path:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              { href:'#', label:'X (Twitter)', path:'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
              { href:'#', label:'Facebook', path:'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
            ].map(({ href, label, path }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', transition:'all .2s', color:'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.2)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.4)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.35)'; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
              </a>
            ))}
          </div>
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', fontFamily:'Roboto,sans-serif', textAlign:'center' }}>© 2026 SocialRum. Made for India 🇮🇳</p>
      </footer>
    </div>
  );
}
