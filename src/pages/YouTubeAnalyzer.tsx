import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Copy, Check, Loader2, ChevronRight, Youtube, X } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const POPULAR_CHANNELS = [
  "MrBeast", "PewDiePie", "CarryMinati", "Technical Guruji",
  "Bhuvan Bam", "Amit Bhadana", "Triggered Insaan",
  "Dhruv Rathee", "Ranveer Allahbadia", "Slayy Point",
];

export default function YouTubeAnalyzer() {
  const [channelUrl, setChannelUrl] = useState(() => localStorage.getItem('yt_analyzer_channel') || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(() => {
    const saved = localStorage.getItem('yt_analyzer_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('yt_analyzer_channel', channelUrl); }, [channelUrl]);

  useEffect(() => {
    if (channelUrl.trim().length > 0) {
      const filtered = POPULAR_CHANNELS.filter(s =>
        s.toLowerCase().includes(channelUrl.toLowerCase()) && s.toLowerCase() !== channelUrl.toLowerCase()
      ).slice(0, 5);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else { setShowDropdown(false); setDropdownSuggestions([]); }
  }, [channelUrl]);

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

  const handleClear = () => {
    setChannelUrl(''); setResult(null);
    localStorage.removeItem('yt_analyzer_result');
    localStorage.removeItem('yt_analyzer_channel');
  };

  const handleAnalyze = async (channel?: string) => {
    const target = channel || channelUrl;
    if (!target.trim()) return;
    setChannelUrl(target); setShowDropdown(false); setLoading(true); setResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: target }),
      });
      const data = await res.json();
      setResult(data);
      localStorage.setItem('yt_analyzer_result', JSON.stringify(data));
      localStorage.setItem('yt_analyzer_channel', target);
    } catch { setResult({ error: 'Failed to analyze channel. Try again.' }); }
    finally { setLoading(false); }
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
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input ref={inputRef} value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); if (e.key === "Escape") setShowDropdown(false); }}
                onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                placeholder="Channel name (e.g. MrBeast, Ashish Chanchlani)"
                className="w-full px-4 pr-9 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 text-sm"
              />
              {channelUrl && (
                <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => handleAnalyze()} disabled={loading}
              className="px-4 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #E8B84B, #C17D20)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
          {showDropdown && dropdownSuggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" style={{ width: 'calc(100% - 60px)' }}>
              {dropdownSuggestions.map((s, i) => (
                <button key={i} onClick={() => handleAnalyze(s)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left">
                  <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />{s}
                </button>
              ))}
            </div>
          )}
        </div>
        {!channelUrl && !result && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Popular channels:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CHANNELS.map((ch) => (
                <button key={ch} onClick={() => handleAnalyze(ch)} className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{ch}</button>
              ))}
            </div>
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <p className="text-xs text-muted-foreground">Analyzing {channelUrl}...</p>
          </div>
        )}
        {result && !result.error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {result.summary && <div className="bg-card border border-border rounded-2xl p-4"><p className="text-xs font-bold uppercase text-red-400 mb-2">📊 Channel Summary</p><p className="text-sm text-foreground">{result.summary}</p></div>}
            {result.content_pillars && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-bold uppercase text-blue-400 mb-2">🏛️ Content Pillars</p>
                <div className="space-y-1.5">
                  {result.content_pillars.map((pillar: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground"><ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{pillar}</div>
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
                      <button onClick={() => copyText(idea, `idea-${i}`)}>{copied === `idea-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
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
