import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";

const TRENDING_TOPICS = [
  "AI tools for beginners India 2026",
  "How to make money online India",
  "Budget smartphone review India",
  "Stock market basics Hindi",
  "Weight loss transformation",
  "ChatGPT tutorial Hindi",
  "Travel vlog India hidden gems",
  "Passive income ideas India",
  "Python for beginners Hindi",
  "Best OTT shows 2026",
  "Home workout no equipment",
  "Crypto explained simply Hindi",
  "Study motivation for students",
  "Car review India budget",
  "Cooking quick meals Indian",
  "Mental health tips Hindi",
  "IPL 2026 analysis",
  "Business ideas India low investment",
  "English speaking tips Hindi",
  "Skincare routine India",
];

export default function YouTubeTrending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <h1 className="text-lg font-bold text-foreground">Trending on YouTube</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        <div>
          <h2 className="font-semibold text-foreground mb-1">Trending in India 🇮🇳</h2>
          <p className="text-xs text-muted-foreground">Popular video topics right now — click Script to generate a script</p>
        </div>

        <div className="space-y-2">
          {TRENDING_TOPICS.map((topic, i) => (
            <motion.div
              key={topic}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-red-500/30 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs shrink-0">
                {i + 1}
              </div>
              <p className="flex-1 text-sm text-foreground">{topic}</p>
              <button
                onClick={() => navigate('/youtube/script', { state: { topic } })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-medium shrink-0"
                style={{ background: "linear-gradient(135deg, #E8B84B, #C17D20)" }}
              >
                <Sparkles className="w-3 h-3" />
                Script
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
