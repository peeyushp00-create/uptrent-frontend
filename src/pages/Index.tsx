import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { chatWithAI } from "@/lib/api";

const chips = [
  "Fitness", "Motivation", "Stock Market", "Crypto",
  "Travel", "Food", "Tech", "Business",
  "Fashion", "Gaming", "Comedy", "Cricket",
  "Education", "Yoga", "Entrepreneur", "Bollywood",
];

const quickActions = [
  { label: "Trending topics", action: "trending" },
  { label: "Generate script", action: "script" },
  { label: "Find hashtags", action: "hashtags" },
  { label: "Content ideas", action: "ideas" },
  { label: "Latest news", action: "news" },
  { label: "Quick hook", action: "hook" },
];

export default function Index() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<"instagram" | "youtube">("instagram");
  const [search, setSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleSearch = () => {
    if (!search.trim()) return;
    navigate("/trending", { state: { query: search, type: platform } });
  };

  const handleChat = async (message?: string) => {
    const msg = message || chatInput;
    if (!msg.trim()) return;
    setShowChat(true);
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: msg }]);
    setChatLoading(true);
    try {
      const data = await chatWithAI(msg);
      setChatMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "ai", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const messages: Record<string, string> = {
      trending: "What are the trending topics right now for content creators?",
      script: "Help me write a viral script for my next video",
      hashtags: "Give me the best hashtags for my content",
      ideas: "Give me 5 content ideas for my niche",
      news: "What's the latest news I can create content about?",
      hook: "Write me a viral hook for my next video",
    };
    handleChat(messages[action]);
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

        {/* AI Chat Section */}
        <div className="w-full border border-border rounded-2xl bg-card overflow-hidden">
          {/* Chat messages */}
          {showChat && chatMessages.length > 0 && (
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "text-white rounded-br-none"
                      : "bg-accent text-foreground rounded-bl-none"
                  }`}
                  style={msg.role === "user" ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-accent px-4 py-2 rounded-xl rounded-bl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick actions */}
          {!showChat && (
            <div className="p-3 flex flex-wrap gap-2 border-b border-border">
              {quickActions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Chat input */}
          <div className="flex items-center gap-2 p-3">
            <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChat()}
              placeholder="Ask AI anything about content creation..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={() => handleChat()}
              disabled={!chatInput.trim() || chatLoading}
              className="p-2 rounded-lg text-white disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}