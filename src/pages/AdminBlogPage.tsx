import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import {
  Plus, Trash2, Eye, EyeOff, LogOut, Loader2, CheckCircle,
  Upload, X, Edit3, Bold, Italic, List, Heading, Save,
  Calendar, ExternalLink, Link2, Image as ImageIcon, Smartphone, Monitor, Route, ChevronDown
} from 'lucide-react';
import SEO from '@/components/SEO';
import { RATIO_PRESETS, cropToRatio, optimizeImage, type RatioPreset, type EncodedImage } from '@/lib/imageCrop';
import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Client-side allowlist is defense-in-depth only, not the real security boundary.
// The actual boundary MUST be a Supabase RLS policy on `blogs` (and the
// `blog-images` storage bucket) that restricts INSERT/UPDATE/DELETE to this
// account's auth.uid() / email — without that RLS policy, any authenticated
// user's anon-key session could still write via direct REST calls.
const ADMIN_EMAILS = ['socialrum.official@gmail.com'];

const CATEGORIES = [
  { value: '', label: 'No category' },
  { value: 'social-media-management', label: 'Social Media Management' },
  { value: 'content-creation', label: 'Content Creation' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
];

const FONTS: { value: string; label: string; stack: string }[] = [
  { value: 'sans', label: 'Sans Serif (default)', stack: "'DM Sans', sans-serif" },
  { value: 'serif', label: 'Serif', stack: "'Lora', Georgia, serif" },
  { value: 'mono', label: 'Monospace', stack: "'JetBrains Mono', monospace" },
];
const fontStack = (value: string) => FONTS.find(f => f.value === value)?.stack || FONTS[0].stack;

interface Blog {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  author: string;
  created_at: string;
  published: boolean;
  scheduled_at?: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  cover_alt?: string;
  category?: string;
  font_family?: string;
  author_bio?: string;
  author_photo_url?: string;
  noindex?: boolean;
  primary_keyword?: string;
}

interface Redirect {
  id: string;
  old_slug: string;
  new_path: string;
  created_at: string;
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; }
  .admin-input { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(139,92,246,0.2); border-radius:10px; padding:11px 14px; color:#fff; font-size:14px; outline:none; font-family:'DM Sans',sans-serif; transition:border-color .2s; }
  .admin-input:focus { border-color:#7c3aed; }
  .admin-input::placeholder { color:rgba(255,255,255,0.25); }
  .admin-input option { color:#000; }
  .admin-textarea { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(139,92,246,0.2); border-radius:10px; padding:11px 14px; color:#fff; font-size:14px; outline:none; font-family:'DM Sans',sans-serif; resize:vertical; }
  .admin-textarea:focus { border-color:#7c3aed; }
  .editor-btn { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:6px 10px; color:rgba(255,255,255,0.7); cursor:pointer; font-size:12px; font-family:'DM Sans',sans-serif; transition:all .2s; display:flex; align-items:center; gap:4px; }
  .editor-btn:hover { background:rgba(139,92,246,0.2); border-color:rgba(139,92,246,0.4); color:#fff; }
  .editor-textarea { width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(139,92,246,0.2); border-radius:0 0 10px 10px; padding:14px; color:#fff; font-size:14px; outline:none; resize:vertical; line-height:1.8; font-family:'DM Sans',sans-serif; min-height:280px; }
  .editor-textarea:focus { border-color:#7c3aed; }
`;

export default function AdminBlogPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('SocialRum Team');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<EncodedImage | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<RatioPreset>(RATIO_PRESETS[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [publishMode, setPublishMode] = useState<'now' | 'draft' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [preview, setPreview] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);

  // New CMS fields
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [coverAlt, setCoverAlt] = useState('');
  const [category, setCategory] = useState('');
  const [font, setFont] = useState('sans');
  const [authorBio, setAuthorBio] = useState('');
  const [authorPhotoFile, setAuthorPhotoFile] = useState<File | null>(null);
  const [authorPhotoPreview, setAuthorPhotoPreview] = useState<string | null>(null);
  const [authorPhotoEncoded, setAuthorPhotoEncoded] = useState<EncodedImage | null>(null);
  const [noindex, setNoindex] = useState(false);

  // Redirects panel
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [showRedirects, setShowRedirects] = useState(false);
  const [newOldSlug, setNewOldSlug] = useState('');
  const [newPath, setNewPath] = useState('');
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // Editor link/image modals (replace window.prompt — see handleInsertLink)
  const [linkModal, setLinkModal] = useState<{ selStart: number; selEnd: number; selectedText: string; url: string; scrollTop: number } | null>(null);
  const [imageAltModal, setImageAltModal] = useState<{ url: string; cursor: number; alt: string; scrollTop: number } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const authorPhotoInputRef = useRef<HTMLInputElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCursorRef = useRef<number | null>(null);
  const pendingScrollTopRef = useRef<number>(0);

  // Restore an existing admin session on mount (real Supabase session, not a
  // client-side flag) and stay in sync with sign-out from another tab.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session && ADMIN_EMAILS.includes(session.user.email || '')) {
        setAccessToken(session.access_token);
        setAuthed(true);
      }
      setCheckingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && ADMIN_EMAILS.includes(session.user.email || '')) {
        setAccessToken(session.access_token);
        setAuthed(true);
      } else {
        setAccessToken(null);
        setAuthed(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoginError('');
    if (!ADMIN_EMAILS.includes(email)) { setLoginError('Access denied. Admin only.'); return; }
    setLoggingIn(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoggingIn(false);
    if (error || !data.session) { setLoginError('Wrong email or password.'); return; }
    setAccessToken(data.session.access_token);
    setAuthed(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setAuthed(false);
  };

  const authHeaders = () => ({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
  });

  const fetchBlogs = async () => {
    setLoading(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/blogs?order=created_at.desc`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    setBlogs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const fetchRedirects = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_redirects?order=created_at.desc`, { headers: authHeaders() });
    const data = await res.json();
    setRedirects(Array.isArray(data) ? data : []);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (authed) { fetchBlogs(); fetchRedirects(); } }, [authed]);

  const addRedirect = async () => {
    setRedirectError(null);
    const oldSlug = slugify(newOldSlug);
    const target = newPath.trim();
    if (!oldSlug || !target) { setRedirectError('Both fields are required.'); return; }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_redirects`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ old_slug: oldSlug, new_path: target }),
    });
    if (res.ok) {
      setNewOldSlug(''); setNewPath('');
      fetchRedirects();
    } else {
      const body = await res.json().catch(() => null);
      setRedirectError(body?.code === 'PGRST205'
        ? 'Redirects need the pending database migration to be run first.'
        : body?.message || 'Failed to save redirect.');
    }
  };

  const deleteRedirect = async (id: string) => {
    await fetch(`${SUPABASE_URL}/rest/v1/blog_redirects?id=eq.${id}`, { method: 'DELETE', headers: authHeaders() });
    fetchRedirects();
  };

  const applyCrop = async (file: File, ratio: RatioPreset) => {
    try {
      const encoded = await cropToRatio(file, ratio.width, ratio.height);
      setCroppedImage(encoded);
      setImagePreview(URL.createObjectURL(encoded.blob));
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

  const handleAuthorPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAuthorPhotoFile(file);
    try {
      const encoded = await optimizeImage(file, 400);
      setAuthorPhotoEncoded(encoded);
      setAuthorPhotoPreview(URL.createObjectURL(encoded.blob));
    } catch {
      setUploadError('Could not process that photo. Try a different file.');
    }
  };

  const uploadEncoded = async (encoded: EncodedImage): Promise<{ url: string | null; error?: string }> => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${encoded.ext}`;
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/blog-images/${fileName}`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': encoded.mime, 'x-upsert': 'true' },
        body: encoded.blob,
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
  // Restoring only the character position isn't enough — React re-rendering
  // the textarea's value resets its scrollTop to 0, so on a long post the
  // cursor is technically correct but visually the view snaps to the top.
  // Restoring scrollTop alongside the selection keeps the view where the
  // admin was working.
  const restoreCursor = (pos: number, scrollTop: number, selEnd: number = pos) => {
    setTimeout(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(pos, selEnd);
      ta.scrollTop = scrollTop;
    }, 0);
  };

  const insertFormat = (prefix: string, suffix: string = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const scrollTop = ta.scrollTop;
    const selected = description.substring(start, end);
    const newText = description.substring(0, start) + prefix + selected + suffix + description.substring(end);
    setDescription(newText);
    restoreCursor(start + prefix.length, scrollTop, end + prefix.length);
  };

  // window.prompt() is unreliable outside a plain top-level browser tab —
  // it's silently unsupported in many embedded/webview contexts and some
  // locked-down browser policies, where it just does nothing instead of
  // showing anything. These small in-page modals work everywhere.
  const handleInsertLink = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selectedText = description.substring(start, end) || 'link text';
    setLinkModal({ selStart: start, selEnd: end, selectedText, url: '', scrollTop: ta.scrollTop });
  };

  const confirmInsertLink = () => {
    if (!linkModal || !linkModal.url.trim()) { setLinkModal(null); return; }
    const markdown = `[${linkModal.selectedText}](${linkModal.url.trim()})`;
    setDescription(description.substring(0, linkModal.selStart) + markdown + description.substring(linkModal.selEnd));
    restoreCursor(linkModal.selStart + markdown.length, linkModal.scrollTop);
    setLinkModal(null);
  };

  const handleInsertImageClick = () => {
    pendingCursorRef.current = textareaRef.current?.selectionStart ?? description.length;
    pendingScrollTopRef.current = textareaRef.current?.scrollTop ?? 0;
    bodyImageInputRef.current?.click();
  };

  const handleBodyImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const encoded = await optimizeImage(file, 1600);
      const result = await uploadEncoded(encoded);
      if (!result.url) { setUploadError(result.error || 'Image upload failed.'); return; }
      setImageAltModal({ url: result.url, cursor: pendingCursorRef.current ?? description.length, alt: '', scrollTop: pendingScrollTopRef.current });
    } catch {
      setUploadError('Could not process that image. Try a different file.');
    }
  };

  const confirmInsertImage = () => {
    if (!imageAltModal) return;
    const markdown = `\n![${imageAltModal.alt}](${imageAltModal.url})\n`;
    setDescription(description.substring(0, imageAltModal.cursor) + markdown + description.substring(imageAltModal.cursor));
    restoreCursor(imageAltModal.cursor + markdown.length, imageAltModal.scrollTop);
    setImageAltModal(null);
  };

  const openNewForm = () => {
    setEditingBlog(null);
    setTitle(''); setDescription(''); setAuthor('SocialRum Team');
    setImageFile(null); setImagePreview(null); setCroppedImage(null);
    setSelectedRatio(RATIO_PRESETS[0]); setUploadError(null); setFormError(null);
    setPublishMode('now'); setScheduledDate(''); setScheduledTime('');
    setPreview(false); setMobilePreview(false);
    setSlug(''); setSlugTouched(false);
    setPrimaryKeyword('');
    setMetaTitle(''); setMetaDescription(''); setCoverAlt('');
    setCategory(''); setAuthorBio(''); setFont('sans');
    setAuthorPhotoFile(null); setAuthorPhotoPreview(null); setAuthorPhotoEncoded(null);
    setNoindex(false);
    setShowForm(true);
  };

  const openEditForm = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title); setDescription(blog.description);
    setAuthor(blog.author); setImagePreview(blog.image_url || null);
    setImageFile(null); setCroppedImage(null);
    setSelectedRatio(RATIO_PRESETS[0]); setUploadError(null); setFormError(null);
    setPublishMode(blog.published ? 'now' : 'draft');
    setPreview(false); setMobilePreview(false);
    // Editing an existing post: the slug is locked to its current value
    // unless the admin deliberately changes it (slugTouched=true from the start).
    setSlug(blog.slug || slugify(blog.title)); setSlugTouched(true);
    setPrimaryKeyword(blog.primary_keyword || '');
    setMetaTitle(blog.meta_title || ''); setMetaDescription(blog.meta_description || '');
    setCoverAlt(blog.cover_alt || '');
    setCategory(blog.category || ''); setAuthorBio(blog.author_bio || '');
    setFont(blog.font_family || 'sans');
    setAuthorPhotoFile(null); setAuthorPhotoPreview(blog.author_photo_url || null); setAuthorPhotoEncoded(null);
    setNoindex(!!blog.noindex);
    setShowForm(true);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingBlog && !slugTouched) setSlug(slugify(value));
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(slugify(value));
  };

  const handlePost = async () => {
    if (!title.trim() || !description.trim()) return;
    const finalSlug = slugify(slug) || slugify(title);
    if (!finalSlug) { setFormError('Slug cannot be empty.'); return; }

    setUploadError(null);
    setFormError(null);
    setSaving(true);

    // Slug uniqueness check — surfaced as an error rather than silently
    // renamed, since a slug must never change without the admin's say-so.
    const dupeCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/blogs?slug=eq.${encodeURIComponent(finalSlug)}&select=id`,
      { headers: authHeaders() }
    ).then(r => r.json()).catch(() => []);
    const dupe = Array.isArray(dupeCheck) ? dupeCheck.find((b: { id: string }) => b.id !== editingBlog?.id) : null;
    if (dupe) {
      setSaving(false);
      setFormError(`The slug "${finalSlug}" is already used by another post. Choose a different one.`);
      return;
    }

    let image_url: string | null = editingBlog?.image_url || null;
    if (imageFile) {
      if (!croppedImage) {
        setSaving(false);
        setUploadError('Image is still processing — try again in a moment.');
        return;
      }
      const result = await uploadEncoded(croppedImage);
      if (!result.url) {
        setSaving(false);
        setUploadError(result.error || 'Image upload failed.');
        return;
      }
      image_url = result.url;
    }

    let author_photo_url: string | null = editingBlog?.author_photo_url || null;
    if (authorPhotoFile && authorPhotoEncoded) {
      const result = await uploadEncoded(authorPhotoEncoded);
      if (!result.url) {
        setSaving(false);
        setUploadError(result.error || 'Author photo upload failed.');
        return;
      }
      author_photo_url = result.url;
    }

    const isPublished = publishMode === 'now';
    const scheduled_at = publishMode === 'schedule' && scheduledDate && scheduledTime
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() : null;

    const payload = {
      title, description, image_url, author, published: isPublished, slug: finalSlug, scheduled_at,
      primary_keyword: primaryKeyword.trim() || null,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      cover_alt: coverAlt.trim() || null,
      category: category || null,
      font_family: font,
      author_bio: authorBio.trim() || null,
      author_photo_url,
      noindex,
    };

    // If an existing post's slug just changed, leave a redirect behind —
    // the old URL will otherwise 404 and any inbound links/ranking are lost.
    if (editingBlog && editingBlog.slug && editingBlog.slug !== finalSlug) {
      fetch(`${SUPABASE_URL}/rest/v1/blog_redirects`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ old_slug: editingBlog.slug, new_path: `/blog/${finalSlug}` }),
      }).catch(() => { /* best-effort — doesn't block publishing */ });
    }

    const save = (body: Record<string, unknown>) => editingBlog
      ? fetch(`${SUPABASE_URL}/rest/v1/blogs?id=eq.${editingBlog.id}`, {
          method: 'PATCH',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      : fetch(`${SUPABASE_URL}/rest/v1/blogs`, {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify(body),
        });

    let res = await save(payload);

    // The 2026-07-31_blog_cms_fields.sql migration adds meta_title, category,
    // etc. — if it hasn't been run yet, PostgREST rejects the whole request
    // (PGRST204 "column does not exist") rather than ignoring the unknown
    // fields. Fall back to the columns that have always existed so posting
    // still works, and tell the admin why the new fields didn't save.
    let migrationPending = false;
    if (!res.ok) {
      const errBody = await res.clone().json().catch(() => null);
      if (errBody?.code === 'PGRST204') {
        migrationPending = true;
        const { title, description, image_url, author, published, slug: slugField, scheduled_at } = payload;
        res = await save({ title, description, image_url, author, published, slug: slugField, scheduled_at });
      }
    }

    setSaving(false);
    if (res.ok) {
      setSaved(true); setTimeout(() => setSaved(false), 3000);
      if (migrationPending) {
        setFormError('Saved — but the slug/meta/category/author/noindex fields need the pending database migration to be run before they\'ll save. The post itself is live.');
      }
      setShowForm(false); setEditingBlog(null); fetchBlogs();
    } else {
      const body = await res.json().catch(() => null);
      setFormError(body?.message || 'Failed to save post.');
    }
  };

  // Same fragility as window.prompt (see handleInsertLink) — confirm() can
  // silently no-op in some browser contexts, which for a delete action
  // means nothing happens with no feedback. A modal works everywhere.
  const handleDelete = (id: string) => setDeleteConfirmId(id);

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    await fetch(`${SUPABASE_URL}/rest/v1/blogs?id=eq.${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    fetchBlogs();
  };

  const togglePublish = async (blog: Blog) => {
    await fetch(`${SUPABASE_URL}/rest/v1/blogs?id=eq.${blog.id}`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !blog.published }),
    });
    fetchBlogs();
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'DM Sans', sans-serif" };
  const counterStyle = (len: number, target: number): React.CSSProperties => ({ fontSize: 11, marginTop: 4, fontFamily: "'DM Sans', sans-serif", color: len > target ? '#f87171' : 'rgba(255,255,255,0.3)' });

  const previewBoxStyle = (ratio: RatioPreset): React.CSSProperties => ({
    width: `min(100%, ${(320 * ratio.width) / ratio.height}px)`,
    aspectRatio: `${ratio.width} / ${ratio.height}`,
    margin: '0 auto',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    background: 'rgba(0,0,0,0.3)',
  });

  // Mirrors BlogPage.tsx's rendering so "Preview" actually matches what
  // readers will see — links, headings, and images used to show as raw
  // markdown syntax here instead of rendering.
  const previewMarkdownComponents: Components = {
    h2: ({ children }) => <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: '#fff', margin: '24px 0 10px' }}>{children}</h2>,
    h3: ({ children }) => <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', margin: '20px 0 8px' }}>{children}</h3>,
    p: ({ children }) => <p style={{ margin: '0 0 14px', lineHeight: 1.8 }}>{children}</p>,
    ul: ({ children }) => <ul style={{ margin: '0 0 14px', paddingLeft: 20, lineHeight: 1.8 }}>{children}</ul>,
    blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid rgba(139,92,246,0.4)', margin: '0 0 14px', padding: '2px 0 2px 14px', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>{children}</blockquote>,
    hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(139,92,246,0.15)', margin: '20px 0' }} />,
    img: ({ src, alt }) => <img src={typeof src === 'string' ? src : undefined} alt={alt || ''} style={{ width: '100%', borderRadius: 12, margin: '6px 0 14px' }} />,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>{children}</a>,
  };

  // ── Checking for an existing session ──
  if (checkingSession) return (
    <div style={{ minHeight: '100vh', background: '#03000a' }} />
  );

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
          <button onClick={handleLogin} disabled={loggingIn}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif', opacity: loggingIn ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loggingIn ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : 'Login'}
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
          <button onClick={handleLogout}
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
          {(uploadError || formError) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
              <X size={16} /> {uploadError || formError}
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
                  {preview && (
                    <button onClick={() => setMobilePreview(!mobilePreview)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {mobilePreview ? <Monitor size={14} /> : <Smartphone size={14} />} {mobilePreview ? 'Desktop' : 'Mobile'}
                    </button>
                  )}
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
                <div style={{ maxWidth: mobilePreview ? 390 : '100%', margin: '0 auto', border: mobilePreview ? '8px solid rgba(255,255,255,0.08)' : 'none', borderRadius: mobilePreview ? 28 : 16 }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: mobilePreview ? 20 : 16, overflow: 'hidden' }}>
                    {imagePreview && (
                      <div style={{ ...previewBoxStyle(selectedRatio), margin: 0, borderRadius: 0, width: '100%' }}>
                        <img src={imagePreview} alt={coverAlt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: 24 }}>
                      {category && <span style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a78bfa', fontWeight: 700 }}>{CATEGORIES.find(c => c.value === category)?.label}</span>}
                      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: mobilePreview ? 20 : 24, fontWeight: 800, color: '#fff', margin: '8px 0 12px' }}>{title || 'Untitled Post'}</h1>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>By {author} · Just now</p>
                      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontFamily: fontStack(font) }}>
                        {description
                          ? <ReactMarkdown components={previewMarkdownComponents}>{description}</ReactMarkdown>
                          : <p style={{ lineHeight: 1.8 }}>No content yet...</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Title */}
                  <div>
                    <label style={labelStyle}>Title *</label>
                    <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Enter blog title..." className="admin-input" />
                  </div>

                  {/* Slug */}
                  <div>
                    <label style={labelStyle}>URL slug *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>/blog/</span>
                      <input type="text" value={slug} onChange={e => handleSlugChange(e.target.value)} placeholder="post-slug" className="admin-input" />
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                      {editingBlog ? "Won't change automatically — edit it here only if you mean to move the URL." : 'Auto-filled from the title; edit it before publishing if you want something different.'}
                    </p>
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
                        <button onClick={() => { setImageFile(null); setImagePreview(null); setCroppedImage(null); setUploadError(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
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
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>PNG, JPG, WEBP supported · auto-converted to WebP</span>
                      </button>
                    )}
                    <input type="text" value={coverAlt} onChange={e => setCoverAlt(e.target.value)} placeholder="Cover image alt text (for accessibility & Google Images)"
                      className="admin-input" style={{ marginTop: 8 }} />
                  </div>

                  {/* Category + Font */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Category</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="admin-input" style={{ colorScheme: 'dark' }}>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Body font</label>
                      <select value={font} onChange={e => setFont(e.target.value)} className="admin-input" style={{ colorScheme: 'dark', fontFamily: fontStack(font) }}>
                        {FONTS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.stack }}>{f.label}</option>)}
                      </select>
                    </div>
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
                      <button className="editor-btn" onClick={handleInsertLink}><Link2 size={12} /> Link</button>
                      <button className="editor-btn" onClick={handleInsertImageClick}><ImageIcon size={12} /> Image</button>
                      <button className="editor-btn" onClick={() => insertFormat('\n\n---\n\n')}>— Divider</button>
                      <button className="editor-btn" onClick={() => insertFormat('\n> ')}>❝ Quote</button>
                    </div>
                    <input ref={bodyImageInputRef} type="file" accept="image/*" onChange={handleBodyImageChange} style={{ display: 'none' }} />
                    <textarea ref={textareaRef} value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Write your blog post content here...&#10;&#10;Use **bold**, _italic_, ## Heading, - list items, [links](url), ![alt](image-url)" className="editor-textarea" />
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
                      {description.length} characters · Supports markdown formatting · Tip: add an "## FAQ" section with "### Question" sub-headings to get FAQ rich results
                    </p>
                  </div>

                  {/* Author */}
                  <div>
                    <label style={labelStyle}>Author</label>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="admin-input" style={{ marginBottom: 10 }} />
                    <textarea value={authorBio} onChange={e => setAuthorBio(e.target.value)} placeholder="Short author bio..." rows={2} className="admin-textarea" style={{ marginBottom: 10 }} />
                    <input ref={authorPhotoInputRef} type="file" accept="image/*" onChange={handleAuthorPhotoChange} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {authorPhotoPreview && (
                        <img src={authorPhotoPreview} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      <button onClick={() => authorPhotoInputRef.current?.click()}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                        <Upload size={12} /> {authorPhotoPreview ? 'Change photo' : 'Upload author photo'}
                      </button>
                    </div>
                  </div>

                  {/* SEO fields */}
                  <div>
                    <label style={labelStyle}>Primary keyword <span style={{ textTransform: 'none', letterSpacing: 0 }}>(the main term this post targets)</span></label>
                    <input type="text" value={primaryKeyword} onChange={e => setPrimaryKeyword(e.target.value)} placeholder="e.g. instagram reels analytics" className="admin-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>Meta title <span style={{ textTransform: 'none', letterSpacing: 0 }}>(search-result title, ~60 chars)</span></label>
                    <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder={title || 'Falls back to the post title'} className="admin-input" />
                    <p style={counterStyle(metaTitle.length, 60)}>{metaTitle.length}/60</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Meta description <span style={{ textTransform: 'none', letterSpacing: 0 }}>(~155 chars)</span></label>
                    <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2} placeholder="Falls back to the start of the post body" className="admin-textarea" />
                    <p style={counterStyle(metaDescription.length, 155)}>{metaDescription.length}/155</p>
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                      <input type="checkbox" checked={noindex} onChange={e => setNoindex(e.target.checked)} />
                      noindex this post (keep it off Google — for thin/utility pages)
                    </label>
                  </div>

                  {/* Publish mode */}
                  <div>
                    <label style={labelStyle}>Publish</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { value: 'now', label: '🚀 Publish Now' },
                        { value: 'draft', label: '📝 Save Draft' },
                        { value: 'schedule', label: '⏰ Schedule' },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => setPublishMode(opt.value as 'now' | 'draft' | 'schedule')}
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
                    /blog/{blog.slug} · {new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {blog.author}
                    {blog.scheduled_at && <span style={{ color: '#a78bfa' }}> · ⏰ Scheduled</span>}
                    {blog.noindex && <span style={{ color: '#f87171' }}> · noindex</span>}
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

        {/* Redirects panel */}
        <div style={{ marginTop: 40 }}>
          <button onClick={() => setShowRedirects(!showRedirects)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif', padding: 0, marginBottom: 16 }}>
            <Route size={16} /> URL Redirects ({redirects.length})
            <ChevronDown size={14} style={{ transform: showRedirects ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>

          <AnimatePresence>
            {showRedirects && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}>
                <div style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 16, padding: 20 }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
                    Map an old blog URL to where it should send visitors now. Created automatically when a post's slug changes — add one here for anything else (e.g. a post you deleted).
                  </p>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <input value={newOldSlug} onChange={e => setNewOldSlug(e.target.value)} placeholder="old-slug" className="admin-input" style={{ flex: 1, minWidth: 140 }} />
                    <input value={newPath} onChange={e => setNewPath(e.target.value)} placeholder="/blog/new-slug or any path" className="admin-input" style={{ flex: 1, minWidth: 140 }} />
                    <button onClick={addRedirect}
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 10, padding: '0 18px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
                      Add
                    </button>
                  </div>
                  {redirectError && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 12 }}>{redirectError}</p>}

                  {redirects.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No redirects yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {redirects.map(r => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}>/blog/{r.old_slug}</span>
                          <ExternalLink size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
                          <span style={{ color: '#a78bfa', flex: 1 }}>{r.new_path}</span>
                          <button onClick={() => deleteRedirect(r.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Insert-link modal */}
      <AnimatePresence>
        {linkModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLinkModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ width: '100%', maxWidth: 420, background: '#0a0212', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Insert link</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                Linking &ldquo;{linkModal.selectedText}&rdquo;. For another post on this blog, use its full URL, e.g. https://www.socialrum.com/blog/its-slug
              </p>
              <input autoFocus value={linkModal.url} onChange={e => setLinkModal({ ...linkModal, url: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') confirmInsertLink(); if (e.key === 'Escape') setLinkModal(null); }}
                placeholder="https://..." className="admin-input" style={{ marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setLinkModal(null)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={confirmInsertLink} disabled={!linkModal.url.trim()}
                  style={{ flex: 1, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 10, padding: '10px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: linkModal.url.trim() ? 1 : 0.5 }}>
                  Insert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image alt-text modal */}
      <AnimatePresence>
        {imageAltModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setImageAltModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ width: '100%', maxWidth: 420, background: '#0a0212', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Image alt text</h3>
              <img src={imageAltModal.url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Required for accessibility and how images rank in Google Images.</p>
              <input autoFocus value={imageAltModal.alt} onChange={e => setImageAltModal({ ...imageAltModal, alt: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') confirmInsertImage(); if (e.key === 'Escape') setImageAltModal(null); }}
                placeholder="Describe the image..." className="admin-input" style={{ marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setImageAltModal(null)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer' }}>
                  Skip
                </button>
                <button onClick={confirmInsertImage}
                  style={{ flex: 1, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: 10, padding: '10px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Insert image
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete-post confirm modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmId(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ width: '100%', maxWidth: 380, background: '#0a0212', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Delete this post?</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>This can't be undone.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDeleteConfirmId(null)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  style={{ flex: 1, background: '#ef4444', border: 'none', borderRadius: 10, padding: '10px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
