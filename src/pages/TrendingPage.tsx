import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Minus,
  Loader2, Sparkles, Search, Newspaper, Hash, Copy, Check
} from "lucide-react";
import { getTopics, getNews, generateScript } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Topic {
  id?: string;
  name: string;
  volume: number;
  momentum: "rising" | "falling" | "stable";
  hashtags: string[];
  type?: string;
}

interface NewsArticle {
  id?: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  published_at: string;
}

interface ScriptResult {
  hook: string;
  body: string;
  cta: string;
}

const SUGGESTED = [
  "Fitness", "Motivation", "Stock Market", "Crypto",
  "Travel", "Food", "Tech", "Business",
  "Fashion", "Gaming", "Comedy", "Cricket",
  "Education", "Yoga", "Entrepreneur", "Bollywood",
  "Cooking", "Investing", "Skincare", "Mental Health"
];
export default function TrendingPage() {
  const location = useLocation();
  const initialQuery = (location.state as any)?.query || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"topics" | "news">("topics");

  useEffect(() => {
    if (initialQuery) handleSearch(initialQuery);
  }, []);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setSearchInput(q);
    setLoading(true);
    setError(null);
    setTopics([]);
    setNews([]);

    try {
     const topicsRaw = await getTopics("7d");
const topicsArr: Topic[] = Array.isArray(topicsRaw) ? topicsRaw : topicsRaw.topics ?? [];
      const searchTerms = q.toLowerCase().split(' ');
const filteredTopics = topicsArr.filter((t: Topic) => {
  const q_lower = q.toLowerCase();
  const nameMatch = t.name.toLowerCase().includes(q_lower);
  const hashtagMatch = t.hashtags?.some((h: string) =>
    h.toLowerCase().includes(q_lower)
  );
  const partialMatch = q_lower.split(' ').some(term =>
    t.name.toLowerCase().includes(term) ||
    t.hashtags?.some((h: string) => h.toLowerCase().includes(term))
  );
  return nameMatch || hashtagMatch || partialMatch;
});

      const newsRaw = await getNews();
      const newsArr: NewsArticle[] = Array.isArray(newsRaw) ? newsRaw : newsRaw.articles ?? [];
      const filteredNews = newsArr.filter((n: NewsArticle) =>
        n.headline?.toLowerCase().includes(q.toLowerCase()) ||
        n.summary?.toLowerCase().includes(q.toLowerCase())
      );

      setTopics(filteredTopics);
      setNews(filteredNews);
    } catch {
      setError("Failed to load data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = (topic: Topic) => {
    setSelectedTopic(topic);
    setGenerating(true);
    setScript(null);
    setDialogOpen(true);
    generateScript(topic.id || topic.name)
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

const renderReadLink = (url: string) => {
  return (
    
     <a href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
    >
      Read
    </a>
  );
};

  return (
    <div className="flex-1 p-6 md:p-10 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Trending Topics
          </h1>
        <p className="text-sm text-muted-foreground mt-1">Search any topic to discover trending content ideas</p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchInput)}
           placeholder="Search any topic (e.g. Fitness, Travel, Finance)..."
            className="flex-1 px-5 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
          />
          <button
            onClick={() => handleSearch(searchInput)}
            className="px-6 py-3 rounded-xl text-white font-medium text-sm flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {!query && (
          <div className="flex flex-wrap gap-2">
            <p className="w-full text-xs text-muted-foreground mb-1">Try searching:</p>
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Searching for "{query}"...</span>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">{error}</div>
        )}

        {!loading && !error && query && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <button
                onClick={() => setActiveSection("topics")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === "topics"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Hash className="w-4 h-4" />
                Trending topics
                {topics.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-xs">
                    {topics.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSection("news")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === "news"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Newspaper className="w-4 h-4" />
                Related news
                {news.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-xs">
                    {news.length}
                  </span>
                )}
              </button>
            </div>

            {activeSection === "topics" && (
              <div className="grid gap-3">
                {topics.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-sm">No trending topics found for "{query}"</p>
                    <p className="text-muted-foreground text-xs mt-1">Try a broader search term</p>
                  </div>
                ) : (
                  topics.map((topic, i) => (
                    <motion.div
                      key={topic.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {topic.name}
                          </h3>
                          {topic.type === "instagram" && (
  <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400">
    Instagram
  </span>
)}
                          
                        </div>
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
                          {topic.hashtags?.slice(0, 3).map((tag) => (
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
                  ))
                )}
              </div>
            )}

            {activeSection === "news" && (
              <div className="grid gap-3">
                {news.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-sm">No news found for "{query}"</p>
                    <p className="text-muted-foreground text-xs mt-1">Try a broader search term</p>
                  </div>
                ) : (
                  news.map((article, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm leading-snug">
                            {article.headline}
                          </h3>
                          {article.summary && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {article.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {article.source && (
                              <span className="text-xs text-muted-foreground">{article.source}</span>
                            )}
                            {article.published_at && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(article.published_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {article.url && renderReadLink(article.url)}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

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
                    {copied === "Hook" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                  </Button>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{script.hook}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Body</span>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => copyText(script.body, "Body")}>
                    {copied === "Body" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                  </Button>
                </div>
                <Textarea readOnly value={script.body} className="min-h-[120px] bg-secondary/50 border-border text-foreground resize-none" />
              </div>
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-400">CTA</span>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => copyText(script.cta, "CTA")}>
                    {copied === "CTA" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
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