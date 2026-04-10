import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Clock } from "lucide-react";
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
      const text = `${script.hook}\n\n${script.body}\n\n${script.cta}`;
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
        <p className="text-muted-foreground mt-1">Generate ready-to-film scripts from trending topics</p>
      </div>

      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          placeholder="Enter a topic (e.g. SIP vs Lump Sum)"
          className="flex-1 p-3 rounded-lg bg-card border border-border text-foreground"
        />
        <button
          onClick={() => handleGenerate(topicInput)}
          disabled={generating}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {script && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Script for "{selectedTopic}"</h2>
            <button onClick={handleCopy} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Hook</p>
            <p className="text-foreground">{script.hook}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Body</p>
            <p className="text-foreground whitespace-pre-wrap">{script.body}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">CTA</p>
            <p className="text-foreground">{script.cta}</p>
          </div>
          {script.duration && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              {script.duration}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}