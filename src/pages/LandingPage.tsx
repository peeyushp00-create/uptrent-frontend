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

const VIDEO_CARDS = [
  { id:1,  platform:'youtube',   title:'How I Got 100K Subs in 30 Days',          views:'2.4M', duration:'0:58', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1d6391833-1773075779744.png',  channel:'@CreatorPro',    lane:0, speed:18, startOffset:0   },
  { id:2,  platform:'instagram', title:'Morning Routine That Changed My Life',     views:'890K', duration:'0:30', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1521eb58e-1764644106046.png',  channel:'@LifeWithAlex',  lane:1, speed:22, startOffset:-40 },
  { id:3,  platform:'youtube',   title:'AI Tools Every Creator Needs in 2026',    views:'1.1M', duration:'0:45', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1ddab98dc-1773131998650.png',  channel:'@TechCreator',   lane:2, speed:16, startOffset:-20 },
  { id:4,  platform:'instagram', title:'Street Food Tour in Tokyo',               views:'3.7M', duration:'0:60', thumbnail:'https://images.unsplash.com/photo-1516822561562-a6762898eb60?w=200',                 channel:'@FoodieWorld',   lane:3, speed:20, startOffset:-10 },
  { id:5,  platform:'youtube',   title:'Build a SaaS in 24 Hours Challenge',      views:'780K', duration:'0:59', thumbnail:'https://images.unsplash.com/photo-1564756296543-d61bebcd226a?w=200',                 channel:'@DevShorts',     lane:4, speed:19, startOffset:-50 },
  { id:6,  platform:'instagram', title:'Minimalist Home Makeover on Budget',      views:'1.5M', duration:'0:45', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_15eaab260-1772956699125.png',  channel:'@HomeVibes',     lane:5, speed:21, startOffset:-80 },
  { id:7,  platform:'youtube',   title:'Camera Settings for Perfect Reels',       views:'640K', duration:'0:55', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_1b0948c90-1771909777566.png',  channel:'@FilmTips',      lane:0, speed:17, startOffset:-70 },
  { id:8,  platform:'instagram', title:'Fitness Transformation 30 Days',          views:'4.3M', duration:'0:30', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_159a50448-1767636094533.png',  channel:'@FitLife',       lane:1, speed:23, startOffset:-45 },
  { id:9,  platform:'youtube',   title:'Grow on YouTube with Zero Budget',        views:'920K', duration:'0:58', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_17b6062b2-1772483137359.png',  channel:'@GrowthHacks',   lane:2, speed:19, startOffset:-90 },
  { id:10, platform:'instagram', title:'Aesthetic Room Tour 2026',                views:'1.2M', duration:'0:45', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_150de2b75-1772333562367.png',  channel:'@AestheticVibes',lane:3, speed:16, startOffset:-35 },
  { id:11, platform:'youtube',   title:'Top 10 Trending Niches Right Now',        views:'3.1M', duration:'0:59', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_126d7e136-1768020582546.png',  channel:'@NicheHunter',   lane:4, speed:20, startOffset:-65 },
  { id:12, platform:'instagram', title:'Skincare Routine for Glowing Skin',       views:'2.9M', duration:'0:30', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_194b951ad-1772304624866.png',  channel:'@GlowUp',        lane:5, speed:18, startOffset:-25 },
  { id:13, platform:'youtube',   title:'Monetize Your Channel Fast in 2026',      views:'1.7M', duration:'0:58', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_17343e164-1768026725793.png',  channel:'@MoneyCreator',  lane:0, speed:22, startOffset:-75 },
  { id:14, platform:'instagram', title:'Coffee Art That Will Blow Your Mind',     views:'980K', duration:'0:20', thumbnail:'https://images.unsplash.com/photo-1622651207311-f5af09666416?w=200',                 channel:'@CafeArt',       lane:1, speed:17, startOffset:-55 },
  { id:15, platform:'youtube',   title:'Script Writing Secrets for Viral Shorts', views:'2.2M', duration:'0:55', thumbnail:'https://img.rocket.new/generatedImages/rocket_gen_img_13a6419a1-1772328360733.png',  channel:'@ScriptMaster',  lane:2, speed:21, startOffset:-85 },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sr-root*,.sr-root *::before,.sr-root *::after{box-sizing:border-box;margin:0;padding:0}
  .sr-root{background:#000;color:#fff;font-family:'DM Sans',sans-serif;overflow-x:hidden;min-height:100vh}
  .sr-root ::-webkit-scrollbar{width:6px}
  .sr-root ::-webkit-scrollbar-track{background:#000}
  .sr-root ::-webkit-scrollbar-thumb{background:rgba(139,92,246,.4);border-radius:3px}

  /* Reveal */
  .sr-reveal{opacity:0;transform:translateY(40px);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1)}
  .sr-reveal-l{opacity:0;transform:translateX(-50px);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1)}
  .sr-reveal-r{opacity:0;transform:translateX(50px);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1)}
  .sr-reveal-s{opacity:0;transform:scale(.88);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1)}
  .sr-reveal.on,.sr-reveal-l.on,.sr-reveal-r.on,.sr-reveal-s.on{opacity:1;transform:none}
  .sr-d1{transition-delay:.1s}.sr-d2{transition-delay:.2s}.sr-d3{transition-delay:.3s}.sr-d4{transition-delay:.4s}

  /* Keyframes */
  @keyframes sr-navDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sr-badgeFade{from{opacity:0;transform:translateY(16px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes sr-sFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sr-charUp{from{opacity:0;transform:translateY(60px) rotateX(25deg)}to{opacity:1;transform:translateY(0) rotateX(0)}}
  @keyframes sr-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.65)}}
  @keyframes sr-glowP{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes sr-orbFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(-15px,20px)}}
  @keyframes sr-shake{0%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}100%{transform:translateX(0)}}
  @keyframes sr-fadeIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
  @keyframes sr-floatDown{from{transform:translate3d(0,-380px,0)}to{transform:translate3d(0,calc(100vh + 380px),0)}}
  @keyframes sr-floatUp{from{transform:translate3d(0,calc(100vh + 380px),0)}to{transform:translate3d(0,-380px,0)}}
  @keyframes sr-gridPulse{0%,100%{opacity:.04}50%{opacity:.08}}

  .sr-anim-nav{animation:sr-navDown .6s cubic-bezier(.16,1,.3,1) 0s both}
  .sr-anim-badge{animation:sr-badgeFade .8s cubic-bezier(.16,1,.3,1) .2s both}
  .sr-anim-sub{animation:sr-sFade .9s cubic-bezier(.16,1,.3,1) .7s both}
  .sr-anim-desc{animation:sr-sFade .9s cubic-bezier(.16,1,.3,1) .9s both}
  .sr-anim-btns{animation:sr-sFade .9s cubic-bezier(.16,1,.3,1) 1.1s both}
  .sr-anim-pulse{animation:sr-pulse 2s ease-in-out infinite}
  .sr-anim-glow{animation:sr-glowP 4s ease-in-out infinite}
  .sr-anim-orb{animation:sr-orbFloat 6s ease-in-out infinite}
  .sr-title-char{display:inline-block;animation:sr-charUp .7s cubic-bezier(.16,1,.3,1) both}
  .sr-shake{animation:sr-shake .36s ease}
  .sr-fade-in{animation:sr-fadeIn .5s cubic-bezier(.16,1,.3,1) both}

  /* Nav */
  .sr-nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:72px;transition:background .4s,backdrop-filter .4s}
  .sr-nav.scrolled{background:rgba(0,0,0,.85);backdrop-filter:blur(18px);border-bottom:1px solid rgba(139,92,246,.15)}
  .sr-nav-link{color:rgba(255,255,255,.7);text-decoration:none;font-size:16px;transition:color .2s;font-family:'DM Sans',sans-serif}
  .sr-nav-link:hover{color:#fff}

  /* Feature cards */
  .sr-feature-item{position:relative;background:rgba(139,92,246,.04);border:1px solid rgba(139,92,246,.1);border-radius:20px;padding:36px 32px;transition:background .3s,border-color .3s;cursor:default;overflow:hidden}
  .sr-feature-item::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 120% 80% at var(--mx,50%) var(--my,50%),rgba(139,92,246,.1),transparent 70%);opacity:0;transition:opacity .4s;pointer-events:none}
  .sr-feature-item:hover{background:rgba(139,92,246,.08);border-color:rgba(139,92,246,.25)}
  .sr-feature-item:hover::after{opacity:1}
  .sr-feature-icon{width:48px;height:48px;background:rgba(139,92,246,.15);border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;border:1px solid rgba(139,92,246,.25);transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
  .sr-feature-item:hover .sr-feature-icon{transform:scale(1.1) rotate(-6deg)}
  .sr-feature-tag{font-size:11px;font-weight:500;color:#a78bfa;background:rgba(139,92,246,.1);padding:3px 10px;border-radius:50px;border:1px solid rgba(139,92,246,.2)}

  /* Step cards */
  .sr-step-card{position:relative;background:rgba(139,92,246,.04);border:1px solid rgba(139,92,246,.15);border-radius:24px;padding:40px 32px;overflow:hidden;transition:transform .4s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .4s}
  .sr-step-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#7c3aed,transparent);transform:scaleX(0);transform-origin:left;transition:transform .5s cubic-bezier(.16,1,.3,1)}
  .sr-step-card:hover{transform:translateY(-8px);border-color:rgba(139,92,246,.4);box-shadow:0 24px 60px rgba(139,92,246,.15)}
  .sr-step-card:hover::before{transform:scaleX(1)}
  .sr-step-num{font-family:'Syne',sans-serif;font-size:52px;font-weight:800;color:rgba(139,92,246,.15);line-height:1;margin-bottom:20px;letter-spacing:-.03em;transition:color .3s}
  .sr-step-card:hover .sr-step-num{color:rgba(139,92,246,.3)}

  /* EA */
  .sr-ea-benefit{display:flex;align-items:center;gap:12px;font-size:15px;color:rgba(255,255,255,.55);transition:color .2s,transform .3s}
  .sr-ea-benefit:hover{color:#fff;transform:translateX(6px)}
  .sr-ea-check{flex-shrink:0;width:22px;height:22px;background:rgba(139,92,246,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid rgba(139,92,246,.3)}

  /* Buttons */
  .sr-btn-primary{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:16px 36px;border-radius:50px;font-weight:600;font-size:18px;text-decoration:none;transition:transform .2s,box-shadow .3s;box-shadow:0 0 45px rgba(139,92,246,.7)}
  .sr-btn-primary:hover{transform:scale(1.05);box-shadow:0 0 65px rgba(139,92,246,.85)}
  .sr-btn-secondary{display:inline-flex;align-items:center;gap:8px;background:transparent;color:rgba(255,255,255,.9);padding:16px 28px;border-radius:50px;font-weight:500;font-size:18px;text-decoration:none;border-bottom:1px solid rgba(139,92,246,.6);transition:color .2s}
  .sr-btn-secondary:hover{color:#a78bfa}

  /* Stat */
  .sr-stat-val{font-family:'Syne',sans-serif;font-size:42px;font-weight:800;letter-spacing:-.03em;background:linear-gradient(135deg,#fff 30%,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

  /* Cursor */
  .sr-cursor{position:fixed;pointer-events:none;z-index:9999;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.07) 0%,transparent 70%);transform:translate(-50%,-50%);mix-blend-mode:screen}

  /* Inputs */
  .sr-input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.2);border-radius:14px;padding:14px 18px;color:#fff;font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .3s,box-shadow .3s}
  .sr-input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.15)}
  .sr-input::placeholder{color:rgba(255,255,255,.3)}
  .sr-input.error{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.15)}
  .sr-otp-input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.2);border-radius:14px;padding:16px;color:#fff;font-size:24px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .3s,box-shadow .3s;letter-spacing:.35em;text-align:center}
  .sr-otp-input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.15)}
  .sr-otp-input::placeholder{color:rgba(255,255,255,.3);letter-spacing:normal;font-size:14px}
  .sr-otp-input.error{border-color:#ef4444}
  .sr-ea-btn{width:100%;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border:none;border-radius:14px;padding:16px;font-size:16px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:transform .15s,box-shadow .3s;box-shadow:0 0 35px rgba(124,58,237,.5);margin-bottom:12px}
  .sr-ea-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 55px rgba(124,58,237,.7)}
  .sr-ea-btn:disabled{opacity:.5;cursor:not-allowed}
  .sr-back-btn{background:none;border:none;color:rgba(255,255,255,.3);font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:color .2s;display:block;width:100%;text-align:center;padding:6px}
  .sr-back-btn:hover{color:#a78bfa}

  @media(max-width:768px){
    .sr-nav{padding:0 20px;height:64px}
    .sr-nav-links{display:none!important}
    .sr-steps-grid{grid-template-columns:1fr!important}
    .sr-ea-grid{grid-template-columns:1fr!important}
    .sr-hero-title{font-size:clamp(56px,15vw,90px)!important}
  }
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rootRef   = useRef<HTMLDivElement>(null);
  const emailRef  = useRef<HTMLInputElement>(null);
  const otpRef    = useRef<HTMLInputElement>(null);

  const [scrolled,  setScrolled]  = useState(false);
  const [step,      setStep]      = useState<'email'|'otp'|'done'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [emailErr,  setEmailErr]  = useState(false);
  const [otpErr,    setOtpErr]    = useState(false);

  const BASE = import.meta.env.VITE_API_URL || 'https://uptrent-backend.onrender.com';

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    let W = 0, H = 0, raf = 0;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const pts = Array.from({ length: 60 }, () => ({ x:rand(0,W||1200), y:rand(0,H||800), vx:rand(-.2,.2), vy:rand(-.32,-.08), r:rand(.7,2.4), a:rand(.08,.45), life:rand(0,Math.PI*2) }));
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      for (const p of pts) {
        p.life += .012; p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = H+10; p.x = rand(0,W); }
        if (p.x < -10) p.x = W+10; if (p.x > W+10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(167,139,250,${(p.a*(0.6+0.4*Math.sin(p.life))).toFixed(2)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const el = cursorRef.current; if (!el) return;
    let cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy, raf = 0;
    const mv = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    document.addEventListener('mousemove', mv);
    const tick = () => { cx += (tx-cx)*.1; cy += (ty-cy)*.1; el.style.left=`${cx}px`; el.style.top=`${cy}px`; raf = requestAnimationFrame(tick); };
    tick();
    return () => { document.removeEventListener('mousemove', mv); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const cards = rootRef.current?.querySelectorAll<HTMLDivElement>('.sr-feature-item'); if (!cards) return;
    const hs: [HTMLDivElement, (e: MouseEvent) => void][] = [];
    cards.forEach(c => {
      const fn = (e: MouseEvent) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', `${((e.clientX-r.left)/r.width*100).toFixed(1)}%`);
        c.style.setProperty('--my', `${((e.clientY-r.top)/r.height*100).toFixed(1)}%`);
      };
      c.addEventListener('mousemove', fn); hs.push([c, fn]);
    });
    return () => hs.forEach(([c, fn]) => c.removeEventListener('mousemove', fn));
  }, []);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.sr-reveal,.sr-reveal-l,.sr-reveal-r,.sr-reveal-s'); if (!els) return;
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } }), { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSendOTP = async () => {
    const email = emailRef.current?.value.trim() ?? '';
    const name  = (document.getElementById('sr-name-input') as HTMLInputElement)?.value.trim() ?? '';
    if (!email || !email.includes('@')) {
      setEmailErr(true); emailRef.current?.classList.add('sr-shake');
      setTimeout(() => { setEmailErr(false); emailRef.current?.classList.remove('sr-shake'); }, 800); return;
    }
    setLoading(true); setErrorMsg('');
    try {
      const res  = await fetch(`${BASE}/api/waitlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, name: name || email.split('@')[0] }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setUserEmail(email); setStep('otp');
    } catch (err: any) { setErrorMsg(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const token = otpRef.current?.value.trim() ?? '';
    if (!token || token.length < 6) {
      setOtpErr(true); otpRef.current?.classList.add('sr-shake');
      setTimeout(() => { setOtpErr(false); otpRef.current?.classList.remove('sr-shake'); }, 800); return;
    }
    setLoading(true); setErrorMsg('');
    try {
      const res  = await fetch(`${BASE}/api/waitlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: userEmail, otp: token, action:'verify' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      setStep('done');
    } catch (err: any) { setErrorMsg(err.message || 'Invalid code. Please try again.'); }
    finally { setLoading(false); }
  };

  const SOCIAL = 'Social';
  const RUM    = 'Rum';

  return (
    <div ref={rootRef} className="sr-root" style={{ background:'#000' }}>
      <style>{css}</style>
      <div ref={cursorRef} className="sr-cursor" />
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />

      {/* Background radial glow */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(circle at center, rgba(139,92,246,0.18), transparent 60%)' }} />
      {/* Background grid */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:0.04, backgroundImage:'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />

      {/* ══════ NAVBAR ══════ */}
      <nav className={`sr-nav sr-anim-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="/home" style={{ display:'flex', alignItems:'center', gap:14, textDecoration:'none' }}>
          <div style={{ width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,.1)', background:'rgba(0,0,0,.4)', backdropFilter:'blur(12px)', display:'grid', placeItems:'center', boxShadow:'0 0 30px rgba(139,92,246,.4)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
              {Array.from({length:9}).map((_,i) => (
                <div key={i} style={{ width:8, height:8, borderRadius:3, background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }} />
              ))}
            </div>
          </div>
          <span style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:700, color:'#fff', letterSpacing:'-.02em' }}>SocialRum</span>
        </a>

        <ul className="sr-nav-links" style={{ display:'flex', gap:48, listStyle:'none' }}>
          {['Features','How It Works','Early Access'].map(l => (
            <li key={l}><a href={`#${l.toLowerCase().replace(/ /g,'-')}`} className="sr-nav-link">{l}</a></li>
          ))}
        </ul>

        <a href="#early-access" style={{ padding:'12px 28px', borderRadius:50, background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontWeight:600, fontSize:16, textDecoration:'none', boxShadow:'0 0 35px rgba(139,92,246,.7)', transition:'transform .2s,box-shadow .3s' }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 0 55px rgba(139,92,246,.9)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 0 35px rgba(139,92,246,.7)'; }}>
          Be the First to Know
        </a>
      </nav>

      {/* ══════ HERO ══════ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>

        {/* VideoBackground — exact socialrum-1 style */}
        <div style={{ position:'absolute', inset:0, zIndex:1, overflow:'hidden', pointerEvents:'none' }} aria-hidden="true">
          {[0,1,2,3,4,5].map(laneIndex => {
            const laneCards = VIDEO_CARDS.filter(c => c.lane === laneIndex);
            const isEvenLane = laneIndex % 2 === 0;
            return (
              <div key={laneIndex} style={{ position:'absolute', top:0, bottom:0, left:`${4 + laneIndex * 16}%`, width:150 }}>
                {laneCards.map(card => {
                  const isIG = card.platform === 'instagram';
                  const platformGrad = isIG ? 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' : 'linear-gradient(135deg,#FF0000,#CC0000)';
                  const platformColor = isIG ? '#E1306C' : '#FF0000';
                  return (
                    <div key={card.id} style={{ position:'absolute', width:140, top: isEvenLane ? -380 : '100%', animationName: isEvenLane ? 'sr-floatDown' : 'sr-floatUp', animationDuration:`${card.speed}s`, animationDelay:`${card.startOffset/10}s`, animationTimingFunction:'linear', animationIterationCount:'infinite', willChange:'transform', backfaceVisibility:'hidden' }}>
                      <div style={{ position:'relative', width:140, height:248, borderRadius:28, overflow:'hidden', background:'rgba(139,92,246,.05)', border:'1px solid rgba(139,92,246,.1)', backdropFilter:'blur(8px)', boxShadow:'0 0 50px rgba(139,92,246,.12)', opacity:0.5 }}>
                        <img src={card.thumbnail} alt="" loading="lazy" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.7 }} onError={e => { (e.target as HTMLImageElement).style.opacity='0'; }} />
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.3) 50%,rgba(0,0,0,0.85) 100%)' }} />
                        {/* Platform badge */}
                        <div style={{ position:'absolute', top:10, left:10, display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:50, background:platformGrad, fontSize:9, fontWeight:700, color:'white' }}>
                          {isIG
                            ? <svg viewBox="0 0 24 24" fill="currentColor" style={{width:9,height:9}}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            : <svg viewBox="0 0 24 24" fill="currentColor" style={{width:9,height:9}}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          }
                          {isIG ? 'Reels' : 'Shorts'}
                        </div>
                        {/* Duration */}
                        <div style={{ position:'absolute', top:10, right:10, padding:'2px 6px', borderRadius:6, background:'rgba(0,0,0,.7)', fontSize:9, color:'white', fontWeight:600 }}>{card.duration}</div>
                        {/* Play */}
                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.15)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg style={{ width:18, height:18, fill:'white', marginLeft:2 }} viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
                          </div>
                        </div>
                        {/* Info */}
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:10 }}>
                          <p style={{ color:'white', fontWeight:600, fontSize:9, lineHeight:1.3, marginBottom:4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{card.title}</p>
                          <div style={{ display:'flex', justifyContent:'space-between' }}>
                            <span style={{ color:'#d1d5db', fontSize:8 }}>{card.channel}</span>
                            <span style={{ fontSize:8, fontWeight:700, color:platformColor }}>{card.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Vignette */}
        <div style={{ position:'absolute', inset:0, zIndex:2, background:['radial-gradient(ellipse 60% 80% at 50% 50%,rgba(0,0,0,.75) 0%,transparent 100%)','linear-gradient(to right,rgba(0,0,0,.95) 0%,rgba(0,0,0,.15) 28%,rgba(0,0,0,.15) 72%,rgba(0,0,0,.95) 100%)','linear-gradient(to bottom,rgba(0,0,0,.9) 0%,rgba(0,0,0,.05) 18%,rgba(0,0,0,.05) 82%,rgba(0,0,0,.9) 100%)'].join(',') }} />

        {/* Horizon glow */}
        <div className="sr-anim-glow" style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:900, height:4, background:'#7c3aed', boxShadow:'0 0 80px 40px rgba(124,58,237,.4),0 0 220px 80px rgba(124,58,237,.12)', zIndex:3 }} />

        {/* Hero content */}
        <div style={{ position:'relative', zIndex:4, textAlign:'center', maxWidth:900, padding:'120px 24px 0' }}>

          {/* Badge */}
          <div className="sr-anim-badge" style={{ display:'inline-flex', alignItems:'center', gap:10, border:'1px solid rgba(139,92,246,.3)', borderRadius:50, padding:'10px 20px 10px 14px', fontSize:13, fontWeight:500, color:'#c4b5fd', background:'rgba(139,92,246,.06)', backdropFilter:'blur(12px)', boxShadow:'0 0 30px rgba(139,92,246,.15)', marginBottom:48, letterSpacing:'.08em', textTransform:'uppercase' }}>
            <div className="sr-anim-pulse" style={{ width:10, height:10, background:'#8b5cf6', borderRadius:'50%' }} />
            Now Accepting Early Access
          </div>

          {/* Title: "Social" purple + "Rum" red, same size, sans-serif */}
          <div style={{ marginBottom:16, perspective:600 }} aria-label="SocialRum">
            {[...SOCIAL].map((char, i) => (
              <span key={`s${i}`} className="sr-title-char" style={{ fontFamily:'Arial,Helvetica,sans-serif', fontWeight:900, letterSpacing:'-.02em', fontSize:'clamp(56px,9vw,108px)', color:'#a78bfa', animationDelay:`${(0.3+i*0.05).toFixed(2)}s` }}>{char}</span>
            ))}
            {[...RUM].map((char, i) => (
              <span key={`r${i}`} className="sr-title-char" style={{ fontFamily:'Arial,Helvetica,sans-serif', fontWeight:900, letterSpacing:'-.02em', fontSize:'clamp(56px,9vw,108px)', color:'#ff0000', animationDelay:`${(0.6+i*0.06).toFixed(2)}s` }}>{char}</span>
            ))}
          </div>
          {/* Underline glow */}
          <div style={{ width:'70%', height:3, background:'linear-gradient(to right,transparent,#8b5cf6,transparent)', margin:'0 auto 40px', borderRadius:50, boxShadow:'0 0 30px rgba(139,92,246,.8)' }} />

          {/* Subtitle */}
          <h2 className="sr-anim-sub" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3.5vw,46px)', fontWeight:700, color:'#fff', letterSpacing:'-.02em', lineHeight:1.2, marginBottom:28, opacity:0 }}>
            Create Content <span style={{ color:'#8b5cf6' }}>That Actually</span><br/>Gets Discovered
          </h2>

          {/* Description */}
          <p className="sr-anim-desc" style={{ fontFamily:'DM Sans,sans-serif', fontSize:18, color:'rgba(255,255,255,.6)', lineHeight:1.75, maxWidth:600, margin:'0 auto 48px', opacity:0 }}>
            SocialRum brings YouTube and Instagram creators a unified AI workspace — trending topics, script generation, content analysis, and SEO in one dark premium dashboard.
          </p>

          {/* CTAs */}
          <div className="sr-anim-btns" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, flexWrap:'wrap', opacity:0 }}>
            <a href="#early-access" className="sr-btn-primary">Be the First to Know →</a>
            <a href="#features" className="sr-btn-secondary">Explore Features</a>
          </div>
        </div>
      </section>

      {/* ══════ STATS ══════ */}
      <div style={{ background:'rgba(139,92,246,.04)', borderTop:'1px solid rgba(139,92,246,.15)', borderBottom:'1px solid rgba(139,92,246,.15)', padding:'48px 32px', display:'flex', justifyContent:'center', gap:80, flexWrap:'wrap', position:'relative', zIndex:5 }}>
        {STATS.map((s, i) => (
          <div key={s.label} className={`sr-reveal sr-d${i+1}`} style={{ textAlign:'center' }}>
            <div className="sr-stat-val">{s.value}</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,.5)', marginTop:6, fontFamily:'DM Sans,sans-serif' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══════ FEATURES ══════ */}
      <section id="features" style={{ maxWidth:1100, margin:'0 auto', padding:'120px 32px 100px', position:'relative', zIndex:5 }}>
        <p className="sr-reveal" style={{ fontSize:12, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#8b5cf6', marginBottom:16, fontFamily:'DM Sans,sans-serif' }}>Platform Features</p>
        <h2 className="sr-reveal sr-d1" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:700, lineHeight:1.15, letterSpacing:'-.02em', color:'#fff', marginBottom:16 }}>Every tool a serious creator needs.</h2>
        <p className="sr-reveal sr-d2" style={{ fontSize:17, color:'rgba(255,255,255,.5)', lineHeight:1.7, maxWidth:540, marginBottom:64, fontFamily:'DM Sans,sans-serif' }}>Built specifically for YouTube and Instagram creators who want to grow faster without guessing.</p>
        <div className="sr-reveal-s sr-d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
          {FEATURES.map(f => (
            <div key={f.num} className="sr-feature-item">
              <p style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#8b5cf6', opacity:.6, letterSpacing:'.05em', marginBottom:16 }}>{f.num}</p>
              <div className="sr-feature-icon">
                {f.num==='01'&&<svg viewBox="0 0 24 24" style={{width:24,height:24,stroke:'#a78bfa',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/><path d="M14 2v6h6M8 13h8M8 17h4"/></svg>}
                {f.num==='02'&&<svg viewBox="0 0 24 24" style={{width:24,height:24,stroke:'#a78bfa',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>}
                {f.num==='03'&&<svg viewBox="0 0 24 24" style={{width:24,height:24,stroke:'#a78bfa',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>}
                {f.num==='04'&&<svg viewBox="0 0 24 24" style={{width:24,height:24,stroke:'#a78bfa',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
                {f.num==='05'&&<svg viewBox="0 0 24 24" style={{width:24,height:24,stroke:'#a78bfa',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>}
              </div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#fff', marginBottom:10 }}>{f.title}</h3>
              <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', lineHeight:1.7, fontFamily:'DM Sans,sans-serif' }}>{f.desc}</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:16 }}>
                {f.tags.map(tag => <span key={tag} className="sr-feature-tag">{tag}</span>)}
              </div>
            </div>
          ))}
          <div style={{ background:'rgba(139,92,246,.04)', border:'1px solid rgba(139,92,246,.1)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', minHeight:240 }}>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800, color:'rgba(139,92,246,.2)', letterSpacing:'-.03em', marginBottom:8 }}>More coming</p>
              <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', fontFamily:'DM Sans,sans-serif' }}>Platform is actively growing</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height:'1px', background:'rgba(139,92,246,.15)', margin:'0 32px', position:'relative', zIndex:5 }} />

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how-it-works" style={{ maxWidth:1100, margin:'0 auto', padding:'100px 32px', position:'relative', zIndex:5 }}>
        <p className="sr-reveal" style={{ fontSize:12, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#8b5cf6', marginBottom:16, fontFamily:'DM Sans,sans-serif' }}>How It Works</p>
        <h2 className="sr-reveal sr-d1" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:700, lineHeight:1.15, letterSpacing:'-.02em', color:'#fff', marginBottom:16 }}>From zero to algorithm-ready<br/>in one session.</h2>
        <p className="sr-reveal sr-d2" style={{ fontSize:17, color:'rgba(255,255,255,.5)', lineHeight:1.7, maxWidth:540, marginBottom:64, fontFamily:'DM Sans,sans-serif' }}>No complex setup. No learning curve. Connect your channels and SocialRum immediately starts surfacing what to create, how to optimize it, and how to rank it.</p>
        <div className="sr-steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} className={`sr-reveal sr-d${i+2} sr-step-card`}>
              <div className="sr-step-num">{s.num}</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#fff', marginBottom:12 }}>{s.title}</h3>
              <p style={{ fontSize:13, fontWeight:600, color:'#8b5cf6', marginBottom:10, fontFamily:'DM Sans,sans-serif' }}>{s.sub}</p>
              <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', lineHeight:1.7, fontFamily:'DM Sans,sans-serif' }}>{s.desc}</p>
              <p style={{ marginTop:20, fontSize:12, color:'rgba(139,92,246,.6)', fontStyle:'italic', fontFamily:'DM Sans,sans-serif' }}>{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height:'1px', background:'rgba(139,92,246,.15)', margin:'0 32px', position:'relative', zIndex:5 }} />

      {/* ══════ EARLY ACCESS ══════ */}
      <div id="early-access" style={{ position:'relative', zIndex:5 }}>
        <div className="sr-ea-grid" style={{ maxWidth:1100, margin:'0 auto', padding:'100px 32px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>

          {/* Left */}
          <div className="sr-reveal-l">
            <p style={{ fontSize:12, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#8b5cf6', marginBottom:16, fontFamily:'DM Sans,sans-serif' }}>Limited Spots Remaining</p>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:700, lineHeight:1.15, letterSpacing:'-.02em', color:'#fff', marginBottom:16 }}>Be the First to<br/>Know &amp; Create.</h2>
            <p style={{ fontSize:17, color:'rgba(255,255,255,.5)', lineHeight:1.7, fontFamily:'DM Sans,sans-serif' }}>Get early access and founding creator status when SocialRum launches.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:32 }}>
              {['Beta Access — Use all 5 tools before public launch','Founding Creator Badge — Exclusive profile recognition','Free Early Access Tier — No credit card required','Priority support from the SocialRum team'].map(b => (
                <div key={b} className="sr-ea-benefit">
                  <div className="sr-ea-check">
                    <svg viewBox="0 0 12 12" style={{ width:10, height:10 }} fill="none" strokeWidth={2.5} stroke="#a78bfa" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="sr-reveal-r" style={{ position:'relative', background:'rgba(139,92,246,.04)', border:'1px solid rgba(139,92,246,.2)', borderRadius:32, padding:'44px 40px', overflow:'hidden', transition:'border-color .3s,box-shadow .4s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(139,92,246,.4)'; e.currentTarget.style.boxShadow='0 0 80px rgba(139,92,246,.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(139,92,246,.2)'; e.currentTarget.style.boxShadow='none'; }}>
            <div className="sr-anim-orb" style={{ position:'absolute', top:-80, right:-80, width:220, height:220, background:'radial-gradient(circle,rgba(139,92,246,.15),transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

            {step === 'done' && (
              <div className="sr-fade-in" style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ width:72, height:72, background:'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
                  <svg viewBox="0 0 24 24" style={{ width:36, height:36, fill:'none', stroke:'white', strokeWidth:2.5, strokeLinecap:'round', strokeLinejoin:'round' }}><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:700, color:'#fff', marginBottom:10 }}>You're In! 🎉</h3>
                <p style={{ fontSize:15, color:'rgba(255,255,255,.5)', lineHeight:1.65, marginBottom:24, fontFamily:'DM Sans,sans-serif' }}>Welcome to SocialRum early access.<br/>We'll notify you the moment we launch.</p>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.3)', borderRadius:50, padding:'10px 20px', fontSize:14, color:'#a78bfa', fontWeight:500 }}>
                  ✅ Verified — {userEmail}
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="sr-fade-in">
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:700, color:'#fff', marginBottom:8 }}>Check your email</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', marginBottom:6, fontFamily:'DM Sans,sans-serif' }}>We sent a 6-digit code to</p>
                <p style={{ fontSize:15, color:'#a78bfa', fontWeight:600, marginBottom:28 }}>{userEmail}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28, padding:20, background:'rgba(139,92,246,.06)', borderRadius:16, border:'1px solid rgba(139,92,246,.12)' }}>
                  {['Beta Access to all creator tools','Founding Creator Badge','Free forever tier guaranteed'].map((p, i) => (
                    <div key={p} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'rgba(255,255,255,.5)', fontFamily:'DM Sans,sans-serif' }}>
                      <span className="sr-anim-pulse" style={{ width:6, height:6, background:'#8b5cf6', borderRadius:'50%', flexShrink:0, animationDelay:`${i*0.6}s` }} />{p}
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:14 }}>
                  <input ref={otpRef} type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit code" className={`sr-otp-input${otpErr?' error':''}`} onKeyDown={e => { if (e.key==='Enter') handleVerifyOTP(); }} />
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:12 }}>{errorMsg}</p>}
                <button onClick={handleVerifyOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Verifying...' : 'Verify & Get Access →'}</button>
                <button onClick={() => { setStep('email'); setErrorMsg(''); }} className="sr-back-btn">← Use a different email</button>
              </div>
            )}

            {step === 'email' && (
              <div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:700, color:'#fff', marginBottom:8 }}>Free Early Access</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', marginBottom:28, fontFamily:'DM Sans,sans-serif' }}>Enter your email — we'll send you a verification code.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28, padding:20, background:'rgba(139,92,246,.06)', borderRadius:16, border:'1px solid rgba(139,92,246,.12)' }}>
                  {['Beta Access to all creator tools','Founding Creator Badge','Free forever tier guaranteed'].map((p, i) => (
                    <div key={p} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'rgba(255,255,255,.5)', fontFamily:'DM Sans,sans-serif' }}>
                      <span className="sr-anim-pulse" style={{ width:6, height:6, background:'#8b5cf6', borderRadius:'50%', flexShrink:0, animationDelay:`${i*0.6}s` }} />{p}
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                  <input id="sr-name-input" type="text" placeholder="Your name (optional)" className="sr-input" />
                  <input ref={emailRef} type="email" placeholder="you@example.com" className={`sr-input${emailErr?' error':''}`} onKeyDown={e => { if (e.key==='Enter') handleSendOTP(); }} />
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:12 }}>{errorMsg}</p>}
                <button onClick={handleSendOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Sending code...' : 'Get Early Access →'}</button>
                <p style={{ fontSize:12, color:'rgba(255,255,255,.25)', textAlign:'center', fontFamily:'DM Sans,sans-serif' }}>No spam. No credit card. Unsubscribe anytime.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background:'rgba(139,92,246,.04)', borderTop:'1px solid rgba(139,92,246,.15)', padding:'44px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24, position:'relative', zIndex:5 }}>
        <a href="/home" style={{ display:'flex', alignItems:'center', gap:14, textDecoration:'none' }}>
          <div style={{ width:36, height:36, borderRadius:10, border:'1px solid rgba(255,255,255,.1)', background:'rgba(0,0,0,.4)', display:'grid', placeItems:'center', boxShadow:'0 0 20px rgba(139,92,246,.35)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
              {Array.from({length:9}).map((_,i) => <div key={i} style={{ width:6, height:6, borderRadius:2, background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }} />)}
            </div>
          </div>
          <span style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'#fff' }}>SocialRum</span>
        </a>
        <ul style={{ display:'flex', gap:32, listStyle:'none', flexWrap:'wrap' }}>
          {[['Features','#features'],['How It Works','#how-it-works'],['Early Access','#early-access'],['Contact','mailto:hello@socialrum.com']].map(([label,href]) => (
            <li key={label}>
              <a href={href} style={{ color:'rgba(255,255,255,.45)', textDecoration:'none', fontSize:14, fontFamily:'DM Sans,sans-serif', transition:'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color='#fff')}
                onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,.45)')}>{label}</a>
            </li>
          ))}
        </ul>
        <p style={{ fontSize:13, color:'rgba(255,255,255,.25)', fontFamily:'DM Sans,sans-serif' }}>© 2026 SocialRum · Built for Indian Creators 🇮🇳</p>
      </footer>
    </div>
  );
}