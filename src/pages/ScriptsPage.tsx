import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Clock, RefreshCw, Mic, Search, X } from "lucide-react";
import { generateScript } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const MODES = [
  { id: "full", label: "Full Script", description: "Hook + Body + CTA" },
  { id: "hook", label: "Hook Only", description: "Viral opening line" },
  { id: "body", label: "Body Only", description: "Main script content" },
  { id: "cta", label: "CTA Only", description: "Call to action" },
];

const DURATION_OPTIONS = [
  { label: "30s", value: 30, description: "Quick Reel" },
  { label: "60s", value: 60, description: "Standard" },
  { label: "90s", value: 90, description: "Detailed" },
];

const SUGGESTIONS = [
  "Fitness", "Finance", "Cricket", "Bollywood", "Tech", "Food",
  "Travel", "Gaming", "Motivation", "Skincare", "Yoga", "Crypto",
  "Business", "Education", "Fashion", "Comedy", "IPL", "AI",
  "Real Estate", "Jobs", "Weight Loss", "Investing", "Startup",
];

export default function ScriptsPage() {
  const { user } = useAuth();
  const userNiche = user?.user_metadata?.niche || '';
  const userLanguage = user?.user_metadata?.language || 'hindi';
  const userVoiceStyle = user?.user_metadata?.voice_style || '';

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [script, setScript] = useState<any | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [mode, setMode] = useState('full');
  const [duration, setDuration] = useState(60);
  const [history, setHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('script_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (topicInput.trim().length > 0) {
      const filtered = SUGGESTIONS.filter(s => s.toLowerCase().includes(topicInput.toLowerCase()) && s.toLowerCase() !== topicInput.toLowerCase()).slice(0, 6);
      setDropdownSuggestions(filtered); setShowDropdown(filtered.length > 0);
    } else { setShowDropdown(false); setDropdownSuggestions([]); }
  }, [topicInput]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const saveToHistory = (topic: string) => {
    const updated = [topic, ...history.filter(h => h !== topic)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('script_history', JSON.stringify(updated));
  };

  const handleGenerate = async (topic: string) => {
    if (!topic.trim()) return;
    setGenerating(true); setError(''); setSelectedTopic(topic);
    setTopicInput(topic); setShowDropdown(false); saveToHistory(topic);
    try {
      const result = await generateScript(topic, userNiche, userLanguage, userVoiceStyle, duration);
      if (mode === 'hook') setScript({ hook: result.hook });
      else if (mode === 'body') setScript({ body: result.body });
      else if (mode === 'cta') setScript({ cta: result.cta });
      else setScript(result);
    } catch { setError('Failed to generate. Please try again.'); }
    finally { setGenerating(false); }
  };

  const handleClear = () => { setTopicInput(''); setScript(null); setSelectedTopic(null); };

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text); setCopied(section); setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    if (!script) return;
    const parts = [];
    if (script.hook) parts.push(`HOOK:\n${script.hook}`);
    if (script.body) parts.push(`BODY:\n${script.body}`);
    if (script.cta) parts.push(`CTA:\n${script.cta}`);
    navigator.clipboard.writeText(parts.join('\n\n'));
    setCopied('all'); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ Sticky header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-500" />
          <h1 className="text-lg font-bold text-foreground">Script Generator</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
        <div>
          <h2 className="font-semibold text-foreground mb-1">Generate Viral Scripts</h2>
          <p className="text-xs text-muted-foreground">
            Ready-to-film scripts from any topic
            {userVoiceStyle && <span className="text-green-400 ml-2 flex items-center gap-1 inline-flex"><Mic className="w-3 h-3" />Voice style active</span>}
          </p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id); setScript(null); }}
              className={`p-3 rounded-2xl border text-left transition-all ${mode === m.id ? "border-transparent text-white" : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"}`}
              style={mode === m.id ? { background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" } : {}}
            >
              <p className="text-xs font-semibold">{m.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{m.description}</p>
            </button>
          ))}
        </div>

        {/* Duration */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Script Duration
          </p>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button key={d.value} onClick={() => setDuration(d.value)}
                className={`flex-1 py-2.5 rounded-2xl border text-sm font-medium transition-all ${duration === d.value ? "text-white border-transparent" : "border-border text-muted-foreground hover:text-foreground"}`}
                style={duration === d.value ? { background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" } : {}}
              >
                <p className="font-semibold">{d.label}</p>
                <p className="text-xs opacity-70">{d.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input with autofill */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input ref={inputRef} type="text" value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(topicInput); if (e.key === "Escape") setShowDropdown(false); }}
                onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                placeholder="Enter any topic (e.g. Fitness, Cricket, Finance)"
                className="w-full px-4 pr-9 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
              />
              {topicInput && (
                <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => handleGenerate(topicInput)} disabled={generating}
              className="px-5 py-3 rounded-2xl text-white flex items-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {showDropdown && dropdownSuggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" style={{ width: 'calc(100% - 90px)' }}>
              {dropdownSuggestions.map((s, i) => (
                <button key={i} onClick={() => handleGenerate(s)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular chips */}
        {!topicInput && !script && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Popular topics:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.slice(0, 12).map((s) => (
                <button key={s} onClick={() => handleGenerate(s)} className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{s}</button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Result */}
        {script && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-foreground text-sm">{MODES.find(m => m.id === mode)?.label} for "{selectedTopic}"</h2>
              {mode === 'full' && (
                <button onClick={copyAll} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'all' ? 'Copied!' : 'Copy All'}
                </button>
              )}
            </div>
            {script.hook && (
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-blue-400 uppercase font-semibold">Hook</p>
                  <button onClick={() => copyText(script.hook, 'hook')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    {copied === 'hook' ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <p className="text-foreground text-sm">{script.hook}</p>
              </div>
            )}
            {script.body && (
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Body</p>
                  <button onClick={() => copyText(script.body, 'body')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    {copied === 'body' ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <p className="text-foreground text-sm whitespace-pre-wrap">{script.body}</p>
              </div>
            )}
            {script.cta && (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-green-400 uppercase font-semibold">CTA</p>
                  <button onClick={() => copyText(script.cta, 'cta')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    {copied === 'cta' ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <p className="text-foreground text-sm">{script.cta}</p>
              </div>
            )}
            {script.duration_seconds && mode === 'full' && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" />~{script.duration_seconds} seconds
              </div>
            )}
            <button onClick={() => handleGenerate(selectedTopic || topicInput)} disabled={generating}
              className="w-full py-2.5 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw className="w-4 h-4" />
              {generating ? 'Generating...' : `Generate Another ${MODES.find(m => m.id === mode)?.label}`}
            </button>
          </motion.div>
        )}

        {/* Recent Searches */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-pink-500" /> Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <button key={i} onClick={() => handleGenerate(item)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Clock className="w-3 h-3" />{item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
