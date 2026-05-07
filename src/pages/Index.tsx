import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Instagram, Youtube, X,
  Heart, Eye, Flame, Megaphone, TrendingUp, Loader2, Play, ExternalLink
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const IG_COLOR = "#14BBA6";
const IG_GRAD = "linear-gradient(135deg, #14BBA6, #22D3EE)";
const YT_COLOR = "#FF6B6B";
const YT_GRAD = "linear-gradient(135deg, #FF6B6B, #FFB86C)";

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

  // 1. Word Animation Timer
  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 2400);
    return () => clearInterval(interval);
  }, []);

  // 2. FIXED: Optimized Platform Change Listener (Removed the 300ms polling)
  useEffect(() => {
    const handler = (e: any) => {
      const newPlatform = e.detail;
      if (newPlatform !== platform) {
        setPlatform(newPlatform);
        clearSearchState();
      }
    };
    window.addEventListener("platformChanged", handler);
    return () => window.removeEventListener("platformChanged", handler);
  }, [platform]);

  // Helper to clear state and storage
  const clearSearchState = () => {
    setAllItems([]); 
    setSearched(""); 
    setSearch("");
    setNextPageToken(null); 
    setNextPage(0);
    sessionStorage.removeItem('lastSearch');
    sessionStorage.removeItem('lastItems');
    sessionStorage.removeItem('lastPlatform');
    sessionStorage.removeItem('lastNextPageToken');
    sessionStorage.removeItem('lastNextPage');
  };

  // 3. Restore state when coming back from InsightPage
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
    window.dispatchEvent(new CustomEvent("platformChanged", { detail: p }));
    clearSearchState();
  };

  const handleSearch = async (q?: string) => {
    const query = q || search;
    if (!query.trim()) return;
    
    setSearch(query); 
    setLoading(true); 
    setSearched(query);
    setAllItems([]); 
    setNextPageToken(null); 
    setNextPage(0);

    try {
      const data = await fetchItems(query, platform, null, 0);
      const items = data.items || [];
      setAllItems(items);
      setNextPageToken(data.nextPageToken || null);
      setNextPage(1);
      
      // Save to session
      sessionStorage.setItem('lastSearch', query);
      sessionStorage.setItem('lastPlatform', platform);
      sessionStorage.setItem('lastItems', JSON.stringify(items));
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
      const updatedPage = nextPage + 1;
      setNextPage(updatedPage);
      
      sessionStorage.setItem('lastItems', JSON.stringify(newItems));
      sessionStorage.setItem('lastNextPageToken', data.nextPageToken || '');
      sessionStorage.setItem('lastNextPage', String(updatedPage));
    } catch (e) {
      console.error('Load more error:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleClear = () => {
    clearSearchState();
  };

  const isIG = platform === "instagram";
  const ac = isIG ? IG_COLOR : YT_COLOR;
  const ag = isIG ? IG_GRAD : YT_GRAD;
  const chips = isIG ? instagramChips : youtubeChips;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        .cg{font-family:'Cormorant Garamond',serif!important}
        .teal-text{background:linear-gradient(135deg,#14BBA6,#22D3EE);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .sunset-text{background:linear-gradient(135deg,#FF6B6B,#FFB86C);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        *{box-sizing:border-box}
        
        /* FIXED: Responsive Grid */
        .explore-grid{display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:140px;gap:2px}
        @media (min-width: 640px) {
          .explore-grid{grid-template-columns:repeat(3,1fr)}
        }
        @media (min-width: 1024px) {
          .explore-grid{grid-template-columns:repeat(4,1fr)}
        }

        .explore-item{position:relative;overflow:hidden;cursor:pointer;background:#1a1a1a}
        .explore-item img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
        .explore-item:hover img{transform:scale(1.06)}
        .explore-item .hover-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.5);opacity:0;transition:opacity .2s;display:flex;align-items:center;justify-content:center}
        .explore-item:hover .hover-overlay{opacity:1}
        .row-span-2{grid-row:span 2}
      `}</style>

      <div className="flex-1 flex flex-col min-h-screen bg-background">

        {/* HERO SECTION */}
        <div className="flex flex-col items-center px-4 pt-8 pb-5 relative overflow-hidden">
          <motion.div animate={{ opacity:[0.04,0.1,0.04] }} transition={{ duration:8,repeat:Infinity }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none rounded-full"
            style={{ background:`radial-gradient(ellipse,${ac},transparent 70%)`,filter:"blur(70px)" }}/>

          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}
            className="flex flex-col items-center gap-4 w-full max-w-xl relative z-10">

            <div className="cg text-4xl md:text-6xl font-bold text-center leading-tight" style={{ minHeight:"1.2em" }}>
              <AnimatePresence mode="wait">
                <motion.span key={wordIndex}
                  initial={{ opacity:0,y:16,letterSpacing:".25em",filter:"blur(8px)" }}
                  animate={{ opacity:1,y:0,letterSpacing:".01em",filter:"blur(0)" }}
                  exit={{ opacity:0,y:-12,filter:"blur(4px)" }}
                  transition={{ duration:0.65,ease:[0.16,1,0.3,1] }}
                  className={wordIndex===1?(isIG?"teal-text":"sunset-text")+" italic":wordIndex===2?"italic":""}
                  style={{ display:"inline-block",color:wordIndex===0?"hsl(var(--foreground))":wordIndex===2?ac:undefined }}>
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="text-xs text-center text-muted-foreground max-w-sm" style={{ fontFamily:"Inter,sans-serif" }}>
              {isIG ? "Search any niche to see top reels — tap any to see full insights"
                    : "Search any niche to see real YouTube Shorts — powered by YouTube Data API"}
            </p>

            {/* Platform Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-card border border-border">
              {(["instagram","youtube"] as const).map(p=>(
                <button key={p} onClick={()=>switchPlatform(p)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={platform===p
                    ?{background:p==="instagram"?IG_GRAD:YT_GRAD,color:"#fff",fontWeight:600,fontFamily:"Inter,sans-serif"}
                    :{color:"hsl(var(--muted-foreground))",fontFamily:"Inter,sans-serif"}}>
                  {p==="instagram"?<Instagram className="w-3.5 h-3.5"/>:<Youtube className="w-3.5 h-3.5"/>}
                  {p==="instagram"?"Instagram":"YouTube"}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  placeholder={isIG?"Search niche (Fitness, Finance, Cricket)...":"Search niche (Tech, Gaming, Finance)..."}
                  className="w-full pl-10 pr-9 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  style={{ fontFamily:"Inter,sans-serif" }}
                  onFocus={e=>{e.target.style.borderColor=`${ac}60`;e.target.style.boxShadow=`0 0 0 3px ${ac}12`;}}
                  onBlur={e=>{e.target.style.borderColor="";e.target.style.boxShadow="none";}}/>
                {search && (
                  <button onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4"/>
                  </button>
                )}
              </div>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={()=>handleSearch()}
                className="px-5 py-3 rounded-2xl font-semibold flex items-center justify-center"
                style={{ background:ag,color:"#fff" }}>
                <Search className="w-4 h-4"/>
              </motion.button>
            </div>

            {/* Niche Chips */}
            {!searched && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {chips.slice(0,12).map(chip=>(
                  <motion.button key={chip} onClick={()=>handleSearch(chip)} whileTap={{ scale:0.96 }}
                    className="px-3 py-1.5 rounded-full text-xs border border-border bg-card text-muted-foreground transition-all"
                    style={{ fontFamily:"Inter,sans-serif" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${ac}60`;(e.currentTarget as HTMLElement).style.color=ac;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="";(e.currentTarget as HTMLElement).style.color="";}}>
                    {chip}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <motion.div animate={{ rotate:360 }} transition={{ duration:1,repeat:Infinity,ease:"linear" }}>
              {isIG
                ?<Instagram className="w-6 h-6" style={{ color:IG_COLOR }}/>
                :<Youtube className="w-6 h-6" style={{ color:YT_COLOR }}/>}
            </motion.div>
            <p className="text-xs text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
              Searching <span style={{ color:ac }}>"{search}"</span>...
            </p>
          </div>
        )}

        {/* Results Grid */}
        {searched && !loading && allItems.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="pb-20">
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="text-xs text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
                <span style={{ color:ac,fontWeight:600 }}>#{searched}</span>
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
                      {isIG?<Play className="w-4 h-4 text-white drop-shadow-lg" fill="white"/>
                           :<Youtube className="w-4 h-4 text-white drop-shadow-lg"/>}
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
                    style={{
                      background:item.virality>=90?ac:item.virality>=80?"#22c55e":"rgba(0,0,0,0.6)",
                      color:"#fff", fontSize:10, fontFamily:"Inter,sans-serif"
                    }}>
                    <Flame className="w-2.5 h-2.5"/>{item.virality}
                  </div>
                  {item.boosted&&(
                    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                      style={{ background:"#14BBA6",color:"#fff",fontSize:9,fontFamily:"Inter,sans-serif" }}>
                      <Megaphone className="w-2.5 h-2.5"/> Boosted
                    </div>
                  )}
                  <div className="hover-overlay">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-white font-semibold text-sm" style={{ fontFamily:"Inter,sans-serif" }}>
                        <Heart className="w-4 h-4" fill="white"/> {item.likes}
                      </span>
                      <span className="flex items-center gap-1 text-white font-semibold text-sm" style={{ fontFamily:"Inter,sans-serif" }}>
                        <Eye className="w-4 h-4"/> {item.views}
                      </span>
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
                style={{ border:`1px solid ${ac}40`,color:ac,fontFamily:"Inter,sans-serif",background:`${ac}10` }}>
                {loadingMore
                  ?<><Loader2 className="w-4 h-4 animate-spin"/>Loading more...</>
                  :<><TrendingUp className="w-4 h-4"/>Load More {isIG?"Reels":"Shorts"}</>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {searched&&!loading&&allItems.length===0&&(
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
              No results for <span style={{ color:ac }}>"{searched}"</span>
            </p>
            <button onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground underline"
              style={{ fontFamily:"Inter,sans-serif" }}>Try a different search</button>
          </div>
        )}
      </div>
    </>
  );
}
