import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Loader2, Sparkles, Instagram, BarChart2 } from "lucide-react";
import { getTopics, generateScript } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Topic {
  id?: string;
  name: string;
  volume: number;
  momentum: "rising" | "falling" | "stable";
  change?: string;
  hashtags: string[];
  type?: string;
}

interface ScriptResult {
  hook: string;
  body: string;
  cta: string;
}

const periods = [
  { label: "This week", value: "7d" },
  { label: "Past month", value: "30d" },
  { label: "Past 3 months", value: "90d" },
];

const tabs = [
  { label: "Instagram Trends", value: "instagram", icon: Instagram },
  { label: "Finance Topics", value: "finance", icon: BarChart2 },
];

export default function TrendingPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("7d");
  const [activeTab, setActiveTab] = useState("instagram");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTopics(period, activeTab)
      .then((data) => {
        setTopics(Array.isArray(data) ? data : data.topics ?? []);
      })
      .catch(() => setError("Failed to load topics. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [period, activeTab]);

  const handleGenerate = (topic: Topic) => {
    setSelectedTopic(topic);
    setGenerating(true);
    setScript(null);
    setDialogOpen(true);
    generateScript(topic.id || topic.name)
      .then((data) => {
        setScript({ hook: data.hook ?? "", body: data.body ?? "", cta: data.cta ?? "" });
      })
      .catch(() => toast.error("Failed to generate script"))
      .finally(() => setGenerating(false));
  };

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    toast.success(`${section} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const MomentumIcon = ({ momentum }: { momentum: string }) => {
    if (momentum === "rising") return <ArrowUpRight className="w-3 h-3" />;
    if (momentum === "falling") return <ArrowDownRight className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const momentumColor = (m: string) =>
    m === "rising" ? "text-green-400" : m === "falling" ? "text-red-400" : "text-muted-foreground";

  return (
    <div className="flex-1 p-6 md:p-10 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Trending Topics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Finance · Instagram · Live Data</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Period filters */}
        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">{error}</div>
        )}

        {/* Topics list */}
        {!loading && !error && (
          <div className="grid gap-3">
            {topics.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">
                No topics found for this period.
              </p>
            )}
            {topics.map((topic, i) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{topic.volume} posts</span>
                    <span className={`text-xs flex items-center gap-0.5 ${momentumColor(topic.momentum)}`}>
                      <MomentumIcon momentum={topic.momentum} />
                      {topic.momentum}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-end">
                    {topic.hashtags?.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-accent text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 shrink-0"
                    onClick={() => handleGenerate(topic)}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Script
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Script Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Script for "{selectedTopic?.name}"</DialogTitle>
          </DialogHeader>
          {generating && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Generating…</span>
            </div>
          )}
          {!generating && script && (
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Hook</span>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => copyText(script.hook, "Hook")}>
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{script.hook}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Body</span>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => copyText(script.body, "Body")}>
                    Copy
                  </Button>
                </div>
                <Textarea readOnly value={script.body} className="min-h-[120px] bg-secondary/50 border-border text-foreground resize-none" />
              </div>
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-400">CTA</span>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => copyText(script.cta, "CTA")}>
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{script.cta}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}