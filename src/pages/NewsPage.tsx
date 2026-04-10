import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, ExternalLink, Loader2, X } from "lucide-react";
import { getNews } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface NewsArticle {
  id?: string;
  title?: string;
  headline?: string;
  summary?: string;
  source?: string;
  sourceName?: string;
  date?: string;
  publishedAt?: string;
  tag?: string;
  topicName?: string;
  topic?: string;
  url?: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getNews()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.articles ?? data?.data ?? [];
        setArticles(list);
      })
      .catch(() => setError("Failed to load news"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="w-6 h-6" /> Live Financial News
        </h1>
        <p className="text-muted-foreground mt-1">Real-time context for your content</p>
      </div>

      {loading && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}
      {error && <div className="text-center py-16 text-red-400">{error}</div>}
      {!loading && !error && articles.length === 0 && <div className="text-center py-16 text-muted-foreground">No news available</div>}

      {!loading && !error && articles.length > 0 && (
        <div className="grid gap-4">
          {articles.map((item, i) => {
            const headline = item.title || item.headline || "Untitled";
            const summary = item.summary || "";
            const source = item.sourceName || item.source || "";
            const date = item.publishedAt || item.date || "";
            const topic = item.topicName || item.topic || item.tag || "";

            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{headline}</h3>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {source && <span className="text-xs text-muted-foreground">{source}</span>}
                      {source && date && <span className="text-xs text-muted-foreground">·</span>}
                      {date && <span className="text-xs text-muted-foreground">{date}</span>}
                      {topic && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">{topic}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 mt-1">
                    <button
                      onClick={() => setSelectedArticle(item)}
                      className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Summary
                    </button>
                    {item.url && (
                      <button
                        onClick={() => window.open(item.url, '_blank')}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary Popup */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-semibold text-foreground pr-4">{selectedArticle.title || selectedArticle.headline}</h2>
                <button onClick={() => setSelectedArticle(null)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {selectedArticle.summary || "No summary available."}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{selectedArticle.sourceName || selectedArticle.source}</span>
                {selectedArticle.url && (
                  <button
                    onClick={() => window.open(selectedArticle.url, '_blank')}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Read full article <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
