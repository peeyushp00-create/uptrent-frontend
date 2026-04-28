import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Search, Copy, Check, Loader2, ChevronRight, Hash, Lightbulb, BarChart2, Sparkles } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const POPULAR_ACCOUNTS = [
  "beerbiceps", "techburner", "CarryMinati", "BBKiVines",
  "ashishchanchlani", "triggered_insaan", "prajakta_koli",
  "bhuvan.bam22", "slaypoint", "dhruvrathee",
];

export default function InstagramAnalyzer() {
  const [username, setUsername] = useState(() => localStorage.getItem('ig_analyzer_username') || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(() => {
    const saved = localStorage.getItem('ig_analyzer_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('ig_analyzer_username', username); }, [username]);

  useEffect(() => {
    const val = username.replace('@', '').trim();
    if (val.length > 0) {
      const filtered = POPULAR_ACCOUNTS.filter(s =>
        s.toLowerCase().includes(val.toLowerCase()) && s.toLowerCase() !== val.toLowerCase()
      ).slice(0, 5);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else { setShowDropdown(false); setDropdownSuggestions([]); }
  }, [username]);

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

  const handleAnalyze = async (uname?: string) => {
    const target = (uname || username).replace('@', '').trim();
    if (!target) return;
    setUsername(target); setShowDropdown(false); setLoading(true); setResult(null);
    try {
      const res = await fetch(`${BASE}/api/instagram/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: target }),
      });
      const data = await res.json();
      setResult(data);
      localStorage.setItem('ig_analyzer_result', JSON.stringify(data));
      localStorage.setItem('ig_analyzer_username', target);
    } catch { setResult({ error: 'Failed to analyze profile. Try again.' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-500" />
          <h1 className="text-lg font-bold text-foreground">Instagram Analyzer</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        <div>
          <h2 className="font-semibold text-foreground mb-1">Analyze Any Instagram Profile</h2>
          <p className="text-xs text-muted-foreground">Enter any Instagram username to get content ideas, hashtags and posting strategy</p>
        </div>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <input ref={inputRef} value={username} onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); if (e.key === "Escape") setShowDropdown(false); }}
                onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                placeholder="username (e.g. beerbiceps, techburner)"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 text-sm"
              />
            </div>
            <button onClick={() => handleAnalyze()} disabled={loading}
              className="px-4 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
          {showDropdown && dropdownSuggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" style={{ width: 'calc(100% - 60px)' }}>
              {dropdownSuggestions.map((s, i) => (
                <button key={i} onClick={() => handleAnalyze(s)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left">
                  <Instagram className="w-3.5 h-3.5 text-muted-foreground shrink-0" />@{s}
                </button>
              ))}
            </div>
          )}
        </div>
        {!username && !result && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Popular accounts:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ACCOUNTS.map((acc) => (
                <button key={acc} onClick={() => handleAnalyze(acc)} className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">@{acc}</button>
              ))}
            </div>
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            <p className="text-sm text-muted-foreground">Analyzing @{username.replace('@', '')}...</p>
          </div>
        )}
        {result && !result.error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {result.summary && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><Instagram className="w-4 h-4 text-pink-500" /><p className="text-xs font-bold uppercase text-pink-400">Profile Summary</p></div>
                <p className="text-sm text-foreground">{result.summary}</p>
              </div>
            )}
            {result.content_pillars && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><BarChart2 className="w-4 h-4 text-blue-400" /><p className="text-xs font-bold uppercase text-blue-400">Content Pillars</p></div>
                <div className="space-y-1.5">
                  {result.content_pillars.map((pillar: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground"><ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{pillar}</div>
                  ))}
                </div>
              </div>
            )}
            {result.reel_ideas && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><Lightbulb className="w-4 h-4 text-yellow-400" /><p className="text-xs font-bold uppercase text-yellow-400">Reel Ideas for You</p></div>
                <div className="space-y-2">
                  {result.reel_ideas.map((idea: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-secondary/30">
                      <span className="text-xs text-muted-foreground mt-0.5 w-4 shrink-0">{i + 1}.</span>
                      <p className="text-sm text-foreground flex-1">{idea}</p>
                      <button onClick={() => copyText(idea, `idea-${i}`)}>{copied === `idea-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.hashtags && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-green-400" /><p className="text-xs font-bold uppercase text-green-400">Hashtag Strategy</p></div>
                  <button onClick={() => copyText(result.hashtags.join(' '), 'hashtags')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    {copied === 'hashtags' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copy All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map((tag: string, i: number) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">{tag.startsWith('#') ? tag : `#${tag}`}</span>
                  ))}
                </div>
              </div>
            )}
            {result.posting_tips && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-orange-400" /><p className="text-xs font-bold uppercase text-orange-400">Posting Strategy</p></div>
                <div className="space-y-1.5">
                  {result.posting_tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-foreground"><span className="text-pink-500 shrink-0 mt-0.5">•</span>{tip}</div>
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