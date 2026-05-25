import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, LogOut, Loader2, CheckCircle, Upload, X } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_EMAIL = 'socialrum.official@gmail.com';
const ADMIN_PASSWORD = 'socialrum04';

interface Blog {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  author: string;
  created_at: string;
  published: boolean;
}

export default function AdminBlogPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('SocialRum Team');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    if (email !== ADMIN_EMAIL) { setLoginError('Access denied. Admin only.'); return; }
    if (password !== ADMIN_PASSWORD) { setLoginError('Wrong password.'); return; }
    setAuthed(true);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/blogs?order=created_at.desc`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const data = await res.json();
    setBlogs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { if (authed) fetchBlogs(); }, [authed]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/blog-images/${fileName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: file,
      });
      if (!res.ok) { console.error('Upload failed', await res.text()); return null; }
      return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${fileName}`;
    } catch (e) { console.error(e); return null; }
    finally { setUploading(false); }
  };

  const handlePost = async () => {
    if (!title.trim() || !description.trim()) return;
    setSaving(true);

    let image_url: string | null = null;
    if (imageFile) {
      image_url = await uploadImage(imageFile);
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/blogs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ title, description, image_url, author, published: true, slug }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true); setTimeout(() => setSaved(false), 3000);
      setTitle(''); setDescription(''); setImageFile(null); setImagePreview(null);
      setShowForm(false); fetchBlogs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/blogs?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    fetchBlogs();
  };

  const togglePublish = async (blog: Blog) => {
    await fetch(`${SUPABASE_URL}/rest/v1/blogs?id=eq.${blog.id}`, {
      method: 'PATCH',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !blog.published }),
    });
    fetchBlogs();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block',
    textTransform: 'uppercase', letterSpacing: '0.08em'
  };

  // ── Login ──
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#03000a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400, margin: '0 20px', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 24, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#a855f7', boxShadow: '0 0 10px #a855f7' }} />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Admin Login</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>SocialRum Blog Admin</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin email" style={inputStyle} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inputStyle} />
          {loginError && <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>{loginError}</p>}
          <button onClick={handleLogin}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Login
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ── Admin Dashboard ──
  return (
    <div style={{ minHeight: '100vh', background: '#03000a', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(3,0,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(139,92,246,0.1)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>Blog Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/blog" target="_blank" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>View Blog →</a>
          <button onClick={() => setAuthed(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Blog Posts</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{blogs.length} posts total</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 12, padding: '11px 20px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* Success toast */}
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#4ade80', fontSize: 14 }}>
              <CheckCircle size={16} /> Post published successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* New post form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 20, padding: 28, marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Blog Post</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Title */}
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter blog title..." style={inputStyle} />
                </div>

                {/* Image upload */}
                <div>
                  <label style={labelStyle}>Cover Image</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

                  {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={imagePreview} alt="preview"
                        style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12 }} />
                      <button onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()}
                      style={{ width: '100%', height: 120, background: 'rgba(139,92,246,0.04)', border: '2px dashed rgba(139,92,246,0.25)', borderRadius: 12, color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s' }}>
                      <Upload size={24} style={{ color: '#a78bfa' }} />
                      <span>Click to upload image</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>PNG, JPG, WEBP supported</span>
                    </button>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label style={labelStyle}>Content *</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Write your blog post content here..." rows={10}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

                {/* Author */}
                <div>
                  <label style={labelStyle}>Author</label>
                  <input type="text" value={author} onChange={e => setAuthor(e.target.value)} style={inputStyle} />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setShowForm(false); setImageFile(null); setImagePreview(null); }}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handlePost} disabled={saving || uploading || !title.trim() || !description.trim()}
                    style={{ flex: 2, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (saving || uploading) ? 0.7 : 1 }}>
                    {uploading ? <><Loader2 size={16} /> Uploading image...</>
                      : saving ? <><Loader2 size={16} /> Publishing...</>
                      : 'Publish Post'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blog list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)' }}>Loading posts...</div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)' }}>No posts yet. Create your first post!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {blogs.map(blog => (
              <motion.div key={blog.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'rgba(139,92,246,0.03)', border: `1px solid ${blog.published ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                {blog.image_url && (
                  <div style={{ width: 72, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={blog.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {blog.author}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, fontWeight: 600, background: blog.published ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', color: blog.published ? '#4ade80' : 'rgba(255,255,255,0.3)', border: `1px solid ${blog.published ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                  <button onClick={() => togglePublish(blog)}
                    style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {blog.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => handleDelete(blog.id)}
                    style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}