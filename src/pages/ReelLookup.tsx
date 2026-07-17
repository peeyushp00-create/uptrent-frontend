import { useState } from "react";
import { Loader2, Link2, Heart, MessageCircle, Play } from "lucide-react";
import SEO from "@/components/SEO";

const PRIMARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #9f6fef)";
const PRIMARY_CONTAINER = "#ede9fe";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const formatNum = (n: number | null | undefined) => {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

interface ReelResult {
  url?: string;
  caption?: string;
  username?: string;
  likes?: number | null;
  comments?: number | null;
  thumbnail?: string;
  title?: string;
}

export default function ReelLookup() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reel, setReel] = useState<ReelResult | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const lookup = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setReel(null); setMeta(null);
    try {
      const res = await fetch(`${BASE}/api/reels/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch reel data');
      } else {
        setReel(data.reel);
        setMeta(data.meta);
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900 p-4 md:p-8">
      <SEO title="Reel Lookup — SocialRum" noindex />
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#191c1d] dark:text-white flex items-center gap-2">
            <Link2 className="w-5 h-5" style={{ color: PRIMARY }} /> Reel Lookup
          </h1>
          <p className="text-sm text-[#757684] mt-1">
            Paste an Instagram reel URL to fetch its stats via Bright Data.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4 flex gap-2">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            placeholder="https://www.instagram.com/reel/..."
            className="flex-1 px-3 py-2.5 rounded-xl border border-[#e1e3e4] dark:border-gray-600 bg-transparent text-sm text-[#191c1d] dark:text-white outline-none focus:ring-2"
            style={{ '--tw-ring-color': PRIMARY } as React.CSSProperties}
          />
          <button
            onClick={lookup}
            disabled={loading || !url.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 shrink-0"
            style={{ background: PRIMARY_GRAD }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
          </button>
        </div>

        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-6 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" style={{ color: PRIMARY }} />
            <p className="text-xs text-[#757684]">Fetching reel via Bright Data…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {reel && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#1a1a2e] shrink-0 flex items-center justify-center">
                {reel.thumbnail
                  ? <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" />
                  : <Play className="w-6 h-6 text-white/30" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#191c1d] dark:text-white">@{reel.username || 'unknown'}</p>
                {reel.caption && (
                  <p className="text-xs text-[#757684] mt-1 line-clamp-3">{reel.caption}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-3 text-center" style={{ background: '#fce4ec' }}>
                <Heart className="w-3.5 h-3.5 mx-auto mb-1 text-pink-600" />
                <p className="font-bold text-sm text-pink-700">{formatNum(reel.likes)}</p>
                <p className="text-[10px] text-[#757684]">Likes</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: '#fff3e0' }}>
                <MessageCircle className="w-3.5 h-3.5 mx-auto mb-1 text-orange-600" />
                <p className="font-bold text-sm text-orange-700">{formatNum(reel.comments)}</p>
                <p className="text-[10px] text-[#757684]">Comments</p>
              </div>
            </div>
            <p className="text-[10px] text-[#757684] text-center">
              View counts aren't exposed via Instagram's public page metadata — likes/comments only.
            </p>

            {reel.url && (
              <a href={reel.url} target="_blank" rel="noopener noreferrer"
                className="text-xs font-bold block text-center" style={{ color: PRIMARY }}>
                Open on Instagram →
              </a>
            )}
          </div>
        )}

        {/* Raw meta tags — useful while confirming the scrape is picking up real data */}
        {meta && (
          <details className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
            <summary className="text-xs font-bold cursor-pointer text-[#757684]">Raw meta tags</summary>
            <pre className="text-[10px] mt-2 overflow-x-auto whitespace-pre-wrap text-[#454652] dark:text-gray-300">
              {JSON.stringify(meta, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
