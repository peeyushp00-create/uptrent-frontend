// ContentStudio.tsx
// New sidebar feature page. Route it at e.g. /studio and add a nav item.
// Uses your existing Supabase client + VITE_API_URL pattern.
//
// import { supabase } from "../lib/supabase";  // adjust to your path

import { useState } from "react";
import { supabase } from "../lib/supabase"; // <-- adjust import to your project

const API = import.meta.env.VITE_API_URL;

type Clip = { url?: string; preview?: string; author?: string } | null;
type Broll = { label: string; query: string; clip: Clip };
type Kit = {
  scene: string;
  captions: string[];
  hook: string;
  broll: Broll[];
  hashtags: string[];
  audio: string[];
  tips: string[];
};

export default function ContentStudio() {
  const [preview, setPreview] = useState<string>("");
  const [imageData, setImageData] = useState<string>(""); // base64
  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState<Kit | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [videoStatus, setVideoStatus] = useState<"idle" | "uploading" | "rendering" | "done" | "error">("idle");
  const [videoUrl, setVideoUrl] = useState<string>("");

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked); // keep the File for the video upload step
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setImageData(result.split(",")[1]); // strip data-url prefix
    };
    reader.readAsDataURL(picked);
  }

  async function generate() {
    if (!imageData) return;
    setLoading(true);
    setError("");
    setKit(null);

    try {
      // Verified auth — send the real Supabase session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");

      const res = await fetch(`${API}/api/content-kit/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ image: imageData, mimeType: "image/jpeg" }),
      });

      if (!res.ok) throw new Error("Generation failed");
      setKit(await res.json());
    } catch (err) {
      // Friendly message also covers Render free-tier cold start
      setError("Couldn't generate that — the server may be waking up. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, tag: string) {
    navigator.clipboard.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(""), 1500);
  }

  // ---- Assemble a video from the image + B-roll clips via Shotstack ----
  async function makeVideo() {
    if (!file || !kit) return;
    setVideoStatus("uploading");
    setVideoUrl("");
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");

      // 1. Shotstack renders from URLs, so host the image first.
      const path = `studio/${session.user.id}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("insta-media")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("insta-media").getPublicUrl(path);
      const imageUrl = pub.publicUrl;

      // 2. Kick off the render with image + the B-roll clips we already found.
      setVideoStatus("rendering");
      const clips = (kit.broll || [])
        .map((b) => b.clip)
        .filter((c): c is NonNullable<Clip> => !!c?.url);

      const startRes = await fetch(`${API}/api/content-kit/render`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ imageUrl, clips, caption: kit.captions?.[0] || "" }),
      });
      const { renderId } = await startRes.json();
      if (!renderId) throw new Error("Render did not start");

      // 3. Poll until done (Shotstack: queued -> rendering -> done/failed).
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const sRes = await fetch(`${API}/api/content-kit/render/${renderId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const s = await sRes.json();
        if (s.status === "done" && s.url) {
          setVideoUrl(s.url);
          setVideoStatus("done");
          return;
        }
        if (s.status === "failed") throw new Error("Render failed");
      }
      throw new Error("Render timed out");
    } catch (err) {
      setVideoStatus("error");
      setError("Couldn't build the video — please try again.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Content Studio</h1>
      <p className="text-gray-500 mb-6">
        Upload an image and get a ready-to-post kit — caption, hook, B-roll clips, hashtags and audio.
      </p>

      {/* Upload */}
      <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-4">
        {preview ? (
          <img src={preview} alt="upload" className="max-h-64 rounded-lg" />
        ) : (
          <p className="text-gray-400">No image yet</p>
        )}
        <label className="cursor-pointer px-4 py-2 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
          Choose image
          <input type="file" accept="image/*" onChange={onPick} className="hidden" />
        </label>
        <button
          onClick={generate}
          disabled={!imageData || loading}
          className="px-6 py-2 bg-black text-white rounded-lg disabled:opacity-40"
        >
          {loading ? "Generating…" : "Generate content kit"}
        </button>
      </div>

      {/* User manual — hidden once a kit is generated to keep results clean */}
      {!kit && (
        <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">How it works</h2>
          <ol className="space-y-2.5 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">1</span>
              <span>Upload a photo — a product shot, selfie, screenshot, or any frame from your video.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">2</span>
              <span>Tap <strong>Generate content kit</strong>. The AI reads your image and uses your saved niche, language and voice style.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">3</span>
              <span>Get back a ready-to-post kit: a hook, caption options, matching B-roll clips, hashtags, audio ideas and posting tips.</span>
            </li>
          </ol>
          <p className="mt-4 text-xs text-gray-400">
            Tip: a clear, well-lit image gives sharper captions and better-matched B-roll. Set your niche and language in Settings for results tuned to your style. First run after a quiet period may take a few extra seconds while the server wakes up.
          </p>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Results */}
      {kit && (
        <div className="mt-8 space-y-8">
          {/* Video */}
          <Section title="Video">
            {videoUrl ? (
              <div className="space-y-3">
                <video src={videoUrl} controls className="w-full max-w-xs rounded-lg" />
                <a href={videoUrl} download className="inline-block text-sm text-blue-600">
                  Download video
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={makeVideo}
                  disabled={videoStatus === "uploading" || videoStatus === "rendering" || !file}
                  className="px-5 py-2 bg-black text-white rounded-lg disabled:opacity-40"
                >
                  {videoStatus === "uploading"
                    ? "Uploading…"
                    : videoStatus === "rendering"
                    ? "Building video… (~1 min)"
                    : "Create video"}
                </button>
                <p className="text-xs text-gray-400">
                  Stitches your image and the B-roll clips below into a 9:16 reel with your caption. The sandbox render is watermarked and SD — fine for testing; switch to a Shotstack production key for clean output.
                </p>
              </div>
            )}
          </Section>

          {kit.hook && (
            <Section title="Hook">
              <p className="text-lg font-medium">{kit.hook}</p>
            </Section>
          )}

          <Section title="Captions">
            <div className="space-y-2">
              {kit.captions?.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-3 bg-gray-50 p-3 rounded-lg">
                  <p>{c}</p>
                  <button onClick={() => copy(c, `cap${i}`)} className="text-sm text-blue-600 shrink-0">
                    {copied === `cap${i}` ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="B-roll clips">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {kit.broll?.map((b, i) => (
                <div key={i} className="rounded-lg overflow-hidden bg-gray-100">
                  {b.clip?.url ? (
                    <video
                      src={b.clip.url}
                      poster={b.clip.preview}
                      controls
                      muted
                      loop
                      className="w-full aspect-[9/16] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[9/16] flex items-center justify-center text-gray-400 text-xs p-2 text-center">
                      No clip found
                    </div>
                  )}
                  <p className="text-xs p-2 text-gray-600">{b.label}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Hashtags">
            <div className="flex flex-wrap gap-2">
              {kit.hashtags?.map((h, i) => (
                <span key={i} className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">#{h}</span>
              ))}
            </div>
            <button
              onClick={() => copy(kit.hashtags.map(h => "#" + h).join(" "), "tags")}
              className="text-sm text-blue-600 mt-2"
            >
              {copied === "tags" ? "Copied" : "Copy all"}
            </button>
          </Section>

          {kit.audio?.length > 0 && (
            <Section title="Audio ideas">
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {kit.audio.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </Section>
          )}

          {kit.tips?.length > 0 && (
            <Section title="Posting tips">
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {kit.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-2">{title}</h2>
      {children}
    </div>
  );
}