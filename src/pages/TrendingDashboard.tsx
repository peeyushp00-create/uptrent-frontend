import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Minus,
  Sparkles, Loader2, Flame, BarChart2, Search, X,
  Copy, Check
} from "lucide-react";
import { getTopics, generateScript } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Topic {
  id?: string;
  name: string;
  volume: number;
  momentum: "rising" | "falling" | "stable";
  hashtags: string[];
  type?: string;
  trend_score?: number;
}

interface ScriptResult {
  hook: string;
  body: string;
  cta: string;
  duration_seconds?: number;
}

// ✅ Full micro niche keyword map from PDF
const nicheKeywords: Record<string, string[]> = {
  'Beauty & Makeup': ['skincare', 'makeup', 'beauty', 'drugstore', 'luxury beauty', 'glass skin', 'kbeauty', 'acne', 'antiaging', 'nail', 'eyebrow', 'waxing', 'vegan beauty', 'grwm', 'minimalist beauty', 'teen beauty'],
  'Fashion & Style': ['fashion', 'ootd', 'style', 'outfit', 'street style', 'thrift', 'luxury fashion', 'sustainable fashion', 'plussize', 'modest fashion', 'hijab', 'mens fashion', 'capsule wardrobe', 'budget fashion', 'vintage', 'ethnic wear', 'saree', 'athleisure', 'festival fashion'],
  'Fitness': ['fitness', 'gym', 'workout', 'weight loss', 'muscle', 'bodybuilding', 'yoga', 'pilates', 'calisthenics', 'running', 'marathon', 'hiit', 'cycling', 'crossfit', 'mobility', 'stretching', 'zumba', 'transformation', 'prenatal fitness', 'senior fitness'],
  'Food': ['food', 'recipe', 'cooking', 'meal prep', 'baking', 'dessert', 'healthy eating', 'vegan', 'keto', 'street food', 'restaurant', 'indian cuisine', 'comfort food', 'snack', 'smoothie', 'intermittent fasting', 'asmr cooking', 'food photography', 'budget cooking'],
  'Travel': ['travel', 'budget travel', 'luxury travel', 'solo travel', 'road trip', 'backpacking', 'hidden gems', 'domestic travel', 'international travel', 'travel hacks', 'hotel', 'resort', 'adventure travel', 'pilgrimage', 'beach', 'mountain', 'trekking', 'city guide', 'visa'],
  'Finance': ['finance', 'stock market', 'investing', 'mutual funds', 'sip', 'budgeting', 'saving', 'credit card', 'debt', 'fire', 'side hustle', 'passive income', 'crypto', 'web3', 'real estate investing', 'tax saving', 'insurance', 'financial literacy', 'nri finance', 'income tax', 'sensex', 'nifty', 'nse', 'bse', 'wealth'],
  'Business': ['business', 'startup', 'entrepreneur', 'freelancing', 'solopreneur', 'ecommerce', 'dropshipping', 'amazon', 'digital marketing', 'branding', 'linkedin', 'productivity', 'leadership', 'networking', 'bootstrapping', 'founder', 'women entrepreneur', 'b2b'],
  'Mental Health': ['mental health', 'anxiety', 'stress', 'depression', 'therapy', 'mindfulness', 'meditation', 'journalling', 'selfcare', 'burnout', 'sleep hygiene', 'emotional intelligence', 'boundaries', 'healing', 'adhd', 'breathwork', 'digital detox', 'manifestation', 'affirmations'],
  'Education': ['education', 'study', 'learning', 'upsc', 'jee', 'neet', 'cat', 'mba', 'exam', 'college', 'school', 'memory', 'book summary', 'current affairs', 'general knowledge', 'economics', 'law', 'scholarship', 'english speaking', 'language learning'],
  'Tech': ['tech', 'ai', 'chatgpt', 'artificial intelligence', 'coding', 'programming', 'gadget', 'smartphone', 'software', 'cybersecurity', 'app', 'laptop', 'smart home', 'wearable', 'electric vehicle', 'ev', 'space', 'no code', 'digital privacy'],
  'Entertainment': ['bollywood', 'movie', 'film', 'web series', 'netflix', 'ott', 'celebrity', 'memes', 'comedy', 'music', 'anime', 'kdrama', 'kpop', 'cricket commentary', 'ipl', 'sports news', 'award show'],
  'Comedy': ['comedy', 'relatable', 'pov', 'sketch', 'parody', 'humour', 'funny', 'sarcasm', 'roast', 'indian parent', 'office humour', 'relationship comedy', 'dark humour', 'trending audio'],
  'Photography': ['photography', 'dslr', 'mirrorless', 'portrait', 'landscape', 'street photography', 'food photography', 'product photography', 'lightroom', 'vsco', 'reels editing', 'colour grading', 'drone', 'cinematic', 'composition'],
  'Music': ['music', 'original music', 'cover song', 'guitar', 'piano', 'tabla', 'music production', 'beat making', 'classical music', 'indie music', 'singing', 'dj', 'mixing', 'bollywood music', 'folk music', 'lyrics'],
  'Art': ['art', 'digital art', 'illustration', 'sketching', 'watercolour', 'mandala', 'calligraphy', 'pottery', 'diy crafts', 'origami', 'canvas', 'acrylic painting', 'procreate', 'graffiti', 'jewellery making', 'resin', 'rangoli'],
  'Home Decor': ['home decor', 'interior design', 'small apartment', 'diy home', 'kitchen organisation', 'wardrobe', 'minimalist home', 'boho decor', 'indian home', 'room makeover', 'vastu', 'indoor gardening', 'cleaning', 'home office', 'festive decoration'],
  'Parenting': ['parenting', 'baby', 'toddler', 'parenting hacks', 'school readiness', 'kids education', 'single parenting', 'fatherhood', 'mom life', 'pregnancy', 'postpartum', 'teenagers', 'child psychology', 'joint family'],
  'Relationships': ['relationship', 'dating', 'long distance', 'marriage', 'relationship advice', 'toxic relationship', 'selflove', 'breakup', 'friendship', 'love languages', 'arranged marriage', 'red flags', 'divorce', 'lgbtq'],
  'Sustainability': ['sustainability', 'zero waste', 'eco friendly', 'climate change', 'veganism', 'plastic free', 'sustainable travel', 'urban gardening', 'upcycling', 'green energy', 'solar', 'composting', 'wildlife'],
  'Spirituality': ['spirituality', 'hinduism', 'islam', 'sikhism', 'christianity', 'buddhism', 'astrology', 'zodiac', 'tarot', 'manifestation', 'healing', 'meditation', 'temple', 'pilgrimage', 'mythology', 'reiki', 'crystal healing', 'numerology'],
  'Self Improvement': ['self improvement', 'morning routine', 'night routine', 'habit', 'discipline', 'consistency', 'reading', 'public speaking', 'confidence', 'goal setting', 'stoicism', 'minimalist', 'journalling', 'gratitude', '5am club', 'overcoming fear'],
  'Pets': ['pets', 'dog', 'cat', 'pet care', 'dog training', 'exotic pets', 'bird', 'aquarium', 'fish', 'pet nutrition', 'rescue', 'adoption', 'veterinary', 'pet photography', 'animal', 'stray animal'],
  'Sports': ['cricket', 'football', 'soccer', 'basketball', 'kabaddi', 'wrestling', 'athletics', 'badminton', 'tennis', 'chess', 'esports', 'bgmi', 'free fire', 'fantasy sports', 'dream11', 'sports motivation', 'athlete'],
  'Gaming': ['gaming', 'mobile gaming', 'bgmi', 'free fire', 'esports', 'game review', 'gaming setup', 'pc gaming', 'console', 'pubg', 'gaming tips'],
  'Career': ['career', 'resume', 'interview', 'linkedin', 'salary negotiation', 'internship', 'work life balance', 'remote work', 'switching careers', 'freshers', 'government job', 'freelance', 'skill development', 'certification'],
  'Real Estate': ['real estate', 'property', 'home loan', 'rera', 'property investment', 'rental', 'affordable housing', 'luxury real estate', 'nri property', 'smart city', 'vastu', 'plot', 'farmhouse'],
  'Automobiles': ['car', 'bike', 'electric vehicle', 'ev', 'car modification', 'road trip', 'driving tips', 'car buying', 'budget cars', 'luxury car', 'off road', 'auto news', 'car care', 'scooter', 'two wheeler', 'racing', 'motorsport'],
  'Lifestyle': ['lifestyle', 'day in my life', 'diml', 'morning routine', 'minimalist living', 'budget living', 'city life', 'village life', 'hostel life', 'college life', 'slow living', 'gratitude', 'aesthetic', 'expat life', 'nri life'],
  'Writing': ['writing', 'poetry', 'shayari', 'short stories', 'micro fiction', 'content writing', 'copywriting', 'blogging', 'newsletter', 'storytelling', 'spoken word', 'author life'],
  'Motivation': ['motivation', 'success', 'mindset', 'discipline', 'consistency', 'habit', 'morning routine', 'goal setting', 'stoicism', 'personal growth', 'confidence', 'hustle'],
  'Cricket': ['cricket', 'ipl', 'test match', 'odi', 't20', 'bcci', 'kohli', 'rohit', 'bumrah', 'india cricket', 'cricket commentary'],
  'Bollywood': ['bollywood', 'movie', 'film', 'actor', 'actress', 'netflix', 'ott', 'celebrity', 'box office', 'trailer', 'hindi film', 'releasing'],
  'Skincare': ['skincare', 'skin care', 'acne', 'glass skin', 'kbeauty', 'antiaging', 'natural beauty', 'cruelty free', 'moisturizer', 'sunscreen', 'serum'],
  'Yoga': ['yoga', 'meditation', 'wellness', 'mindfulness', 'pranayama', 'flexibility', 'asana', 'breathwork'],
  'Crypto': ['crypto', 'bitcoin', 'ethereum', 'web3', 'blockchain', 'defi', 'nft', 'cryptocurrency'],
  'General': ['trending', 'viral', 'india', 'news', 'latest', 'today', 'popular'],
};

export default function TrendingDashboard() {
  const { user } = useAuth();
  const userNiche = user?.user_metadata?.niche || 'General';
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forYou' | 'all'>('forYou');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    getTopics("7d")
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : data.topics ?? [];
        const sorted = arr.sort((a: Topic, b: Topic) =>
          (b.trend_score || 0) - (a.trend_score || 0)
        );
        setTopics(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Match user niche to keywords — check exact match and partial match
  const getKeywordsForNiche = (niche: string): string[] => {
    // Direct match
    if (nicheKeywords[niche]) return nicheKeywords[niche];
    // Partial match
    for (const [key, keywords] of Object.entries(nicheKeywords)) {
      if (key.toLowerCase().includes(niche.toLowerCase()) ||
          niche.toLowerCase().includes(key.toLowerCase())) {
        return keywords;
      }
    }
    return [niche.toLowerCase()];
  };

  const keywords = getKeywordsForNiche(userNiche);

  const forYouTopics = topics.filter(t =>
    keywords.some(keyword =>
      t.name.toLowerCase().includes(keyword) ||
      t.hashtags?.some(h => h.toLowerCase().includes(keyword))
    )
  );

  const baseTopics = activeTab === 'forYou' && forYouTopics.length > 0
    ? forYouTopics
    : topics;

  const displayTopics = searchQuery.trim()
  ? baseTopics.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const name = t.name.toLowerCase();
      const hashtags = t.hashtags?.map(h => h.toLowerCase()) || [];

      // ✅ For short terms (2 chars or less), match whole word only
      if (q.length <= 2) {
        const wordBoundary = new RegExp(`\\b${q}\\b`, 'i');
        return wordBoundary.test(name) || hashtags.some(h => wordBoundary.test(h));
      }
      return name.includes(q) || hashtags.some(h => h.includes(q));
    })
  : baseTopics;

  const handleGenerate = (topic: Topic) => {
    setSelectedTopic(topic);
    setGenerating(true);
    setScript(null);
    setScriptOpen(true);
    generateScript(topic.id || topic.name, user?.user_metadata?.niche, user?.user_metadata?.language)
      .then((data: any) => {
        setScript({ hook: data.hook ?? "", body: data.body ?? "", cta: data.cta ?? "", duration_seconds: data.duration_seconds });
      })
      .catch(() => toast.error("Failed to generate script"))
      .finally(() => setGenerating(false));
  };

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    toast.success(`${section} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    if (!script) return;
    const full = `HOOK:\n${script.hook}\n\nBODY:\n${script.body}\n\nCTA:\n${script.cta}`;
    navigator.clipboard.writeText(full);
    setCopied('all');
    toast.success('Full script copied!');
    setTimeout(() => setCopied(null), 2000);
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-500" />
            <h1 className="text-lg font-bold text-foreground">Trending</h1>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-500 text-xs font-medium">
            <Flame className="w-3 h-3" />
            Live
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trending topics..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-card rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'forYou' ? 'text-white shadow-sm' : 'text-muted-foreground'
            }`}
            style={activeTab === 'forYou' ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
          >
            For You ({forYouTopics.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'all' ? 'text-white shadow-sm' : 'text-muted-foreground'
            }`}
            style={activeTab === 'all' ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
          >
            All Topics ({topics.length})
          </button>
        </div>

        {/* Results count */}
        {searchQuery && !loading && (
          <p className="text-xs text-muted-foreground px-1">
            {displayTopics.length} results for "{searchQuery}"
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
          </div>
        )}

        {/* Topics list */}
        {!loading && (
          <div className="space-y-2 pb-24">
            {displayTopics.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? `No topics found for "${searchQuery}"` : "No trending topics yet."}
                </p>
              </div>
            )}
            {displayTopics.map((topic, i) => {
              const scoreInfo = topic.trend_score ? getScoreLabel(topic.trend_score) : null;
              return (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-pink-500/30 transition-all active:scale-[0.99]"
                >
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{topic.name}</span>
                      {scoreInfo && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${scoreInfo.color}`}>
                          {scoreInfo.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{topic.volume} posts</span>
                      <span className={`text-xs flex items-center gap-0.5 ${momentumColor(topic.momentum)}`}>
                        <MomentumIcon momentum={topic.momentum} />
                        {topic.momentum}
                      </span>
                      {topic.trend_score !== undefined && topic.trend_score > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <BarChart2 className="w-3 h-3" />
                          {topic.trend_score}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {topic.hashtags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-lg bg-accent text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Script button */}
                  <button
                    onClick={() => handleGenerate(topic)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-white text-xs font-medium shrink-0"
                    style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Script
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom sheet script panel */}
      <AnimatePresence>
        {scriptOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setScriptOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-4 pb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-foreground">Script</h2>
                    <p className="text-xs text-muted-foreground">{selectedTopic?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {script && (
                      <button
                        onClick={copyAll}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copied === 'all' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        Copy All
                      </button>
                    )}
                    <button onClick={() => setScriptOpen(false)} className="p-2 rounded-xl hover:bg-accent transition-colors">
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {generating && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    <p className="text-sm text-muted-foreground">Generating script...</p>
                  </div>
                )}

                {!generating && script && (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">🎣 Hook</span>
                        <button onClick={() => copyText(script.hook, "Hook")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          {copied === 'Hook' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} Copy
                        </button>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{script.hook}</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">📝 Body</span>
                        <button onClick={() => copyText(script.body, "Body")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          {copied === 'Body' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} Copy
                        </button>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{script.body}</p>
                    </div>

                    <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-400">📣 CTA</span>
                        <button onClick={() => copyText(script.cta, "CTA")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          {copied === 'CTA' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} Copy
                        </button>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{script.cta}</p>
                    </div>

                    {script.duration_seconds && (
                      <p className="text-xs text-muted-foreground text-center">~{script.duration_seconds} seconds</p>
                    )}

                    <button
                      onClick={() => selectedTopic && handleGenerate(selectedTopic)}
                      className="w-full py-3 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Another
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}