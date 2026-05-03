import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Instagram, Youtube, X,
  Heart, Eye, Flame, Megaphone, TrendingUp, Loader2, Play, ExternalLink
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const BLUE_G = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const G = "#E8B84B";
const B = "#3B82F6";

const instagramChips = ["Fitness","Motivation","Stock Market","Crypto","Travel","Food","Tech","Business","Fashion","Gaming","Comedy","Cricket","Education","Yoga","Entrepreneur","Bollywood"];
const youtubeChips = ["Tech Reviews","Finance","Motivation","Gaming","Travel Vlog","Cooking","Education","Fitness","Comedy","Cricket","Business","Music","Self Improvement","Crypto","Cars","Movies"];
const WORDS = ["Discover.", "Create.", "Go Viral."];

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState(0);

  // Cycle headline words
  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 2400);
    return () => clearInterval(interval);
  }, []);

  // ✅ Poll localStorage every 300ms to detect sidebar platform changes
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem("platform") as "instagram" | "youtube" | null;
      if (stored && stored !== platform) {
        setPlatform(stored);
        setAllItems([]);
        setSearched("");
        setSearch("");
        setNextPageToken(null);
        setNextPage(0);
        sessionStorage.removeItem('lastSearch');
        sessionStorage.removeItem('lastItems');
        sessionStorage.removeItem('lastPlatform');
      }
    }, 300);
    return () => clearInterval(interval);
  }, [platform]);

  // ✅ Also listen for custom event (when toggling from home page itself)
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail !== platform) {
        setPlatform(e.detail);
        setAllItems([]);
        setSearched("");
        setSearch("");
        setNextPageToken(null);
        setNextPage(0);
        sessionStorage.removeItem('lastSearch');
        sessionStorage.removeItem('lastItems');
        sessionStorage.removeItem('lastPlatform');
      }
    };
    window.addEventListener("platformChanged", handler);
    return () => window.removeEventListener("platformChanged", handler);
  }, [platform]);

  // Restore search state when coming back from InsightPage
  useEffect(() => {
    const lastSearch = sessionStorage.getItem('lastSearch');
    const lastPlatform = sessionStorage.getItem('lastPlatform') as "instagram" | "youtube" | null;
    const lastItems = sessionStorage.getItem('lastItems');
    const lastNextPageToken = sessionStorage.getItem('lastNextPageToken');
    const lastNextPage = sessionStorage.getItem('lastNextPage');

    if (lastSearch && lastPlatform && lastItems) {
      setPlatform(lastPlatform);
      setSearch(lastSearch);
      setSearched(lastSearch);
      setAllItems(JSON.parse(lastItems));
      setNextPageToken(lastNextPageToken || null);
      setNextPage(parseInt(lastNextPage || '0'));
    }
  }, []);

  const fetchItems = useCallback(async (query: string, plat: string, token: string | null = null, page = 0) => {
    const endpoint = plat === "youtube"
      ? `${BASE}/api/search/youtube?q=${encodeURIComponent(query)}${token ? `&pageToken=${token}` : ''}`
      : `${BASE}/api/search/instagram?q=${encodeURIComponent(query)}&page=${page}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }, []);

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    // ✅ Notify sidebar
    window.dispatchEvent(new CustomEvent("platformChanged", { detail: p }));
    setAllItems([]); setSearched(""); setSearch("");
    setNextPageToken(null); setNextPage(0);
    sessionStorage.removeItem('lastSearch');
    sessionStorage.removeItem('lastItems');
    sessionStorage.removeItem('lastPlatform');
  };

  const handleSearch = async (q?: string, plat?: "instagram" | "youtube") => {
    const query = q || search;
    const currentPlatform = plat || platform;
    if (!query.trim()) return;
    setSearch(query); setLoading(true); setSearched(query);
    setAllItems([]); setNextPageToken(null); setNextPage(0);
    try {
      const data = await fetchItems(query, currentPlatform, null, 0);
      setAllItems(data.items || []);
      setNextPageToken(data.nextPageToken || null);
      setNextPage(1);
      sessionStorage.setItem('lastSearch', query);
      sessionStorage.setItem('lastPlatform', currentPlatform);
      sessionStorage.setItem('lastItems', JSON.stringify(data.items || []));
      sessionStorage.setItem('lastNextPageToken', data.nextPageToken || '');
      sessionStorage.setItem('lastNextPage', '1');
    } catch (e: any) {
      console.error('Search error:', e);
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!searched) return;
    setLoadingMore(true);
    try {
      const data = await fetchItems(searched, platform, nextPageToken, nextPage);
      const newItems = [...allItems, ...(data.items || [])];
      setAllItems(newItems);
      setNextPageToken(data.nextPageToken || null);
      setNextPage(p => p + 1);
      sessionStorage.setItem('lastItems', JSON.stringify(newItems));
      sessionStorage.setItem('lastNextPageToken', data.nextPageToken || '');
      sessionStorage.setItem('lastNextPage', String(nextPage + 1));
    } catch (e) {
      console.error('Load more error:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleClear = () => {
    setSearched(""); setAllItems([]); setSearch("");
    setNextPageToken(null); setNextPage(0);
    sessionStorage.removeItem('lastSearch');
    sessionStorage.removeItem('lastItems');
    sessionStorage.removeItem('lastPlatform');
    sessionStorage.removeItem('lastNextPageToken');
    sessionStorage.removeItem('lastNextPage');
  };

  const chips = platform === "instagram" ? instagramChips : youtubeChips;
  const accentColor = platform === "instagram" ? G : B;
  const accentGrad = platform === "instagram" ? GOLD : BLUE_G;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        .cg{font-family:'Cormorant Garamond',serif!important}
        .gold-text{background:linear-gradient(135deg,#E8B84B,#C17D20);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .blue-text{background:linear-gradient(135deg,#3B82F6,#1D4ED8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        *{box-sizing:border-box}
        .explore-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:140px;gap:2px}
        .explore-item{position:relative;overflow:hidden;cursor:pointer;background:#1a1a1a}
        .explore-item img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
        .explore-item:hover img{transform:scale(1.06)}
        .explore-item .hover-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.45);opacity:0;transition:opacity .2s;display:flex;align-items:center;justify-content:center}
        .explore-item:hover .hover-overlay{opacity:1}
        .row-span-2{grid-row:span 2}
      `}</style>

      <div className="flex-1 flex flex-col min-h-screen bg-background">

        {/* ── HERO ── */}
        <div className="flex flex-col items-center px-4 pt-8 pb-5 relative overflow-hidden">
          <motion.div animate={{ opacity:[0.03,0.07,0.03] }} transition={{ duration:8,repeat:Infinity }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] pointer-events-none rounded-full"
            style={{ background:`radial-gradient(ellipse,${accentColor},transparent 70%)`,filter:"blur(60px)" }}/>

          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}
            className="flex flex-col items-center gap-4 w-full max-w-xl relative z-10">

            {/* Animated headline */}
            <div className="cg text-4xl md:text-6xl font-bold text-center leading-tight" style={{ minHeight:"1.2em" }}>
              <AnimatePresence mode="wait">
                <motion.span key={wordIndex}
                  initial={{ opacity:0,y:16,letterSpacing:".25em",filter:"blur(8px)" }}
                  animate={{ opacity:1,y:0,letterSpacing:".01em",filter:"blur(0)" }}
                  exit={{ opacity:0,y:-12,filter:"blur(4px)" }}
                  transition={{ duration:0.65,ease:[0.16,1,0.3,1] }}
                  className={wordIndex===1?(platform==="instagram"?"gold-text":"blue-text")+" italic":wordIndex===2?"italic":""}
                  style={{ display:"inline-block",color:wordIndex===0?"hsl(var(--foreground))":wordIndex===2?accentColor:undefined }}>
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="text-xs text-center text-muted-foreground max-w-sm" style={{ fontFamily:"Inter,sans-serif" }}>
              {platform === "instagram"
                ? "Search any niche to see top reels — tap any to see full insights"
                : "Search any niche to see real YouTube Shorts — powered by YouTube Data API"}
            </p>

            {/* ✅ Platform toggle — fully synced with sidebar */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-card border border-border">
              {(["instagram","youtube"] as const).map(p=>(
                <button key={p} onClick={()=>switchPlatform(p)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={platform===p
                    ?{background:p==="instagram"?GOLD:BLUE_G,color:"#fff",fontWeight:600,fontFamily:"Inter,sans-serif"}
                    :{color:"hsl(var(--muted-foreground))",fontFamily:"Inter,sans-serif"}}>
                  {p==="instagram"?<Instagram className="w-3.5 h-3.5"/>:<Youtube className="w-3.5 h-3.5"/>}
                  {p==="instagram"?"Instagram":"YouTube"}
                </button>
              ))}
            </div>

            {/* Search bar with X */}
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  placeholder={platform==="instagram"?"Search niche (Fitness, Finance, Cricket)...":"Search niche (Tech, Gaming, Finance)..."}
                  className="w-full pl-10 pr-9 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  style={{ fontFamily:"Inter,sans-serif" }}
                  onFocus={e=>{e.target.style.borderColor=`${accentColor}50`;e.target.style.boxShadow=`0 0 0 3px ${accentColor}0A`;}}
                  onBlur={e=>{e.target.style.borderColor="";e.target.style.boxShadow="none";}}/>
                {search && (
                  <button onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4"/>
                  </button>
                )}
              </div>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={()=>handleSearch()}
                className="px-5 py-3 rounded-2xl font-semibold flex items-center justify-center"
                style={{ background:accentGrad,color:platform==="instagram"?"#111":"#fff" }}>
                <Search className="w-4 h-4"/>
              </motion.button>
            </div>

            {/* Chips */}
            {!searched && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {chips.slice(0,12).map(chip=>(
                  <motion.button key={chip} onClick={()=>handleSearch(chip)} whileTap={{ scale:0.96 }}
                    className="px-3 py-1.5 rounded-full text-xs border border-border bg-card text-muted-foreground transition-all"
                    style={{ fontFamily:"Inter,sans-serif" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${accentColor}50`;(e.currentTarget as HTMLElement).style.color=accentColor;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="";(e.currentTarget as HTMLElement).style.color="";}}>
                    {chip}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <motion.div animate={{ rotate:360 }} transition={{ duration:1,repeat:Infinity,ease:"linear" }}>
              {platform==="instagram"?<Instagram className="w-6 h-6" style={{ color:G }}/>:<Youtube className="w-6 h-6" style={{ color:B }}/>}
            </motion.div>
            <p className="text-xs text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
              {platform==="youtube"?"Fetching real YouTube Shorts":"Searching"} for <span style={{ color:accentColor }}>"{search}"</span>...
            </p>
          </div>
        )}

        {/* Explore Grid */}
        {searched && !loading && allItems.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="pb-20">
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="text-xs text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
                <span style={{ color:accentColor,fontWeight:600 }}>#{searched}</span>
                {platform==="youtube"&&<span className="ml-2 text-green-400">● Live YouTube Data</span>}
                {platform==="instagram"&&<span className="ml-2 text-yellow-500">● Sample Data</span>}
                <span className="ml-2">· {allItems.length} results</span>
              </p>
              <button onClick={handleClear}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                style={{ fontFamily:"Inter,sans-serif" }}>
                <X className="w-3.5 h-3.5"/> Clear
              </button>
            </div>

            <div className="explore-grid">
              {allItems.map((item,i)=>(
                <motion.div key={`${item.id}-${i}`}
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                  transition={{ delay:(i%12)*0.03 }}
                  className={`explore-item ${item.rowSpan===2?"row-span-2":""}`}
                  onClick={()=>navigate("/insight",{ state:{ item } })}>
                  <img src={item.thumbnail} alt={item.caption} loading="lazy"
                    onError={(e)=>{ (e.target as HTMLImageElement).src=`https://picsum.photos/seed/${i}${item.niche}/400/400`; }}/>
                  {item.isVideo&&(
                    <div className="absolute top-2 right-2 z-10">
                      {platform==="instagram"?<Play className="w-4 h-4 text-white drop-shadow-lg" fill="white"/>:<Youtube className="w-4 h-4 text-white drop-shadow-lg"/>}
                    </div>
                  )}
                  {platform==="youtube"&&item.youtubeUrl&&(
                    <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer"
                      className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background:"rgba(0,0,0,0.5)" }}
                      onClick={e=>e.stopPropagation()}>
                      <ExternalLink className="w-3 h-3 text-white"/>
                    </a>
                  )}
                  <div className="absolute bottom-2 right-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                    style={{ background:item.virality>=90?accentColor:item.virality>=80?"#22c55e":"rgba(0,0,0,0.55)",
                      color:item.virality>=90&&platform==="instagram"?"#000":"#fff",fontSize:10,fontFamily:"Inter,sans-serif" }}>
                    <Flame className="w-2.5 h-2.5"/>{item.virality}
                  </div>
                  {item.boosted&&(
                    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                      style={{ background:B,color:"#fff",fontSize:9,fontFamily:"Inter,sans-serif" }}>
                      <Megaphone className="w-2.5 h-2.5"/> Boosted
                    </div>
                  )}
                  <div className="hover-overlay">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-white font-semibold text-sm" style={{ fontFamily:"Inter,sans-serif" }}>
                        <Heart className="w-4 h-4" fill="white"/> {item.likes}
                      </div>
                      <div className="flex items-center gap-1 text-white font-semibold text-sm" style={{ fontFamily:"Inter,sans-serif" }}>
                        <Eye className="w-4 h-4"/> {item.views}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col items-center mt-6 gap-2">
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={handleLoadMore}
                disabled={loadingMore||(platform==="youtube"&&!nextPageToken)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{ border:`1px solid ${accentColor}40`,color:accentColor,fontFamily:"Inter,sans-serif",background:`${accentColor}08` }}>
                {loadingMore?<><Loader2 className="w-4 h-4 animate-spin"/>Loading more...</>:<><TrendingUp className="w-4 h-4"/>Load More {platform==="instagram"?"Reels":"Shorts"}</>}
              </motion.button>
              <p className="text-xs text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
                Tap any card to see full insights →
              </p>
            </div>
          </motion.div>
        )}

        {searched&&!loading&&allItems.length===0&&(
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
              No results for <span style={{ color:accentColor }}>"{searched}"</span>
            </p>
            <button onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground underline"
              style={{ fontFamily:"Inter,sans-serif" }}>Try a different search</button>
          </div>
        )}
      </div>
    </>
  );
}