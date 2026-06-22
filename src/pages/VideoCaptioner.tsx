// VideoCaptioner.tsx
// New sidebar tool: upload a video -> transcribe -> edit -> style font -> export.
// Route at /captions. Captions preview live in the browser; only Export hits Shotstack.

import { useState, useRef } from "react";
import { supabase } from "../lib/supabase"; // <-- adjust import to your project

const API = import.meta.env.VITE_API_URL;

type Segment = { id: number; start: number; end: number; text: string };

// Curated fonts. `css` drives the live browser preview; `key` is what the
// backend maps to a Shotstack font for export.
const FONTS = [
  { key: "Poppins", label: "Poppins", css: "'Poppins', sans-serif" },
  { key: "Montserrat", label: "Montserrat", css: "'Montserrat', sans-serif" },
  { key: "Anton", label: "Anton (bold)", css: "'Anton', sans-serif" },
  { key: "BebasNeue", label: "Bebas Neue", css: "'Bebas Neue', sans-serif" },
  { key: "Inter", label: "Inter", css: "'Inter', sans-serif" },
];

export default function VideoCaptioner() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>(""); // local object URL for preview
  const [hostedUrl, setHostedUrl] = useState<string>(""); // Supabase public URL
  const [segments, setSegments] = useState<Segment[]>([]);
  const [font, setFont] = useState(FONTS[0]);
  const [activeText, setActiveText] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "transcribing" | "ready" | "rendering" | "done">("idle");
  const [exportUrl, setExportUrl] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setVideoUrl(URL.createObjectURL(picked));
    setSegments([]);
    setExportUrl("");
    setStatus("idle");
  }

  async function transcribe() {
    if (!file) return;
    setError("");
    setStatus("uploading");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");

      // Upload to Supabase so the backend (and Shotstack) can fetch it by URL
      const path = `captions/${session.user.id}/${Date.now()}.mp4`;
      const { error: upErr } = await supabase.storage
        .from("insta-media")
        .upload(path, file, { upsert: true, contentType: file.type });
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
      setSegments(data.segments || []);
      setStatus("ready");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Keep clips under 25MB and try again.");
      setStatus("idle");
    }
  }

  // Live caption preview: show the segment matching the current playback time
  function onTimeUpdate() {
    const t = videoRef.current?.currentTime ?? 0;
    const seg = segments.find((s) => t >= s.start && t < s.end);
    setActiveText(seg?.text || "");
  }

  function editSegment(id: number, text: string) {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));
  }

  async function exportVideo() {
    if (!hostedUrl || segments.length === 0) return;
    setError("");
    setStatus("rendering");
    setExportUrl("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");

      const duration = videoRef.current?.duration;
      const startRes = await fetch(`${API}/api/captioner/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ videoUrl: hostedUrl, segments, font: font.key, duration }),
      });
      const { renderId } = await startRes.json();
      if (!renderId) throw new Error("Export did not start");

      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 3000));
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Load preview fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@600&family=Montserrat:wght@700&family=Poppins:wght@600&display=swap"
      />

      <h1 className="text-2xl font-bold mb-1">Captions</h1>
      <p className="text-gray-500 mb-6">
        Upload a video, auto-transcribe it, fix any words, pick a font, and export with captions burned in.
      </p>

      {/* Upload */}
      <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-4">
        {videoUrl ? (
          <div className="relative w-full max-w-xs">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              onTimeUpdate={onTimeUpdate}
              className="w-full rounded-lg bg-black aspect-[9/16] object-contain"
            />
            {activeText && (
              <div className="absolute bottom-12 left-0 right-0 px-3 text-center pointer-events-none">
                <span
                  className="inline-block px-2 py-1 rounded text-white"
                  style={{ fontFamily: font.css, background: "rgba(0,0,0,0.55)", lineHeight: 1.2 }}
                >
                  {activeText}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">No video yet</p>
        )}

        <label
          className="cursor-pointer px-4 py-2 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
        >
          Choose video
          <input type="file" accept="video/*" onChange={onPick} className="hidden" />
        </label>

        {segments.length === 0 && (
          <button
            onClick={transcribe}
            disabled={!file || status === "uploading" || status === "transcribing"}
            className="px-6 py-2 bg-black text-white rounded-lg disabled:opacity-40"
          >
            {status === "uploading" ? "Uploading…" : status === "transcribing" ? "Transcribing…" : "Transcribe"}
          </button>
        )}
      </div>

      {/* Manual */}
      {segments.length === 0 && status === "idle" && (
        <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-5 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-700">How it works</p>
          <p>1. Upload a short clip (under 25MB works best).</p>
          <p>2. Tap Transcribe — captions appear and play in sync.</p>
          <p>3. Fix any wrong words, choose a font, then export the captioned video.</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Editor */}
      {segments.length > 0 && (
        <div className="mt-8 space-y-6">
          {/* Font picker */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-2">Font</h2>
            <div className="flex flex-wrap gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFont(f)}
                  className="px-3 py-1.5 rounded-lg border text-sm"
                  style={
                    font.key === f.key
                      ? { borderColor: "#7C3AED", color: "#7C3AED", fontFamily: f.css }
                      : { borderColor: "#e5e7eb", fontFamily: f.css }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transcript editor */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Transcript — fix any mistakes
            </h2>
            <div className="space-y-2">
              {segments.map((s) => (
                <div key={s.id} className="flex gap-3 items-start">
                  <span className="text-xs text-gray-400 mt-2.5 w-12 shrink-0">{s.start.toFixed(1)}s</span>
                  <input
                    value={s.text}
                    onChange={(e) => editSegment(s.id, e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="space-y-2">
            {exportUrl ? (
              <div className="space-y-2">
                <video src={exportUrl} controls className="w-full max-w-xs rounded-lg" />
                <a href={exportUrl} download className="inline-block text-sm text-blue-600">Download captioned video</a>
              </div>
            ) : (
              <button
                onClick={exportVideo}
                disabled={status === "rendering"}
                className="px-6 py-2 rounded-lg text-white font-semibold disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
              >
                {status === "rendering" ? "Exporting… (~1 min)" : "Export captioned video"}
              </button>
            )}
            <p className="text-xs text-gray-400">
              The preview above uses your chosen font live. Export burns it in via the cloud renderer (sandbox output is watermarked + SD).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}