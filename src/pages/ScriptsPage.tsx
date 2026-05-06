import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Clock, RefreshCw, Mic, Search, X, ChevronRight } from "lucide-react";
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

// ── Smart sub-category map ──
const SUB_CATEGORIES: Record<string, { label: string; suggestions: string[]; emoji: string }> = {
  gaming: {
    emoji: "🎮",
    label: "Which game are you making content about?",
    suggestions: ["BGMI", "Free Fire", "GTA 5", "Minecraft", "Valorant", "Call of Duty", "FIFA", "Chess", "Roblox", "PUBG PC", "Fortnite", "Among Us", "Clash of Clans", "Mobile Legends", "Pokemon GO"],
  },
  fitness: {
    emoji: "💪",
    label: "What fitness topic do you want to cover?",
    suggestions: ["Home Workout", "Weight Loss", "Muscle Building", "Yoga", "HIIT Training", "Cardio", "Diet Plan", "6 Pack Abs", "Stretching", "Running Tips", "Gym Beginner", "Protein Diet", "Transformation", "Calisthenics", "Zumba"],
  },
  finance: {
    emoji: "📈",
    label: "What finance topic do you want to cover?",
    suggestions: ["Stock Market", "Mutual Funds SIP", "Crypto Bitcoin", "Budget Tips", "Tax Saving", "Credit Card", "Passive Income", "IPO Investing", "Real Estate", "Forex Trading", "Gold Investment", "Personal Finance", "Emergency Fund", "Debt Free", "Side Hustle"],
  },
  cricket: {
    emoji: "🏏",
    label: "What cricket topic do you want to cover?",
    suggestions: ["IPL 2026", "India vs Pakistan", "Virat Kohli", "Rohit Sharma", "Batting Tips", "Bowling Tips", "Fantasy Cricket", "Test Match", "T20 Analysis", "Women's Cricket", "Young Players", "Fielding Tips", "Cricket Records", "ICC World Cup", "Bumrah Analysis"],
  },
  food: {
    emoji: "🍳",
    label: "What food topic do you want to cover?",
    suggestions: ["Biryani Recipe", "Quick Breakfast", "Street Food", "Healthy Meals", "Dessert Recipe", "Vegan Food", "Keto Diet", "Indian Snacks", "Budget Meals", "Meal Prep", "Cake Recipe", "Smoothie", "Air Fryer", "Kids Tiffin", "Restaurant Review"],
  },
  tech: {
    emoji: "💻",
    label: "What tech topic do you want to cover?",
    suggestions: ["ChatGPT Tutorial", "AI Tools", "Budget Smartphone", "Laptop Review", "Coding Tips", "Cybersecurity", "Electric Vehicles", "Smart Home", "Camera Review", "Gaming PC", "iPhone vs Android", "Free AI Tools", "App Review", "Tech Career", "Python Tutorial"],
  },
  travel: {
    emoji: "✈️",
    label: "Where are you making travel content about?",
    suggestions: ["Goa", "Manali", "Kerala", "Rajasthan", "Dubai", "Thailand", "Bali", "Europe Budget", "Northeast India", "Andaman", "Ladakh", "Rishikesh", "Coorg", "Singapore", "Visa Free Countries"],
  },
  motivation: {
    emoji: "🔥",
    label: "What motivation topic do you want to cover?",
    suggestions: ["Morning Routine", "Discipline", "Study Tips", "Success Mindset", "Overcoming Failure", "Self Improvement", "Stoicism", "Atomic Habits", "Goal Setting", "Confidence", "Time Management", "Hustle Culture", "Mental Health", "Consistency", "Fear of Failure"],
  },
  business: {
    emoji: "💼",
    label: "What business topic do you want to cover?",
    suggestions: ["Start a Business", "Freelancing", "Dropshipping", "Instagram Marketing", "YouTube Strategy", "Entrepreneurship", "Digital Marketing", "LinkedIn Growth", "Amazon Selling", "Startup Ideas", "Business Mistakes", "First Client", "Personal Branding", "Email Marketing", "Content Creation"],
  },
  bollywood: {
    emoji: "🎬",
    label: "What Bollywood topic do you want to cover?",
    suggestions: ["Movie Review", "Celebrity News", "Box Office", "Upcoming Movies", "Actor Ranking", "Best Movies 2026", "Web Series Review", "OTT Platform", "Award Show", "Music Album", "Director Analysis", "Film Comparison", "Villain Characters", "Romantic Movies", "Action Movies"],
  },
  skincare: {
    emoji: "✨",
    label: "What skincare topic do you want to cover?",
    suggestions: ["Acne Treatment", "Glass Skin", "Anti Aging", "Sunscreen Guide", "Night Routine", "Morning Routine", "Budget Skincare", "Korean Beauty", "Dark Spots", "Oily Skin", "Dry Skin Tips", "Serum Guide", "Moisturizer", "Face Wash", "Natural Remedies"],
  },
  yoga: {
    emoji: "🧘",
    label: "What yoga topic do you want to cover?",
    suggestions: ["Beginner Yoga", "Weight Loss Yoga", "Morning Yoga", "Pranayama", "Flexibility", "Stress Relief", "Meditation", "Surya Namaskar", "Yoga for Back Pain", "Advanced Poses", "Breathwork", "Evening Yoga", "Kids Yoga", "Pregnancy Yoga", "Office Yoga"],
  },
  crypto: {
    emoji: "🪙",
    label: "What crypto topic do you want to cover?",
    suggestions: ["Bitcoin", "Ethereum", "Web3", "DeFi", "NFT", "Crypto for Beginners", "Altcoins", "Crypto India", "Blockchain", "Crypto Tax India", "Staking", "Crypto Wallet", "Trading Tips", "Bull Market", "Bear Market"],
  },
  education: {
    emoji: "📚",
    label: "What education topic do you want to cover?",
    suggestions: ["UPSC Tips", "JEE Preparation", "NEET Study", "CAT MBA", "Study Motivation", "Memory Techniques", "English Speaking", "Current Affairs", "Scholarship Tips", "Board Exams", "College Life", "Career Guidance", "Online Courses", "Speed Reading", "Note Taking"],
  },
  comedy: {
    emoji: "😂",
    label: "What comedy style do you want?",
    suggestions: ["Indian Parents", "Office Comedy", "Relationship Jokes", "Student Life", "POV Skit", "Festival Comedy", "Social Media Jokes", "Delhi vs Mumbai", "North vs South", "Cricket Comedy", "Exam Jokes", "Traffic Comedy", "Marriage Comedy", "Friends Comedy", "Generation Z vs Millennial"],
  },
};

// Detect niche from input
function detectNiche(input: string): string | null {
  const q = input.toLowerCase().trim();
  const keywords: Record<string, string[]> = {
    gaming: ["gaming", "game", "bgmi", "free fire", "pubg", "gta", "minecraft", "valorant", "cod", "fifa", "esports", "gameplay"],
    fitness: ["fitness", "gym", "workout", "weight loss", "muscle", "yoga", "exercise", "training", "bodybuilding", "abs", "cardio"],
    finance: ["finance", "money", "stock", "invest", "mutual fund", "crypto", "bitcoin", "sip", "trading", "budget", "saving", "wealth"],
    cricket: ["cricket", "ipl", "kohli", "rohit", "batting", "bowling", "t20", "test match", "bcci", "fielding"],
    food: ["food", "recipe", "cooking", "biryani", "meal", "diet", "eat", "restaurant", "snack", "dessert", "breakfast"],
    tech: ["tech", "technology", "ai", "coding", "smartphone", "laptop", "software", "programming", "chatgpt", "gadget"],
    travel: ["travel", "trip", "goa", "manali", "kerala", "dubai", "bali", "destination", "hotel", "visa", "tour"],
    motivation: ["motivation", "mindset", "discipline", "success", "habit", "routine", "stoic", "confidence", "goal", "self improvement"],
    business: ["business", "startup", "entrepreneur", "freelance", "marketing", "branding", "ecommerce", "brand", "revenue", "client"],
    bollywood: ["bollywood", "movie", "film", "actor", "actress", "netflix", "ott", "celebrity", "web series", "cinema"],
    skincare: ["skincare", "skin", "acne", "glow", "beauty", "moisturizer", "serum", "sunscreen", "face", "beauty"],
    yoga: ["yoga", "meditation", "pranayama", "asana", "breathwork", "mindfulness", "wellness"],
    crypto: ["crypto", "bitcoin", "ethereum", "blockchain", "nft", "web3", "defi", "token", "coin"],
    education: ["education", "study", "exam", "upsc", "jee", "neet", "college", "school", "learn", "course"],
    comedy: ["comedy", "funny", "meme", "pov", "skit", "joke", "parody", "humour", "roast"],
  };

  for (const [niche, words] of Object.entries(keywords)) {
    if (words.some(w => q.includes(w))) return niche;
  }
  return null;
}

export default function ScriptsPage() {
  const { user } = useAuth();
  const userNiche = user?.user_metadata?.niche || '';
  const userLanguage = localStorage.getItem('userLanguage') || user?.user_metadata?.language || 'english';
  const userVoiceStyle = user?.user_metadata?.voice_style || '';

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [script, setScript] = useState<any | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [mode, setMode] = useState('full');
  const [duration, setDuration] = useState(60);
  const [history, setHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);

  // ── Smart sub-category state ──
  const [detectedNiche, setDetectedNiche] = useState<string | null>(null);
  const [showSubCategories, setShowSubCategories] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('script_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (topicInput.trim().length > 0) {
      const filtered = SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(topicInput.toLowerCase()) &&
        s.toLowerCase() !== topicInput.toLowerCase()
      ).slice(0, 6);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);

      // Detect niche and show sub-categories
      const niche = detectNiche(topicInput);
      if (niche && SUB_CATEGORIES[niche]) {
        setDetectedNiche(niche);
        setShowSubCategories(true);
      } else {
        setDetectedNiche(null);
        setShowSubCategories(false);
      }
    } else {
      setShowDropdown(false);
      setDropdownSuggestions([]);
      setDetectedNiche(null);
      setShowSubCategories(false);
    }
  }, [topicInput]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const saveToHistory = (topic: string) => {
    const updated = [topic, ...history.filter(h => h !== topic)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('script_history', JSON.stringify(updated));
  };

  const handleGenerate = async (topic: string) => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError('');
    setSelectedTopic(topic);
    setTopicInput(topic);
    setShowDropdown(false);
    setShowSubCategories(false);
    saveToHistory(topic);
    try {
      const result = await generateScript({
        topic,
        niche: userNiche,
        language: userLanguage,
        voiceStyle: userVoiceStyle,
        duration,
      });
      if (mode === 'hook') setScript({ hook: result.hook });
      else if (mode === 'body') setScript({ body: result.body });
      else if (mode === 'cta') setScript({ cta: result.cta });
      else setScript(result);
    } catch { setError('Failed to generate. Please try again.'); }
    finally { setGenerating(false); }
  };

  const handleClear = () => {
    setTopicInput('');
    setScript(null);
    setSelectedTopic(null);
    setDetectedNiche(null);
    setShowSubCategories(false);
  };

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    if (!script) return;
    const parts = [];
    if (script.hook) parts.push(`HOOK:\n${script.hook}`);
    if (script.body) parts.push(`BODY:\n${script.body}`);
    if (script.cta) parts.push(`CTA:\n${script.cta}`);
    navigator.clipboard.writeText(parts.join('\n\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const subCat = detectedNiche ? SUB_CATEGORIES[detectedNiche] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: IG }} />
          <h1 className="text-lg font-bold text-foreground">Script Generator</h1>
          {userVoiceStyle && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
              <Mic className="w-3 h-3" /> Voice Active
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">

        {/* Mode selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id); setScript(null); }}
              className="p-3 rounded-2xl border text-left transition-all"
              style={mode === m.id
                ? { background: IG_GRAD, borderColor: "transparent", color: "#fff" }
                : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
              <p className="text-xs font-semibold">{m.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{m.description}</p>
            </button>
          ))}
        </div>

        {/* Duration */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Script Duration
          </p>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button key={d.value} onClick={() => setDuration(d.value)}
                className="flex-1 py-2.5 rounded-2xl border text-sm font-medium transition-all"
                style={duration === d.value
                  ? { background: IG_GRAD, borderColor: "transparent", color: "#fff" }
                  : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate(topicInput);
                  if (e.key === "Escape") setShowDropdown(false);
                }}
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
            <button onClick={() => handleGenerate(topicInput)} disabled={generating}
              className="px-5 py-3 rounded-2xl text-white flex items-center gap-2 disabled:opacity-60"
              style={{ background: IG_GRAD }}>
              <Sparkles className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {showDropdown && dropdownSuggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" style={{ width: 'calc(100% - 90px)' }}>
              {dropdownSuggestions.map((s, i) => (
                <button key={i} onClick={() => handleGenerate(s)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── SMART SUB-CATEGORY SUGGESTIONS ── */}
        <AnimatePresence>
          {showSubCategories && subCat && !script && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
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
                  <motion.button key={s}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleGenerate(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                    style={{ borderColor: `${IG}30`, color: IG, background: `${IG}08` }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${IG}20`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${IG}60`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = `${IG}08`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${IG}30`;
                    }}>
                    <ChevronRight className="w-3 h-3" />
                    {s}
                  </motion.button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Or press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: `${IG}15`, color: IG }}>Enter</kbd> to generate a general {detectedNiche} script
              </p>
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
                  className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${IG}50`; (e.currentTarget as HTMLElement).style.color = IG; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.color = ''; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Generating loader */}
        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="w-6 h-6" style={{ color: IG }} />
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Writing viral script for <span style={{ color: IG }}>"{selectedTopic}"</span>...
            </p>
          </motion.div>
        )}

        {/* Result */}
        {script && !generating && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-4">

            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-foreground text-sm">
                  {MODES.find(m => m.id === mode)?.label} for
                  <span className="ml-1" style={{ color: IG }}>"{selectedTopic}"</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Language: {localStorage.getItem('userLanguage') || 'english'}
                </p>
              </div>
              {mode === 'full' && (
                <button onClick={copyAll} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  {copied === 'all' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied === 'all' ? 'Copied!' : 'Copy All'}
                </button>
              )}
            </div>

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

            {script.duration_seconds && mode === 'full' && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Clock className="w-3.5 h-3.5" /> ~{script.duration_seconds} seconds
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => handleGenerate(selectedTopic || topicInput)} disabled={generating}
                className="flex-1 py-2.5 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
              <button onClick={handleClear}
                className="px-4 py-2.5 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-2">
                <X className="w-4 h-4" />
                New Topic
              </button>
            </div>
          </motion.div>
        )}

        {/* Recent Searches */}
        {history.length > 0 && !script && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" style={{ color: IG }} /> Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <button key={i} onClick={() => setTopicInput(item)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Clock className="w-3 h-3" />{item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}