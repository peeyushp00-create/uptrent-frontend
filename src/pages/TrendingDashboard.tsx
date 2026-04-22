import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Sparkles, Loader2, Flame, BarChart2 } from "lucide-react";
import { getTopics, generateScript } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Topic {
  id?: string;
  name: string;
  volume: number;
  momentum: "rising" | "falling" | "stable";
  hashtags: string[];
  type?: string;
  trend_score?: number;
}

interface ScriptResult {
  hook: string;
  body: string;
  cta: string;
}

export default function TrendingDashboard() {
  const { user } = useAuth();
  const userNiche = user?.user_metadata?.niche || 'General';
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forYou' | 'all'>('forYou');

  useEffect(() => {
    setLoading(true);
    getTopics("7d")
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : data.topics ?? [];
        // Sort by trend_score
        const sorted = arr.sort((a: Topic, b: Topic) => 
          (b.trend_score || 0) - (a.trend_score || 0)
        );
        setTopics(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  const forYouTopics = topics.filter(t =>
    t.name.toLowerCase().includes(userNiche.toLowerCase()) ||
    t.hashtags?.some(h => h.toLowerCase().includes(userNiche.toLowerCase()))
  );

  const displayTopics = activeTab === 'forYou' && forYouTopics.length > 0
    ? forYouTopics
    : topics;

  const handleGenerate = (topic: Topic) => {
    setSelectedTopic(topic);
    setGenerating(true);
    setScript(null);
    setDialogOpen(true);
    generateScript(topic.id || topic.name, user?.user_metadata?.niche)
      .then((data: any) => {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-muted-foreground";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "🔥 Hot";
    if (score >= 60) return "📈 Rising";
    return "📊 Stable";
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-pink-500" />
              Trending Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Top trending topics · Updated daily
              {userNiche && <span className="ml-1 text-pink-500">· {userNiche} creator</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-500 text-xs font-medium">
            <Flame className="w-3 h-3" />
            Live Data
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'forYou'
                ? "text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            style={activeTab === 'forYou' ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
          >
            For You ({forYouTopics.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? "text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            style={activeTab === 'all' ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
          >
            All Topics ({topics.length})
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {!loading && (
          <div className="grid gap-3">
            {displayTopics.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">
                No trending topics found for your niche yet.
              </p>
            )}
          {displayTopics.map((topic, i) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-pink-500/30 transition-colors group"
              >
                {/* Rank */}
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>

                {/* Topic info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-foreground group-hover:text-pink-500 transition-colors">
                      {topic.name}
                    </h3>
                    {topic.trend_score !== undefined && topic.trend_score > 0 && (
                      <span className={`text-xs font-medium ${getScoreColor(topic.trend_score)}`}>
                        {getScoreLabel(topic.trend_score)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">{topic.volume} posts</span>
                    <span className={`text-xs flex items-center gap-0.5 ${momentumColor(topic.momentum)}`}>
                      <MomentumIcon momentum={topic.momentum} />
                      {topic.momentum}
                    </span>
                    {topic.trend_score !== undefined && topic.trend_score > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <BarChart2 className="w-3 h-3" />
                        Score: {topic.trend_score}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hashtags */}
                <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-end max-w-xs">
                  {topic.hashtags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-accent text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Generate button */}
                <button
                  onClick={() => handleGenerate(topic)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-medium shrink-0"
                  style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Script
                </button>
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