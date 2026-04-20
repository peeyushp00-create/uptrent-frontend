import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Clock, RefreshCw } from "lucide-react";
import { generateScript } from "@/lib/api";

export default function ScriptsPage() {
  const location = useLocation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [script, setScript] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [topicInput, setTopicInput] = useState('');

  const handleGenerate = async (topic: string) => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError('');
    setSelectedTopic(topic);
    try {
      const result = await generateScript(topic);
      setScript(result);
    } catch (err) {
      setError('Failed to generate script. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (script) {
      const text = `HOOK:\n${script.hook}\n\nBODY:\n${script.body}\n\nCTA:\n${script.cta}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6" /> Script Generator
        </h1>
        <p className="text-muted-foreground mt-1">Generate unique ready-to-film scripts from any topic</p>
      </div>

      <div className="flex gap-3 mb-8">
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

      {script && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Script for "{selectedTopic}"</h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <p className="text-xs text-blue-400 uppercase font-semibold mb-2">Hook</p>
            <p className="text-foreground text-sm">{script.hook}</p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Body</p>
            <p className="text-foreground text-sm whitespace-pre-wrap">{script.body}</p>
          </div>

          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-xs text-green-400 uppercase font-semibold mb-2">CTA</p>
            <p className="text-foreground text-sm">{script.cta}</p>
          </div>

          {script.duration_seconds && (
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
  {generating ? 'Generating...' : 'Generate Another Script'}
</button>
          >
            <RefreshCw className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Another Script'}
          </button>
        </motion.div>
      )}
    </div>
  );
}