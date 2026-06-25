// VideoCaptioner.tsx — transcript-style caption editor + music sync
// Upload video -> transcribe -> edit captions -> style font -> add & sync music -> export.

import React, { useState, useRef, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase"; // <-- adjust import to your project

const API = import.meta.env.VITE_API_URL;
const PURPLE = "#7C3AED";
const GRAD = "linear-gradient(135deg, #7C3AED, #6D28D9)";

type Word = { id: number; start: number; end: number; text: string };
type Segment = { id: number; start: number; end: number; text: string };
type Project = { id: string; name: string; video_url: string; updated_at: string };

const FONTS = [
  { key: "Poppins", label: "Poppins", css: "'Poppins', sans-serif" },
  { key: "Montserrat", label: "Montserrat", css: "'Montserrat', sans-serif" },
  { key: "Anton", label: "Anton", css: "'Anton', sans-serif" },
  { key: "BebasNeue", label: "Bebas Neue", css: "'Bebas Neue', sans-serif" },
  { key: "Inter", label: "Inter", css: "'Inter', sans-serif" },
];

// Preset music library — paste your own hosted royalty-free MP3 URLs.
const MUSIC = [
  { key: "none", label: "No music", url: "" },
  { key: "upbeat", label: "Upbeat", url: "" },
  { key: "chill", label: "Chill", url: "" },
  { key: "cinematic", label: "Cinematic", url: "" },
  { key: "lofi", label: "Lo-fi", url: "" },
];

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

function buildSegments(words: Word[]): Segment[] {
  const out: Segment[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({ id: out.length, start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map(w => w.text).join(" ") });
    cur = [];
  };
  for (let i = 0; i < words.length; i++) {
    cur.push(words[i]);
    const next = words[i + 1];
    const gap = next ? next.start - words[i].end : 99;
    if (gap > 0.6 || cur.length >= 8) flush();
  }
  flush();
  return out;
}

// Build an SRT subtitle file from the edited segments, rebased for trimming
function srtTime(sec: number): string {
  const ms = Math.floor((sec % 1) * 1000);
  const s = Math.floor(sec) % 60;
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(h)}:${p(m)}:${p(s)},${p(ms, 3)}`;
}
function buildSRT(segs: Segment[], trimStart = 0, trimEnd = Infinity): string {
  return segs
    .filter(s => s.text.trim() && s.end > s.start && s.end > trimStart && s.start < trimEnd)
    .map((s) => {
      const st = Math.max(0, s.start - trimStart);
      const en = Math.max(st + 0.1, Math.min(s.end, trimEnd) - trimStart);
      return { st, en, text: s.text.trim() };
    })
    .map((s, i) => `${i + 1}\n${srtTime(s.st)} --> ${srtTime(s.en)}\n${s.text}`)
    .join("\n\n") + "\n";
}
// Re-number segment ids after structural edits (split/merge)
function reindex(segs: Segment[]): Segment[] {
  return segs.map((s, i) => ({ ...s, id: i }));
}

export default function VideoCaptioner() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [hostedUrl, setHostedUrl] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [font, setFont] = useState(FONTS[0]);
  const [music, setMusic] = useState(MUSIC[0]);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "transcribing" | "ready" | "rendering" | "done">("idle");
  const [exportUrl, setExportUrl] = useState("");
  const [error, setError] = useState("");

  // Music sync controls
  const [musicStart, setMusicStart] = useState(0); // seconds into the video where music begins
  const [songTrim, setSongTrim] = useState(0);     // seconds skipped into the song
  const [volume, setVolume] = useState(0.25);      // 0..1
  const [fadeIn, setFadeIn] = useState(true);
  const [fadeOut, setFadeOut] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [muteOriginal, setMuteOriginal] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [captionPos, setCaptionPos] = useState<"top" | "middle" | "bottom">("bottom");
  const [showBox, setShowBox] = useState(true);
  const [textColor, setTextColor] = useState("#ffffff");
  const [boxColor, setBoxColor] = useState("#000000");
  const [history, setHistory] = useState<Segment[][]>([]);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [trimDrag, setTrimDrag] = useState<"start" | "end" | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const trimRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<{ id: number; pos: number } | null>(null);

  const hasMusic = music.key !== "none";

  const activeId = useMemo(() => {
    const seg = segments.find(s => time >= s.start && time < s.end);
    return seg ? seg.id : null;
  }, [segments, time]);
  const activeText = activeId != null ? segments.find(s => s.id === activeId)?.text : "";

  useEffect(() => {
    if (activeId != null) rowRefs.current[activeId]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume, music]);
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muteOriginal; }, [muteOriginal]);

  // Dragging the music block on the mini timeline
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const el = trackRef.current; if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      setMusicStart(Math.round(ratio * duration * 10) / 10);
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragging, duration]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setVideoUrl(URL.createObjectURL(picked));
    setSegments([]); setExportUrl(""); setStatus("idle"); setError("");
  }

  async function transcribe() {
    if (!file) return;
    setError(""); setStatus("uploading");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");

      const path = `captions/${session.user.id}/${Date.now()}.mp4`;
      const { error: upErr } = await supabase.storage
        .from("insta-media").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
      setHostedUrl(pub.publicUrl);

      setStatus("transcribing");
      const res = await fetch(`${API}/api/captioner/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ videoUrl: pub.publicUrl }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Transcription failed");
      }
      const { transcriptId } = await res.json();
      if (!transcriptId) throw new Error("Transcription did not start");

      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const sRes = await fetch(`${API}/api/captioner/transcribe/${transcriptId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const s = await sRes.json();
        if (s.status === "completed") {
          const segs = buildSegments(s.words || []);
          setSegments(segs);
          setStatus("ready");
          // Persist as a new project right away
          const { data: ins } = await supabase.from("caption_projects").insert({
            user_id: session.user.id,
            name: (segs[0]?.text || "Untitled").slice(0, 40),
            video_url: pub.publicUrl,
            data: { segments: segs, font: font.key, captionPos, showBox, textColor, boxColor,
              music, musicStart, songTrim, volume, fadeIn, fadeOut, muteOriginal, trimStart, trimEnd },
          }).select("id").single();
          if (ins) { setCurrentProjectId(ins.id); loadProjects(); }
          return;
        }
        if (s.status === "error") throw new Error("Transcription failed");
      }
      throw new Error("Transcription timed out");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Try a shorter clip.";
      setError(msg); setStatus("idle");
    }
  }

  function onTimeUpdate() {
    const v = videoRef.current; const a = audioRef.current; if (!v) return;
    // Keep playback inside the trimmed region
    if (trimEnd > 0 && v.currentTime > trimEnd) { v.currentTime = trimStart; }
    if (v.currentTime < trimStart - 0.1) { v.currentTime = trimStart; }
    setTime(v.currentTime);
    if (a && hasMusic && music.url) {
      a.volume = volume; // keep music volume in sync every tick
      if (v.currentTime >= musicStart) {
        const target = songTrim + (v.currentTime - musicStart);
        if (Math.abs(a.currentTime - target) > 0.3) a.currentTime = target;
        if (a.paused && !v.paused) a.play().catch(() => {});
      } else if (!a.paused) {
        a.pause();
      }
    }
  }
  function onPlay()  { const v = videoRef.current, a = audioRef.current; if (a && hasMusic && music.url && v && v.currentTime >= musicStart) { a.volume = volume; a.play().catch(() => {}); } }
  function onPause() { if (audioRef.current) audioRef.current.pause(); }

  function seek(t: number) { if (videoRef.current) videoRef.current.currentTime = t; }
  function editSeg(id: number, text: string) {
    setSegments(prev => prev.map(s => (s.id === id ? { ...s, text } : s)));
  }

  // ---- Undo ----
  function pushHistory() {
    setHistory(h => {
      const snap = JSON.stringify(segments);
      if (h.length && JSON.stringify(h[h.length - 1]) === snap) return h;
      return [...h.slice(-49), JSON.parse(snap)];
    });
  }
  function undo() {
    setHistory(h => {
      if (!h.length) return h;
      setSegments(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ---- Split / merge caption lines ----
  function splitSeg(id: number) {
    const seg = segments.find(s => s.id === id); if (!seg) return;
    const pos = caretRef.current && caretRef.current.id === id
      ? caretRef.current.pos : Math.floor(seg.text.length / 2);
    const before = seg.text.slice(0, pos).trim();
    const after = seg.text.slice(pos).trim();
    if (!before || !after) return;
    pushHistory();
    const ratio = pos / seg.text.length;
    const mid = seg.start + (seg.end - seg.start) * ratio;
    const idx = segments.findIndex(s => s.id === id);
    const next = [...segments];
    next.splice(idx, 1,
      { ...seg, text: before, end: mid },
      { id: -1, start: mid, end: seg.end, text: after });
    setSegments(reindex(next));
  }
  function mergeUp(id: number) {
    const idx = segments.findIndex(s => s.id === id);
    if (idx <= 0) return;
    pushHistory();
    const prev = segments[idx - 1], cur = segments[idx];
    const merged = { ...prev, text: `${prev.text} ${cur.text}`.trim(), end: cur.end };
    const next = [...segments];
    next.splice(idx - 1, 2, merged);
    setSegments(reindex(next));
  }

  // ---- Trim ----
  useEffect(() => { if (duration && trimEnd === 0) setTrimEnd(duration); }, [duration]);
  useEffect(() => {
    if (!trimDrag) return;
    const move = (e: PointerEvent) => {
      const el = trimRef.current; if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const t = Math.min(duration, Math.max(0, ((e.clientX - rect.left) / rect.width) * duration));
      if (trimDrag === "start") setTrimStart(Math.min(t, trimEnd - 0.5));
      else setTrimEnd(Math.max(t, trimStart + 0.5));
    };
    const up = () => setTrimDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [trimDrag, duration, trimStart, trimEnd]);

  // Upload the user's own music to Supabase and select it
  async function uploadMusic(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingMusic(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const path = `music/${session.user.id}/${Date.now()}-${f.name.replace(/[^\w.]/g, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("insta-media").upload(path, f, { upsert: true, contentType: f.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
      setMusic({ key: "custom", label: f.name.slice(0, 18), url: pub.publicUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't upload that track.";
      setError(msg);
    } finally {
      setUploadingMusic(false);
    }
  }

  async function exportVideo() {
    if (!hostedUrl || segments.length === 0) return;
    setError(""); setStatus("rendering"); setExportUrl("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");

      // Build an SRT from the edited captions (rebased for trim) and host it
      const tEnd = trimEnd || videoRef.current?.duration || 0;
      const srt = buildSRT(segments, trimStart, tEnd);
      const srtPath = `captions/${session.user.id}/${Date.now()}.srt`;
      const { error: srtErr } = await supabase.storage
        .from("insta-media").upload(srtPath, new Blob([srt], { type: "text/plain" }),
          { upsert: true, contentType: "text/plain" });
      if (srtErr) throw srtErr;
      const { data: srtPub } = supabase.storage.from("insta-media").getPublicUrl(srtPath);

      const res = await fetch(`${API}/api/captioner/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          videoUrl: hostedUrl, srtUrl: srtPub.publicUrl,
          duration: videoRef.current?.duration,
          trimStart, trimEnd: tEnd,
          muteOriginal,
          captionPos, showBox, textColor, boxColor,
          watermark: true, // free tier — flip to false for paid users later
          music: hasMusic && /^https?:\/\//.test(music.url || "")
            ? { url: music.url, startInVideo: musicStart, songTrim, volume, fadeIn, fadeOut }
            : undefined,
        }),
      });
      const { renderId } = await res.json();
      if (!renderId) throw new Error("Export did not start");
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const sRes = await fetch(`${API}/api/captioner/render/${renderId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const s = await sRes.json();
        if (s.status === "done" && s.url) { setExportUrl(s.url); setStatus("done"); return; }
        if (s.status === "failed") throw new Error("Export failed");
      }
      throw new Error("Export timed out");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed, please try again.";
      setError(msg); setStatus("ready");
    }
  }

  const hasProject = segments.length > 0;

  // ---- Projects: load list, open, new, delete, autosave ----
  async function loadProjects() {
    const { data } = await supabase.from("caption_projects")
      .select("id,name,video_url,updated_at").order("updated_at", { ascending: false });
    setProjects(data || []);
  }
  useEffect(() => { loadProjects(); }, []);

  function currentData() {
    return {
      segments, font: font.key, captionPos, showBox, textColor, boxColor,
      music, musicStart, songTrim, volume, fadeIn, fadeOut, muteOriginal, trimStart, trimEnd,
    };
  }

  async function saveProject(silent = false) {
    if (!hostedUrl || !segments.length) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const payload = {
      user_id: session.user.id,
      name: (segments[0]?.text || "Untitled").slice(0, 40),
      video_url: hostedUrl,
      data: currentData(),
      updated_at: new Date().toISOString(),
    };
    if (currentProjectId) {
      await supabase.from("caption_projects").update(payload).eq("id", currentProjectId);
    } else {
      const { data: ins } = await supabase.from("caption_projects").insert(payload).select("id").single();
      if (ins) setCurrentProjectId(ins.id);
    }
    setSavedAt(new Date().toLocaleTimeString());
    if (!silent) loadProjects();
  }

  // Autosave edits to the open project (debounced)
  useEffect(() => {
    if (!currentProjectId || !hasProject) return;
    const t = setTimeout(() => saveProject(true), 1500);
    return () => clearTimeout(t);
  }, [segments, font, captionPos, showBox, textColor, boxColor, music, musicStart, songTrim, volume, fadeIn, fadeOut, muteOriginal, trimStart, trimEnd]);

  async function openProject(id: string) {
    const { data: p } = await supabase.from("caption_projects").select("*").eq("id", id).single();
    if (!p) return;
    const d = p.data || {};
    setCurrentProjectId(p.id);
    setHostedUrl(p.video_url); setVideoUrl(p.video_url); setFile(null);
    setSegments(d.segments || []);
    setFont(FONTS.find(f => f.key === d.font) || FONTS[0]);
    setCaptionPos(d.captionPos || "bottom");
    setShowBox(d.showBox ?? true);
    setTextColor(d.textColor || "#ffffff"); setBoxColor(d.boxColor || "#000000");
    setMusic(d.music || MUSIC[0]); setMusicStart(d.musicStart || 0); setSongTrim(d.songTrim || 0);
    setVolume(d.volume ?? 0.25); setFadeIn(d.fadeIn ?? true); setFadeOut(d.fadeOut ?? true);
    setMuteOriginal(d.muteOriginal || false);
    setTrimStart(d.trimStart || 0); setTrimEnd(d.trimEnd || 0);
    setHistory([]); setExportUrl(""); setError(""); setStatus("ready");
  }

  function newProject() {
    setCurrentProjectId(null); setFile(null); setVideoUrl(""); setHostedUrl("");
    setSegments([]); setExportUrl(""); setStatus("idle"); setError("");
    setTrimStart(0); setTrimEnd(0); setHistory([]); setMusic(MUSIC[0]);
  }

  async function deleteProject(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await supabase.from("caption_projects").delete().eq("id", id);
    if (id === currentProjectId) newProject();
    loadProjects();
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@600&family=Montserrat:wght@700&family=Poppins:wght@600&display=swap" />

      <h1 className="text-2xl font-bold mb-1">Captions</h1>
      <p className="text-gray-500 mb-6">
        Upload a video, auto-transcribe it, fix the words like a doc, style it, sync music, and export.
      </p>

      {!hasProject && (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center gap-4 bg-gray-50/50">
          {videoUrl
            ? <video ref={videoRef} src={videoUrl} controls onLoadedMetadata={e => { setTime(0); setDuration(e.currentTarget.duration); }}
                className="w-48 rounded-xl bg-black aspect-[9/16] object-contain shadow-lg" />
            : <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl" style={{ background: GRAD }}>▶</div>}
          <label className="cursor-pointer px-5 py-2.5 rounded-xl text-white font-semibold hover:opacity-90 transition" style={{ background: GRAD }}>
            Choose video
            <input type="file" accept="video/*" onChange={onPick} className="hidden" />
          </label>
          <button onClick={transcribe} disabled={!file || status === "uploading" || status === "transcribing"}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold disabled:opacity-40 transition">
            {status === "uploading" ? "Uploading…" : status === "transcribing" ? "Transcribing…" : "Transcribe"}
          </button>
          <p className="text-xs text-gray-400">Most short reels work in well under a minute.</p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {/* Saved projects list (shown on the start screen) */}
      {!hasProject && projects.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-700 mb-3">Your projects</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {projects.map(p => (
              <div key={p.id} onClick={() => openProject(p.id)}
                className="group relative rounded-xl border border-gray-100 p-3 cursor-pointer hover:border-purple-300 transition">
                <div className="aspect-video rounded-lg bg-black mb-2 overflow-hidden">
                  <video src={p.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                </div>
                <p className="text-sm font-medium truncate">{p.name || "Untitled"}</p>
                <p className="text-[11px] text-gray-400">{new Date(p.updated_at).toLocaleDateString()}</p>
                <button onClick={e => deleteProject(p.id, e)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 border text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition hover:text-red-500">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasProject && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={newProject}
              className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition">
              ← Projects
            </button>
            <div className="flex items-center gap-3">
              {savedAt && <span className="text-xs text-gray-400">Saved {savedAt}</span>}
              <button onClick={() => saveProject(false)}
                className="text-sm font-semibold px-3 py-1.5 rounded-lg border transition"
                style={{ borderColor: PURPLE, color: PURPLE }}>
                Save
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">

          {/* Left: preview + style + music sync */}
          <div className="md:sticky md:top-6 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
              <video ref={videoRef} src={videoUrl} controls
                onTimeUpdate={onTimeUpdate} onPlay={onPlay} onPause={onPause}
                onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
                className="w-full aspect-[9/16] object-contain" />
              {activeText && (
                <div className="absolute left-0 right-0 px-3 text-center pointer-events-none"
                  style={captionPos === "top" ? { top: "10%" } : captionPos === "middle" ? { top: "45%" } : { bottom: "10%" }}>
                  <span className="inline-block px-2.5 py-1 rounded-md text-sm"
                    style={{
                      fontFamily: font.css,
                      color: textColor,
                      background: showBox ? boxColor : "transparent",
                      lineHeight: 1.25,
                    }}>
                    {activeText}
                  </span>
                </div>
              )}
            </div>

            {/* Trim */}
            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Trim {fmt(trimStart)} – {fmt(trimEnd || duration)}</span>
                <span>drag ends</span>
              </div>
              <div ref={trimRef} className="relative h-8 rounded-lg bg-gray-100 overflow-hidden select-none">
                {/* kept region */}
                <div className="absolute top-0 bottom-0"
                  style={{
                    left: `${duration ? (trimStart / duration) * 100 : 0}%`,
                    width: `${duration ? (((trimEnd || duration) - trimStart) / duration) * 100 : 100}%`,
                    background: "rgba(124,58,237,0.18)", border: "1px solid #7C3AED",
                  }} />
                {/* start handle */}
                <div onPointerDown={() => setTrimDrag("start")}
                  className="absolute top-0 bottom-0 w-2 rounded cursor-ew-resize"
                  style={{ left: `${duration ? (trimStart / duration) * 100 : 0}%`, background: PURPLE }} />
                {/* end handle */}
                <div onPointerDown={() => setTrimDrag("end")}
                  className="absolute top-0 bottom-0 w-2 rounded cursor-ew-resize -ml-2"
                  style={{ left: `${duration ? ((trimEnd || duration) / duration) * 100 : 100}%`, background: PURPLE }} />
                {/* playhead */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                  style={{ left: `${duration ? (time / duration) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Font</p>
                <div className="flex flex-wrap gap-2">
                  {FONTS.map(f => (
                    <button key={f.key} onClick={() => setFont(f)}
                      className="px-3 py-1.5 rounded-lg border text-sm transition"
                      style={font.key === f.key
                        ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF", fontFamily: f.css }
                        : { borderColor: "#e5e7eb", fontFamily: f.css }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Caption position</p>
                <div className="flex gap-2">
                  {(["top", "middle", "bottom"] as const).map(p => (
                    <button key={p} onClick={() => setCaptionPos(p)}
                      className="flex-1 px-3 py-1.5 rounded-lg border text-sm capitalize transition"
                      style={captionPos === p
                        ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" }
                        : { borderColor: "#e5e7eb" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Caption style</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <button onClick={() => setShowBox(v => !v)}
                    className="px-3 py-1.5 rounded-lg border text-sm transition"
                    style={showBox
                      ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" }
                      : { borderColor: "#e5e7eb", color: "#6b7280" }}>
                    {showBox ? "Box: on" : "Box: off"}
                  </button>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500">
                    Text
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                  </label>
                  {showBox && (
                    <label className="flex items-center gap-1.5 text-xs text-gray-500">
                      Box
                      <input type="color" value={boxColor} onChange={e => setBoxColor(e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {exportUrl ? (
              <div className="space-y-2">
                <video src={exportUrl} controls className="w-full rounded-xl" />
                <a href={exportUrl} download className="block text-center text-sm font-semibold text-purple-700">Download video ↓</a>
              </div>
            ) : (
              <button onClick={exportVideo} disabled={status === "rendering"}
                className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-40 transition" style={{ background: GRAD }}>
                {status === "rendering" ? "Exporting… (~1 min)" : "Export video"}
              </button>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {/* Right: transcript editor + music studio */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-700">Transcript</h2>
                <div className="flex items-center gap-3">
                  <button onClick={undo} disabled={!history.length}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border transition disabled:opacity-40"
                    style={{ borderColor: "#e5e7eb", color: history.length ? PURPLE : "#9ca3af" }}>
                    ↺ Undo
                  </button>
                  <span className="text-xs text-gray-400">{segments.length} lines</span>
                </div>
              </div>
              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {segments.map(s => {
                  const active = s.id === activeId;
                  return (
                    <div key={s.id} ref={el => (rowRefs.current[s.id] = el)}
                      className="group flex gap-3 p-3 rounded-xl border transition"
                      style={active
                        ? { borderColor: PURPLE, background: "#F5F2FF", boxShadow: "0 0 0 1px #7C3AED" }
                        : { borderColor: "#f0f0f0" }}>
                      <button onClick={() => seek(s.start)}
                        className="shrink-0 text-xs font-mono mt-1 px-1.5 py-0.5 rounded transition"
                        style={active ? { color: PURPLE } : { color: "#9ca3af" }}>
                        {fmt(s.start)}
                      </button>
                      <textarea value={s.text}
                        onFocus={pushHistory}
                        onChange={e => editSeg(s.id, e.target.value)}
                        onSelect={e => { caretRef.current = { id: s.id, pos: e.currentTarget.selectionStart }; }}
                        rows={1}
                        className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
                        style={{ minHeight: 24 }}
                        onInput={e => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }} />
                      <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => splitSeg(s.id)} title="Split at cursor"
                          className="text-[10px] px-1.5 py-0.5 rounded border text-gray-500 hover:text-purple-600">Split</button>
                        <button onClick={() => mergeUp(s.id)} title="Merge into line above" disabled={s.id === 0}
                          className="text-[10px] px-1.5 py-0.5 rounded border text-gray-500 hover:text-purple-600 disabled:opacity-30">Merge↑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Music studio — fills the wide space */}
            <div className="rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-700">Music</h2>
                {hasMusic && <span className="text-xs text-gray-400">drag the bar to set where music starts</span>}
              </div>

              {/* Mute original audio — independent of music choice */}
              <button onClick={() => setMuteOriginal(v => !v)}
                className="mb-4 px-3 py-1.5 rounded-lg border text-sm transition flex items-center gap-2"
                style={muteOriginal
                  ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" }
                  : { borderColor: "#e5e7eb", color: "#6b7280" }}>
                {muteOriginal ? "🔇 Original audio muted" : "🔊 Original audio on"}
              </button>

              <div className="flex flex-wrap gap-2 mb-2">
                {MUSIC.map(m => (
                  <button key={m.key} onClick={() => setMusic(m)}
                    className="px-3 py-1.5 rounded-lg border text-sm transition"
                    style={music.key === m.key
                      ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" }
                      : { borderColor: "#e5e7eb" }}>
                    {m.label}
                  </button>
                ))}
                {/* custom track pill, shown once uploaded */}
                {music.key === "custom" && (
                  <span className="px-3 py-1.5 rounded-lg border text-sm"
                    style={{ borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" }}>
                    ♪ {music.label}
                  </span>
                )}
                <label className="px-3 py-1.5 rounded-lg border border-dashed text-sm cursor-pointer text-gray-500 hover:border-gray-400 transition"
                  style={{ borderColor: "#d1d5db" }}>
                  {uploadingMusic ? "Uploading…" : "+ Upload your own"}
                  <input type="file" accept="audio/*" onChange={uploadMusic} className="hidden" disabled={uploadingMusic} />
                </label>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">
                Only upload music you have the rights to use. You're responsible for what you add.
              </p>
              {music.url && <audio ref={audioRef} src={music.url} loop preload="auto" />}

              {hasMusic && (
                <div className="space-y-5">
                  {/* Mini timeline */}
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Music starts at {fmt(musicStart)}</span>
                      <span>video {fmt(duration)}</span>
                    </div>
                    <div ref={trackRef} className="relative h-10 rounded-lg bg-gray-100 overflow-hidden">
                      <div
                        onPointerDown={() => setDragging(true)}
                        className="absolute top-0 bottom-0 rounded-lg cursor-grab active:cursor-grabbing flex items-center px-3 text-xs text-white font-semibold"
                        style={{
                          left: `${duration ? (musicStart / duration) * 100 : 0}%`,
                          width: `${duration ? ((duration - musicStart) / duration) * 100 : 100}%`,
                          background: GRAD,
                        }}>
                        ♪ {music.label}
                      </div>
                      <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                        style={{ left: `${duration ? (time / duration) * 100 : 0}%` }} />
                    </div>
                  </div>

                  {/* Sliders side by side */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <label className="block">
                      <span className="text-[11px] text-gray-400">Music volume {Math.round(volume * 100)}%</span>
                      <input type="range" min={0} max={1} step={0.05} value={volume}
                        onChange={e => { const val = parseFloat(e.target.value); setVolume(val); if (audioRef.current) audioRef.current.volume = val; }}
                        className="w-full accent-purple-600" />
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-gray-400">Start song from {fmt(songTrim)}</span>
                      <input type="range" min={0} max={60} step={1} value={songTrim}
                        onChange={e => setSongTrim(parseInt(e.target.value))}
                        className="w-full accent-purple-600" />
                    </label>
                  </div>

                  {/* Fades */}
                  <div className="flex gap-2 max-w-xs">
                    {[{ k: "in", v: fadeIn, set: setFadeIn }, { k: "out", v: fadeOut, set: setFadeOut }].map(f => (
                      <button key={f.k} onClick={() => f.set(!f.v)}
                        className="flex-1 px-3 py-1.5 rounded-lg border text-sm transition"
                        style={f.v ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb", color: "#6b7280" }}>
                        Fade {f.k}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}