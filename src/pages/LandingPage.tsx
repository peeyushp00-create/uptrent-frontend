import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const GRID_LINES = [
  { axis: 'h', pos: '28%', dur: '9s', dir: 'right', delay: '0s' },
  { axis: 'h', pos: '55%', dur: '12s', dir: 'left', delay: '2s' },
  { axis: 'h', pos: '78%', dur: '8s', dir: 'right', delay: '5s' },
  { axis: 'v', pos: '22%', dur: '10s', dir: 'down', delay: '1s' },
  { axis: 'v', pos: '50%', dur: '14s', dir: 'up', delay: '3s' },
  { axis: 'v', pos: '75%', dur: '11s', dir: 'down', delay: '6s' },
];

const FEATURES = [
  { emoji: '🔥', title: 'Trending Topics', desc: 'Discover what India is watching — real-time trending data across 20+ niches before anyone else.' },
  { emoji: '✍️', title: 'AI Script Generator', desc: 'Generate ready-to-film Reel and YouTube scripts with hooks, body, and CTA in under 10 seconds.' },
  { emoji: '📰', title: 'Creator News Feed', desc: 'Curated niche news delivered daily so you never run out of timely content ideas.' },
  { emoji: '🎯', title: 'YouTube SEO', desc: 'Rank higher on YouTube with AI-generated titles, descriptions, and tags built for the algorithm.' },
  { emoji: '📊', title: 'Channel Analyzer', desc: 'Deep-dive into any Instagram or YouTube channel — content pillars, ideas, and growth gaps.' },
  { emoji: '⚡', title: 'Viral Hook Engine', desc: 'Stop the scroll with AI hooks engineered from millions of viral Indian creator posts.' },
];

const HOW_IT_WORKS = [
  { num: '01', title: 'Pick Your Niche', desc: 'Tell SocialRum your content niche — finance, fitness, comedy, tech or any of 20+ categories.' },
  { num: '02', title: 'Discover Trends', desc: 'See what\'s trending right now in your niche across Instagram Reels and YouTube Shorts.' },
  { num: '03', title: 'Generate Content', desc: 'One click to get a full script, viral hook, SEO tags or content ideas — ready to film.' },
  { num: '04', title: 'Grow Faster', desc: 'Post with confidence knowing your content is built on real data and AI-powered strategy.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;
    if (!hero || !content) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      content.style.transform = `translate(${mx * 12}px, ${my * 8}px)`;
    };
    hero.addEventListener('mousemove', handleMouseMove);
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ background: '#0D0B14', color: '#fff', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .gradient-text { background: linear-gradient(135deg, #7C3AED, #A855F7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glass-card { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); }
        .blob-purple { background: radial-gradient(circle, #7C3AED44, transparent 70%); border-radius: 50%; }
        .glow-primary { box-shadow: 0 0 30px rgba(124,58,237,0.3); }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%,100% { transform: scale(2); opacity: 0; } }
        @keyframes line-traverse-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
        @keyframes line-traverse-left { 0% { transform: translateX(400%); } 100% { transform: translateX(-100%); } }
        @keyframes line-traverse-down { 0% { transform: translateY(-100%); } 100% { transform: translateY(400%); } }
        @keyframes line-traverse-up { 0% { transform: translateY(400%); } 100% { transform: translateY(-100%); } }
        .line-traverse-right { animation: line-traverse-right linear infinite; }
        .line-traverse-left { animation: line-traverse-left linear infinite; }
        .line-traverse-down { animation: line-traverse-down linear infinite; }
        .line-traverse-up { animation: line-traverse-up linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-ping { animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite; }
        .feature-card { transition: all 0.25s ease; }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(124,58,237,0.3) !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(13,11,20,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="SocialRum" style={{ width: 36, height: 36, borderRadius: 10 }} />
            <span style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}>SocialRum</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/login')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', padding: '8px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
              Login
            </button>
            <button onClick={() => navigate('/signup')}
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#fff', padding: '8px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, border: 'none' }}
              className="glow-primary">
              Get Early Access
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', paddingTop: 80, background: 'linear-gradient(160deg, #0D0B14 0%, #110C1E 50%, #0D0B14 100%)' }}>

        {/* Blobs */}
        <div className="blob-purple animate-float" style={{ position: 'absolute', top: '25%', left: '25%', width: 384, height: 384, opacity: 0.6, zIndex: 2 }} />
        <div className="blob-purple animate-float" style={{ position: 'absolute', bottom: '25%', right: '25%', width: 320, height: 320, opacity: 0.4, zIndex: 2, animationDelay: '1.5s' }} />

        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(to right, rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,58,237,0.5) 1px, transparent 1px)', backgroundSize: '25% 25%' }} />
          {GRID_LINES.map((line, i) => (
            <div key={i} style={{ position: 'absolute', ...(line.axis === 'h' ? { top: line.pos, left: 0, right: 0, height: 2 } : { left: line.pos, top: 0, bottom: 0, width: 2 }) }}>
              <div className={`line-traverse-${line.dir}`} style={{
                position: 'absolute',
                ...(line.axis === 'h' ? { width: '33%', height: '100%' } : { height: '33%', width: '100%' }),
                animationDuration: line.dur,
                animationDelay: line.delay,
                background: line.axis === 'h'
                  ? 'linear-gradient(to right, transparent, rgba(168,85,247,0.8), rgba(124,58,237,0.9), rgba(168,85,247,0.8), transparent)'
                  : 'linear-gradient(to bottom, transparent, rgba(168,85,247,0.8), rgba(124,58,237,0.9), rgba(168,85,247,0.8), transparent)',
              }} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '64px 24px 80px', textAlign: 'center' }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 999, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A855F7', marginBottom: 32 }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
              <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#A855F7', opacity: 0.75 }} />
              <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#A855F7', display: 'inline-block' }} />
            </span>
            Built for Indian Creators
          </div>

          {/* Headline */}
          <div ref={contentRef} style={{ transition: 'transform 0.15s ease-out', willChange: 'transform', marginBottom: 24 }}>
            <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', margin: 0 }}>
              <span style={{ display: 'block', color: '#fff' }}>Create Content</span>
              <span className="gradient-text" style={{ display: 'block' }}>That Actually</span>
              <span style={{ display: 'block', color: '#fff' }}>Gets Discovered</span>
            </h1>
          </div>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7 }}>
            SocialRum brings YouTube and Instagram creators a unified AI workspace — trending topics, script generation, content analysis, and SEO in one premium dashboard.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <button onClick={() => navigate('/signup')}
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#fff', padding: '16px 32px', borderRadius: 999, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
              className="glow-primary">
              Get Early Access
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7 7 7-7 7" /></svg>
            </button>
            <button onClick={() => navigate('/login')}
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', padding: '16px 32px', borderRadius: 999, fontSize: 15, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              Login
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[{ value: '5', label: 'Creator Tools' }, { value: 'AI', label: 'Powered Scripts' }, { value: 'Free', label: 'Early Access' }].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 128, background: 'linear-gradient(to top, #0D0B14, transparent)', zIndex: 10, pointerEvents: 'none' }} />
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '96px 24px', background: '#0D0B14' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, color: '#A855F7', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1 }}>
              Everything You Need<br /><span className="gradient-text">to Go Viral</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card glass-card" style={{ borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>
                  {f.emoji}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '96px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, color: '#A855F7', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Process</p>
            <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, color: '#fff', margin: 0 }}>
              From Zero to <span className="gradient-text">Viral</span><br />in 4 Steps
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i}>
                <p className="gradient-text" style={{ fontSize: 40, fontWeight: 700, margin: '0 0 16px' }}>{s.num}</p>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 24px', background: '#0D0B14', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="blob-purple" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, opacity: 0.15, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(40px,7vw,80px)', fontWeight: 700, color: '#fff', lineHeight: 1.05, margin: '0 0 20px' }}>
            Ready to<br /><span className="gradient-text">Get Started?</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', margin: '0 0 40px', lineHeight: 1.7 }}>
            Join SocialRum and start creating content that actually gets discovered on Instagram and YouTube.
          </p>
          <button onClick={() => navigate('/signup')}
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#fff', padding: '16px 48px', borderRadius: 999, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}
            className="glow-primary">
            Get Early Access
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7 7 7-7 7" /></svg>
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 16 }}>No credit card required</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="SocialRum" style={{ width: 28, height: 28, borderRadius: 8 }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>SocialRum</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>© 2026 SocialRum. Built for Indian Creators 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}