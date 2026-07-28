import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, Eye, ThumbsUp, MessageCircle, Clock, Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { useTheme } from "@/contexts/ThemeContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface TrendingVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
  published_at: string | null;
  category: string | null;
  duration_secs: number;
  is_short: boolean;
  views: number;
  likes: number;
  comments: number;
  views_formatted: string;
  likes_formatted: string;
  comments_formatted: string;
}

type SortKey = 'views' | 'likes' | 'comments' | 'recent';

const SORTS: { key: SortKey; label: string; icon: typeof Eye }[] = [
  { key: 'views', label: 'Top Views', icon: Eye },
  { key: 'likes', label: 'Top Likes', icon: ThumbsUp },
  { key: 'comments', label: 'Most Commented', icon: MessageCircle },
  { key: 'recent', label: 'Newest', icon: Clock },
];

export default function YouTubeTrending() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('views');
  const [shortsOnly, setShortsOnly] = useState<'all' | 'shorts' | 'long'>('all');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BASE}/api/youtube/trending`)
      .then(r => r.json())
      .then(data => {
        if (data?.error) { setError(data.error); return; }
        setVideos(Array.isArray(data?.videos) ? data.videos : []);
      })
      .catch(() => setError('Failed to load trending videos. Try again.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = videos;
    if (shortsOnly === 'shorts') list = list.filter(v => v.is_short);
    if (shortsOnly === 'long') list = list.filter(v => !v.is_short);
    const sorted = [...list];
    if (sortKey === 'views') sorted.sort((a, b) => b.views - a.views);
    else if (sortKey === 'likes') sorted.sort((a, b) => b.likes - a.likes);
    else if (sortKey === 'comments') sorted.sort((a, b) => b.comments - a.comments);
    else if (sortKey === 'recent') sorted.sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());
    return sorted;
  }, [videos, sortKey, shortsOnly]);

  return (
    <div data-platform="youtube" className={`theme-redesign ${theme} min-h-screen bg-background`}>
      <SEO title="YouTube Trending — SocialRum" noindex />
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Trending on YouTube</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4 pb-24">
        <div>
          <h2 className="font-semibold text-foreground mb-1">Trending in India 🇮🇳</h2>
          <p className="text-xs text-muted-foreground">Real trending videos right now, ranked by real views, likes, and comments</p>
        </div>

        {/* Sort filters */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {SORTS.map(s => {
            const Icon = s.icon;
            const active = sortKey === s.key;
            return (
              <button key={s.key} onClick={() => setSortKey(s.key)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                style={active ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', color: '#fff' } : { background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
                <Icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Shorts / long-form toggle */}
        <div className="flex gap-1 p-1 rounded-2xl bg-card border border-border w-fit">
          {([
            { key: 'all', label: 'All' },
            { key: 'shorts', label: 'Shorts' },
            { key: 'long', label: 'Videos' },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setShortsOnly(f.key)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={shortsOnly === f.key ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', color: '#fff' } : { color: 'hsl(var(--muted-foreground))' }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading trending videos…</p>
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-center text-destructive py-8">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-8">No trending videos found.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((v, i) => (
              <motion.div key={v.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="panel p-3 flex gap-3">
                <a href={v.url} target="_blank" rel="noopener noreferrer"
                  className="relative shrink-0 rounded-xl overflow-hidden bg-black"
                  style={v.is_short ? { width: 72, aspectRatio: '9/16' } : { width: 128, aspectRatio: '16/9' }}>
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white bg-black/60">
                    {i + 1}
                  </div>
                  {v.is_short && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-white text-[8px] font-bold bg-red-600">SHORT</div>
                  )}
                </a>
                <div className="flex-1 min-w-0 flex flex-col">
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-foreground leading-snug line-clamp-2 hover:underline">
                    {v.title}
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.channel}{v.category ? ` · ${v.category}` : ''}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{v.views_formatted}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{v.likes_formatted}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{v.comments_formatted}</span>
                  </div>
                  <button
                    onClick={() => navigate('/youtube/script', { state: { topic: v.title } })}
                    className="mt-2 self-start flex items-center gap-1 px-3 py-1.5 rounded-xl text-primary-foreground text-xs font-medium bg-gradient-to-br from-primary to-accent">
                    <Sparkles className="w-3 h-3" />
                    {t('scripts.generate')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
