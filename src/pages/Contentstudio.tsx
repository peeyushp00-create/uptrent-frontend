// ContentStudio.tsx — Studio editor (Stage 2: shell + captions)
// Upload video -> transcribe -> edit & style captions on a multi-track timeline.
// Overlays, music, and export come in later stages. Uses /api/captioner backend.

import React, { useState, useRef, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase"; // adjust path if needed

const API = import.meta.env.VITE_API_URL;
const PURPLE = "#7C3AED";
const GRAD = "linear-gradient(135deg, #7C3AED, #6D28D9)";
const PX_PER_SEC = 80;

type Word = { id: number; start: number; end: number; text: string };
type Segment = { id: number; start: number; end: number; text: string };

const FONTS = [
  { key: "Poppins", label: "Poppins", css: "'Poppins', sans-serif" },
  { key: "Montserrat", label: "Montserrat", css: "'Montserrat', sans-serif" },
  { key: "Anton", label: "Anton", css: "'Anton', sans-serif" },
  { key: "BebasNeue", label: "Bebas Neue", css: "'Bebas Neue', sans-serif" },
  { key: "Inter", label: "Inter", css: "'Inter', sans-serif" },
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

  // caption styling
  const [font, setFont] = useState(FONTS[0]);
  const [captionPos, setCaptionPos] = useState<"top" | "middle" | "bottom">("bottom");
  const [showBox, setShowBox] = useState(true);
  const [textColor, setTextColor] = useState("#ffffff");
  const [boxColor, setBoxColor] = useState("#000000");

  // editing
  const [history, setHistory] = useState<Segment[][]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const caretRef = useRef<{ id: number; pos: number } | null>(null);

  const hasVideo = !!videoUrl;
  const hasCaptions = segments.length > 0;
  const trackWidth = Math.max(duration * PX_PER_SEC, 400);

  const activeId = useMemo(() => {
    const seg = segments.find(s => time >= s.start && time < s.end);
    return seg ? seg.id : null;
  }, [segments, time]);
  const activeText = activeId != null ? segments.find(s => s.id === activeId)?.text : "";

  useEffect(() => {
    if (activeId != null) rowRefs.current[activeId]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setVideoUrl(URL.createObjectURL(picked));
    setDuration(0); setTime(0); setSegments([]); setStatus("idle"); setError("");
  }

  async function transcribe() {
    if (!file) return;
    setError(""); setStatus("uploading");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const path = `studio/${session.user.id}/${Date.now()}.mp4`;
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
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Transcription failed"); }
      const { transcriptId } = await res.json();
      if (!transcriptId) throw new Error("Transcription did not start");

      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const sRes = await fetch(`${API}/api/captioner/transcribe/${transcriptId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const s = await sRes.json();
        if (s.status === "completed") { setSegments(buildSegments(s.words || [])); setStatus("ready"); return; }
        if (s.status === "error") throw new Error("Transcription failed");
      }
      throw new Error("Transcription timed out");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong."); setStatus("idle");
    }
  }

  function onTimeUpdate() { const v = videoRef.current; if (v) setTime(v.currentTime); }
  function onTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    const el = timelineRef.current; const v = videoRef.current;
    if (!el || !v || !duration) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left + el.scrollLeft;
    v.currentTime = Math.max(0, Math.min(duration, x / PX_PER_SEC));
  }
  function seek(t: number) { if (videoRef.current) videoRef.current.currentTime = t; }
  function editSeg(id: number, text: string) { setSegments(prev => prev.map(s => (s.id === id ? { ...s, text } : s))); }

  function pushHistory() {
    setHistory(h => {
      const snap = JSON.stringify(segments);
      if (h.length && JSON.stringify(h[h.length - 1]) === snap) return h;
      return [...h.slice(-49), JSON.parse(snap)];
    });
  }
  function undo() { setHistory(h => { if (!h.length) return h; setSegments(h[h.length - 1]); return h.slice(0, -1); }); }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  function splitSeg(id: number) {
    const seg = segments.find(s => s.id === id); if (!seg) return;
    const pos = caretRef.current && caretRef.current.id === id ? caretRef.current.pos : Math.floor(seg.text.length / 2);
    const before = seg.text.slice(0, pos).trim(); const after = seg.text.slice(pos).trim();
    if (!before || !after) return;
    pushHistory();
    const mid = seg.start + (seg.end - seg.start) * (pos / seg.text.length);
    const idx = segments.findIndex(s => s.id === id);
    const next = [...segments];
    next.splice(idx, 1, { ...seg, text: before, end: mid }, { id: -1, start: mid, end: seg.end, text: after });
    setSegments(reindex(next));
  }
  function mergeUp(id: number) {
    const idx = segments.findIndex(s => s.id === id); if (idx <= 0) return;
    pushHistory();
    const prev = segments[idx - 1], cur = segments[idx];
    const next = [...segments]; next.splice(idx - 1, 2, { ...prev, text: `${prev.text} ${cur.text}`.trim(), end: cur.end });
    setSegments(reindex(next));
  }

  const capTop = captionPos === "top" ? { top: "10%" } : captionPos === "middle" ? { top: "45%" } : { bottom: "10%" };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@600&family=Montserrat:wght@700&family=Poppins:wght@600&display=swap" />

      <h1 className="text-2xl font-bold mb-1">Studio</h1>
      <p className="text-gray-500 mb-6">Upload a video, add captions, then overlays and music on the timeline.</p>

      {/* Upload screen */}
      {!hasVideo && (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center gap-4 bg-gray-50/50">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl" style={{ background: GRAD }}>▶</div>
          <p className="text-gray-500">Start by uploading a video</p>
          <label className="cursor-pointer px-5 py-2.5 rounded-xl text-white font-semibold hover:opacity-90 transition" style={{ background: GRAD }}>
            Choose video
            <input type="file" accept="video/*" onChange={onPick} className="hidden" />
          </label>
        </div>
      )}

      {/* Editor */}
      {hasVideo && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={() => { setFile(null); setVideoUrl(""); setSegments([]); }}
              className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition">← New</button>
            <button disabled className="text-sm font-semibold px-4 py-2 rounded-xl text-white opacity-40 cursor-not-allowed" style={{ background: GRAD }}>
              Export (coming soon)
            </button>
          </div>

          <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">
            {/* Left: preview + caption style */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
                <video ref={videoRef} src={videoUrl} controls
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
                  className="w-full aspect-[9/16] object-contain" />
                {activeText && (
                  <div className="absolute left-0 right-0 px-3 text-center pointer-events-none" style={capTop}>
                    <span className="inline-block px-2.5 py-1 rounded-md text-sm"
                      style={{ fontFamily: font.css, color: textColor, background: showBox ? boxColor : "transparent", lineHeight: 1.25 }}>
                      {activeText}
                    </span>
                  </div>
                )}
              </div>

              {!hasCaptions ? (
                <div className="rounded-2xl border border-gray-100 p-4 text-center space-y-3">
                  <p className="text-sm text-gray-500">Add auto-captions to your video</p>
                  <button onClick={transcribe} disabled={status === "uploading" || status === "transcribing"}
                    className="px-5 py-2 rounded-xl text-white font-semibold disabled:opacity-40 transition" style={{ background: GRAD }}>
                    {status === "uploading" ? "Uploading…" : status === "transcribing" ? "Transcribing…" : "Transcribe captions"}
                  </button>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-100 p-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Font</p>
                    <div className="flex flex-wrap gap-2">
                      {FONTS.map(f => (
                        <button key={f.key} onClick={() => setFont(f)} className="px-3 py-1.5 rounded-lg border text-sm transition"
                          style={font.key === f.key ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF", fontFamily: f.css } : { borderColor: "#e5e7eb", fontFamily: f.css }}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Position</p>
                    <div className="flex gap-2">
                      {(["top", "middle", "bottom"] as const).map(p => (
                        <button key={p} onClick={() => setCaptionPos(p)} className="flex-1 px-3 py-1.5 rounded-lg border text-sm capitalize transition"
                          style={captionPos === p ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb" }}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Style</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <button onClick={() => setShowBox(v => !v)} className="px-3 py-1.5 rounded-lg border text-sm transition"
                        style={showBox ? { borderColor: PURPLE, color: PURPLE, background: "#F5F2FF" } : { borderColor: "#e5e7eb", color: "#6b7280" }}>
                        {showBox ? "Box: on" : "Box: off"}
                      </button>
                      <label className="flex items-center gap-1.5 text-xs text-gray-500">Text
                        <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" /></label>
                      {showBox && (
                        <label className="flex items-center gap-1.5 text-xs text-gray-500">Box
                          <input type="color" value={boxColor} onChange={e => setBoxColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" /></label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: transcript editor */}
            <div>
              {hasCaptions ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-700">Transcript</h2>
                    <div className="flex items-center gap-3">
                      <button onClick={undo} disabled={!history.length} className="text-xs font-semibold px-2 py-1 rounded-lg border transition disabled:opacity-40"
                        style={{ borderColor: "#e5e7eb", color: history.length ? PURPLE : "#9ca3af" }}>↺ Undo</button>
                      <span className="text-xs text-gray-400">{segments.length} lines</span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                    {segments.map(s => {
                      const active = s.id === activeId;
                      return (
                        <div key={s.id} ref={el => (rowRefs.current[s.id] = el)} className="group flex gap-3 p-3 rounded-xl border transition"
                          style={active ? { borderColor: PURPLE, background: "#F5F2FF", boxShadow: "0 0 0 1px #7C3AED" } : { borderColor: "#f0f0f0" }}>
                          <button onClick={() => seek(s.start)} className="shrink-0 text-xs font-mono mt-1 px-1.5 py-0.5 rounded transition"
                            style={active ? { color: PURPLE } : { color: "#9ca3af" }}>{fmt(s.start)}</button>
                          <textarea value={s.text} onFocus={pushHistory} onChange={e => editSeg(s.id, e.target.value)}
                            onSelect={e => { caretRef.current = { id: s.id, pos: e.currentTarget.selectionStart }; }} rows={1}
                            className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed" style={{ minHeight: 24 }}
                            onInput={e => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }} />
                          <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => splitSeg(s.id)} className="text-[10px] px-1.5 py-0.5 rounded border text-gray-500 hover:text-purple-600">Split</button>
                            <button onClick={() => mergeUp(s.id)} disabled={s.id === 0} className="text-[10px] px-1.5 py-0.5 rounded border text-gray-500 hover:text-purple-600 disabled:opacity-30">Merge↑</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="h-full rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400 p-10 text-center">
                  Transcribe to edit captions here.
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Timeline</span>
              <span className="text-xs text-gray-400">{fmt(time)} / {fmt(duration)}</span>
            </div>
            <div className="flex">
              <div className="shrink-0 w-20 border-r border-gray-100 bg-gray-50/50 text-[11px] text-gray-500">
                <div className="h-5 border-b border-gray-100" />
                <div className="h-10 flex items-center px-3 border-b border-gray-100">Video</div>
                <div className="h-10 flex items-center px-3 border-b border-gray-100">Captions</div>
                <div className="h-10 flex items-center px-3 border-b border-gray-100">Overlays</div>
                <div className="h-10 flex items-center px-3">Music</div>
              </div>
              <div ref={timelineRef} onClick={onTimelineClick} className="relative overflow-x-auto cursor-pointer select-none flex-1 bg-gray-50/30">
                <div style={{ width: trackWidth, position: "relative" }}>
                  <div className="h-5 border-b border-gray-100 relative text-[10px] text-gray-400">
                    {Array.from({ length: Math.ceil(duration) + 1 }).map((_, s) => (
                      <span key={s} className="absolute top-0.5" style={{ left: s * PX_PER_SEC }}>{s}s</span>
                    ))}
                  </div>
                  {/* Video */}
                  <div className="h-10 border-b border-gray-100 p-1">
                    <div className="h-full rounded-lg flex items-center px-3 text-xs text-white font-medium overflow-hidden"
                      style={{ width: Math.max(trackWidth - 8, 60), background: GRAD }}>{file?.name || "video.mp4"}</div>
                  </div>
                  {/* Captions */}
                  <div className="h-10 border-b border-gray-100 relative">
                    {segments.map(s => (
                      <div key={s.id} className="absolute top-1 bottom-1 rounded bg-purple-200 border border-purple-300 overflow-hidden text-[9px] text-purple-800 px-1 flex items-center"
                        style={{ left: s.start * PX_PER_SEC, width: Math.max((s.end - s.start) * PX_PER_SEC, 10) }}>
                        {s.text.slice(0, 12)}
                      </div>
                    ))}
                  </div>
                  {/* Overlays placeholder */}
                  <div className="h-10 border-b border-gray-100 p-1">
                    <div className="h-full rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-[11px] text-gray-300">overlays — next stage</div>
                  </div>
                  {/* Music placeholder */}
                  <div className="h-10 p-1">
                    <div className="h-full rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-[11px] text-gray-300">music — next stage</div>
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none" style={{ left: time * PX_PER_SEC }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}