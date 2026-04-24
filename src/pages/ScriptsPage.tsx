import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Clock, RefreshCw } from "lucide-react";
import { generateScript } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const MODES = [
  { id: "full", label: "Full Script", description: "Hook + Body + CTA" },
  { id: "hook", label: "Hook Only", description: "Viral opening line" },
  { id: "body", label: "Body Only", description: "Main script content" },
  { id: "cta", label: "CTA Only", description: "Call to action" },
];

export default function ScriptsPage() {
  const { user } = useAuth();
  const userNiche = user?.user_metadata?.niche || '';
  const userLanguage = user?.user_metadata?.language || 'hindi';

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [script, setScript] = useState<any | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [mode, setMode] = useState('full');
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('script_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (topic: string) => {
    const updated = [topic, ...history.filter(h => h !== topic)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('script_history', JSON.stringify(updated));
  };

  const handleGenerate = async (topic: string) => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError('');
    setSelectedTopic(topic);
    saveToHistory(topic);
    try {
      const result = await generateScript(topic, userNiche, userLanguage);
      // Filter result based on mode
      if (mode === 'hook') setScript({ hook: result.hook });
      else if (mode === 'body') setScript({ body: result.body });
      else if (mode === 'cta') setScript({ cta: result.cta });
      else setScript(result);
    } catch (err) {
      setError('Failed to generate. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    if (!script) return;
    const parts = [];
    if (script.hook) parts.push(`HOOK:\n${script.hook}`);
    if (script.body) parts.push(`BODY:\n${script.body}`);
    if (script.cta) parts.push(`CTA:\n${script.cta}`);
    navigator.clipboard.writeText(parts.join('\n\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6" /> Script Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate unique ready-to-film scripts from any topic
          {userNiche && <span className="ml-1 text-pink-500">· {userNiche}</span>}
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setScript(null); }}
            className={`p-3 rounded-xl border text-left transition-all ${
              mode === m.id
                ? "border-transparent text-white"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            style={mode === m.id ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
          >
            <p className="text-xs font-semibold">{m.label}</p>
            <p className="text-xs opacity-70 mt-0.5">{m.description}</p>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate(topicInput)}
          placeholder="Enter any topic (e.g. Fitness, Cricket, Finance)"
          className="flex-1 p-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
        />
        <button
          onClick={() => handleGenerate(topicInput)}
          disabled={generating}
          className="px-6 py-3 rounded-xl text-white flex items-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
        >
          <Sparkles className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

      {/* Result */}
      {script && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-foreground">
              {MODES.find(m => m.id === mode)?.label} for "{selectedTopic}"
            </h2>
            {mode === 'full' && (
              <button
                onClick={copyAll}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === 'all' ? 'Copied!' : 'Copy All'}
              </button>
            )}
          </div>

          {/* Hook */}
          {script.hook && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-blue-400 uppercase font-semibold">Hook</p>
                <button onClick={() => copyText(script.hook, 'hook')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  {copied === 'hook' ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <p className="text-foreground text-sm">{script.hook}</p>
            </div>
          )}

          {/* Body */}
          {script.body && (
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Body</p>
                <button onClick={() => copyText(script.body, 'body')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  {copied === 'body' ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <p className="text-foreground text-sm whitespace-pre-wrap">{script.body}</p>
            </div>
          )}

          {/* CTA */}
          {script.cta && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
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
              <Clock className="w-4 h-4" />
              ~{script.duration_seconds} seconds
            </div>
          )}

          <button
            onClick={() => handleGenerate(selectedTopic || topicInput)}
            disabled={generating}
            className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className="w-4 h-4" />
            {generating ? 'Generating...' : `Generate Another ${MODES.find(m => m.id === mode)?.label}`}
          </button>
        </motion.div>
      )}

      {/* Search History */}
      {history.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-pink-500" /> Recent Searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {history.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setTopicInput(item);
                  handleGenerate(item);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Clock className="w-3 h-3" />
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}