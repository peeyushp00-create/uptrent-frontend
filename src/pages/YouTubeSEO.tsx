import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles, Copy, Check, Loader2, Search, TrendingUp, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';
import { getPageState, setPageState } from '@/lib/pageCache';
import SEO from '@/components/SEO';

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
  const { t } = useTranslation();
  const { theme } = useTheme();
  const _saved = getPageState('ytSeo');
  const [topic, setTopic] = useState(_saved?.topic ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(_saved?.result ?? null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const _stateRef = useRef<any>({});
  useEffect(() => { _stateRef.current = { topic, result }; });
  useEffect(() => () => { setPageState('ytSeo', _stateRef.current); }, []);

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

  const handleGenerate = async (tp?: string) => {
    const target = tp || topic;
    if (!target.trim()) return;
    setTopic(target); setShowDropdown(false); setLoading(true); setResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: target, niche: user?.user_metadata?.niche, language: user?.user_metadata?.language })
      });
      const data = await res.json();
      setResult(data);
    } catch { setResult({ error: 'Failed to generate SEO. Try again.' }); }
    finally { setLoading(false); }
  };

  return (
    <div className={`theme-redesign ${theme} min-h-screen bg-background text-foreground`}>
      <SEO title="YouTube SEO — SocialRum" noindex />

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-heading text-2xl font-bold mb-1">SEO Generator</h1>
        <p className="text-sm text-muted-foreground mb-6">Get optimized titles, descriptions, and scored tags for any video topic.</p>

        <section className="panel p-6 mb-6">
          <div className="eyebrow text-muted-foreground mb-4">
            <Sparkles className="size-3.5 text-primary" /> Video topic
          </div>
          <div className="relative flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); if (e.key === "Escape") setShowDropdown(false); }}
                  onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                  placeholder="e.g. 'How to invest in stocks'"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
              {showDropdown && dropdownSuggestions.length > 0 && (
                <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  {dropdownSuggestions.map((s, i) => (
                    <button key={i} onClick={() => handleGenerate(s)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors text-left">
                      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Generate SEO
            </button>
          </div>
        </section>

        {result && !result.error && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-6 mb-8 space-y-6">
            {result.titles?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="eyebrow text-muted-foreground">Titles — pick one</div>
                </div>
                <div className="space-y-2">
                  {result.titles.map((title: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-xs text-muted-foreground mt-0.5 w-4 shrink-0">{i + 1}.</span>
                      <p className="text-sm flex-1">{title}</p>
                      <button onClick={() => copyText(title, `title-${i}`)} className="text-muted-foreground hover:text-foreground">
                        {copied === `title-${i}` ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.description && <Field label="Description" value={result.description} multiline onCopy={copyText} copiedKey="description" copied={copied} />}

            {result.tags?.length > 0 && (
              <div>
                <div className="eyebrow text-muted-foreground mb-3">Scored tags</div>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag: any, i: number) => {
                    const tagName = (tag.tag || tag).toString().replace(/\s+/g, "");
                    const score = tag.score ?? null;
                    return (
                      <div key={i} className="chip flex items-center gap-2">
                        <span>#{tagName}</span>
                        {score != null && (
                          <span className="flex items-center gap-1 text-primary text-[11px] font-semibold">
                            <Star className="size-3 fill-primary" /> {score}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {result?.error && <p className="text-sm text-destructive mb-6">{result.error}</p>}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}

        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" /> Popular topics
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SEO_SUGGESTIONS.slice(0, 10).map((p) => (
              <button key={p} onClick={() => handleGenerate(p)} className="panel p-4 text-left hover:border-primary transition text-sm">
                {p}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, multiline, onCopy, copiedKey, copied }: { label: string; value: string; multiline?: boolean; onCopy: (v: string, k: string) => void; copiedKey: string; copied: string | null }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="eyebrow text-muted-foreground">{label}</div>
        <button onClick={() => onCopy(value, copiedKey)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          {copied === copiedKey ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />} Copy
        </button>
      </div>
      {multiline ? (
        <p className="text-sm bg-muted/40 border border-border rounded-xl p-4 whitespace-pre-wrap">{value}</p>
      ) : (
        <div className="text-base font-medium bg-muted/40 border border-border rounded-xl p-4">{value}</div>
      )}
    </div>
  );
}
