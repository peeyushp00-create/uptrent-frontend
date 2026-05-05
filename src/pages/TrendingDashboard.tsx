import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Minus,
  Sparkles, Loader2, Search, X, Hash,
  Copy, Check, Instagram, Youtube, ChevronDown
} from "lucide-react";
import { getTopics, generateScript } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const IG_GRAD = "linear-gradient(135deg, #14BBA6, #22D3EE)";
const IG = "#14BBA6";
const YT = "#FF6B6B";
const YT_GRAD = "linear-gradient(135deg, #FF6B6B, #FFB86C)";
const PAGE_SIZE = 10;

interface Topic {
  id?: string;
  name: string;
  volume: number;
  momentum: "rising" | "falling" | "stable";
  hashtags: string[];
  type?: string;
  trend_score?: number;
}

interface MicroNiche {
  name: string;
  hashtags: string[];
  why: string;
  virality: number;
}

interface ScriptResult {
  hook: string;
  body: string;
  cta: string;
}

const MomentumIcon = ({ momentum }: { momentum: string }) => {
  if (momentum === "rising") return <ArrowUpRight className="w-3 h-3" />;
  if (momentum === "falling") return <ArrowDownRight className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
};

const momentumColor = (m: string) =>
  m === "rising" ? "text-green-400" : m === "falling" ? "text-red-400" : "text-muted-foreground";

const getScoreLabel = (score: number) => {
  if (score >= 80) return { label: "🔥 Hot", color: "text-orange-400 bg-orange-400/10" };
  if (score >= 60) return { label: "📈 Rising", color: "text-green-400 bg-green-400/10" };
  return { label: "📊 Stable", color: "text-blue-400 bg-blue-400/10" };
};

const MICRO_NICHES: Record<string, MicroNiche[]> = {
  fitness: [
    { name: "Home Workout No Equipment", hashtags: ["#homeworkout","#noequipment","#fitness"], why: "High search volume, low competition", virality: 94 },
    { name: "Weight Loss Transformation", hashtags: ["#weightloss","#transformation","#beforeafter"], why: "Emotional hook drives massive shares", virality: 97 },
    { name: "Gym Beginner Guide", hashtags: ["#gymtips","#beginner","#gymmotivation"], why: "Beginners always searching for guidance", virality: 88 },
    { name: "Yoga for Flexibility", hashtags: ["#yoga","#flexibility","#yogaforbeginners"], why: "Trending wellness content in India", virality: 85 },
    { name: "Protein Diet India", hashtags: ["#proteinrich","#indiandiet","#musclegain"], why: "Indian diet + fitness = viral combo", virality: 91 },
    { name: "6 Pack Abs in 30 Days", hashtags: ["#abs","#sixpack","#absworkout"], why: "Challenge format = high save rate", virality: 96 },
    { name: "Intermittent Fasting India", hashtags: ["#intermittentfasting","#weightloss","#health"], why: "IF is trending among urban Indians", virality: 89 },
    { name: "Women Weight Training", hashtags: ["#womenlifting","#girlswholift","#fitness"], why: "Underserved niche with growing audience", virality: 92 },
  ],
  finance: [
    { name: "SIP vs Lumpsum Investment", hashtags: ["#sip","#mutualfunds","#investing"], why: "Most searched finance topic in India", virality: 95 },
    { name: "Stock Market for Beginners", hashtags: ["#stockmarket","#nifty","#sensex"], why: "Beginner content always goes viral", virality: 93 },
    { name: "How to Save Tax India", hashtags: ["#taxsaving","#incometax","#80c"], why: "Seasonal spike every March", virality: 98 },
    { name: "Credit Card Tricks India", hashtags: ["#creditcard","#cashback","#rewards"], why: "Savings tips = high save rate", virality: 89 },
    { name: "Passive Income Ideas India", hashtags: ["#passiveincome","#sidehustle","#money"], why: "Aspirational content = viral shares", virality: 96 },
    { name: "Crypto Explained Hindi", hashtags: ["#crypto","#bitcoin","#web3"], why: "Hindi explainers are underserved", virality: 87 },
    { name: "Emergency Fund India", hashtags: ["#emergencyfund","#personalfinance","#savings"], why: "Financial safety = emotional resonance", virality: 88 },
    { name: "IPO Investing Guide India", hashtags: ["#ipo","#investing","#stockmarket"], why: "IPO season spikes search volume", virality: 91 },
  ],
  cricket: [
    { name: "IPL 2026 Match Analysis", hashtags: ["#ipl","#ipl2026","#cricket"], why: "Real-time sports content peaks during IPL", virality: 99 },
    { name: "Virat Kohli Stats Breakdown", hashtags: ["#viratkohli","#kohli","#cricket"], why: "Celebrity + stats = guaranteed views", virality: 97 },
    { name: "India vs Pakistan Highlights", hashtags: ["#indvspak","#cricket","#t20"], why: "Most watched cricket rivalry", virality: 98 },
    { name: "Cricket Batting Tips", hashtags: ["#battingtips","#cricket","#cricketcoach"], why: "Tutorial content in cricket is rare", virality: 84 },
    { name: "Young Players to Watch", hashtags: ["#youngcricketers","#ipl","#discovery"], why: "Discovery content drives saves", virality: 88 },
    { name: "Fantasy Cricket Winning Tips", hashtags: ["#dream11","#fantasycricket","#tips"], why: "Fantasy sports is massive in India", virality: 92 },
    { name: "Cricket Records Nobody Knows", hashtags: ["#cricketfacts","#records","#cricket"], why: "Trivia content = shares + comments", virality: 90 },
    { name: "Best Cricket Drills at Home", hashtags: ["#cricketdrills","#practice","#cricket"], why: "Aspiring players = huge audience", virality: 86 },
  ],
  tech: [
    { name: "AI Tools for Students India", hashtags: ["#aitools","#chatgpt","#students"], why: "Students = huge audience segment", virality: 95 },
    { name: "Best Budget Smartphone 2026", hashtags: ["#smartphone","#budget","#techreview"], why: "Purchase decisions drive high saves", virality: 93 },
    { name: "ChatGPT Hindi Tutorial", hashtags: ["#chatgpt","#hindi","#ai"], why: "Hindi AI content is highly searched", virality: 96 },
    { name: "Coding for Beginners India", hashtags: ["#coding","#programming","#python"], why: "Career pivot content = emotional shares", virality: 88 },
    { name: "Laptop Buying Guide India", hashtags: ["#laptop","#buying","#techguide"], why: "Purchase intent = massive saves", virality: 90 },
    { name: "Free AI Tools Everyone Should Know", hashtags: ["#freetools","#productivity","#ai"], why: "Free + useful = instant virality", virality: 97 },
    { name: "Cybersecurity Tips India", hashtags: ["#cybersecurity","#privacy","#tech"], why: "Fear-based hook = instant attention", virality: 89 },
    { name: "Tech Career Roadmap 2026", hashtags: ["#techcareer","#coding","#software"], why: "Career guidance = saves + shares", virality: 92 },
  ],
  food: [
    { name: "5 Minute Indian Breakfast", hashtags: ["#breakfast","#quickrecipe","#indianfood"], why: "Morning routines = daily views", virality: 92 },
    { name: "Street Food Recipes at Home", hashtags: ["#streetfood","#homemade","#recipe"], why: "Nostalgia + savings = high saves", virality: 95 },
    { name: "High Protein Veg Meals India", hashtags: ["#veggieprotein","#indianfood","#healthy"], why: "Vegetarian protein is underserved", virality: 91 },
    { name: "Budget Meal Prep India", hashtags: ["#mealprep","#budget","#healthyfood"], why: "Budget + health = twin viral hooks", virality: 89 },
    { name: "Biryani Secret Recipe", hashtags: ["#biryani","#recipe","#indiancooking"], why: "Biryani is the most searched Indian dish", virality: 97 },
    { name: "10 Min Dessert No Bake", hashtags: ["#dessert","#nobake","#quickrecipe"], why: "Quick desserts = massive saves", virality: 94 },
    { name: "ASMR Cooking India", hashtags: ["#asmrcooking","#satisfying","#food"], why: "ASMR food is trending on Reels", virality: 88 },
    { name: "Healthy Tiffin Ideas for Kids", hashtags: ["#tiffin","#kidsmeals","#healthyfood"], why: "Parent audience = high emotional saves", virality: 90 },
  ],
  travel: [
    { name: "Hidden Gems India 2026", hashtags: ["#hiddenplaces","#india","#travel"], why: "Discovery content gets massive saves", virality: 96 },
    { name: "Budget Goa Trip Under 5000", hashtags: ["#goa","#budgettravel","#india"], why: "Budget + popular destination = viral", virality: 93 },
    { name: "Visa Free Countries for Indians", hashtags: ["#visafree","#travel","#indianpassport"], why: "Practical info = instant saves", virality: 98 },
    { name: "Solo Travel India Guide", hashtags: ["#solotravel","#india","#traveltips"], why: "Solo travel is rising trend in India", virality: 89 },
    { name: "Best Hill Stations Monsoon", hashtags: ["#hillstation","#monsoon","#travel"], why: "Seasonal content peaks during monsoon", virality: 91 },
    { name: "International Trip Under 50K", hashtags: ["#budgettravel","#international","#tips"], why: "Aspirational yet achievable = viral", virality: 95 },
    { name: "Train Travel Hacks India", hashtags: ["#irctc","#traintravel","#travelhacks"], why: "Everyone travels by train in India", virality: 87 },
    { name: "Northeast India Travel", hashtags: ["#northeast","#meghalaya","#india"], why: "Underexplored = curiosity + saves", virality: 92 },
  ],
  gaming: [
    { name: "BGMI Pro Tips India", hashtags: ["#bgmi","#battlegrounds","#gaming"], why: "BGMI is India's top mobile game", virality: 95 },
    { name: "Best Gaming Setup Under 30K", hashtags: ["#gamingsetup","#budget","#pcgaming"], why: "Budget setups = aspiration content", virality: 92 },
    { name: "Free Fire Rank Push Guide", hashtags: ["#freefire","#rankpush","#gaming"], why: "Rank content = loyal gaming audience", virality: 88 },
    { name: "Gaming Career in India", hashtags: ["#esports","#gamingcareer","#india"], why: "Career content gets parent shares", virality: 86 },
    { name: "Mobile vs PC Gaming India", hashtags: ["#mobilegaming","#pcgaming","#debate"], why: "Debate format = comment engagement", virality: 90 },
    { name: "Top 10 Games 2026 India", hashtags: ["#topgames","#2026","#gaming"], why: "List format = high save rate", virality: 87 },
    { name: "How to Make Money Gaming India", hashtags: ["#gainingmoney","#esports","#streaming"], why: "Monetization content = massive shares", virality: 94 },
    { name: "Gaming Keyboard Mouse Under 2000", hashtags: ["#gamingperipherals","#budget","#gaming"], why: "Budget gear = purchase intent saves", virality: 85 },
  ],
  motivation: [
    { name: "Morning Routine that Changed My Life", hashtags: ["#morningroutine","#motivation","#discipline"], why: "Transformation hook = emotional shares", virality: 96 },
    { name: "Why You're Still Broke at 25", hashtags: ["#money","#motivation","#25yearold"], why: "Age-specific content = targeted virality", virality: 98 },
    { name: "Discipline Over Motivation", hashtags: ["#discipline","#mindset","#stoicism"], why: "Counter-narrative = debate shares", virality: 94 },
    { name: "Study Motivation for Students", hashtags: ["#study","#students","#motivation"], why: "Massive student audience in India", virality: 91 },
    { name: "1% Better Every Day", hashtags: ["#atomichabits","#habits","#selfimprovement"], why: "James Clear trend = proven viral", virality: 93 },
    { name: "Rich vs Wealthy Mindset", hashtags: ["#mindset","#wealth","#money"], why: "Mindset + money = double virality", virality: 95 },
    { name: "Stop Scrolling Start Building", hashtags: ["#productivity","#focus","#motivation"], why: "Meta content about social media = viral", virality: 97 },
    { name: "Lessons from Failure India", hashtags: ["#failure","#lessons","#entrepreneur"], why: "Vulnerable storytelling = saves", virality: 89 },
  ],
  business: [
    { name: "Start Business with 0 Investment", hashtags: ["#business","#startup","#zeroinvestment"], why: "Zero investment hook = massive clicks", virality: 97 },
    { name: "Freelancing for Beginners India", hashtags: ["#freelancing","#workfromhome","#india"], why: "WFH trend still massive post-COVID", virality: 93 },
    { name: "Instagram Business Strategy 2026", hashtags: ["#instagrammarketing","#business","#growth"], why: "Creators want to monetize = saves", virality: 95 },
    { name: "Business Ideas Under 1 Lakh", hashtags: ["#businessideas","#startup","#india"], why: "Actionable budget business = shares", virality: 96 },
    { name: "How to Get First Client India", hashtags: ["#freelance","#clients","#business"], why: "Specific pain point = high engagement", virality: 88 },
    { name: "Dropshipping India 2026", hashtags: ["#dropshipping","#ecommerce","#india"], why: "Online business curiosity is high", virality: 90 },
    { name: "LinkedIn Growth India Tips", hashtags: ["#linkedin","#networking","#career"], why: "Professional growth = saves + shares", virality: 87 },
    { name: "Women Entrepreneurs India", hashtags: ["#womenentrepreneur","#startup","#india"], why: "Rising women entrepreneur audience", virality: 92 },
  ],
};

function getMicroNiches(query: string): MicroNiche[] {
  const q = query.toLowerCase().trim();
  if (MICRO_NICHES[q]) return MICRO_NICHES[q];
  for (const [key, niches] of Object.entries(MICRO_NICHES)) {
    if (q.includes(key) || key.includes(q)) return niches;
  }
  return [
    { name: `Beginner's Guide to ${query}`, hashtags: [`#${q.replace(/\s/g,'')}`, "#beginners", "#india"], why: "Beginner content always gets saves", virality: 85 },
    { name: `${query} Tips for Indians`, hashtags: [`#${q.replace(/\s/g,'')}`, "#india", "#tips"], why: "India-specific content is underserved", virality: 88 },
    { name: `${query} in 2026 — What Changed`, hashtags: [`#${q.replace(/\s/g,'')}`, "#2026", "#trending"], why: "Year-specific content ranks well", virality: 87 },
    { name: `Top 5 ${query} Mistakes`, hashtags: [`#${q.replace(/\s/g,'')}`, "#mistakes", "#dontdothis"], why: "Mistake content = warning hook = clicks", virality: 92 },
    { name: `How I Went Viral with ${query}`, hashtags: [`#${q.replace(/\s/g,'')}`, "#viral", "#creator"], why: "Personal story + virality = trust", virality: 90 },
    { name: `${query} Secrets Nobody Tells You`, hashtags: [`#${q.replace(/\s/g,'')}`, "#secrets", "#truth"], why: "Secret hook = curiosity gap = clicks", virality: 94 },
    { name: `${query} for Complete Beginners`, hashtags: [`#${q.replace(/\s/g,'')}`, "#beginner", "#howto"], why: "Tutorial saves are algorithm gold", virality: 86 },
    { name: `${query} vs What You Think`, hashtags: [`#${q.replace(/\s/g,'')}`, "#myth", "#facts"], why: "Myth-busting = debate + shares", virality: 91 },
  ];
}

export default function TrendingDashboard() {
  const { user } = useAuth();
  const userNiche = user?.user_metadata?.niche || "General";
  const platform = (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram";
  const isIG = platform === "instagram";
  const ac = isIG ? IG : YT;
  const ag = isIG ? IG_GRAD : YT_GRAD;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"instagram" | "microniches">("instagram");
  const [searchQuery, setSearchQuery] = useState("");
  const [microNiches, setMicroNiches] = useState<MicroNiche[]>([]);
  const [microLoading, setMicroLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTopics("7d")
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : data.topics ?? [];
        const seen = new Set<string>();
        const unique = arr.filter((t: Topic) => {
          const key = t.name.toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setTopics(unique.sort((a: Topic, b: Topic) => (b.trend_score || 0) - (a.trend_score || 0)));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 1) {
      setMicroLoading(true);
      setHasSearched(true);
      setActiveTab("microniches");
      setTimeout(() => {
        setMicroNiches(getMicroNiches(q));
        setMicroLoading(false);
      }, 600);
    } else {
      setHasSearched(false);
      setMicroNiches([]);
      setActiveTab("instagram");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setHasSearched(false);
    setMicroNiches([]);
    setActiveTab("instagram");
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await new Promise(r => setTimeout(r, 600));
    setVisibleCount(c => c + PAGE_SIZE);
    setLoadingMore(false);
  };

  const handleGenerateScript = async (topic: any) => {
    setSelectedTopic(topic);
    setGenerating(true);
    setScript(null);
    setScriptOpen(true);
    try {
      const result = await generateScript({
        topic: topic.name,
        niche: userNiche,
        language: user?.user_metadata?.language || "hinglish",
        style: user?.user_metadata?.style || 'casual',
        platform: isIG ? "instagram" : "youtube",
      });
      setScript(result);
    } catch { setScript({ hook: "Failed to generate", body: "Please try again.", cta: "" }); }
    finally { setGenerating(false); }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const visibleTopics = topics.slice(0, visibleCount);
  const hasMore = visibleCount < topics.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: ac }} />
          <h1 className="text-lg font-bold text-foreground">Trending</h1>
          <div className="flex items-center gap-1 ml-auto text-xs text-muted-foreground">
            {isIG
              ? <><Instagram className="w-3.5 h-3.5" style={{ color: IG }}/> Instagram</>
              : <><Youtube className="w-3.5 h-3.5" style={{ color: YT }}/> YouTube</>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={searchQuery} onChange={e => handleSearch(e.target.value)}
            placeholder="Search niche for micro-niches (e.g. Fitness, Finance, Cricket)..."
            className="w-full pl-10 pr-9 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
            onFocus={e => { e.target.style.borderColor = `${ac}50`; }}
            onBlur={e => { e.target.style.borderColor = ''; }} />
          {searchQuery && (
            <button onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-card border border-border">
          <button onClick={() => { setActiveTab("instagram"); handleClearSearch(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
            style={activeTab === "instagram"
              ? { background: ag, color: "#fff" }
              : { color: "hsl(var(--muted-foreground))" }}>
            📸 Instagram Trends
          </button>
          <button onClick={() => setActiveTab("microniches")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
            style={activeTab === "microniches"
              ? { background: ag, color: "#fff" }
              : { color: "hsl(var(--muted-foreground))" }}>
            🔬 Micro Niches
          </button>
        </div>

        {/* ── INSTAGRAM TRENDS ── */}
        {activeTab === "instagram" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Trending Topics India 🇮🇳</p>
              <span className="text-xs text-muted-foreground">{topics.length} topics</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: ac }} />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {visibleTopics.map((topic, i) => {
                    const scoreLabel = getScoreLabel(topic.trend_score || topic.volume || 0);
                    return (
                      <motion.div key={topic.id || i}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (i % PAGE_SIZE) * 0.03 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border transition-all"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}30`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; }}>

                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                          style={{ background: i < 3 ? ag : `${ac}15`, color: i < 3 ? "#fff" : ac }}>
                          {i + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-foreground truncate">{topic.name}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${scoreLabel.color}`}>
                              {scoreLabel.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-0.5 text-xs ${momentumColor(topic.momentum)}`}>
                              <MomentumIcon momentum={topic.momentum} />{topic.momentum}
                            </span>
                            {topic.hashtags?.slice(0, 2).map((h, j) => (
                              <span key={j} className="text-xs text-muted-foreground">#{h.replace('#', '')}</span>
                            ))}
                          </div>
                        </div>

                        <button onClick={() => handleGenerateScript(topic)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-medium shrink-0"
                          style={{ background: ag }}>
                          <Sparkles className="w-3 h-3" /> Script
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ✅ Load More */}
                {hasMore && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleLoadMore} disabled={loadingMore}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60"
                    style={{ border: `1px solid ${ac}40`, color: ac, background: `${ac}08` }}>
                    {loadingMore
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Loading more...</>
                      : <><ChevronDown className="w-4 h-4" />Load More ({topics.length - visibleCount} remaining)</>}
                  </motion.button>
                )}

                {!hasMore && topics.length > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    ✅ All {topics.length} trending topics loaded
                  </p>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── MICRO NICHES ── */}
        {activeTab === "microniches" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {!hasSearched ? (
              <div className="py-8 text-center space-y-3">
                <Hash className="w-10 h-10 mx-auto text-muted-foreground opacity-40" />
                <p className="text-sm font-semibold text-foreground">Find Viral Micro Niches</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Type any niche above to discover specific sub-topics with high viral potential on {isIG ? "Instagram Reels" : "YouTube Shorts"}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {["Fitness", "Finance", "Cricket", "Tech", "Food", "Travel", "Gaming", "Motivation"].map(s => (
                    <button key={s} onClick={() => handleSearch(s)}
                      className="px-3 py-1.5 rounded-full text-xs border border-border bg-card text-muted-foreground transition-all"
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.color = ac; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.color = ''; }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : microLoading ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: ac }} />
                <p className="text-xs text-muted-foreground">Finding viral micro-niches for "{searchQuery}"...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Micro Niches for <span style={{ color: ac }}>"{searchQuery}"</span>
                  </p>
                  <span className="text-xs text-muted-foreground">{microNiches.length} found</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Specific sub-topics with highest viral potential on {isIG ? "Instagram Reels" : "YouTube Shorts"}
                </p>

                <div className="space-y-2">
                  {microNiches.map((niche, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-2xl p-4 bg-card border border-border transition-all"
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}30`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; }}>

                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: i < 3 ? ag : `${ac}15`, color: i < 3 ? "#fff" : ac }}>
                              {i + 1}
                            </div>
                            <p className="text-sm font-semibold text-foreground">{niche.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground ml-8">{niche.why}</p>
                        </div>
                        <div className="flex flex-col items-center shrink-0">
                          <span className="text-lg font-bold"
                            style={{ color: niche.virality >= 90 ? ac : niche.virality >= 80 ? "#22c55e" : "#f59e0b" }}>
                            {niche.virality}
                          </span>
                          <span className="text-xs text-muted-foreground">viral</span>
                        </div>
                      </div>

                      {/* Virality bar */}
                      <div className="w-full h-1.5 rounded-full bg-border mb-3">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${niche.virality}%` }}
                          transition={{ delay: i * 0.06 + 0.3, duration: 0.8 }}
                          className="h-1.5 rounded-full" style={{ background: ag }} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {niche.hashtags.map((h, j) => (
                            <span key={j} className="text-xs px-1.5 py-0.5 rounded-md"
                              style={{ background: `${ac}12`, color: ac }}>{h}</span>
                          ))}
                        </div>
                        <button onClick={() => handleGenerateScript(niche)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-medium shrink-0 ml-2"
                          style={{ background: ag }}>
                          <Sparkles className="w-3 h-3" /> Script
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Script modal */}
      <AnimatePresence>
        {scriptOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setScriptOpen(false)}>
            <motion.div initial={{ y: 50, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.96 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden"
              style={{ maxHeight: "85vh", overflowY: "auto" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: ac }} />
                  <p className="text-sm font-semibold text-foreground">{selectedTopic?.name}</p>
                </div>
                <button onClick={() => setScriptOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {generating ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: ac }} />
                    <p className="text-xs text-muted-foreground">Generating viral script...</p>
                  </div>
                ) : script ? (
                  <>
                    {[
                      { key: "hook", label: "🎯 Hook", content: script.hook, color: ac },
                      { key: "body", label: "📝 Body", content: script.body, color: "#22c55e" },
                      { key: "cta", label: "🚀 CTA", content: script.cta, color: "#f59e0b" },
                    ].map(s => (
                      <div key={s.key} className="rounded-2xl p-4 bg-background border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: s.color }}>{s.label}</p>
                          <button onClick={() => copyText(s.content, s.key)}>
                            {copied === s.key ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                          </button>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{s.content}</p>
                      </div>
                    ))}
                    <button onClick={() => copyText(`${script.hook}\n\n${script.body}\n\n${script.cta}`, 'all')}
                      className="w-full py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                      style={{ background: ag }}>
                      {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copy Full Script
                    </button>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}