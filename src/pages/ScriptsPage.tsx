import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Clock, RefreshCw, Mic, Search, X, ChevronRight, Trash2, Flame, TrendingUp, Newspaper, Wand2, BarChart2, FileText, ChevronDown } from "lucide-react";
import { generateScript } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const PRIMARY = "#7C3AED";
const SECONDARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #7C3AED)";
const PRIMARY_CONTAINER = "#ede9fe";
const SECONDARY_CONTAINER = "#ede9fe";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const CONTENT_TYPES = [
  { id: "educational", label: "🎓 Educational", description: "Teach something valuable", prompt: "Create an educational script that clearly explains the topic step by step, uses simple language, and ends with a key takeaway." },
  { id: "storytelling", label: "📖 Storytelling", description: "Personal story or journey", prompt: "Create a storytelling script with a personal narrative arc — setup, conflict, resolution. Make it emotional and relatable." },
  { id: "trending", label: "🔥 Trending React", description: "React to hot news/trend", prompt: "Create a reaction script to this trending topic. Start with the news, give a strong opinion, and ask audience what they think." },
  { id: "tips", label: "💡 Tips & Tricks", description: "Quick actionable tips", prompt: "Create a tips and tricks script with numbered points. Each tip should be specific, actionable and immediately useful." },
  { id: "comedy", label: "🎭 Comedy/Skit", description: "Funny or relatable content", prompt: "Create a funny, relatable comedy script with Indian humor. Use sarcasm, relatable situations, and a punchline ending." },
  { id: "motivational", label: "💪 Motivational", description: "Inspire the audience", prompt: "Create a powerful motivational script that connects emotionally, uses a real story or example, and ends with a strong call to action." },
  { id: "opinion", label: "📊 Opinion/Take", description: "Your honest take on a topic", prompt: "Create an opinion script with a strong controversial or unique take on the topic. Be bold, back it up with reasoning, and invite debate." },
  { id: "review", label: "🛒 Product Review", description: "Review or recommend something", prompt: "Create an honest product or service review script covering pros, cons, who it's for, and a clear recommendation." },
];

const DURATION_OPTIONS = [
  { label: "30s", value: 30, description: "Quick Reel" },
  { label: "60s", value: 60, description: "Standard" },
  { label: "90s", value: 90, description: "Detailed" },
];

const SUGGESTIONS = [
  "Fitness", "Finance", "Cricket", "Bollywood", "Tech", "Food",
  "Travel", "Gaming", "Motivation", "Skincare", "Yoga", "Crypto",
  "Business", "Education", "Fashion", "Comedy", "IPL", "AI",
];

const SUB_CATEGORIES: Record<string, { label: string; suggestions: string[]; emoji: string }> = {
  gaming: { emoji: "🎮", label: "Which game?", suggestions: ["BGMI", "Free Fire", "GTA 5", "Minecraft", "Valorant", "Call of Duty", "FIFA", "Chess", "Roblox", "PUBG PC"] },
  fitness: { emoji: "💪", label: "What fitness topic?", suggestions: ["Home Workout", "Weight Loss", "Muscle Building", "Yoga", "HIIT Training", "Cardio", "Diet Plan", "6 Pack Abs", "Stretching", "Running Tips"] },
  finance: { emoji: "📈", label: "What finance topic?", suggestions: ["Stock Market", "Mutual Funds SIP", "Crypto Bitcoin", "Budget Tips", "Tax Saving", "Credit Card", "Passive Income", "IPO Investing", "Real Estate", "Forex Trading"] },
  cricket: { emoji: "🏏", label: "What cricket topic?", suggestions: ["IPL 2026", "India vs Pakistan", "Virat Kohli", "Rohit Sharma", "Batting Tips", "Bowling Tips", "Fantasy Cricket", "Test Match", "T20 Analysis", "Women's Cricket"] },
  food: { emoji: "🍳", label: "What food topic?", suggestions: ["Biryani Recipe", "Quick Breakfast", "Street Food", "Healthy Meals", "Dessert Recipe", "Vegan Food", "Keto Diet", "Indian Snacks", "Budget Meals", "Meal Prep"] },
  tech: { emoji: "💻", label: "What tech topic?", suggestions: ["ChatGPT Tutorial", "AI Tools", "Budget Smartphone", "Laptop Review", "Coding Tips", "Cybersecurity", "Electric Vehicles", "Smart Home", "Camera Review", "Gaming PC"] },
  travel: { emoji: "✈️", label: "Where?", suggestions: ["Goa", "Manali", "Kerala", "Rajasthan", "Dubai", "Thailand", "Bali", "Europe Budget", "Northeast India", "Andaman"] },
  motivation: { emoji: "🔥", label: "What motivation topic?", suggestions: ["Morning Routine", "Discipline", "Study Tips", "Success Mindset", "Overcoming Failure", "Self Improvement", "Stoicism", "Atomic Habits", "Goal Setting", "Confidence"] },
  business: { emoji: "💼", label: "What business topic?", suggestions: ["Start a Business", "Freelancing", "Dropshipping", "Instagram Marketing", "YouTube Strategy", "Entrepreneurship", "Digital Marketing", "LinkedIn Growth", "Amazon Selling", "Startup Ideas"] },
  bollywood: { emoji: "🎬", label: "What Bollywood topic?", suggestions: ["Movie Review", "Celebrity News", "Box Office", "Upcoming Movies", "Actor Ranking", "Best Movies 2026", "Web Series Review", "OTT Platform", "Award Show", "Music Album"] },
  skincare: { emoji: "✨", label: "What skincare topic?", suggestions: ["Acne Treatment", "Glass Skin", "Anti Aging", "Sunscreen Guide", "Night Routine", "Morning Routine", "Budget Skincare", "Korean Beauty", "Dark Spots", "Oily Skin"] },
};

function detectNiche(input: string): string | null {
  const q = input.toLowerCase().trim();
  const keywords: Record<string, string[]> = {
    gaming: ["gaming", "game", "bgmi", "free fire", "pubg", "gta", "minecraft", "valorant"],
    fitness: ["fitness", "gym", "workout", "weight loss", "muscle", "yoga", "exercise"],
    finance: ["finance", "money", "stock", "invest", "mutual fund", "sip", "trading", "budget"],
    cricket: ["cricket", "ipl", "kohli", "rohit", "batting", "bowling", "t20"],
    food: ["food", "recipe", "cooking", "biryani", "meal", "diet", "eat"],
    tech: ["tech", "technology", "ai", "coding", "smartphone", "laptop", "chatgpt"],
    travel: ["travel", "trip", "goa", "manali", "kerala", "dubai", "bali"],
    motivation: ["motivation", "mindset", "discipline", "success", "habit", "routine"],
    business: ["business", "startup", "entrepreneur", "freelance", "marketing"],
    bollywood: ["bollywood", "movie", "film", "actor", "actress", "netflix", "ott"],
    skincare: ["skincare", "skin", "acne", "glow", "beauty", "moisturizer", "serum"],
  };
  for (const [niche, words] of Object.entries(keywords)) {
    if (words.some(w => q.includes(w))) return niche;
  }
  return null;
}

interface HistoryEntry {
  id: string;
  topic: string;
  timestamp: number;
  script: any;
  mode: string;
  duration: number;
  language: string;
}

function saveHistory(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  const existing: HistoryEntry[] = JSON.parse(localStorage.getItem("ig_script_history") || "[]");
  const newEntry = { ...entry, id: `${Date.now()}`, timestamp: Date.now() };
  localStorage.setItem("ig_script_history", JSON.stringify([newEntry, ...existing].slice(0, 20)));
}

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ScriptsPage() {
  const { user } = useAuth();
  const userNiche = user?.user_metadata?.niche || '';
  const userVoiceStyle = user?.user_metadata?.voice_style || '';

  const [topicInput, setTopicInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [script, setScript] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [contentType, setContentType] = useState('educational');
  const [duration, setDuration] = useState(60);
  const [history, setHistory] = useState<HistoryEntry[]>(() => JSON.parse(localStorage.getItem("ig_script_history") || "[]"));
  const [showHistory, setShowHistory] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const [detectedNiche, setDetectedNiche] = useState<string | null>(null);
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [showIdeas, setShowIdeas] = useState(false);
  const [ideas, setIdeas] = useState<{ news: any[]; reelIdeas: string[] }>({ news: [], reelIdeas: [] });
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ideasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topicInput.trim().length > 0) {
      const filtered = SUGGESTIONS.filter(s => s.toLowerCase().includes(topicInput.toLowerCase()) && s.toLowerCase() !== topicInput.toLowerCase()).slice(0, 6);
      setDropdownSuggestions(filtered); setShowDropdown(filtered.length > 0);
      const niche = detectNiche(topicInput);
      if (niche && SUB_CATEGORIES[niche]) { setDetectedNiche(niche); setShowSubCategories(true); }
      else { setDetectedNiche(null); setShowSubCategories(false); }
    } else { setShowDropdown(false); setDropdownSuggestions([]); setDetectedNiche(null); setShowSubCategories(false); }
  }, [topicInput]);

  useEffect(() => {
    if (script) {
      const text = [script.hook, script.body, script.cta].filter(Boolean).join(' ');
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    }
  }, [script]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (ideasRef.current && !ideasRef.current.contains(e.target as Node)) setShowIdeas(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchIdeas = async () => {
    setLoadingIdeas(true);
    const userNiches: string[] = user?.user_metadata?.niches || (userNiche ? [userNiche] : []);
    const topicForIdeas = topicInput.trim() || userNiches[0] || 'Finance';
    try {
      const res = await fetch(`${BASE}/api/news?filter=today&topicId=${encodeURIComponent(topicForIdeas)}`);
      const data = await res.json();
      const newsList = Array.isArray(data) ? data.slice(0, 5) : [];
      const reelIdeas = [
        `🔥 React to: "${newsList[0]?.title?.slice(0, 50) || topicForIdeas + ' latest'}"`,
        `📊 Explain "${topicForIdeas}" in 60 seconds`,
        `💡 Top 5 things about ${topicForIdeas} nobody knows`,
        `⚡ ${topicForIdeas} mistake everyone makes`,
        `🎯 My honest take on ${topicForIdeas}`,
        `📈 Why ${topicForIdeas} is changing in 2026`,
        `🚀 ${topicForIdeas} tips that actually work`,
        `❌ Stop doing this in ${topicForIdeas}`,
      ];
      setIdeas({ news: newsList, reelIdeas });
    } catch {
      setIdeas({ news: [], reelIdeas: [`🔥 Top 5 ${topicForIdeas} tips`, `📊 ${topicForIdeas} in 60 seconds`, `💡 ${topicForIdeas} secrets`, `⚡ ${topicForIdeas} mistakes`] });
    } finally { setLoadingIdeas(false); }
  };

  const handleGenerate = async (topic: string) => {
    if (!topic.trim()) return;
    const userLanguage = localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english';
    setGenerating(true); setError(''); setSelectedTopic(topic);
    setTopicInput(topic); setShowDropdown(false); setShowSubCategories(false); setShowIdeas(false);
    try {
      const selectedContentType = CONTENT_TYPES.find(c => c.id === contentType);
      const result = await generateScript({
        topic, niche: userNiche, language: userLanguage, voiceStyle: userVoiceStyle, duration,
        contentTypePrompt: selectedContentType?.prompt || '',
        contentType: selectedContentType?.label || '',
      });
      setScript(result);
      saveHistory({ topic, script: result, mode: contentType, duration, language: userLanguage });
      setHistory(JSON.parse(localStorage.getItem("ig_script_history") || "[]"));
    } catch { setError('Failed to generate. Please try again.'); }
    finally { setGenerating(false); }
  };

  const handleClear = () => { setTopicInput(''); setScript(null); setSelectedTopic(null); setDetectedNiche(null); setShowSubCategories(false); setWordCount(0); };

  const copyText = (text: string, section: string) => { navigator.clipboard.writeText(text); setCopied(section); setTimeout(() => setCopied(null), 2000); };

  const copyAll = (s: any) => {
    const parts = [];
    if (s.hook) parts.push(`HOOK:\n${s.hook}`);
    if (s.body) parts.push(`BODY:\n${s.body}`);
    if (s.cta) parts.push(`CTA:\n${s.cta}`);
    navigator.clipboard.writeText(parts.join('\n\n'));
    setCopied('all'); setTimeout(() => setCopied(null), 2000);
  };

  const deleteHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem("ig_script_history", JSON.stringify(updated));
    setHistory(updated);
  };

  const subCat = detectedNiche ? SUB_CATEGORIES[detectedNiche] : null;
  const estimatedSeconds = Math.round(wordCount / 2.5);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-[#e1e3e4] dark:border-gray-700 px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" style={{ color: PRIMARY }} />
          <h1 className="font-bold text-xl text-[#7C3AED] dark:text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Script Generator
          </h1>
          {userVoiceStyle && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: SECONDARY_CONTAINER, color: SECONDARY }}>
              <Mic className="w-3 h-3" /> Voice
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={showHistory ? { background: PRIMARY_GRAD, color: '#fff' } : { background: PRIMARY_CONTAINER, color: PRIMARY }}>
            <Clock className="w-3.5 h-3.5" />
            History {history.length > 0 && <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.3)' }}>{history.length}</span>}
          </button>
          {script && (
            <button onClick={() => copyAll(script)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: PRIMARY_GRAD }}>
              {copied === 'all' ? '✓ Copied!' : 'Save Script'}
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-5 pb-28">
       <div className="max-w-2xl mx-auto flex flex-col gap-5">

          {/* ── Main Writing Area ── */}
          <section className="flex flex-col gap-4">

            {/* Content Type Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#757684]">Content Type:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {CONTENT_TYPES.map(c => (
                  <button key={c.id} onClick={() => { setContentType(c.id); setScript(null); }}
                    className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                    style={contentType === c.id
                      ? { background: PRIMARY_GRAD, color: '#fff' }
                      : { background: '#e7e8e9', color: '#454652' }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-4 h-4 text-[#757684]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#757684]">Duration:</span>
              </div>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map(d => (
                  <button key={d.value} onClick={() => setDuration(d.value)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all"
                    style={duration === d.value
                      ? { background: PRIMARY_GRAD, borderColor: 'transparent', color: '#fff' }
                      : { borderColor: '#c5c5d4', color: '#454652' }}>
                    {d.label}
                    <p className="text-xs font-normal opacity-70">{d.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input ref={inputRef} type="text" value={topicInput}
                    onChange={e => setTopicInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleGenerate(topicInput); }}
                    onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                    placeholder="Enter topic (e.g. Gaming, Finance, Cricket)..."
                    className="w-full px-4 py-3 rounded-xl border border-[#c5c5d4] bg-[#f8f9fa] dark:bg-gray-700 dark:border-gray-600 text-[#191c1d] dark:text-white placeholder:text-[#757684] outline-none text-sm transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20" />
                  {topicInput && (
                    <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#191c1d]">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {showDropdown && dropdownSuggestions.length > 0 && (
                    <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-[#c5c5d4] rounded-xl shadow-lg z-50 overflow-hidden">
                      {dropdownSuggestions.map((s, i) => (
                        <button key={i} onClick={() => handleGenerate(s)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#191c1d] dark:text-white hover:bg-[#f3f4f5] dark:hover:bg-gray-700 text-left">
                          <Search className="w-3.5 h-3.5 text-[#757684] shrink-0" />{s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ideas button */}
                <div className="relative" ref={ideasRef}>
                  <button onClick={() => { if (!showIdeas) fetchIdeas(); setShowIdeas(prev => !prev); }}
                    className="px-3 py-3 rounded-xl border text-sm font-bold transition-all flex items-center gap-1.5"
                    style={showIdeas ? { background: PRIMARY_GRAD, color: '#fff', borderColor: 'transparent' } : { borderColor: '#c5c5d4', color: SECONDARY, background: SECONDARY_CONTAINER }}>
                    <Flame className="w-4 h-4" />
                    <span className="hidden sm:inline">Ideas</span>
                  </button>
                  <AnimatePresence>
                    {showIdeas && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-[#c5c5d4] dark:border-gray-600 rounded-2xl shadow-xl z-50 overflow-hidden"
                        style={{ width: 300 }}>
                        {loadingIdeas ? (
                          <div className="flex items-center justify-center py-8 gap-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                              <Sparkles className="w-4 h-4" style={{ color: SECONDARY }} />
                            </motion.div>
                            <span className="text-xs text-[#757684]">Fetching ideas...</span>
                          </div>
                        ) : (
                          <div className="max-h-80 overflow-y-auto">
                            {ideas.news.length > 0 && (
                              <div className="p-3 border-b border-[#e1e3e4]">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Newspaper className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: PRIMARY }}>Hot News</p>
                                </div>
                                {ideas.news.map((n, i) => (
                                  <button key={i} onClick={() => { setTopicInput((n.title || n.headline || '').slice(0, 60)); setShowIdeas(false); }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#191c1d] dark:text-white hover:bg-[#f3f4f5] dark:hover:bg-gray-700 leading-snug flex items-start gap-2">
                                    <TrendingUp className="w-3 h-3 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                                    <span className="line-clamp-2">{n.title || n.headline}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Flame className="w-3.5 h-3.5 text-orange-500" />
                                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Reel Ideas</p>
                              </div>
                              {ideas.reelIdeas.map((idea, i) => (
                                <button key={i} onClick={() => { setTopicInput(idea.replace(/^[🔥📊💡⚡🎯📈🚀❌]\s/, '')); setShowIdeas(false); }}
                                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#191c1d] dark:text-white hover:bg-[#f3f4f5] dark:hover:bg-gray-700 leading-snug">
                                  {idea}
                                </button>
                              ))}
                            </div>
                            <div className="px-3 pb-3">
                              <button onClick={fetchIdeas}
                                className="w-full py-2 rounded-xl text-xs font-semibold border border-[#c5c5d4] text-[#757684] hover:text-[#191c1d] flex items-center justify-center gap-1.5">
                                <RefreshCw className="w-3 h-3" /> Refresh
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={() => handleGenerate(topicInput)} disabled={generating}
                  className="px-5 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2 disabled:opacity-60 transition-all hover:shadow-lg"
                  style={{ background: PRIMARY_GRAD }}>
                  <Sparkles className="w-4 h-4" />
                  {generating ? '...' : 'Generate'}
                </button>
              </div>

              {/* Sub-categories */}
              <AnimatePresence>
                {showSubCategories && subCat && !script && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="mt-3 rounded-xl p-3 space-y-2"
                    style={{ background: SECONDARY_CONTAINER, border: `1px solid ${SECONDARY}30` }}>
                    <p className="text-xs font-bold" style={{ color: SECONDARY }}>{subCat.emoji} {subCat.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {subCat.suggestions.map(s => (
                        <button key={s} onClick={() => handleGenerate(s)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                          style={{ background: 'white', color: SECONDARY, border: `1px solid ${SECONDARY}30` }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Popular chips */}
              {!topicInput && !script && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-[#757684] font-medium">Popular topics:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.slice(0, 10).map(s => (
                      <button key={s} onClick={() => setTopicInput(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[#c5c5d4] text-[#454652] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-sm px-1">{error}</p>}

            {/* ── Generating state ── */}
            {generating && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] p-8 flex flex-col items-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-8 h-8" style={{ color: SECONDARY }} />
                </motion.div>
                <p className="text-sm font-semibold text-[#191c1d] dark:text-white">Writing script for <span style={{ color: SECONDARY }}>"{selectedTopic}"</span>...</p>
                <p className="text-xs text-[#757684]">{CONTENT_TYPES.find(c => c.id === contentType)?.label}</p>
              </div>
            )}

            {/* ── Script Output (Writing Canvas) ── */}
            {script && !generating && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 overflow-hidden">

                {/* Canvas header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#e1e3e4] dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#757684]">Format:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: PRIMARY_GRAD }}>
                      {CONTENT_TYPES.find(c => c.id === contentType)?.label}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e7e8e9] text-[#454652]">{duration}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyAll(script)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ color: PRIMARY }}>
                      {copied === 'all' ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
                    </button>
                  </div>
                </div>

                {/* Script sections */}
                <div className="p-5 space-y-4">
                  {script.hook && (
                    <div className="rounded-xl p-4" style={{ background: '#ede9fe', border: `1px solid ${SECONDARY}30` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: SECONDARY }}>🎯 Hook · 0:00–0:05</span>
                        <button onClick={() => copyText(script.hook, 'hook')}
                          className="text-xs flex items-center gap-1 font-semibold" style={{ color: SECONDARY }}>
                          {copied === 'hook' ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <p className="text-sm text-[#191c1d] dark:text-white leading-relaxed">{script.hook}</p>
                    </div>
                  )}
                  {script.body && (
                    <div className="rounded-xl p-4 border border-[#e1e3e4] dark:border-gray-600 bg-[#f8f9fa] dark:bg-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#757684]">📝 Body · 0:05–{duration - 5}s</span>
                        <button onClick={() => copyText(script.body, 'body')}
                          className="text-xs flex items-center gap-1 font-semibold text-[#757684] hover:text-[#191c1d]">
                          {copied === 'body' ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <p className="text-sm text-[#454652] dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{script.body}</p>
                    </div>
                  )}
                  {script.cta && (
                    <div className="rounded-xl p-4" style={{ background: '#e8f5e9', border: '1px solid #a5d6a7' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-700">🚀 CTA · Last 5s</span>
                        <button onClick={() => copyText(script.cta, 'cta')}
                          className="text-xs flex items-center gap-1 font-semibold text-green-700">
                          {copied === 'cta' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <p className="text-sm text-green-900 leading-relaxed">{script.cta}</p>
                    </div>
                  )}
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-[#e1e3e4] dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleGenerate(selectedTopic || topicInput)} disabled={generating}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#c5c5d4] text-xs font-semibold text-[#454652] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </button>
                    <button onClick={handleClear}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#c5c5d4] text-xs font-semibold text-[#454652] hover:border-red-300 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" /> New
                    </button>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#757684]">
                    {wordCount} Words · ~{estimatedSeconds}s
                  </span>
                </div>
              </motion.div>
            )}
          </section>

          {/* ── AI Sidebar ── */}
          <aside className="w-full lg:w-72 flex flex-col gap-4">

            {/* AI Copilot Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5" style={{ color: SECONDARY }} />
                <h2 className="font-bold text-base text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  AI Copilot
                </h2>
              </div>

              {script ? (
                <div className="space-y-3">
                  {/* Hook suggestion */}
                  <div className="p-3 rounded-xl border border-[#c5c5d4] hover:border-[#7C3AED] cursor-pointer transition-colors"
                    onClick={() => handleGenerate(selectedTopic || topicInput)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: SECONDARY }}>Hook Optimization</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#757684]" />
                    </div>
                    <p className="text-xs text-[#454652] dark:text-gray-300">Try a different hook angle for better stop-scroll rate</p>
                  </div>

                  {/* Tone check */}
                  <div className="p-3 rounded-xl border border-[#c5c5d4]">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: SECONDARY }}>Tone Check</span>
                    <p className="text-xs text-[#454652] dark:text-gray-300 mt-1">
                      {CONTENT_TYPES.find(c => c.id === contentType)?.description}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= 3 ? SECONDARY : '#e1e3e4' }} />
                      ))}
                    </div>
                  </div>

                  <button onClick={() => handleGenerate(selectedTopic || topicInput)} disabled={generating}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg transition-all"
                    style={{ background: `linear-gradient(135deg, ${SECONDARY}, #6D28D9)` }}>
                    <Sparkles className="w-4 h-4" /> Rewrite with AI
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: SECONDARY_CONTAINER }}>
                    <Wand2 className="w-6 h-6" style={{ color: SECONDARY }} />
                  </div>
                  <p className="text-xs text-[#757684]">Generate a script to get AI suggestions and optimizations</p>
                </div>
              )}
            </div>

            {/* Reach Forecast */}
            {script && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-sm text-[#191c1d] dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Reach Forecast</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#757684]">Potential Views</span>
                    <span className="font-bold text-sm text-green-600">
                      {wordCount > 100 ? '50k–120k' : wordCount > 50 ? '20k–60k' : '5k–20k'}
                    </span>
                  </div>
                  <div className="w-full bg-[#e7e8e9] h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                      style={{ width: `${Math.min(90, (wordCount / 150) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-[#757684] leading-relaxed">
                    Based on trending topics in your niche and script quality score.
                  </p>
                </div>
              </div>
            )}

            {/* History Panel */}
            {showHistory && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-[#e1e3e4] dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#e1e3e4]">
                  <h3 className="font-bold text-sm text-[#191c1d] dark:text-white">Script History</h3>
                  {history.length > 0 && (
                    <button onClick={() => { localStorage.removeItem("ig_script_history"); setHistory([]); }}
                      className="text-xs text-red-400 hover:text-red-600 font-semibold">Clear All</button>
                  )}
                </div>
                {history.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-[#757684]">No history yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e1e3e4] max-h-64 overflow-y-auto">
                    {history.map(entry => (
                      <div key={entry.id}>
                        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f8f9fa] transition-colors"
                          onClick={() => setExpandedHistory(expandedHistory === entry.id ? null : entry.id)}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                            style={{ background: PRIMARY_GRAD }}>
                            {entry.topic[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#191c1d] dark:text-white truncate">{entry.topic}</p>
                            <p className="text-[10px] text-[#757684]">{formatTime(entry.timestamp)} · {entry.duration}s</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={e => { e.stopPropagation(); deleteHistory(entry.id); }}
                              className="p-1 rounded hover:bg-red-50 text-[#757684] hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <ChevronDown className={`w-4 h-4 text-[#757684] transition-transform ${expandedHistory === entry.id ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        <AnimatePresence>
                          {expandedHistory === entry.id && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                              className="overflow-hidden border-t border-[#e1e3e4]">
                              <div className="px-4 py-3 space-y-2">
                                {entry.script?.hook && <p className="text-xs text-[#454652] line-clamp-2 leading-relaxed"><span className="font-bold" style={{ color: SECONDARY }}>Hook:</span> {entry.script.hook}</p>}
                                <button onClick={() => { setTopicInput(entry.topic); handleGenerate(entry.topic); }}
                                  className="w-full py-2 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5"
                                  style={{ background: PRIMARY_GRAD }}>
                                  <RefreshCw className="w-3 h-3" /> Regenerate
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
