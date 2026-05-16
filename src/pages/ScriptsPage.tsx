import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Clock, RefreshCw, Mic, Search, X, ChevronRight, Trash2, Flame, TrendingUp, Newspaper } from "lucide-react";
import { generateScript } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const IG_GRAD = "linear-gradient(135deg, #14BBA6, #0D9488)";
const IG = "#14BBA6";

const MODES = [
  { id: "full", label: "Full Script", description: "Hook + Body + CTA" },
  { id: "hook", label: "Hook Only", description: "Viral opening line" },
  { id: "body", label: "Body Only", description: "Main script content" },
  { id: "cta", label: "CTA Only", description: "Call to action" },
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
  "Real Estate", "Jobs", "Weight Loss", "Investing", "Startup",
];

const SUB_CATEGORIES: Record<string, { label: string; suggestions: string[]; emoji: string }> = {
  gaming: { emoji: "🎮", label: "Which game are you making content about?", suggestions: ["BGMI", "Free Fire", "GTA 5", "Minecraft", "Valorant", "Call of Duty", "FIFA", "Chess", "Roblox", "PUBG PC", "Fortnite", "Among Us", "Clash of Clans", "Mobile Legends", "Pokemon GO"] },
  fitness: { emoji: "💪", label: "What fitness topic do you want to cover?", suggestions: ["Home Workout", "Weight Loss", "Muscle Building", "Yoga", "HIIT Training", "Cardio", "Diet Plan", "6 Pack Abs", "Stretching", "Running Tips", "Gym Beginner", "Protein Diet", "Transformation", "Calisthenics", "Zumba"] },
  finance: { emoji: "📈", label: "What finance topic do you want to cover?", suggestions: ["Stock Market", "Mutual Funds SIP", "Crypto Bitcoin", "Budget Tips", "Tax Saving", "Credit Card", "Passive Income", "IPO Investing", "Real Estate", "Forex Trading", "Gold Investment", "Personal Finance", "Emergency Fund", "Debt Free", "Side Hustle"] },
  cricket: { emoji: "🏏", label: "What cricket topic do you want to cover?", suggestions: ["IPL 2026", "India vs Pakistan", "Virat Kohli", "Rohit Sharma", "Batting Tips", "Bowling Tips", "Fantasy Cricket", "Test Match", "T20 Analysis", "Women's Cricket", "Young Players", "Fielding Tips", "Cricket Records", "ICC World Cup", "Bumrah Analysis"] },
  food: { emoji: "🍳", label: "What food topic do you want to cover?", suggestions: ["Biryani Recipe", "Quick Breakfast", "Street Food", "Healthy Meals", "Dessert Recipe", "Vegan Food", "Keto Diet", "Indian Snacks", "Budget Meals", "Meal Prep", "Cake Recipe", "Smoothie", "Air Fryer", "Kids Tiffin", "Restaurant Review"] },
  tech: { emoji: "💻", label: "What tech topic do you want to cover?", suggestions: ["ChatGPT Tutorial", "AI Tools", "Budget Smartphone", "Laptop Review", "Coding Tips", "Cybersecurity", "Electric Vehicles", "Smart Home", "Camera Review", "Gaming PC", "iPhone vs Android", "Free AI Tools", "Best Apps 2026", "Tech Career", "Python Tutorial"] },
  travel: { emoji: "✈️", label: "Where are you making travel content about?", suggestions: ["Goa", "Manali", "Kerala", "Rajasthan", "Dubai", "Thailand", "Bali", "Europe Budget", "Northeast India", "Andaman", "Ladakh", "Rishikesh", "Coorg", "Singapore", "Visa Free Countries"] },
  motivation: { emoji: "🔥", label: "What motivation topic do you want to cover?", suggestions: ["Morning Routine", "Discipline", "Study Tips", "Success Mindset", "Overcoming Failure", "Self Improvement", "Stoicism", "Atomic Habits", "Goal Setting", "Confidence", "Time Management", "Hustle Culture", "Mental Health", "Consistency", "Fear of Failure"] },
  business: { emoji: "💼", label: "What business topic do you want to cover?", suggestions: ["Start a Business", "Freelancing", "Dropshipping", "Instagram Marketing", "YouTube Strategy", "Entrepreneurship", "Digital Marketing", "LinkedIn Growth", "Amazon Selling", "Startup Ideas", "Business Mistakes", "First Client", "Personal Branding", "Email Marketing", "Content Creation"] },
  bollywood: { emoji: "🎬", label: "What Bollywood topic do you want to cover?", suggestions: ["Movie Review", "Celebrity News", "Box Office", "Upcoming Movies", "Actor Ranking", "Best Movies 2026", "Web Series Review", "OTT Platform", "Award Show", "Music Album", "Director Analysis", "Film Comparison", "Villain Characters", "Romantic Movies", "Action Movies"] },
  skincare: { emoji: "✨", label: "What skincare topic do you want to cover?", suggestions: ["Acne Treatment", "Glass Skin", "Anti Aging", "Sunscreen Guide", "Night Routine", "Morning Routine", "Budget Skincare", "Korean Beauty", "Dark Spots", "Oily Skin", "Dry Skin Tips", "Serum Guide", "Moisturizer", "Face Wash", "Natural Remedies"] },
  yoga: { emoji: "🧘", label: "What yoga topic do you want to cover?", suggestions: ["Beginner Yoga", "Weight Loss Yoga", "Morning Yoga", "Pranayama", "Flexibility", "Stress Relief", "Meditation", "Surya Namaskar", "Yoga for Back Pain", "Advanced Poses", "Breathwork", "Evening Yoga", "Kids Yoga", "Pregnancy Yoga", "Office Yoga"] },
  crypto: { emoji: "🪙", label: "What crypto topic do you want to cover?", suggestions: ["Bitcoin", "Ethereum", "Web3", "DeFi", "NFT", "Crypto for Beginners", "Altcoins", "Crypto India", "Blockchain", "Crypto Tax India", "Staking", "Crypto Wallet", "Trading Tips", "Bull Market", "Bear Market"] },
  education: { emoji: "📚", label: "What education topic do you want to cover?", suggestions: ["UPSC Tips", "JEE Preparation", "NEET Study", "CAT MBA", "Study Motivation", "Memory Techniques", "English Speaking", "Current Affairs", "Scholarship Tips", "Board Exams", "College Life", "Career Guidance", "Online Courses", "Speed Reading", "Note Taking"] },
  comedy: { emoji: "😂", label: "What comedy style do you want?", suggestions: ["Indian Parents", "Office Comedy", "Relationship Jokes", "Student Life", "POV Skit", "Festival Comedy", "Social Media Jokes", "Delhi vs Mumbai", "North vs South", "Cricket Comedy", "Exam Jokes", "Traffic Comedy", "Marriage Comedy", "Friends Comedy", "Gen Z vs Millennial"] },
};

function detectNiche(input: string): string | null {
  const q = input.toLowerCase().trim();
  const keywords: Record<string, string[]> = {
    gaming: ["gaming", "game", "bgmi", "free fire", "pubg", "gta", "minecraft", "valorant", "cod", "fifa", "esports", "gameplay"],
    fitness: ["fitness", "gym", "workout", "weight loss", "muscle", "yoga", "exercise", "training", "bodybuilding", "abs", "cardio"],
    finance: ["finance", "money", "stock", "invest", "mutual fund", "sip", "trading", "budget", "saving", "wealth"],
    cricket: ["cricket", "ipl", "kohli", "rohit", "batting", "bowling", "t20", "test match", "bcci"],
    food: ["food", "recipe", "cooking", "biryani", "meal", "diet", "eat", "restaurant", "snack", "dessert"],
    tech: ["tech", "technology", "ai", "coding", "smartphone", "laptop", "software", "programming", "chatgpt", "gadget"],
    travel: ["travel", "trip", "goa", "manali", "kerala", "dubai", "bali", "destination", "hotel", "visa"],
    motivation: ["motivation", "mindset", "discipline", "success", "habit", "routine", "stoic", "confidence", "goal"],
    business: ["business", "startup", "entrepreneur", "freelance", "marketing", "branding", "ecommerce", "revenue"],
    bollywood: ["bollywood", "movie", "film", "actor", "actress", "netflix", "ott", "celebrity", "web series"],
    skincare: ["skincare", "skin", "acne", "glow", "beauty", "moisturizer", "serum", "sunscreen", "face"],
    yoga: ["yoga", "meditation", "pranayama", "asana", "breathwork", "mindfulness", "wellness"],
    crypto: ["crypto", "bitcoin", "ethereum", "blockchain", "nft", "web3", "defi", "token", "coin"],
    education: ["education", "study", "exam", "upsc", "jee", "neet", "college", "school", "learn"],
    comedy: ["comedy", "funny", "meme", "pov", "skit", "joke", "parody", "humour", "roast"],
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
  const updated = [newEntry, ...existing].slice(0, 20);
  localStorage.setItem("ig_script_history", JSON.stringify(updated));
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

// ── Real Calendar Component ──
function SeriesCalendar({ startDate, parts, frequency, accentColor, accentGrad }: {
  startDate: string; parts: number; frequency: string; accentColor: string; accentGrad: string;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(startDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const scheduledDates = useMemo(() => {
    const dates: Record<string, number> = {};
    const d = new Date(startDate);
    for (let i = 0; i < parts; i++) {
      const key = d.toISOString().split('T')[0];
      dates[key] = i + 1;
      if (frequency === 'daily') d.setDate(d.getDate() + 1);
      else if (frequency === 'alternate') d.setDate(d.getDate() + 2);
      else d.setDate(d.getDate() + 7);
    }
    return dates;
  }, [startDate, parts, frequency]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setViewMonth(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const nextMonth = () => setViewMonth(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  const { year, month } = viewMonth;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const today = new Date().toISOString().split('T')[0];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📅 Posting Calendar</p>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm">‹</button>
          <p className="text-sm font-semibold text-foreground">{monthNames[month]} {year}</p>
          <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm">›</button>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 px-3 pt-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground py-1 font-medium">{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-3 pb-3 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const partNum = scheduledDates[dateStr];
            const isToday = dateStr === today;
            const isScheduled = !!partNum;
            return (
              <div key={dateStr} className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center relative cursor-default transition-all"
                  style={{
                    background: isScheduled ? accentGrad : isToday ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: isToday && !isScheduled ? '1px solid rgba(255,255,255,0.15)' : 'none',
                  }}>
                  <span className="text-xs font-medium leading-none" style={{ color: isScheduled ? '#fff' : isToday ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
                    {day}
                  </span>
                  {isScheduled && (
                    <span className="text-xs leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 8 }}>P{partNum}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md" style={{ background: accentGrad }} />
            <span className="text-xs text-muted-foreground">Post day (P = Part #)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md border" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
        </div>
      </div>
      {/* Count summary */}
      <p className="text-xs text-muted-foreground text-center">
        {parts} posts scheduled · {Object.keys(scheduledDates).filter(d => {
          const [y, m] = d.split('-').map(Number);
          return y === year && m - 1 === month;
        }).length} in {monthNames[month]}
      </p>
    </div>
  );
}

export default function ScriptsPage() {
  const { user } = useAuth();
  const userNiche = user?.user_metadata?.niche || '';
  const userVoiceStyle = user?.user_metadata?.voice_style || '';

  const [activeView, setActiveView] = useState<"generate" | "history" | "calendar">("generate");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [script, setScript] = useState<any | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [mode, setMode] = useState('full');
  const [duration, setDuration] = useState(60);
  const [history, setHistory] = useState<HistoryEntry[]>(() => JSON.parse(localStorage.getItem("ig_script_history") || "[]"));
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const [detectedNiche, setDetectedNiche] = useState<string | null>(null);
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [showSeriesPrompt, setShowSeriesPrompt] = useState(false);
  const [seriesTopic, setSeriesTopic] = useState('');
  const [seriesParts, setSeriesParts] = useState(5);
  const [seriesFrequency, setSeriesFrequency] = useState<'daily' | 'alternate' | 'weekly'>('weekly');
  const [seriesStartDate, setSeriesStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [seriesStep, setSeriesStep] = useState<'prompt' | 'customize'>('prompt');
  const [generatingSeries, setGeneratingSeries] = useState(false);
  const [seriesScripts, setSeriesScripts] = useState<any[]>([]);
  const [showSeriesResult, setShowSeriesResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleGenerate = async (topic: string) => {
    if (!topic.trim()) return;
    const userLanguage = localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english';
    setGenerating(true); setError(''); setSelectedTopic(topic);
    setTopicInput(topic); setShowDropdown(false); setShowSubCategories(false);
    try {
      const result = await generateScript({ topic, niche: userNiche, language: userLanguage, voiceStyle: userVoiceStyle, duration });
      let finalScript = result;
      if (mode === 'hook') finalScript = { hook: result.hook };
      else if (mode === 'body') finalScript = { body: result.body };
      else if (mode === 'cta') finalScript = { cta: result.cta };
      setScript(finalScript);
      saveHistory({ topic, script: finalScript, mode, duration, language: userLanguage });
      const updatedHistory = JSON.parse(localStorage.getItem("ig_script_history") || "[]");
      setHistory(updatedHistory);
      // ✅ Check if same topic searched 3+ times → suggest series
      const topicCount = updatedHistory.filter((h: HistoryEntry) =>
        h.topic.toLowerCase() === topic.toLowerCase()
      ).length;
      if (topicCount >= 3 && !showSeriesResult) {
        setSeriesTopic(topic);
        setShowSeriesPrompt(true);
      }
    } catch { setError('Failed to generate. Please try again.'); }
    finally { setGenerating(false); }
  };

  const handleClear = () => { setTopicInput(''); setScript(null); setSelectedTopic(null); setDetectedNiche(null); setShowSubCategories(false); };

  const copyText = (text: string, section: string) => { navigator.clipboard.writeText(text); setCopied(section); setTimeout(() => setCopied(null), 2000); };

  const copyAll = (s: any) => {
    const parts = [];
    if (s.hook) parts.push(`HOOK:\n${s.hook}`);
    if (s.body) parts.push(`BODY:\n${s.body}`);
    if (s.cta) parts.push(`CTA:\n${s.cta}`);
    navigator.clipboard.writeText(parts.join('\n\n'));
    setCopied('all'); setTimeout(() => setCopied(null), 2000);
  };

  const getScheduleDates = (start: string, parts: number, freq: string) => {
    const dates: string[] = [];
    const d = new Date(start);
    for (let i = 0; i < parts; i++) {
      dates.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
      if (freq === 'daily') d.setDate(d.getDate() + 1);
      else if (freq === 'alternate') d.setDate(d.getDate() + 2);
      else d.setDate(d.getDate() + 7);
    }
    return dates;
  };

  const generateSeries = async () => {
    setGeneratingSeries(true);
    setShowSeriesPrompt(false);
    setSeriesStep('prompt');
    setShowSeriesResult(true);
    setSeriesScripts([]);
    const userLanguage = localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english';
    const scheduleDates = getScheduleDates(seriesStartDate, seriesParts, seriesFrequency);
    const angleTemplates = [
      `${seriesTopic} for complete beginners`,
      `Top mistakes in ${seriesTopic}`,
      `Advanced ${seriesTopic} tips`,
      `${seriesTopic} secrets nobody tells you`,
      `${seriesTopic} results after 30 days`,
      `${seriesTopic} tools and resources`,
      `${seriesTopic} case study`,
      `${seriesTopic} myths busted`,
      `${seriesTopic} for professionals`,
      `${seriesTopic} future trends`,
    ];
    const angles = Array.from({ length: seriesParts }, (_, i) =>
      `${angleTemplates[i % angleTemplates.length]} — Part ${i + 1}`
    );
    const results: any[] = [];
    for (let i = 0; i < angles.length; i++) {
      try {
        const result = await generateScript({ topic: angles[i], niche: userNiche, language: userLanguage, voiceStyle: userVoiceStyle, duration: 60 });
        results.push({ angle: angles[i], script: result, postDate: scheduleDates[i], part: i + 1 });
        setSeriesScripts([...results]);
      } catch { results.push({ angle: angles[i], script: null, postDate: scheduleDates[i], part: i + 1 }); }
    }
    setGeneratingSeries(false);
  };

  const deleteHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem("ig_script_history", JSON.stringify(updated));
    setHistory(updated);
  };

  const clearAllHistory = () => { localStorage.removeItem("ig_script_history"); setHistory([]); };

  const subCat = detectedNiche ? SUB_CATEGORIES[detectedNiche] : null;

  // ── Get Ideas ──
  const [showIdeas, setShowIdeas] = useState(false);
  const [ideas, setIdeas] = useState<{ news: any[]; reelIdeas: string[] }>({ news: [], reelIdeas: [] });
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const ideasRef = useRef<HTMLDivElement>(null);

  const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fetchIdeas = async () => {
    setLoadingIdeas(true);
    const userNiches: string[] = user?.user_metadata?.niches || (userNiche ? [userNiche] : []);
    const topicForIdeas = topicInput.trim() || userNiches[0] || 'Finance';
    try {
      const res = await fetch(`${BASE}/api/news?filter=today&topicId=${encodeURIComponent(topicForIdeas)}`);
      const data = await res.json();
      const newsList = Array.isArray(data) ? data.slice(0, 5) : [];
      const reelIdeas = [
        `🔥 React to: "${newsList[0]?.title?.slice(0, 50) || topicForIdeas + ' latest news'}"`,
        `📊 Explain "${topicForIdeas}" in 60 seconds`,
        `💡 Top 5 things about ${topicForIdeas} nobody knows`,
        `⚡ ${topicForIdeas} mistake that costs people money/time`,
        `🎯 My honest opinion on ${topicForIdeas} trend`,
        `📈 Why ${topicForIdeas} is changing in 2026`,
        `🚀 ${topicForIdeas} tips that actually work`,
        `❌ Stop doing this in ${topicForIdeas}`,
      ];
      setIdeas({ news: newsList, reelIdeas });
    } catch {
      setIdeas({ news: [], reelIdeas: [
        `🔥 Top 5 ${topicForIdeas} tips`,
        `📊 ${topicForIdeas} explained in 60 seconds`,
        `💡 ${topicForIdeas} secrets nobody tells you`,
        `⚡ Biggest ${topicForIdeas} mistakes to avoid`,
        `🎯 My ${topicForIdeas} journey`,
      ]});
    } finally { setLoadingIdeas(false); }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ideasRef.current && !ideasRef.current.contains(e.target as Node)) setShowIdeas(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const ScriptCard = ({ s, topic: t }: { s: any; topic: string }) => (
    <div className="space-y-3">
      {s.hook && (
        <div className="rounded-2xl p-4" style={{ border: `1px solid ${IG}30`, background: `${IG}08` }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: IG }}>🎯 Hook</p>
            <button onClick={() => copyText(s.hook, `hook-${t}`)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              {copied === `hook-${t}` ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <p className="text-foreground text-sm leading-relaxed">{s.hook}</p>
        </div>
      )}
      {s.body && (
        <div className="rounded-2xl border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">📝 Body</p>
            <button onClick={() => copyText(s.body, `body-${t}`)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              {copied === `body-${t}` ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">{s.body}</p>
        </div>
      )}
      {s.cta && (
        <div className="rounded-2xl p-4" style={{ border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-green-400">🚀 CTA</p>
            <button onClick={() => copyText(s.cta, `cta-${t}`)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              {copied === `cta-${t}` ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <p className="text-foreground text-sm leading-relaxed">{s.cta}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: IG }} />
          <h1 className="text-lg font-bold text-foreground">Script Generator</h1>
          {userVoiceStyle && <span className="ml-1 flex items-center gap-1 text-xs text-green-400"><Mic className="w-3 h-3" /> Voice</span>}
          {/* History toggle */}
          <button onClick={() => setActiveView(activeView === "history" ? "generate" : "history")}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={activeView === "history"
              ? { background: IG_GRAD, color: "#fff" }
              : { background: `${IG}15`, color: IG, border: `1px solid ${IG}30` }}>
            <Clock className="w-3.5 h-3.5" />
            History {history.length > 0 && <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.25)" }}>{history.length}</span>}
          </button>
          <button onClick={() => setActiveView(activeView === "calendar" ? "generate" : "calendar")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={activeView === "calendar"
              ? { background: IG_GRAD, color: "#fff" }
              : { background: `${IG}15`, color: IG, border: `1px solid ${IG}30` }}>
            📅
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">

        {/* ── HISTORY VIEW ── */}
        {activeView === "history" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Instagram Script History</p>
              {history.length > 0 && (
                <button onClick={clearAllHistory} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Clock className="w-10 h-10 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">No script history yet</p>
                <button onClick={() => setActiveView("generate")}
                  className="text-xs px-4 py-2 rounded-xl" style={{ background: IG_GRAD, color: "#fff" }}>
                  Generate your first script
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                    {/* Entry header */}
                    <div className="flex items-center gap-3 p-4 cursor-pointer"
                      onClick={() => setExpandedHistory(expandedHistory === entry.id ? null : entry.id)}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
                        style={{ background: `${IG}15`, color: IG }}>
                        {entry.topic[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{entry.topic}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</span>
                          <span className="text-xs text-muted-foreground">· {entry.mode} · {entry.duration}s · {entry.language}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); copyAll(entry.script); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                          {copied === 'all' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteHistory(entry.id); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedHistory === entry.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded script */}
                    <AnimatePresence>
                      {expandedHistory === entry.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border overflow-hidden">
                          <div className="p-4 space-y-3">
                            <ScriptCard s={entry.script} topic={entry.id} />
                            <button onClick={() => { setActiveView("generate"); setTopicInput(entry.topic); handleGenerate(entry.topic); }}
                              className="w-full py-2.5 rounded-xl text-white text-xs font-medium flex items-center justify-center gap-1.5"
                              style={{ background: IG_GRAD }}>
                              <RefreshCw className="w-3.5 h-3.5" /> Regenerate This Script
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

        {/* ── CALENDAR VIEW ── */}
        {activeView === "calendar" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">📅 Posting Calendar</p>
              {seriesScripts.length > 0 && (
                <span className="text-xs text-muted-foreground">{seriesParts} parts · {seriesFrequency}</span>
              )}
            </div>
            {seriesScripts.length > 0 || showSeriesResult ? (
              <SeriesCalendar
                startDate={seriesStartDate}
                parts={seriesParts}
                frequency={seriesFrequency}
                accentColor={IG}
                accentGrad={IG_GRAD}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <span className="text-5xl">📅</span>
                <p className="text-sm font-semibold text-foreground">No Series Scheduled Yet</p>
                <p className="text-xs text-muted-foreground max-w-xs">Generate a script series to see your posting calendar here. Search any topic 3+ times to unlock the series feature.</p>
                <button onClick={() => setActiveView("generate")}
                  className="text-xs px-4 py-2 rounded-xl text-white mt-2"
                  style={{ background: IG_GRAD }}>
                  Go Generate Scripts
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── GENERATE VIEW ── */}
        {activeView === "generate" && (
          <>
            {/* Mode selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MODES.map((m) => (
                <button key={m.id} onClick={() => { setMode(m.id); setScript(null); }}
                  className="p-3 rounded-2xl border text-left transition-all"
                  style={mode === m.id ? { background: IG_GRAD, borderColor: "transparent", color: "#fff" } : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                  <p className="text-xs font-semibold">{m.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{m.description}</p>
                </button>
              ))}
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Script Duration</p>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button key={d.value} onClick={() => setDuration(d.value)}
                    className="flex-1 py-2.5 rounded-2xl border text-sm font-medium transition-all"
                    style={duration === d.value ? { background: IG_GRAD, borderColor: "transparent", color: "#fff" } : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    <p className="font-semibold">{d.label}</p>
                    <p className="text-xs opacity-70">{d.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input ref={inputRef} type="text" value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(topicInput); if (e.key === "Escape") setShowDropdown(false); }}
                    onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                    placeholder="Enter any topic (e.g. Gaming, Finance, Cricket)..."
                    className="w-full px-4 pr-9 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                    onFocus={e => { e.target.style.borderColor = `${IG}50`; }}
                    onBlur={e => { e.target.style.borderColor = ''; }} />
                  {topicInput && (
                    <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* ── Get Ideas Button ── */}
                <div className="relative" ref={ideasRef}>
                  <button
                    onClick={() => { if (!showIdeas) { fetchIdeas(); } setShowIdeas(prev => !prev); }}
                    className="px-3 py-3 rounded-2xl border flex items-center gap-1.5 text-sm font-medium transition-all whitespace-nowrap"
                    style={showIdeas ? { background: IG_GRAD, color: '#fff', borderColor: 'transparent' } : { borderColor: `${IG}40`, color: IG, background: `${IG}08` }}>
                    <Flame className="w-4 h-4" />
                    <span className="hidden sm:inline">Ideas</span>
                  </button>

                  {/* Ideas dropdown */}
                  <AnimatePresence>
                    {showIdeas && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        className="absolute top-full right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                        style={{ width: 320 }}>

                        {loadingIdeas ? (
                          <div className="flex items-center justify-center py-8 gap-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                              <Sparkles className="w-4 h-4" style={{ color: IG }} />
                            </motion.div>
                            <span className="text-xs text-muted-foreground">Fetching hot ideas...</span>
                          </div>
                        ) : (
                          <div className="max-h-96 overflow-y-auto">
                            {/* Hot News */}
                            {ideas.news.length > 0 && (
                              <div className="p-3 border-b border-border">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Newspaper className="w-3.5 h-3.5" style={{ color: IG }} />
                                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: IG }}>Hot News to React To</p>
                                </div>
                                <div className="space-y-1.5">
                                  {ideas.news.map((n, i) => (
                                    <button key={i}
                                      onClick={() => { const title = n.title || n.headline || ''; setTopicInput(title.slice(0, 60)); setShowIdeas(false); }}
                                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-foreground hover:bg-accent transition-colors leading-snug flex items-start gap-2">
                                      <TrendingUp className="w-3 h-3 shrink-0 mt-0.5" style={{ color: IG }} />
                                      <span className="line-clamp-2">{n.title || n.headline}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Reel Ideas */}
                            <div className="p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Flame className="w-3.5 h-3.5 text-orange-400" />
                                <p className="text-xs font-bold uppercase tracking-wider text-orange-400">Reel Ideas</p>
                              </div>
                              <div className="space-y-1.5">
                                {ideas.reelIdeas.map((idea, i) => (
                                  <button key={i}
                                    onClick={() => { setTopicInput(idea.replace(/^[🔥📊💡⚡🎯📈🚀❌]\s/, '')); setShowIdeas(false); }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-foreground hover:bg-accent transition-colors leading-snug">
                                    {idea}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="px-3 pb-3">
                              <button
                                onClick={() => { fetchIdeas(); }}
                                className="w-full py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5">
                                <RefreshCw className="w-3 h-3" /> Refresh Ideas
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={() => handleGenerate(topicInput)} disabled={generating}
                  className="px-5 py-3 rounded-2xl text-white flex items-center gap-2 disabled:opacity-60"
                  style={{ background: IG_GRAD }}>
                  <Sparkles className="w-4 h-4" />
                  {generating ? '...' : 'Generate'}
                </button>
              </div>
              {showDropdown && dropdownSuggestions.length > 0 && (
                <div ref={dropdownRef} className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" style={{ width: 'calc(100% - 90px)' }}>
                  {dropdownSuggestions.map((s, i) => (
                    <button key={i} onClick={() => handleGenerate(s)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left">
                      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-categories */}
            <AnimatePresence>
              {showSubCategories && subCat && !script && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border p-4 space-y-3"
                  style={{ borderColor: `${IG}30`, background: `${IG}08` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{subCat.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{subCat.label}</p>
                      <p className="text-xs text-muted-foreground">Pick one or type your own above</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subCat.suggestions.map((s, i) => (
                      <motion.button key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                        onClick={() => handleGenerate(s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                        style={{ borderColor: `${IG}30`, color: IG, background: `${IG}08` }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${IG}20`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${IG}08`; }}>
                        <ChevronRight className="w-3 h-3" />{s}
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Or press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: `${IG}15`, color: IG }}>Enter</kbd> to generate a general {detectedNiche} script</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Popular chips */}
            {!topicInput && !script && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Popular topics:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.slice(0, 12).map((s) => (
                    <button key={s} onClick={() => setTopicInput(s)}
                      className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground transition-colors"
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${IG}50`; (e.currentTarget as HTMLElement).style.color = IG; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.color = ''; }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* ── SERIES PROMPT ── */}
            <AnimatePresence>
              {showSeriesPrompt && (
                <motion.div initial={{ opacity:0, scale:0.95, y:10 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
                  className="rounded-2xl p-5 space-y-4"
                  style={{ background:`${IG}08`, border:`2px solid ${IG}40` }}>

                  {seriesStep === 'prompt' && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">🎬</div>
                        <div>
                          <p className="font-bold text-foreground text-sm">Want a Reel Series?</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You've searched <span style={{ color: IG }}>"{seriesTopic}"</span> multiple times. Want to create a full content series?
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSeriesStep('customize')}
                          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                          style={{ background: IG_GRAD }}>
                          <Sparkles className="w-4 h-4" /> Yes, Create Series!
                        </button>
                        <button onClick={() => setShowSeriesPrompt(false)}
                          className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
                          Not now
                        </button>
                      </div>
                    </>
                  )}

                  {seriesStep === 'customize' && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">📅</div>
                        <p className="font-bold text-foreground text-sm">Customize Your Series</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How many parts?</p>
                        <div className="flex gap-2">
                          {[3, 5, 7, 10].map(n => (
                            <button key={n} onClick={() => setSeriesParts(n)}
                              className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-all"
                              style={seriesParts === n
                                ? { background: IG_GRAD, color: '#fff', borderColor: 'transparent' }
                                : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                              {n}
                            </button>
                          ))}
                          <input type="number" min={2} max={20} value={seriesParts}
                            onChange={e => setSeriesParts(Math.min(20, Math.max(2, parseInt(e.target.value) || 2)))}
                            className="w-16 text-center py-2 rounded-xl border border-border bg-card text-foreground text-sm outline-none"
                            onFocus={e => e.target.style.borderColor = `${IG}50`}
                            onBlur={e => e.target.style.borderColor = ''} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Posting Frequency</p>
                        <div className="flex gap-2">
                          {([
                            { id: 'daily', label: 'Every Day' },
                            { id: 'alternate', label: 'Every 2 Days' },
                            { id: 'weekly', label: 'Every Week' },
                          ] as const).map(f => (
                            <button key={f.id} onClick={() => setSeriesFrequency(f.id)}
                              className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all"
                              style={seriesFrequency === f.id
                                ? { background: IG_GRAD, color: '#fff', borderColor: 'transparent' }
                                : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</p>
                        <input type="date" value={seriesStartDate}
                          onChange={e => setSeriesStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm outline-none transition-all"
                          onFocus={e => e.target.style.borderColor = `${IG}50`}
                          onBlur={e => e.target.style.borderColor = ''} />
                      </div>

                      {/* ── REAL CALENDAR ── */}
                      <SeriesCalendar
                        startDate={seriesStartDate}
                        parts={seriesParts}
                        frequency={seriesFrequency}
                        accentColor={IG}
                        accentGrad={IG_GRAD}
                      />

                      <div className="flex gap-2">
                        <button onClick={generateSeries}
                          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                          style={{ background: IG_GRAD }}>
                          <Sparkles className="w-4 h-4" /> Generate {seriesParts}-Part Series
                        </button>
                        <button onClick={() => setSeriesStep('prompt')}
                          className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
                          Back
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── SERIES RESULT ── */}
            {showSeriesResult && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-sm">🎬 {seriesParts}-Part Series: <span style={{ color: IG }}>{seriesTopic}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{seriesScripts.length}/{seriesParts} scripts generated</p>
                  </div>
                  <button onClick={() => { setShowSeriesResult(false); setSeriesScripts([]); }}
                    className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                </div>

                {generatingSeries && seriesScripts.length < seriesParts && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}>
                      <Sparkles className="w-4 h-4" style={{ color: IG }} />
                    </motion.div>
                    Generating Part {seriesScripts.length + 1} of {seriesParts}...
                  </div>
                )}

                {seriesScripts.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-3 p-4 cursor-pointer"
                      onClick={() => setExpandedHistory(expandedHistory === `series-${idx}` ? null : `series-${idx}`)}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: IG_GRAD }}>{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.angle}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.script?.hook && <p className="text-xs text-muted-foreground truncate">{item.script.hook.slice(0, 50)}...</p>}
                          {item.postDate && <span className="text-xs shrink-0" style={{ color: IG }}>📅 {item.postDate}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.script && (
                          <button onClick={e => { e.stopPropagation(); copyAll(item.script); }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
                            {copied === 'all' ? <Check className="w-3.5 h-3.5 text-green-400"/> : <Copy className="w-3.5 h-3.5"/>}
                          </button>
                        )}
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedHistory === `series-${idx}` ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedHistory === `series-${idx}` && item.script && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                          className="border-t border-border overflow-hidden">
                          <div className="p-4">
                            <ScriptCard s={item.script} topic={`series-${idx}`} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {!generatingSeries && seriesScripts.length === seriesParts && (
                  <button onClick={() => {
                    const all = seriesScripts.map((s, i) =>
                      `PART ${i+1} — Post: ${s.postDate}\n${s.angle}\n\nHOOK: ${s.script?.hook}\n\nBODY: ${s.script?.body}\n\nCTA: ${s.script?.cta}`
                    ).join('\n\n─────────────\n\n');
                    navigator.clipboard.writeText(all); setCopied('series'); setTimeout(() => setCopied(null), 2000);
                  }} className="w-full py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ background: IG_GRAD }}>
                    {copied === 'series' ? <><Check className="w-4 h-4"/> All Copied!</> : <><Copy className="w-4 h-4"/> Copy All {seriesParts} Scripts with Schedule</>}
                  </button>
                )}
              </motion.div>
            )}

            {generating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-6 h-6" style={{ color: IG }} />
                </motion.div>
                <p className="text-sm text-muted-foreground">Writing viral script for <span style={{ color: IG }}>"{selectedTopic}"</span>...</p>
              </motion.div>
            )}

            {script && !generating && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-foreground text-sm">{MODES.find(m => m.id === mode)?.label} for <span style={{ color: IG }}>"{selectedTopic}"</span></h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Language: {localStorage.getItem('userLanguage') || 'english'}</p>
                  </div>
                  <button onClick={() => copyAll(script)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    {copied === 'all' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied === 'all' ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
                <div className="space-y-3">
                  {script.hook && (
                    <div className="rounded-2xl p-4" style={{ border: `1px solid ${IG}30`, background: `${IG}08` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: IG }}>🎯 Hook</p>
                        <button onClick={() => copyText(script.hook, 'hook')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          {copied === 'hook' ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">{script.hook}</p>
                    </div>
                  )}
                  {script.body && (
                    <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">📝 Body</p>
                        <button onClick={() => copyText(script.body, 'body')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          {copied === 'body' ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">{script.body}</p>
                    </div>
                  )}
                  {script.cta && (
                    <div className="rounded-2xl p-4" style={{ border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-green-400">🚀 CTA</p>
                        <button onClick={() => copyText(script.cta, 'cta')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          {copied === 'cta' ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">{script.cta}</p>
                    </div>
                  )}
                </div>
                {script.duration_seconds && mode === 'full' && (
                  <div className="flex items-center gap-1 text-muted-foreground text-xs"><Clock className="w-3.5 h-3.5" /> ~{script.duration_seconds} seconds</div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => handleGenerate(selectedTopic || topicInput)} disabled={generating}
                    className="flex-1 py-2.5 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                  <button onClick={handleClear} className="px-4 py-2.5 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-2">
                    <X className="w-4 h-4" /> New
                  </button>
                </div>
                <button onClick={() => window.location.href = `/thumbnail?topic=${encodeURIComponent(selectedTopic || topicInput)}`}
                  className="w-full py-2.5 rounded-2xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors hover:opacity-80"
                  style={{ borderColor: `${IG}40`, color: IG, background: `${IG}08` }}>
                  🖼️ Generate Thumbnail for this Script
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}