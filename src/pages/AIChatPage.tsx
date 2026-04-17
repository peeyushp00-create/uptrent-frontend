import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2, Bot, User } from "lucide-react";
import { chatWithAI } from "@/lib/api";

interface Message {
  role: "user" | "ai";
  text: string;
}

const quickActions = [
  "What are trending topics this week?",
  "Give me 5 viral hook ideas",
  "Write a script for a fitness reel",
  "Best hashtags for travel content",
  "Content ideas for finance creators",
  "How to grow on Instagram in 2026?",
  "Write a YouTube video description",
  "What niche should I focus on?",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! I'm Uptrent AI. I can help you with trending topics, script writing, hashtags, content ideas and more. What would you like to create today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (message?: string) => {
    const msg = message || input;
    if (!msg.trim() || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const data = await chatWithAI(msg);
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-pink-500" />
          AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ask anything about content creation, trends, scripts and more
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-pink-500" />
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "text-white rounded-br-none"
                : "bg-card border border-border text-foreground rounded-bl-none"
            }`}
            style={msg.role === "user" ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}>
              {msg.text}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-pink-500" />
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-none">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div className="px-6 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors whitespace-nowrap"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-3 items-center bg-card border border-border rounded-xl px-4 py-3">
          <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI about content creation..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg text-white disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}