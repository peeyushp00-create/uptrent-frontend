import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, ArrowUpRight } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Blog {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  author: string;
  created_at: string;
  slug?: string;
}

const getTimeAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function BlogPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Blog | null>(null);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/blogs?published=eq.true&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    })
      .then(r => r.json())
      .then(data => { setBlogs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#03000a] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.08), transparent 60%)' }} />

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 68, background: 'rgba(3,0,10,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
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

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 56, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)', color: '#c4b5fd', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 50, fontWeight: 600, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }} />
            Creator Insights
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-.02em', lineHeight: 1.1 }}>
            The SocialRum Blog
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Tips, strategies, and insights for Indian YouTube & Instagram creators.
          </p>
        </motion.div>

        {/* Blog detail view */}
        {selected ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => setSelected(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 32, padding: 0 }}>
              <ArrowLeft size={16} /> Back to Blog
            </button>
            {selected.image_url && (
              <div style={{ width: '100%', height: 360, borderRadius: 24, overflow: 'hidden', marginBottom: 32 }}>
                <img src={selected.image_url} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                <User size={13} /> {selected.author}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                <Clock size={13} /> {getTimeAgo(selected.created_at)}
              </div>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: '#fff', marginBottom: 24, lineHeight: 1.2 }}>{selected.title}</h1>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{selected.description}</div>
          </motion.div>
        ) : (
          <>
            {/* Loading */}
            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 20, height: 320, animation: 'pulse 2s infinite' }} />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && blogs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No posts yet</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Check back soon for creator insights</p>
              </div>
            )}

            {/* Blog grid */}
            {!loading && blogs.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
                {blogs.map((blog, i) => (
                  <motion.div key={blog.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelected(blog)}
                    style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'all .3s' }}
                    whileHover={{ y: -4, borderColor: 'rgba(139,92,246,0.35)', boxShadow: '0 20px 50px rgba(139,92,246,0.12)' }}>
                    {/* Image */}
                    <div style={{ width: '100%', height: 180, background: 'rgba(139,92,246,0.08)', overflow: 'hidden' }}>
                      {blog.image_url ? (
                        <img src={blog.image_url} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📝</div>
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {getTimeAgo(blog.created_at)}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={11} /> {blog.author}
                        </span>
                      </div>
                      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>{blog.title}</h2>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {blog.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>
                        Read More <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(139,92,246,0.1)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 10, background: '#03000a' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff' }}>SocialRum</span>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 SocialRum · Built for Indian Creators 🇮🇳</p>
      </footer>
    </div>
  );
}