import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');

  .sr-root*,.sr-root *::before,.sr-root *::after{box-sizing:border-box;margin:0;padding:0}
  .sr-root{background:#03000a;color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden;min-height:100vh}
  .sr-root ::-webkit-scrollbar{width:6px}
  .sr-root ::-webkit-scrollbar-track{background:#03000a}
  .sr-root ::-webkit-scrollbar-thumb{background:rgba(124,58,237,.3);border-radius:3px}

  /* Reveal Animations */
  .sr-reveal{opacity:0;transform:translateY(30px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
  .sr-reveal-l{opacity:0;transform:translateX(-30px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
  .sr-reveal-r{opacity:0;transform:translateX(30px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
  .sr-reveal-s{opacity:0;transform:scale(.95);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
  .sr-reveal.on,.sr-reveal-l.on,.sr-reveal-r.on,.sr-reveal-s.on{opacity:1;transform:none}
  .sr-d1{transition-delay:.1s}.sr-d2{transition-delay:.2s}.sr-d3{transition-delay:.3s}

  @keyframes sr-navDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sr-shake{0%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}100%{transform:translateX(0)}}
  @keyframes sr-fadeIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
  
  .sr-anim-nav{animation:sr-navDown .5s cubic-bezier(.16,1,.3,1) 0s both}
  .sr-shake{animation:sr-shake .3s ease}
  .sr-fade-in{animation:sr-fadeIn .4s cubic-bezier(.16,1,.3,1) both}

  /* Nav Grid System */
  .sr-nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 64px;height:80px;transition:all .3s ease}
  .sr-nav.scrolled{background:rgba(3,0,10,.8);backdrop-filter:blur(20px);border-bottom:1px solid rgba(124,58,237,.12)}
  .sr-nav-link{color:rgba(255,255,255,.6);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
  .sr-nav-link:hover{color:#fff}

  /* Feature items */
  .sr-feature-item{position:relative;background:rgba(124,58,237,.03);border:1px solid rgba(124,58,237,.08);border-radius:24px;padding:36px;transition:all .3s ease;overflow:hidden}
  .sr-feature-item::after{content:'';position:absolute;inset:0;background:radial-gradient(circle 120px at var(--mx,50%) var(--my,50%),rgba(124,58,237,.08),transparent 70%);opacity:0;transition:opacity .3s;pointer-events:none}
  .sr-feature-item:hover{background:rgba(124,58,237,.06);border-color:rgba(124,58,237,.25);transform:translateY(-2px)}
  .sr-feature-item:hover::after{opacity:1}
  .sr-feature-tag{font-size:11px;font-weight:500;color:#c084fc;background:rgba(124,58,237,.1);padding:4px 12px;border-radius:50px;border:1px solid rgba(124,58,237,.15)}

  /* Step cards */
  .sr-step-card{position:relative;background:rgba(124,58,237,.02);border:1px solid rgba(124,58,237,.08);border-radius:24px;padding:40px 32px;transition:all .4s ease}
  .sr-step-card:hover{transform:translateY(-6px);border-color:rgba(124,58,237,.3);box-shadow:0 20px 40px rgba(124,58,237,.08)}
  .sr-step-num{font-family:'Plus Jakarta Sans',sans-serif;font-size:48px;font-weight:800;color:rgba(124,58,237,.1);line-height:1;margin-bottom:16px}

  /* Main Action Button UI mimicking Image Glow */
  .sr-btn-glow {
    background: #6d28d9;
    color: #fff;
    padding: 14px 28px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 0 25px rgba(124,58,237,0.45);
    transition: all .2s ease;
  }
  .sr-btn-glow:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 35px rgba(124,58,237,0.65);
    background: #7c3aed;
  }

  /* Glassmorphism Inputs */
  .sr-input{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(124,58,237,.15);border-radius:14px;padding:14px 18px;color:#fff;font-size:14px;outline:none;transition:all .2s ease}
  .sr-input:focus{border-color:#a855f7;box-shadow:0 0 0 3px rgba(168,85,247,.15)}
  .sr-input.error{border-color:#ef4444}
  .sr-ea-btn{width:100%;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border:none;border-radius:14px;padding:15px;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s ease;box-shadow:0 4px 20px rgba(124,58,237,.3)}
  .sr-ea-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 25px rgba(124,58,237,.5)}

  @media(max-width:1024px){
    .sr-nav{padding:0 24px;height:72px}
    .sr-nav-links{display:none!important}
    .sr-hero-grid{grid-template-columns:1fr!important;padding-top:100px!important;text-align:center}
    .sr-left-mockups, .sr-right-dashboard{display:none!important}
    .sr-steps-grid, .sr-ea-grid{grid-template-columns:1fr!important;gap:32px!important}
  }
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const rootRef   = useRef(null);
  const emailRef  = useRef(null);
  const otpRef    = useRef(null);

  const [scrolled,  setScrolled]  = useState(false);
  const [step,      setStep]      = useState('email');
  const [userEmail, setUserEmail] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [emailErr,  setEmailErr]  = useState(false);
  const [otpErr,    setOtpErr]    = useState(false);

  const BASE = import.meta.env.VITE_API_URL || 'https://uptrent-backend.onrender.com';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const cards = rootRef.current?.querySelectorAll('.sr-feature-item');
    if (!cards) return;
    const handlers = [];
    cards.forEach(c => {
      const fn = (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
        c.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
      };
      c.addEventListener('mousemove', fn);
      handlers.push({ card: c, fn });
    });
    return () => handlers.forEach(h => h.card.removeEventListener('mousemove', h.fn));
  }, []);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.sr-reveal,.sr-reveal-l,.sr-reveal-r,.sr-reveal-s');
    if (!els) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSendOTP = async () => {
    const email = emailRef.current?.value.trim() ?? '';
    const name  = document.getElementById('sr-name-input')?.value.trim() ?? '';
    if (!email || !email.includes('@')) {
      setEmailErr(true); emailRef.current?.classList.add('sr-shake');
      setTimeout(() => { setEmailErr(false); emailRef.current?.classList.remove('sr-shake'); }, 600); return;
    }
    setLoading(true); setErrorMsg('');
    try {
      const res  = await fetch(`${BASE}/api/waitlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, name: name || email.split('@')[0] }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setUserEmail(email); setStep('otp');
    } catch (err) { setErrorMsg(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const token = otpRef.current?.value.trim() ?? '';
    if (!token || token.length < 6) {
      setOtpErr(true); otpRef.current?.classList.add('sr-shake');
      setTimeout(() => { setOtpErr(false); otpRef.current?.classList.remove('sr-shake'); }, 600); return;
    }
    setLoading(true); setErrorMsg('');
    try {
      const res  = await fetch(`${BASE}/api/waitlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: userEmail, otp: token, action:'verify' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      setStep('done');
    } catch (err) { setErrorMsg(err.message || 'Invalid code. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div ref={rootRef} className="sr-root">
      <style>{css}</style>
      
      {/* GLOBAL BACKGROUND SYSTEM */}
      <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', background:'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />
      <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', opacity:0.02, backgroundImage:'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize:'50px 50px' }} />

      {/* ══════ NAVBAR ══════ */}
      <nav className={`sr-nav sr-anim-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="/home" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', display:'grid', placeItems:'center' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2.5 }}>
              {Array.from({length:9}).map((_,i) => (
                <div key={i} style={{ width:5, height:5, borderRadius:1.5, background: i === 4 ? '#fff' : 'linear-gradient(135deg,#c084fc,#7c3aed)' }} />
              ))}
            </div>
          </div>
          <span style={{ fontFamily:'Plus Jakarta Sans', fontSize:20, fontWeight:700, color:'#fff', letterSpacing:'-0.02em' }}>SocialRum</span>
        </a>

        <ul className="sr-nav-links" style={{ display:'flex', gap:40, listStyle:'none' }}>
          {['Features','How It Works','Early Access'].map(l => (
            <li key={l}><a href={`#${l.toLowerCase().replace(/ /g,'-')}`} className="sr-nav-link">{l}</a></li>
          ))}
        </ul>

        <a href="#early-access" className="sr-btn-glow" style={{ padding:'10px 20px', fontSize:'13px', boxShadow:'none', background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.3)' }}>
          Be the First to Know
        </a>
      </nav>

      {/* ══════ HERO COMPONENT (EXACT DESIGN ARCHITECTURE MATCH) ══════ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 24px', zIndex:10 }}>
        
        {/* CENTER CENTRAL BACKDROP LENS FLARE */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', width:'400px', height:'180px', background:'rgba(147,51,234,0.18)', filter:'blur(100px)', borderRadius:'50%', pointerEvents:'none', zIndex:1 }} />

        <div className="sr-hero-grid" style={{ width:'100%', maxWidth:'1280px', display:'grid', gridTemplateColumns:'2.5fr 7fr 2.5fr', gap:24, alignItems:'center', position:'relative', zIndex:5, paddingTop:'60px' }}>
          
          {/* LEFT CONTAINER: STAGGERED REELS/SHORTS COMPOSITIONS */}
          <div className="sr-left-mockups" style={{ display:'flex', flexDirection:'column', gap:28, alignItems:'flex-start' }}>
            {/* Card 1: Angled Left */}
            <div style={{ width:'140px', background:'rgba(10,5,22,0.6)', borderRadius:24, padding:8, border:'1px solid rgba(255,255,255,0.04)', boxShadow:'0 20px 40px rgba(0,0,0,0.4)', transform:'rotate(-5deg)' }}>
              <div style={{ position:'relative', aspectRatio:'9/16', borderRadius:18, overflow:'hidden', background:'#120c24' }}>
                <span style={{ position:'absolute', top:8, left:8, bg:'#ff0000', fontSize:8, fontWeight:700, padding:'2px 6px', borderRadius:4, background:'#ff0000' }}>Shorts</span>
                <span style={{ position:'absolute', top:8, right:8, fontSize:8, color:'rgba(255,255,255,0.6)' }}>0:58</span>
                <div style={{ position:'absolute', bottom:8, left:8, right:8, fontSize:9, lineHeight:1.2 }}>
                  <p style={{ fontWeight:600, color:'#fff' }}>Micro Habits That Changed My Life</p>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:8, marginTop:2 }}>@productivedude</p>
                </div>
              </div>
            </div>
            {/* Card 2: Shifted Right */}
            <div style={{ width:'140px', background:'rgba(10,5,22,0.6)', borderRadius:24, padding:8, border:'1px solid rgba(255,255,255,0.04)', boxShadow:'0 20px 40px rgba(0,0,0,0.4)', transform:'rotate(3deg)', marginLeft:'36px' }}>
              <div style={{ position:'relative', aspectRatio:'9/16', borderRadius:18, overflow:'hidden', background:'#120c24' }}>
                <span style={{ position:'absolute', top:8, left:8, fontSize:8, fontWeight:700, padding:'2px 6px', borderRadius:4, background:'#ff0000' }}>Shorts</span>
                <span style={{ position:'absolute', top:8, right:8, fontSize:8, color:'rgba(255,255,255,0.6)' }}>0:56</span>
                <div style={{ position:'absolute', bottom:8, left:8, right:8, fontSize:9, lineHeight:1.2 }}>
                  <p style={{ fontWeight:600, color:'#fff' }}>Camera Settings for Perfect Reels</p>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:8, marginTop:2 }}>@FunctSpa</p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN HERO ACTION CENTER */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            {/* Upper Badge Info */}
            <div style={{ border:'1px solid rgba(147,51,234,0.3)', borderRadius:50, padding:'6px 16px', fontSize:10, fontWeight:600, color:'#c084fc', background:'rgba(147,51,234,0.08)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:20 }}>
              • Now Accepting Early Access
            </div>

            {/* Huge Clean Typography Title Block */}
            <h1 style={{ fontFamily:'Plus Jakarta Sans', fontSize:'clamp(54px, 7.5vw, 92px)', fontWeight:800, letterSpacing:'-0.03em', color:'#fff', lineHeight:1.0, position:'relative', margin:0 }}>
              Social<span style={{ background:'linear-gradient(to bottom, #fff, #9333ea)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Rum</span>
              {/* Reference Horizon Flare Bar Effect */}
              <div style={{ width:'110%', height:'1px', background:'linear-gradient(to right, transparent, #a855f7, #fff, #a855f7, transparent)', position:'absolute', bottom:'-4px', left:'-5%', filter:'blur(0.5px)' }} />
            </h1>

            {/* Action Dynamic Subtitle */}
            <h2 style={{ fontFamily:'Plus Jakarta Sans', fontSize:'clamp(20px, 3.2vw, 34px)', fontWeight:700, color:'#fff', letterSpacing:'-0.02em', marginTop:28, textAlign:'center', lineHeight:1.2 }}>
              Create Content <span style={{ color:'#a855f7' }}>That Actually</span><br />Gets Discovered
            </h2>

            {/* Core Segment Subtext Description */}
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.6, maxWidth:480, textAlign:'center', marginTop:16, fontFamily:'Inter' }}>
              SocialRum brings YouTube and Instagram creators a unified AI workspace — trending topics, script generation, content analysis, and SEO in one dark premium dashboard.
            </p>

            {/* Interactive Functional CTA Blocks */}
            <div style={{ display:'flex', alignItems:'center', gap:24, marginTop:32 }}>
              <a href="#early-access" className="sr-btn-glow">
                Be the First to Know <span style={{ fontSize:13 }}>→</span>
              </a>
              <a href="#features" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:14, fontWeight:500, display:'flex', alignItems:'center', gap:6 }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.7)'}>
                Explore Features <span style={{ fontSize:10 }}>▼</span>
              </a>
            </div>
          </div>

          {/* RIGHT CONTAINER: THE UI PREMIUM DASHBOARD PANEL */}
          <div className="sr-right-dashboard" style={{ width:'100%', display:'flex', justifyContent:'flex-end' }}>
            <div style={{ width:'250px', background:'rgba(10,6,22,0.65)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:24, padding:20, backdropFilter:'blur(16px)', boxShadow:'0 30px 60px rgba(0,0,0,0.5)', position:'relative' }}>
              
              {/* Glow absolute chip asset */}
              <div style={{ position:'absolute', top:-10, right:12, background:'#0a0518', border:'1px solid rgba(147,51,234,0.4)', borderRadius:6, padding:'2px 8px', fontSize:8, color:'#c084fc', fontWeight:600, boxShadow:'0 0 12px rgba(147,51,234,0.3)' }}>
                AI Powered For Creators
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#a855f7', fontWeight:600, marginBottom:16 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#a855f7' }} /> Dashboard
              </div>

              {/* Panel Block 1: Trends */}
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:14, padding:12, marginBottom:12 }}>
                <p style={{ fontSize:8, color:'rgba(255,255,255,0.4)', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:8 }}>Trending Now</p>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:4 }}>
                  <span style={{ color:'rgba(255,255,255,0.8)' }}>#AIVideoEditing</span> <span style={{ color:'#a855f7' }}>↑ Trending</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:4 }}>
                  <span style={{ color:'rgba(255,255,255,0.8)' }}>#CreatorEconomy2026</span> <span style={{ color:'#a855f7' }}>↑ Rising</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10 }}>
                  <span style={{ color:'rgba(255,255,255,0.8)' }}>#YouTubeShorts</span> <span style={{ color:'#a855f7' }}>↑ Hot</span>
                </div>
              </div>

              {/* Panel Block 2: Scripting Input */}
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:14, padding:12, marginBottom:12 }}>
                <p style={{ fontSize:8, color:'rgba(255,255,255,0.4)', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:6 }}>Script Generator</p>
                <div style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:8, padding:'6px 10px', fontSize:10, color:'rgba(255,255,255,0.3)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span>Generating hook...</span>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#a855f7' }} />
                </div>
              </div>

              {/* Panel Block 3: Metrics */}
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:14, padding:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:8, marginBottom:6 }}>
                  <span style={{ color:'rgba(255,255,255,0.4)', tracking:'0.05em', textTransform:'uppercase' }}>SEO Score</span>
                  <span style={{ color:'#a855f7', fontWeight:600 }}>AI Ready</span>
                </div>
                <div style={{ width:'100%', height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:'85%', height:'100%', background:'#a855f7', boxShadow:'0 0 8px #a855f7' }} />
                </div>
              </div>

            </div>
          </div>

        </div>
        
        {/* Soft elegant baseline horizon lighting boundary */}
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:'80%', height:'1px', background:'linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)' }} />
      </section>

      {/* ══════ STATS ══════ */}
      <div style={{ background:'rgba(124,58,237,.01)', borderTop:'1px solid rgba(124,58,237,.08)', borderBottom:'1px solid rgba(124,58,237,.08)', padding:'48px 24px', display:'flex', justifyContent:'center', gap:'clamp(32px, 8vw, 96px)', flexWrap:'wrap', position:'relative', zIndex:5 }}>
        {STATS.map((s, i) => (
          <div key={s.label} className={`sr-reveal sr-d${i+1}`} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Plus Jakarta Sans', fontSize:'36px', fontWeight:800, background:'linear-gradient(to bottom, #fff, #c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{s.value}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginTop:4, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══════ FEATURES ══════ */}
      <section id="features" style={{ maxWidth:1140, margin:'0 auto', padding:'120px 24px 80px', position:'relative', zIndex:5 }}>
        <p className="sr-reveal" style={{ fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'#a855f7', marginBottom:12 }}>Platform Features</p>
        <h2 className="sr-reveal sr-d1" style={{ fontFamily:'Plus Jakarta Sans', fontSize:'clamp(26px,4vw,38px)', fontWeight:800, tracking:'-0.02em', color:'#fff', marginBottom:14 }}>Every tool a serious creator needs.</h2>
        <p className="sr-reveal sr-d2" style={{ fontSize:15, color:'rgba(255,255,255,.5)', lineHeight:1.6, maxWidth:500, marginBottom:56 }}>Built specifically for YouTube and Instagram creators who want to grow faster without guessing.</p>
        
        <div className="sr-reveal-s sr-d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:20 }}>
          {FEATURES.map(f => (
            <div key={f.num} className="sr-feature-item">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div style={{ width:40, height:40, background:'rgba(124,58,237,.1)', borderRadius:12, display:'flex', alignItems:'center', justifyContext:'center', border:'1px solid rgba(124,58,237,.2)' }}>
                  <span style={{ margin:'auto', fontSize:12, fontWeight:700, color:'#c084fc' }}>{f.num}</span>
                </div>
              </div>
              <h3 style={{ fontFamily:'Plus Jakarta Sans', fontSize:18, fontWeight:700, color:'#fff', marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.6, minHeight:64 }}>{f.desc}</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:20 }}>
                {f.tags.map(tag => <span key={tag} className="sr-feature-tag">{tag}</span>)}
              </div>
            </div>
          ))}
          <div style={{ background:'rgba(124,58,237,.01)', border:'1px solid rgba(124,58,237,.05)', borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center', minHeight:220, padding:24 }}>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontFamily:'Plus Jakarta Sans', fontSize:22, fontWeight:700, color:'rgba(124,58,237,.2)', letterSpacing:'-0.01em', marginBottom:4 }}>More Coming Soon</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>Platform workspace update actively in progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how-it-works" style={{ maxWidth:1140, margin:'0 auto', padding:'80px 24px 100px', position:'relative', zIndex:5 }}>
        <p className="sr-reveal" style={{ fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'#a855f7', marginBottom:12 }}>How It Works</p>
        <h2 className="sr-reveal sr-d1" style={{ fontFamily:'Plus Jakarta Sans', fontSize:'clamp(26px,4vw,38px)', fontWeight:800, tracking:'-0.02em', color:'#fff', marginBottom:14 }}>From zero to algorithm-ready in one session.</h2>
        <p className="sr-reveal sr-d2" style={{ fontSize:15, color:'rgba(255,255,255,.5)', lineHeight:1.6, maxWidth:520, marginBottom:56 }}>No complex setup. Connect your channels and SocialRum immediately starts surfacing actionable insights.</p>
        
        <div className="sr-steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} className={`sr-reveal sr-d${i+1} sr-step-card`}>
              <div className="sr-step-num">{s.num}</div>
              <h3 style={{ fontFamily:'Plus Jakarta Sans', fontSize:18, fontWeight:700, color:'#fff', marginBottom:6 }}>{s.title}</h3>
              <p style={{ fontSize:12, fontWeight:600, color:'#a855f7', marginBottom:12 }}>{s.sub}</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.6 }}>{s.desc}</p>
              <p style={{ marginTop:16, fontSize:11, color:'rgba(168,85,247,.4)', fontStyle:'italic' }}>{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ EARLY ACCESS FORM MODULE ══════ */}
      <section id="early-access" style={{ maxW:'1140px', margin:'0 auto', padding:'80px 24px 120px', position:'relative', zIndex:5 }}>
        <div className="sr-ea-grid" style={{ background:'rgba(124,58,237,0.02)', border:'1px solid rgba(124,58,237,0.1)', borderRadius:32, padding:'56px 48px', display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:56, alignItems:'center', overflow:'hidden', position:'relative' }}>
          
          <div style={{ position:'absolute', top:-60, right:-60, width:180, height:180, background:'radial-gradient(circle,rgba(124,58,237,.1),transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

          <div className="sr-reveal-l">
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'#a855f7', marginBottom:12 }}>Limited Alpha Batches</p>
            <h2 style={{ fontFamily:'Plus Jakarta Sans', fontSize:'clamp(26px,4vw,36px)', fontWeight:800, tracking:'-0.02em', color:'#fff', marginBottom:14 }}>Be the First to Know & Create.</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', lineHeight:1.6 }}>Get early access and founding creator tier status when SocialRum goes public.</p>
            
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:28 }}>
              {['Beta Access — Use all 5 core modules before launch','Founding Creator Badge — Exclusive profile recognition','Free Early Access Tier — No credit card requirements'].map(b => (
                <div key={b} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'rgba(255,255,255,.6)' }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', display:'flex' }}>
                    <svg viewBox="0 0 12 12" style={{ width:8, height:8, margin:'auto' }} fill="none" strokeWidth={3} stroke="#c084fc" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="sr-reveal-r" style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:24, padding:32 }}>
            {step === 'done' && (
              <div className="sr-fade-in" style={{ textAlign:'center', padding:'16px 0' }}>
                <div style={{ width:56, height:56, background:'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <svg viewBox="0 0 24 24" style={{ width:24, height:24, fill:'none', stroke:'white', strokeWidth:3, strokeLinecap:'round', strokeLinejoin:'round' }}><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontFamily:'Plus Jakarta Sans', fontSize:20, fontWeight:700, color:'#fff', marginBottom:8 }}>You're on the list! 🎉</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.5, marginBottom:20 }}>Welcome to early workspace access.</p>
                <div style={{ display:'inline-block', background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)', borderRadius:50, padding:'8px 16px', fontSize:12, color:'#c084fc', fontWeight:500 }}>
                  Verified — {userEmail}
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="sr-fade-in">
                <h3 style={{ fontFamily:'Plus Jakarta Sans', fontSize:20, fontWeight:700, color:'#fff', marginBottom:6 }}>Verify Email Securely</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:20 }}>6-digit dynamic key code transmitted to <b style={{color:'#c084fc'}}>{userEmail}</b></p>
                <div style={{ marginBottom:16 }}>
                  <input ref={otpRef} type="text" inputMode="numeric" maxLength={6} placeholder="Verification Code" className="sr-input" style={{ textAlign:'center', fontSize:18, tracking:'0.2em' }} onKeyDown={e => { if (e.key==='Enter') handleVerifyOTP(); }} />
                </div>
                {errorMsg && <p style={{ fontSize:12, color:'#ef4444', textAlign:'center', marginBottom:12 }}>{errorMsg}</p>}
                <button onClick={handleVerifyOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Validating...' : 'Confirm Registration →'}</button>
                <button onClick={() => { setStep('email'); setErrorMsg(''); }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:12, display:'block', width:'100%', marginTop:14, cursor:'pointer' }}>Change email address</button>
              </div>
            )}

            {step === 'email' && (
              <div>
                <h3 style={{ fontFamily:'Plus Jakarta Sans', fontSize:20, fontWeight:700, color:'#fff', marginBottom:6 }}>Request Access</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:24 }}>Submit credentials to receive verification clearance pass.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
                  <input id="sr-name-input" type="text" placeholder="Creator / Business Name" className="sr-input" />
                  <input ref={emailRef} type="email" placeholder="contact@example.com" className={`sr-input${emailErr?' error':''}`} onKeyDown={e => { if (e.key==='Enter') handleSendOTP(); }} />
                </div>
                {errorMsg && <p style={{ fontSize:12, color:'#ef4444', textAlign:'center', marginBottom:12 }}>{errorMsg}</p>}
                <button onClick={handleSendOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Requesting...' : 'Get Access Pass →'}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ borderTop:'1px solid rgba(124,58,237,.08)', padding:'40px 64px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24, position:'relative', zIndex:5 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:'Plus Jakarta Sans', fontSize:16, fontWeight:700, color:'#fff' }}>SocialRum</span>
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>© 2026 SocialRum · Unified Analytics Platform</p>
      </footer>
    </div>
  );
}