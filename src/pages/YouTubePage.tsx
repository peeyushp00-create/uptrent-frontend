import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Youtube, Search, Sparkles, Copy, Check, Loader2,
  Tag, FileText, TrendingUp, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const TABS = [
  { id: "seo", label: "SEO", icon: Tag },
  { id: "script", label: "Script", icon: FileText },
  { id: "analyzer", label: "Analyzer", icon: Search },
  { id: "trending", label: "Trending", icon: TrendingUp },
];

const TRENDING_TOPICS = [
  "AI tools for beginners", "How to make money online India 2026",
  "Budget smartphone review", "Stock market basics Hindi",
  "Weight loss transformation", "ChatGPT tutorial Hindi",
  "Travel vlog India", "Passive income ideas",
  "Python for beginners", "Best OTT shows 2026",
  "Home workout no equipment", "Crypto explained simply",
  "Study motivation", "Car review India",
  "Cooking quick meals", "Mental health tips",
];

export default function YouTubePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("seo");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // SEO state
  const [seoTopic, setSeoTopic] = useState("");
  const [seoResult, setSeoResult] = useState<any>(null);

  // Script state
  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptDuration, setScriptDuration] = useState(5);
  const [scriptResult, setScriptResult] = useState<any>(null);

  // Analyzer state
  const [channelUrl, setChannelUrl] = useState("");
  const [analyzerResult, setAnalyzerResult] = useState<any>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["seo", "script", "analyzer", "trending"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const handleSEO = async () => {
    if (!seoTopic.trim()) return;
    setLoading(true);
    setSeoResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: seoTopic, niche: user?.user_metadata?.niche, language: user?.user_metadata?.language }),
      });
      const data = await res.json();
      setSeoResult(data);
    } catch {
      setSeoResult({ error: 'Failed to generate SEO. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleScript = async () => {
    if (!scriptTopic.trim()) return;
    setLoading(true);
    setScriptResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: scriptTopic, duration: scriptDuration, niche: user?.user_metadata?.niche, language: user?.user_metadata?.language }),
      });
      const data = await res.json();
      setScriptResult(data);
    } catch {
      setScriptResult({ error: 'Failed to generate script. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzer = async () => {
    if (!channelUrl.trim()) return;
    setLoading(true);
    setAnalyzerResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl }),
      });
      const data = await res.json();
      setAnalyzerResult(data);
    } catch {
      setAnalyzerResult({ error: 'Failed to analyze channel. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-500" />
          <h1 className="text-lg font-bold text-foreground">YouTube Tools</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border text-center transition-all ${
                activeTab === tab.id ? 'text-white border-transparent' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              style={activeTab === tab.id ? { background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" } : {}}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SEO TAB */}
        {activeTab === "seo" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div>
              <h2 className="font-semibold text-foreground mb-1">YouTube SEO Generator</h2>
              <p className="text-xs text-muted-foreground">Get optimized title, description and scored tags</p>
            </div>
            <div className="flex gap-2">
              <input
                value={seoTopic}
                onChange={(e) => setSeoTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSEO()}
                placeholder="Enter video topic (e.g. How to invest in stocks)"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 text-sm"
              />
              <button
                onClick={handleSEO}
                disabled={loading}
                className="px-4 py-3 rounded-xl text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
              >
                <Sparkles className="w-4 h-4" />
                {loading ? '...' : 'Generate'}
              </button>
            </div>

            {loading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>}

            {seoResult && !seoResult.error && (
              <div className="space-y-3">
                {/* Titles */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <p className="text-xs font-bold uppercase text-red-400 mb-3">🎯 Titles</p>
                  <div className="space-y-2">
                    {seoResult.titles?.map((title: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-secondary/30">
                        <span className="text-xs text-muted-foreground mt-0.5 w-4 shrink-0">{i + 1}.</span>
                        <p className="text-sm text-foreground flex-1">{title}</p>
                        <button onClick={() => copyText(title, `title-${i}`)}>
                          {copied === `title-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase text-blue-400">📝 Description</p>
                    <button onClick={() => copyText(seoResult.description, 'desc')} className="flex items-center gap-1 text-xs text-muted-foreground">
                      {copied === 'desc' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copy
                    </button>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{seoResult.description}</p>
                </div>

                {/* Tags with scores */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase text-green-400">🏷️ Tags with Score</p>
                    <button
                      onClick={() => copyText(seoResult.tags?.map((t: any) => t.tag || t).join(', '), 'tags')}
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      {copied === 'tags' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copy All
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 80+ High</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 60+ Medium</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Below 60 Low</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seoResult.tags?.map((tag: any, i: number) => {
                      const tagName = tag.tag || tag;
                      const score = tag.score || null;
                      return (
                        <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs ${getScoreBg(score || 50)}`}>
                          <span className={getScoreColor(score || 50)}>{tagName}</span>
                          {score && (
                            <span className={`font-bold text-xs px-1 py-0.5 rounded-md bg-background/50 ${getScoreColor(score)}`}>
                              {score}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {seoResult?.error && <p className="text-red-400 text-sm text-center">{seoResult.error}</p>}
          </motion.div>
        )}

        {/* SCRIPT TAB */}
        {activeTab === "script" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div>
              <h2 className="font-semibold text-foreground mb-1">YouTube Script Generator</h2>
              <p className="text-xs text-muted-foreground">Generate full video scripts with intro, sections and outro</p>
            </div>
            <input
              value={scriptTopic}
              onChange={(e) => setScriptTopic(e.target.value)}
              placeholder="Enter video topic (e.g. 5 Ways to Save Money)"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 text-sm"
            />
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Video Duration</p>
              <div className="flex gap-2">
                {[3, 5, 8, 10].map((d) => (
                  <button
                    key={d}
                    onClick={() => setScriptDuration(d)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                      scriptDuration === d ? 'text-white border-transparent' : 'border-border text-muted-foreground'
                    }`}
                    style={scriptDuration === d ? { background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" } : {}}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleScript}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Generating Script...' : 'Generate Script'}
            </button>
            {loading && (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <p className="text-xs text-muted-foreground">Writing your {scriptDuration}-minute script...</p>
              </div>
            )}
            {scriptResult && !scriptResult.error && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Your Script</p>
                  <button
                    onClick={() => copyText(
                      `TITLE: ${scriptResult.title}\n\nINTRO:\n${scriptResult.intro}\n\n${scriptResult.sections?.map((s: any, i: number) => `SECTION ${i+1}: ${s.heading}\n${s.content}`).join('\n\n')}\n\nOUTRO:\n${scriptResult.outro}`,
                      'all'
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground"
                  >
                    {copied === 'all' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copy All
                  </button>
                </div>
                {scriptResult.title && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase text-red-400 mb-1">🎯 Suggested Title</p>
                    <p className="text-sm text-foreground font-medium">{scriptResult.title}</p>
                  </div>
                )}
                {scriptResult.intro && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase text-blue-400">🎬 Intro</p>
                      <button onClick={() => copyText(scriptResult.intro, 'intro')}>{copied === 'intro' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{scriptResult.intro}</p>
                  </div>
                )}
                {scriptResult.sections?.map((section: any, i: number) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground">📌 {section.heading}</p>
                      <button onClick={() => copyText(section.content, `sec-${i}`)}>{copied === `sec-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{section.content}</p>
                  </div>
                ))}
                {scriptResult.outro && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase text-green-400">🎯 Outro & CTA</p>
                      <button onClick={() => copyText(scriptResult.outro, 'outro')}>{copied === 'outro' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{scriptResult.outro}</p>
                  </div>
                )}
              </div>
            )}
            {scriptResult?.error && <p className="text-red-400 text-sm text-center">{scriptResult.error}</p>}
          </motion.div>
        )}

        {/* ANALYZER TAB */}
        {activeTab === "analyzer" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div>
              <h2 className="font-semibold text-foreground mb-1">Channel Analyzer</h2>
              <p className="text-xs text-muted-foreground">Enter any YouTube channel name to get content ideas</p>
            </div>
            <div className="flex gap-2">
              <input
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyzer()}
                placeholder="Channel name (e.g. MrBeast, Ashish Chanchlani)"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 text-sm"
              />
              <button
                onClick={handleAnalyzer}
                disabled={loading}
                className="px-4 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
            {loading && (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <p className="text-xs text-muted-foreground">Analyzing channel...</p>
              </div>
            )}
            {analyzerResult && !analyzerResult.error && (
              <div className="space-y-3">
                {analyzerResult.summary && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase text-red-400 mb-2">📊 Channel Summary</p>
                    <p className="text-sm text-foreground">{analyzerResult.summary}</p>
                  </div>
                )}
                {analyzerResult.content_pillars && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase text-blue-400 mb-2">🏛️ Content Pillars</p>
                    <div className="space-y-1.5">
                      {analyzerResult.content_pillars.map((pillar: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          {pillar}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {analyzerResult.video_ideas && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase text-green-400 mb-2">💡 Video Ideas</p>
                    <div className="space-y-2">
                      {analyzerResult.video_ideas.map((idea: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-secondary/30">
                          <span className="text-xs text-muted-foreground mt-0.5 w-4 shrink-0">{i + 1}.</span>
                          <p className="text-sm text-foreground flex-1">{idea}</p>
                          <button onClick={() => copyText(idea, `idea-${i}`)}>
                            {copied === `idea-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {analyzerResult?.error && <p className="text-red-400 text-sm text-center">{analyzerResult.error}</p>}
          </motion.div>
        )}

        {/* TRENDING TAB */}
        {activeTab === "trending" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div>
              <h2 className="font-semibold text-foreground mb-1">Trending on YouTube India</h2>
              <p className="text-xs text-muted-foreground">Popular topics to make videos about right now</p>
            </div>
            <div className="space-y-2">
              {TRENDING_TOPICS.map((topic, i) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-red-500/30 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  <p className="flex-1 text-sm text-foreground">{topic}</p>
                  <button
                    onClick={() => { setScriptTopic(topic); setActiveTab("script"); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-medium shrink-0"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Script
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
