import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const chips = [
  "Fitness", "Motivation", "Stock Market", "Crypto",
  "Travel", "Food", "Tech", "Business",
  "Fashion", "Gaming", "Comedy", "Cricket",
  "Education", "Yoga", "Entrepreneur", "Bollywood",
];

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (!search.trim()) return;
    navigate("/trending", { state: { query: search } });
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

        {/* Search */}
        <div className="flex gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search content ideas (e.g. Fitness, Cricket, Finance)..."
              className="w-full pl-11 pr-5 py-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors text-sm"
            />
          </div>
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
                onClick={() => {
                  setSearch(chip);
                  navigate("/trending", { state: { query: chip } });
                }}
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