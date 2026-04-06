import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Clock } from "lucide-react";
import ChatInput from "@/components/ChatInput";

const mockTopics = [
  "SIP vs Lump Sum",
  "RBI Rate Cut Impact",
  "Gold vs Equity 2026",
  "Tax Saving Tips",
  "Credit Card Mistakes",
];

const generateMockScript = (topic: string) => ({
  topic,
  hook: `"Stop! Before you invest another rupee, you NEED to know this about ${topic}..."`,
  body: `Here's what most people get wrong about ${topic}.\n\nFirst, let's look at the numbers. According to the latest data, this trend is growing fast on Instagram — and for good reason.\n\nThe key insight is simple: understanding ${topic} can literally save you lakhs over your investing journey.\n\nLet me break it down in 60 seconds...`,
  cta: `Follow @yourhandle for daily finance tips that actually make sense. Save this reel — you'll thank me later. 💰`,
  duration: "45-60 seconds",
});

export default function ScriptsPage() {
  const location = useLocation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [script, setScript] = useState<ReturnType<typeof generateMockScript> | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = (topic: string) => {
    setSelectedTopic(topic);
    setGenerating(true);
    setTimeout(() => {
      setScript(generateMockScript(topic));
      setGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    if (!script) return;
    const fullScript = `HOOK:\n${script.hook}\n\nSCRIPT:\n${script.body}\n\nCTA:\n${script.cta}`;
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChat = (message: string) => {
    handleGenerate(message);
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Script Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Select a topic or type your own to generate a ready-to-film script</p>
        </div>

        {/* Topic selection */}
        <div className="flex flex-wrap gap-2">
          {mockTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => handleGenerate(topic)}
              className={`action-chip ${selectedTopic === topic ? "border-primary bg-primary/10 text-primary" : ""}`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Chat input for custom topic */}
        <ChatInput onSubmit={handleChat} placeholder="Or type a custom topic..." />

        {/* Generated Script */}
        <AnimatePresence mode="wait">
          {generating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center gap-3 text-muted-foreground">
                <Sparkles className="w-5 h-5 animate-pulse text-primary" />
                <span className="text-sm">Generating your script...</span>
              </div>
            </motion.div>
          )}

          {!generating && script && (
            <motion.div
              key="script"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h3 className="font-heading font-semibold text-foreground">{script.topic}</h3>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {script.duration}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Hook (First 3 Seconds)</span>
                  <p className="mt-1.5 text-sm text-foreground font-medium italic">{script.hook}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Script Body</span>
                  <p className="mt-1.5 text-sm text-secondary-foreground whitespace-pre-line">{script.body}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Call to Action</span>
                  <p className="mt-1.5 text-sm text-foreground font-medium">{script.cta}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
