import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const REEL_CARDS = VIDEO_CARDS.slice(0, 4);

const TypingScript = () => {
  const hooks = ["Generating viral hook...", "Analyzing retention metrics...", "Structuring body layout...", "Optimizing keyword vectors..."];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex(prev => (prev + 1) % hooks.length), 2500);
    return () => clearInterval(interval);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.span key={index} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}>
        {hooks[index]}
      </motion.span>
    </AnimatePresence>
  );
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  .sr-feature-item{background:rgba(139,92,246,0.03);border:1px solid rgba(139,92,246,0.1);border-radius:24px;padding:28px;transition:background .3s,border-color .3s;cursor:default;position:relative;overflow:hidden}
  .sr-feature-item:hover{background:rgba(139,92,246,0.07);border-color:rgba(139,92,246,0.25)}
  .sr-feature-tag{font-size:11px;font-weight:500;color:#a78bfa;background:rgba(139,92,246,0.1);padding:3px 10px;border-radius:50px;border:1px solid rgba(139,92,246,0.2)}
  .sr-step-card{background:rgba(139,92,246,0.03);border:1px solid rgba(139,92,246,0.12);border-radius:24px;padding:32px;transition:transform .4s,border-color .3s,box-shadow .4s;position:relative;overflow:hidden}
  .sr-step-card:hover{transform:translateY(-6px);border-color:rgba(139,92,246,0.35);box-shadow:0 20px 50px rgba(139,92,246,0.12)}
  .sr-step-num{font-family:'Syne',sans-serif;font-size:48px;font-weight:800;color:rgba(139,92,246,0.12);line-height:1;margin-bottom:16px;letter-spacing:-.03em;transition:color .3s}
  .sr-step-card:hover .sr-step-num{color:rgba(139,92,246,0.28)}
  .sr-input{width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:12px 16px;color:#fff;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .3s,box-shadow .3s}
  .sr-input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,0.15)}
  .sr-input::placeholder{color:rgba(255,255,255,0.25)}
  .sr-ea-btn{width:100%;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:transform .15s,box-shadow .3s;box-shadow:0 0 30px rgba(124,58,237,0.4);margin-bottom:10px}
  .sr-ea-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 50px rgba(124,58,237,0.6)}
  .sr-ea-btn:disabled{opacity:.5;cursor:not-allowed}
  .sr-fade-in{animation:srFadeIn .4s ease both}
  @keyframes srFadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
  @keyframes srFloatDown{from{transform:translate3d(0,-380px,0)}to{transform:translate3d(0,calc(100vh + 380px),0)}}
  @keyframes srFloatUp{from{transform:translate3d(0,calc(100vh + 380px),0)}to{transform:translate3d(0,-380px,0)}}
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [step, setStep] = useState<'email'|'otp'|'done'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const BASE = import.meta.env.VITE_API_URL || 'https://uptrent-backend.onrender.com';

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

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
    <div className="relative min-h-screen bg-[#03000a] text-white font-sans overflow-x-hidden">
      <style>{css}</style>

      {/* Animated background glow */}
      <motion.div animate={{ scale:[1,1.06,1], rotate:[0,2,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }}
        style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', background:'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.09), transparent 65%)' }} />
      {/* Animated grid */}
      <motion.div animate={{ y:[0,-15,0], x:[0,10,0] }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
        style={{ position:'fixed', inset:-20, zIndex:1, pointerEvents:'none', opacity:0.025, backgroundImage:'linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />

      {/* VideoBackground — floating cards */}
      <div style={{ position:'fixed', inset:0, zIndex:2, overflow:'hidden', pointerEvents:'none' }} aria-hidden="true">
        {[0,1,2,3,4,5].map(laneIndex => {
          const laneCards = VIDEO_CARDS.filter(c => c.lane === laneIndex);
          const isEven = laneIndex % 2 === 0;
          return (
            <div key={laneIndex} style={{ position:'absolute', top:0, bottom:0, left:`${4 + laneIndex * 16}%`, width:140 }}>
              {laneCards.map(card => {
                const isIG = card.platform === 'instagram';
                const platformGrad = isIG ? 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' : 'linear-gradient(135deg,#FF0000,#CC0000)';
                const platformColor = isIG ? '#E1306C' : '#FF0000';
                return (
                  <div key={card.id} style={{ position:'absolute', width:130, top: isEven ? -380 : '100%', animationName: isEven ? 'srFloatDown' : 'srFloatUp', animationDuration:`${card.speed}s`, animationDelay:`${card.startOffset/10}s`, animationTimingFunction:'linear', animationIterationCount:'infinite', willChange:'transform' }}>
                    <div style={{ position:'relative', width:130, height:230, borderRadius:16, overflow:'hidden', background:'rgba(139,92,246,0.05)', border:'1px solid rgba(139,92,246,0.15)', opacity:0.4 }}>
                      <img src={card.thumbnail} alt="" loading="lazy" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.7 }} />
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.8) 100%)' }} />
                      <div style={{ position:'absolute', top:8, left:8, padding:'2px 6px', borderRadius:50, background:platformGrad, fontSize:8, fontWeight:700, color:'white' }}>{isIG ? 'Reels' : 'Shorts'}</div>
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:8 }}>
                        <p style={{ color:'white', fontWeight:600, fontSize:9, lineHeight:1.3, marginBottom:2 }}>{card.title}</p>
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

      {/* NAVBAR */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 64px', height:72, transition:'all .3s', background: scrolled ? 'rgba(3,0,10,0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid rgba(139,92,246,0.1)' : 'none' }}>
        <a href="/home" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', cursor:'pointer' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:10, height:10, borderRadius:3, background:'#a855f7', boxShadow:'0 0 10px #a855f7' }} />
          </div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18, color:'#fff', letterSpacing:'-.02em' }}>SocialRum</span>
        </a>
        <ul style={{ display:'flex', gap:40, listStyle:'none', color:'rgba(255,255,255,0.6)', fontSize:14 }}>
          {['Features','How It Works','Early Access'].map(item => (
            <li key={item}><a href={`#${item.toLowerCase().replace(/ /g,'-')}`} style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none', transition:'color .2s', fontFamily:'DM Sans,sans-serif' }} onMouseEnter={e => (e.currentTarget.style.color='#fff')} onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.6)')}>{item}</a></li>
          ))}
        </ul>
        <a href="#early-access" style={{ background:'rgba(124,58,237,0.2)', border:'1px solid rgba(139,92,246,0.3)', padding:'10px 22px', borderRadius:50, fontSize:13, fontWeight:600, color:'#fff', textDecoration:'none', transition:'all .2s', boxShadow:'0 0 15px rgba(124,58,237,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.background='#7c3aed'; e.currentTarget.style.boxShadow='0 0 30px rgba(124,58,237,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(124,58,237,0.2)'; e.currentTarget.style.boxShadow='0 0 15px rgba(124,58,237,0.2)'; }}>
          Be the First to Know
        </a>
      </nav>

      {/* HERO */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', padding:'0 64px', zIndex:10, paddingTop:80 }}>
        <div style={{ width:'100%', maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:48, alignItems:'center' }}>

          {/* Left — rolling reels */}
          <div style={{ display:'flex', gap:12, height:520, overflow:'hidden', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:64, background:'linear-gradient(to bottom,#03000a,transparent)', zIndex:10, pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:64, background:'linear-gradient(to top,#03000a,transparent)', zIndex:10, pointerEvents:'none' }} />
            {/* Lane 1 — scroll down */}
            <motion.div animate={{ y:[0,-560] }} transition={{ duration:18, repeat:Infinity, ease:'linear' }} style={{ display:'flex', flexDirection:'column', gap:12, width:'50%' }}>
              {[...REEL_CARDS, ...REEL_CARDS].map((card, idx) => (
                <div key={`l1-${idx}`} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16, padding:8, flexShrink:0 }}>
                  <div style={{ position:'relative', aspectRatio:'9/16', borderRadius:10, overflow:'hidden', background:'rgba(124,58,237,0.1)' }}>
                    <img src={card.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.8 }} />
                    <span style={{ position:'absolute', top:6, left:6, background:'#FF0000', color:'white', fontSize:7, fontWeight:700, padding:'2px 5px', borderRadius:3 }}>Shorts</span>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.85),transparent 50%)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:8 }}>
                      <p style={{ fontSize:9, fontWeight:600, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{card.title}</p>
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:8, color:'rgba(255,255,255,0.5)' }}>
                        <span>{card.channel}</span><span style={{ color:'#a78bfa', fontWeight:700 }}>{card.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            {/* Lane 2 — scroll up */}
            <motion.div animate={{ y:[-560,0] }} transition={{ duration:22, repeat:Infinity, ease:'linear' }} style={{ display:'flex', flexDirection:'column', gap:12, width:'50%', marginTop:32 }}>
              {[...REEL_CARDS, ...REEL_CARDS].reverse().map((card, idx) => (
                <div key={`l2-${idx}`} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16, padding:8, flexShrink:0 }}>
                  <div style={{ position:'relative', aspectRatio:'9/16', borderRadius:10, overflow:'hidden', background:'rgba(124,58,237,0.1)' }}>
                    <img src={card.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.8 }} />
                    <span style={{ position:'absolute', top:6, left:6, background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'white', fontSize:7, fontWeight:700, padding:'2px 5px', borderRadius:3 }}>Reels</span>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.85),transparent 50%)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:8 }}>
                      <p style={{ fontSize:9, fontWeight:600, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{card.title}</p>
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:8, color:'rgba(255,255,255,0.5)' }}>
                        <span>{card.channel}</span><span style={{ color:'#a78bfa', fontWeight:700 }}>{card.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Center — hero text */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.6 }}
              style={{ border:'1px solid rgba(139,92,246,0.3)', background:'rgba(139,92,246,0.06)', color:'#c4b5fd', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', padding:'6px 16px', borderRadius:50, fontWeight:600, marginBottom:24, fontFamily:'DM Sans,sans-serif' }}>
              • Now Accepting Early Access
            </motion.div>

            <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }} style={{ position:'relative', marginBottom:8 }}>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(52px,7vw,96px)', fontWeight:800, letterSpacing:'-.03em', margin:0, lineHeight:1 }}>
                <span style={{ color:'#a78bfa', fontFamily:'Arial,Helvetica,sans-serif' }}>Social</span>
                <span style={{ background:'linear-gradient(to bottom,#fff,rgba(255,255,255,0.6))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:'Arial,Helvetica,sans-serif' }}>Rum</span>
              </h1>
              <div style={{ width:'85%', height:2, background:'linear-gradient(to right,transparent,#8b5cf6,transparent)', margin:'8px auto 0', borderRadius:50, boxShadow:'0 0 20px rgba(139,92,246,0.7)' }} />
            </motion.div>

            <motion.h2 initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}
              style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(18px,2.5vw,32px)', fontWeight:700, color:'#fff', marginBottom:16, lineHeight:1.3 }}>
              Create Content <span style={{ color:'#8b5cf6' }}>That Actually</span><br/>Gets Discovered
            </motion.h2>

            <motion.p initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.3 }}
              style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:'rgba(255,255,255,0.5)', maxWidth:380, lineHeight:1.8, marginBottom:32 }}>
              SocialRum brings YouTube and Instagram creators a unified AI workspace — trending topics, script generation, content analysis, and SEO in one dark premium dashboard.
            </motion.p>

            <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.4 }}
              style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap', justifyContent:'center' }}>
              <a href="#early-access" style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontWeight:600, fontSize:14, padding:'14px 32px', borderRadius:50, textDecoration:'none', display:'flex', alignItems:'center', gap:8, boxShadow:'0 0 30px rgba(124,58,237,0.5)', transition:'transform .2s,box-shadow .3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 0 50px rgba(124,58,237,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 0 30px rgba(124,58,237,0.5)'; }}>
                Be the First to Know →
              </a>
              <a href="#features" style={{ fontSize:14, color:'rgba(255,255,255,0.6)', textDecoration:'none', display:'flex', alignItems:'center', gap:6, transition:'color .2s', fontFamily:'DM Sans,sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.color='#fff')} onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.6)')}>
                Explore Features ▼
              </a>
            </motion.div>
          </div>

          {/* Right — dashboard card */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, delay:0.2 }}>
            <div style={{ background:'rgba(11,6,22,0.8)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:28, padding:20, backdropFilter:'blur(20px)', boxShadow:'0 30px 60px rgba(0,0,0,0.6)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-30, right:-30, width:96, height:96, background:'rgba(139,92,246,0.12)', filter:'blur(20px)', borderRadius:'50%', pointerEvents:'none' }} />
              <div style={{ display:'flex', alignItems:'center', gap:8, color:'#a78bfa', fontSize:12, fontWeight:700, marginBottom:16, fontFamily:'DM Sans,sans-serif' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#8b5cf6', animation:'pulse 2s infinite' }} />
                Dashboard
              </div>

              {/* Trending */}
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:16, padding:14, marginBottom:12 }}>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12, fontFamily:'DM Sans,sans-serif' }}>Trending Now</p>
                {[['#AIVideoEditing','Trending'],['#CreatorEconomy2026','Rising'],['#YouTubeShorts','Hot']].map(([tag, status]) => (
                  <div key={tag} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, fontSize:12, color:'#fff', fontFamily:'DM Sans,sans-serif' }}>
                    <span>{tag}</span><span style={{ color:'#a78bfa', fontSize:10, fontWeight:600 }}>↑ {status}</span>
                  </div>
                ))}
              </div>

              {/* Script Generator */}
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:16, padding:14, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'DM Sans,sans-serif' }}>Script Generator</p>
                  <div style={{ width:24, height:24, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 15px rgba(124,58,237,0.5)' }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#fff' }} />
                  </div>
                </div>
                <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, padding:'8px 12px', fontSize:12, color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:'DM Sans,sans-serif' }}>
                  <TypingScript />
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#8b5cf6', flexShrink:0, marginLeft:8 }} />
                </div>
              </div>

              {/* SEO Score */}
              <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.03)', borderRadius:16, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, fontSize:9, fontFamily:'DM Sans,sans-serif' }}>
                  <span style={{ color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>SEO Score</span>
                  <span style={{ color:'#a78bfa', fontWeight:600, fontSize:11 }}>AI Ready</span>
                </div>
                <div style={{ width:'100%', height:6, borderRadius:50, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                  <motion.div animate={{ width:['0%','85%'] }} transition={{ duration:1.5, ease:'easeOut', delay:1 }}
                    style={{ height:'100%', borderRadius:50, background:'linear-gradient(90deg,#7c3aed,#a855f7)', boxShadow:'0 0 10px rgba(139,92,246,0.6)' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ background:'rgba(139,92,246,0.01)', borderTop:'1px solid rgba(139,92,246,0.08)', borderBottom:'1px solid rgba(139,92,246,0.08)', padding:'48px 32px', display:'flex', justifyContent:'center', gap:96, flexWrap:'wrap', position:'relative', zIndex:20 }}>
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:40, fontWeight:800, letterSpacing:'-.03em', background:'linear-gradient(to bottom,#fff,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{s.value}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:6, fontFamily:'DM Sans,sans-serif' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth:1100, margin:'0 auto', padding:'100px 32px', position:'relative', zIndex:20 }}>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ color:'#8b5cf6', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12, fontFamily:'DM Sans,sans-serif' }}>Platform Features</motion.p>
        <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,3.5vw,40px)', fontWeight:800, color:'#fff', marginBottom:12, letterSpacing:'-.02em' }}>Every tool a serious creator needs.</motion.h2>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ fontSize:15, color:'rgba(255,255,255,0.4)', maxWidth:500, marginBottom:48, lineHeight:1.7, fontFamily:'DM Sans,sans-serif' }}>Built specifically for YouTube and Instagram creators who want to grow faster without guessing.</motion.p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.num} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.08 }} className="sr-feature-item">
              <div style={{ width:40, height:40, borderRadius:12, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, fontSize:11, fontWeight:700, color:'#a78bfa', transition:'transform .3s' }}>{f.num}</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, color:'#fff', marginBottom:10 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7, marginBottom:16, fontFamily:'DM Sans,sans-serif' }}>{f.desc}</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {f.tags.map(tag => <span key={tag} className="sr-feature-tag">{tag}</span>)}
              </div>
            </motion.div>
          ))}
          <div style={{ border:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.01)', borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center', minHeight:200, padding:24, textAlign:'center' }}>
            <div>
              <p style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'rgba(255,255,255,0.25)', marginBottom:8 }}>More coming</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', fontFamily:'DM Sans,sans-serif' }}>Platform is actively growing</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ maxWidth:1100, margin:'0 auto', padding:'80px 32px', position:'relative', zIndex:20 }}>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ color:'#8b5cf6', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12, fontFamily:'DM Sans,sans-serif' }}>How It Works</motion.p>
        <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,3.5vw,40px)', fontWeight:800, color:'#fff', marginBottom:12, letterSpacing:'-.02em' }}>From zero to algorithm-ready in one session.</motion.h2>
        <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ fontSize:15, color:'rgba(255,255,255,0.4)', maxWidth:500, marginBottom:48, lineHeight:1.7, fontFamily:'DM Sans,sans-serif' }}>No complex setup. No learning curve. Connect your channels and SocialRum immediately starts surfacing what to create, how to optimize it, and how to rank it.</motion.p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {STEPS.map((s, i) => (
            <motion.div key={s.num} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }} className="sr-step-card">
              <div className="sr-step-num">{s.num}</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'#fff', marginBottom:8 }}>{s.title}</h3>
              <p style={{ fontSize:12, fontWeight:600, color:'#8b5cf6', marginBottom:12, fontFamily:'DM Sans,sans-serif' }}>{s.sub}</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7, fontFamily:'DM Sans,sans-serif' }}>{s.desc}</p>
              <p style={{ marginTop:16, fontSize:11, color:'rgba(139,92,246,0.5)', fontStyle:'italic', fontFamily:'DM Sans,sans-serif' }}>{s.note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section id="early-access" style={{ maxWidth:1100, margin:'0 auto', padding:'80px 32px 120px', position:'relative', zIndex:20 }}>
        <div style={{ border:'1px solid rgba(139,92,246,0.1)', background:'rgba(139,92,246,0.02)', borderRadius:32, padding:'64px 56px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, background:'rgba(139,92,246,0.05)', filter:'blur(40px)', borderRadius:'50%', pointerEvents:'none' }} />

          {/* Left */}
          <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}>
            <p style={{ color:'#8b5cf6', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:16, fontFamily:'DM Sans,sans-serif' }}>Limited Spots Remaining</p>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,3.5vw,40px)', fontWeight:800, color:'#fff', marginBottom:16, lineHeight:1.2 }}>Be the First to<br/>Know &amp; Create.</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', lineHeight:1.7, marginBottom:32, fontFamily:'DM Sans,sans-serif' }}>Get early access and founding creator status when SocialRum launches.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {['Beta Access — Use all 5 tools before public launch','Founding Creator Badge — Exclusive profile recognition','Free Early Access Tier — No credit card required','Priority support from the SocialRum team'].map(b => (
                <div key={b} style={{ display:'flex', alignItems:'center', gap:12, fontSize:14, color:'rgba(255,255,255,0.55)', fontFamily:'DM Sans,sans-serif' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg viewBox="0 0 12 12" style={{ width:10, height:10 }} fill="none" strokeWidth={2.5} stroke="#a78bfa" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
            style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:24, padding:36, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:160, height:160, background:'rgba(139,92,246,0.1)', filter:'blur(30px)', borderRadius:'50%', pointerEvents:'none' }} />

            {step === 'done' && (
              <div className="sr-fade-in" style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ width:64, height:64, background:'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <svg viewBox="0 0 24 24" style={{ width:32, height:32, fill:'none', stroke:'white', strokeWidth:2.5 }}><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>You're In! 🎉</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:20, fontFamily:'DM Sans,sans-serif' }}>Welcome to SocialRum early access.<br/>We'll notify you the moment we launch.</p>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:50, padding:'10px 20px', fontSize:13, color:'#a78bfa', fontWeight:500 }}>✅ Verified — {userEmail}</div>
              </div>
            )}

            {step === 'otp' && (
              <div className="sr-fade-in">
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>Check your email</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', marginBottom:6, fontFamily:'DM Sans,sans-serif' }}>We sent a 6-digit code to</p>
                <p style={{ fontSize:15, color:'#a78bfa', fontWeight:600, marginBottom:24 }}>{userEmail}</p>
                <input ref={otpRef} type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit code" className="sr-input" style={{ letterSpacing:'0.35em', textAlign:'center', fontSize:22, marginBottom:12 }} onKeyDown={e => { if (e.key==='Enter') handleVerifyOTP(); }} />
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleVerifyOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Verifying...' : 'Verify & Get Access →'}</button>
                <button onClick={() => { setStep('email'); setErrorMsg(''); }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:12, cursor:'pointer', display:'block', width:'100%', textAlign:'center', padding:4, fontFamily:'DM Sans,sans-serif' }}>← Use a different email</button>
              </div>
            )}

            {step === 'email' && (
              <div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>Free Early Access</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', marginBottom:24, fontFamily:'DM Sans,sans-serif' }}>Enter your email — we'll send you a verification code.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                  <input id="sr-name-input" type="text" placeholder="Your name (optional)" className="sr-input" />
                  <input ref={emailRef} type="email" placeholder="you@example.com" className="sr-input" onKeyDown={e => { if (e.key==='Enter') handleSendOTP(); }} />
                </div>
                {errorMsg && <p style={{ fontSize:13, color:'#ef4444', textAlign:'center', marginBottom:10 }}>{errorMsg}</p>}
                <button onClick={handleSendOTP} disabled={loading} className="sr-ea-btn">{loading ? 'Sending code...' : 'Get Early Access →'}</button>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', textAlign:'center', fontFamily:'DM Sans,sans-serif' }}>No spam. No credit card. Unsubscribe anytime.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(139,92,246,0.1)', padding:'36px 64px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, position:'relative', zIndex:20, background:'rgba(3,0,10,1)' }}>
        <a href="/home" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:8, height:8, borderRadius:2, background:'#a855f7' }} />
          </div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#fff' }}>SocialRum</span>
        </a>
        <div style={{ display:'flex', gap:28 }}>
          {[['Features','#features'],['How It Works','#how-it-works'],['Early Access','#early-access'],['Contact','mailto:hello@socialrum.com']].map(([label,href]) => (
            <a key={label} href={href} style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none', fontSize:13, fontFamily:'DM Sans,sans-serif', transition:'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color='#fff')} onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.3)')}>{label}</a>
          ))}
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', fontFamily:'DM Sans,sans-serif' }}>© 2026 SocialRum · Built for Indian Creators 🇮🇳</p>
      </footer>
    </div>
  );
}