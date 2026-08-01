import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, Loader2, X, TrendingUp, Hash, Lightbulb,
  User, Users, Heart, MessageCircle, BarChart2, BadgeCheck, Eye,
  Play, Music, Clock, Calendar, Plus, ChevronLeft, Trash2, UserPlus, Target, Image,
  Download, Instagram, Search, Flame,
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getPageState, setPageState } from '@/lib/pageCache';
import { getReelThumbnailSrc, getReelAltText, handleReelThumbnailError } from '@/lib/reelThumbnail';
import SEO from '@/components/SEO';
import ResearchChecklist from '@/components/ResearchChecklist';

const PRIMARY = "hsl(var(--primary))";
const PRIMARY_GRAD = "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--ring)))";
const PRIMARY_CONTAINER = "hsl(var(--secondary))";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type TrendingTimeframe = '24h' | '7d' | '30d' | '90d' | 'all';
type TrendingSort = 'virality' | 'plays' | 'likes' | 'recent';

const TIMEFRAME_OPTIONS: { value: TrendingTimeframe; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All' },
];

const SORT_OPTIONS: { value: TrendingSort; label: string }[] = [
  { value: 'virality', label: 'Virality (outlier score)' },
  { value: 'plays', label: 'Views' },
  { value: 'likes', label: 'Likes' },
  { value: 'recent', label: 'Most recent' },
];

const TRENDING_HASHTAGS = ['fitness', 'cooking', 'tech', 'fashion', 'finance', 'travel', 'beauty', 'comedy', 'gaming', 'photography'];

const TRENDING_STEPS = [
  'Understanding your topic',
  'Searching Instagram',
  'Finding top-performing reels',
  'Detecting outliers',
  'Measuring engagement',
  'Studying audience behaviour',
  'Finding repeating patterns',
  'Identifying content gaps',
  'Generating AI insights',
  'Personalizing recommendations',
  'Preparing final report',
];

const formatNum = (n: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-bold text-lg text-foreground leading-none">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <div className="panel p-3.5">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="mt-2.5 font-bold text-lg text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</div>}
    </div>
  );
}

const PILLAR_COLORS = [
  { bg: PRIMARY_CONTAINER, text: PRIMARY },
  { bg: '#e8f5e9', text: '#2e7d32' },
  { bg: '#fff3e0', text: '#e65100' },
  { bg: '#fce4ec', text: '#880e4f' },
  { bg: '#e3f2fd', text: '#1565c0' },
];

interface CompetitorCard {
  username: string;
  profile_pic_base64?: string;
  profile_pic_url?: string;
  followers?: number;
  engagement_rate?: string;
  is_verified?: boolean;
  savedAt: number;
  fullData?: any;
  hikerData?: any;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
const getBoostType = (item: any, avgViews?: number, avgLikes?: number): string | null => {
  const caption = (item.caption || '').toLowerCase();
  const views = Number(item.views) || 0;
  const likes = Number(item.likes) || 0;
  const comments = Number(item.comments) || 0;
  const adKeywords = ['#ad', '#sponsored', '#collab', '#paid', '#gifted', '#partnership', '#brandpartner', 'paid partnership', '#promotion', '#promo'];
  if (adKeywords.some(k => caption.includes(k))) return 'paid';
  if (views > 50000 && (likes + comments) / views < 0.005) return 'low_eng';
  if (avgViews && avgLikes && views > avgViews * 5 && likes < avgLikes * 0.5) return 'low_eng';
  return null;
};

const isBoosted = (item: any, avgViews?: number, avgLikes?: number) =>
  getBoostType(item, avgViews, avgLikes) !== null;

// ─── Competitor Detail Page ───────────────────────────────────────────────────
function CompetitorDetail({ competitor, onBack, onUpdate }: {
  competitor: CompetitorCard;
  onBack: () => void;
  onUpdate?: (username: string, hikerData: any) => void;
}) {
  const { theme } = useTheme();
  const result = competitor.fullData;
  const [hiker, setHiker] = useState<any>(competitor.hikerData);
  const [hikerLoading, setHikerLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [reelsVisible, setReelsVisible] = useState(9);
  const [imgError, setImgError] = useState(false);
  const [aiPillars, setAiPillars] = useState<{name: string, description: string}[]>([]);
  const [pillarsLoading, setPillarsLoading] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [postsExpanded, setPostsExpanded] = useState(false);
  const [reelsFilter, setReelsFilter] = useState<'top' | 'latest' | 'liked' | 'viral'>('top');
  const [postsFilter, setPostsFilter] = useState<'top' | 'latest' | 'liked'>('top');

  const filterReels = (reels: any[]) => {
    const r = [...reels];
    if (reelsFilter === 'top') return r.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    if (reelsFilter === 'latest') return r.sort((a, b) => new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());
    if (reelsFilter === 'liked') return r.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0));
    if (reelsFilter === 'viral') return r.sort((a, b) => (b.virality?.score || 0) - (a.virality?.score || 0));
    return r;
  };

  const filterPosts = (posts: any[]) => {
    const p = [...posts];
    if (postsFilter === 'top') return p.sort((a, b) => (Number(b.views) || Number(b.likes) || 0) - (Number(a.views) || Number(a.likes) || 0));
    if (postsFilter === 'latest') return p.sort((a, b) => new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());
    if (postsFilter === 'liked') return p.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0));
    return p;
  };

  // Re-fetch fresh hiker data on open so CDN URLs are not expired
  useEffect(() => {
    const refetch = async () => {
      setHikerLoading(true);
      try {
        const res = await fetch(`${BASE}/api/hiker/analyze?username=${encodeURIComponent(competitor.username)}`);
        if (res.ok) {
          const freshData = await res.json();
          setHiker(freshData);
          if (onUpdate) onUpdate(competitor.username, freshData);
        }
      } catch (e) { console.error(e); }
      finally { setHikerLoading(false); }
    };
    refetch();
  }, [competitor.username]);

  // Fetch AI content pillar descriptions once hiker data is loaded
  useEffect(() => {
    if (hikerLoading || !hiker) return;
    if (aiPillars.length > 0) return;

    const captions = (hiker.reels || [])
      .slice(0, 20)
      .map((r: any) => (r.caption || '').split('\n')[0].trim().slice(0, 120))
      .filter(Boolean);
    const hashtags = (hiker.top_hashtags || []).slice(0, 25).map((h: any) => h.tag);

    if (captions.length === 0 && hashtags.length === 0) return;

    const pillarNames = result?.content_pillars?.length > 0 ? result.content_pillars : undefined;

    const fetchPillars = async () => {
      setPillarsLoading(true);
      try {
        const res = await fetch(`${BASE}/api/hiker/pillars`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: competitor.username, captions, hashtags, ...(pillarNames ? { pillarNames } : {}) }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.pillars?.length > 0) setAiPillars(data.pillars);
        }
      } catch (e) { console.error(e); }
      finally { setPillarsLoading(false); }
    };
    fetchPillars();
  }, [competitor.username, result, hiker, hikerLoading]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const proxyImg = (url?: string) => {
    if (!url) return '';
    // Supabase URLs load directly — no proxy needed
    if (url.includes('supabase')) return url;
    // All other CDN URLs go through proxy
    return `${BASE}/api/instagram/img?u=${encodeURIComponent(url)}`;
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`theme-redesign ${theme} fixed inset-0 z-50 bg-background overflow-y-auto`}>
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 h-14 flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: PRIMARY }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-sm font-bold text-foreground truncate">@{competitor.username}</span>
        {competitor.is_verified && <BadgeCheck className="w-4 h-4 text-blue-400 shrink-0" />}
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4 pb-28 space-y-4">
        {(() => {
          const stats = {
            followers: hiker?.profile?.followers ?? result?.stats?.followers,
            following: hiker?.profile?.following,
            engagement_rate: hiker?.profile?.engagement_rate ?? result?.stats?.engagement_rate,
            avg_likes: hiker?.profile?.avg_likes ?? hiker?.stats?.avg_likes ?? result?.stats?.avg_likes,
            avg_comments: hiker?.profile?.avg_comments ?? hiker?.stats?.avg_comments ?? result?.stats?.avg_comments,
            avg_views: hiker?.profile?.avg_views ?? hiker?.stats?.avg_views,
            total_posts: hiker?.profile?.total_posts ?? result?.stats?.total_posts,
          };
          const hasEngagementStats = stats.avg_views != null || stats.avg_likes != null || stats.avg_comments != null || stats.engagement_rate != null;
          const picSrc = result?.stats?.profile_pic_base64 || hiker?.profile?.profile_pic_url || competitor.profile_pic_url;
          const proxiedPic = picSrc?.startsWith('data:') ? picSrc : proxyImg(picSrc);
          return (
            <>
              {/* Profile Banner */}
              <div className="panel p-5 flex flex-wrap items-center gap-4">
                {proxiedPic && !imgError ? (
                  <img src={proxiedPic} alt={competitor.username}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={() => setImgError(true)} />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold text-xl">
                    {competitor.username[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-foreground text-lg">@{competitor.username}</p>
                    {(competitor.is_verified || hiker?.profile?.is_verified) && <BadgeCheck className="w-4 h-4 text-sky-500" />}
                  </div>
                  {(hiker?.profile?.full_name) && (
                    <p className="text-sm text-muted-foreground">{hiker.profile.full_name}</p>
                  )}
                  {result?.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-2xl">{result.summary}</p>}
                </div>
                <div className="flex items-center gap-5 text-sm">
                  {stats.followers != null && <MiniStat label="Followers" value={formatNum(stats.followers)} />}
                  {stats.following != null && <MiniStat label="Following" value={formatNum(stats.following)} />}
                  {stats.total_posts != null && <MiniStat label="Posts" value={formatNum(stats.total_posts)} />}
                </div>
              </div>

              {/* Engagement stats */}
              {hasEngagementStats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard icon={Eye} label="Avg views" value={formatNum(stats.avg_views ?? 0)} sub={stats.total_posts ? `over ${stats.total_posts} posts` : undefined} />
                  <StatCard icon={Heart} label="Avg likes" value={formatNum(stats.avg_likes ?? 0)} sub="per post" />
                  <StatCard icon={MessageCircle} label="Avg comments" value={formatNum(stats.avg_comments ?? 0)} sub="per post" />
                  <StatCard icon={Flame} label="Engagement rate" value={stats.engagement_rate != null ? `${stats.engagement_rate}%` : '—'} sub="likes+comments / followers" />
                </div>
              )}
            </>
          );
        })()}

        {/* Niche Detection */}
        {result?.niche && (
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: PRIMARY }} />
                <h2 className="font-bold text-sm text-foreground">Niche</h2>
              </div>
              {result.niche_score && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                  🎯 {result.niche_score}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: PRIMARY_GRAD }}>
                {result.niche}
              </span>
            </div>
            {result.sub_niches?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.sub_niches.map((sub: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Pillars — from ScrapeCreators AI or HikerAPI+Claude fallback */}
        {(() => {
          const scrapeNames: string[] = result?.content_pillars || [];
          const pillars: {name: string, description: string}[] = scrapeNames.length > 0
            ? scrapeNames.map((name: string) => {
                const found = aiPillars.find(p => p.name === name);
                return { name, description: found?.description || '' };
              })
            : aiPillars;
          const isAI = scrapeNames.length === 0 && aiPillars.length > 0;
          if (pillars.length === 0 && !pillarsLoading) return null;
          return (
            <div className="panel p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: PRIMARY }} />
                  <h2 className="font-bold text-sm text-foreground">Content Pillars</h2>
                </div>
                {isAI && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>AI</span>}
              </div>
              {pillarsLoading && pillars.length === 0 ? (
                <div className="flex items-center gap-2 py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: PRIMARY }} />
                  <span className="text-xs text-muted-foreground">Analysing content themes…</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {pillars.map((pillar, i) => {
                      const s = PILLAR_COLORS[i % PILLAR_COLORS.length];
                      const isSelected = selectedPillar === pillar.name;
                      return (
                        <button key={i} onClick={() => setSelectedPillar(isSelected ? null : pillar.name)}
                          className="px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
                          style={isSelected ? { background: s.text, color: '#fff' } : { background: s.bg, color: s.text }}>
                          {pillar.name}
                        </button>
                      );
                    })}
                  </div>
                  {selectedPillar && (() => {
                    const idx = pillars.findIndex(p => p.name === selectedPillar);
                    if (idx === -1) return null;
                    const ds = PILLAR_COLORS[idx % PILLAR_COLORS.length];
                    const desc = pillars[idx]?.description;
                    return (
                      <div className="mt-3 p-3.5 rounded-xl" style={{ background: ds.bg }}>
                        <p className="font-bold text-xs mb-1" style={{ color: ds.text }}>{selectedPillar}</p>
                        {pillarsLoading && !desc
                          ? <div className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" style={{ color: ds.text }} /><span className="text-xs" style={{ color: ds.text }}>Loading…</span></div>
                          : desc
                            ? <p className="text-xs leading-relaxed" style={{ color: ds.text }}>{desc}</p>
                            : <p className="text-xs opacity-60" style={{ color: ds.text }}>No description available.</p>}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          );
        })()}

        {/* Posting Tips */}
        {result?.posting_tips?.length > 0 && (
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-4"><Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-sm text-foreground">Posting Tips</h2></div>
            <div className="space-y-2.5">
              {result.posting_tips.map((tip: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: PRIMARY_CONTAINER }}>
                    <span className="text-[9px] font-bold" style={{ color: PRIMARY }}>{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What they post */}
        {result?.reel_ideas?.length > 0 && (result?.stats?.total_posts ?? 0) > 0 && (
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-4"><Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-sm text-foreground">What Kind of Content They Post</h2></div>
            <div className="space-y-2">
              {result.reel_ideas.map((idea: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: PRIMARY_GRAD }}>{i + 1}</div>
                  <p className="text-sm text-foreground flex-1">{idea}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {result?.hashtags?.length > 0 && (
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Hash className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-sm text-foreground">Hashtags They Use</h2></div>
              <button onClick={() => copyText(result.hashtags.map((h: string) => `#${h}`).join(' '), 'hashtags')} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
                {copied === 'hashtags' ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy all</>}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.hashtags.map((tag: string, i: number) => (
                <button key={i} onClick={() => copyText(`#${tag}`, `tag-${i}`)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                  style={i % 3 === 0 ? { background: PRIMARY_CONTAINER, color: PRIMARY } : i % 3 === 1 ? { background: '#e8f5e9', color: '#2e7d32' } : { background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posting Patterns — real data */}
        {hiker?.reels?.length > 0 && (() => {
          const reels = hiker.reels || [];
          const dayCount: Record<string, number> = {};
          DAYS_SHORT.forEach(d => dayCount[d] = 0);
          reels.forEach((r: any) => {
            if (!r.posted_at) return;
            const d = new Date(r.posted_at);
            const day = DAYS_SHORT[d.getDay()];
            dayCount[day] = (dayCount[day] || 0) + 1;
          });
          const maxDay = Math.max(...Object.values(dayCount), 1);
          const bestDay = Object.entries(dayCount).sort((a,b) => b[1]-a[1])[0]?.[0];
          return (
            <div className="panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" style={{ color: PRIMARY }} />
                <h2 className="font-bold text-sm text-foreground">Posting Patterns</h2>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>Real Data</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {bestDay && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: PRIMARY_CONTAINER }}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                    <span className="text-xs text-muted-foreground">Best day:</span>
                    <span className="text-xs font-bold" style={{ color: PRIMARY }}>{bestDay}</span>
                  </div>
                )}
              </div>
              {Object.values(dayCount).some(v => v > 0) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Posts by Day</p>
                  <div className="flex items-end gap-1.5 h-14">
                    {DAYS_SHORT.map(day => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-md" style={{
                          height: `${Math.round((dayCount[day] / maxDay) * 40)}px`,
                          minHeight: dayCount[day] > 0 ? '3px' : '0',
                          background: day === bestDay ? PRIMARY : PRIMARY_CONTAINER,
                        }} />
                        <span className="text-[9px] font-bold" style={{ color: day === bestDay ? PRIMARY : 'hsl(var(--muted-foreground))' }}>{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Reels */}
        {hikerLoading && (
          <div className="panel p-6 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" style={{ color: PRIMARY }} />
            <p className="text-xs text-muted-foreground">Fetching latest reels & posts…</p>
          </div>
        )}

        {/* Top Audio */}
        {!hikerLoading && hiker?.top_audio?.length > 0 && (
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-3"><Music className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-sm text-foreground">Top Audio</h2></div>
            <div className="space-y-1.5">
              {hiker.top_audio.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate mr-2">🎵 {a.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">×{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Hooks */}
        {!hikerLoading && hiker?.top_hooks?.length > 0 && (
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-sm text-foreground">Best Hooks</h2></div>
            <div className="space-y-2.5">
              {hiker.top_hooks.map((h: any, i: number) => (
                <div key={i} onClick={() => h.permalink && window.open(h.permalink, '_blank')} className="cursor-pointer p-2 rounded-lg hover:bg-secondary">
                  <p className="text-sm text-foreground leading-snug">"{h.hook}"</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatNum(h.views || 0)} views · {formatNum(h.likes || 0)} likes</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hikerLoading && hiker?.reels?.length > 0 && (
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-3"><Play className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-sm text-foreground">Their Reels ({hiker.reels.length})</h2></div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {([['top', 'Top Views'], ['latest', 'Latest'], ['liked', 'Most Liked'], ['viral', 'Viral']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setReelsFilter(val)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={reelsFilter === val ? { background: PRIMARY, color: '#fff' } : { background: PRIMARY_CONTAINER, color: PRIMARY }}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto horizontal-scroll pb-2" style={{ scrollSnapType: "x mandatory" }}>
              {filterReels(hiker.reels).map((reel: any, i: number) => (
                <div key={reel.id || i} onClick={() => reel.permalink && window.open(reel.permalink, '_blank')}
                  className="relative rounded-xl overflow-hidden cursor-pointer group" style={{ aspectRatio: '9/16', background: '#1a1a2e', width: '110px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white/15" />
                  </div>
                  <img src={getReelThumbnailSrc(reel.thumbnail)} alt={getReelAltText(reel.caption, reel.username)}
                    referrerPolicy="no-referrer" loading="lazy" decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={handleReelThumbnailError} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, transparent 60%, rgba(124,58,237,0.15) 100%)' }} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-2xl" style={{ background: 'rgba(124,58,237,0.9)', backdropFilter: 'blur(6px)' }}>
                      <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 items-end">
                    {(() => {
                      const boostType = getBoostType(reel, hiker.stats?.avg_views, hiker.stats?.avg_likes);
                      if (!boostType) return null;
                      return boostType === 'paid' ? (
                        <div className="px-1.5 py-0.5 rounded text-white text-[8px] font-bold" style={{ background: '#7c3aed' }}>💰 Paid</div>
                      ) : (
                        <div className="px-1.5 py-0.5 rounded text-white text-[8px] font-bold" style={{ background: '#f59e0b' }}>⚠️ Low Eng</div>
                      );
                    })()}
                    {reel.virality?.label && (
                      <div className="px-1.5 py-0.5 rounded text-white text-[8px] font-bold"
                        style={{ background: reel.virality.score >= 65 ? '#16a34a' : PRIMARY }}>{reel.virality.label}</div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-2.5 h-2.5 text-white/80" /><span className="text-[8px] text-white/80">{formatNum(Number(reel.views) || 0)}</span>
                      <Heart className="w-2.5 h-2.5 text-white/80" /><span className="text-[8px] text-white/80">{formatNum(Number(reel.likes) || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts — image grid */}
        {!hikerLoading && hiker?.posts?.length > 0 && (
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" style={{ color: PRIMARY }} />
                <h2 className="font-bold text-sm text-foreground">Posted Images ({hiker.posts.length})</h2>
              </div>
              {hiker.posts.length > 9 && (
                <button onClick={() => setPostsExpanded(v => !v)} className="text-xs font-bold" style={{ color: PRIMARY }}>
                  {postsExpanded ? 'Show less' : `See all ${hiker.posts.length}`}
                </button>
              )}
            </div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {([['top', 'Top'], ['latest', 'Latest'], ['liked', 'Most Liked']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setPostsFilter(val)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={postsFilter === val ? { background: PRIMARY, color: '#fff' } : { background: PRIMARY_CONTAINER, color: PRIMARY }}>
                  {label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {filterPosts(postsExpanded ? hiker.posts : hiker.posts.slice(0, 9)).map((post: any, i: number) => (
                <a key={post.id || i} href={post.permalink} target="_blank" rel="noopener noreferrer"
                  className="relative rounded-xl overflow-hidden group block bg-[#1a1a2e]" style={{ aspectRatio: '1/1' }}>
                  {/* Placeholder — visible when thumbnail is missing or transparent */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="w-6 h-6 text-white/15" />
                  </div>
                  {post.thumbnail && (
                    <img
                      src={post.thumbnail.includes('supabase') ? post.thumbnail : `${BASE}/api/instagram/img?u=${encodeURIComponent(post.thumbnail)}`}
                      alt={post.caption?.slice(0, 40) || ''}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-xl" style={{ background: 'rgba(124,58,237,0.9)', backdropFilter: 'blur(6px)' }}>
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2">
                      <Heart className="w-2.5 h-2.5 text-white/80" /><span className="text-[9px] text-white/80 font-medium">{formatNum(post.likes || 0)}</span>
                      <MessageCircle className="w-2.5 h-2.5 text-white/80" /><span className="text-[9px] text-white/80 font-medium">{formatNum(post.comments || 0)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Top Hashtags */}
        {!hikerLoading && hiker?.top_hashtags?.length > 0 && (
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-3"><Hash className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-sm text-foreground">Hashtags They Use</h2></div>
            <div className="flex flex-wrap gap-2">
              {hiker.top_hashtags.map((h: any, i: number) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                  {h.tag} <span className="opacity-60">×{h.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InstagramAnalyzer() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const _saved = getPageState('igAnalyzer');

  const [handle, setHandle] = useState(_saved?.handle ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(_saved?.result ?? null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);
  const [hiker, setHiker] = useState<any>(_saved?.hiker ?? null);
  const [hikerLoading, setHikerLoading] = useState(false);
  const [reelsVisible, setReelsVisible] = useState(9);
  const [reelsFilter, setReelsFilter] = useState<'top' | 'latest' | 'liked' | 'viral'>('top');
  const [postsFilter, setPostsFilter] = useState<'top' | 'latest' | 'liked'>('top');
  const [aiPillars, setAiPillars] = useState<{name: string, description: string}[]>([]);
  const [pillarsLoading, setPillarsLoading] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorCard[]>(() => {
    if (_saved?.competitors) return _saved.competitors;
    try { return JSON.parse(localStorage.getItem('ig_competitors') || '[]'); } catch { return []; }
  });
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [compInput, setCompInput] = useState('');
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState('');
  const [openCompetitor, setOpenCompetitor] = useState<CompetitorCard | null>(null);
  const [trendingReels, setTrendingReels] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingSearched, setTrendingSearched] = useState(false);
  const [trendingKeyword, setTrendingKeyword] = useState('');
  const [trendingInput, setTrendingInput] = useState(user?.user_metadata?.niches?.[0] || '');
  const [trendingTimeframe, setTrendingTimeframe] = useState<TrendingTimeframe>('30d');
  const [trendingSort, setTrendingSort] = useState<TrendingSort>('virality');
  const [trendingStep, setTrendingStep] = useState(0);
  const trendingPanelRef = useRef<HTMLDivElement>(null);

  // ── Trending reels — a searchable strip. User-driven only: no default
  // keyword auto-search on mount, waits for the user to actually search. ──
  const searchTrendingReels = (keyword: string, overrides?: { timeframe?: TrendingTimeframe; sort?: TrendingSort }) => {
    const clean = keyword.trim();
    if (!clean) return;
    const timeframe = overrides?.timeframe ?? trendingTimeframe;
    const sort = overrides?.sort ?? trendingSort;
    setTrendingKeyword(clean);
    setTrendingSearched(true);
    setTrendingLoading(true);
    setTrendingStep(0);
    const cap = TRENDING_STEPS.length - 2;
    const stepTimer = setInterval(() => setTrendingStep((s) => (s < cap ? s + 1 : s)), 550);
    fetch(`${BASE}/api/instagram/search?keyword=${encodeURIComponent(clean)}&mode=keyword&page=1&limit=20&timeframe=${timeframe}&sort=${sort}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.videos) ? data.videos : Array.isArray(data?.reels) ? data.reels : [];
        setTrendingReels(list.slice(0, 20));
      })
      .catch(() => setTrendingReels([]))
      .finally(() => {
        clearInterval(stepTimer);
        setTrendingStep(TRENDING_STEPS.length - 1);
        setTrendingLoading(false);
      });
  };

  // Re-run with the current keyword whenever a filter changes, so the pills
  // actually refine the results instead of just sitting there decoratively.
  const setTrendingTimeframeAndRerun = (tf: TrendingTimeframe) => {
    setTrendingTimeframe(tf);
    if (trendingKeyword) searchTrendingReels(trendingKeyword, { timeframe: tf });
  };
  const setTrendingSortAndRerun = (sort: TrendingSort) => {
    setTrendingSort(sort);
    if (trendingKeyword) searchTrendingReels(trendingKeyword, { sort });
  };

  // ── Arriving from Home's "trending" intent — jump straight to this box
  // and run the search, instead of waiting for the user to type it again. ──
  const autoTrendingRan = useRef(false);
  useEffect(() => {
    const q = (location.state as any)?.trendingQuery;
    if (!q || autoTrendingRan.current) return;
    autoTrendingRan.current = true;
    setTrendingInput(q);
    searchTrendingReels(q);
    setTimeout(() => trendingPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [location.state]);

  // ── Page-state persistence ──
  const _stateRef = useRef<any>({});
  useEffect(() => {
    _stateRef.current = { handle, result, hiker, competitors };
  });
  useEffect(() => () => { setPageState('igAnalyzer', _stateRef.current); }, []);

  useEffect(() => { localStorage.setItem('ig_competitors', JSON.stringify(competitors)); }, [competitors]);

  const proxyImg = (url?: string) => {
    if (!url) return '';
    // Supabase URLs load directly — no proxy needed
    if (url.includes('supabase')) return url;
    // All other CDN URLs go through proxy
    return `${BASE}/api/instagram/img?u=${encodeURIComponent(url)}`;
  };

  useEffect(() => { setAiPillars([]); setSelectedPillar(null); }, [handle]);

  useEffect(() => {
    if (hikerLoading || !hiker) return;
    if (aiPillars.length > 0) return;
    const captions = (hiker.reels || [])
      .slice(0, 20)
      .map((r: any) => (r.caption || '').split('\n')[0].trim().slice(0, 120))
      .filter(Boolean);
    const hashtags = (hiker.top_hashtags || []).slice(0, 25).map((h: any) => h.tag);
    if (captions.length === 0 && hashtags.length === 0) return;
    const pillarNames = result?.content_pillars?.length > 0 ? result.content_pillars : undefined;
    const fetchPillars = async () => {
      setPillarsLoading(true);
      try {
        const res = await fetch(`${BASE}/api/hiker/pillars`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: handle.replace('@', '').trim(), captions, hashtags, ...(pillarNames ? { pillarNames } : {}) }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.pillars?.length > 0) setAiPillars(data.pillars);
        }
      } catch (e) { console.error(e); }
      finally { setPillarsLoading(false); }
    };
    fetchPillars();
  }, [handle, result, hiker, hikerLoading]);

  const analyze = async () => {
    if (!handle.trim()) return;
    const clean = handle.replace('@', '').trim();
    setLoading(true); setHikerLoading(true);
    setError(''); setResult(null); setHiker(null); setImgError(false); setReelsVisible(9); setAiPillars([]);

    (async () => {
      try {
        const userLanguage = localStorage.getItem('userLanguage') || 'english';
        const res = await fetch(`${BASE}/api/instagram/analyze`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: clean, language: userLanguage }),
        });
        const data = await res.json();
        if (!res.ok || data.error === 'user_not_found') {
          // Don't show error — HikerAPI handles everything now, ScrapeCreators is just a bonus
          console.log('ScrapeCreators unavailable, relying on HikerAPI');
        } else {
          setResult(data);
        }
      } catch { setError(t('common.error')); }
      finally { setLoading(false); }
    })();

    (async () => {
      try {
        const res = await fetch(`${BASE}/api/hiker/analyze?username=${encodeURIComponent(clean)}`);
        if (res.ok) setHiker(await res.json());
      } catch (e) { console.error(e); }
      finally { setHikerLoading(false); }
    })();
  };

  const addCompetitor = async () => {
    const clean = compInput.replace('@', '').trim();
    if (!clean) return;
    if (competitors.find(c => c.username.toLowerCase() === clean.toLowerCase())) { setCompError('Already added'); return; }
    setCompLoading(true); setCompError('');
    try {
      const userLanguage = localStorage.getItem('userLanguage') || 'english';
      const [mainRes, hikerRes] = await Promise.allSettled([
        fetch(`${BASE}/api/instagram/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: clean, language: userLanguage }) }).then(r => r.ok ? r.json() : null),
        fetch(`${BASE}/api/hiker/analyze?username=${encodeURIComponent(clean)}`).then(r => r.ok ? r.json() : null),
      ]);
      const fullData = mainRes.status === 'fulfilled' ? mainRes.value : null;
      const hikerData = hikerRes.status === 'fulfilled' ? hikerRes.value : null;
      // Use HikerAPI profile pic (proxied) as it's more reliable than ScrapeCreators base64
      const hikerProfilePic = hikerData?.profile?.profile_pic_url || hikerData?.profile_pic_url || null;
      const card: CompetitorCard = {
        username: clean,
        profile_pic_base64: null,
        profile_pic_url: hikerProfilePic,
        followers: hikerData?.profile?.followers || fullData?.stats?.followers,
        engagement_rate: hikerData?.profile?.engagement_rate || fullData?.stats?.engagement_rate,
        is_verified: hikerData?.profile?.is_verified || fullData?.stats?.is_verified,
        savedAt: Date.now(),
        fullData, hikerData,
      };
      setCompetitors(prev => [card, ...prev]);
      setCompInput(''); setAddingCompetitor(false);
    } catch { setCompError('Failed to fetch. Try again.'); }
    finally { setCompLoading(false); }
  };

  const removeCompetitor = (username: string) => setCompetitors(prev => prev.filter(c => c.username !== username));

  const isAlreadyCompetitor = (username: string) => {
    const clean = username.replace('@', '').trim().toLowerCase();
    return competitors.some(c => c.username.toLowerCase() === clean);
  };

  // Quick-add the currently searched profile as a competitor using existing result + hiker data
  const quickAddCompetitor = async (username: string) => {
    const clean = username.replace('@', '').trim();
    if (!clean || isAlreadyCompetitor(clean)) return;
    setCompLoading(true);
    try {
      const hikerProfilePic = hiker?.profile?.profile_pic_url || hiker?.profile_pic_url || null;
      const card: CompetitorCard = {
        username: clean,
        profile_pic_base64: null,
        profile_pic_url: hikerProfilePic,
        followers: hiker?.profile?.followers || result?.stats?.followers,
        engagement_rate: hiker?.profile?.engagement_rate || result?.stats?.engagement_rate,
        is_verified: hiker?.profile?.is_verified || result?.stats?.is_verified,
        savedAt: Date.now(),
        fullData: result,
        hikerData: hiker,
      };
      setCompetitors(prev => [card, ...prev]);
    } finally {
      setCompLoading(false);
    }
  };

  const updateCompetitorData = (username: string, hikerData: any) => {
    setCompetitors(prev => prev.map(c =>
      c.username.toLowerCase() === username.toLowerCase()
        ? {
            ...c,
            hikerData,
            updatedAt: Date.now(),
            is_verified: hikerData?.profile?.is_verified ?? c.is_verified,
            followers: hikerData?.profile?.followers ?? c.followers,
            profile_pic_url: hikerData?.profile?.profile_pic_url ?? c.profile_pic_url,
          }
        : c
    ));
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const handleUsernameChange = (value: string) => {
    setHandle(value);
    if (!value.trim()) {
      setResult(null);
      setHiker(null);
      setError('');
      setImgError(false);
    }
  };

  const filterReels = (reels: any[]) => {
    const r = [...reels];
    if (reelsFilter === 'top') return r.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    if (reelsFilter === 'latest') return r.sort((a, b) => new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());
    if (reelsFilter === 'liked') return r.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0));
    if (reelsFilter === 'viral') return r.sort((a, b) => (b.virality?.score || 0) - (a.virality?.score || 0));
    return r;
  };

  const filterPosts = (posts: any[]) => {
    const p = [...posts];
    if (postsFilter === 'top') return p.sort((a, b) => (Number(b.views) || Number(b.likes) || 0) - (Number(a.views) || Number(a.likes) || 0));
    if (postsFilter === 'latest') return p.sort((a, b) => new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());
    if (postsFilter === 'liked') return p.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0));
    return p;
  };

  return (
    <div className={`theme-redesign ${theme} min-h-screen bg-background text-foreground`}>
      <SEO title="Instagram Analyzer — SocialRum" noindex />
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${PRIMARY}40; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: ${PRIMARY}80; }
        .horizontal-scroll { scrollbar-width: thin; scrollbar-color: ${PRIMARY}40 transparent; }
      `}</style>
      <AnimatePresence>
        {openCompetitor && (
          <CompetitorDetail
            competitor={openCompetitor}
            onBack={() => setOpenCompetitor(null)}
            onUpdate={updateCompetitorData}
          />
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-5 pt-8 pb-28 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-5 border-b border-border">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">{t('analyzer.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('analyzer.subtitle')}</p>
          </div>
          <button
            disabled={!(result || hiker) || loading}
            onClick={() => {
              const blob = new Blob([JSON.stringify({ username: handle.replace('@', '').trim(), result, hiker }, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `${handle.replace('@', '').trim()}-analysis.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border text-foreground hover:border-primary hover:text-primary transition-colors shrink-0 disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
          >
            <Download className="w-3.5 h-3.5" /> Export analysis
          </button>
        </div>

        {/* Search */}
        <div className="panel p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('analyzer.username_label')}</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <span className="absolute left-9 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">@</span>
              <input type="text" value={handle} onChange={e => handleUsernameChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') analyze(); }}
                placeholder={t('analyzer.placeholder')}
                className="w-full pl-14 pr-9 py-3 rounded-xl border border-input bg-secondary text-foreground placeholder:text-muted-foreground outline-none text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              {handle && (
                <button onClick={() => { setHandle(''); setResult(null); setHiker(null); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={analyze} disabled={loading || !handle.trim()}
              className="px-5 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
              style={{ background: PRIMARY_GRAD }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
              {t('analyzer.analyze_account')}
            </button>
            {(result || hiker) && !loading && (
              <button
                onClick={() => quickAddCompetitor(handle.replace('@', '').trim())}
                disabled={compLoading}
                className="px-4 py-3 rounded-xl text-sm font-bold border transition-all disabled:opacity-60 flex items-center gap-1.5 shrink-0"
                style={
                  isAlreadyCompetitor(handle)
                    ? { background: '#e8f5e9', color: '#2e7d32', borderColor: '#c8e6c9' }
                    : { background: PRIMARY_CONTAINER, color: PRIMARY, borderColor: 'transparent' }
                }
              >
                {compLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isAlreadyCompetitor(handle) ? <><Check className="w-4 h-4" /></> : <Plus className="w-4 h-4" />}
              </button>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Empty state — shown before a profile has been analyzed */}
        {!loading && !result && !hiker && !error && (
          <div className="panel p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: PRIMARY_CONTAINER }}>
              <Search className="w-8 h-8" style={{ color: PRIMARY }} />
            </div>
            <p className="font-bold text-foreground mb-1">{t('analyzer.empty_title')}</p>
            <p className="text-sm text-muted-foreground">{t('analyzer.empty_desc')}</p>
          </div>
        )}

        {/* Competitor Tracker — hidden while viewing search results */}
        {!((result || hiker) && !loading) && (
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-sm text-foreground">Competitor Tracker</h2>
              {competitors.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>{competitors.length}</span>
              )}
            </div>
            {!addingCompetitor && (
              <button onClick={() => { setAddingCompetitor(true); setCompError(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-md"
                style={{ background: PRIMARY_GRAD }}>
                <Plus className="w-3.5 h-3.5" /> Add Competitor
              </button>
            )}
          </div>
          <AnimatePresence>
            {addingCompetitor && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">@</span>
                    <input autoFocus type="text" value={compInput} onChange={e => setCompInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addCompetitor(); if (e.key === 'Escape') setAddingCompetitor(false); }}
                      placeholder="Enter competitor username"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-input bg-secondary text-foreground placeholder:text-muted-foreground outline-none text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <button onClick={addCompetitor} disabled={compLoading || !compInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ background: PRIMARY_GRAD }}>
                    {compLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                  </button>
                  <button onClick={() => { setAddingCompetitor(false); setCompInput(''); setCompError(''); }}
                    className="px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {compError && <p className="text-red-500 text-xs mb-2">{compError}</p>}
                {compLoading && (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-secondary mb-2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: PRIMARY }} />
                    <p className="text-xs text-muted-foreground">Fetching @{compInput.replace('@', '')}…</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {competitors.length === 0 && !addingCompetitor ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: PRIMARY_CONTAINER }}>
                <Users className="w-5 h-5" style={{ color: PRIMARY }} />
              </div>
              <p className="text-xs text-muted-foreground">Add competitors to track and compare their profiles</p>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              {competitors.map(comp => (
                <motion.div key={comp.username} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:border-primary/40 hover:bg-secondary transition-all"
                  onClick={() => setOpenCompetitor(comp)}>
                  {/* Profile pic */}
                  {(() => {
                    const picUrl = comp.profile_pic_base64 || comp.profile_pic_url;
                    const proxiedUrl = picUrl?.startsWith('data:') ? picUrl : (picUrl ? (picUrl.includes('supabase') ? picUrl : `${BASE}/api/instagram/img?u=${encodeURIComponent(picUrl)}`) : null);
                    if (proxiedUrl) return (
                      <img
                        src={proxiedUrl}
                        alt={comp.username}
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    );
                    return (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: PRIMARY_GRAD }}>
                        {comp.username[0].toUpperCase()}
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground truncate">@{comp.username}</p>
                      {comp.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {comp.followers && <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{formatNum(comp.followers)}</span> followers</span>}
                      {comp.engagement_rate && <span className="text-xs text-muted-foreground"><span className="font-semibold text-green-600">{comp.engagement_rate}%</span> eng.</span>}
                      {comp.hikerData?.reels?.length > 0 && <span className="text-xs text-muted-foreground"><span className="font-semibold" style={{ color: PRIMARY }}>{comp.hikerData.reels.length}</span> reels</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button"
                      onClick={e => { e.stopPropagation(); setOpenCompetitor(comp); }}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors hidden sm:block"
                      style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>View Profile</button>
                    <button onClick={e => { e.stopPropagation(); removeCompetitor(comp.username); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="panel p-8 flex flex-col items-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Search className="w-8 h-8" style={{ color: PRIMARY }} />
            </motion.div>
            <p className="text-sm font-semibold text-foreground">{t('analyzer.analyzing')} @{handle.replace('@', '')}…</p>
            <p className="text-xs text-muted-foreground">{t('analyzer.fetching')}</p>
          </div>
        )}

        {/* Results — show if either ScrapeCreators or HikerAPI has data */}
        {(result || hiker) && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Profile summary row */}
            <div className="panel p-4 flex items-center gap-3">
              {(() => {
                const picUrl = hiker?.profile?.profile_pic_url || hiker?.profile_pic_url || result?.stats?.profile_pic_url;
                const picSrc = picUrl ? (picUrl.includes('supabase') ? picUrl : `${BASE}/api/instagram/img?u=${encodeURIComponent(picUrl)}`) : null;
                return picSrc && !imgError ? (
                  <img src={picSrc} alt={handle}
                    className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
                    onError={() => setImgError(true)} />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ background: PRIMARY_GRAD }}>
                    {(result?.profile_name || hiker?.profile?.full_name || handle || '?').trim().charAt(0).toUpperCase() || '?'}
                  </div>
                );
              })()}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-foreground truncate">@{handle.replace('@', '')}</p>
                  {(result?.stats?.is_verified || hiker?.profile?.is_verified) && <BadgeCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                </div>
                {(hiker?.profile?.full_name || result?.profile_name) && (
                  <p className="text-sm text-muted-foreground truncate">{hiker?.profile?.full_name || result?.profile_name}</p>
                )}
                {hiker?.profile?.biography && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 max-w-md">{hiker.profile.biography}</p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {(hiker?.profile?.followers ?? result?.stats?.followers) != null && (
                  <div className="text-center">
                    <p className="font-bold text-sm text-foreground leading-none">{formatNum(hiker?.profile?.followers ?? result?.stats?.followers)}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Followers</p>
                  </div>
                )}
                {hiker?.profile?.following != null && (
                  <div className="text-center">
                    <p className="font-bold text-sm text-foreground leading-none">{formatNum(hiker.profile.following)}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Following</p>
                  </div>
                )}
                {(hiker?.profile?.total_posts ?? result?.stats?.total_posts) != null && (
                  <div className="text-center">
                    <p className="font-bold text-sm text-foreground leading-none">{formatNum(hiker?.profile?.total_posts ?? result?.stats?.total_posts)}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Posts</p>
                  </div>
                )}
              </div>
            </div>
            {result?.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed px-1">{result.summary}</p>
            )}

            {/* Stats — 4 core metrics, HikerAPI primary, ScrapeCreators fallback */}
            {(() => {
              const stats = {
                avg_views: hiker?.profile?.avg_views ?? hiker?.stats?.avg_views,
                avg_likes: hiker?.profile?.avg_likes ?? hiker?.stats?.avg_likes ?? result?.stats?.avg_likes,
                avg_comments: hiker?.profile?.avg_comments ?? hiker?.stats?.avg_comments ?? result?.stats?.avg_comments,
                engagement_rate: hiker?.profile?.engagement_rate ?? result?.stats?.engagement_rate,
              };
              const hasStats = stats.avg_views != null || stats.avg_likes != null || stats.engagement_rate != null;
              if (!hasStats) return null;
              const CARDS = [
                { key: 'avg_views', label: 'Avg views', val: stats.avg_views != null ? formatNum(stats.avg_views) : null, bg: '#e3f2fd', color: '#1565c0' },
                { key: 'avg_likes', label: 'Avg likes', val: stats.avg_likes != null ? formatNum(stats.avg_likes) : null, bg: '#fce4ec', color: '#880e4f' },
                { key: 'avg_comments', label: 'Avg comments', val: stats.avg_comments != null ? formatNum(stats.avg_comments) : null, bg: '#fff3e0', color: '#e65100' },
                { key: 'engagement_rate', label: 'Engagement rate', val: stats.engagement_rate != null ? `${stats.engagement_rate}%` : null, bg: '#e8f5e9', color: '#2e7d32' },
              ].filter(c => c.val != null);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CARDS.map(card => (
                    <div key={card.key} className="rounded-xl p-3.5 text-center" style={{ background: card.bg }}>
                      <p className="font-bold text-lg" style={{ color: card.color }}>{card.val}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{card.label}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Top performing content — real reels/posts sorted by views */}
            {hiker?.reels?.length > 0 && (() => {
              const top = [...hiker.reels].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)).slice(0, 5);
              return (
                <div className="panel p-4">
                  <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-base text-foreground">Top performing content</h2></div>
                  <div className="space-y-2">
                    {top.map((reel: any, i: number) => (
                      <div key={reel.id || i} onClick={() => reel.permalink && window.open(reel.permalink, '_blank')}
                        className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                        <div className="relative w-11 h-14 rounded-lg overflow-hidden shrink-0 bg-[#1a1a2e]">
                          <img src={getReelThumbnailSrc(reel.thumbnail)} alt={getReelAltText(reel.caption, reel.username)}
                            referrerPolicy="no-referrer" loading="lazy" decoding="async"
                            className="absolute inset-0 w-full h-full object-cover" onError={handleReelThumbnailError} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground line-clamp-1">{reel.caption || 'Untitled reel'}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNum(Number(reel.views) || 0)}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNum(Number(reel.likes) || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Viral content patterns — hooks driving the account's best-performing reels */}
            {hiker?.top_hooks?.length > 0 && (
              <div className="panel p-4">
                <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-base text-foreground">Viral content patterns</h2></div>
                <div className="space-y-2.5">
                  {hiker.top_hooks.map((h: any, i: number) => (
                    <div key={i} onClick={() => h.permalink && window.open(h.permalink, '_blank')} className="cursor-pointer p-2 rounded-lg hover:bg-secondary">
                      <p className="text-sm text-foreground leading-snug">"{h.hook}"</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatNum(h.views || 0)} views · {formatNum(h.likes || 0)} likes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitor insights — narrative summary of posting cadence, audience
                scale, and dominant content signal, derived from the same real
                Hiker data used elsewhere on this page. */}
            {hiker?.profile && (() => {
              const reels = hiker.reels || [];
              const dayCount: Record<string, number> = {};
              const hourCount: Record<number, number> = {};
              reels.forEach((r: any) => {
                if (!r.posted_at) return;
                const d = new Date(r.posted_at);
                const day = DAYS_SHORT[d.getDay()];
                const hourIST = (d.getUTCHours() + 5) % 24;
                dayCount[day] = (dayCount[day] || 0) + 1;
                hourCount[hourIST] = (hourCount[hourIST] || 0) + 1;
              });
              const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0];
              const bestHourRaw = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0];
              const bestHour = bestHourRaw !== undefined ? parseInt(bestHourRaw) : null;
              const dated = reels.filter((r: any) => r.posted_at).sort((a: any, b: any) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime());
              const postsPerWeek = dated.length >= 2
                ? (() => {
                    const weeks = (new Date(dated[dated.length - 1].posted_at).getTime() - new Date(dated[0].posted_at).getTime()) / (7 * 24 * 3600 * 1000);
                    return weeks > 0 ? dated.length / weeks : null;
                  })()
                : null;
              const engagementRate = hiker.profile.engagement_rate ?? result?.stats?.engagement_rate;
              const topPattern = hiker.top_hooks?.[0];

              return (
                <div className="panel p-5">
                  <h2 className="font-bold text-base text-foreground mb-4">Competitor insights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl border border-border p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: PRIMARY }}>
                        <Clock className="w-3.5 h-3.5" /> Posting cadence
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {postsPerWeek ? `${postsPerWeek.toFixed(1)} posts / week` : 'Not enough data yet'}
                        {bestDay ? ` — best day appears to be ${bestDay}${bestHour != null ? `, around ${bestHour % 12 || 12}:00 ${bestHour >= 12 ? 'PM' : 'AM'} IST` : ''}.` : '.'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: PRIMARY }}>
                        <Users className="w-3.5 h-3.5" /> Audience scale
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {formatNum(hiker.profile.followers)} followers · {engagementRate != null ? `${engagementRate}%` : 'N/A'} engagement rate
                        {engagementRate != null ? ` — ${engagementRate > 3 ? 'above' : 'in line with'} the 1–3% Instagram baseline.` : " — this account hides like counts, so engagement can't be computed."}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: PRIMARY }}>
                        <Flame className="w-3.5 h-3.5" /> Content signal
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {topPattern ? `Leans hardest on hooks like "${topPattern.hook}". Steal the framing, not the topic.` : 'Mixed formats — no dominant pattern yet.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Niche Detection */}
            {result?.niche && (
              <div className="panel p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" style={{ color: PRIMARY }} />
                    <h2 className="font-bold text-base text-foreground">Niche</h2>
                  </div>
                  {result.niche_score && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                      🎯 {result.niche_score}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: PRIMARY_GRAD }}>
                    {result.niche}
                  </span>
                </div>
                {result.sub_niches?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.sub_niches.map((sub: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content Pillars — ScrapeCreators or AI fallback */}
            {(() => {
              const scrapeNames: string[] = result?.content_pillars || [];
              const pillars: {name: string, description: string}[] = scrapeNames.length > 0
                ? scrapeNames.map((name: string) => {
                    const found = aiPillars.find(p => p.name === name);
                    return { name, description: found?.description || '' };
                  })
                : aiPillars;
              const isAI = scrapeNames.length === 0 && aiPillars.length > 0;
              if (pillars.length === 0 && !pillarsLoading) return null;
              return (
                <div className="panel p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" style={{ color: PRIMARY }} />
                      <h2 className="font-bold text-base text-foreground">{t('analyzer.content_pillars')}</h2>
                    </div>
                    {isAI && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>AI</span>}
                  </div>
                  {pillarsLoading && pillars.length === 0 ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: PRIMARY }} />
                      <span className="text-xs text-muted-foreground">Analysing content themes…</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {pillars.map((pillar, i) => {
                          const s = PILLAR_COLORS[i % PILLAR_COLORS.length];
                          const isSelected = selectedPillar === pillar.name;
                          return (
                            <button key={i} onClick={() => setSelectedPillar(isSelected ? null : pillar.name)}
                              className="px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
                              style={isSelected ? { background: s.text, color: '#fff' } : { background: s.bg, color: s.text }}>
                              {pillar.name}
                            </button>
                          );
                        })}
                      </div>
                      {selectedPillar && (() => {
                        const idx = pillars.findIndex(p => p.name === selectedPillar);
                        if (idx === -1) return null;
                        const ds = PILLAR_COLORS[idx % PILLAR_COLORS.length];
                        const desc = pillars[idx]?.description;
                        return (
                          <div className="mt-3 p-3.5 rounded-xl" style={{ background: ds.bg }}>
                            <p className="font-bold text-xs mb-1" style={{ color: ds.text }}>{selectedPillar}</p>
                            {pillarsLoading && !desc
                              ? <div className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" style={{ color: ds.text }} /><span className="text-xs" style={{ color: ds.text }}>Loading…</span></div>
                              : desc
                                ? <p className="text-xs leading-relaxed" style={{ color: ds.text }}>{desc}</p>
                                : <p className="text-xs opacity-60" style={{ color: ds.text }}>No description available.</p>}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              );
            })()}

            {/* Reel Ideas */}
            {result?.reel_ideas?.length > 0 && (
              <div className="panel p-5">
                <div className="flex items-center gap-2 mb-4"><Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-base text-foreground">{t('analyzer.reel_ideas')}</h2></div>
                <div className="space-y-2">
                  {result.reel_ideas.map((idea: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: PRIMARY_GRAD }}>{i + 1}</div>
                      <p className="text-sm text-foreground flex-1">{idea}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posting Tips */}
            {result?.posting_tips?.length > 0 && (
              <div className="panel p-5">
                <div className="flex items-center gap-2 mb-4"><Lightbulb className="w-4 h-4" style={{ color: PRIMARY }} /><h2 className="font-bold text-base text-foreground">{t('analyzer.posting_tips')}</h2></div>
                <div className="space-y-2.5">
                  {result.posting_tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: PRIMARY_CONTAINER }}>
                        <span className="text-[9px] font-bold" style={{ color: PRIMARY }}>{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* Posting Patterns — real data from HikerAPI */}
            {hiker && (hiker.posting_patterns?.best_day || hiker.reels?.length > 0) && (() => {
              const reels = hiker.reels || [];
              // Build day count from real posted_at timestamps
              const dayCount: Record<string, number> = {};
              DAYS_SHORT.forEach(d => dayCount[d] = 0);
              reels.forEach((r: any) => {
                if (!r.posted_at) return;
                const d = new Date(r.posted_at);
                const day = DAYS_SHORT[d.getDay()];
                dayCount[day] = (dayCount[day] || 0) + 1;
              });
              const maxDay = Math.max(...Object.values(dayCount), 1);
              const bestDay = Object.entries(dayCount).sort((a,b) => b[1]-a[1])[0]?.[0];
              const postsPerWeek = reels.length > 0
                ? (() => {
                    const sorted = reels.filter((r: any) => r.posted_at).sort((a: any, b: any) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime());
                    if (sorted.length < 2) return null;
                    const weeks = (new Date(sorted[sorted.length-1].posted_at).getTime() - new Date(sorted[0].posted_at).getTime()) / (7 * 24 * 3600 * 1000);
                    return weeks > 0 ? (sorted.length / weeks).toFixed(1) : null;
                  })()
                : null;

              return (
                <div className="panel p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4" style={{ color: PRIMARY }} />
                    <h2 className="font-bold text-base text-foreground">Posting Patterns</h2>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>Real Data</span>
                  </div>

                  {/* Summary pills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {bestDay && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: PRIMARY_CONTAINER }}>
                        <Calendar className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                        <span className="text-xs text-muted-foreground">Best day:</span>
                        <span className="text-xs font-bold" style={{ color: PRIMARY }}>{bestDay}</span>
                      </div>
                    )}
                    {postsPerWeek && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: '#e8f5e9' }}>
                        <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-bold text-green-700">{postsPerWeek}x / week</span>
                      </div>
                    )}
                  </div>

                  {/* Days bar chart */}
                  {Object.values(dayCount).some(v => v > 0) && (
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Posts by Day</p>
                      <div className="flex items-end gap-1.5 h-16">
                        {DAYS_SHORT.map(day => (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-t-md transition-all" style={{
                              height: `${Math.round((dayCount[day] / maxDay) * 48)}px`,
                              minHeight: dayCount[day] > 0 ? '4px' : '0',
                              background: day === bestDay ? PRIMARY : PRIMARY_CONTAINER,
                            }} />
                            <span className="text-[9px] font-bold" style={{ color: day === bestDay ? PRIMARY : 'hsl(var(--muted-foreground))' }}>{day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {reels.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">No reel data available for posting patterns</p>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* Hiker section */}
        {(hikerLoading || hiker) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" style={{ color: PRIMARY }} />
              <h2 className="font-bold text-base text-foreground">Reels & Deep Insights</h2>
            </div>
            {hikerLoading && !hiker ? (
              <div className="panel p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: PRIMARY }} />
                <p className="text-sm text-muted-foreground mt-2">Fetching reels…</p>
              </div>
            ) : hiker && (hiker.reels?.length > 0 || hiker.stats) ? (
              <>
                {/* Audio */}
                {hiker.top_audio?.length > 0 && (
                  <div className="panel p-4">
                    <div className="flex items-center gap-2 mb-3"><Music className="w-4 h-4" style={{ color: PRIMARY }} /><h3 className="font-bold text-sm text-foreground">Top Audio</h3></div>
                    <div className="space-y-1.5">
                      {hiker.top_audio.map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-foreground truncate mr-2">🎵 {a.title}</span>
                          <span className="text-xs text-muted-foreground shrink-0">×{a.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reels Grid */}
                {hiker.reels?.length > 0 && (
                  <div className="panel p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><Play className="w-4 h-4" style={{ color: PRIMARY }} /><h3 className="font-bold text-sm text-foreground">Reels ({hiker.reels.length})</h3></div>
                    </div>
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      {([['top', 'Top Views'], ['latest', 'Latest'], ['liked', 'Most Liked'], ['viral', 'Viral']] as const).map(([val, label]) => (
                        <button key={val} onClick={() => { setReelsFilter(val); setReelsVisible(9); }}
                          className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                          style={reelsFilter === val ? { background: PRIMARY, color: '#fff' } : { background: PRIMARY_CONTAINER, color: PRIMARY }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <style>{`@keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(900%); } }`}</style>
                    <div className="flex gap-2 overflow-x-auto horizontal-scroll pb-2" style={{ scrollSnapType: "x mandatory" }}>
                      {filterReels(hiker.reels).map((reel: any, i: number) => (
                        <div key={reel.id || i} onClick={() => reel.permalink && window.open(reel.permalink, '_blank')}
                          className="relative rounded-xl overflow-hidden cursor-pointer group" style={{ aspectRatio: '9/16', background: '#1a1a2e', width: '110px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white/15" />
                          </div>
                          <img src={getReelThumbnailSrc(reel.thumbnail)} alt={getReelAltText(reel.caption, reel.username)}
                            referrerPolicy="no-referrer" loading="lazy" decoding="async"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={handleReelThumbnailError} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, transparent 60%, rgba(124,58,237,0.15) 100%)' }} />
                          <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div style={{ position: 'absolute', width: '100%', height: '30%', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.07), transparent)', animation: 'scanline 1.5s linear infinite' }} />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-2xl" style={{ background: 'rgba(124,58,237,0.9)', backdropFilter: 'blur(6px)' }}>
                              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                            </div>
                          </div>
                          {reel.caption && (
                            <div className="absolute top-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)' }}>
                              <p className="text-[7px] text-white/90 line-clamp-2 leading-tight">{reel.caption}</p>
                            </div>
                          )}
                          <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 items-end">
                            {(() => {
                              const boostType = getBoostType(reel, hiker.stats?.avg_views, hiker.stats?.avg_likes);
                              if (!boostType) return null;
                              return boostType === 'paid' ? (
                                <div className="px-1.5 py-0.5 rounded text-white text-[8px] font-bold"
                                  title="Sponsored/Paid promotion content"
                                  style={{ background: '#7c3aed' }}>
                                  💰 Paid
                                </div>
                              ) : (
                                <div className="px-1.5 py-0.5 rounded text-white text-[8px] font-bold"
                                  title="High views but low likes/comments — possible view boosting"
                                  style={{ background: '#f59e0b' }}>
                                  ⚠️ Low Eng
                                </div>
                              );
                            })()}
                            {reel.virality?.label && (
                              <div className="px-1.5 py-0.5 rounded text-white text-[8px] font-bold"
                                style={{ background: reel.virality.score >= 65 ? '#16a34a' : PRIMARY }}>{reel.virality.label}</div>
                            )}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-1.5">
                            <div className="flex items-center gap-1.5">
                              <Eye className="w-2.5 h-2.5 text-white/80" /><span className="text-[8px] text-white/80">{formatNum(Number(reel.views) || 0)}</span>
                              <Heart className="w-2.5 h-2.5 text-white/80" /><span className="text-[8px] text-white/80">{formatNum(Number(reel.likes) || 0)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* Posts Grid */}
                {(hiker.posts?.length > 0 || result?.sc_posts?.length > 0) && (() => {
                  const displayPosts = hiker.posts?.length > 0 ? hiker.posts : result?.sc_posts || [];
                  return (
                    <div className="panel p-4">
                      <div className="flex items-center gap-2 mb-3"><MessageCircle className="w-4 h-4" style={{ color: PRIMARY }} /><h3 className="font-bold text-sm text-foreground">Posts ({displayPosts.length})</h3></div>
                      <div className="flex gap-1.5 mb-3 flex-wrap">
                        {([['top', 'Top'], ['latest', 'Latest'], ['liked', 'Most Liked']] as const).map(([val, label]) => (
                          <button key={val} onClick={() => setPostsFilter(val)}
                            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                            style={postsFilter === val ? { background: PRIMARY, color: '#fff' } : { background: PRIMARY_CONTAINER, color: PRIMARY }}>
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto horizontal-scroll pb-2" style={{ scrollSnapType: "x mandatory" }}>
                        {filterPosts(displayPosts).map((post: any, i: number) => (
                          <a key={post.id || i} href={post.permalink} target="_blank" rel="noopener noreferrer"
                            className="relative rounded-xl overflow-hidden group block" style={{ aspectRatio: '1/1', background: '#1a1a2e', width: '110px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Image className="w-5 h-5 text-white/15" />
                            </div>
                            {post.thumbnail && (
                              <img src={post.thumbnail.includes('supabase') ? post.thumbnail : `${BASE}/api/instagram/img?u=${encodeURIComponent(post.thumbnail)}`}
                                alt={post.caption?.slice(0, 40) || ''}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, transparent 60%, rgba(124,58,237,0.1) 100%)' }} />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-2xl" style={{ background: 'rgba(124,58,237,0.9)', backdropFilter: 'blur(6px)' }}>
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            {isBoosted(post) && (
                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-white text-[8px] font-bold" style={{ background: '#f59e0b' }}>
                                💰 Boosted
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="flex items-center gap-1.5">
                                <Heart className="w-2.5 h-2.5 text-white/80" /><span className="text-[8px] text-white/80">{formatNum(post.likes || 0)}</span>
                                <MessageCircle className="w-2.5 h-2.5 text-white/80" /><span className="text-[8px] text-white/80">{formatNum(post.comments || 0)}</span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Real hashtags from HikerAPI only */}
                {hiker.top_hashtags?.length > 0 && (
                  <div className="panel p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" style={{ color: PRIMARY }} />
                        <h3 className="font-bold text-sm text-foreground">Hashtags They Use ({hiker.top_hashtags.length})</h3>
                      </div>
                      <button onClick={() => copyText(hiker.top_hashtags.map((h: any) => h.tag).join(' '), 'all-hashtags')} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
                        {copied === 'all-hashtags' ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy all</>}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hiker.top_hashtags.map((h: any, i: number) => (
                        <button key={i} onClick={() => copyText(h.tag, `htag-${i}`)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 flex items-center gap-1"
                          style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                          {h.tag} <span className="opacity-60">×{h.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}


              </>
            ) : hiker ? (
              <div className="panel p-5 text-center">
                <p className="text-sm text-muted-foreground">No public reels found for this account.</p>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Trending reels — searchable strip, kept below the competitor analyzer */}
        <div ref={trendingPanelRef} className="panel p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5" style={{ color: PRIMARY }} />
            <h2 className="font-bold text-lg text-foreground">{t('analyzer.trending_reels')}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Live top 20 Instagram reels for your niche — filter by timeframe and sort to zero in on what&apos;s landing right now.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); searchTrendingReels(trendingInput); }}
            className="flex gap-2 mb-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={trendingInput}
                onChange={(e) => setTrendingInput(e.target.value)}
                placeholder="Search reels by keyword or hashtag"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-secondary text-foreground placeholder:text-muted-foreground outline-none text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={trendingLoading || !trendingInput.trim()}
              className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-60 hover:shadow-lg transition-all shrink-0 flex items-center gap-1.5"
              style={{ background: PRIMARY_GRAD }}
            >
              {trendingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><TrendingUp className="w-3.5 h-3.5" /> Discover trends</>}
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timeframe</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TIMEFRAME_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setTrendingTimeframeAndRerun(opt.value)} type="button"
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${trendingTimeframe === opt.value ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
                    style={trendingTimeframe === opt.value ? { background: PRIMARY_GRAD } : { background: PRIMARY_CONTAINER }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <BarChart2 className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sort by</span>
              </div>
              <select
                value={trendingSort}
                onChange={(e) => setTrendingSortAndRerun(e.target.value as TrendingSort)}
                className="px-3 py-1.5 rounded-xl border border-input bg-secondary text-foreground text-xs font-semibold outline-none focus:border-primary"
              >
                {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* Hashtag quick picks */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {TRENDING_HASHTAGS.map(tag => (
              <button key={tag} type="button" onClick={() => { setTrendingInput(tag); searchTrendingReels(tag); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={trendingKeyword.toLowerCase() === tag ? { background: PRIMARY_GRAD, color: 'white' } : { background: PRIMARY_CONTAINER, color: PRIMARY }}>
                #{tag}
              </button>
            ))}
          </div>

          {trendingLoading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Search className="size-3.5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Researching</span>
                <em className="text-sm italic font-semibold text-foreground">&ldquo;{trendingKeyword}&rdquo;</em>
              </div>
              <ResearchChecklist steps={TRENDING_STEPS} activeStep={trendingStep} />
              <p className="text-xs text-muted-foreground">Live scrape · reusing SocialRum&apos;s smart cache when available.</p>
            </div>
          ) : trendingReels.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto horizontal-scroll pb-2" style={{ scrollSnapType: "x mandatory" }}>
              {trendingReels.map((reel: any, i: number) => (
                <div key={reel.id || i} onClick={() => reel.permalink && window.open(reel.permalink, '_blank')}
                  className="relative rounded-xl overflow-hidden cursor-pointer group" style={{ aspectRatio: '9/16', background: '#1a1a2e', width: '110px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                  <img src={getReelThumbnailSrc(reel.thumbnail)} alt={getReelAltText(reel.caption, reel.username)}
                    referrerPolicy="no-referrer" loading="lazy" decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={handleReelThumbnailError} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-2.5 h-2.5 text-white/80" /><span className="text-[8px] text-white/80">{formatNum(Number(reel.views) || 0)}</span>
                      <Heart className="w-2.5 h-2.5 text-white/80" /><span className="text-[8px] text-white/80">{formatNum(Number(reel.likes) || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : trendingSearched ? (
            <p className="text-xs text-muted-foreground text-center py-4">No reels found for "{trendingKeyword}" — try another keyword.</p>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">Search a keyword or hashtag to see reels.</p>
          )}
        </div>

      </main>
    </div>
  );
}
