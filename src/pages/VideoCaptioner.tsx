// VideoCaptioner.tsx — timeline caption editor
// Route at /captions. Upload video -> transcribe -> edit on a multi-track
// timeline (video layer + word layer) -> pick font/music -> export.
// Captions preview live in the browser; only Export hits the cloud renderer.

import { useState, useRef, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase"; // <-- adjust import to your project

const API = import.meta.env.VITE_API_URL;
const PX_PER_SEC = 90; // timeline zoom

type Word = { id: number; start: number; end: number; text: string };
type Line = { start: number; end: number; text: string };

const FONTS = [
  { key: "Poppins", label: "Poppins", css: "'Poppins', sans-serif" },
  { key: "Montserrat", label: "Montserrat", css: "'Montserrat', sans-serif" },
  { key: "Anton", label: "Anton", css: "'Anton', sans-serif" },
  { key: "BebasNeue", label: "Bebas Neue", css: "'Bebas Neue', sans-serif" },
  { key: "Inter", label: "Inter", css: "'Inter', sans-serif" },
];

// Curated background music. Replace url with your own hosted royalty-free MP3s.
const MUSIC = [
  { key: "none", label: "No music", url: "" },
  { key: "upbeat", label: "Upbeat", url: process.env.MUSIC_UPBEAT || "" },
  { key: "chill", label: "Chill", url: process.env.MUSIC_CHILL || "" },
  { key: "cinematic", label: "Cinematic", url: process.env.MUSIC_CINEMATIC || "" },
];

export default function VideoCaptioner() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [hostedUrl, setHostedUrl] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [font, setFont] = useState(FONTS[0]);
  const [music, setMusic] = useState(MUSIC[0]);
  const [tab, setTab] = useState<"tracks" | "font" | "music">("tracks");
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "transcribing" | "ready" | "rendering" | "done">("idle");
  const [exportUrl, setExportUrl] = useState("");
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Caption lines derived from words (single source of truth). Group by gaps.
  const lines: Line[] = useMemo(() => {
    if (!words.length) return [];
    const out: Line[] = [];
    let cur: Word[] = [];
    const flush = () => {
      if (!cur.length) return;
      out.push({ start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map(w => w.text).join(" ") });
      cur = [];
    };
    for (let i = 0; i < words.length; i++) {
      cur.push(words[i]);
      const next = words[i + 1];
      const gap = next ? next.start - words[i].end : 99;
      if (gap > 0.6 || cur.length >= 7) flush();
    }
    flush();
    return out;
  }, [words]);

  const activeLine = lines.find(l => time >= l.start && time < l.end);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setVideoUrl(URL.createObjectURL(picked));
    setWords([]); setExportUrl(""); setStatus("idle");
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
      const data = await res.json();
      setWords(data.words || []);
      setStatus("ready");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Keep clips under 25MB and try again.");
      setStatus("idle");
    }
  }

  // Keep playhead + music in sync with the video
  function onTimeUpdate() {
    const v = videoRef.current; if (!v) return;
    setTime(v.currentTime);
    if (audioRef.current && Math.abs(audioRef.current.currentTime - v.currentTime) > 0.3) {
      audioRef.current.currentTime = v.currentTime;
    }
  }
  function onPlay()  { if (music.url && audioRef.current) audioRef.current.play().catch(() => {}); }
  function onPause() { if (audioRef.current) audioRef.current.pause(); }

  // Seek by clicking the timeline
  function onTimelineClick(e: React.MouseEvent) {
    const el = timelineRef.current; const v = videoRef.current;
    if (!el || !v) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left + el.scrollLeft;
    v.currentTime = Math.max(0, Math.min(duration, x / PX_PER_SEC));
  }

  function editWord(id: number, text: string) {
    setWords(prev => prev.map(w => (w.id === id ? { ...w, text } : w)));
  }

  async function exportVideo() {
    if (!hostedUrl || lines.length === 0) return;
    setError(""); setStatus("rendering"); setExportUrl("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const res = await fetch(`${API}/api/captioner/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          videoUrl: hostedUrl, segments: lines, font: font.key,
          music: music.url || undefined, duration: videoRef.current?.duration,
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
    } catch (err: any) {
      setError(err.message || "Export failed, please try again.");
      setStatus("ready");
    }
  }

  useEffect(() => { if (music.url && audioRef.current) audioRef.current.volume = 0.25; }, [music]);

  const hasProject = words.length > 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@600&family=Montserrat:wght@700&family=Poppins:wght@600&display=swap" />

      <h1 className="text-2xl font-bold mb-1">Captions Editor</h1>
      <p className="text-gray-500 mb-6">
        Upload a video, auto-transcribe it, then edit captions word by word on the timeline, style the font, add music, and export.
      </p>

      {/* Upload (before a project exists) */}
      {!hasProject && (
        <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-4">
          {videoUrl
            ? <video ref={videoRef} src={videoUrl} controls onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
                className="w-full max-w-xs rounded-lg bg-black aspect-[9/16] object-contain" />
            : <p className="text-gray-400">No video yet</p>}
          <label className="cursor-pointer px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
            Choose video
            <input type="file" accept="video/*" onChange={onPick} className="hidden" />
          </label>
          <button onClick={transcribe} disabled={!file || status === "uploading" || status === "transcribing"}
            className="px-6 py-2 bg-black text-white rounded-lg disabled:opacity-40">
            {status === "uploading" ? "Uploading…" : status === "transcribing" ? "Transcribing…" : "Transcribe"}
          </button>
          <p className="text-xs text-gray-400">Short clips under 25MB work best.</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Editor */}
      {hasProject && (
        <div className="space-y-5">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-xs">
              <video ref={videoRef} src={videoUrl} controls
                onTimeUpdate={onTimeUpdate} onPlay={onPlay} onPause={onPause}
                onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
                className="w-full rounded-lg bg-black aspect-[9/16] object-contain" />
              {activeLine && (
                <div className="absolute bottom-12 left-0 right-0 px-3 text-center pointer-events-none">
                  <span className="inline-block px-2 py-1 rounded text-white"
                    style={{ fontFamily: font.css, background: "rgba(0,0,0,0.55)", lineHeight: 1.2 }}>
                    {activeLine.text}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Explore bar: tabs */}
          <div className="flex gap-1 border-b">
            {(["tracks", "font", "music"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 text-sm font-semibold capitalize -mb-px border-b-2"
                style={tab === t ? { borderColor: "#7C3AED", color: "#7C3AED" } : { borderColor: "transparent", color: "#6b7280" }}>
                {t}
              </button>
            ))}
          </div>

          {/* TRACKS tab — the timeline */}
          {tab === "tracks" && (
            <div className="border rounded-lg overflow-hidden">
              <div ref={timelineRef} onClick={onTimelineClick}
                className="relative overflow-x-auto bg-gray-50 cursor-pointer select-none"
                style={{ minHeight: 130 }}>
                <div style={{ width: Math.max(duration * PX_PER_SEC, 300), position: "relative" }}>

                  {/* time ruler */}
                  <div className="h-5 border-b text-[10px] text-gray-400 relative">
                    {Array.from({ length: Math.ceil(duration) + 1 }).map((_, s) => (
                      <span key={s} className="absolute top-0.5" style={{ left: s * PX_PER_SEC }}>{s}s</span>
                    ))}
                  </div>

                  {/* Video track */}
                  <div className="px-1 py-1">
                    <div className="text-[10px] text-gray-400 mb-0.5">Video</div>
                    <div className="h-9 rounded bg-purple-200 border border-purple-300 flex items-center px-2 text-xs text-purple-800 overflow-hidden"
                      style={{ width: Math.max(duration * PX_PER_SEC - 4, 60) }}>
                      {file?.name || "clip.mp4"}
                    </div>
                  </div>

                  {/* Words track */}
                  <div className="px-1 pb-2">
                    <div className="text-[10px] text-gray-400 mb-0.5">Captions (tap a word to edit)</div>
                    <div className="relative h-9">
                      {words.map(w => {
                        const left = w.start * PX_PER_SEC;
                        const width = Math.max((w.end - w.start) * PX_PER_SEC, 24);
                        const active = time >= w.start && time < w.end;
                        return editingId === w.id ? (
                          <input key={w.id} autoFocus defaultValue={w.text}
                            onClick={e => e.stopPropagation()}
                            onBlur={e => { editWord(w.id, e.target.value.trim()); setEditingId(null); }}
                            onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                            className="absolute top-0 h-9 text-xs border border-purple-500 rounded px-1"
                            style={{ left, width: Math.max(width, 60) }} />
                        ) : (
                          <button key={w.id}
                            onClick={e => { e.stopPropagation(); setEditingId(w.id); }}
                            className="absolute top-0 h-9 rounded border text-xs px-1 overflow-hidden whitespace-nowrap"
                            style={{ left, width,
                              background: active ? "#7C3AED" : "#ffffff",
                              color: active ? "#fff" : "#374151",
                              borderColor: active ? "#6D28D9" : "#e5e7eb" }}>
                            {w.text}
                          </button>
                        );
                      })}

                      {/* playhead */}
                      <div className="absolute top-[-44px] bottom-0 w-0.5 bg-red-500 pointer-events-none"
                        style={{ left: time * PX_PER_SEC, height: 96 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FONT tab */}
          {tab === "font" && (
            <div className="flex flex-wrap gap-2">
              {FONTS.map(f => (
                <button key={f.key} onClick={() => setFont(f)}
                  className="px-3 py-1.5 rounded-lg border text-sm"
                  style={font.key === f.key
                    ? { borderColor: "#7C3AED", color: "#7C3AED", fontFamily: f.css }
                    : { borderColor: "#e5e7eb", fontFamily: f.css }}>
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* MUSIC tab */}
          {tab === "music" && (
            <div className="flex flex-wrap gap-2">
              {MUSIC.map(m => (
                <button key={m.key} onClick={() => setMusic(m)}
                  className="px-3 py-1.5 rounded-lg border text-sm"
                  style={music.key === m.key ? { borderColor: "#7C3AED", color: "#7C3AED" } : { borderColor: "#e5e7eb" }}>
                  {m.label}
                </button>
              ))}
              {music.url && <audio ref={audioRef} src={music.url} loop preload="auto" />}
            </div>
          )}

          {/* Export */}
          <div className="space-y-2 pt-2 border-t">
            {exportUrl ? (
              <div className="space-y-2">
                <video src={exportUrl} controls className="w-full max-w-xs rounded-lg" />
                <a href={exportUrl} download className="inline-block text-sm text-blue-600">Download captioned video</a>
              </div>
            ) : (
              <button onClick={exportVideo} disabled={status === "rendering"}
                className="px-6 py-2 rounded-lg text-white font-semibold disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
                {status === "rendering" ? "Exporting… (~1 min)" : "Export video"}
              </button>
            )}
            <p className="text-xs text-gray-400">
              Preview uses your font and music live. Export burns captions in via the cloud renderer (sandbox output is watermarked + SD).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}