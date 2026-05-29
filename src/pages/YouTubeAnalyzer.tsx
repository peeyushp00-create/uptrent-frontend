import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Copy, Check, Loader2, Youtube, X,
  TrendingUp, Users, Eye, Video, Sparkles, BarChart2, Target, Lightbulb, ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const YT_GRAD = "linear-gradient(135deg, #ff0000, #cc0000)";
const YT_COLOR = "#ff0000";
const YT_CONTAINER = "#ffebee";

const POPULAR_CHANNELS = [
  "MrBeast", "CarryMinati", "Technical Guruji", "Bhuvan Bam",
  "Amit Bhadana", "Triggered Insaan", "Dhruv Rathee",
  "Ranveer Allahbadia", "Slayy Point", "Ashish Chanchlani",
];

function formatNum(n: number) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export default function YouTubeAnalyzer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ytChannel = user?.user_metadata?.youtube_channel || null;

  const [channelUrl, setChannelUrl] = useState(() => localStorage.getItem('yt_analyzer_channel') || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(() => {
    const saved = localStorage.getItem('yt_analyzer_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'mine' | 'search'>(ytChannel ? 'mine' : 'search');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('yt_analyzer_channel', channelUrl); }, [channelUrl]);

  useEffect(() => {
    if (channelUrl.trim().length > 0) {
      const filtered = POPULAR_CHANNELS.filter(s =>
        s.toLowerCase().includes(channelUrl.toLowerCase()) && s.toLowerCase() !== channelUrl.toLowerCase()
      ).slice(0, 5);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else { setShowDropdown(false); setDropdownSuggestions([]); }
  }, [channelUrl]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (ytChannel && activeTab === 'mine' && !result) {
      handleAnalyze(ytChannel.channel_name);
    }
  }, [activeTab]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const handleClear = () => {
    setChannelUrl(''); setResult(null);
    localStorage.removeItem('yt_analyzer_result');
    localStorage.removeItem('yt_analyzer_channel');
  };

  const handleAnalyze = async (channel?: string) => {
    const target = channel || channelUrl;
    if (!target.trim()) return;
    setChannelUrl(target); setShowDropdown(false); setLoading(true); setResult(null);
    try {
      const res = await fetch(`${BASE}/api/youtube/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: target }),
      });
      const data = await res.json();
      setResult(data);
      localStorage.setItem('yt_analyzer_result', JSON.stringify(data));
      localStorage.setItem('yt_analyzer_channel', target);
    } catch { setResult({ error: 'Failed to analyze channel. Try again.' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center">
        <div className="flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-500" />
          <h1 className="font-bold text-xl text-[#191c1d] dark:text-white">Channel Analyzer</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-28 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white dark:bg-gray-800 border border-[#e1e3e4] dark:border-gray-700">
          <button onClick={() => setActiveTab('mine')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={activeTab === 'mine' ? { background: YT_GRAD, color: '#fff' } : { color: '#757684' }}>
            <Youtube className="w-4 h-4" /> My Channel
          </button>
          <button onClick={() => setActiveTab('search')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={activeTab === 'search' ? { background: YT_GRAD, color: '#fff' } : { color: '#757684' }}>
            <Search className="w-4 h-4" /> Any Channel
          </button>
        </div>

        {/* MY CHANNEL TAB */}
        {activeTab === 'mine' && (
          <AnimatePresence mode="wait">
            {!ytChannel ? (
              <motion.div key="not-connected" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: YT_CONTAINER }}>
                  <Youtube className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-lg text-[#191c1d] dark:text-white mb-2">{t('settings.connect_youtube')}</p>
                  <p className="text-sm text-[#757684] max-w-xs">Connect your YouTube channel to get personalized analysis</p>
                </div>
                <button onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
                  style={{ background: YT_GRAD }}>
                  <Youtube className="w-4 h-4" /> {t('settings.connect_youtube')}
                </button>
              </motion.div>
            ) : (
              <motion.div key="connected" initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    {ytChannel.channel_thumbnail && <img src={ytChannel.channel_thumbnail} alt="" className="w-12 h-12 rounded-full shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base text-[#191c1d] dark:text-white truncate">{ytChannel.channel_name}</p>
                      <p className="text-xs text-[#757684]">Your connected channel</p>
                    </div>
                    <button onClick={() => handleAnalyze(ytChannel.channel_name)} disabled={loading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50"
                      style={{ background: YT_GRAD }}>
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {t('trending.analyze')}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Users, label: t('home.subscribers'), val: formatNum(Number(ytChannel.subscribers || 0)), color: '#ff0000' },
                      { icon: Video, label: t('home.videos'), val: formatNum(Number(ytChannel.video_count || 0)), color: '#ff6b35' },
                      { icon: Eye, label: t('home.total_views'), val: formatNum(Number(ytChannel.total_views || 0)), color: '#ff9900' },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-xl p-3 text-center" style={{ background: YT_CONTAINER }}>
                        <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
                        <p className="font-bold text-sm text-[#191c1d]">{stat.val}</p>
                        <p className="text-[10px] text-[#757684]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {loading && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    <p className="text-sm text-[#757684]">{t('common.loading')}</p>
                  </div>
                )}
                {result && !result.error && !loading && <AnalysisResults result={result} onCopy={copyText} copied={copied} />}
                {result?.error && <p className="text-sm text-center text-red-500">{result.error}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* SEARCH ANY CHANNEL TAB */}
        {activeTab === 'search' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-4">
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757684]" />
                  <input ref={inputRef} value={channelUrl} onChange={e => setChannelUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAnalyze(); if (e.key === "Escape") setShowDropdown(false); }}
                    onFocus={e => { e.target.style.borderColor = `${YT_COLOR}60`; if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                    onBlur={e => { e.target.style.borderColor = ''; }}
                    placeholder="Channel name (e.g. MrBeast, Dhruv Rathee)"
                    className="w-full pl-11 pr-9 py-3.5 rounded-2xl border border-[#e1e3e4] bg-white dark:bg-gray-800 text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none text-sm transition-all" />
                  {channelUrl && <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684]"><X className="w-4 h-4" /></button>}
                </div>
                <button onClick={() => handleAnalyze()} disabled={loading || !channelUrl.trim()}
                  className="px-5 py-3.5 rounded-2xl text-white text-sm font-bold disabled:opacity-50"
                  style={{ background: YT_GRAD }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              {showDropdown && (
                <div ref={dropdownRef} className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-[#e1e3e4] rounded-2xl shadow-xl z-50 overflow-hidden" style={{ width: 'calc(100% - 60px)' }}>
                  {dropdownSuggestions.map((s, i) => (
                    <button key={i} onClick={() => handleAnalyze(s)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#191c1d] dark:text-white hover:bg-[#f3f4f5] text-left">
                      <Youtube className="w-3.5 h-3.5 shrink-0 text-red-500" />{s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!channelUrl && !result && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#757684] uppercase tracking-wider">Popular Indian Channels</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CHANNELS.map(ch => (
                    <button key={ch} onClick={() => handleAnalyze(ch)}
                      className="px-3 py-1.5 rounded-full border border-[#e1e3e4] bg-white dark:bg-gray-800 text-xs text-[#454652] hover:border-red-300 hover:text-red-500 transition-colors">
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-sm text-[#757684]">{t('common.loading')}</p>
              </div>
            )}
            {result && !result.error && !loading && <AnalysisResults result={result} onCopy={copyText} copied={copied} />}
            {result?.error && <p className="text-sm text-center text-red-500">{result.error}</p>}
          </motion.div>
        )}
      </main>
    </div>
  );
}

function AnalysisResults({ result, onCopy, copied }: { result: any; onCopy: (text: string, key: string) => void; copied: string | null }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-3">
      {result.summary && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">Channel Summary</p>
          </div>
          <p className="text-sm text-[#454652] dark:text-gray-300 leading-relaxed">{result.summary}</p>
        </div>
      )}
      {result.content_pillars?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">Content Pillars</p>
          </div>
          <div className="space-y-2">
            {result.content_pillars.map((pillar: string, i: number) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#ffebee' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: YT_GRAD }}>{i+1}</div>
                <p className="text-sm text-[#191c1d] dark:text-white">{pillar}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.video_ideas?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-orange-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Video Ideas for You</p>
          </div>
          <div className="space-y-2">
            {result.video_ideas.map((idea: string, i: number) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-[#f8f9fa] dark:bg-gray-700">
                <span className="text-xs text-[#757684] mt-0.5 w-5 shrink-0 font-bold">{i+1}.</span>
                <p className="text-sm text-[#191c1d] dark:text-white flex-1 leading-snug">{idea}</p>
                <button onClick={() => onCopy(idea, `idea-${i}`)} className="shrink-0">
                  {copied === `idea-${i}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-[#757684]" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.growth_tips?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-[#e1e3e4] dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-green-500">Growth Tips</p>
          </div>
          <div className="space-y-2">
            {result.growth_tips.map((tip: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-[#454652] dark:text-gray-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.competitor_insights && (
        <div className="rounded-2xl p-4" style={{ background: '#ffebee', border: '1px solid #ffcdd2' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">Key Insight</p>
          </div>
          <p className="text-sm text-[#191c1d] leading-relaxed">{result.competitor_insights}</p>
        </div>
      )}
    </motion.div>
  );
}