import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Copy, Check, Loader2, ChevronRight } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function YouTubeAnalyzer() {
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAnalyze = async () => {
    if (!channelUrl.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to analyze channel. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Search className="w-5 h-5 text-red-500" />
          <h1 className="text-lg font-bold text-foreground">Channel Analyzer</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        <div>
          <h2 className="font-semibold text-foreground mb-1">Analyze Any Channel</h2>
          <p className="text-xs text-muted-foreground">Enter any YouTube channel name to get content ideas and strategy</p>
        </div>

        <div className="flex gap-2">
          <input
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Channel name (e.g. MrBeast, Ashish Chanchlani)"
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 text-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-4 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF0000, #CC0000)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <p className="text-xs text-muted-foreground">Analyzing channel...</p>
          </div>
        )}

        {result && !result.error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {result.summary && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-bold uppercase text-red-400 mb-2">📊 Channel Summary</p>
                <p className="text-sm text-foreground">{result.summary}</p>
              </div>
            )}
            {result.content_pillars && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-bold uppercase text-blue-400 mb-2">🏛️ Content Pillars</p>
                <div className="space-y-1.5">
                  {result.content_pillars.map((pillar: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {pillar}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.video_ideas && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-bold uppercase text-green-400 mb-2">💡 Video Ideas for You</p>
                <div className="space-y-2">
                  {result.video_ideas.map((idea: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-secondary/30">
                      <span className="text-xs text-muted-foreground mt-0.5 w-4 shrink-0">{i + 1}.</span>
                      <p className="text-sm text-foreground flex-1">{idea}</p>
                      <button onClick={() => copyText(idea, `idea-${i}`)}>
                        {copied === `idea-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
        {result?.error && <p className="text-red-400 text-sm text-center">{result.error}</p>}
      </div>
    </div>
  );
}