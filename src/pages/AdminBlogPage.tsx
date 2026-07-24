import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Eye, EyeOff, LogOut, Loader2, CheckCircle,
  Upload, X, Edit3, Bold, Italic, List, Heading, Save,
  Calendar, Clock, ExternalLink
} from 'lucide-react';
import SEO from '@/components/SEO';
import { RATIO_PRESETS, cropToRatio, type RatioPreset } from '@/lib/imageCrop';

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
  scheduled_at?: string;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; }
  .admin-input { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(139,92,246,0.2); border-radius:10px; padding:11px 14px; color:#fff; font-size:14px; outline:none; font-family:'DM Sans',sans-serif; transition:border-color .2s; }
  .admin-input:focus { border-color:#7c3aed; }
  .admin-input::placeholder { color:rgba(255,255,255,0.25); }
  .editor-btn { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:6px 10px; color:rgba(255,255,255,0.7); cursor:pointer; font-size:12px; font-family:'DM Sans',sans-serif; transition:all .2s; display:flex; align-items:center; gap:4px; }
  .editor-btn:hover { background:rgba(139,92,246,0.2); border-color:rgba(139,92,246,0.4); color:#fff; }
  .editor-textarea { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(139,92,246,0.2); border-radius:0 0 10px 10px; padding:14px; color:#fff; font-size:14px; outline:none; resize:vertical; line-height:1.8; font-family:'DM Sans',sans-serif; min-height:280px; }
  .editor-textarea:focus { border-color:#7c3aed; }
`;

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
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('SocialRum Team');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<RatioPreset>(RATIO_PRESETS[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [publishMode, setPublishMode] = useState<'now' | 'draft' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [preview, setPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const applyCrop = async (file: File, ratio: RatioPreset) => {
    try {
      const blob = await cropToRatio(file, ratio.width, ratio.height);
      setCroppedBlob(blob);
      setImagePreview(URL.createObjectURL(blob));
      setUploadError(null);
    } catch {
      setUploadError('Could not process that image. Try a different file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    applyCrop(file, selectedRatio);
  };

  const handleRatioChange = (ratio: RatioPreset) => {
    setSelectedRatio(ratio);
    if (imageFile) applyCrop(imageFile, ratio);
  };

  const uploadImage = async (blob: Blob): Promise<{ url: string | null; error?: string }> => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/blog-images/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
        body: blob,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        return { url: null, error: body?.message || `Image upload failed (${res.status}).` };
      }
      return { url: `${SUPABASE_URL}/storage/v1/object/public/blog-images/${fileName}` };
    } catch {
      return { url: null, error: 'Network error while uploading image.' };
    } finally { setUploading(false); }
  };

  // Rich text helpers
  const insertFormat = (prefix: string, suffix: string = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = description.substring(start, end);
    const newText = description.substring(0, start) + prefix + selected + suffix + description.substring(end);
    setDescription(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, end + prefix.length); }, 0);
  };

  const openNewForm = () => {
    setEditingBlog(null);
    setTitle(''); setDescription(''); setAuthor('SocialRum Team');
    setImageFile(null); setImagePreview(null); setCroppedBlob(null);
    setSelectedRatio(RATIO_PRESETS[0]); setUploadError(null);
    setPublishMode('now'); setScheduledDate(''); setScheduledTime('');
    setPreview(false);
    setShowForm(true);
  };

  const openEditForm = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title); setDescription(blog.description);
    setAuthor(blog.author); setImagePreview(blog.image_url || null);
    setImageFile(null); setCroppedBlob(null);
    setSelectedRatio(RATIO_PRESETS[0]); setUploadError(null);
    setPublishMode(blog.published ? 'now' : 'draft');
    setPreview(false);
    setShowForm(true);
  };

  const handlePost = async () => {
    if (!title.trim() || !description.trim()) return;
    setUploadError(null);
    setSaving(true);

    let image_url: string | null = editingBlog?.image_url || null;
    if (imageFile) {
      if (!croppedBlob) {
        setSaving(false);
        setUploadError('Image is still processing — try again in a moment.');
        return;
      }
      const result = await uploadImage(croppedBlob);
      if (!result.url) {
        setSaving(false);
        setUploadError(result.error || 'Image upload failed.');
        return;
      }
      image_url = result.url;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const isPublished = publishMode === 'now';
    const scheduled_at = publishMode === 'schedule' && scheduledDate && scheduledTime
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() : null;

    const payload = { title, description, image_url, author, published: isPublished, slug, scheduled_at };

    let res;
    if (editingBlog) {
      res = await fetch(`${SUPABASE_URL}/rest/v1/blogs?id=eq.${editingBlog.id}`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`${SUPABASE_URL}/rest/v1/blogs`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    if (res.ok) {
      setSaved(true); setTimeout(() => setSaved(false), 3000);
      setShowForm(false); setEditingBlog(null); fetchBlogs();
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

  const labelStyle: React.CSSProperties = { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'DM Sans', sans-serif" };

  const previewBoxStyle = (ratio: RatioPreset): React.CSSProperties => ({
    width: `min(100%, ${(320 * ratio.width) / ratio.height}px)`,
    aspectRatio: `${ratio.width} / ${ratio.height}`,
    margin: '0 auto',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    background: 'rgba(0,0,0,0.3)',
  });

  // ── Login ──
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#03000a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{css}</style>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400, margin: '0 20px', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 24, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#a855f7', boxShadow: '0 0 10px #a855f7' }} />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Admin Login</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>SocialRum Blog Admin</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin email" className="admin-input" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()} className="admin-input" />
          {loginError && <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>{loginError}</p>}
          <button onClick={handleLogin}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
            Login
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ── Admin Dashboard ──
  return (
    <div style={{ minHeight: '100vh', background: '#03000a', color: '#fff' }}>
      <SEO title="Admin — SocialRum" noindex />
      <style>{css}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(3,0,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(139,92,246,0.1)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>Blog Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/blog" target="_blank" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
            <ExternalLink size={13} /> View Blog
          </a>
          <button onClick={() => setAuthed(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Blog Posts</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>{blogs.length} posts total · {blogs.filter(b => b.published).length} published</p>
          </div>
          <button onClick={openNewForm}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 12, padding: '11px 20px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* Success toast */}
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#4ade80', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
              <CheckCircle size={16} /> {editingBlog ? 'Post updated successfully!' : 'Post published successfully!'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error toast */}
        <AnimatePresence>
          {uploadError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
              <X size={16} /> {uploadError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Post Form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 20, padding: 28, marginBottom: 28 }}>

              {/* Form header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700 }}>
                  {editingBlog ? 'Edit Post' : 'New Blog Post'}
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setPreview(!preview)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: preview ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${preview ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '7px 14px', color: preview ? '#a78bfa' : 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    <Eye size={14} /> {preview ? 'Edit' : 'Preview'}
                  </button>
                  <button onClick={() => setShowForm(false)}
                    style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {preview ? (
                // Preview mode
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 16, overflow: 'hidden' }}>
                  {imagePreview && (
                    <div style={{ ...previewBoxStyle(selectedRatio), margin: 0, borderRadius: 0 }}>
                      <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: 24 }}>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{title || 'Untitled Post'}</h1>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>By {author} · Just now</p>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: "'DM Sans', sans-serif" }}>{description || 'No content yet...'}</p>
                  </div>
                </div>
              ) : (
                // Edit mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Title */}
                  <div>
                    <label style={labelStyle}>Title *</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter blog title..." className="admin-input" />
                  </div>

                  {/* Image upload */}
                  <div>
                    <label style={labelStyle}>Cover Image</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      {RATIO_PRESETS.map(ratio => (
                        <button key={ratio.label} onClick={() => handleRatioChange(ratio)}
                          style={{ flex: 1, padding: '8px 6px', borderRadius: 8, border: `1px solid ${selectedRatio.label === ratio.label ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`, background: selectedRatio.label === ratio.label ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)', color: selectedRatio.label === ratio.label ? '#a78bfa' : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    {imagePreview ? (
                      <div style={{ position: 'relative', ...previewBoxStyle(selectedRatio) }}>
                        <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => { setImageFile(null); setImagePreview(null); setCroppedBlob(null); setUploadError(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={16} />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()}
                          style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Upload size={12} /> Change
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()}
                        style={{ width: '100%', height: 110, background: 'rgba(139,92,246,0.04)', border: '2px dashed rgba(139,92,246,0.25)', borderRadius: 12, color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'DM Sans', sans-serif" }}>
                        <Upload size={22} style={{ color: '#a78bfa' }} />
                        <span>Click to upload cover image</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>PNG, JPG, WEBP supported</span>
                      </button>
                    )}
                  </div>

                  {/* Rich text editor */}
                  <div>
                    <label style={labelStyle}>Content *</label>
                    {/* Toolbar */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.2)', borderBottom: 'none', borderRadius: '10px 10px 0 0', padding: '8px 10px' }}>
                      <button className="editor-btn" onClick={() => insertFormat('**', '**')}><Bold size={12} /> Bold</button>
                      <button className="editor-btn" onClick={() => insertFormat('_', '_')}><Italic size={12} /> Italic</button>
                      <button className="editor-btn" onClick={() => insertFormat('\n## ')}><Heading size={12} /> H2</button>
                      <button className="editor-btn" onClick={() => insertFormat('\n### ')}><Heading size={11} /> H3</button>
                      <button className="editor-btn" onClick={() => insertFormat('\n- ')}><List size={12} /> List</button>
                      <button className="editor-btn" onClick={() => insertFormat('\n\n---\n\n')}>— Divider</button>
                      <button className="editor-btn" onClick={() => insertFormat('\n> ')}>❝ Quote</button>
                    </div>
                    <textarea ref={textareaRef} value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Write your blog post content here...&#10;&#10;Use **bold**, _italic_, ## Heading, - list items" className="editor-textarea" />
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
                      {description.length} characters · Supports markdown formatting
                    </p>
                  </div>

                  {/* Author */}
                  <div>
                    <label style={labelStyle}>Author</label>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="admin-input" />
                  </div>

                  {/* Publish mode */}
                  <div>
                    <label style={labelStyle}>Publish</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { value: 'now', label: '🚀 Publish Now', icon: null },
                        { value: 'draft', label: '📝 Save Draft', icon: null },
                        { value: 'schedule', label: '⏰ Schedule', icon: null },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => setPublishMode(opt.value as any)}
                          style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1px solid ${publishMode === opt.value ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`, background: publishMode === opt.value ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)', color: publishMode === opt.value ? '#a78bfa' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Schedule datetime */}
                    {publishMode === 'schedule' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                        <div>
                          <label style={{ ...labelStyle, marginBottom: 4 }}>Date</label>
                          <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                            className="admin-input" style={{ colorScheme: 'dark' }} />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, marginBottom: 4 }}>Time</label>
                          <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                            className="admin-input" style={{ colorScheme: 'dark' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowForm(false)}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      Cancel
                    </button>
                    <button onClick={handlePost} disabled={saving || uploading || !title.trim() || !description.trim()}
                      style={{ flex: 2, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (saving || uploading) ? 0.7 : 1, fontFamily: 'Syne, sans-serif' }}>
                      {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                        : saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                        : editingBlog ? <><Save size={16} /> Update Post</>
                        : publishMode === 'draft' ? <><Save size={16} /> Save Draft</>
                        : publishMode === 'schedule' ? <><Calendar size={16} /> Schedule Post</>
                        : <><Plus size={16} /> Publish Post</>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blog list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>Loading posts...</div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>No posts yet. Create your first post!</div>
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
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
                    {new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {blog.author}
                    {blog.scheduled_at && <span style={{ color: '#a78bfa' }}> · ⏰ Scheduled</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, fontWeight: 600, background: blog.published ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', color: blog.published ? '#4ade80' : 'rgba(255,255,255,0.3)', border: `1px solid ${blog.published ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`, fontFamily: "'DM Sans', sans-serif" }}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                  <button onClick={() => openEditForm(blog)}
                    style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit3 size={14} />
                  </button>
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