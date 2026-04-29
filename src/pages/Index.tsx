import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Instagram, Youtube } from "lucide-react";

const instagramChips = [
  "Fitness", "Motivation", "Stock Market", "Crypto",
  "Travel", "Food", "Tech", "Business",
  "Fashion", "Gaming", "Comedy", "Cricket",
  "Education", "Yoga", "Entrepreneur", "Bollywood",
];

const youtubeChips = [
  "Tech Reviews", "Finance", "Motivation", "Gaming",
  "Travel Vlog", "Cooking", "Education", "Fitness",
  "Comedy", "Cricket", "Business", "Music",
  "Self Improvement", "Crypto", "Cars", "Movies",
];

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
 const [platform, setPlatform] = useState<"instagram" | "youtube">(
  () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
);

const switchPlatform = (p: "instagram" | "youtube") => {
  setPlatform(p);
  localStorage.setItem("platform", p);
};

  const handleSearch = () => {
    if (!search.trim()) return;
    if (platform === "instagram") {
      navigate("/trending", { state: { query: search } });
    } else {
      navigate("/youtube", { state: { query: search } });
    }
  };

  const handleChip = (chip: string) => {
    setSearch(chip);
    if (platform === "instagram") {
      navigate("/trending", { state: { query: chip } });
    } else {
      navigate("/youtube", { state: { query: chip } });
    }
  };

  const chips = platform === "instagram" ? instagramChips : youtubeChips;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen gap-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 w-full max-w-2xl"
      >
        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
          AI-powered content discovery
        </div>

        {/* Headline */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
            Discover{" "}
            <span className="text-pink-500">Viral</span>{" "}
            <span className="text-orange-500">Content</span>{" "}
            Ideas
          </h1>
          <p className="text-muted-foreground text-base">
            Find scroll-stopping content ideas for {platform === "instagram" ? "Instagram Reels" : "YouTube Videos"}
          </p>
        </div>

        {/* ✅ Platform toggle */}
        <div className="flex items-center gap-2 p-1 bg-card border border-border rounded-2xl">
          <button
            onClick={() => setPlatform("instagram")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              platform === "instagram" ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
            style={platform === "instagram" ? { background: "linear-gradient(135deg, #E8B84B, #C17D20)" } : {}}
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </button>
          <button
            onClick={() => setPlatform("youtube")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              platform === "youtube" ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
            style={platform === "youtube" ? { background: "linear-gradient(135deg, #E8B84B, #C17D20)" } : {}}
          >
            <Youtube className="w-4 h-4" />
            YouTube
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={platform === "instagram"
                ? "Search Instagram content ideas..."
                : "Search YouTube video ideas..."}
              className="w-full pl-11 pr-5 py-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-8 py-4 rounded-xl text-white font-medium text-sm"
            style={{
              background: platform === "instagram"
                ? "linear-gradient(135deg, #E8B84B, #C17D20)"
                : "linear-gradient(135deg, #E8B84B, #C17D20)"
            }}
          >
            Search
          </button>
        </div>

        {/* Chips */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-xs text-muted-foreground">Frequently searched</p>
          <div className="flex flex-wrap justify-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChip(chip)}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
