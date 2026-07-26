import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2, X, Search, RefreshCw, TrendingUp, Sparkles, AlertTriangle, ArrowUpRight, SlidersHorizontal, Calendar, FileText, ArrowUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';
import { getPageState, setPageState } from '@/lib/pageCache';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PRIMARY = "hsl(var(--primary))";
const SECONDARY = "hsl(var(--primary))";
const PRIMARY_GRAD = "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--ring)))";
const PRIMARY_CONTAINER = "hsl(var(--secondary))";
const SECONDARY_CONTAINER = "hsl(var(--primary) / 0.5)";

interface NewsArticle {
  id?: string;
  title?: string;
  headline?: string;
  summary?: string;
  source?: string;
  published_at?: string;
  topic?: string;
  url?: string;
  image_url?: string;
}

interface TrendingTopic {
  topic: string;
  count: number;
  emoji: string;
}

const TOPIC_EMOJIS: Record<string, string> = {
  Finance: "📈", StockMarket: "📊", MutualFunds: "💰", Crypto: "🪙",
  PersonalFinance: "💵", Tech: "💻", AINews: "🤖", Sports: "🏏",
  Bollywood: "🎬", Business: "💼", Fitness: "💪",
  WeightLoss: "🔥", Travel: "✈️", Food: "🍳", Gaming: "🎮",
  Education: "📚", Fashion: "👗", Motivation: "🚀", Skincare: "✨",
  Yoga: "🧘", Comedy: "😂", RealEstate: "🏠", Jobs: "💼",
};

const DATE_FILTERS = [
  { label: "Today", value: "today", desc: "Last 24 hours" },
  { label: "Yesterday", value: "yesterday", desc: "24–48 hrs ago" },
  { label: "All", value: "all", desc: "Last 7 days" },
];

const NICHE_TOPIC_MAP: Record<string, string> = {
  finance: "Finance", "stock market": "StockMarket", crypto: "Crypto",
  fitness: "Fitness", yoga: "Yoga", tech: "Tech", ai: "AINews",
  business: "Business", cricket: "Sports", ipl: "Sports", sports: "Sports",
  bollywood: "Bollywood", travel: "Travel", food: "Food",
  gaming: "Gaming", education: "Education", fashion: "Fashion",
  motivation: "Motivation", skincare: "Skincare",
};

const NICHE_TO_TOPIC: Record<string, string> = {
  "Finance": "Finance", "Fitness": "Fitness", "Tech": "Tech",
  "Sports": "Sports", "Bollywood": "Bollywood", "Business": "Business",
  "Food": "Food", "Travel": "Travel", "Gaming": "Gaming",
  "Education": "Education", "Fashion": "Fashion", "Motivation": "Motivation",
  "Skincare": "Skincare", "Yoga": "Yoga", "Crypto": "Crypto",
  "Comedy": "Comedy", "Other": "Business",
};

const TOPIC_IMAGES: Record<string, string[]> = {
  Finance:       ['photo-1611974789855-9c2a0a7236a3','photo-1590283603385-17ffb3a7f29f','photo-1579532537598-459ecdaf39cc','photo-1460925895917-afdab827c52f','photo-1579621970563-ebec7560ff3e','photo-1450101499163-c8848c66ca85','photo-1554224155-6726b3ff858f','photo-1642543348745-03b1219733d9','photo-1535320903710-d993d3d77d29','photo-1556742044-3c52d6e88c62'],
  StockMarket:   ['photo-1611974789855-9c2a0a7236a3','photo-1590283603385-17ffb3a7f29f','photo-1535320903710-d993d3d77d29','photo-1642543348745-03b1219733d9','photo-1579532537598-459ecdaf39cc','photo-1460925895917-afdab827c52f','photo-1518186285414-e5938b9b9b9b','photo-1579621970563-ebec7560ff3e','photo-1508780709619-79562169bc64','photo-1563986768609-322da13575f3'],
  MutualFunds:   ['photo-1579532537598-459ecdaf39cc','photo-1460925895917-afdab827c52f','photo-1611974789855-9c2a0a7236a3','photo-1590283603385-17ffb3a7f29f','photo-1450101499163-c8848c66ca85','photo-1554224155-6726b3ff858f','photo-1579621970563-ebec7560ff3e','photo-1556742044-3c52d6e88c62','photo-1640340434855-6084b1f4901c','photo-1642543348745-03b1219733d9'],
  Crypto:        ['photo-1518546305927-5a555bb7020d','photo-1622630998477-20aa696ecb05','photo-1639762681485-074b7f938ba0','photo-1642790551116-18e150f248e3','photo-1640826514546-7b56b1b69258','photo-1622633154843-0a5adf5a7b45','photo-1559526324-4b87b5e36e44','photo-1516245834210-c4c142787335','photo-1629339942248-45d4b10c8c2f','photo-1605792657660-596af9009e82'],
  PersonalFinance:['photo-1579621970563-ebec7560ff3e','photo-1450101499163-c8848c66ca85','photo-1554224155-6726b3ff858f','photo-1556742044-3c52d6e88c62','photo-1611974789855-9c2a0a7236a3','photo-1579532537598-459ecdaf39cc','photo-1460925895917-afdab827c52f','photo-1590283603385-17ffb3a7f29f','photo-1642543348745-03b1219733d9','photo-1508780709619-79562169bc64'],
  Tech:          ['photo-1677442135703-1787eea5ce01','photo-1518770660439-4636190af475','photo-1531297484001-80022131f5a1','photo-1504384308090-c894fdcc538d','photo-1550751827-4bd374c3f58b','photo-1593642632559-0c6d3fc62b89','photo-1563770660941-20978e870e26','photo-1498050108023-c5249f4df085','photo-1451187580459-43490279c0fa','photo-1484417894907-623942c8ee29'],
  AINews:        ['photo-1677442135703-1787eea5ce01','photo-1620712943543-bcc4688e7485','photo-1655720828018-edd2daec9349','photo-1676401869516-7e935b3fec35','photo-1531297484001-80022131f5a1','photo-1550751827-4bd374c3f58b','photo-1485827404703-89b55fcc595e','photo-1488229297570-58520851e868','photo-1526374965328-7f61d4dc18c5','photo-1507146153580-69a1fe6d8aa1'],
  Sports:        ['photo-1540747913346-19e32dc3e97e','photo-1461896836934-ffe607ba8211','photo-1517649763962-0c623066013b','photo-1574629810360-7efbbe195018','photo-1486286701208-1d58e9338013','photo-1511886929837-354d827aae26','photo-1530549387789-4c1017266635','photo-1471295253337-3ceaaedca402','photo-1580748141549-71748dbe0bdc','photo-1459865264687-595d652de67e'],
  Bollywood:     ['photo-1489599849927-2ee91cede3ba','photo-1478720568477-152d9b164e26','photo-1524985069026-dd778a71c7b4','photo-1615986201152-7686a4867f30','photo-1517604931442-7e0c8ed2963c','photo-1440404653325-ab127d49abc1','photo-1485846234645-a62644f84728','photo-1489599849927-2ee91cede3ba','photo-1598899134739-24c46f58b8c0','photo-1574267432553-4b4628081c31'],
  Business:      ['photo-1507003211169-0a1dd7228f2d','photo-1454165804606-c3d57bc86b40','photo-1486406146926-c627a92ad1ab','photo-1664575600796-ffa828c5cb6e','photo-1553484771-371a605b060b','photo-1497366216548-37526070297c','photo-1542744173-8e7e53415bb0','photo-1560179707-f14e90ef3623','photo-1520607162513-77705c0f0d4a','photo-1516321165247-4aa89a48be87'],
  Fitness:       ['photo-1534438327276-14e5300c3a48','photo-1571019613454-1cb2f99b2d8b','photo-1517836357463-d25dfeac3438','photo-1490645935967-10de6ba17061','photo-1526506118085-60ce8714f8c5','photo-1583454110551-21f2fa2afe61','photo-1574680178050-55c6a6a96e0a','photo-1549576490-b0b4831ef60a','photo-1518310383802-640c2de311b2','photo-1567491922879-2d72f4f44dba'],
  WeightLoss:    ['photo-1571019613454-1cb2f99b2d8b','photo-1534438327276-14e5300c3a48','photo-1490645935967-10de6ba17061','photo-1544367567-0f2fcb009e0b','photo-1526506118085-60ce8714f8c5','photo-1517836357463-d25dfeac3438','photo-1583454110551-21f2fa2afe61','photo-1574680178050-55c6a6a96e0a','photo-1549576490-b0b4831ef60a','photo-1518310383802-640c2de311b2'],
  Travel:        ['photo-1476514525535-07fb3b4ae5f1','photo-1501854140801-50d01698950b','photo-1488646953014-85cb44e25828','photo-1503220317375-aaad61436b1b','photo-1469854523086-cc02fe5d8800','photo-1530521954074-e64f6810b32d','photo-1436491865332-7a61a109cc05','photo-1500835556837-99ac94a94552','photo-1504150558240-0b4fd8946624','photo-1508009603885-50cf7c579365'],
  Food:          ['photo-1504674900247-0877df9cc836','photo-1546069901-ba9599a7e63c','photo-1555396273-367ea4eb4db5','photo-1565299624946-b28f40a0ae38','photo-1567620905732-2d1ec7ab7445','photo-1540189549336-e6e99c3679fe','photo-1476224203421-9ac39bcb3327','photo-1512621776951-a57141f2eefd','photo-1498837167922-ddd27525d352','photo-1490645935967-10de6ba17061'],
  Gaming:        ['photo-1542751371-adc38448a05e','photo-1493711662062-fa541adb3fc8','photo-1559963110-71b394e7494d','photo-1518644961665-ed172691aaa1','photo-1511512578047-dfb367046420','photo-1593305841991-05c297ba4575','photo-1538481199705-c710c4e965fc','photo-1550745165-9bc0b252726f','photo-1600861194942-f883de0dfe96','photo-1612287230202-1ff1d85d1bdf'],
  Education:     ['photo-1503676260728-1c00da094a0b','photo-1456513080510-7bf3a84b82f8','photo-1522202176988-66273c2fd55f','photo-1571260899304-425eee4c7efc','photo-1524178232363-1fb2b075b655','photo-1434030216411-0b793f4b4173','photo-1488190211105-8b0e65b80b4e','photo-1516321497487-e288fb19713f','photo-1507537297725-24a1c029d3ca','photo-1509062522246-3755977927d7'],
  Fashion:       ['photo-1558618666-fcd25c85cd64','photo-1469334031218-e382a71b716b','photo-1483985988355-763728e1935b','photo-1445205170230-053b83016050','photo-1515886657613-9f3515b0c78f','photo-1509631179647-0177331693ae','photo-1539109136881-3be0616acf4b','photo-1496747611176-843222e1e57c','photo-1549298916-b41d501d3773','photo-1567401893414-76b7b1e5a7a5'],
  Motivation:    ['photo-1519834785169-98be25ec3f84','photo-1499728603263-13726abce5fd','photo-1548506651-e329ed07a75f','photo-1593642632559-0c6d3fc62b89','photo-1541534741688-6078c6bfb5c5','photo-1507608616759-54f48f0af0ee','photo-1552664730-d307ca884978','photo-1485182708500-e8f083eb6ca3','photo-1504805572947-34fad45aed93','photo-1475483768296-6163e08872a1'],
  Skincare:      ['photo-1556228578-0d85b1a4d571','photo-1596755389378-c31d21fd1273','photo-1570172619644-dfd03ed5d881','photo-1552693673-1bf958298935','photo-1598440947619-2c35fc9aa908','photo-1616394584738-fc6e612e71b9','photo-1607748851687-ba9a10438d62','photo-1512290923902-8a9f81dc236c','photo-1522335789203-aabd1fc54bc9','photo-1571781926291-c477ebfd024b'],
  Yoga:          ['photo-1506126613408-eca07ce68773','photo-1545205597-3d9d02c29597','photo-1599901860904-17e6ed7083a0','photo-1575052814086-f385e2e2ad1b','photo-1588286840104-8957b019727f','photo-1593811167562-9cef47bfc4d7','photo-1600618528240-fb9fc964b853','photo-1508672019048-805c876b67e2','photo-1519415943484-9fa1873496d4','photo-1544367567-0f2fcb009e0b'],
  Comedy:        ['photo-1527224857830-43a7acc85260','photo-1516280440614-37939bbacd81','photo-1543465077-db45d34b88a5','photo-1489278353717-f64c6ee8a4d2','photo-1584824486509-112e4181ff6b','photo-1560250097-0b93528c311a','photo-1512917774080-9991f1c4c750','photo-1503095396549-807759245b35','photo-1519682337058-a94d519337bc','photo-1524309309929-6786f0ca6048'],
  RealEstate:    ['photo-1560518883-ce09059eeffa','photo-1570129477492-45c003edd2be','photo-1448630360428-65456885c650','photo-1512917774080-9991f1c4c750','photo-1582407947304-fd86f028f716','photo-1558618666-fcd25c85cd64','photo-1464082354059-27db6ce50048','photo-1516156008625-3a9d6067fab5','photo-1524813686514-a57563d77965','photo-1494526585095-c41746248156'],
  Jobs:          ['photo-1507003211169-0a1dd7228f2d','photo-1454165804606-c3d57bc86b40','photo-1521737852567-6949f3f9f2b5','photo-1499750310107-5fef28a66643','photo-1553484771-371a605b060b','photo-1516321165247-4aa89a48be87','photo-1486312338219-ce68d2c6f44d','photo-1542744173-8e7e53415bb0','photo-1497366216548-37526070297c','photo-1560179707-f14e90ef3623'],
};

const GENERIC_IMAGES = [
  'photo-1504711434969-e33886168f5c','photo-1495020689067-958852a7765e',
  'photo-1504465073898-4d85a65c61d1','photo-1557858310-9052820906f7',
  'photo-1585829365295-ab7cd400c167','photo-1504711434969-e33886168f5c',
  'photo-1488229297570-58520851e868','photo-1504711434969-e33886168f5c',
];

function getCategoryImage(headline: string, topic?: string, seed?: string): string {
  const pool = (topic && TOPIC_IMAGES[topic]) || (() => {
    const h = headline.toLowerCase();
    if (h.includes('cricket') || h.includes('sports') || h.includes('match')) return TOPIC_IMAGES.Sports;
    if (h.includes('fitness') || h.includes('workout')) return TOPIC_IMAGES.Fitness;
    if (h.includes('ai') || h.includes('tech')) return TOPIC_IMAGES.Tech;
    if (h.includes('bollywood') || h.includes('movie')) return TOPIC_IMAGES.Bollywood;
    if (h.includes('travel')) return TOPIC_IMAGES.Travel;
    if (h.includes('food') || h.includes('recipe')) return TOPIC_IMAGES.Food;
    if (h.includes('stock') || h.includes('finance') || h.includes('market')) return TOPIC_IMAGES.Finance;
    if (h.includes('crypto') || h.includes('bitcoin')) return TOPIC_IMAGES.Crypto;
    if (h.includes('gaming') || h.includes('game')) return TOPIC_IMAGES.Gaming;
    return GENERIC_IMAGES;
  })();
  const key = seed || headline;
  const idx = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % pool.length;
  return `https://images.unsplash.com/${pool[idx]}?w=600&auto=format&fit=crop`;
}

const getTimeAgo = (dateStr: string, t: any) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return `${Math.floor(diff / 86400)}d ago`;
};

const extractKeyPoints = (summary: string): string[] => {
  if (!summary) return [];
  const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 3).map(s => s.trim());
};

const getImpact = (topic: string, summary: string): { level: 'high' | 'medium' | 'low'; text: string } => {
  const s = (summary || '').toLowerCase();
  const highImpactWords = ['record', 'historic', 'crash', 'surge', 'ban', 'new high', 'new low', 'billion', 'million', 'major'];
  const isHigh = highImpactWords.some(w => s.includes(w));
  if (topic === 'Finance' || topic === 'StockMarket' || topic === 'Crypto') {
    if (isHigh) return { level: 'high', text: 'Major market movement — content about this could go viral in finance niche' };
    return { level: 'medium', text: 'Good finance content opportunity — your audience will want to know about this' };
  }
  if (topic === 'Sports') {
    if (isHigh) return { level: 'high', text: 'Big sports news — perfect timing for reaction/analysis Reels' };
    return { level: 'medium', text: 'Sports update — good for engagement with sports audience' };
  }
  if (topic === 'Tech' || topic === 'AINews') {
    if (isHigh) return { level: 'high', text: 'Major tech development — explainer content will get high views' };
    return { level: 'medium', text: 'Tech update — your audience will appreciate a quick breakdown' };
  }
  if (isHigh) return { level: 'high', text: 'High impact story — create content around this now for maximum reach' };
  return { level: 'medium', text: 'Relevant update for your niche — good content opportunity' };
};

export default function NewsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const initialQuery = (location.state as any)?.query || "";
  const userNiches: string[] = user?.user_metadata?.niches || (user?.user_metadata?.niche ? [user.user_metadata.niche] : []);

  const _saved = getPageState('news');

  const [articles, setArticles] = useState<NewsArticle[]>(_saved?.articles ?? []);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>(_saved?.allArticles ?? []);
  const [loading, setLoading] = useState(!_saved?.articles?.length);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchInput, setSearchInput] = useState(_saved?.searchInput ?? initialQuery);
  const [query, setQuery] = useState(_saved?.query ?? initialQuery);
  const [dateFilter, setDateFilter] = useState(_saved?.dateFilter ?? "today");
  const [trendingFilter, setTrendingFilter] = useState<string | null>(_saved?.trendingFilter ?? null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState<string | null>(_saved?.customDate ?? null);
  const [pickerDay, setPickerDay] = useState('');
  const [pickerMonth, setPickerMonth] = useState('');
  const [pickerYear, setPickerYear] = useState('');
  const [activeCategory, setActiveCategory] = useState(_saved?.activeCategory ?? 'All News');
  const [region, setRegion] = useState<'in' | 'global'>(_saved?.region ?? 'in');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Page-state persistence ──
  const _stateRef = useRef<any>({});
  useEffect(() => {
    _stateRef.current = { articles, allArticles, searchInput, query, dateFilter, trendingFilter, customDate, activeCategory, region };
  });
  useEffect(() => () => { setPageState('news', _stateRef.current); }, []);

  const trendingTopics = useMemo<TrendingTopic[]>(() => {
    const counts: Record<string, number> = {};
    allArticles.forEach(a => { if (a.topic) counts[a.topic] = (counts[a.topic] || 0) + 1; });
    const userTopics = userNiches.map(n => NICHE_TO_TOPIC[n] || n).filter(Boolean);
    return Object.entries(counts)
      .filter(([topic]) => userTopics.length === 0 || userTopics.some(t => t.toLowerCase() === topic.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic, count]) => ({ topic, count, emoji: TOPIC_EMOJIS[topic] || '📰' }));
  }, [allArticles, userNiches]);

  const fetchNews = async (filter: string, topicQuery?: string, trending?: string | null, date?: string, regionOverride?: 'in' | 'global') => {
    setLoading(true); setError(null);
    try {
      const activeRegion = regionOverride || region;
      let url = `${BASE}/api/news?filter=${filter}&region=${activeRegion}`;
      if (date) url += `&date=${date}`;
      const activeQuery = trending || topicQuery;
      if (activeQuery) {
        const q = activeQuery.toLowerCase().trim();
        let topicId = activeQuery;
        for (const [niche, topic] of Object.entries(NICHE_TOPIC_MAP)) {
          if (niche === q || niche.includes(q) || q.includes(niche)) { topicId = topic; break; }
        }
        url += `&topicId=${encodeURIComponent(topicId)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      let list = Array.isArray(data) ? data : [];
      if (!activeQuery && userNiches.length > 0) {
        const userTopics = userNiches.map(n => NICHE_TO_TOPIC[n] || n).filter(Boolean);
        const nicheFiltered = list.filter((a: NewsArticle) =>
          userTopics.some(t => a.topic?.toLowerCase() === t.toLowerCase())
        );
        if (nicheFiltered.length >= 3) list = nicheFiltered;
      }
      const sorted = list.sort((a: NewsArticle, b: NewsArticle) =>
        new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
      );
      setArticles(sorted);
      if (!activeQuery) setAllArticles(sorted);
    } catch { setError(t('common.error')); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetch(`${BASE}/api/news?filter=today&region=${region}`)
      .then(r => r.json()).then(data => setAllArticles(Array.isArray(data) ? data : [])).catch(() => {});
  }, [region]);

  useEffect(() => { fetchNews(dateFilter, initialQuery || undefined, null); }, []);

  useEffect(() => {
    if (searchInput.trim().length > 0) {
      const filtered = Object.keys(NICHE_TOPIC_MAP)
        .filter(s => s.includes(searchInput.toLowerCase()) && s !== searchInput.toLowerCase())
        .map(s => s.charAt(0).toUpperCase() + s.slice(1)).slice(0, 6);
      setDropdownSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else { setShowDropdown(false); setDropdownSuggestions([]); }
  }, [searchInput]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q); setSearchInput(q); setShowDropdown(false);
    setTrendingFilter(null); setCustomDate(null);
    fetchNews(dateFilter, q || undefined, null);
  };

  const handleDateFilter = (filter: string) => {
    setDateFilter(filter); setCustomDate(null);
    fetchNews(filter, query || undefined, trendingFilter);
  };

  const handleTrendingFilter = (topic: string) => {
    if (trendingFilter === topic) {
      setTrendingFilter(null); setQuery(''); setSearchInput('');
      fetchNews(dateFilter, undefined, null);
    } else {
      setTrendingFilter(topic); setQuery(''); setSearchInput('');
      fetchNews(dateFilter, undefined, topic);
    }
  };

  const handleRegionChange = (newRegion: 'in' | 'global') => {
    if (newRegion === region) return;
    setRegion(newRegion);
    setTrendingFilter(null); setQuery(''); setSearchInput(''); setCustomDate(null);
    fetchNews(dateFilter, undefined, null, undefined, newRegion);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews(dateFilter, query || undefined, trendingFilter, customDate || undefined);
    setRefreshing(false);
  };

  const handleGenerateScript = (article: NewsArticle) => {
    const headline = article.title || article.headline || '';
    const prompt = `Write a short-form video script based on this news: "${headline}". ${article.summary ? `Context: ${article.summary}` : ''}`;
    navigate('/scripts', { state: { prompt } });
  };

  const impactData = selectedArticle ? getImpact(selectedArticle.topic || '', selectedArticle.summary || '') : null;
  const keyPoints = selectedArticle ? extractKeyPoints(selectedArticle.summary || '') : [];

  const filterLabel = customDate
    ? new Date(customDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : DATE_FILTERS.find(f => f.value === dateFilter)?.label || t('news.today');

  return (
    <div className={`theme-redesign ${theme} min-h-screen bg-background text-foreground`}>
      <SEO title="News — SocialRum" noindex />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-xl text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('news.title')}
          </h1>
          {userNiches.length > 0 && !query && !trendingFilter && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
              For You
            </span>
          )}
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary dark:hover:bg-gray-800 transition-colors disabled:opacity-40">
          <RefreshCw className={`w-5 h-5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-4 pb-28 space-y-4">

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input ref={inputRef} type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(searchInput); }}
              onFocus={() => { if (dropdownSuggestions.length > 0) setShowDropdown(true); }}
              placeholder={t('common.search') + ' topics...'}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {searchInput && (
              <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
            {showDropdown && dropdownSuggestions.length > 0 && (
              <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-card border border-input rounded-xl shadow-lg z-50 overflow-hidden">
                {dropdownSuggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSearch(s)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary text-left">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter button */}
          <div className="relative">
            <button onClick={() => setShowFilterMenu(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-input bg-card text-sm font-medium text-foreground hover:border-primary transition-colors whitespace-nowrap"
              style={(dateFilter !== 'today' || customDate) ? { borderColor: PRIMARY, color: PRIMARY } : {}}>
              <SlidersHorizontal className="w-4 h-4" />
              {filterLabel}
            </button>
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-1 bg-card border border-input rounded-xl shadow-lg z-50 overflow-hidden min-w-[200px]">
                {DATE_FILTERS.map(f => (
                  <button key={f.value}
                    onClick={(e) => { e.stopPropagation(); handleDateFilter(f.value); setShowFilterMenu(false); setShowDatePicker(false); }}
                    className="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-secondary text-left gap-4"
                    style={dateFilter === f.value && !customDate ? { color: PRIMARY } : { color: 'hsl(var(--foreground))' }}>
                    <span className="font-medium">{f.label}</span>
                    <span className="text-xs text-muted-foreground">{f.desc}</span>
                    {dateFilter === f.value && !customDate && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRIMARY }} />}
                  </button>
                ))}
                <div className="border-t border-border" />
                <button onClick={(e) => { e.stopPropagation(); setShowDatePicker(prev => !prev); }}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-secondary"
                  style={customDate ? { color: PRIMARY } : { color: 'hsl(var(--foreground))' }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{customDate ? filterLabel : 'Pick a Date'}</span>
                  </div>
                  {customDate && <div className="w-1.5 h-1.5 rounded-full" style={{ background: PRIMARY }} />}
                </button>
                {showDatePicker && (
                  <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border" onClick={e => e.stopPropagation()}>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Day</p>
                        <select value={pickerDay} onChange={e => setPickerDay(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-input bg-card text-sm outline-none">
                          <option value="">DD</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                            <option key={d} value={String(d).padStart(2, '0')}>{String(d).padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Month</p>
                        <select value={pickerMonth} onChange={e => setPickerMonth(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-input bg-card text-sm outline-none">
                          <option value="">MM</option>
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                            <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Year</p>
                        <select value={pickerYear} onChange={e => setPickerYear(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-input bg-card text-sm outline-none">
                          <option value="">YYYY</option>
                          {[2025, 2026].map(y => <option key={y} value={String(y)}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCustomDate(null); setPickerDay(''); setPickerMonth(''); setPickerYear(''); setDateFilter('today'); setShowDatePicker(false); setShowFilterMenu(false); fetchNews('today', query || undefined, trendingFilter); }}
                        className="flex-1 py-2 rounded-lg border border-input text-xs text-muted-foreground hover:text-foreground">
                        Reset
                      </button>
                      <button onClick={() => {
                        if (!pickerDay || !pickerMonth || !pickerYear) return;
                        const dateStr = `${pickerYear}-${pickerMonth}-${pickerDay}`;
                        setCustomDate(dateStr); setDateFilter('custom');
                        setShowDatePicker(false); setShowFilterMenu(false);
                        fetchNews('custom', undefined, null, dateStr);
                      }} disabled={!pickerDay || !pickerMonth || !pickerYear}
                        className="flex-1 py-2 rounded-lg text-white text-xs font-medium disabled:opacity-40"
                        style={{ background: PRIMARY_GRAD }}>
                        Show News
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Region toggle */}
        <div className="flex gap-1.5">
          <button onClick={() => handleRegionChange('in')}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={region === 'in' ? { background: PRIMARY, color: '#fff' } : { background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
            🇮🇳 India
          </button>
          <button onClick={() => handleRegionChange('global')}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={region === 'global' ? { background: PRIMARY, color: '#fff' } : { background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
            🌍 Global
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {trendingTopics.length > 0 ? (
            <>
              <button
                onClick={() => { setTrendingFilter(null); setQuery(''); setSearchInput(''); fetchNews(dateFilter, undefined, null); }}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={!trendingFilter ? { background: PRIMARY, color: '#fff' } : { background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
                {t('news.all')}
              </button>
              {trendingTopics.map(tt => (
                <button key={tt.topic} onClick={() => handleTrendingFilter(tt.topic)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={trendingFilter === tt.topic ? { background: PRIMARY, color: '#fff' } : { background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
                  {tt.emoji} {tt.topic}
                </button>
              ))}
            </>
          ) : (
            ['All News', 'Finance', 'Tech', 'Sports', 'Bollywood', 'Fitness'].map(cat => (
              <button key={cat}
                onClick={() => { setActiveCategory(cat); if (cat !== 'All News') handleTrendingFilter(cat); else { setTrendingFilter(null); fetchNews(dateFilter, undefined, null); } }}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={activeCategory === cat ? { background: PRIMARY, color: '#fff' } : { background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
                {cat}
              </button>
            ))
          )}
        </div>

        {/* Article count */}
        {!loading && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold" style={{ color: PRIMARY }}>{articles.length}</span> {t('home.articles')}
            {(query || trendingFilter) && <span> for "<span style={{ color: PRIMARY }}>{trendingFilter || query}</span>"</span>}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
            <p className="text-sm text-muted-foreground">{t('news.loading')}</p>
          </div>
        )}

        {error && <div className="text-center py-16 text-red-500 text-sm">{error}</div>}

        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: PRIMARY_CONTAINER }}>📰</div>
            <p className="font-semibold text-foreground">{t('news.no_news')}</p>
            <p className="text-sm text-muted-foreground">Fresh news will appear here soon</p>
            <button onClick={() => { setCustomDate(null); setTrendingFilter(null); handleDateFilter('all'); }}
              className="text-sm px-5 py-2.5 rounded-full text-white font-semibold mt-1"
              style={{ background: PRIMARY_GRAD }}>
              Show All News
            </button>
          </div>
        )}

        {/* Articles */}
        {!loading && !error && articles.length > 0 && (
          <div className="flex flex-col gap-3">
            {articles.map((item, i) => {
              const headline = item.title || item.headline || "Untitled";
              const timeAgo = getTimeAgo(item.published_at || '', t);
              const topic = item.topic || '';
              const imgSrc = item.image_url || getCategoryImage(headline, topic, item.id);

              /* ── Hero card (first article) ── */
              if (i === 0) {
                return (
                  <motion.article key={item.id || i}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(124,58,237,0.13)' }}
                    className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border cursor-pointer active:scale-[0.99] transition-all duration-200 group"
                    onClick={() => setSelectedArticle(item)}>
                    {/* Image with gradient overlay */}
                    <div className="relative w-full overflow-hidden" style={{ height: 220 }}>
                      <img src={imgSrc} alt={headline}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline, topic, item.id); }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      {/* Topic badge top-left */}
                      {topic && (
                        <span className="chip absolute top-3 left-3 bg-card/90 text-foreground backdrop-blur">
                          {TOPIC_EMOJIS[topic] || '📰'} {topic}
                        </span>
                      )}
                      {/* Title over gradient */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h2 className="font-bold text-[17px] text-white leading-snug line-clamp-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {headline}
                        </h2>
                      </div>
                    </div>
                    {/* Footer row */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold truncate" style={{ color: PRIMARY }}>{item.source}</span>
                        <span className="text-muted-foreground text-[11px] shrink-0">· {timeAgo}</span>
                        {item.summary && (
                          <span className="hidden sm:block text-xs text-muted-foreground line-clamp-1 ml-1">— {item.summary}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleGenerateScript(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                          style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>
                          <FileText className="w-3 h-3" /> Script
                        </button>
                        {item.url && (
                          <button onClick={() => window.open(item.url, '_blank')}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: 'hsl(var(--secondary))' }}>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              }

              /* ── Regular cards ── */
              return (
                <motion.article key={item.id || i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(124,58,237,0.10)' }}
                  className="bg-card rounded-2xl overflow-hidden border border-border cursor-pointer active:scale-[0.99] transition-all duration-200 group hover:border-purple-200"
                  onClick={() => setSelectedArticle(item)}>
                  <div className="flex gap-3 p-3">
                    {/* Thumbnail with zoom on hover */}
                    <div className="shrink-0 rounded-xl overflow-hidden bg-gray-100" style={{ width: 88, height: 88 }}>
                      <img src={imgSrc} alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(headline, topic, item.id); }} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      {/* Topic + time */}
                      <div className="flex items-center gap-2 mb-1">
                        {topic && (
                          <span className="chip shrink-0 text-[9px] px-1.5 py-0.5">
                            {TOPIC_EMOJIS[topic] || '📰'} {topic}
                          </span>
                        )}
                        <span className="text-muted-foreground text-[10px] ml-auto shrink-0">{timeAgo}</span>
                      </div>
                      {/* Headline */}
                      <h3 className="font-semibold text-[13px] text-foreground leading-snug line-clamp-2 transition-colors group-hover:text-purple-700"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {headline}
                      </h3>
                      {/* Source + actions */}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] font-semibold truncate" style={{ color: PRIMARY }}>{item.source}</span>
                        <div className="flex items-center gap-0.5 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleGenerateScript(item)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-purple-100 active:bg-purple-50"
                            style={{ background: '#f5f3ff' }}>
                            <FileText className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                          </button>
                          {item.url && (
                            <button onClick={() => window.open(item.url, '_blank')}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-200 active:bg-gray-100"
                              style={{ background: 'hsl(var(--secondary))' }}>
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      {/* Article Detail — mobile bottom sheet */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setSelectedArticle(null)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              drag="y" dragConstraints={{ top: 0 }} dragElastic={0.15}
              onDragEnd={(_, info) => { if (info.offset.y > 120) setSelectedArticle(null); }}
              onClick={e => e.stopPropagation()}
              className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col"
              style={{ maxHeight: '92vh' }}>

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>

                {/* Hero image with title overlay */}
                <div className="relative w-full" style={{ height: 200 }}>
                  <img
                    src={selectedArticle.image_url || getCategoryImage(selectedArticle.title || selectedArticle.headline || '', selectedArticle.topic, selectedArticle.id)}
                    alt="" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = getCategoryImage(selectedArticle.title || selectedArticle.headline || '', selectedArticle.topic, selectedArticle.id); }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {/* Close button */}
                  <button onClick={() => setSelectedArticle(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-sm">
                    <X className="w-4 h-4" />
                  </button>
                  {/* Topic badge */}
                  {selectedArticle.topic && (
                    <span className="chip absolute top-3 left-3 bg-card/90 text-foreground backdrop-blur">
                      {TOPIC_EMOJIS[selectedArticle.topic] || '📰'} {selectedArticle.topic}
                    </span>
                  )}
                  {/* Title over image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="font-bold text-[18px] text-white leading-snug"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {selectedArticle.title || selectedArticle.headline}
                    </h2>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">

                  {/* Source + time row */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: PRIMARY }}>
                      {(selectedArticle.source || 'N')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: PRIMARY }}>{selectedArticle.source}</span>
                    {selectedArticle.published_at && (
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">{getTimeAgo(selectedArticle.published_at, t)}</span>
                    )}
                  </div>

                  {/* Key highlights */}
                  {keyPoints.length > 0 && (
                    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#f5f3ff' }}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: PRIMARY }}>Key Highlights</p>
                      </div>
                      {keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                            style={{ background: PRIMARY_CONTAINER, color: PRIMARY }}>{idx + 1}</span>
                          <p className="text-[13px] leading-relaxed text-gray-700">{point}.</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary fallback */}
                  {keyPoints.length === 0 && selectedArticle.summary && (
                    <p className="text-[13px] text-foreground leading-relaxed">{selectedArticle.summary}</p>
                  )}

                  {/* Creator impact */}
                  {impactData && (
                    <div className="rounded-2xl p-4 space-y-1.5" style={{
                      background: impactData.level === 'high' ? '#fff8f0' : impactData.level === 'medium' ? '#f0fdf4' : '#faf5ff',
                      border: `1.5px solid ${impactData.level === 'high' ? '#fed7aa' : impactData.level === 'medium' ? '#bbf7d0' : '#e9d5ff'}`
                    }}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {impactData.level === 'high' ? '🔥' : impactData.level === 'medium' ? '📈' : '✅'}
                        </span>
                        <p className="text-xs font-bold" style={{ color: impactData.level === 'high' ? '#c2410c' : impactData.level === 'medium' ? '#15803d' : '#7c3aed' }}>
                          {impactData.level === 'high' ? 'High' : impactData.level === 'medium' ? 'Medium' : 'Low'} Impact for Creators
                        </p>
                      </div>
                      <p className="text-[13px] leading-relaxed"
                        style={{ color: impactData.level === 'high' ? '#9a3412' : impactData.level === 'medium' ? '#166534' : '#6d28d9' }}>
                        {impactData.text}
                      </p>
                    </div>
                  )}

                  {/* Bottom padding so content clears the fixed CTA */}
                  <div className="h-2" />
                </div>
              </div>

              {/* Fixed CTA bar */}
              <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-card flex gap-2.5">
                <button onClick={() => handleGenerateScript(selectedArticle)}
                  className="flex-1 py-3 rounded-2xl border-2 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  style={{ borderColor: PRIMARY, color: PRIMARY }}>
                  <FileText className="w-4 h-4" /> Generate Script
                </button>
                {selectedArticle.url && (
                  <button onClick={() => window.open(selectedArticle.url, '_blank')}
                    className="flex-1 py-3 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    style={{ background: PRIMARY }}>
                    Read Article <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: PRIMARY }}>
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}