// ContentStudio.tsx — Studio editor (Stage 4: captions + overlays + music)
// Upload -> transcribe/edit/style captions -> Pexels overlays -> music kit.
// Export comes in Stage 5. Uses /api/captioner and /api/studio backends.

import React, { useState, useRef, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase"; // adjust path if needed

const API = import.meta.env.VITE_API_URL;
const PURPLE = "#7C3AED";
const GRAD = "linear-gradient(135deg, #7C3AED, #6D28D9)";
const PX_PER_SEC = 80;

type Word = { id: number; start: number; end: number; text: string };
type Segment = { id: number; start: number; end: number; text: string };
type Overlay = { id: string; kind: "image" | "video"; url: string; thumb: string; start: number; length: number; mode: "pip" | "full" | "half"; half: "top" | "bottom"; x: number; y: number };
type PexItem = { id: number; kind: "image" | "video"; thumb: string; url: string };
type Music = { key: string; label: string; url: string };

const FONTS = [
  { key: "Poppins", label: "Poppins", css: "'Poppins', sans-serif" },
  { key: "Montserrat", label: "Montserrat", css: "'Montserrat', sans-serif" },
  { key: "Anton", label: "Anton", css: "'Anton', sans-serif" },
  { key: "BebasNeue", label: "Bebas Neue", css: "'Bebas Neue', sans-serif" },
  { key: "Inter", label: "Inter", css: "'Inter', sans-serif" },
];

// Preset music — paste your own hosted royalty-free MP3 URLs.
const MUSIC: Music[] = [
  { key: "none", label: "No music", url: "" },
  { key: "upbeat", label: "Upbeat", url: "" },
  { key: "chill", label: "Chill", url: "" },
  { key: "cinematic", label: "Cinematic", url: "" },
  { key: "lofi", label: "Lo-fi", url: "" },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
const uid = () => Math.random().toString(36).slice(2, 9);

function buildSegments(words: Word[]): Segment[] {
  const out: Segment[] = []; let cur: Word[] = [];
  const flush = () => { if (!cur.length) return; out.push({ id: out.length, start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map(w => w.text).join(" ") }); cur = []; };
  for (let i = 0; i < words.length; i++) { cur.push(words[i]); const next = words[i + 1]; const gap = next ? next.start - words[i].end : 99; if (gap > 0.6 || cur.length >= 8) flush(); }
  flush(); return out;
}
function reindex(segs: Segment[]): Segment[] { return segs.map((s, i) => ({ ...s, id: i })); }

export default function ContentStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [hostedUrl, setHostedUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "transcribing" | "ready">("idle");
  const [error, setError] = useState("");

  const [font, setFont] = useState(FONTS[0]);
  const [captionPos, setCaptionPos] = useState<"top" | "middle" | "bottom">("bottom");
  const [showBox, setShowBox] = useState(true);
  const [textColor, setTextColor] = useState("#ffffff");
  const [boxColor, setBoxColor] = useState("#000000");
  const [history, setHistory] = useState<Segment[][]>([]);

  // overlays
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selOverlay, setSelOverlay] = useState<string | null>(null);
  const [dragOverlay, setDragOverlay] = useState<{ id: string; dx: number } | null>(null);

  // pexels
  const [showPex, setShowPex] = useState(false);
  const [pexTab, setPexTab] = useState<"pexels" | "upload">("pexels");
  const [pexQ, setPexQ] = useState("");
  const [pexType, setPexType] = useState<"photo" | "video">("photo");
  const [pexItems, setPexItems] = useState<PexItem[]>([]);
  const [pexLoading, setPexLoading] = useState(false);
  const [uploadingOverlay, setUploadingOverlay] = useState(false);

  // music
  const [music, setMusic] = useState<Music>(MUSIC[0]);
  const [musicStart, setMusicStart] = useState(0);
  const [songTrim, setSongTrim] = useState(0);
  const [volume, setVolume] = useState(0.25);
  const [fadeIn, setFadeIn] = useState(true);
  const [fadeOut, setFadeOut] = useState(true);
  const [muteOriginal, setMuteOriginal] = useState(false);
  const [originalVolume, setOriginalVolume] = useState(1);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [uploadedMusic, setUploadedMusic] = useState<Music[]>([]);
  const [dragMusic, setDragMusic] = useState(false);
  const [dragPip, setDragPip] = useState<{ id: string; dx: number; dy: number } | null>(null);

  // save
  const [savedAt, setSavedAt] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // projects panel
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string; video_url: string; data: any; updated_at: string }[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // export
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportPreviewUrl, setExportPreviewUrl] = useState<string | null>(null);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const exportCancelRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const caretRef = useRef<{ id: number; pos: number } | null>(null);

  const hasVideo = !!videoUrl;
  const hasCaptions = segments.length > 0;
  const hasMusic = music.key !== "none";
  const trackWidth = Math.max(duration * PX_PER_SEC, 400);

  const activeId = useMemo(() => { const seg = segments.find(s => time >= s.start && time < s.end); return seg ? seg.id : null; }, [segments, time]);
  const activeText = activeId != null ? segments.find(s => s.id === activeId)?.text : "";
  const activeOverlays = useMemo(() => overlays.filter(o => time >= o.start && time < o.start + o.length), [overlays, time]);
  const activeHalfOverlay = useMemo(() => activeOverlays.find(o => o.mode === "half") || null, [activeOverlays]);

  useEffect(() => { if (activeId != null) rowRefs.current[activeId]?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [activeId]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume, music]);
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muteOriginal; }, [muteOriginal]);
  useEffect(() => { if (videoRef.current && !muteOriginal) videoRef.current.volume = originalVolume; }, [originalVolume, muteOriginal]);
  useEffect(() => { fetchProjects(); }, []);

  // overlay drag
  useEffect(() => {
    if (!dragOverlay) return;
    const move = (e: PointerEvent) => {
      const el = tracksRef.current; if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left + el.scrollLeft - dragOverlay.dx;
      const start = Math.max(0, Math.min(duration, x / PX_PER_SEC));
      setOverlays(prev => prev.map(o => o.id === dragOverlay.id ? { ...o, start: Math.min(start, duration - o.length) } : o));
    };
    const up = () => setDragOverlay(null);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragOverlay, duration]);

  // music drag
  useEffect(() => {
    if (!dragMusic) return;
    const move = (e: PointerEvent) => {
      const el = tracksRef.current; if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left + el.scrollLeft;
      setMusicStart(Math.max(0, Math.min(duration, Math.round((x / PX_PER_SEC) * 10) / 10)));
    };
    const up = () => setDragMusic(false);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragMusic, duration]);

  // PiP drag in preview
  useEffect(() => {
    if (!dragPip) return;
    const move = (e: PointerEvent) => {
      const el = previewRef.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragPip.dx) / rect.width;
      const y = (e.clientY - rect.top - dragPip.dy) / rect.height;
      setOverlays(prev => prev.map(o => o.id === dragPip.id ? { ...o, x: Math.max(0, Math.min(0.95, x)), y: Math.max(0, Math.min(0.95, y)) } : o));
    };
    const up = () => setDragPip(null);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragPip]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]; if (!picked) return;
    setFile(picked); setVideoUrl(URL.createObjectURL(picked));
    setDuration(0); setTime(0); setSegments([]); setOverlays([]); setStatus("idle"); setError("");
  }

  async function transcribe() {
    if (!file) return;
    setError(""); setStatus("uploading");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const path = `studio/${session.user.id}/${Date.now()}.mp4`;
      const { error: upErr } = await supabase.storage.from("insta-media").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
      setHostedUrl(pub.publicUrl);
      setStatus("transcribing");
      const res = await fetch(`${API}/api/captioner/transcribe`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ videoUrl: pub.publicUrl }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Transcription failed"); }
      const { transcriptId } = await res.json();
      if (!transcriptId) throw new Error("Transcription did not start");
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const sRes = await fetch(`${API}/api/captioner/transcribe/${transcriptId}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
        const s = await sRes.json();
        if (s.status === "completed") { setSegments(buildSegments(s.words || [])); setStatus("ready"); return; }
        if (s.status === "error") throw new Error("Transcription failed");
      }
      throw new Error("Transcription timed out");
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); setStatus("idle"); }
  }

  function onTimeUpdate() {
    const v = videoRef.current; const a = audioRef.current; if (!v) return;
    setTime(v.currentTime);
    if (a && hasMusic && music.url) {
      a.volume = volume;
      if (v.currentTime >= musicStart) {
        const target = songTrim + (v.currentTime - musicStart);
        if (Math.abs(a.currentTime - target) > 0.3) a.currentTime = target;
        if (a.paused && !v.paused) a.play().catch(() => {});
      } else if (!a.paused) a.pause();
    }
  }
  function onPlay() { const v = videoRef.current, a = audioRef.current; if (a && hasMusic && music.url && v && v.currentTime >= musicStart) { a.volume = volume; a.play().catch(() => {}); } }
  function onPause() { if (audioRef.current) audioRef.current.pause(); }

  function onTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragOverlay || dragMusic) return;
    const el = timelineRef.current; const v = videoRef.current;
    if (!el || !v || !duration) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left + el.scrollLeft;
    v.currentTime = Math.max(0, Math.min(duration, x / PX_PER_SEC));
  }
  function seek(t: number) { if (videoRef.current) videoRef.current.currentTime = t; }
  function editSeg(id: number, text: string) { setSegments(prev => prev.map(s => (s.id === id ? { ...s, text } : s))); }

  function pushHistory() { setHistory(h => { const snap = JSON.stringify(segments); if (h.length && JSON.stringify(h[h.length - 1]) === snap) return h; return [...h.slice(-49), JSON.parse(snap)]; }); }
  function undo() { setHistory(h => { if (!h.length) return h; setSegments(h[h.length - 1]); return h.slice(0, -1); }); }
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); });
  function splitSeg(id: number) {
    const seg = segments.find(s => s.id === id); if (!seg) return;
    const pos = caretRef.current && caretRef.current.id === id ? caretRef.current.pos : Math.floor(seg.text.length / 2);
    const before = seg.text.slice(0, pos).trim(); const after = seg.text.slice(pos).trim(); if (!before || !after) return;
    pushHistory();
    const mid = seg.start + (seg.end - seg.start) * (pos / seg.text.length);
    const idx = segments.findIndex(s => s.id === id); const next = [...segments];
    next.splice(idx, 1, { ...seg, text: before, end: mid }, { id: -1, start: mid, end: seg.end, text: after });
    setSegments(reindex(next));
  }
  function mergeUp(id: number) {
    const idx = segments.findIndex(s => s.id === id); if (idx <= 0) return;
    pushHistory(); const prev = segments[idx - 1], cur = segments[idx];
    const next = [...segments]; next.splice(idx - 1, 2, { ...prev, text: `${prev.text} ${cur.text}`.trim(), end: cur.end });
    setSegments(reindex(next));
  }

  async function searchPexels() {
    setPexLoading(true);
    try { const r = await fetch(`${API}/api/studio/pexels?q=${encodeURIComponent(pexQ || "trending")}&type=${pexType}`); const data = await r.json(); setPexItems(data.items || []); }
    catch { setPexItems([]); } finally { setPexLoading(false); }
  }
  function addOverlay(it: PexItem) {
    const len = it.kind === "video" ? 4 : 3;
    const start = Math.min(time, Math.max(0, duration - len));
    const o: Overlay = { id: uid(), kind: it.kind, url: it.url, thumb: it.thumb, start, length: len, mode: "full", half: "top", x: 0.56, y: 0.68 };
    setOverlays(prev => [...prev, o]); setSelOverlay(o.id); setShowPex(false);
  }
  function updateOverlay(id: string, patch: Partial<Overlay>) { setOverlays(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o)); }
  function deleteOverlay(id: string) { setOverlays(prev => prev.filter(o => o.id !== id)); if (selOverlay === id) setSelOverlay(null); }

  async function uploadOverlayFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingOverlay(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const isVideo = f.type.startsWith("video/");
      const path = `overlays/${session.user.id}/${Date.now()}-${f.name.replace(/[^\w.]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("insta-media").upload(path, f, { upsert: true, contentType: f.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
      addOverlay({ id: Date.now(), kind: isVideo ? "video" : "image", url: pub.publicUrl, thumb: pub.publicUrl });
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setUploadingOverlay(false); e.target.value = ""; }
  }

  async function uploadMusic(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setUploadingMusic(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const path = `music/${session.user.id}/${Date.now()}-${f.name.replace(/[^\w.]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("insta-media").upload(path, f, { upsert: true, contentType: f.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
      const track: Music = { key: `up-${uid()}`, label: f.name.slice(0, 18), url: pub.publicUrl };
      setUploadedMusic(prev => [...prev, track]);
      setMusic(track);
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn't upload track."); }
    finally { setUploadingMusic(false); }
  }

  async function saveProject() {
    if (!file && !hostedUrl) { setSaveError("No video loaded."); return; }
    setSaving(true); setSaveError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSaveError("Please sign in again."); return; }

      // Upload video to Supabase if not already done
      let url = hostedUrl;
      if (!url && file) {
        const path = `studio/${session.user.id}/${Date.now()}.mp4`;
        const { error: upErr } = await supabase.storage.from("insta-media").upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
        url = pub.publicUrl;
        setHostedUrl(url);
      }

      const payload = {
        user_id: session.user.id,
        name: (segments[0]?.text || file?.name || "Studio project").slice(0, 40),
        video_url: url,
        data: { segments, font: font.key, captionPos, showBox, textColor, boxColor, overlays, music, musicStart, songTrim, volume, fadeIn, fadeOut, muteOriginal, originalVolume },
        updated_at: new Date().toISOString(),
      };
      if (projectId) await supabase.from("studio_projects").update(payload).eq("id", projectId);
      else { const { data: ins } = await supabase.from("studio_projects").insert(payload).select("id").single(); if (ins) setProjectId(ins.id); }
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function fetchProjects() {
    setLoadingProjects(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("studio_projects").select("id, name, video_url, data, updated_at").eq("user_id", session.user.id).order("updated_at", { ascending: false }).limit(20);
      setProjects(data || []);
    } catch { /* ignore */ }
    finally { setLoadingProjects(false); }
  }

  function loadProject(p: { id: string; name: string; video_url: string; data: any }) {
    const d = p.data || {};
    setVideoUrl(p.video_url); setHostedUrl(p.video_url); setFile(null);
    setSegments(d.segments || []); setHistory([]);
    setFont(FONTS.find(f => f.key === d.font) || FONTS[0]);
    setCaptionPos(d.captionPos || "bottom"); setShowBox(d.showBox ?? true);
    setTextColor(d.textColor || "#ffffff"); setBoxColor(d.boxColor || "#000000");
    setOverlays(d.overlays || []);
    setMusic(d.music || MUSIC[0]); setMusicStart(d.musicStart || 0);
    setSongTrim(d.songTrim || 0); setVolume(d.volume ?? 0.25);
    setFadeIn(d.fadeIn ?? true); setFadeOut(d.fadeOut ?? true);
    setMuteOriginal(d.muteOriginal ?? false); setOriginalVolume(d.originalVolume ?? 1);
    setProjectId(p.id); setStatus("ready"); setError(""); setSavedAt("");
    setShowProjects(false);
  }

  // Draw image/video with object-cover behaviour onto canvas
  function drawCover(ctx: CanvasRenderingContext2D, src: HTMLImageElement | HTMLVideoElement, dx: number, dy: number, dw: number, dh: number) {
    const sw = src instanceof HTMLVideoElement ? src.videoWidth : src.naturalWidth;
    const sh = src instanceof HTMLVideoElement ? src.videoHeight : src.naturalHeight;
    if (!sw || !sh) return;
    const srcRatio = sw / sh, dstRatio = dw / dh;
    let sx = 0, sy = 0, cropW = sw, cropH = sh;
    if (srcRatio > dstRatio) { cropW = sh * dstRatio; sx = (sw - cropW) / 2; }
    else { cropH = sw / dstRatio; sy = (sh - cropH) / 2; }
    ctx.drawImage(src, sx, sy, cropW, cropH, dx, dy, dw, dh);
  }

  async function exportVideo() {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    setExporting(true); setExportProgress(0); exportCancelRef.current = false;

    const W = 1080, H = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Preload overlay images
    const imgCache: Record<string, HTMLImageElement> = {};
    await Promise.all(overlays.filter(o => o.kind === "image").map(o => new Promise<void>(res => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => { imgCache[o.id] = img; res(); };
      img.onerror = () => res();
      img.src = o.url;
    })));
    await document.fonts.ready;

    // Audio setup
    const audioCtx = new AudioContext();
    const mixDest = audioCtx.createMediaStreamDestination();
    try {
      if (!muteOriginal) {
        const vs = (v as any).captureStream?.() || (v as any).mozCaptureStream?.();
        if (vs?.getAudioTracks().length) {
          const src = audioCtx.createMediaStreamSource(new MediaStream(vs.getAudioTracks()));
          const gain = audioCtx.createGain(); gain.gain.value = originalVolume;
          src.connect(gain); gain.connect(mixDest);
        }
      }
      let musicAudioEl: HTMLAudioElement | null = null;
      if (hasMusic && music.url) {
        musicAudioEl = new Audio(); musicAudioEl.crossOrigin = "anonymous";
        musicAudioEl.src = music.url; musicAudioEl.loop = true;
        musicAudioEl.volume = volume; musicAudioEl.currentTime = songTrim;
        const ms = audioCtx.createMediaElementSource(musicAudioEl);
        const gainNode = audioCtx.createGain(); gainNode.gain.value = volume;
        ms.connect(gainNode); gainNode.connect(mixDest);
      }

      const canvasStream = canvas.captureStream(30);
      const outStream = new MediaStream([...canvasStream.getVideoTracks(), ...mixDest.stream.getAudioTracks()]);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
      const rec = new MediaRecorder(outStream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      // Seek to start
      v.pause(); v.currentTime = 0;
      await new Promise(r => setTimeout(r, 200));
      rec.start(200);
      await v.play();
      if (musicAudioEl) { musicAudioEl.currentTime = songTrim; musicAudioEl.play().catch(() => {}); }

      await new Promise<void>(resolve => {
        rec.onstop = () => resolve();
        const draw = () => {
          if (exportCancelRef.current) { v.pause(); musicAudioEl?.pause(); rec.stop(); return; }
          const t = v.currentTime;
          setExportProgress(duration > 0 ? Math.min(99, Math.round((t / duration) * 100)) : 0);

          ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);

          // Find active half overlay
          const halfOv = overlays.find(o => t >= o.start && t < o.start + o.length && o.mode === "half");
          if (halfOv) {
            const vidY = halfOv.half === "top" ? H / 2 : 0;
            const imgY = halfOv.half === "top" ? 0 : H / 2;
            drawCover(ctx, v, 0, vidY, W, H / 2);
            const img = imgCache[halfOv.id];
            if (img) drawCover(ctx, img, 0, imgY, W, H / 2);
          } else {
            drawCover(ctx, v, 0, 0, W, H);
            for (const o of overlays) {
              if (t < o.start || t >= o.start + o.length || o.mode === "half") continue;
              const img = imgCache[o.id]; if (!img) continue;
              if (o.mode === "full") drawCover(ctx, img, 0, 0, W, H);
              else if (o.mode === "pip") { const pw = W * 0.32; drawCover(ctx, img, o.x * W, o.y * H, pw, pw); }
            }
          }

          // Captions
          const seg = segments.find(s => t >= s.start && t < s.end);
          if (seg?.text) {
            const fs = Math.round(W * 0.044);
            ctx.font = `600 ${fs}px ${font.css}`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            const x = W / 2;
            const y = captionPos === "top" ? H * 0.1 : captionPos === "middle" ? H * 0.5 : H * 0.88;
            const pad = fs * 0.5;
            const tw = ctx.measureText(seg.text).width;
            if (showBox) {
              ctx.fillStyle = boxColor;
              ctx.beginPath(); ctx.roundRect(x - tw / 2 - pad, y - fs / 2 - pad / 2, tw + pad * 2, fs + pad, 8); ctx.fill();
            }
            ctx.fillStyle = textColor; ctx.fillText(seg.text, x, y);
          }

          if (v.ended || v.currentTime >= duration - 0.05) {
            v.pause(); musicAudioEl?.pause(); rec.stop();
          } else { requestAnimationFrame(draw); }
        };
        requestAnimationFrame(draw);
      });

      if (!exportCancelRef.current && chunks.length > 0) {
        const blob = new Blob(chunks, { type: mime });
        setExportBlob(blob);
        setExportPreviewUrl(URL.createObjectURL(blob));
      }
      setExportProgress(100);
    } finally {
      audioCtx.close(); setExporting(false); setExportProgress(0);
    }
  }

  async function convertToMp4() {
    if (!exportBlob) return;
    setConverting(true); setConvertProgress(0);
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => setConvertProgress(Math.round(progress * 100)));
      await ffmpeg.load({
        coreURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js", "text/javascript"),
        wasmURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm", "application/wasm"),
      });
      await ffmpeg.writeFile("input.webm", await fetchFile(exportBlob));
      await ffmpeg.exec(["-i", "input.webm", "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");
      const mp4Blob = new Blob([data as Uint8Array], { type: "video/mp4" });
      const url = URL.createObjectURL(mp4Blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `studio-export-${Date.now()}.mp4`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError("MP4 conversion failed. Try downloading as WebM instead.");
    } finally {
      setConverting(false); setConvertProgress(0);
    }
  }

  const capTop = captionPos === "top" ? { top: "10%" } : captionPos === "middle" ? { top: "45%" } : { bottom: "10%" };
  const sel = overlays.find(o => o.id === selOverlay) || null;

  // dark timeline styles
  const TL_BG = "#1e1e24", TL_LINE = "#3a3a44", TL_TEXT = "#cbd5e1";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@600&family=Montserrat:wght@700&family=Poppins:wght@600&display=swap" />
      <h1 className="text-2xl font-bold mb-1">Studio</h1>
      <p className="text-gray-500 mb-6">Upload a video, add captions, overlays and music on the timeline.</p>

      {!hasVideo && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center gap-4 bg-gray-50/50">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl" style={{ background: GRAD }}>▶</div>
            <p className="text-gray-500">Start by uploading a video</p>
            <label className="cursor-pointer px-5 py-2.5 rounded-xl text-white font-semibold hover:opacity-90 transition" style={{ background: GRAD }}>
              Choose video<input type="file" accept="video/*" onChange={onPick} className="hidden" />
            </label>
          </div>

          {/* Recent projects on the empty screen */}
          {projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Projects</h2>
                <button onClick={() => setShowProjects(true)} className="text-xs font-semibold" style={{ color: PURPLE }}>See all →</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {projects.slice(0, 8).map(p => (
                  <button key={p.id} onClick={() => loadProject(p)}
                    className="rounded-xl border border-gray-100 p-3 text-left transition hover:shadow-md group"
                    style={{ background: "#fff" }}>
                    <div className="w-full rounded-lg overflow-hidden mb-2 bg-gray-100 flex items-center justify-center" style={{ aspectRatio: "9/16", maxHeight: 140 }}>
                      <video src={p.video_url} muted preload="metadata" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-600 transition">{p.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{new Date(p.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {loadingProjects && <p className="text-center text-sm text-gray-400">Loading projects…</p>}
        </div>
      )}

      {hasVideo && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => { setFile(null); setVideoUrl(""); setSegments([]); setOverlays([]); setMusic(MUSIC[0]); }} className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition">← New</button>
              <button onClick={() => { fetchProjects(); setShowProjects(true); }} className="text-sm font-semibold px-3 py-2 rounded-xl border transition" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>Projects</button>
            </div>
            <div className="flex items-center gap-3">
              {saveError && <span className="text-xs text-red-500">{saveError}</span>}
              {savedAt && !saveError && <span className="text-xs text-gray-400">Saved {savedAt}</span>}
              <button onClick={saveProject} disabled={saving} className="text-sm font-semibold px-3 py-2 rounded-xl border transition disabled:opacity-50" style={{ borderColor: PURPLE, color: PURPLE }}>
                {saving ? "Saving…" : "Save"}
              </button>
              {exporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-28 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-200" style={{ width: `${exportProgress}%`, background: GRAD }} />
                  </div>
                  <span className="text-xs text-gray-500">{exportProgress}%</span>
                  <button onClick={() => { exportCancelRef.current = true; }} className="text-xs text-red-500 font-semibold">Cancel</button>
                </div>
              ) : (
                <button onClick={exportVideo} className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition hover:opacity-90" style={{ background: GRAD }}>Export</button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">
            <div className="space-y-4">
              <div ref={previewRef} className="relative rounded-2xl overflow-hidden bg-black shadow-lg aspect-[9/16]">
                {/* Video — shrinks to its half when a half overlay is active */}
                <div className="absolute left-0 w-full overflow-hidden transition-all duration-200"
                  style={{
                    height: activeHalfOverlay ? "50%" : "100%",
                    top: activeHalfOverlay?.half === "top" ? "50%" : 0,
                  }}>
                  <video ref={videoRef} src={videoUrl} controls onTimeUpdate={onTimeUpdate} onPlay={onPlay} onPause={onPause} onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
                    className="w-full h-full object-cover" />
                </div>
                {activeOverlays.map(o => (
                  o.mode === "pip" ? (
                    <img key={o.id} src={o.thumb} alt="" draggable={false}
                      onPointerDown={e => { const el = previewRef.current!; const rect = el.getBoundingClientRect(); setDragPip({ id: o.id, dx: e.clientX - (rect.left + o.x * rect.width), dy: e.clientY - (rect.top + o.y * rect.height) }); setSelOverlay(o.id); }}
                      className="absolute object-cover cursor-move"
                      style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%`, width: "32%", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.4)", border: selOverlay === o.id ? `2px solid ${PURPLE}` : "none" }} />
                  ) : o.mode === "full" ? (
                    <img key={o.id} src={o.thumb} alt="" className="absolute left-0 w-full h-full pointer-events-none" style={{ top: 0, objectFit: "cover" }} />
                  ) : (
                    // Half mode — overlay fills its half with contain (no crop), video fills the other half
                    <div key={o.id} className="absolute left-0 w-full overflow-hidden"
                      style={{ height: "50%", top: o.half === "top" ? 0 : "50%" }}>
                      <img src={o.thumb} alt="" className="w-full h-full object-cover" />
                    </div>
                  )
                ))}
                {activeText && (
                  <div className="absolute left-0 right-0 px-3 text-center pointer-events-none" style={capTop}>
                    <span className="inline-block px-2.5 py-1 rounded-md text-sm" style={{ fontFamily: font.css, color: textColor, background: showBox ? boxColor : "transparent", lineHeight: 1.25 }}>{activeText}</span>
                  </div>
                )}
              </div>
              {music.url && <audio ref={audioRef} src={music.url} loop preload="auto" />}

              {sel && (
                <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Overlay</p>
                    <button onClick={() => deleteOverlay(sel.id)} className="text-xs text-red-500">Delete</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([["full", "Full"], ["half", "Half"], ["pip", "PiP"]] as const).map(([m, label]) => (<button key={m} onClick={() => updateOverlay(sel.id, { mode: m })} className="px-2 py-1.5 rounded-lg border text-sm transition" style={sel.mode === m ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb" }}>{label}</button>))}
                  </div>
                  {sel.mode === "half" && (
                    <div className="flex gap-2">
                      {(["top", "bottom"] as const).map(h => (<button key={h} onClick={() => updateOverlay(sel.id, { half: h })} className="flex-1 px-3 py-1.5 rounded-lg border text-sm capitalize transition" style={sel.half === h ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb" }}>{h}</button>))}
                    </div>
                  )}
                  <label className="block"><span className="text-[11px] text-gray-400">Duration {sel.length.toFixed(1)}s</span>
                    <input type="range" min={1} max={10} step={0.5} value={sel.length} onChange={e => updateOverlay(sel.id, { length: parseFloat(e.target.value) })} className="w-full accent-purple-600" /></label>
                </div>
              )}

              {!hasCaptions ? (
                <div className="rounded-2xl border border-gray-100 p-4 text-center space-y-3">
                  <p className="text-sm text-gray-500">Add auto-captions to your video</p>
                  <button onClick={transcribe} disabled={status === "uploading" || status === "transcribing"} className="px-5 py-2 rounded-xl text-white font-semibold disabled:opacity-40 transition" style={{ background: GRAD }}>
                    {status === "uploading" ? "Uploading…" : status === "transcribing" ? "Transcribing…" : "Transcribe captions"}
                  </button>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-100 p-4 space-y-4">
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Font</p>
                    <div className="flex flex-wrap gap-2">{FONTS.map(f => (<button key={f.key} onClick={() => setFont(f)} className="px-3 py-1.5 rounded-lg border text-sm transition" style={font.key === f.key ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF", fontFamily: f.css } : { borderColor: "#e5e7eb", fontFamily: f.css }}>{f.label}</button>))}</div>
                  </div>
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Position</p>
                    <div className="flex gap-2">{(["top", "middle", "bottom"] as const).map(p => (<button key={p} onClick={() => setCaptionPos(p)} className="flex-1 px-3 py-1.5 rounded-lg border text-sm capitalize transition" style={captionPos === p ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb" }}>{p}</button>))}</div>
                  </div>
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Style</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <button onClick={() => setShowBox(v => !v)} className="px-3 py-1.5 rounded-lg border text-sm transition" style={showBox ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb", color: "#6b7280" }}>{showBox ? "Box: on" : "Box: off"}</button>
                      <label className="flex items-center gap-1.5 text-xs text-gray-500">Text<input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" /></label>
                      {showBox && <label className="flex items-center gap-1.5 text-xs text-gray-500">Box<input type="color" value={boxColor} onChange={e => setBoxColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" /></label>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* right column: transcript + music */}
            <div className="space-y-6">
              {hasCaptions ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-700">Transcript</h2>
                    <div className="flex items-center gap-3">
                      <button onClick={undo} disabled={!history.length} className="text-xs font-semibold px-2 py-1 rounded-lg border transition disabled:opacity-40" style={{ borderColor: "#e5e7eb", color: history.length ? PURPLE : "#9ca3af" }}>↺ Undo</button>
                      <span className="text-xs text-gray-400">{segments.length} lines</span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                    {segments.map(s => { const active = s.id === activeId; return (
                      <div key={s.id} ref={el => (rowRefs.current[s.id] = el)} className="group flex gap-3 p-3 rounded-xl border transition" style={active ? { borderColor: PURPLE, background: "#F5F2FF", boxShadow: "0 0 0 1px #7C3AED" } : { borderColor: "#f0f0f0" }}>
                        <button onClick={() => seek(s.start)} className="shrink-0 text-xs font-mono mt-1 px-1.5 py-0.5 rounded transition" style={active ? { color: PURPLE } : { color: "#9ca3af" }}>{fmt(s.start)}</button>
                        <textarea value={s.text} onFocus={pushHistory} onChange={e => editSeg(s.id, e.target.value)} onSelect={e => { caretRef.current = { id: s.id, pos: e.currentTarget.selectionStart }; }} rows={1} className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed" style={{ minHeight: 24 }} onInput={e => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }} />
                        <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => splitSeg(s.id)} className="text-[10px] px-1.5 py-0.5 rounded border text-gray-500 hover:text-purple-600">Split</button>
                          <button onClick={() => mergeUp(s.id)} disabled={s.id === 0} className="text-[10px] px-1.5 py-0.5 rounded border text-gray-500 hover:text-purple-600 disabled:opacity-30">Merge↑</button>
                        </div>
                      </div>); })}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400 p-10 text-center">Transcribe to edit captions here.</div>
              )}

              {/* Music kit */}
              <div className="rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-700">Music</h2>
                  {hasMusic && <span className="text-xs text-gray-400">drag the bar on the timeline</span>}
                </div>
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setMuteOriginal(v => !v)} className="shrink-0 px-3 py-1.5 rounded-lg border text-sm transition" style={muteOriginal ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb", color: "#6b7280" }}>
                      {muteOriginal ? "🔇" : "🔊"}
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                        <span>Original audio</span><span>{Math.round(originalVolume * 100)}%</span>
                      </div>
                      <input type="range" min={0} max={1} step={0.05} value={originalVolume}
                        disabled={muteOriginal}
                        onChange={e => {
                          const v = parseFloat(e.target.value);
                          setOriginalVolume(v);
                          if (videoRef.current) videoRef.current.volume = v;
                        }}
                        className="w-full accent-purple-600 disabled:opacity-40" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {MUSIC.map(m => (<button key={m.key} onClick={() => setMusic(m)} className="px-3 py-1.5 rounded-lg border text-sm transition" style={music.key === m.key ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb" }}>{m.label}</button>))}
                  {uploadedMusic.map(m => (
                    <span key={m.key} className="inline-flex items-center rounded-lg border text-sm overflow-hidden"
                      style={music.key === m.key ? { borderColor: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb" }}>
                      <button onClick={() => setMusic(m)} className="px-3 py-1.5" style={{ color: music.key === m.key ? PURPLE : "#374151" }}>♪ {m.label}</button>
                      <button onClick={() => { setUploadedMusic(prev => prev.filter(t => t.key !== m.key)); if (music.key === m.key) setMusic(MUSIC[0]); }}
                        className="px-2 py-1.5 text-gray-400 hover:text-red-500 border-l" style={{ borderColor: "#e5e7eb" }}>✕</button>
                    </span>
                  ))}
                  <label className="px-3 py-1.5 rounded-lg border border-dashed text-sm cursor-pointer text-gray-500 hover:border-gray-400 transition" style={{ borderColor: "#d1d5db" }}>
                    {uploadingMusic ? "Uploading…" : "+ Upload your own"}
                    <input type="file" accept="audio/*" onChange={uploadMusic} className="hidden" disabled={uploadingMusic} />
                  </label>
                </div>
                <p className="text-[11px] text-gray-400 mb-4">Only upload music you have the rights to use.</p>

                {hasMusic && (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <label className="block"><span className="text-[11px] text-gray-400">Music volume {Math.round(volume * 100)}%</span>
                        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }} className="w-full accent-purple-600" /></label>
                      <label className="block"><span className="text-[11px] text-gray-400">Start song from {fmt(songTrim)}</span>
                        <input type="range" min={0} max={60} step={1} value={songTrim} onChange={e => setSongTrim(parseInt(e.target.value))} className="w-full accent-purple-600" /></label>
                    </div>
                    <div className="flex gap-2 max-w-xs">
                      {[{ k: "in", v: fadeIn, set: setFadeIn }, { k: "out", v: fadeOut, set: setFadeOut }].map(f => (
                        <button key={f.k} onClick={() => f.set(!f.v)} className="flex-1 px-3 py-1.5 rounded-lg border text-sm transition" style={f.v ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb", color: "#6b7280" }}>Fade {f.k}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline (dark) */}
          <div className="rounded-2xl overflow-hidden border" style={{ background: TL_BG, borderColor: TL_LINE }}>
            <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${TL_LINE}` }}>
              <span className="text-sm font-semibold" style={{ color: "#fff" }}>Timeline</span>
              <span className="text-xs" style={{ color: TL_TEXT }}>{fmt(time)} / {fmt(duration)}</span>
            </div>
            <div className="flex">
              <div className="shrink-0 w-20 text-[11px]" style={{ borderRight: `1px solid ${TL_LINE}`, color: TL_TEXT }}>
                <div className="h-5" style={{ borderBottom: `1px solid ${TL_LINE}` }} />
                <div className="h-10 flex items-center px-3" style={{ borderBottom: `1px solid ${TL_LINE}` }}>Video</div>
                <div className="h-10 flex items-center px-3" style={{ borderBottom: `1px solid ${TL_LINE}` }}>Captions</div>
                <div className="h-10 flex items-center px-3 gap-1" style={{ borderBottom: `1px solid ${TL_LINE}` }}>
                  <button onClick={() => { setShowPex(true); setPexTab("pexels"); if (!pexItems.length) searchPexels(); }} className="text-[10px] font-semibold" style={{ color: "#a78bfa" }}>+ Add</button>
                </div>
                <div className="h-10 flex items-center px-3">Music</div>
              </div>
              <div ref={timelineRef} onClick={onTimelineClick} className="relative overflow-x-auto cursor-pointer select-none flex-1">
                <div ref={tracksRef} style={{ width: trackWidth, position: "relative" }}>
                  <div className="h-5 relative text-[10px]" style={{ borderBottom: `1px solid ${TL_LINE}`, color: TL_TEXT }}>
                    {Array.from({ length: Math.ceil(duration) + 1 }).map((_, s) => (<span key={s} className="absolute top-0.5" style={{ left: s * PX_PER_SEC }}>{s}s</span>))}
                  </div>
                  {/* Video */}
                  <div className="h-10 p-1" style={{ borderBottom: `1px solid ${TL_LINE}` }}>
                    <div className="h-full rounded-lg flex items-center px-3 text-xs text-white font-medium overflow-hidden" style={{ width: Math.max(trackWidth - 8, 60), background: GRAD }}>{file?.name || "video.mp4"}</div>
                  </div>
                  {/* Captions */}
                  <div className="h-10 relative" style={{ borderBottom: `1px solid ${TL_LINE}` }}>
                    {segments.map(s => (<div key={s.id} className="absolute top-1 bottom-1 rounded overflow-hidden text-[9px] px-1 flex items-center" style={{ left: s.start * PX_PER_SEC, width: Math.max((s.end - s.start) * PX_PER_SEC, 10), background: "#4c1d95", color: "#ede9fe" }}>{s.text.slice(0, 12)}</div>))}
                  </div>
                  {/* Overlays */}
                  <div className="h-10 relative" style={{ borderBottom: `1px solid ${TL_LINE}` }}>
                    {overlays.map(o => (
                      <div key={o.id} onPointerDown={e => { e.stopPropagation(); const el = tracksRef.current!; const rect = el.getBoundingClientRect(); const blockX = o.start * PX_PER_SEC; setDragOverlay({ id: o.id, dx: (e.clientX - rect.left + el.scrollLeft) - blockX }); setSelOverlay(o.id); }}
                        className="absolute top-1 bottom-1 rounded overflow-hidden cursor-grab active:cursor-grabbing border-2" style={{ left: o.start * PX_PER_SEC, width: Math.max(o.length * PX_PER_SEC, 16), borderColor: selOverlay === o.id ? PURPLE : "transparent" }}>
                        <img src={o.thumb} alt="" className="w-full h-full object-cover pointer-events-none" />
                        {o.kind === "video" && <span className="absolute top-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 rounded">▶</span>}
                        <button onClick={e => { e.stopPropagation(); deleteOverlay(o.id); }} onPointerDown={e => e.stopPropagation()} className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-black/70 text-white text-[9px] leading-none hover:bg-red-500">✕</button>
                      </div>
                    ))}
                  </div>
                  {/* Music */}
                  <div className="h-10 relative">
                    {hasMusic && (
                      <div onPointerDown={e => { e.stopPropagation(); setDragMusic(true); }}
                        className="absolute top-1 bottom-1 rounded cursor-grab active:cursor-grabbing flex items-center px-2 text-[10px] text-white font-semibold overflow-hidden"
                        style={{ left: musicStart * PX_PER_SEC, width: Math.max((duration - musicStart) * PX_PER_SEC, 40), background: GRAD }}>
                        ♪ {music.label}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none" style={{ left: time * PX_PER_SEC }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media browser (Pexels + Upload) */}
      {showPex && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowPex(false)}>
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

            {/* Tab bar */}
            <div className="px-4 pt-4 flex items-center gap-2 border-b border-gray-100 pb-0">
              {(["pexels", "upload"] as const).map(tab => (
                <button key={tab} onClick={() => setPexTab(tab)}
                  className="px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition capitalize"
                  style={pexTab === tab ? { borderColor: PURPLE, color: PURPLE } : { borderColor: "transparent", color: "#9ca3af" }}>
                  {tab === "pexels" ? "Pexels" : "Upload yours"}
                </button>
              ))}
              <button onClick={() => setShowPex(false)} className="ml-auto px-2 text-gray-400 text-xl pb-2">✕</button>
            </div>

            {pexTab === "pexels" && (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <input value={pexQ} onChange={e => setPexQ(e.target.value)} onKeyDown={e => e.key === "Enter" && searchPexels()} placeholder="Search Pexels…" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm text-gray-900 placeholder-gray-400 bg-white" />
                  <div className="flex gap-1">{(["photo", "video"] as const).map(t => (<button key={t} onClick={() => setPexType(t)} className="px-3 py-2 rounded-lg border text-sm capitalize" style={pexType === t ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb" }}>{t}</button>))}</div>
                  <button onClick={searchPexels} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: GRAD }}>Search</button>
                </div>
                <div className="p-4 overflow-y-auto">
                  {pexLoading ? <p className="text-center text-gray-400 text-sm py-10">Searching…</p> : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {pexItems.map(it => (<button key={it.id} onClick={() => addOverlay(it)} className="relative aspect-[9/16] rounded-lg overflow-hidden border border-gray-100 hover:border-purple-400 transition"><img src={it.thumb} alt="" className="w-full h-full object-cover" />{it.kind === "video" && <span className="absolute top-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">▶ video</span>}</button>))}
                      {!pexItems.length && <p className="col-span-full text-center text-gray-400 text-sm py-10">Search Pexels for images or videos to overlay.</p>}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 mt-3">Media from Pexels — free to use. PiP or full-frame is set per overlay after adding.</p>
                </div>
              </>
            )}

            {pexTab === "upload" && (
              <div className="p-8 flex flex-col items-center justify-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#F5F2FF" }}>🖼️</div>
                <p className="font-semibold text-gray-700">Upload an image or video</p>
                <p className="text-sm text-gray-400 text-center max-w-xs">It will be added to the timeline at the current playhead position as an overlay.</p>
                <label className="cursor-pointer px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition" style={{ background: uploadingOverlay ? "#a78bfa" : GRAD }}>
                  {uploadingOverlay ? "Uploading…" : "Choose file"}
                  <input type="file" accept="image/*,video/*" onChange={uploadOverlayFile} className="hidden" disabled={uploadingOverlay} />
                </label>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <p className="text-[11px] text-gray-400">Supports JPG, PNG, GIF, MP4, MOV and more.</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Projects slide-over panel */}
      {showProjects && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowProjects(false)} />
          <div className="w-80 bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="font-bold text-gray-800">My Projects</h2>
              <button onClick={() => setShowProjects(false)} className="text-gray-400 text-xl hover:text-gray-600">✕</button>
            </div>
            {loadingProjects ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
            ) : projects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm px-6 text-center">
                <span className="text-3xl">📁</span>
                <p>No saved projects yet.</p>
                <p className="text-xs">Save a project from the editor and it will appear here.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {projects.map(p => (
                  <button key={p.id} onClick={() => loadProject(p)}
                    className="w-full p-4 text-left hover:bg-purple-50 transition flex gap-3 items-center">
                    <div className="w-12 shrink-0 rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: "9/16" }}>
                      <video src={p.video_url} muted preload="metadata" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(p.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {p.data?.segments?.length > 0 && (
                        <p className="text-[10px] text-purple-400 mt-0.5">{p.data.segments.length} caption lines</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-semibold" style={{ color: PURPLE }}>Open →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export preview modal */}
      {exportPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center gap-4 p-6 w-full max-w-sm">
            <p className="font-bold text-gray-800 text-lg">Export Preview</p>
            <video src={exportPreviewUrl} controls autoPlay className="w-full rounded-xl" style={{ maxHeight: "55vh" }} />

            {/* MP4 conversion progress */}
            {converting && (
              <div className="w-full space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Converting to MP4…</span><span>{convertProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-200" style={{ width: `${convertProgress}%`, background: GRAD }} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={convertToMp4}
                disabled={converting}
                className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition hover:opacity-90"
                style={{ background: GRAD }}>
                {converting ? `Converting… ${convertProgress}%` : "Download as MP4"}
              </button>
              <button
                onClick={() => {
                  const a = document.createElement("a"); a.href = exportPreviewUrl;
                  a.download = `studio-export-${Date.now()}.webm`; a.click();
                }}
                disabled={converting}
                className="w-full py-2.5 rounded-xl border text-sm font-semibold text-gray-600 disabled:opacity-50"
                style={{ borderColor: "#e5e7eb" }}>
                Download as WebM
              </button>
              <button
                onClick={() => { URL.revokeObjectURL(exportPreviewUrl); setExportPreviewUrl(null); setExportBlob(null); }}
                disabled={converting}
                className="w-full py-2 text-xs text-gray-400 disabled:opacity-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}