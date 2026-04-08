import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Loader2 } from "lucide-react";
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
    <div className="flex-1 p-6 md:p-10 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            Live Financial News
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time context for your content</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-destructive">{error}</div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No news available</div>
        )}

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
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{headline}</h3>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{summary}</p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {source && <span className="text-xs text-muted-foreground">{source}</span>}
                        {source && date && <span className="text-xs text-muted-foreground">·</span>}
                        {date && <span className="text-xs text-muted-foreground">{date}</span>}
                        {topic && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">{topic}</Badge>}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
