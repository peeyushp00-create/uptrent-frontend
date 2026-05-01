import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Instagram, Youtube, Sparkles, X, Heart, Eye,
  MessageCircle, Share2, Bookmark, ArrowRight, Flame,
  Megaphone, Clock, Music2, AlertCircle, BarChart2,
  TrendingUp, ThumbsUp, Play, Target, MousePointerClick, Loader2
} from "lucide-react";

const GOLD = "linear-gradient(135deg, #E8B84B, #C17D20)";
const BLUE_G = "linear-gradient(135deg, #3B82F6, #1D4ED8)";
const G = "#E8B84B";
const B = "#3B82F6";
const PAGE_SIZE = 12;

const instagramChips = ["Fitness","Motivation","Stock Market","Crypto","Travel","Food","Tech","Business","Fashion","Gaming","Comedy","Cricket","Education","Yoga","Entrepreneur","Bollywood"];
const youtubeChips = ["Tech Reviews","Finance","Motivation","Gaming","Travel Vlog","Cooking","Education","Fitness","Comedy","Cricket","Business","Music","Self Improvement","Crypto","Cars","Movies"];
const WORDS = ["Discover.", "Create.", "Go Viral."];

function generateItems(niche: string, platform: string) {
  const n = niche.toLowerCase().replace(/\s/g, "");
  const isYT = platform === "youtube";

  const creators = isYT
    ? ["techburner","techguruji","geekyshivam","mortalofficial","sharan_hegde","akshat_shriv","scout_yt","ca_rachit","dynamo_gaming","carryminati","triggered_insaan","mythpat"]
    : ["beerbiceps","priyafitness","techburner_fit","sharan_hegde","akshat_shriv","rahul_creator","cricketaddicter","sneha_creates","vikram_content","bbkivines","bhuvan_bam","ashish_chanchlani"];
  const names = isYT
    ? ["Tech Burner","Technical Guruji","Geeky Shivam","Mortal","Sharan Hegde","Akshat Shrivastava","Scout","CA Rachit","Dynamo Gaming","CarryMinati","Triggered Insaan","Mythpat"]
    : ["Ranveer Allahbadia","Priya Mehta","Shlok Srivastava","Sharan Hegde","Akshat Shrivastava","Rahul Sharma","Cricket Addict","Sneha Rao","Vikram Das","Bhuvan Bam","Amit Bhadana","Ashish Chanchlani"];

  const captions = isYT ? [
    `${niche} truth nobody tells you 📱`,`This ₹999 ${niche} gadget changed my life 🔥`,
    `AI tool for ${niche} nobody is using 🤖`,`Impossible ${niche} challenge completed 🎮`,
    `This ${niche} mistake costs crores 💸`,`How I turned ₹10K into ₹2L with ${niche} 📈`,
    `Secret ${niche} trick nobody knows 😱`,`${niche} hacks experts don't share 🤫`,
    `${niche} in 60 seconds 🎯`,`${niche} will change in 2025 🚀`,
    `I went viral with ${niche} — here's how`,`${niche} for beginners — complete guide 📚`,
  ] : [
    `Top 5 habits for ${niche} 💪🔥`,`This ${niche} mistake costs results ❌`,
    `30 day ${niche} challenge results 🚀`,`How I grew ${niche} to 1M 📈`,
    `${niche} secrets nobody tells 🤫`,`Best tools for ${niche} 2024 💰`,
    `Top 10 ${niche} moments 🔥`,`POV: You finally get ${niche} 😂`,
    `7 days of ${niche} — honest review 😤`,`${niche} is changing everything 🌟`,
    `My ${niche} journey — full story`,`${niche} tips that actually work ✅`,
  ];

  const views = ["12.4M","8.7M","5.2M","18.9M","15.1M","9.3M","11.4M","6.8M","7.6M","4.2M","3.1M","2.8M"];
  const likes = ["890K","620K","410K","1.4M","1.1M","720K","870K","540K","590K","320K","245K","198K"];
  const comments = ["18K","24K","9.8K","45K","32K","19K","28K","14K","16K","8.4K","6.9K","5.1K"];
  const shares = ["145K","98K","67K","310K","220K","165K","195K","112K","98K","42K","31K","28K"];
  const viralities = [97,92,85,98,99,94,93,89,83,88,79,76];
  const boosted = [false,true,false,false,false,false,false,true,false,false,true,false];

  // Instagram explore grid pattern — 3 col layout
  // Row 1: small, small, tall(rowspan2)
  // Row 2: small, small, (continues tall)
  // Row 3: tall(rowspan2), small, small
  // Row 4: (continues tall), small, small
  const spanPatterns = [1,1,2, 1,1,1, 2,1,1, 1,1,1];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `${platform}-${n}-${i}`,
    user: creators[i] || `creator${i}`,
    name: names[i] || `Creator ${i}`,
    avatar: (names[i] || "C")[0],
    views: views[i],
    likes: likes[i],
    comments: comments[i],
    shares: shares[i],
    caption: captions[i],
    hashtags: [`#${n}`, `#${isYT?"shorts":"reels"}`, "#india", "#viral"],
    boosted: boosted[i],
    virality: viralities[i],
    rowSpan: spanPatterns[i],
    isVideo: i % 4 !== 1,
    thumbnail: `https://picsum.photos/seed/${n}${platform}${i+1}/400/${spanPatterns[i]===2?800:400}`,
    niche,
    platform,
    // IG
    watchTime: ["92%","85%","88%","94%","89%","81%","97%","78%","86%","83%","79%","76%"][i],
    saveRate: ["18%","22%","31%","42%","38%","29%","15%","12%","26%","19%","24%","17%"][i],
    hook: ["Dramatic transformation in first 3 seconds","Controversial opener — 'You're doing it wrong'","Before/after split screen in first second","Income screenshot shown immediately","Secret reveal with suspense build-up","List format saves prompt in first line","Celebrity name drives instant curiosity","POV format = instant relatability","Challenge + promised result at end","Bold claim with big number","Story-based emotional hook","Tutorial reveal with FOMO trigger"][i],
    audio: ["Heeriye Remix","Original Audio","Kesariya Beat","Lo-fi Study","Suspense Audio","Original VO","IPL Anthem","Comedy Beat","Emotional Piano","Trending 2024","Viral Sound","Motivational Beat"][i],
    reason: ["Transformation + trending audio + 7AM post time","Boosted + mistake hook drives saves and comments","Challenge format with high save rate triggers algorithm","Income proof + massive save rate = explore page push","Boosted + secret reveal + high shares = amplification","List format = high saves = consistent algorithm reach","Celebrity name + trending moment + seasonal timing","Relatable POV format = high shares among friends","Boosted + authenticity + promised payoff = high completion","Viral moment + trending topic + perfect timing","Personal story + emotional connection + shareable","Tutorial + FOMO + high rewatch value = algorithm loves"][i],
    // YT
    ctr: ["14.2%","11.8%","9.4%","18.2%","16.5%","13.7%","15.4%","12.1%","10.8%","11.2%","9.8%","8.6%"][i],
    avgView: ["68%","61%","74%","91%","82%","79%","88%","71%","76%","72%","65%","69%"][i],
    retention: ["High drop at 0:08 then steady","Strong first 15 seconds","Very high — rewatch heavy","Near perfect retention","Almost no drop-off","People rewatch for steps","Rewatch for trick details","Drops at 45s but strong open","Consistent throughout","Front-loaded strong open","Mid-video dip but recovers","Strong throughout"][i],
    thumbHook: ["RED 'WRONG' text drives fear","Price in yellow = curiosity","Robot + shocked face","Impossible number + intense face","₹ + crying emoji = loss aversion","Graph up + exact return %","Niche UI + surprised face","Professional logo + SECRET","Stopwatch + topic = urgency","Bold contrast thumbnail","Split screen comparison","Bright background + big text"][i],
    topComment: ["'Finally someone said the truth!' — 42K likes","'Ordering this right now!' — 28K likes","'What tool is this?!' — 18K likes","'How is this even possible?!' — 92K likes","'I made this mistake!' — 89K likes","'Which stocks?' — 55K likes","'Bhai OP trick!' — 47K likes","'Sending to my dad!' — 31K likes","'Best 60 seconds!' — 21K likes","'Game changer!' — 19K likes","'So relatable!' — 15K likes","'Sharing this!' — 12K likes"][i],
  }));
}

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState("");
  const [insightItem, setInsightItem] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 2400);
    return () => clearInterval(interval);
  }, []);

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p); localStorage.setItem("platform", p);
    setAllItems([]); setSearched(""); setSearch(""); setVisibleCount(PAGE_SIZE);
  };

  const handleSearch = async (q?: string) => {
    const query = q || search;
    if (!query.trim()) return;
    setSearch(query); setLoading(true); setSearched(query);
    setAllItems([]); setVisibleCount(PAGE_SIZE);
    await new Promise(r => setTimeout(r, 1200));
    setAllItems(generateItems(query, platform));
    setLoading(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await new Promise(r => setTimeout(r, 800));
    // Generate more items with different seeds
    const more = generateItems(searched + "-more", platform).map((item, i) => ({
      ...item, id: `${item.id}-more-${i}`,
      thumbnail: `https://picsum.photos/seed/${searched.replace(/\s/g,'').toLowerCase()}more${i}/400/${item.rowSpan===2?800:400}`,
    }));
    setAllItems(prev => [...prev, ...more]);
    setVisibleCount(c => c + PAGE_SIZE);
    setLoadingMore(false);
  };

  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = true; // always can load more (will fetch from API later)
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
        .explore-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          grid-auto-rows:120px;
          gap:2px;
        }
        .explore-item{position:relative;overflow:hidden;cursor:pointer;background:#1a1a1a}
        .explore-item img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
        .explore-item:hover img{transform:scale(1.05)}
        .explore-item .overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.7) 30%,transparent 60%);opacity:0;transition:opacity .2s}
        .explore-item:hover .overlay{opacity:1}
        .row-span-2{grid-row:span 2}
        .explore-item .stats{position:absolute;bottom:0;left:0;right:0;padding:8px;opacity:0;transition:opacity .2s;display:flex;gap:8px;align-items:center}
        .explore-item:hover .stats{opacity:1}
      `}</style>

      <div className="flex-1 flex flex-col min-h-screen bg-background">

        {/* ── HERO ── */}
        <div className="flex flex-col items-center px-4 pt-8 pb-5 relative overflow-hidden">
          <motion.div animate={{ opacity:[0.03,0.07,0.03] }} transition={{ duration:8,repeat:Infinity }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] pointer-events-none rounded-full"
            style={{ background:`radial-gradient(ellipse,${accentColor},transparent 70%)`,filter:"blur(60px)" }}/>

          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}
            className="flex flex-col items-center gap-4 w-full max-w-xl relative z-10">

            {/* Headline */}
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

            {/* Platform toggle */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-card border border-border">
              {(["instagram","youtube"] as const).map(p=>(
                <button key={p} onClick={()=>switchPlatform(p)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={platform===p?{background:p==="instagram"?GOLD:BLUE_G,color:"#fff",fontWeight:600,fontFamily:"Inter,sans-serif"}:{color:"hsl(var(--muted-foreground))",fontFamily:"Inter,sans-serif"}}>
                  {p==="instagram"?<Instagram className="w-3.5 h-3.5"/>:<Youtube className="w-3.5 h-3.5"/>}
                  {p==="instagram"?"Instagram":"YouTube"}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  placeholder={platform==="instagram"?"Search niche (Fitness, Finance, Cricket)...":"Search niche (Tech, Gaming, Finance)..."}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none text-sm transition-all"
                  style={{ fontFamily:"Inter,sans-serif" }}
                  onFocus={e=>{e.target.style.borderColor=`${accentColor}50`;e.target.style.boxShadow=`0 0 0 3px ${accentColor}0A`;}}
                  onBlur={e=>{e.target.style.borderColor="";e.target.style.boxShadow="none";}}/>
              </div>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={()=>handleSearch()}
                className="px-5 py-3 rounded-2xl text-sm font-semibold"
                style={{ background:accentGrad,color:platform==="instagram"?"#111":"#fff",fontFamily:"Inter,sans-serif" }}>
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

        {/* ── LOADING ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <motion.div animate={{ rotate:360 }} transition={{ duration:1,repeat:Infinity,ease:"linear" }}>
              {platform==="instagram"?<Instagram className="w-6 h-6" style={{ color:G }}/>:<Youtube className="w-6 h-6" style={{ color:B }}/>}
            </motion.div>
            <p className="text-xs text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
              Searching <span style={{ color:accentColor }}>"{search}"</span>...
            </p>
          </div>
        )}

        {/* ── EXPLORE GRID ── */}
        {searched && !loading && visibleItems.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="pb-20">

            {/* Top bar */}
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="text-xs text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
                <span style={{ color:accentColor, fontWeight:600 }}>#{searched}</span> · {visibleItems.length} results
              </p>
              <button onClick={()=>{setSearched("");setAllItems([]);setSearch("");setVisibleCount(PAGE_SIZE);}}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                style={{ fontFamily:"Inter,sans-serif" }}>
                <X className="w-3.5 h-3.5"/> Clear
              </button>
            </div>

            {/* ✅ Instagram Explore-style grid */}
            <div className="explore-grid px-0">
              {visibleItems.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                  transition={{ delay:(i%PAGE_SIZE)*0.04 }}
                  className={`explore-item ${item.rowSpan===2?"row-span-2":""}`}
                  onClick={()=>setInsightItem(item)}>

                  <img src={item.thumbnail} alt={item.caption} loading="lazy"/>

                  {/* Video play icon */}
                  {item.isVideo && (
                    <div className="absolute top-2 right-2 z-10">
                      {platform==="instagram"
                        ?<Play className="w-4 h-4 text-white drop-shadow-lg" fill="white"/>
                        :<Youtube className="w-4 h-4 text-white drop-shadow-lg"/>}
                    </div>
                  )}

                  {/* Virality badge */}
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                    style={{ background:item.virality>=90?accentColor:item.virality>=80?"#22c55e":"rgba(0,0,0,0.6)",
                      color:item.virality>=90&&platform==="instagram"?"#000":"#fff",fontSize:10,fontFamily:"Inter,sans-serif" }}>
                    <Flame className="w-2.5 h-2.5"/>{item.virality}
                  </div>

                  {/* Hover overlay */}
                  <div className="overlay"/>

                  {/* Hover stats */}
                  <div className="stats">
                    <span className="flex items-center gap-0.5 text-white" style={{ fontSize:11,fontFamily:"Inter,sans-serif" }}>
                      <Heart className="w-3 h-3"/> {item.likes}
                    </span>
                    <span className="flex items-center gap-0.5 text-white" style={{ fontSize:11,fontFamily:"Inter,sans-serif" }}>
                      <Eye className="w-3 h-3"/> {item.views}
                    </span>
                  </div>

                  {/* Insights button on hover */}
                  <motion.div className="absolute bottom-8 right-2 z-10 opacity-0"
                    whileHover={{ opacity:1 }}
                    style={{ opacity:0 }}>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Insights CTA below grid */}
            <div className="flex justify-center mt-4 px-4">
              <p className="text-xs text-muted-foreground text-center" style={{ fontFamily:"Inter,sans-serif" }}>
                👆 Tap any {platform==="instagram"?"reel":"short"} to see full <span style={{ color:accentColor }}>Insights</span>
              </p>
            </div>

            {/* Load More */}
            <div className="flex justify-center mt-4">
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={handleLoadMore} disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60"
                style={{ border:`1px solid ${accentColor}40`,color:accentColor,fontFamily:"Inter,sans-serif",background:`${accentColor}08` }}>
                {loadingMore
                  ?<><Loader2 className="w-4 h-4 animate-spin"/>Loading more...</>
                  :<><TrendingUp className="w-4 h-4"/>Load More {platform==="instagram"?"Reels":"Shorts"}</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── INSIGHTS POPUP (full detail when tapped) ── */}
      <AnimatePresence>
        {insightItem && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            style={{ background:"rgba(0,0,0,0.80)",backdropFilter:"blur(10px)" }}
            onClick={()=>setInsightItem(null)}>
            <motion.div initial={{ y:50,scale:0.96 }} animate={{ y:0,scale:1 }} exit={{ y:50,scale:0.96 }}
              onClick={e=>e.stopPropagation()}
              className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden"
              style={{ maxHeight:"90vh",overflowY:"auto" }}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background:`${accentColor}15` }}>
                    {platform==="instagram"?<Instagram className="w-4 h-4" style={{ color:accentColor }}/>:<Youtube className="w-4 h-4" style={{ color:accentColor }}/>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
                      {platform==="instagram"?"Reel":"Short"} Insights
                    </p>
                    <p className="text-xs text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>@{insightItem.user}</p>
                  </div>
                </div>
                <button onClick={()=>setInsightItem(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              {/* Thumbnail preview */}
              <div className="relative h-48 overflow-hidden">
                <img src={insightItem.thumbnail} alt={insightItem.caption} className="w-full h-full object-cover"/>
                <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.8) 30%,transparent)" }}/>
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white text-sm font-medium line-clamp-2" style={{ fontFamily:"Inter,sans-serif" }}>{insightItem.caption}</p>
                  <p className="text-white/60 text-xs mt-1" style={{ fontFamily:"Inter,sans-serif" }}>by {insightItem.name}</p>
                </div>
                {insightItem.isVideo && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background:"rgba(255,255,255,0.15)",backdropFilter:"blur(4px)" }}>
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white"/>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* Virality */}
                <div className="rounded-2xl p-4" style={{ background:`${accentColor}0D`,border:`1px solid ${accentColor}25` }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color:accentColor,fontFamily:"Inter,sans-serif" }}>Virality Score</p>
                    <span className="text-2xl font-bold" style={{ color:accentColor,fontFamily:"'Cormorant Garamond',serif" }}>{insightItem.virality}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border">
                    <motion.div initial={{ width:0 }} animate={{ width:`${insightItem.virality}%` }} transition={{ duration:1,ease:"easeOut" }}
                      className="h-2 rounded-full" style={{ background:accentGrad }}/>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5" style={{ fontFamily:"Inter,sans-serif" }}>
                    {insightItem.virality>=90?"🔥 Top 5% — extremely viral":insightItem.virality>=80?"📈 Top 15% — high potential":"✅ Above average"}
                  </p>
                </div>

                {/* Boost status */}
                <div className="rounded-2xl p-3 border border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily:"Inter,sans-serif" }}>Boost Status</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background:insightItem.boosted?"#3B82F615":"#22c55e15" }}>
                      {insightItem.boosted?<Megaphone className="w-4 h-4 text-blue-400"/>:<Sparkles className="w-4 h-4 text-green-400"/>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
                        {insightItem.boosted?"Paid Promotion":"100% Organic"}
                      </p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily:"Inter,sans-serif" }}>
                        {insightItem.boosted?"Paid ads used to amplify reach":"Algorithm pushed this naturally"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2">
                  {(platform==="instagram"?[
                    { icon:Eye, label:"Views", val:insightItem.views, color:accentColor },
                    { icon:Heart, label:"Likes", val:insightItem.likes, color:"#ef4444" },
                    { icon:Share2, label:"Shares", val:insightItem.shares, color:G },
                    { icon:MessageCircle, label:"Comments", val:insightItem.comments, color:"#8b5cf6" },
                    { icon:Clock, label:"Watch Time", val:insightItem.watchTime, color:"#22c55e" },
                    { icon:Bookmark, label:"Save Rate", val:insightItem.saveRate, color:"#f59e0b" },
                  ]:[
                    { icon:Eye, label:"Views", val:insightItem.views, color:B },
                    { icon:ThumbsUp, label:"Likes", val:insightItem.likes, color:"#22c55e" },
                    { icon:Share2, label:"Shares", val:insightItem.shares, color:accentColor },
                    { icon:MessageCircle, label:"Comments", val:insightItem.comments, color:"#8b5cf6" },
                    { icon:MousePointerClick, label:"CTR", val:insightItem.ctr, color:B },
                    { icon:TrendingUp, label:"Avg View", val:insightItem.avgView, color:"#f59e0b" },
                  ]).map((s,i)=>(
                    <div key={i} className="flex flex-col items-center p-2.5 rounded-xl bg-background gap-1">
                      <s.icon className="w-3.5 h-3.5" style={{ color:s.color }}/>
                      <p className="text-xs font-bold text-foreground" style={{ fontFamily:"Inter,sans-serif" }}>{s.val}</p>
                      <p className="text-xs text-muted-foreground" style={{ fontSize:10,fontFamily:"Inter,sans-serif" }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* YouTube extras */}
                {platform==="youtube" && (
                  <>
                    <div className="rounded-2xl p-3 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5" style={{ fontFamily:"Inter,sans-serif" }}>Audience Retention</p>
                      <div className="flex items-start gap-2"><BarChart2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color:B }}/><p className="text-sm text-foreground" style={{ fontFamily:"Inter,sans-serif" }}>{insightItem.retention}</p></div>
                    </div>
                    <div className="rounded-2xl p-3 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5" style={{ fontFamily:"Inter,sans-serif" }}>Thumbnail Hook</p>
                      <div className="flex items-start gap-2"><Target className="w-4 h-4 shrink-0 mt-0.5" style={{ color:B }}/><p className="text-sm text-foreground" style={{ fontFamily:"Inter,sans-serif" }}>{insightItem.thumbHook}</p></div>
                    </div>
                    <div className="rounded-2xl p-3 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5" style={{ fontFamily:"Inter,sans-serif" }}>Top Comment</p>
                      <p className="text-sm text-foreground italic" style={{ fontFamily:"Inter,sans-serif" }}>{insightItem.topComment}</p>
                    </div>
                  </>
                )}

                {/* Why viral */}
                <div className="rounded-2xl p-3" style={{ background:"#22c55e0D",border:"1px solid #22c55e25" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:"#22c55e",fontFamily:"Inter,sans-serif" }}>Why It Went Viral</p>
                  <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily:"Inter,sans-serif" }}>{insightItem.reason}</p>
                </div>

                {/* Hook */}
                <div className="rounded-2xl p-3 border border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5" style={{ fontFamily:"Inter,sans-serif" }}>Hook Analysis</p>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color:accentColor }}/>
                    <p className="text-sm text-foreground" style={{ fontFamily:"Inter,sans-serif" }}>{insightItem.hook}</p>
                  </div>
                </div>

                {/* Audio + hashtags */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl p-3 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5" style={{ fontFamily:"Inter,sans-serif" }}>Audio</p>
                    <div className="flex items-center gap-1.5"><Music2 className="w-3.5 h-3.5 shrink-0" style={{ color:accentColor }}/><p className="text-xs text-foreground" style={{ fontFamily:"Inter,sans-serif" }}>{insightItem.audio}</p></div>
                  </div>
                  <div className="rounded-2xl p-3 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5" style={{ fontFamily:"Inter,sans-serif" }}>Hashtags</p>
                    <div className="flex flex-wrap gap-1">
                      {insightItem.hashtags.slice(0,3).map((h:string,i:number)=>(
                        <span key={i} className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ background:`${accentColor}15`,color:accentColor,fontFamily:"Inter,sans-serif" }}>{h}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={()=>{ setInsightItem(null); navigate(platform==="instagram"?"/scripts":"/youtube/script",{state:{topic:insightItem.niche}}); }}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background:accentGrad,color:platform==="instagram"?"#111":"#fff",fontFamily:"Inter,sans-serif" }}>
                  <Sparkles className="w-4 h-4"/>
                  Generate {platform==="instagram"?"Reel":"YouTube"} Script for {insightItem.niche}
                  <ArrowRight className="w-4 h-4"/>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}