import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Loader2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SCRIPT_SUGGESTIONS = [
  "5 Ways to Save Money India", "How to start investing India",
  "AI tools for content creators", "Weight loss tips for beginners",
  "How to learn coding in 2026", "Budget travel India tips",
  "Mental health tips for students", "IPL 2026 analysis",
  "How to grow Instagram in India", "Best business ideas India",
  "Python tutorial for beginners", "Stock market basics Hindi",
  "Skincare routine for men India", "How to speak English fluently",
  "Home workout for beginners", "Crypto investing India guide",
];

export default function YouTubeScript() {
  const { user } = useAuth();
  const [topic, setTopic] = useState(() => localStorage.getItem('yt_script_topic') || "");
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(() => {
    const saved = localStorage.getItem('yt_script_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('yt_script_topic', topic); }, [topic]);
  useEffect(() => { if (result) localStorage.setItem('yt_script_result', JSON.stringify(result)); }, [result]);

  useEffect(() => {
    if (topic.trim().length > 0) {
      const filtered = SCRIPT_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(topic.toLowerCase()) && s.toLowerCase() !== topic.toLowerCase()
      ).slice(0, 5);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else { setShowDropdown(false); setDropdownSuggestions([]); }
  }, [topic]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async (t?: string) => {
    const target = t || topic;
    if (!target.trim()) return;
    setTopic(target); setShowDropdown(false); setLoading(true); setResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/script`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: target, duration, niche: user?.user_metadata?.niche, language: user?.user_metadata?.language }),
      });
      const data = await res.json();
      setResult(data);
      localStorage.setItem('yt_script_result', JSON.stringify(data));
      localStorage.setItem('yt_script_topic', target);
    } catch { setResult({ error: 'Failed to generate script. Try again.' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          <h1 className="text-lg font-bold text-foreground">YouTube Script</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        <div>
          <h2 className="font-semibold text-foreground mb-1">Script Generator</h2>
          <p className="text-xs text-muted-foreground">Generate full video scripts with intro, sections and outro</p>
        </div>
        <div className="relative">
          <input ref={inputRef} value={topic} onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") setShowDropdown(false); }}
            onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
            placeholder="Enter video topic (e.g. 5 Ways to Save Money)"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 text-sm"
          />
          {showDropdown && dropdownSuggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              {dropdownSuggestions.map((s, i) => (
                <button key={i} onClick={() => handleGenerate(s)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{s}
                </button>
              ))}
            </div>
          )}
        </div>
        {!topic && !result && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Popular topics:</p>
            <div className="flex flex-wrap gap-2">
              {SCRIPT_SUGGESTIONS.slice(0, 8).map((s) => (
                <button key={s} onClick={() => setTopic(s)} className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{s}</button>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Video Duration</p>
          <div className="flex gap-2">
            {[3, 5, 8, 10].map((d) => (
              <button key={d} onClick={() => setDuration(d)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${duration === d ? 'text-white border-transparent' : 'border-border text-muted-foreground'}`}
                style={duration === d ? { background: "linear-gradient(135deg, #FF0000, #CC0000)" } : {}}
              >{d} min</button>
            ))}
          </div>
        </div>
        <button onClick={() => handleGenerate()} disabled={loading}
          className="w-full py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #FF0000, #CC0000)" }}
        >
          <Sparkles className="w-4 h-4" />
          {loading ? `Generating ${duration}-min script...` : 'Generate Script'}
        </button>
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <p className="text-xs text-muted-foreground">Writing your {duration}-minute script...</p>
          </div>
        )}
        {result && !result.error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Your Script</p>
              <button onClick={() => copyText(`TITLE: ${result.title}\n\nINTRO:\n${result.intro}\n\n${result.sections?.map((s: any, i: number) => `SECTION ${i+1}: ${s.heading}\n${s.content}`).join('\n\n')}\n\nOUTRO:\n${result.outro}`, 'all')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground">
                {copied === 'all' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copy All
              </button>
            </div>
            {result.title && <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4"><p className="text-xs font-bold uppercase text-red-400 mb-1">🎯 Suggested Title</p><p className="text-sm text-foreground font-medium">{result.title}</p></div>}
            {result.intro && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2"><p className="text-xs font-bold uppercase text-blue-400">🎬 Intro</p><button onClick={() => copyText(result.intro, 'intro')}>{copied === 'intro' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button></div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.intro}</p>
              </div>
            )}
            {result.sections?.map((section: any, i: number) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2"><p className="text-xs font-bold uppercase text-muted-foreground">📌 {section.heading}</p><button onClick={() => copyText(section.content, `sec-${i}`)}>{copied === `sec-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button></div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
            {result.outro && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2"><p className="text-xs font-bold uppercase text-green-400">🎯 Outro & CTA</p><button onClick={() => copyText(result.outro, 'outro')}>{copied === 'outro' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button></div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.outro}</p>
              </div>
            )}
          </motion.div>
        )}
        {result?.error && <p className="text-red-400 text-sm text-center">{result.error}</p>}
      </div>
    </div>
  );
}