import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles, Copy, Check, Loader2, Search, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SEO_SUGGESTIONS = [
  "How to invest in stocks India", "Weight loss tips Hindi",
  "AI tools for beginners", "Budget smartphone review",
  "Stock market basics", "ChatGPT tutorial Hindi",
  "Passive income ideas India", "Python for beginners",
  "Home workout no equipment", "Crypto explained Hindi",
  "Business ideas India", "English speaking tips",
  "Skincare routine India", "Car review India budget",
  "Mental health tips Hindi", "Study motivation",
  "Cooking quick meals", "Travel vlog India",
  "IPL analysis", "Digital marketing tips India",
];

export default function YouTubeSEO() {
  const { user } = useAuth();
  const [topic, setTopic] = useState(() => localStorage.getItem('yt_seo_topic') || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(() => {
    const saved = localStorage.getItem('yt_seo_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('yt_seo_topic', topic); }, [topic]);
  useEffect(() => { if (result) localStorage.setItem('yt_seo_result', JSON.stringify(result)); }, [result]);

  useEffect(() => {
    if (topic.trim().length > 0) {
      const filtered = SEO_SUGGESTIONS.filter(s => s.toLowerCase().includes(topic.toLowerCase()) && s.toLowerCase() !== topic.toLowerCase()).slice(0, 5);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else { setShowDropdown(false); setDropdownSuggestions([]); }
  }, [topic]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const copyText = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };

  const handleClear = () => {
    setTopic(''); setResult(null);
    localStorage.removeItem('yt_seo_result');
    localStorage.removeItem('yt_seo_topic');
  };

  const handleGenerate = async (t?: string) => {
    const target = t || topic;
    if (!target.trim()) return;
    setTopic(target); setShowDropdown(false); setLoading(true); setResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/seo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: target, niche: user?.user_metadata?.niche, language: user?.user_metadata?.language }) });
      const data = await res.json();
      setResult(data);
    } catch { setResult({ error: 'Failed to generate SEO. Try again.' }); }
    finally { setLoading(false); }
  };

  const getScoreColor = (score: number) => score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  const getScoreBg = (score: number) => score >= 80 ? 'bg-green-500/10 border-green-500/20' : score >= 60 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="min-h-screen bg-background">
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
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input ref={inputRef} value={topic} onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); if (e.key === "Escape") setShowDropdown(false); }}
                onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                placeholder="Enter video topic (e.g. How to invest in stocks)"
                className="w-full px-4 pr-9 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 text-sm"
              />
              {topic && (
                <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => handleGenerate()} disabled={loading} className="px-4 py-3 rounded-xl text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #FF0000, #CC0000)" }}>
              <Sparkles className="w-4 h-4" />{loading ? '...' : 'Generate'}
            </button>
          </div>
          {showDropdown && dropdownSuggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" style={{ width: 'calc(100% - 100px)' }}>
              {dropdownSuggestions.map((s, i) => <button key={i} onClick={() => handleGenerate(s)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left"><Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{s}</button>)}
            </div>
          )}
        </div>
        {!topic && !result && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Popular topics:</p>
            <div className="flex flex-wrap gap-2">
              {SEO_SUGGESTIONS.slice(0, 10).map((s) => <button key={s} onClick={() => handleGenerate(s)} className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{s}</button>)}
            </div>
          </div>
        )}
        {loading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>}
        {result && !result.error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-bold uppercase text-red-400 mb-3">🎯 Titles (pick one)</p>
              <div className="space-y-2">
                {result.titles?.map((title: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-secondary/30 hover:bg-accent transition-colors">
                    <span className="text-xs text-muted-foreground mt-0.5 w-4 shrink-0">{i + 1}.</span>
                    <p className="text-sm text-foreground flex-1">{title}</p>
                    <button onClick={() => copyText(title, `title-${i}`)}>{copied === `title-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase text-blue-400">📝 Description</p>
                <button onClick={() => copyText(result.description, 'desc')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">{copied === 'desc' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copy</button>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{result.description}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase text-green-400">🏷️ Tags with Score</p>
                <button onClick={() => copyText(result.tags?.map((t: any) => t.tag || t).join(', '), 'tags')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">{copied === 'tags' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copy All</button>
              </div>
              <div className="bg-secondary/30 rounded-xl p-3 mb-3 space-y-1.5">
                <p className="text-xs font-medium text-foreground">How scores work:</p>
                <p className="text-xs text-muted-foreground">Each tag is scored 1-100 based on estimated search volume and relevance. Higher score = more people search for that tag on YouTube.</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /><span className="text-green-400">80+ High</span></span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /><span className="text-yellow-400">60+ Medium</span></span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /><span className="text-red-400">Below 60 Low</span></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tags?.map((tag: any, i: number) => {
                  const tagName = tag.tag || tag; const score = tag.score || null;
                  return <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs ${getScoreBg(score || 50)}`}><span className={getScoreColor(score || 50)}>{tagName}</span>{score && <span className={`font-bold text-xs px-1 py-0.5 rounded-md bg-background/50 ${getScoreColor(score)}`}>{score}</span>}</div>;
                })}
              </div>
            </div>
          </motion.div>
        )}
        {result?.error && <p className="text-red-400 text-sm text-center">{result.error}</p>}
      </div>
    </div>
  );
}