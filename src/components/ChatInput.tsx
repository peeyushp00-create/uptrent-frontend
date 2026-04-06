import { useState } from "react";
import { ArrowRight, Sparkles, Settings2 } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
}

export default function ChatInput({ onSubmit, placeholder = "How can I help you grow?" }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <div className="chat-input-glow rounded-2xl bg-card p-1">
      <div className="px-4 pt-3 pb-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
        />
      </div>
      <div className="flex items-center justify-between px-3 pb-2">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Settings2 className="w-3.5 h-3.5" />
            Tools
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
