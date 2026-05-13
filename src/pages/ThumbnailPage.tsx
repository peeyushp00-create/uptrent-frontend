import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Sparkles, Download, RefreshCw, X, Loader2 } from "lucide-react";

const IG_GRAD = "linear-gradient(135deg, #14BBA6, #0D9488)";
const IG = "#14BBA6";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STYLES = [
  { id: "viral", label: "🔥 Viral", prompt: "viral YouTube thumbnail, dramatic lighting, bold colors, high contrast, cinematic, professional photography" },
  { id: "cinematic", label: "🎬 Cinematic", prompt: "cinematic movie poster style, dramatic dark background, professional studio lighting, ultra realistic" },
  { id: "bold", label: "⚡ Bold", prompt: "bold colorful design, eye-catching, vibrant colors, dynamic composition, professional" },
  { id: "minimal", label: "✨ Minimal", prompt: "clean minimal modern design, white background, simple elegant, professional" },
  { id: "gaming", label: "🎮 Gaming", prompt: "gaming thumbnail style, neon lights, dark background, futuristic, energetic, dramatic" },
  { id: "motivational", label: "💪 Motivational", prompt: "motivational inspiring poster, powerful composition, warm colors, dramatic lighting" },
];

const PLATFORMS = [
  { id: "youtube", label: "YouTube", width: 1280, height: 720 },
  { id: "instagram", label: "Instagram", width: 1080, height: 1080 },
  { id: "reel", label: "Reel/Short", width: 1080, height: 1920 },
];

export default function ThumbnailPage() {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";

  const [topic, setTopic] = useState(initialTopic);
  const [style, setStyle] = useState("viral");
  const [platform, setPlatform] = useState("youtube");
  const [generating, setGenerating] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const generateThumbnails = async () => {
    if (!topic.trim()) { setError("Please enter a topic"); return; }
    setGenerating(true);
    setError("");
    setThumbnails([]);
    setProgress(0);

    const selectedStyle = STYLES.find(s => s.id === style);
    const selectedPlatform = PLATFORMS.find(p => p.id === platform);

    const prompts = [
      `${topic}, ${selectedStyle?.prompt}, ${selectedPlatform?.label} thumbnail format, 4K quality`,
      `${topic}, ${selectedStyle?.prompt}, different angle, professional content creator thumbnail`,
      `${topic} concept, ${selectedStyle?.prompt}, creative composition, stunning visuals`,
      `${topic}, ${selectedStyle?.prompt}, unique perspective, high quality digital art`,
    ];

    const results: string[] = [];

    for (let i = 0; i < prompts.length; i++) {
      try {
        setProgress(i + 1);
        const res = await fetch(`${BASE}/api/thumbnail/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompts[i],
            width: selectedPlatform?.width,
            height: selectedPlatform?.height,
          }),
        });

        if (!res.ok) throw new Error('Generation failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        results.push(url);
        setThumbnails([...results]);
      } catch (err) {
        console.error(`Thumbnail ${i + 1} failed:`, err);
      }
    }

    if (results.length === 0) {
      setError("Failed to generate thumbnails. Please try again.");
    }
    setGenerating(false);
    setProgress(0);
  };

  const downloadImage = async (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `thumbnail-${topic.slice(0, 20).replace(/\s+/g, '-')}-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Image className="w-5 h-5" style={{ color: IG }} />
          <h1 className="text-lg font-bold text-foreground">Thumbnail Generator</h1>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full text-white" style={{ background: IG_GRAD }}>
            AI Powered
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">

        {/* Topic input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Video Topic</label>
          <div className="flex gap-2">
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') generateThumbnails(); }}
              placeholder="e.g. How to invest in stocks, BGMI tips, Weight loss..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
              onFocus={e => e.target.style.borderColor = `${IG}60`}
              onBlur={e => e.target.style.borderColor = ''} />
            {topic && (
              <button onClick={() => { setTopic(""); setThumbnails([]); }}
                className="px-3 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Platform selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Platform</label>
          <div className="flex gap-2">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                style={platform === p.id
                  ? { background: IG_GRAD, color: '#fff', borderColor: 'transparent' }
                  : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Style</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)}
                className="py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-left"
                style={style === s.id
                  ? { background: IG_GRAD, color: '#fff', borderColor: 'transparent' }
                  : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Generate button */}
        <button onClick={generateThumbnails} disabled={generating}
          className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: IG_GRAD }}>
          <Sparkles className="w-4 h-4" />
          {generating ? `Generating thumbnail ${progress}/4...` : 'Generate 4 Thumbnails'}
        </button>

        {/* Loading */}
        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: IG }} />
            <p className="text-sm text-muted-foreground text-center">
              Generating thumbnail {progress}/4 for <span style={{ color: IG }}>"{topic}"</span>...
            </p>
            <p className="text-xs text-muted-foreground">Using FLUX.1 AI — takes 15-30 seconds each</p>
            {/* Progress bar */}
            <div className="w-full max-w-xs h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: IG_GRAD }}
                animate={{ width: `${(progress / 4) * 100}%` }}
                transition={{ duration: 0.3 }} />
            </div>
          </motion.div>
        )}

        {/* Thumbnails grid */}
        {thumbnails.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Generated Thumbnails
                {generating && <span className="ml-2 text-xs text-muted-foreground">({thumbnails.length}/4 ready)</span>}
              </p>
              {!generating && (
                <button onClick={generateThumbnails}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {thumbnails.map((url, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group rounded-2xl overflow-hidden border border-border bg-card cursor-pointer"
                  onClick={() => setSelectedImage(url)}>
                  <img src={url} alt={`Thumbnail ${i + 1}`}
                    className="w-full object-cover transition-transform group-hover:scale-105"
                    style={{ aspectRatio: platform === 'reel' ? '9/16' : platform === 'instagram' ? '1/1' : '16/9' }} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button onClick={e => { e.stopPropagation(); downloadImage(url, i); }}
                      className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ background: `${IG}CC` }}>
                    #{i + 1}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">Click to preview · Hover to download</p>
          </motion.div>
        )}

        {/* Full screen preview */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <img src={selectedImage} alt="Preview" className="w-full rounded-2xl" />
                <div className="flex gap-2 mt-3">
                  <button onClick={() => downloadImage(selectedImage, 0)}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                    style={{ background: IG_GRAD }}>
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={() => setSelectedImage(null)}
                    className="px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm">
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}