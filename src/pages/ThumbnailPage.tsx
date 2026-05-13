import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Sparkles, Download, RefreshCw, X } from "lucide-react";

const IG_GRAD = "linear-gradient(135deg, #14BBA6, #0D9488)";
const IG = "#14BBA6";

const STYLES = [
  { id: "cinematic", label: "🎬 Cinematic", prompt: "cinematic dramatic movie poster style, dark background, professional lighting" },
  { id: "bold", label: "⚡ Bold Text", prompt: "bold colorful YouTube thumbnail, big text overlay, high contrast, eye-catching" },
  { id: "minimal", label: "✨ Minimal", prompt: "clean minimal modern design, white background, simple elegant" },
  { id: "viral", label: "🔥 Viral", prompt: "viral YouTube thumbnail style, shocked face, bright colors, dramatic" },
  { id: "professional", label: "💼 Professional", prompt: "professional business style, corporate, clean, trustworthy" },
  { id: "gaming", label: "🎮 Gaming", prompt: "gaming thumbnail style, neon lights, dark background, energetic" },
];

const PLATFORMS = [
  { id: "youtube", label: "YouTube", width: 1280, height: 720, ratio: "16:9" },
  { id: "instagram", label: "Instagram", width: 1080, height: 1080, ratio: "1:1" },
  { id: "reel", label: "Reel/Short", width: 1080, height: 1920, ratio: "9:16" },
];

export default function ThumbnailPage() {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";

  const [topic, setTopic] = useState(initialTopic);
  const [style, setStyle] = useState("cinematic");
  const [platform, setPlatform] = useState("youtube");
  const [generating, setGenerating] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const buildPrompt = (seed: number) => {
    const selectedStyle = STYLES.find(s => s.id === style);
    const selectedPlatform = PLATFORMS.find(p => p.id === platform);
    return `${topic}, ${selectedStyle?.prompt}, ${selectedPlatform?.label} thumbnail, ${selectedPlatform?.ratio} aspect ratio, high quality, seed:${seed}`;
  };

  const generateThumbnails = async () => {
    if (!topic.trim()) { setError("Please enter a topic"); return; }
    setGenerating(true);
    setError("");
    setThumbnails([]);

    try {
      const selectedPlatform = PLATFORMS.find(p => p.id === platform);
      const seeds = [Date.now(), Date.now() + 1, Date.now() + 2, Date.now() + 3];

      const urls = seeds.map(seed => {
        const prompt = encodeURIComponent(buildPrompt(seed));
        return `https://image.pollinations.ai/prompt/${prompt}?width=${selectedPlatform?.width}&height=${selectedPlatform?.height}&nologo=true&seed=${seed}`;
      });

      setThumbnails(urls);
    } catch {
      setError("Failed to generate thumbnails. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `thumbnail-${topic.slice(0, 20)}-${index + 1}.jpg`;
      link.click();
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Image className="w-5 h-5" style={{ color: IG }} />
          <h1 className="text-lg font-bold text-foreground">Thumbnail Generator</h1>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full text-white" style={{ background: IG_GRAD }}>
            AI Free
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
              placeholder="e.g. How to invest in stocks, BGMI tips..."
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
                <p className="font-semibold">{p.label}</p>
                <p className="text-xs opacity-70">{p.ratio}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Style selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Thumbnail Style</label>
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
          {generating ? 'Generating 4 thumbnails...' : 'Generate Thumbnails'}
        </button>

        {/* Loading */}
        {generating && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="w-6 h-6" style={{ color: IG }} />
            </motion.div>
            <p className="text-sm text-muted-foreground">Creating thumbnails for <span style={{ color: IG }}>"{topic}"</span>...</p>
            <p className="text-xs text-muted-foreground">This takes 15-30 seconds</p>
          </div>
        )}

        {/* Thumbnails grid */}
        {thumbnails.length > 0 && !generating && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Generated Thumbnails</p>
              <button onClick={generateThumbnails}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {thumbnails.map((url, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="relative group rounded-2xl overflow-hidden border border-border bg-card cursor-pointer"
                  onClick={() => setSelectedImage(url)}>
                  <img src={url} alt={`Thumbnail ${i + 1}`}
                    className="w-full object-cover transition-transform group-hover:scale-105"
                    style={{ aspectRatio: platform === 'reel' ? '9/16' : platform === 'instagram' ? '1/1' : '16/9' }}
                    loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); downloadImage(url, i); }}
                        className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ background: `${IG}CC` }}>
                    #{i + 1}
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Click any thumbnail to preview · Hover to download
            </p>
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