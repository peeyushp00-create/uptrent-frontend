import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatInput from "@/components/ChatInput";
import ActionChips from "@/components/ActionChips";
import { motion } from "framer-motion";

export default function Index() {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    switch (action) {
      case "trending":
      case "analyze":
        navigate("/trending");
        break;
      case "news":
        navigate("/news");
        break;
      case "script":
      case "hook":
        navigate("/scripts");
        break;
      default:
        navigate("/trending");
    }
  };

  const handleChat = (message: string) => {
    navigate("/scripts", { state: { prompt: message } });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-center text-foreground">
          Where should we start?
        </h1>

        {/* Banner */}
        <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-3">
          <p className="text-sm text-secondary-foreground">
            🔥 Finance trends on Instagram are updating live
          </p>
          <button
            onClick={() => navigate("/trending")}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View Trends
          </button>
        </div>

        {/* Chat Input */}
        <ChatInput onSubmit={handleChat} />

        {/* Action Chips */}
        <ActionChips onAction={handleAction} />
      </motion.div>
    </div>
  );
}
