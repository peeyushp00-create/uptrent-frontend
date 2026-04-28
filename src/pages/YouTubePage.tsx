import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function YouTubeSEO() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          niche: user?.user_metadata?.niche,
          language: user?.user_metadata?.language
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to generate SEO. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Tag className="w-5 h-5 text-red-500" />
          <h1 className="text-lg font-bold text-foreground">YouTube SEO</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        <div>
          <h2 className="font-semibold text-foreground mb-1">SEO Generator</h2>
          <p className="text-xs text-muted-foreground">Get optimized titles, description and scored tags for any video topic</p>
        </div>

        <div className="flex gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Enter video topic (e.g. How to invest in stocks)"
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 text-sm"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-3 rounded-xl text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF0000, #CC0000)" }}
          >
            <Sparkles className="w-4 h-4" />
            {loading ? '...' : 'Generate'}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        )}

        {result && !result.error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

            {/* Titles */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-bold uppercase text-red-400 mb-3">🎯 Titles (pick one)</p>
              <div className="space-y-2">
                {result.titles?.map((title: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-secondary/30 hover:bg-accent transition-colors">
                    <span className="text-xs text-muted-foreground mt-0.5 w-4 shrink-0">{i + 1}.</span>
                    <p className="text-sm text-foreground flex-1">{title}</p>
                    <button onClick={() => copyText(title, `title-${i}`)}>
                      {copied === `title-${i}`
                        ? <Check className="w-3.5 h-3.5 text-green-400" />
                        : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase text-blue-400">📝 Description</p>
                <button
                  onClick={() => copyText(result.description, 'desc')}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copied === 'desc'
                    ? <Check className="w-3.5 h-3.5 text-green-400" />
                    : <Copy className="w-3.5 h-3.5" />} Copy
                </button>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{result.description}</p>
            </div>

            {/* Tags with scores */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase text-green-400">🏷️ Tags with Score</p>
                <button
                  onClick={() => copyText(
                    result.tags?.map((t: any) => t.tag || t).join(', '),
                    'tags'
                  )}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copied === 'tags'
                    ? <Check className="w-3.5 h-3.5 text-green-400" />
                    : <Copy className="w-3.5 h-3.5" />} Copy All
                </button>
              </div>

              {/* Score legend */}
              <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/> 80+ High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/> 60+ Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/> Below 60 Low</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {result.tags?.map((tag: any, i: number) => {
                  const tagName = tag.tag || tag;
                  const score = tag.score || null;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs ${getScoreBg(score || 50)}`}
                    >
                      <span className={getScoreColor(score || 50)}>{tagName}</span>
                      {score && (
                        <span className={`font-bold text-xs px-1 py-0.5 rounded-md bg-background/50 ${getScoreColor(score)}`}>
                          {score}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {result?.error && (
          <p className="text-red-400 text-sm text-center">{result.error}</p>
        )}
      </div>
    </div>
  );
}