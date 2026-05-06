import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Loader2, Search, X, ChevronRight, Clock, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const YT_GRAD = "linear-gradient(135deg, #FF6B6B, #FFB86C)";
const YT_COLOR = "#FF6B6B";

const SCRIPT_SUGGESTIONS = [
  "5 Ways to Save Money India", "How to start investing India",
  "AI tools for content creators", "Weight loss tips for beginners",
  "How to learn coding in 2026", "Budget travel India tips",
  "Mental health tips for students", "IPL 2026 analysis",
  "How to grow Instagram in India", "Best business ideas India",
  "Python tutorial for beginners", "Stock market basics",
  "Skincare routine for men India", "How to speak English fluently",
  "Home workout for beginners", "Crypto investing India guide",
];

const SUB_CATEGORIES: Record<string, { label: string; suggestions: string[]; emoji: string }> = {
  gaming: { emoji: "🎮", label: "Which game are you making a video about?", suggestions: ["BGMI Tips & Tricks", "Free Fire Highlights", "GTA 5 Gameplay", "Minecraft Survival", "Valorant Guide", "Call of Duty Mobile", "FIFA 26 Review", "Chess Strategy", "Roblox Tutorial", "PUBG PC Tips", "Fortnite Guide", "Among Us Gameplay", "Clash of Clans", "Mobile Legends", "Pokemon GO Guide"] },
  fitness: { emoji: "💪", label: "What fitness topic do you want to cover?", suggestions: ["Home Workout Routine", "Weight Loss in 30 Days", "Muscle Building Guide", "Yoga for Beginners", "HIIT Workout", "Cardio Tips", "Indian Diet Plan", "6 Pack Abs Workout", "Stretching Routine", "Running for Beginners", "Gym Starter Guide", "Protein Foods India", "Body Transformation", "Calisthenics at Home", "Zumba Dance Workout"] },
  finance: { emoji: "📈", label: "What finance topic do you want to cover?", suggestions: ["Stock Market Basics", "Mutual Funds for Beginners", "Crypto Guide India", "Budget Tips for Salary", "Tax Saving Guide", "Credit Card Hacks", "Passive Income Ideas", "IPO Investing Guide", "Real Estate Investment", "Forex Trading Basics", "Gold vs Stocks", "Personal Finance Rules", "Emergency Fund Setup", "Debt Free Journey", "Side Hustle Ideas India"] },
  cricket: { emoji: "🏏", label: "What cricket topic do you want to cover?", suggestions: ["IPL 2026 Preview", "India vs Pakistan Analysis", "Virat Kohli Tribute", "Rohit Sharma Records", "Batting Technique Tips", "Bowling Variations", "Fantasy Cricket Strategy", "Test Cricket Explained", "T20 World Cup Analysis", "Women's Cricket Rise", "Young Cricketers to Watch", "Fielding Drills", "Cricket Fitness", "ICC Rankings Explained", "IPL Auction Strategy"] },
  food: { emoji: "🍳", label: "What food topic do you want to cover?", suggestions: ["Biryani Recipe", "Quick Breakfast Ideas", "Street Food at Home", "Healthy Meal Prep", "Chocolate Dessert", "Vegan Indian Food", "Keto Diet India", "Indian Festival Sweets", "Budget Meal Ideas", "Weekly Meal Prep", "Egg Recipes", "Smoothie Bowl", "Air Fryer Recipes", "Kids Tiffin Ideas", "Restaurant Style Cooking"] },
  tech: { emoji: "💻", label: "What tech topic do you want to cover?", suggestions: ["ChatGPT Complete Guide", "Best AI Tools 2026", "Budget Smartphone Review", "Laptop Buying Guide", "Python for Beginners", "Cybersecurity Tips", "Electric Vehicle Guide", "Smart Home Setup", "Camera Comparison", "Gaming PC Build", "iPhone vs Android", "Free AI Tools", "Best Apps 2026", "Tech Career Roadmap", "Web Development Basics"] },
  travel: { emoji: "✈️", label: "Where are you making travel content about?", suggestions: ["Goa Complete Guide", "Manali Trip Plan", "Kerala Backwaters", "Rajasthan Royal Tour", "Dubai on Budget", "Thailand Travel Guide", "Bali Hidden Gems", "Europe Budget Trip", "Northeast India Hidden Places", "Andaman Islands", "Leh Ladakh Road Trip", "Rishikesh Adventure", "Coorg Weekend Trip", "Singapore Travel", "Visa Free Countries for Indians"] },
  motivation: { emoji: "🔥", label: "What motivation topic do you want to cover?", suggestions: ["Morning Routine That Changed My Life", "Why You're Not Successful", "Discipline Over Motivation", "Study Tips for Students", "Overcoming Failure", "Self Improvement Habits", "Stoicism for Beginners", "Atomic Habits Summary", "Goal Setting System", "Building Confidence", "Time Management Tips", "Hustle Culture Reality", "Mental Health Tips", "Consistency Secrets", "Fear of Failure"] },
  business: { emoji: "💼", label: "What business topic do you want to cover?", suggestions: ["Start Business with Zero Money", "Freelancing for Beginners", "Dropshipping India 2026", "Instagram Growth Strategy", "YouTube Monetization Guide", "Startup Ideas India", "Digital Marketing Basics", "LinkedIn Profile Tips", "Amazon Selling Guide", "10 Business Ideas India", "Common Business Mistakes", "How to Get First Client", "Personal Branding Tips", "Email Marketing Guide", "Content Creation Business"] },
  bollywood: { emoji: "🎬", label: "What Bollywood topic do you want to cover?", suggestions: ["Movie Review", "Box Office Analysis", "Upcoming Movies 2026", "Best Actor Rankings", "Top Movies of 2026", "Web Series Review", "OTT Platform Guide", "Award Show Analysis", "Music Album Review", "Director Deep Dive", "Movie Comparison", "Best Villains Bollywood", "Romantic Movies List", "Action Movies India", "Flop vs Hit Analysis"] },
  skincare: { emoji: "✨", label: "What skincare topic do you want to cover?", suggestions: ["Acne Treatment Guide", "Glass Skin Routine", "Anti Aging Tips", "Sunscreen Complete Guide", "Night Skincare Routine", "Morning Skincare Routine", "Budget Skincare India", "Korean Skincare Routine", "Dark Spots Treatment", "Oily Skin Tips", "Dry Skin Remedies", "Vitamin C Serum Guide", "Best Moisturizer India", "Face Wash Guide", "Natural Skincare Remedies"] },
  education: { emoji: "📚", label: "What education topic do you want to cover?", suggestions: ["UPSC Preparation Guide", "JEE Strategy 2026", "NEET Study Plan", "CAT MBA Tips", "Study Motivation Tips", "Memory Techniques", "English Speaking Guide", "Current Affairs Daily", "Scholarship Guide India", "Board Exam Tips", "College Life Guide", "Career Guidance India", "Online Courses Worth It", "Speed Reading Technique", "Smart Note Taking"] },
  comedy: { emoji: "😂", label: "What comedy style do you want?", suggestions: ["Indian Parents Roast", "Office Life Comedy", "Relationship Situations", "Student Exam Life", "POV Skit Ideas", "Festival Season Jokes", "Social Media Trolls", "Delhi vs Mumbai", "North India vs South India", "Cricket Fan Life", "Exam Tension Comedy", "Traffic India Comedy", "Arranged Marriage Jokes", "Best Friend Comedy", "Gen Z vs Millennial"] },
  yoga: { emoji: "🧘", label: "What yoga topic do you want to cover?", suggestions: ["Beginner Yoga Routine", "Weight Loss Yoga", "Morning Yoga Flow", "Pranayama Guide", "Flexibility Training", "Stress Relief Yoga", "Meditation for Beginners", "Surya Namaskar Guide", "Yoga for Back Pain", "Advanced Yoga Poses", "Breathwork Techniques", "Evening Yoga Routine", "Kids Yoga", "Pregnancy Yoga Safe", "Office Desk Yoga"] },
  crypto: { emoji: "🪙", label: "What crypto topic do you want to cover?", suggestions: ["Bitcoin Explained Simply", "Ethereum Guide India", "Web3 for Beginners", "DeFi Explained", "NFT Guide India", "Crypto for Beginners", "Best Altcoins 2026", "Crypto Tax India", "Blockchain Technology", "Crypto Wallet Setup", "Staking Guide", "Bull vs Bear Market", "Crypto Trading Tips", "Is Crypto Safe India", "Top Crypto Exchanges India"] },
};

function detectNiche(input: string): string | null {
  const q = input.toLowerCase().trim();
  const keywords: Record<string, string[]> = {
    gaming: ["gaming", "game", "bgmi", "free fire", "pubg", "gta", "minecraft", "valorant", "cod", "fifa", "esports", "gameplay", "gamer"],
    fitness: ["fitness", "gym", "workout", "weight loss", "muscle", "yoga", "exercise", "training", "bodybuilding", "abs", "cardio"],
    finance: ["finance", "money", "stock", "invest", "mutual fund", "sip", "trading", "budget", "saving", "wealth", "income", "tax"],
    cricket: ["cricket", "ipl", "kohli", "rohit", "batting", "bowling", "t20", "test match", "bcci", "bumrah"],
    food: ["food", "recipe", "cooking", "biryani", "meal", "diet", "eat", "restaurant", "snack", "dessert", "breakfast"],
    tech: ["tech", "technology", "ai", "coding", "smartphone", "laptop", "software", "programming", "chatgpt", "gadget"],
    travel: ["travel", "trip", "goa", "manali", "kerala", "dubai", "bali", "destination", "hotel", "visa", "vlog"],
    motivation: ["motivation", "mindset", "discipline", "success", "habit", "routine", "stoic", "confidence", "goal", "hustle"],
    business: ["business", "startup", "entrepreneur", "freelance", "marketing", "branding", "ecommerce", "revenue", "client"],
    bollywood: ["bollywood", "movie", "film", "actor", "actress", "netflix", "ott", "celebrity", "web series", "review"],
    skincare: ["skincare", "skin", "acne", "glow", "beauty", "moisturizer", "serum", "sunscreen", "face"],
    education: ["education", "study", "exam", "upsc", "jee", "neet", "college", "school", "learn", "cat"],
    comedy: ["comedy", "funny", "meme", "pov", "skit", "joke", "parody", "humour", "roast"],
    yoga: ["yoga", "meditation", "pranayama", "asana", "breathwork", "mindfulness", "wellness"],
    crypto: ["crypto", "bitcoin", "ethereum", "blockchain", "nft", "web3", "defi", "token", "coin"],
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
  result: any;
  duration: number;
  language: string;
}

function saveHistory(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  const existing: HistoryEntry[] = JSON.parse(localStorage.getItem("yt_script_history") || "[]");
  const newEntry = { ...entry, id: `${Date.now()}`, timestamp: Date.now() };
  const updated = [newEntry, ...existing].slice(0, 20);
  localStorage.setItem("yt_script_history", JSON.stringify(updated));
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

export default function YouTubeScript() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<"generate" | "history">("generate");
  const [topic, setTopic] = useState(() => localStorage.getItem('yt_script_topic') || "");
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(() => {
    const saved = localStorage.getItem('yt_script_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const [detectedNiche, setDetectedNiche] = useState<string | null>(null);
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => JSON.parse(localStorage.getItem("yt_script_history") || "[]"));
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [showSeriesPrompt, setShowSeriesPrompt] = useState(false);
  const [seriesTopic, setSeriesTopic] = useState('');
  const [generatingSeries, setGeneratingSeries] = useState(false);
  const [seriesScripts, setSeriesScripts] = useState<any[]>([]);
  const [showSeriesResult, setShowSeriesResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('yt_script_topic', topic); }, [topic]);
  useEffect(() => { if (result) localStorage.setItem('yt_script_result', JSON.stringify(result)); }, [result]);

  useEffect(() => {
    if (topic.trim().length > 0) {
      const filtered = SCRIPT_SUGGESTIONS.filter(s => s.toLowerCase().includes(topic.toLowerCase()) && s.toLowerCase() !== topic.toLowerCase()).slice(0, 5);
      setDropdownSuggestions(filtered); setShowDropdown(filtered.length > 0);
      const niche = detectNiche(topic);
      if (niche && SUB_CATEGORIES[niche]) { setDetectedNiche(niche); setShowSubCategories(true); }
      else { setDetectedNiche(null); setShowSubCategories(false); }
    } else { setShowDropdown(false); setDropdownSuggestions([]); setDetectedNiche(null); setShowSubCategories(false); }
  }, [topic]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const copyText = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };

  const copyAll = (r: any, prefix = '') => {
    const parts = [];
    if (r.title) parts.push(`TITLE: ${r.title}`);
    if (r.intro) parts.push(`INTRO:\n${r.intro}`);
    r.sections?.forEach((s: any, i: number) => parts.push(`SECTION ${i + 1}: ${s.heading}\n${s.content}`));
    if (r.outro) parts.push(`OUTRO:\n${r.outro}`);
    navigator.clipboard.writeText(parts.join('\n\n'));
    setCopied(`all${prefix}`); setTimeout(() => setCopied(null), 2000);
  };

  const handleClear = () => {
    setTopic(''); setResult(null); setDetectedNiche(null); setShowSubCategories(false);
    localStorage.removeItem('yt_script_result'); localStorage.removeItem('yt_script_topic');
  };

  const handleGenerate = async (t?: string) => {
    const target = t || topic;
    if (!target.trim()) return;
    setTopic(target); setShowDropdown(false); setShowSubCategories(false); setLoading(true); setResult(null);
    const savedLanguage = localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english';
    try {
      const res = await fetch(`${BASE}/api/youtube/script`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: target, duration, niche: user?.user_metadata?.niche, language: savedLanguage }),
      });
      const data = await res.json();
      setResult(data);
      localStorage.setItem('yt_script_result', JSON.stringify(data));
      localStorage.setItem('yt_script_topic', target);
      saveHistory({ topic: target, result: data, duration, language: savedLanguage });
      const updatedHistory = JSON.parse(localStorage.getItem("yt_script_history") || "[]");
      setHistory(updatedHistory);
      // ✅ Check if same topic searched 3+ times → suggest series
      const topicCount = updatedHistory.filter((h: HistoryEntry) =>
        h.topic.toLowerCase() === target.toLowerCase()
      ).length;
      if (topicCount >= 3 && !showSeriesResult) {
        setSeriesTopic(target);
        setShowSeriesPrompt(true);
      }
    } catch { setResult({ error: 'Failed to generate script. Try again.' }); }
    finally { setLoading(false); }
  };

  const generateSeries = async () => {
    setGeneratingSeries(true);
    setShowSeriesPrompt(false);
    setShowSeriesResult(true);
    setSeriesScripts([]);
    const savedLanguage = localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english';
    const angles = [
      `${seriesTopic} Complete Beginner Guide — Part 1`,
      `${seriesTopic} Top Mistakes to Avoid — Part 2`,
      `Advanced ${seriesTopic} Tips & Tricks — Part 3`,
      `${seriesTopic} Secrets Nobody Tells You — Part 4`,
      `${seriesTopic} Results After 30 Days — Part 5`,
    ];
    const results: any[] = [];
    for (const angle of angles) {
      try {
        const res = await fetch(`${BASE}/api/youtube/script`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: angle, duration, niche: user?.user_metadata?.niche, language: savedLanguage }),
        });
        const data = await res.json();
        results.push({ angle, script: data });
        setSeriesScripts([...results]);
      } catch { results.push({ angle, script: null }); }
    }
    setGeneratingSeries(false);
  };

  const deleteHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem("yt_script_history", JSON.stringify(updated));
    setHistory(updated);
  };

  const clearAllHistory = () => { localStorage.removeItem("yt_script_history"); setHistory([]); };

  const subCat = detectedNiche ? SUB_CATEGORIES[detectedNiche] : null;

  const ResultCard = ({ r, prefix = '' }: { r: any; prefix?: string }) => (
    <div className="space-y-3">
      {r.title && (
        <div className="rounded-2xl p-4" style={{ background: `${YT_COLOR}10`, border: `1px solid ${YT_COLOR}30` }}>
          <p className="text-xs font-bold uppercase mb-1" style={{ color: YT_COLOR }}>🎯 Title</p>
          <p className="text-sm text-foreground font-medium">{r.title}</p>
        </div>
      )}
      {r.intro && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase" style={{ color: YT_COLOR }}>🎬 Intro</p>
            <button onClick={() => copyText(r.intro, `intro${prefix}`)}>{copied === `intro${prefix}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{r.intro}</p>
        </div>
      )}
      {r.sections?.map((section: any, i: number) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">📌 {section.heading}</p>
            <button onClick={() => copyText(section.content, `sec${prefix}-${i}`)}>{copied === `sec${prefix}-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{section.content}</p>
        </div>
      ))}
      {r.outro && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase text-green-400">🎯 Outro & CTA</p>
            <button onClick={() => copyText(r.outro, `outro${prefix}`)}>{copied === `outro${prefix}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{r.outro}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: YT_COLOR }} />
          <h1 className="text-lg font-bold text-foreground">YouTube Script</h1>
          {/* History toggle */}
          <button onClick={() => setActiveView(activeView === "history" ? "generate" : "history")}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={activeView === "history"
              ? { background: YT_GRAD, color: "#fff" }
              : { background: `${YT_COLOR}15`, color: YT_COLOR, border: `1px solid ${YT_COLOR}30` }}>
            <Clock className="w-3.5 h-3.5" />
            History {history.length > 0 && <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.25)" }}>{history.length}</span>}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">

        {/* ── HISTORY VIEW ── */}
        {activeView === "history" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">YouTube Script History</p>
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
                  className="text-xs px-4 py-2 rounded-xl text-white" style={{ background: YT_GRAD }}>
                  Generate your first script
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-3 p-4 cursor-pointer"
                      onClick={() => setExpandedHistory(expandedHistory === entry.id ? null : entry.id)}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
                        style={{ background: `${YT_COLOR}15`, color: YT_COLOR }}>
                        {entry.topic[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{entry.topic}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</span>
                          <span className="text-xs text-muted-foreground">· {entry.duration} min · {entry.language}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); copyAll(entry.result, entry.id); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
                          {copied === `all${entry.id}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteHistory(entry.id); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedHistory === entry.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedHistory === entry.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border overflow-hidden">
                          <div className="p-4 space-y-3">
                            <ResultCard r={entry.result} prefix={entry.id} />
                            <button onClick={() => { setActiveView("generate"); handleGenerate(entry.topic); }}
                              className="w-full py-2.5 rounded-xl text-white text-xs font-medium flex items-center justify-center gap-1.5"
                              style={{ background: YT_GRAD }}>
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

        {/* ── GENERATE VIEW ── */}
        {activeView === "generate" && (
          <>
            <div className="relative">
              <input ref={inputRef} value={topic} onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); if (e.key === "Escape") setShowDropdown(false); }}
                onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
                placeholder="Enter video topic (e.g. Gaming, Finance, Fitness)..."
                className="w-full px-4 pr-9 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                onFocus={(e) => { e.target.style.borderColor = `${YT_COLOR}60`; }}
                onBlur={(e) => { e.target.style.borderColor = ''; }} />
              {topic && (
                <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
                  <X className="w-4 h-4" />
                </button>
              )}
              {showDropdown && dropdownSuggestions.length > 0 && (
                <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
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
              {showSubCategories && subCat && !result && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border p-4 space-y-3"
                  style={{ borderColor: `${YT_COLOR}30`, background: `${YT_COLOR}08` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{subCat.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{subCat.label}</p>
                      <p className="text-xs text-muted-foreground">Pick a specific topic for a better script</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subCat.suggestions.map((s, i) => (
                      <motion.button key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                        onClick={() => handleGenerate(s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                        style={{ borderColor: `${YT_COLOR}30`, color: YT_COLOR, background: `${YT_COLOR}08` }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${YT_COLOR}20`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${YT_COLOR}08`; }}>
                        <ChevronRight className="w-3 h-3" />{s}
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Or press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: `${YT_COLOR}15`, color: YT_COLOR }}>Enter</kbd> to generate a general {detectedNiche} script</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!topic && !result && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Popular topics:</p>
                <div className="flex flex-wrap gap-2">
                  {SCRIPT_SUGGESTIONS.slice(0, 8).map((s) => (
                    <button key={s} onClick={() => setTopic(s)}
                      className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${YT_COLOR}60`; (e.currentTarget as HTMLElement).style.color = YT_COLOR; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.color = ''; }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Video Duration</p>
              <div className="flex gap-2">
                {[3, 5, 8, 10].map((d) => (
                  <button key={d} onClick={() => setDuration(d)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                    style={duration === d ? { background: YT_GRAD, color: "#fff", borderColor: "transparent" } : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => handleGenerate()} disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: YT_GRAD }}>
              <Sparkles className="w-4 h-4" />
              {loading ? `Generating ${duration}-min script...` : 'Generate Script'}
            </button>

            {loading && (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: YT_COLOR }} />
                <p className="text-xs text-muted-foreground">Writing your {duration}-minute script for <span style={{ color: YT_COLOR }}>"{topic}"</span>...</p>
              </div>
            )}

            {result && !result.error && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Your Script</p>
                    <p className="text-xs text-muted-foreground">Language: {localStorage.getItem('userLanguage') || 'english'}</p>
                  </div>
                  <button onClick={() => copyAll(result)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground">
                    {copied === 'all' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copy All
                  </button>
                </div>
                <ResultCard r={result} />
                <button onClick={handleClear} className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2">
                  <X className="w-4 h-4" /> New Topic
                </button>
              </motion.div>
            )}

            {result?.error && <p className="text-sm text-center" style={{ color: YT_COLOR }}>{result.error}</p>}

            {/* ── SERIES PROMPT ── */}
            <AnimatePresence>
              {showSeriesPrompt && (
                <motion.div initial={{ opacity:0, scale:0.95, y:10 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
                  className="rounded-2xl p-5 space-y-4"
                  style={{ background:`${YT_COLOR}08`, border:`2px solid ${YT_COLOR}40` }}>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🎬</div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Want a YouTube Video Series?</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You've searched <span style={{ color: YT_COLOR }}>"{seriesTopic}"</span> multiple times. Want us to generate a <strong>5-part YouTube series</strong> covering this topic from all angles?
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {["Part 1: Beginners", "Part 2: Mistakes", "Part 3: Advanced", "Part 4: Secrets", "Part 5: Results"].map((p, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full" style={{ background:`${YT_COLOR}15`, color: YT_COLOR }}>📌 {p}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={generateSeries}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                      style={{ background: YT_GRAD }}>
                      <Sparkles className="w-4 h-4" /> Yes! Generate 5-Part Series
                    </button>
                    <button onClick={() => setShowSeriesPrompt(false)}
                      className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
                      Not now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── SERIES RESULT ── */}
            {showSeriesResult && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-sm">🎬 5-Part Series: <span style={{ color: YT_COLOR }}>{seriesTopic}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{seriesScripts.length}/5 scripts generated</p>
                  </div>
                  <button onClick={() => { setShowSeriesResult(false); setSeriesScripts([]); }}
                    className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                </div>

                {generatingSeries && seriesScripts.length < 5 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: YT_COLOR }} />
                    Generating Part {seriesScripts.length + 1} of 5...
                  </div>
                )}

                {seriesScripts.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-3 p-4 cursor-pointer"
                      onClick={() => setExpandedHistory(expandedHistory === `series-${idx}` ? null : `series-${idx}`)}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: YT_GRAD }}>{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.angle}</p>
                        {item.script?.title && <p className="text-xs text-muted-foreground truncate mt-0.5">{item.script.title}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.script && (
                          <button onClick={e => { e.stopPropagation(); copyAll(item.script, `series-${idx}`); }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
                            {copied === `allseries-${idx}` ? <Check className="w-3.5 h-3.5 text-green-400"/> : <Copy className="w-3.5 h-3.5"/>}
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
                            <ResultCard r={item.script} prefix={`series-${idx}`} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {!generatingSeries && seriesScripts.length === 5 && (
                  <button onClick={() => {
                    const all = seriesScripts.map((s, i) =>
                      `PART ${i+1}: ${s.angle}\n\nTITLE: ${s.script?.title || ''}\n\nINTRO: ${s.script?.intro || ''}\n\nOUTRO: ${s.script?.outro || ''}`
                    ).join('\n\n─────────────\n\n');
                    navigator.clipboard.writeText(all);
                    setCopied('series'); setTimeout(() => setCopied(null), 2000);
                  }} className="w-full py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ background: YT_GRAD }}>
                    {copied === 'series' ? <><Check className="w-4 h-4"/> All Copied!</> : <><Copy className="w-4 h-4"/> Copy All 5 Scripts</>}
                  </button>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}