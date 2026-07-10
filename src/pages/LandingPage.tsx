import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DEADLINE = 'July 17';

const FEATURES = [
  {
    slot: 'S2',
    title: 'Trending topics in your niche',
    body: 'Live trends filtered to what your audience actually watches — not generic hashtag lists.',
    img: '/screenshots/s2.webp',
  },
  {
    slot: 'S3',
    title: 'Know exactly what to post next',
    body: "Personalized recommendations based on your niche, your past posts, and what's rising right now.",
    img: '/screenshots/s3.webp',
  },
  {
    slot: 'S4',
    title: 'Ready-to-film scripts',
    body: 'Hook, body, and CTA written for the format — Reels, Shorts, or long-form.',
    img: '/screenshots/s4.webp',
  },
  {
    slot: 'S5',
    title: 'Captions in every Indian language',
    body: 'हिंदी, தமிழ், മലയാളം, తెలుగు and more — written natively, not translated word-for-word.',
    img: '/screenshots/s5.webp',
  },
];

const AVATARS = [
  { bg: 'linear-gradient(135deg,#7C5CFC,#a855f7)', l: 'A' },
  { bg: 'linear-gradient(135deg,#f59e0b,#ef4444)',  l: 'R' },
  { bg: 'linear-gradient(135deg,#06b6d4,#3b82f6)',  l: 'P' },
  { bg: 'linear-gradient(135deg,#10b981,#059669)',   l: 'S' },
  { bg: 'linear-gradient(135deg,#ec4899,#8b5cf6)',   l: 'K' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400&display=swap');
  * { box-sizing: border-box; }

  .sr3-dot {
    width:8px;height:8px;border-radius:50%;background:#FF4D6D;flex-shrink:0;
    animation:sr3Pulse 1.6s ease infinite;
  }
  @keyframes sr3Pulse {
    0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(255,77,109,0.4)}
    50%{opacity:.85;transform:scale(1.2);box-shadow:0 0 0 6px rgba(255,77,109,0)}
  }

  .sr3-cta {
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    background:linear-gradient(135deg,#7C5CFC,#9B7DFF);
    color:#fff;font-family:Inter,sans-serif;font-weight:600;font-size:16px;
    padding:16px 36px;border-radius:999px;text-decoration:none;border:none;cursor:pointer;
    box-shadow:0 0 32px rgba(124,92,252,0.45);
    transition:transform .15s ease,box-shadow .2s ease;
  }
  .sr3-cta:hover{transform:translateY(-2px);box-shadow:0 0 52px rgba(124,92,252,0.65)}

  .sr-input{width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(124,92,252,0.2);border-radius:12px;padding:12px 16px;color:#F4F2FA;font-size:14px;font-family:Inter,sans-serif;outline:none;transition:border-color .3s,box-shadow .3s;box-sizing:border-box}
  .sr-input:focus{border-color:#7C5CFC;box-shadow:0 0 0 3px rgba(124,92,252,0.15)}
  .sr-input::placeholder{color:rgba(255,255,255,0.25)}
  select.sr-input{cursor:pointer;appearance:none}
  select.sr-input option{background:#0F0B1D;color:#F4F2FA}
  textarea.sr-input{resize:none}

  .sr3-btn{width:100%;background:linear-gradient(135deg,#7C5CFC,#9B7DFF);color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600;font-family:Inter,sans-serif;cursor:pointer;transition:transform .15s,box-shadow .2s;box-shadow:0 0 24px rgba(124,92,252,0.35);margin-bottom:10px}
  .sr3-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 40px rgba(124,92,252,0.55)}
  .sr3-btn:disabled{opacity:.5;cursor:not-allowed}

  .sr3-in{animation:sr3In .4s ease both}
  @keyframes sr3In{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  @media(prefers-reduced-motion:reduce){
    .sr3-dot{animation:none!important}
    .sr3-cta,.sr3-btn{transition:none!important}
  }
  @media(max-width:768px){
    .sr3-grid{grid-template-columns:1fr!important}
    .sr3-ea{grid-template-columns:1fr!important;gap:32px!important;padding:32px 20px!important}
    .sr3-flow{flex-wrap:wrap!important;gap:10px!important;justify-content:center!important}
    .sr3-nav{padding:0 20px!important}
  }
`;

export default function LandingPage() {
  const [scrolled, setScrolled]   = useState(false);
  const [step, setStep]           = useState<'form'|'questions'|'sent'|'status'>('form');
  const [formData, setFormData]   = useState({ name:'', email:'', whatsapp:'' });
  const [answers, setAnswers]     = useState({ platform:'', niche:'', language:'', follower_range:'', posting_frequency:'', biggest_struggle:'', weekly_feedback_ok:false });
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [copied, setCopied]       = useState(false);
  const [stats, setStats]         = useState<{total:number;today:number}|null>(null);
  const [dispTotal, setDispTotal] = useState(0);
  const [dispToday, setDispToday] = useState(0);

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

  // SEO
  useEffect(() => {
    document.title = 'SocialRum – Stop guessing what to post | Beta Access';
    let m = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const c = 'SocialRum is your personal content agency in your pocket — trending topics, what to post next, ready-to-film scripts, and captions in every Indian language. Apply for beta.';
    if (m) m.setAttribute('content', c);
    else { m = document.createElement('meta'); m.name='description'; m.content=c; document.head.appendChild(m); }
  }, []);

  // Ref attribution + magic-link return
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
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Fetch live applicant count
  useEffect(() => {
    fetch(`${BASE}/api/waitlist/stats`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, []);

  // Animate counter 0 → total
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

  const ScreenSlot = ({ slot, img, ratio }: { slot:string; img:string; ratio:string }) => {
    const [err, setErr] = useState(false);
    return err
      ? <div style={{ width:'100%', aspectRatio:ratio, background:'rgba(124,92,252,0.04)', border:'1px dashed rgba(124,92,252,0.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.15)', fontFamily:'Inter,sans-serif' }}>{slot} · add screenshot to /public/screenshots/</span>
        </div>
      : <img src={img} alt={slot} loading="lazy" onError={() => setErr(true)}
          style={{ width:'100%', aspectRatio:ratio, objectFit:'cover', borderRadius:12, display:'block' }} />;
  };

  const [s1Err, setS1Err] = useState(false);

  return (
    <div style={{ background:'#08060F', minHeight:'100vh', color:'#F4F2FA', fontFamily:'Inter,sans-serif', overflowX:'hidden' }}>
      <style>{css}</style>

      {/* ── NAV ── */}
      <nav className="sr3-nav" style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, height:64, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', transition:'background .3s,border-color .3s', background:scrolled?'rgba(8,6,15,0.96)':'transparent', backdropFilter:scrolled?'blur(16px)':'none', borderBottom:scrolled?'1px solid rgba(255,255,255,0.06)':'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, overflow:'hidden', background:'rgba(124,92,252,0.1)', border:'1px solid rgba(124,92,252,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src="/logo.png" alt="SocialRum" style={{ width:30, height:30, objectFit:'cover', borderRadius:8 }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
          </div>
          <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:17, color:'#F4F2FA', letterSpacing:'-.01em' }}>SocialRum</span>
        </div>
        <a href="#early-access" className="sr3-cta" style={{ padding:'10px 22px', fontSize:14 }}>Apply for Beta</a>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop:136, paddingBottom:72, textAlign:'center', maxWidth:780, margin:'0 auto', padding:'136px 24px 72px', position:'relative', zIndex:10 }}>
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
          style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(124,92,252,0.1)', border:'1px solid rgba(124,92,252,0.25)', borderRadius:999, padding:'7px 16px', fontSize:13, color:'#A29AC0', fontFamily:'Inter,sans-serif', marginBottom:28 }}>
          <span className="sr3-dot" />
          Beta applications open · 50 spots only
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}
          style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:'clamp(38px,5.4vw,62px)', letterSpacing:'-0.025em', lineHeight:1.06, color:'#F4F2FA', margin:'0 0 20px' }}>
          Stop guessing what to post.
        </motion.h1>

        <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }}
          style={{ fontSize:'clamp(15px,1.6vw,18px)', color:'#A29AC0', lineHeight:1.75, maxWidth:580, margin:'0 auto 32px', fontFamily:'Inter,sans-serif' }}>
          SocialRum is your <strong style={{ color:'#F4F2FA', fontWeight:600 }}>personal content agency in your pocket</strong> — it spots what's trending in your niche, tells you what to post next, writes the script, and generates captions in any Indian language. You just hit record.
        </motion.p>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.3 }}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:32 }}>
          <a href="#early-access" className="sr3-cta" style={{ width:'100%', maxWidth:360, minHeight:52 }}>
            Apply for Beta Access →
          </a>
          <p style={{ fontSize:13, color:'#6E6790', fontFamily:'Inter,sans-serif' }}>
            Takes 60 seconds · No card needed · Applications close {DEADLINE}
          </p>
        </motion.div>

        {/* Proof row — only shown when API returns data */}
        {stats && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5, delay:0.5 }}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <div style={{ display:'flex' }}>
              {AVATARS.map((av, i) => (
                <div key={i} style={{ width:32, height:32, borderRadius:'50%', background:av.bg, border:'2px solid #08060F', marginLeft:i>0?-9:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', fontFamily:'Inter,sans-serif', flexShrink:0 }}>
                  {av.l}
                </div>
              ))}
            </div>
            <span style={{ fontSize:13, color:'#A29AC0', fontFamily:'Inter,sans-serif' }}>
              <strong style={{ color:'#F4F2FA' }}>{dispTotal.toLocaleString()}</strong> creators have applied · <strong style={{ color:'#F4F2FA' }}>{dispToday}</strong> today
            </span>
          </motion.div>
        )}
      </section>

      {/* ── S1 BROWSER FRAME ── */}
      <div style={{ maxWidth:1020, margin:'0 auto 88px', padding:'0 24px', position:'relative', zIndex:10 }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'70%', height:'80%', background:'radial-gradient(ellipse at center,rgba(124,92,252,0.16),transparent 70%)', pointerEvents:'none', zIndex:-1 }} />
        <div style={{ background:'#0F0B1D', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, overflow:'hidden', boxShadow:'0 30px 90px rgba(0,0,0,0.55),0 0 0 1px rgba(124,92,252,0.14)' }}>
          <div style={{ height:40, background:'#0A0714', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', padding:'0 16px', gap:12 }}>
            <div style={{ display:'flex', gap:6 }}>
              {['#FF5F57','#FFBD2E','#28C840'].map((c, i) => <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}
            </div>
            <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
              <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:6, padding:'3px 16px', fontSize:11, color:'#6E6790', fontFamily:'JetBrains Mono,monospace' }}>
                app.socialrum.com/dashboard
              </div>
            </div>
          </div>
          <div style={{ aspectRatio:'16/10', background:'#0F0B1D', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {s1Err
              ? <span style={{ fontSize:13, color:'rgba(255,255,255,0.15)', fontFamily:'Inter,sans-serif' }}>S1 · Add dashboard screenshot to /public/screenshots/s1.webp</span>
              : <img src="/screenshots/s1.webp" alt="SocialRum Dashboard" loading="eager" onError={() => setS1Err(true)}
                  style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            }
          </div>
        </div>
      </div>

      {/* ── WORKFLOW STRIP ── */}
      <div style={{ maxWidth:900, margin:'0 auto 88px', padding:'0 24px', position:'relative', zIndex:10 }}>
        <div className="sr3-flow" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          {['Spot the trend','Know what to post','Get the script','Caption in your language'].map((label, i, arr) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(124,92,252,0.12)', border:'1px solid rgba(124,92,252,0.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#9B7DFF', fontFamily:'Inter,sans-serif', flexShrink:0 }}>
                {i + 1}
              </div>
              <span style={{ fontSize:14, color:'#A29AC0', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap' }}>{label}</span>
              {i < arr.length - 1 && <span style={{ color:'rgba(124,92,252,0.35)', fontSize:18, marginLeft:2 }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE GRID ── */}
      <section style={{ maxWidth:1000, margin:'0 auto 96px', padding:'0 24px', position:'relative', zIndex:10 }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <h2 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:'clamp(24px,3vw,38px)', color:'#F4F2FA', letterSpacing:'-0.02em', marginBottom:12 }}>
            One dashboard. Your whole content workflow.
          </h2>
          <p style={{ fontSize:16, color:'#A29AC0', fontFamily:'Inter,sans-serif' }}>
            Everything an agency team would do for you — before your morning chai.
          </p>
        </div>
        <div className="sr3-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.slot} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.08 }}
              style={{ background:'rgba(124,92,252,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
              <ScreenSlot slot={f.slot} img={f.img} ratio="4/3" />
              <div style={{ padding:'18px 20px 22px' }}>
                <h3 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:600, fontSize:17, color:'#F4F2FA', marginBottom:6 }}>{f.title}</h3>
                <p style={{ fontSize:14, color:'#A29AC0', lineHeight:1.65, fontFamily:'Inter,sans-serif' }}>{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section style={{ textAlign:'center', padding:'72px 24px 88px', position:'relative', zIndex:10 }}>
        <h2 style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:'clamp(24px,3vw,38px)', color:'#F4F2FA', letterSpacing:'-0.02em', marginBottom:28 }}>
          50 creators get in first. Be one of them.
        </h2>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <a href="#early-access" className="sr3-cta" style={{ width:'100%', maxWidth:360, minHeight:52 }}>Apply for Beta Access →</a>
          <p style={{ fontSize:13, color:'#6E6790', fontFamily:'Inter,sans-serif' }}>Applications close {DEADLINE}</p>
        </div>
      </section>

      {/* ── EARLY ACCESS FORM ── */}
      <section id="early-access" style={{ maxWidth:1080, margin:'0 auto', padding:'0 24px 120px', position:'relative', zIndex:10 }}>
        <div className="sr3-ea" style={{ border:'1px solid rgba(124,92,252,0.1)', background:'rgba(124,92,252,0.02)', borderRadius:28, padding:'56px 48px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'start', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, background:'rgba(124,92,252,0.07)', filter:'blur(40px)', borderRadius:'50%', pointerEvents:'none' }} />

          {/* Left: benefits */}
          <div>
            <p style={{ color:'#7C5CFC', fontSize:12, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14, fontFamily:'Inter,sans-serif' }}>Limited Spots Remaining</p>
            <h2 style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'clamp(22px,2.8vw,32px)', fontWeight:700, color:'#F4F2FA', marginBottom:14, lineHeight:1.25 }}>Be the First to<br/>Know &amp; Create.</h2>
            <p style={{ fontSize:15, color:'#A29AC0', lineHeight:1.7, marginBottom:28, fontFamily:'Inter,sans-serif' }}>Get early access and founding creator status when SocialRum launches.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
              {[
                'Beta Access — Use all 5 tools before public launch',
                'Founding Creator Badge — Exclusive profile recognition',
                'Free Early Access Tier — No credit card required',
                'Priority support from the SocialRum team',
              ].map(b => (
                <div key={b} style={{ display:'flex', alignItems:'flex-start', gap:12, fontSize:14, color:'#A29AC0', fontFamily:'Inter,sans-serif' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(124,92,252,0.12)', border:'1px solid rgba(124,92,252,0.28)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <svg viewBox="0 0 12 12" style={{ width:10, height:10 }} fill="none" strokeWidth={2.5} stroke="#9B7DFF" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:22, padding:30, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-50, right:-50, width:130, height:130, background:'rgba(124,92,252,0.1)', filter:'blur(26px)', borderRadius:'50%', pointerEvents:'none' }} />

            {step === 'form' && (
              <div className="sr3-in">
                <h3 style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:20, fontWeight:700, color:'#F4F2FA', marginBottom:6 }}>Apply for Beta Access</h3>
                <p style={{ fontSize:14, color:'#A29AC0', marginBottom:22, lineHeight:1.6, fontFamily:'Inter,sans-serif' }}>Be among the first Indian creators to get access to SocialRum.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:11, marginBottom:14 }}>
                  <input type="text" placeholder="Your name (optional)" value={formData.name} onChange={e => setFormData(p => ({ ...p, name:e.target.value }))} className="sr-input" />
                  <input type="email" placeholder="your@email.com *" value={formData.email} onChange={e => setFormData(p => ({ ...p, email:e.target.value }))} className="sr-input" onKeyDown={e => { if (e.key==='Enter') handleNext(); }} />
                  <input type="text" placeholder="WhatsApp number or username (optional)" value={formData.whatsapp} onChange={e => setFormData(p => ({ ...p, whatsapp:e.target.value }))} className="sr-input" />
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleNext} className="sr3-btn">Next →</button>
                <p style={{ fontSize:11, color:'#6E6790', textAlign:'center', fontFamily:'Inter,sans-serif' }}>No spam. Unsubscribe anytime.</p>
              </div>
            )}

            {step === 'questions' && (
              <div className="sr3-in">
                <h3 style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:18, fontWeight:700, color:'#F4F2FA', marginBottom:5 }}>Quick questions</h3>
                <p style={{ fontSize:13, color:'#A29AC0', marginBottom:18, fontFamily:'Inter,sans-serif' }}>Help us understand your creator journey.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
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
                  <textarea value={answers.biggest_struggle} onChange={e => setAnswers(p => ({ ...p, biggest_struggle:e.target.value }))} placeholder="Biggest content challenge? (optional)" className="sr-input" style={{ height:68 }} />
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:13, color:'#A29AC0', fontFamily:'Inter,sans-serif' }}>
                    <input type="checkbox" checked={answers.weekly_feedback_ok} onChange={e => setAnswers(p => ({ ...p, weekly_feedback_ok:e.target.checked }))} style={{ width:16, height:16, accentColor:'#7C5CFC', cursor:'pointer' }} />
                    I'm open to giving weekly feedback during beta
                  </label>
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleSubmit} disabled={loading} className="sr3-btn">{loading ? 'Submitting...' : 'Apply for Beta →'}</button>
                <button onClick={() => { setStep('form'); setErrorMsg(''); }} style={{ background:'none', border:'none', color:'#6E6790', fontSize:12, cursor:'pointer', display:'block', width:'100%', textAlign:'center', padding:4, fontFamily:'Inter,sans-serif' }}>← Back</button>
              </div>
            )}

            {step === 'sent' && (
              <div className="sr3-in" style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ width:60, height:60, background:'linear-gradient(135deg,#7C5CFC,#9B7DFF)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <svg viewBox="0 0 24 24" style={{ width:28, height:28, fill:'none', stroke:'white', strokeWidth:2 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <h3 style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:20, fontWeight:700, color:'#F4F2FA', marginBottom:8 }}>Check your email!</h3>
                <p style={{ fontSize:14, color:'#A29AC0', lineHeight:1.65, marginBottom:16, fontFamily:'Inter,sans-serif' }}>
                  We sent a confirmation link to<br/><strong style={{ color:'#9B7DFF' }}>{formData.email}</strong>
                </p>
                <p style={{ fontSize:13, color:'#6E6790', fontFamily:'Inter,sans-serif' }}>Click the link to confirm your spot and unlock your referral link.</p>
              </div>
            )}

            {step === 'status' && statusData && (
              <div className="sr3-in">
                <div style={{ textAlign:'center', marginBottom:20 }}>
                  <p style={{ fontSize:11, color:'#6E6790', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6, fontFamily:'Inter,sans-serif' }}>Your position</p>
                  {statusData.position
                    ? <div style={{ fontSize:40, fontWeight:700, color:'#F4F2FA', lineHeight:1, fontFamily:'Space Grotesk,sans-serif' }}>
                        #{statusData.position}<span style={{ fontSize:15, color:'#6E6790', fontWeight:400, marginLeft:8 }}>of {statusData.total_signups}</span>
                      </div>
                    : <div style={{ fontSize:17, fontWeight:600, color:'#9B7DFF', fontFamily:'Space Grotesk,sans-serif' }}>Pending email verification</div>
                  }
                </div>

                <div style={{ background:'rgba(124,92,252,0.05)', border:'1px solid rgba(124,92,252,0.14)', borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
                  <p style={{ fontSize:10, color:'#6E6790', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:11, fontFamily:'Inter,sans-serif' }}>Reward tiers</p>
                  {[{ l:'Mover',r:1 },{ l:'Locked In',r:3 },{ l:'Founding Creator',r:5 },{ l:'Legend',r:10 }].map(t => {
                    const done = (statusData.referral_count||0) >= t.r;
                    return (
                      <div key={t.l} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:7 }}>
                        <div style={{ width:16,height:16,borderRadius:'50%',background:done?'linear-gradient(135deg,#7C5CFC,#9B7DFF)':'rgba(255,255,255,0.07)',border:done?'none':'1px solid rgba(255,255,255,0.1)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
                          {done && <svg viewBox="0 0 12 12" style={{ width:8,height:8 }} fill="none" strokeWidth={2.5} stroke="#fff" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>}
                        </div>
                        <span style={{ fontSize:13,color:done?'#9B7DFF':'#6E6790',flex:1,fontFamily:'Inter,sans-serif' }}>{t.l}</span>
                        <span style={{ fontSize:11,color:'rgba(255,255,255,0.18)',fontFamily:'Inter,sans-serif' }}>{t.r} ref{t.r>1?'s':''}</span>
                      </div>
                    );
                  })}
                  {statusData.next_tier && (
                    <div style={{ marginTop:10,padding:'8px 12px',background:'rgba(124,92,252,0.08)',borderRadius:10,fontSize:12,color:'#9B7DFF',textAlign:'center',fontFamily:'Inter,sans-serif' }}>
                      <strong>{statusData.next_tier.referrals_needed}</strong> more referral{statusData.next_tier.referrals_needed!==1?'s':''} → <strong>{statusData.next_tier.label}</strong>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom:11 }}>
                  <p style={{ fontSize:10,color:'#6E6790',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:7,fontFamily:'Inter,sans-serif' }}>Your referral link</p>
                  <div style={{ display:'flex',gap:8 }}>
                    <div style={{ flex:1,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(124,92,252,0.2)',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#9B7DFF',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {statusData.referral_link}
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(statusData.referral_link); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
                      style={{ background:copied?'rgba(74,222,128,0.1)':'rgba(124,92,252,0.1)',border:`1px solid ${copied?'rgba(74,222,128,0.28)':'rgba(124,92,252,0.28)'}`,borderRadius:10,padding:'10px 14px',color:copied?'#4ADE80':'#9B7DFF',fontSize:12,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'Inter,sans-serif',transition:'all .2s' }}>
                      {copied?'✓ Copied':'Copy'}
                    </button>
                  </div>
                </div>

                <a href={`https://wa.me/?text=${encodeURIComponent(`I just applied for SocialRum's beta — AI that turns trending topics into ready-to-film scripts in your language. Only 50 spots. Apply here: ${statusData.referral_link}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10,width:'100%',background:'#25D366',color:'#fff',borderRadius:12,padding:'13px',fontWeight:700,fontSize:15,textDecoration:'none',marginBottom:8,fontFamily:'Inter,sans-serif',boxSizing:'border-box' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Share on WhatsApp
                </a>
                <div style={{ display:'flex',gap:8 }}>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(statusData.referral_link)}`} target="_blank" rel="noopener noreferrer"
                    style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(10,102,194,0.1)',border:'1px solid rgba(10,102,194,0.22)',borderRadius:10,padding:'10px',color:'#60a5fa',fontSize:12,textDecoration:'none',fontWeight:600,fontFamily:'Inter,sans-serif' }}>
                    LinkedIn
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just applied for @SocialRum beta — AI tools for Indian creators. Only 50 spots! ${statusData.referral_link}`)}`} target="_blank" rel="noopener noreferrer"
                    style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:10,padding:'10px',color:'rgba(255,255,255,0.5)',fontSize:12,textDecoration:'none',fontWeight:600,fontFamily:'Inter,sans-serif' }}>
                    X (Twitter)
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'24px 40px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, position:'relative', zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:7, overflow:'hidden', background:'rgba(124,92,252,0.1)', border:'1px solid rgba(124,92,252,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src="/logo.png" alt="SocialRum" style={{ width:26, height:26, objectFit:'cover', borderRadius:7 }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
          </div>
          <span style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:14, color:'rgba(255,255,255,0.45)' }}>SocialRum</span>
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {[['Blog','/blog'],['Early Access','#early-access']].map(([label, href]) => (
            <a key={label} href={href} style={{ color:'rgba(255,255,255,0.28)', textDecoration:'none', fontSize:13, fontFamily:'Inter,sans-serif', transition:'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color='rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.28)')}>
              {label}
            </a>
          ))}
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.18)', fontFamily:'Inter,sans-serif' }}>© 2026 SocialRum. Made for India 🇮🇳</p>
      </footer>
    </div>
  );
}
