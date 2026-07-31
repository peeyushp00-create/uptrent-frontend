import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, User, ArrowUpRight, Search, Link2, Check, ArrowUp, BookOpen, Heart, MessageCircle, Send, Mail } from 'lucide-react';
import SEO from '@/components/SEO';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Blog {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  author: string;
  created_at: string;
  likes?: number;
}

interface Comment {
  id: string;
  blog_id: string;
  name: string;
  comment: string;
  created_at: string;
}

const getTimeAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getReadTime = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export default function BlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const articleRef = useRef<HTMLDivElement>(null);

  const selected = id ? blogs.find(b => b.id === id) ?? null : null;

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/blogs?published=eq.true&order=created_at.desc`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    })
      .then(r => r.json())
      .then(data => { setBlogs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // reading progress + back-to-top, scoped to whichever view is active
  useEffect(() => {
    setProgress(0);
    window.scrollTo({ top: 0 });
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0);
      setShowTop(scrollTop > 600);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [id]);

  // Esc to leave the detail view
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/blog'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, navigate]);

  // Likes + comments, scoped to the open post
  useEffect(() => {
    if (!selected) { setComments([]); return; }

    setLikeCount(selected.likes || 0);
    setHasLiked(localStorage.getItem(`liked:${selected.id}`) === '1');
    setCommentName('');
    setCommentText('');

    setCommentsLoading(true);
    fetch(`${SUPABASE_URL}/rest/v1/blog_comments?blog_id=eq.${selected.id}&order=created_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    })
      .then(r => r.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [selected]);

  const handleLike = async () => {
    if (!selected || hasLiked) return;
    setHasLiked(true);
    setLikeCount(c => c + 1);
    localStorage.setItem(`liked:${selected.id}`, '1');
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_blog_likes`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: selected.id }),
      });
    } catch {
      /* like still reflected locally even if the request fails */
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !commentName.trim() || !commentText.trim() || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json', Prefer: 'return=representation',
        },
        body: JSON.stringify({ blog_id: selected.id, name: commentName.trim().slice(0, 60), comment: commentText.trim().slice(0, 2000) }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        setComments(prev => [data[0], ...prev]);
        setCommentName('');
        setCommentText('');
      }
    } catch {
      /* silently ignore — the form stays filled so the user can retry */
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || newsletterState === 'loading') return;
    setNewsletterState('loading');
    try {
      const res = await fetch(`${API_URL}/api/blog/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setNewsletterState('done');
      setNewsletterMsg(data.message || "You're subscribed!");
    } catch (err) {
      setNewsletterState('error');
      setNewsletterMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(b => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  }, [blogs, query]);

  const [featured, ...rest] = filtered;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="relative min-h-screen bg-[#03000a] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SEO
        title={selected ? `${selected.title} — SocialRum Blog` : 'Blog — SocialRum'}
        description={selected ? selected.description.slice(0, 155) : 'Tips, product updates, and creator-economy insights from SocialRum — the AI content platform for Indian YouTube and Instagram creators.'}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .blog-card { position: relative; }
        .blog-card::before {
          content: '';
          position: absolute; inset: 0; border-radius: inherit; opacity: 0;
          background: radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(168,85,247,0.16), transparent 60%);
          transition: opacity .25s ease; pointer-events: none;
        }
        .blog-card:hover::before { opacity: 1; }
        .blog-search::placeholder { color: rgba(255,255,255,0.3); }
        .blog-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .featured-card { grid-template-columns: 1fr; }
        @media (min-width: 860px) {
          .featured-card { grid-template-columns: 1.1fr 1fr !important; align-items: stretch; }
          .featured-card .featured-media { height: 100% !important; }
        }
        @media (max-width: 720px) {
          .blog-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Reading progress bar (detail view only) */}
      {selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 60, background: 'rgba(139,92,246,0.08)' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(90deg,#7c3aed,#a855f7)', transition: 'width .1s linear' }} />
        </div>
      )}

      {/* Bg glow */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.08), transparent 60%)' }} />

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 68, background: 'rgba(3,0,10,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 9, height: 9, borderRadius: 3, background: '#a855f7', boxShadow: '0 0 10px #a855f7' }} />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>SocialRum</span>
        </a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>Home</a>
          <a href="/#features" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>Features</a>
          <a href="/#early-access" style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Early Access</a>
        </div>
      </nav>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '100px 40px 80px', position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {selected ? (
            /* Blog detail */
            <motion.div key="detail" ref={articleRef}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
              style={{ maxWidth: 820, margin: '0 auto' }}>
              <button onClick={() => navigate('/blog')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 32, padding: 0 }}>
                <ArrowLeft size={16} /> Back to Blog
              </button>
              {selected.image_url && (
                <div style={{ width: '100%', height: 360, borderRadius: 24, overflow: 'hidden', marginBottom: 32 }}>
                  <img src={selected.image_url} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}><User size={13} /> {selected.author}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}><Clock size={13} /> {getTimeAgo(selected.created_at)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}><BookOpen size={13} /> {getReadTime(selected.description)} min read</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                  <button onClick={handleLike} disabled={hasLiked}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: hasLiked ? '#fb7185' : 'rgba(255,255,255,0.6)', background: hasLiked ? 'rgba(251,113,133,0.1)' : 'rgba(139,92,246,0.08)', border: `1px solid ${hasLiked ? 'rgba(251,113,133,0.3)' : 'rgba(139,92,246,0.25)'}`, borderRadius: 50, padding: '6px 14px', cursor: hasLiked ? 'default' : 'pointer', transition: 'all .2s ease' }}>
                    <Heart size={13} fill={hasLiked ? '#fb7185' : 'none'} /> {likeCount}
                  </button>
                  <button onClick={handleShare}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: copied ? '#4ade80' : '#a78bfa', background: copied ? 'rgba(74,222,128,0.08)' : 'rgba(139,92,246,0.08)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(139,92,246,0.25)'}`, borderRadius: 50, padding: '6px 14px', cursor: 'pointer', transition: 'all .2s ease' }}>
                    {copied ? <Check size={13} /> : <Link2 size={13} />} {copied ? 'Copied' : 'Copy link'}
                  </button>
                </div>
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, color: '#fff', marginBottom: 24, lineHeight: 1.2 }}>{selected.title}</h1>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{selected.description}</div>

              {/* Newsletter CTA */}
              <div style={{ marginTop: 48, background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 20, padding: 28, textAlign: 'center' }}>
                <Mail size={22} style={{ color: '#a78bfa', marginBottom: 10 }} />
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Enjoyed this? Get more like it.</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 18 }}>Creator tips and product updates, straight to your inbox. No spam.</p>
                {newsletterState === 'done' ? (
                  <p style={{ fontSize: 14, color: '#4ade80', fontWeight: 600 }}>✓ {newsletterMsg}</p>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: 10, maxWidth: 380, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <input
                      type="email" required value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)}
                      placeholder="you@email.com"
                      style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 50, padding: '10px 16px', color: '#fff', fontSize: 13, outline: 'none' }}
                    />
                    <button type="submit" disabled={newsletterState === 'loading'}
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', borderRadius: 50, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: newsletterState === 'loading' ? 0.6 : 1 }}>
                      {newsletterState === 'loading' ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </form>
                )}
                {newsletterState === 'error' && <p style={{ fontSize: 12, color: '#f87171', marginTop: 10 }}>{newsletterMsg}</p>}
              </div>

              {/* Comments */}
              <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid rgba(139,92,246,0.1)' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageCircle size={18} /> Comments {comments.length > 0 && `(${comments.length})`}
                </h3>

                <form onSubmit={handleCommentSubmit} style={{ marginBottom: 28, background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 16, padding: 18 }}>
                  <input
                    value={commentName} onChange={e => setCommentName(e.target.value)}
                    placeholder="Your name" maxLength={60}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', marginBottom: 10 }}
                  />
                  <textarea
                    value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..." maxLength={2000} rows={3}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: 10 }}
                  />
                  <button type="submit" disabled={commentSubmitting || !commentName.trim() || !commentText.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', borderRadius: 50, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: commentSubmitting || !commentName.trim() || !commentText.trim() ? 0.5 : 1 }}>
                    <Send size={13} /> {commentSubmitting ? 'Posting...' : 'Post comment'}
                  </button>
                </form>

                {commentsLoading && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Loading comments...</p>}
                {!commentsLoading && comments.length === 0 && (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Be the first to comment.</p>
                )}
                {!commentsLoading && comments.map(c => (
                  <div key={c.id} style={{ padding: '16px 0', borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                        {c.name.trim().charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{getTimeAgo(c.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.comment}</p>
                  </div>
                ))}
              </div>

              {/* More posts */}
              {blogs.filter(b => b.id !== selected.id).length > 0 && (
                <div style={{ marginTop: 64, paddingTop: 40, borderTop: '1px solid rgba(139,92,246,0.1)' }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Keep reading</h3>
                  <div className="blog-grid" style={{ gap: 16 }}>
                    {blogs.filter(b => b.id !== selected.id).slice(0, 2).map(b => (
                      <div key={b.id} onClick={() => navigate(`/blog/${b.id}`)}
                        style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 14, padding: 16, cursor: 'pointer' }}>
                        <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{b.title}</h4>
                        <span style={{ fontSize: 12, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4 }}>Read <ArrowUpRight size={12} /></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {/* Header */}
              <div style={{ marginBottom: 40, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)', color: '#c4b5fd', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 50, fontWeight: 600, marginBottom: 20 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }} /> Creator Insights
                </div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-.02em', lineHeight: 1.1 }}>The SocialRum Blog</h1>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>Tips, strategies, and insights for Indian YouTube & Instagram creators.</p>

                {!loading && blogs.length > 0 && (
                  <div style={{ position: 'relative', maxWidth: 380, margin: '0 auto' }}>
                    <Search size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input
                      className="blog-search"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search articles..."
                      style={{ width: '100%', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 50, padding: '11px 16px 11px 42px', color: '#fff', fontSize: 14, outline: 'none' }}
                    />
                  </div>
                )}
              </div>

              {loading && (
                <div className="blog-grid">
                  {[1, 2, 3, 4].map(i => <div key={i} style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 20, height: 320 }} />)}
                </div>
              )}

              {!loading && blogs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
                  <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No posts yet</p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Check back soon for creator insights</p>
                </div>
              )}

              {!loading && blogs.length > 0 && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No matches for &ldquo;{query}&rdquo;</p>
                  <button onClick={() => setQuery('')} style={{ fontSize: 13, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer' }}>Clear search</button>
                </div>
              )}

              {!loading && filtered.length > 0 && (
                <>
                  {/* Featured post */}
                  {!query && featured && (
                    <motion.div
                      className="blog-card featured-card"
                      onMouseMove={e => {
                        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                        (e.currentTarget as HTMLDivElement).style.setProperty('--mx', `${e.clientX - r.left}px`);
                        (e.currentTarget as HTMLDivElement).style.setProperty('--my', `${e.clientY - r.top}px`);
                      }}
                      onClick={() => navigate(`/blog/${featured.id}`)}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, borderColor: 'rgba(139,92,246,0.4)' }}
                      style={{ display: 'grid', marginBottom: 40, background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 20px 60px rgba(139,92,246,0.08)' }}>
                      {featured.image_url && (
                        <div className="featured-media" style={{ width: '100%', height: 280, overflow: 'hidden' }}>
                          <img src={featured.image_url} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ display: 'inline-block', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, color: '#c4b5fd', background: 'rgba(139,92,246,0.1)', padding: '5px 12px', borderRadius: 50, marginBottom: 14 }}>Latest</span>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(18px,2.4vw,26px)', fontWeight: 800, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>{featured.title}</h2>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{featured.description}</p>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}><User size={12} /> {featured.author}</span>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {getTimeAgo(featured.created_at)}</span>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={12} /> {getReadTime(featured.description)} min read</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="blog-grid">
                    {(query ? filtered : rest).map((blog, i) => (
                      <motion.div key={blog.id}
                        className="blog-card"
                        onMouseMove={e => {
                          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                          (e.currentTarget as HTMLDivElement).style.setProperty('--mx', `${e.clientX - r.left}px`);
                          (e.currentTarget as HTMLDivElement).style.setProperty('--my', `${e.clientY - r.top}px`);
                        }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => navigate(`/blog/${blog.id}`)}
                        style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }}
                        whileHover={{ y: -4, borderColor: 'rgba(139,92,246,0.35)', boxShadow: '0 20px 50px rgba(139,92,246,0.12)' }}>
                        <div style={{ width: '100%', height: 180, background: 'rgba(139,92,246,0.08)', overflow: 'hidden' }}>
                          {blog.image_url
                            ? <img src={blog.image_url} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📝</div>}
                        </div>
                        <div style={{ padding: 20 }}>
                          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {getTimeAgo(blog.created_at)}</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} /> {blog.author}</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={11} /> {getReadTime(blog.description)} min</span>
                          </div>
                          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>{blog.title}</h2>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.description}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>Read More <ArrowUpRight size={14} /></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 50, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 30px rgba(124,58,237,0.4)' }}>
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <footer style={{ borderTop: '1px solid rgba(139,92,246,0.1)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 10, background: '#03000a' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff' }}>SocialRum</span>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 SocialRum · Built for Indian Creators 🇮🇳</p>
      </footer>
    </div>
  );
}
