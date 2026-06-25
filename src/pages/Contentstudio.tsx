// ContentStudio.tsx — Studio editor (Stage 1: shell + 3-track timeline)
// Upload video -> preview + timeline (Video / Overlays / Music tracks).
// Overlays, music, captions and export come in later stages.

import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase"; // adjust path if needed

const PURPLE = "#7C3AED";
const GRAD = "linear-gradient(135deg, #7C3AED, #6D28D9)";
const PX_PER_SEC = 80; // timeline zoom

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function ContentStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setVideoUrl(URL.createObjectURL(picked));
    setDuration(0); setTime(0);
  }

  function onTimeUpdate() {
    const v = videoRef.current; if (!v) return;
    setTime(v.currentTime);
  }

  function onTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    const el = timelineRef.current; const v = videoRef.current;
    if (!el || !v || !duration) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left + el.scrollLeft;
    v.currentTime = Math.max(0, Math.min(duration, x / PX_PER_SEC));
  }

  const hasVideo = !!videoUrl;
  const trackWidth = Math.max(duration * PX_PER_SEC, 400);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Studio</h1>
      <p className="text-gray-500 mb-6">
        Upload a video and build your reel — add overlays, music, and captions on the timeline.
      </p>

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
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button onClick={() => { setFile(null); setVideoUrl(""); }}
              className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition">
              ← New
            </button>
            <button disabled
              className="text-sm font-semibold px-4 py-2 rounded-xl text-white opacity-40 cursor-not-allowed"
              style={{ background: GRAD }}>
              Export (coming soon)
            </button>
          </div>

          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[300px] rounded-2xl overflow-hidden bg-black shadow-lg">
              <video ref={videoRef} src={videoUrl} controls
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
                className="w-full aspect-[9/16] object-contain" />
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Timeline</span>
              <span className="text-xs text-gray-400">{fmt(time)} / {fmt(duration)}</span>
            </div>

            <div className="flex">
              {/* Track labels */}
              <div className="shrink-0 w-20 border-r border-gray-100 bg-gray-50/50 text-[11px] text-gray-500">
                <div className="h-5 border-b border-gray-100" />
                <div className="h-12 flex items-center px-3 border-b border-gray-100">Video</div>
                <div className="h-12 flex items-center px-3 border-b border-gray-100">Overlays</div>
                <div className="h-12 flex items-center px-3">Music</div>
              </div>

              {/* Scrollable tracks */}
              <div ref={timelineRef} onClick={onTimelineClick}
                className="relative overflow-x-auto cursor-pointer select-none flex-1 bg-gray-50/30">
                <div style={{ width: trackWidth, position: "relative" }}>
                  {/* ruler */}
                  <div className="h-5 border-b border-gray-100 relative text-[10px] text-gray-400">
                    {Array.from({ length: Math.ceil(duration) + 1 }).map((_, s) => (
                      <span key={s} className="absolute top-0.5" style={{ left: s * PX_PER_SEC }}>{s}s</span>
                    ))}
                  </div>

                  {/* Video track */}
                  <div className="h-12 border-b border-gray-100 p-1">
                    <div className="h-full rounded-lg flex items-center px-3 text-xs text-white font-medium overflow-hidden"
                      style={{ width: Math.max(trackWidth - 8, 60), background: GRAD }}>
                      {file?.name || "video.mp4"}
                    </div>
                  </div>

                  {/* Overlays track (empty for now) */}
                  <div className="h-12 border-b border-gray-100 p-1">
                    <div className="h-full rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-[11px] text-gray-300">
                      overlays — coming next
                    </div>
                  </div>

                  {/* Music track (empty for now) */}
                  <div className="h-12 p-1">
                    <div className="h-full rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-[11px] text-gray-300">
                      music — coming next
                    </div>
                  </div>

                  {/* playhead */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                    style={{ left: time * PX_PER_SEC }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}