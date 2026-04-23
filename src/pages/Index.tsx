import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const chips = [
  "Fitness", "Motivation", "Stock Market", "Crypto",
  "Travel", "Food", "Tech", "Business",
  "Fashion", "Gaming", "Comedy", "Cricket",
  "Education", "Yoga", "Entrepreneur", "Bollywood",
];

export default function Index() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<"instagram" | "youtube">("instagram");
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (!search.trim()) return;
    navigate("/trending", { state: { query: search, type: platform } });
  };

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
            Find scroll-stopping content ideas for Instagram & YouTube creators
          </p>
        </div>

        {/* Platform selector */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setPlatform("instagram")}
            className={`flex-1 flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${
              platform === "instagram" ? "border-pink-500 border-2" : "border-border"
            } bg-card`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4537E" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="#D4537E" stroke="none"/>
                </svg>
              </div>
              <span className="font-medium text-foreground">Instagram</span>
            </div>
            {platform === "instagram" && (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-pink-500 text-white">Selected</span>
            )}
          </button>

          <button
            onClick={() => setPlatform("youtube")}
            className={`flex-1 flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${
              platform === "youtube" ? "border-red-500 border-2" : "border-border"
            } bg-card`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="#E24B4A" stroke="none"/>
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" stroke="none"/>
                </svg>
              </div>
              <span className="font-medium text-foreground">YouTube</span>
            </div>
            {platform === "youtube" && (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-red-500 text-white">Selected</span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={platform === "instagram" ? "Search Instagram content ideas..." : "Search YouTube content ideas..."}
            className="flex-1 px-5 py-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
          />
          <button
            onClick={handleSearch}
            className="px-8 py-4 rounded-xl text-white font-medium text-sm"
            style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
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
                onClick={() => setSearch(chip)}
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