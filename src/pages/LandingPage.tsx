import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const REEL_DATA = [
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d6391833-1773075779744.png', title: 'How I Got 100K Subs in 30 Days', handle: '@CreatorPro', views: '2.4M', dur: '0:58', type: 'Shorts' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b0948c90-1771909777566.png', title: 'Camera Settings for Perfect Reels', handle: '@FilmTips', views: '640K', dur: '0:55', type: 'Shorts' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_17343e164-1768026725793.png', title: 'Monetize Your Channel Fast in 2026', handle: '@MoneyCreator', views: '1.7M', dur: '0:58', type: 'Shorts' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_1521eb58e-1764644106046.png', title: 'Morning Routine That Changed My Life', handle: '@LifeWithAlex', views: '890K', dur: '0:30', type: 'Reels' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_159a50448-1767636094533.png', title: 'Fitness Transformation 30 Days', handle: '@FitLife', views: '4.3M', dur: '0:30', type: 'Reels' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ddab98dc-1773131998650.png', title: 'AI Tools Every Creator Needs in 2026', handle: '@TechCreator', views: '1.1M', dur: '0:45', type: 'Shorts' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_17b6062b2-1772483137359.png', title: 'Grow on YouTube with Zero Budget', handle: '@GrowthHacks', views: '920K', dur: '0:58', type: 'Shorts' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_13a6419a1-1772328360733.png', title: 'Script Writing Secrets for Viral Shorts', handle: '@ScriptMaster', views: '2.2M', dur: '0:55', type: 'Shorts' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_150de2b75-1772333562367.png', title: 'Aesthetic Room Tour 2026', handle: '@AestheticVibes', views: '1.2M', dur: '0:45', type: 'Reels' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_126d7e136-1768020582546.png', title: 'Top 10 Trending Niches Right Now', handle: '@NicheHunter', views: '3.1M', dur: '0:59', type: 'Shorts' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_15eaab260-1772956699125.png', title: 'Minimalist Home Makeover on Budget', handle: '@HomeVibes', views: '1.5M', dur: '0:45', type: 'Reels' },
  { img: 'https://img.rocket.new/generatedImages/rocket_gen_img_194b951ad-1772304624866.png', title: 'Skincare Routine for Glowing Skin', handle: '@GlowUp', views: '2.9M', dur: '0:30', type: 'Reels' },
];

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
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sr-root *, .sr-root *::before, .sr-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .sr-root { background: #06060F; color: #F1F0F8; font-family: 'DM Sans', sans-serif; overflow-x: hidden; min-height: 100vh; }
  .sr-root ::-webkit-scrollbar { width: 6px; }
  .sr-root ::-webkit-scrollbar-track { background: #06060F; }
  .sr-root ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 3px; }

  .sr-reveal   { opacity:0; transform:translateY(40px);  transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1); }
  .sr-reveal-l { opacity:0; transform:translateX(-50px); transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1); }
  .sr-reveal-r { opacity:0; transform:translateX(50px);  transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1); }
  .sr-reveal-s { opacity:0; transform:scale(.88);        transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1); }
  .sr-reveal.on,.sr-reveal-l.on,.sr-reveal-r.on,.sr-reveal-s.on { opacity:1; transform:none; }
  .sr-d1{transition-delay:.1s} .sr-d2{transition-delay:.2s} .sr-d3{transition-delay:.3s} .sr-d4{transition-delay:.4s}

  @keyframes sr-navDown   { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sr-badgeFade { from{opacity:0;transform:translateY(16px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes sr-sFade     { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sr-charUp    { from{opacity:0;transform:translateY(60px) rotateX(25deg)} to{opacity:1;transform:translateY(0) rotateX(0)} }
  @keyframes sr-pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
  @keyframes sr-glowP     { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes sr-orbFloat  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-15px,20px)} }
  @keyframes sr-scrollUp  { from{transform:translateY(0)}    to{transform:translateY(-50%)} }
  @keyframes sr-scrollDn  { from{transform:translateY(-50%)} to{transform:translateY(0)} }
  @keyframes sr-shake     { 0%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} 100%{transform:translateX(0)} }
  @keyframes sr-fadeIn    { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }

  .sr-anim-nav   { animation:sr-navDown   .6s cubic-bezier(.16,1,.3,1) 0s   both }
  .sr-anim-badge { animation:sr-badgeFade .8s cubic-bezier(.16,1,.3,1) .2s  both }
  .sr-anim-sub   { animation:sr-sFade     .9s cubic-bezier(.16,1,.3,1) .8s  both }
  .sr-anim-desc  { animation:sr-sFade     .9s cubic-bezier(.16,1,.3,1) 1.0s both }
  .sr-anim-btns  { animation:sr-sFade     .9s cubic-bezier(.16,1,.3,1) 1.2s both }
  .sr-anim-pulse { animation:sr-pulse 2s ease-in-out infinite }
  .sr-anim-glow  { animation:sr-glowP 4s ease-in-out infinite }
  .sr-anim-orb   { animation:sr-orbFloat 6s ease-in-out infinite }
  .sr-title-char { display:inline-block; animation:sr-charUp .7s cubic-bezier(.16,1,.3,1) both }
  .sr-shake      { animation:sr-shake .36s ease }
  .sr-fade-in    { animation:sr-fadeIn .5s cubic-bezier(.16,1,.3,1) both }

  .sr-strip-up { animation:sr-scrollUp 22s linear infinite; display:flex; flex-direction:column; gap:14px; }
  .sr-strip-dn { animation:sr-scrollDn 26s linear infinite; display:flex; flex-direction:column; gap:14px; }
  .sr-col-1 .sr-strip-up,.sr-col-1 .sr-strip-dn{animation-delay:0s}
  .sr-col-2 .sr-strip-up,.sr-col-2 .sr-strip-dn{animation-delay:-4s}
  .sr-col-3 .sr-strip-up,.sr-col-3 .sr-strip-dn{animation-delay:-8s}
  .sr-col-4 .sr-strip-up,.sr-col-4 .sr-strip-dn{animation-delay:-2s}
  .sr-col-5 .sr-strip-up,.sr-col-5 .sr-strip-dn{animation-delay:-11s}
  .sr-col-6 .sr-strip-up,.sr-col-6 .sr-strip-dn{animation-delay:-6s}
  .sr-col-7 .sr-strip-up,.sr-col-7 .sr-strip-dn{animation-delay:-14s}

  .sr-nav { position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:68px;transition:background .4s,backdrop-filter .4s,border-color .4s; }
  .sr-nav.scrolled { background:rgba(6,6,15,.85);backdrop-filter:blur(18px);border-bottom:.5px solid rgba(124,58,237,.2); }
  .sr-nav-link { position:relative;color:rgba(241,240,248,.55);text-decoration:none;font-size:15px;transition:color .2s; }
  .sr-nav-link::after { content:'';position:absolute;bottom:-2px;left:0;right:0;height:1px;background:#A78BFA;transform:scaleX(0);transform-origin:left;transition:transform .3s cubic-bezier(.16,1,.3,1); }
  .sr-nav-link:hover{color:#F1F0F8}
  .sr-nav-link:hover::after{transform:scaleX(1)}
  .sr-logo-btn{background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:0;transition:opacity .2s}
  .sr-logo-btn:hover{opacity:.85}
  .sr-logo-icon{transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s}
  .sr-logo-icon:hover{transform:rotate(12deg) scale(1.1);box-shadow:0 0 20px rgba(124,58,237,.35)}

  /* ── Hero title two-line layout ── */
  .sr-hero-title {
    font-family:'Syne',sans-serif;
    font-weight:800;
    line-height:0.9;
    letter-spacing:-.03em;
    margin-bottom:4px;
    perspective:600px;
    display:flex;
    flex-direction:column;
    align-items:center;
  }
  .sr-hero-social {
    font-size: clamp(38px, 5.5vw, 68px);
    opacity: 0.45;
  }
  .sr-hero-rum {
    font-size: clamp(80px, 12vw, 140px);
  }

  .sr-reel-card{position:relative;border-radius:14px;overflow:hidden;aspect-ratio:9/16;flex-shrink:0;border:.5px solid rgba(124,58,237,.15);background:#1a1a2e;transition:transform .3s ease,border-color .3s}
  .sr-reel-card:hover{transform:scale(1.04);border-color:rgba(124,58,237,.45)}
  .sr-reel-card img{width:100%;height:100%;object-fit:cover;display:block;opacity:.6;filter:saturate(.65);transition:opacity .3s,filter .3s}
  .sr-reel-card:hover img{opacity:.88;filter:saturate(1)}
  .sr-reel-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}
  .sr-reel-card:hover .sr-reel-play{opacity:1}

  .sr-feature-item{position:relative;background:#0D0D1A;padding:36px 32px;transition:background .3s;cursor:default;overflow:hidden}
  .sr-feature-item::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 120% 80% at var(--mx,50%) var(--my,50%),rgba(124,58,237,.09),transparent 70%);opacity:0;transition:opacity .4s;pointer-events:none}
  .sr-feature-item:hover{background:#10102A}
  .sr-feature-item:hover::after{opacity:1}
  .sr-feature-icon{width:44px;height:44px;background:rgba(124,58,237,.12);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;border:.5px solid rgba(124,58,237,.25);transition:background .3s,border-color .3s,transform .4s cubic-bezier(.34,1.56,.64,1)}
  .sr-feature-item:hover .sr-feature-icon{background:rgba(124,58,237,.22);border-color:rgba(124,58,237,.5);transform:scale(1.12) rotate(-6deg)}
  .sr-feature-tag{font-size:11px;font-weight:500;color:#A78BFA;background:rgba(124,58,237,.1);padding:3px 10px;border-radius:50px;border:.5px solid rgba(124,58,237,.2);transition:background .2s,border-color .2s}
  .sr-feature-item:hover .sr-feature-tag{background:rgba(124,58,237,.2);border-color:rgba(124,58,237,.45)}

  .sr-step-card{position:relative;background:#0D0D1A;border:.5px solid rgba(124,58,237,.2);border-radius:20px;padding:36px 28px;overflow:hidden;transition:transform .4s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .4s}
  .sr-step-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#7C3AED,transparent);transform:scaleX(0);transform-origin:left;transition:transform .5s cubic-bezier(.16,1,.3,1)}
  .sr-step-card:hover{transform:translateY(-8px);border-color:rgba(124,58,237,.4);box-shadow:0 24px 60px rgba(124,58,237,.15)}
  .sr-step-card:hover::before{transform:scaleX(1)}
  .sr-step-num{font-family:'Syne',sans-serif;font-size:52px;font-weight:800;color:rgba(124,58,237,.12);line-height:1;margin-bottom:20px;letter-spacing:-.03em;transition:color .3s}
  .sr-step-card:hover .sr-step-num{color:rgba(124,58,237,.28)}

  .sr-ea-benefit{display:flex;align-items:center;gap:12px;font-size:15px;color:rgba(241,240,248,.55);transition:color .2s,transform .3s cubic-bezier(.16,1,.3,1)}
  .sr-ea-benefit:hover{color:#F1F0F8;transform:translateX(6px)}
  .sr-ea-check{flex-shrink:0;width:20px;height:20px;background:rgba(124,58,237,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;border:.5px solid rgba(124,58,237,.3);transition:background .2s,border-color .2s}
  .sr-ea-benefit:hover .sr-ea-check{background:rgba(124,58,237,.28);border-color:rgba(124,58,237,.6)}

  .sr-btn-primary{display:inline-flex;align-items:center;gap:8px;background:#7C3AED;color:white;padding:15px 30px;border-radius:50px;font-weight:600;font-size:16px;text-decoration:none;transition:background .2s,box-shadow .3s;box-shadow:0 0 40px rgba(124,58,237,.55)}
  .sr-btn-primary:hover{background:#6D28D9;box-shadow:0 0 60px rgba(124,58,237,.7)}
  .sr-btn-secondary{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#F1F0F8;padding:15px 30px;border-radius:50px;font-weight:500;font-size:16px;text-decoration:none;border:.5px solid rgba(241,240,248,.2);transition:border-color .2s,background .2s}
  .sr-btn-secondary:hover{border-color:rgba(241,240,248,.45);background:rgba(255,255,255,.04)}

  .sr-stat-val{font-family:'Syne',sans-serif;font-size:38px;font-weight:800;letter-spacing:-.03em;background:linear-gradient(135deg,#fff 30%,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

  .sr-cursor{position:fixed;pointer-events:none;z-index:9999;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.07) 0%,transparent 70%);transform:translate(-50%,-50%);mix-blend-mode:screen}

  .sr-input{width:100%;background:rgba(255,255,255,.04);border:.5px solid rgba(124,58,237,.2);border-radius:12px;padding:12px 16px;color:#F1F0F8;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .3s,background .3s,box-shadow .3s}
  .sr-input:focus{border-color:#7C3AED;background:rgba(124,58,237,.06);box-shadow:0 0 0 3px rgba(124,58,237,.12)}
  .sr-input::placeholder{color:rgba(241,240,248,.3)}
  .sr-input.error{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.15)}

  .sr-otp-input{width:100%;background:rgba(255,255,255,.04);border:.5px solid rgba(124,58,237,.2);border-radius:12px;padding:14px 16px;color:#F1F0F8;font-size:22px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .3s,background .3s,box-shadow .3s;letter-spacing:.35em;text-align:center}
  .sr-otp-input:focus{border-color:#7C3AED;background:rgba(124,58,237,.06);box-shadow:0 0 0 3px rgba(124,58,237,.12)}
  .sr-otp-input::placeholder{color:rgba(241,240,248,.3);letter-spacing:normal;font-size:14px}
  .sr-otp-input.error{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.15)}

  .sr-ea-btn{width:100%;background:#7C3AED;color:white;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background .2s,transform .15s,box-shadow .3s;box-shadow:0 0 32px rgba(124,58,237,.4);margin-bottom:12px}
  .sr-ea-btn:hover:not(:disabled){background:#6D28D9;transform:translateY(-2px);box-shadow:0 0 50px rgba(124,58,237,.6)}
  .sr-ea-btn:disabled{opacity:.55;cursor:not-allowed}
  .sr-ea-btn:active:not(:disabled){transform:translateY(0)}

  .sr-back-btn{background:none;border:none;color:rgba(241,240,248,.35);font-size:12px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:color .2s;display:block;width:100%;text-align:center;padding:4px}
  .sr-back-btn:hover{color:#A78BFA}

  @media(max-width:768px){
    .sr-nav{padding:0 20px}
    .sr-nav-links{display:none}
    .sr-steps-grid{grid-template-columns:1fr!important}
    .sr-ea-grid{grid-template-columns:1fr!important}
  }
`;

const LogoIcon = () => (
  <div className="sr-logo-icon" style={{ width:34, height:34, background:'#7C3AED', borderRadius:8, display:'grid', placeItems:'center' }}>
    <svg viewBox="0 0 20 20" style={{ width:18, height:18, fill:'white' }}>
      <circle cx="5" cy="5" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="15" cy="5" r="2"/>
      <circle cx="5" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="15" cy="10" r="2"/>
      <circle cx="5" cy="15" r="2"/><circle cx="10" cy="15" r="2"/><circle cx="15" cy="15" r="2"/>
    </svg>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rootRef   = useRef<HTMLDivElement>(null);
  const emailRef  = useRef<HTMLInputElement>(null);
  const otpRef    = useRef<HTMLInputElement>(null);

  const [scrolled,   setScrolled]   = useState(false);
  const [step,       setStep]       = useState<'email' | 'otp' | 'done'>('email');
  const [userEmail,  setUserEmail]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [emailErr,   setEmailErr]   = useState(false);
  const [otpErr,     setOtpErr]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    let W = 0, H = 0, raf = 0;
    type P = { x:number; y:number; vx:number; vy:number; r:number; a:number; life:number };
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const pts: P[] = Array.from({ length: 60 }, () => ({
      x: rand(0, W || 1200), y: rand(0, H || 800),
      vx: rand(-.2, .2), vy: rand(-.32, -.08),
      r: rand(.7, 2.4), a: rand(.08, .45), life: rand(0, Math.PI * 2),
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.life += .012; p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${(p.a * (0.6 + 0.4 * Math.sin(p.life))).toFixed(2)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const el = cursorRef.current; if (!el) return;
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy, raf = 0;
    const mv = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    document.addEventListener('mousemove', mv);
    const tick = () => { cx += (tx - cx) * .1; cy += (ty - cy) * .1; el.style.left = `${cx}px`; el.style.top = `${cy}px`; raf = requestAnimationFrame(tick); };
    tick();
    return () => { document.removeEventListener('mousemove', mv); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const cards = rootRef.current?.querySelectorAll<HTMLDivElement>('.sr-feature-item');
    if (!cards) return;
    const hs: [HTMLDivElement, (e: MouseEvent) => void][] = [];
    cards.forEach(c => {
      const fn = (e: MouseEvent) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
        c.style.setProperty('--my', `${((e.clientY - r.top)  / r.height * 100).toFixed(1)}%`);
      };
      c.addEventListener('mousemove', fn); hs.push([c, fn]);
    });
    return () => hs.forEach(([c, fn]) => c.removeEventListener('mousemove', fn));
  }, []);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.sr-reveal,.sr-reveal-l,.sr-reveal-r,.sr-reveal-s');
    if (!els) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleSendOTP = async () => {
    const email = emailRef.current?.value.trim() ?? '';
    const name = (document.getElementById('sr-name-input') as HTMLInputElement)?.value.trim() ?? '';
    if (!email || !email.includes('@')) {
      setEmailErr(true);
      emailRef.current?.classList.add('sr-shake');
      setTimeout(() => { setEmailErr(false); emailRef.current?.classList.remove('sr-shake'); }, 800);
      return;
    }
    setLoading(true); setErrorMsg('');
    try {
      const res = await fetch(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || email.split('@')[0] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setUserEmail(email); setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const token = otpRef.current?.value.trim() ?? '';
    if (!token || token.length < 6) {
      setOtpErr(true);
      otpRef.current?.classList.add('sr-shake');
      setTimeout(() => { setOtpErr(false); otpRef.current?.classList.remove('sr-shake'); }, 800);
      return;
    }
    setLoading(true); setErrorMsg('');
    try {
      const res = await fetch(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: token, action: 'verify' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      setStep('done');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid code. Please try again.');
    } finally { setLoading(false); }
  };

  const reelCols = Array.from({ length: 7 }, (_, i) => ({
    cards: [...[...REEL_DATA].sort(() => Math.random() - 0.5), ...[...REEL_DATA].sort(() => Math.random() - 0.5)],
    colIdx: i + 1,
    isEven: (i + 1) % 2 === 0,
  }));

  // ── Title char animation: "Social" small + "Rum" big ──
  const SOCIAL = 'Social';
  const RUM    = 'Rum';

  return (
    <div ref={rootRef} className="sr-root">
      <style>{css}</style>
      <div ref={cursorRef} className="sr-cursor" />
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />

      {/* ══════ NAVBAR ══════ */}
      <nav className={`sr-nav sr-anim-nav${scrolled ? ' scrolled' : ''}`}>
        {/* Logo — click goes to app */}
        <a href="/home" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <LogoIcon />
          <span style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#F1F0F8', letterSpacing:'-.02em' }}>SocialRum</span>
        </a>

        <ul className="sr-nav-links" style={{ display:'flex', gap:36, listStyle:'none' }}>
          {['Features','How It Works','Early Access'].map(l => (
            <li key={l}><a href={`#${l.toLowerCase().replace(/ /g,'-')}`} className="sr-nav-link">{l}</a></li>
          ))}
        </ul>
        <a href="#early-access"
          style={{ background:'#7C3AED', color:'white', padding:'10px 22px', borderRadius:50, fontWeight:600, fontSize:14, textDecoration:'none', transition:'background .2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
          onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}>
          Be the First to Know
        </a>
      </nav>

      {/* ══════ HERO ══════ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        {/* Reel bg */}
        <div style={{ position:'absolute', inset:0, display:'flex', gap:14, padding:'0 8px', overflow:'hidden', zIndex:1 }}>
          {reelCols.map(col => (
            <div key={col.colIdx} className={`sr-col-${col.colIdx}`} style={{ flex:1, display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>
              <div className={col.isEven ? 'sr-strip-dn' : 'sr-strip-up'}>
                {col.cards.map((r, ci) => (
                  <div key={`${col.colIdx}-${ci}`} className="sr-reel-card">
                    <img src={r.img} alt={r.title} loading="lazy" onError={e => { (e.target as HTMLImageElement).style.background = '#1e1e35'; }} />
                    <div className="sr-reel-play">
                      <svg viewBox="0 0 24 24" style={{ width:12, height:12, fill:'white', marginLeft:1 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'10px 8px 8px', background:'linear-gradient(transparent,rgba(0,0,0,0.85))' }}>
                      <div>
                        <span style={{ display:'inline-flex', background: r.type==='Reels' ? 'linear-gradient(135deg,#E1306C,#833AB4)' : '#FF0000', color:'white', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3, marginRight:4 }}>{r.type}</span>
                        <span style={{ fontSize:9, color:'rgba(255,255,255,.8)' }}>{r.dur}</span>
                      </div>
                      <p style={{ fontSize:9, color:'rgba(255,255,255,.9)', fontWeight:500, lineHeight:1.3 }}>{r.title}</p>
                      <p style={{ fontSize:8, color:'rgba(255,255,255,.55)', marginTop:2 }}>{r.handle} · {r.views}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Vignette */}
        <div style={{ position:'absolute', inset:0, zIndex:2, background:[
          'radial-gradient(ellipse 55% 75% at 50% 50%,rgba(6,6,15,.8) 0%,transparent 100%)',
          'linear-gradient(to right,rgba(6,6,15,.95) 0%,rgba(6,6,15,.18) 28%,rgba(6,6,15,.18) 72%,rgba(6,6,15,.95) 100%)',
          'linear-gradient(to bottom,rgba(6,6,15,.9) 0%,rgba(6,6,15,.05) 18%,rgba(6,6,15,.05) 82%,rgba(6,6,15,.9) 100%)',
        ].join(',') }} />

        <div className="sr-anim-glow" style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:800, height:3, background:'#7C3AED', boxShadow:'0 0 80px 40px rgba(124,58,237,.35),0 0 220px 80px rgba(124,58,237,.1)', zIndex:3 }} />

        {/* Hero content */}
        <div style={{ position:'relative', zIndex:4, textAlign:'center', maxWidth:860, padding:'0 24px' }}>
          <div className="sr-anim-badge" style={{ display:'inline-flex', alignItems:'center', gap:8, border:'.5px solid rgba(124,58,237,.2)', borderRadius:50, padding:'6px 16px 6px 8px', fontSize:12, fontWeight:500, color:'#A78BFA', background:'rgba(124,58,237,.08)', marginBottom:32, letterSpacing:'.05em', textTransform:'uppercase' }}>
            <span className="sr-anim-pulse" style={{ width:6, height:6, background:'#A78BFA', borderRadius:'50%' }} />
            Now Accepting Early Access
          </div>

          {/* ── Single line: "Social" purple + "Rum" white — same size ── */}
          <div style={{ marginBottom: 4, perspective: 600 }} aria-label="SocialRum">
            {[...SOCIAL].map((char, i) => (
              <span key={`s${i}`} className="sr-title-char"
                style={{
                  fontFamily: 'Arial, Helvetica, sans-serif',
fontWeight: 900,
letterSpacing: '-.02em',
fontSize: 'clamp(32px, 5vw, 60px)',
color: '#A78BFA',
                  animationDelay: `${(0.3 + i * 0.05).toFixed(2)}s`,
                }}>
                {char}
              </span>
            ))}
            {[...RUM].map((char, i) => (
              <span key={`r${i}`} className="sr-title-char"
                style={{
                  fontFamily: 'Arial, Helvetica, sans-serif',
fontWeight: 900,
letterSpacing: '-.02em',
fontSize: 'clamp(32px, 5vw, 60px)',
color: '#f31212',
                  animationDelay: `${(0.6 + i * 0.06).toFixed(2)}s`,
                }}>
                {char}
              </span>
            ))}
          </div>

          <p className="sr-anim-sub" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(20px,3.2vw,42px)', fontWeight:700, color:'#F1F0F8', letterSpacing:'-.02em', marginBottom:28, opacity:0 }}>
            Create Content That Actually Gets Discovered
          </p>
          <p className="sr-anim-desc" style={{ fontFamily:'DM Sans,sans-serif', fontSize:17, color:'rgba(241,240,248,.55)', lineHeight:1.7, maxWidth:560, margin:'0 auto 40px', opacity:0 }}>
            SocialRum brings YouTube and Instagram creators a unified AI workspace — trending topics, script generation, content analysis, and SEO in one dark premium dashboard.
          </p>
          <div className="sr-anim-btns" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap', opacity:0 }}>
            <a href="#early-access" className="sr-btn-primary">Be the First to Know <span>→</span></a>
            <a href="#features" className="sr-btn-secondary">Explore Features ↓</a>
          </div>
        </div>
      </section>

      {/* ══════ STATS ══════ */}
      <div style={{ background:'#0D0D1A', borderTop:'.5px solid rgba(124,58,237,.2)', borderBottom:'.5px solid rgba(124,58,237,.2)', padding:'40px 32px', display:'flex', justifyContent:'center', gap:80, flexWrap:'wrap', position:'relative', zIndex:5 }}>
        {STATS.map((s, i) => (
          <div key={s.label} className={`sr-reveal sr-d${i+1}`} style={{ textAlign:'center' }}>
            <div className="sr-stat-val">{s.value}</div>
            <div style={{ fontSize:13, color:'rgba(241,240,248,.55)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══════ FEATURES ══════ */}
      <section id="features" style={{ maxWidth:1100, margin:'0 auto', padding:'120px 32px 100px', position:'relative', zIndex:5 }}>
        <div style={{ marginBottom:64 }}>
          <p className="sr-reveal" style={{ fontSize:12, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#A78BFA', marginBottom:16 }}>Platform Features</p>
          <h2 className="sr-reveal sr-d1" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:700, lineHeight:1.15, letterSpacing:'-.02em', color:'#F1F0F8', marginBottom:16 }}>Every tool a serious creator needs.</h2>
          <p className="sr-reveal sr-d2" style={{ fontSize:17, color:'rgba(241,240,248,.55)', lineHeight:1.7, maxWidth:540 }}>Built specifically for YouTube and Instagram creators who want to grow faster without guessing.</p>
        </div>
        <div className="sr-reveal-s sr-d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:2, border:'.5px solid rgba(124,58,237,.2)', borderRadius:20, overflow:'hidden', background:'rgba(124,58,237,.2)' }}>
          {FEATURES.map(f => (
            <div key={f.num} className="sr-feature-item">
              <p style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#A78BFA', opacity:.5, letterSpacing:'.05em', marginBottom:16 }}>{f.num}</p>
              <div className="sr-feature-icon">
                {f.num==='01'&&<svg viewBox="0 0 24 24" style={{width:22,height:22,stroke:'#A78BFA',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/><path d="M14 2v6h6M8 13h8M8 17h4"/></svg>}
                {f.num==='02'&&<svg viewBox="0 0 24 24" style={{width:22,height:22,stroke:'#A78BFA',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>}
                {f.num==='03'&&<svg viewBox="0 0 24 24" style={{width:22,height:22,stroke:'#A78BFA',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>}
                {f.num==='04'&&<svg viewBox="0 0 24 24" style={{width:22,height:22,stroke:'#A78BFA',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
                {f.num==='05'&&<svg viewBox="0 0 24 24" style={{width:22,height:22,stroke:'#A78BFA',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>}
              </div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'#F1F0F8', marginBottom:10 }}>{f.title}</h3>
              <p style={{ fontSize:14, color:'rgba(241,240,248,.55)', lineHeight:1.65 }}>{f.desc}</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:16 }}>
                {f.tags.map(tag => <span key={tag} className="sr-feature-tag">{tag}</span>)}
              </div>
            </div>
          ))}
          <div style={{ background:'rgba(124,58,237,.05)', display:'flex', alignItems:'center', justifyContent:'center', minHeight:240 }}>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, color:'rgba(124,58,237,.18)', letterSpacing:'-.03em', marginBottom:8 }}>More coming</p>
              <p style={{ fontSize:14, color:'rgba(241,240,248,.55)' }}>Platform is actively growing</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height:'.5px', background:'rgba(124,58,237,.2)', margin:'0 32px', position:'relative', zIndex:5 }} />

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how-it-works" style={{ maxWidth:1100, margin:'0 auto', padding:'100px 32px', position:'relative', zIndex:5 }}>
        <p className="sr-reveal" style={{ fontSize:12, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#A78BFA', marginBottom:16 }}>How It Works</p>
        <h2 className="sr-reveal sr-d1" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:700, lineHeight:1.15, letterSpacing:'-.02em', color:'#F1F0F8', marginBottom:16 }}>From zero to algorithm-ready<br/>in one session.</h2>
        <p className="sr-reveal sr-d2" style={{ fontSize:17, color:'rgba(241,240,248,.55)', lineHeight:1.7, maxWidth:540 }}>No complex setup. No learning curve. Connect your channels and SocialRum immediately starts surfacing what to create, how to optimize it, and how to rank it.</p>
        <div className="sr-steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, marginTop:64 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} className={`sr-reveal sr-d${i+2} sr-step-card`}>
              <div className="sr-step-num">{s.num}</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#F1F0F8', marginBottom:12 }}>{s.title}</h3>
              <p style={{ fontSize:13, fontWeight:600, color:'#A78BFA', marginBottom:10 }}>{s.sub}</p>
              <p style={{ fontSize:14, color:'rgba(241,240,248,.55)', lineHeight:1.65 }}>{s.desc}</p>
              <p style={{ marginTop:20, fontSize:12, color:'rgba(124,58,237,.6)', fontStyle:'italic' }}>{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height:'.5px', background:'rgba(124,58,237,.2)', margin:'0 32px', position:'relative', zIndex:5 }} />

      {/* ══════ EARLY ACCESS ══════ */}
      <div id="early-access" style={{ position:'relative', zIndex:5 }}>
        <div className="sr-ea-grid" style={{ maxWidth:1100, margin:'0 auto', padding:'100px 32px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
          <div className="sr-reveal-l">
            <p style={{ fontSize:12, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#A78BFA', marginBottom:16 }}>Limited Spots Remaining</p>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:700, lineHeight:1.15, letterSpacing:'-.02em', color:'#F1F0F8', marginBottom:16 }}>Be the First to<br/>Know &amp; Create.</h2>
            <p style={{ fontSize:17, color:'rgba(241,240,248,.55)', lineHeight:1.7 }}>Get early access and founding creator status when SocialRum launches.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:32 }}>
              {['Beta Access — Use all 5 tools before public launch','Founding Creator Badge — Exclusive profile recognition','Free Early Access Tier — No credit card required','Priority support from the SocialRum team'].map(b => (
                <div key={b} className="sr-ea-benefit">
                  <div className="sr-ea-check">
                    <svg viewBox="0 0 12 12" style={{ width:10, height:10 }} fill="none" strokeWidth={2.5} stroke="#A78BFA" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="sr-reveal-r" style={{ position:'relative', background:'#0D0D1A', border:'.5px solid rgba(124,58,237,.2)', borderRadius:24, padding:'40px 36px', overflow:'hidden', transition:'border-color .3s,box-shadow .4s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(124,58,237,.4)'; e.currentTarget.style.boxShadow='0 0 80px rgba(124,58,237,.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(124,58,237,.2)'; e.currentTarget.style.boxShadow='none'; }}>
            <div className="sr-anim-orb" style={{ position:'absolute', top:-80, right:-80, width:220, height:220, background:'radial-gradient(circle,rgba(124,58,237,.15),transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

            {step === 'done' && (
              <div className="sr-fade-in" style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ width:64, height:64, background:'linear-gradient(135deg,#7C3AED,#A78BFA)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <svg viewBox="0 0 24 24" style={{ width:30, height:30, fill:'none', stroke:'white', strokeWidth:2.5, strokeLinecap:'round', strokeLinejoin:'round' }}><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, color:'#F1F0F8', marginBottom:8 }}>You're In! 🎉</h3>
                <p style={{ fontSize:14, color:'rgba(241,240,248,.55)', lineHeight:1.6, marginBottom:20 }}>Welcome to SocialRum early access.<br/>We'll notify you the moment we launch.</p>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(124,58,237,.1)', border:'.5px solid rgba(124,58,237,.3)', borderRadius:50, padding:'8px 18px', fontSize:13, color:'#A78BFA', fontWeight:500 }}>
                  ✅ Verified — {userEmail}
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="sr-fade-in">
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, color:'#F1F0F8', marginBottom:6, position:'relative' }}>Check your email</h3>
                <p style={{ fontSize:14, color:'rgba(241,240,248,.55)', marginBottom:6, lineHeight:1.5, position:'relative' }}>We sent a 6-digit code to</p>
                <p style={{ fontSize:14, color:'#A78BFA', fontWeight:600, marginBottom:28 }}>{userEmail}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28, padding:18, background:'rgba(124,58,237,.05)', borderRadius:12, border:'.5px solid rgba(124,58,237,.12)', position:'relative' }}>
                  {['Beta Access to all creator tools','Founding Creator Badge','Free forever tier guaranteed'].map((p, i) => (
                    <div key={p} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'rgba(241,240,248,.55)' }}>
                      <span className="sr-anim-pulse" style={{ width:5, height:5, background:'#A78BFA', borderRadius:'50%', flexShrink:0, animationDelay:`${i*0.6}s` }} />{p}
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:12 }}>
                  <input ref={otpRef} type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit code" className={`sr-otp-input${otpErr ? ' error' : ''}`} onKeyDown={e => { if (e.key === 'Enter') handleVerifyOTP(); }} />
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleVerifyOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Verifying...' : 'Verify & Get Access →'}</button>
                <button onClick={() => { setStep('email'); setErrorMsg(''); }} className="sr-back-btn">← Use a different email</button>
              </div>
            )}

            {step === 'email' && (
              <div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, color:'#F1F0F8', marginBottom:6, position:'relative' }}>Free Early Access</h3>
                <p style={{ fontSize:14, color:'rgba(241,240,248,.55)', marginBottom:28, lineHeight:1.5, position:'relative' }}>Enter your email — we'll send you a verification code.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28, padding:18, background:'rgba(124,58,237,.05)', borderRadius:12, border:'.5px solid rgba(124,58,237,.12)', position:'relative' }}>
                  {['Beta Access to all creator tools','Founding Creator Badge','Free forever tier guaranteed'].map((p, i) => (
                    <div key={p} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'rgba(241,240,248,.55)' }}>
                      <span className="sr-anim-pulse" style={{ width:5, height:5, background:'#A78BFA', borderRadius:'50%', flexShrink:0, animationDelay:`${i*0.6}s` }} />{p}
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:12 }}>
                  <input id="sr-name-input" type="text" placeholder="Your name (optional)" className="sr-input" style={{ marginBottom: 8 }} />
                  <input ref={emailRef} type="email" placeholder="you@example.com" className={`sr-input${emailErr ? ' error' : ''}`} onKeyDown={e => { if (e.key === 'Enter') handleSendOTP(); }} />
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleSendOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Sending code...' : 'Get Early Access →'}</button>
                <p style={{ fontSize:12, color:'rgba(241,240,248,.3)', textAlign:'center' }}>No spam. No credit card. Unsubscribe anytime.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background:'#0D0D1A', borderTop:'.5px solid rgba(124,58,237,.2)', padding:'40px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24, position:'relative', zIndex:5 }}>
        <a href="/home" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:30, height:30, background:'#7C3AED', borderRadius:7, display:'grid', placeItems:'center' }}>
            <svg viewBox="0 0 20 20" style={{ width:16, height:16, fill:'white' }}>
              <circle cx="5" cy="5" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="15" cy="5" r="2"/>
              <circle cx="5" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="15" cy="10" r="2"/>
              <circle cx="5" cy="15" r="2"/><circle cx="10" cy="15" r="2"/><circle cx="15" cy="15" r="2"/>
            </svg>
          </div>
          <span style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, color:'#F1F0F8' }}>SocialRum</span>
        </a>
        <ul style={{ display:'flex', gap:28, listStyle:'none', flexWrap:'wrap' }}>
          {[['Features','#features'],['How It Works','#how-it-works'],['Early Access','#early-access'],['Contact','mailto:hello@socialrum.com']].map(([label,href]) => (
            <li key={label}>
              <a href={href} style={{ color:'rgba(241,240,248,.55)', textDecoration:'none', fontSize:14, transition:'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F1F0F8')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(241,240,248,.55)')}>{label}</a>
            </li>
          ))}
        </ul>
        <p style={{ fontSize:13, color:'rgba(241,240,248,.3)' }}>© 2026 SocialRum</p>
      </footer>
    </div>
  );
}