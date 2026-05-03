import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";

const YT_GRAD = "linear-gradient(135deg, #FF6B6B, #FFB86C)";
const YT_COLOR = "#FF6B6B";

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
          <TrendingUp className="w-5 h-5" style={{ color: YT_COLOR }} />
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
            <motion.div key={topic}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 transition-colors"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${YT_COLOR}40`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                style={{ background: `${YT_COLOR}18`, color: YT_COLOR }}>
                {i + 1}
              </div>
              <p className="flex-1 text-sm text-foreground">{topic}</p>
              <button
                onClick={() => navigate('/youtube/script', { state: { topic } })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-medium shrink-0"
                style={{ background: YT_GRAD }}>
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