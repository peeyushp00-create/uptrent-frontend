import {
  TrendingUp,
  Newspaper,
  FileText,
  Search,
  Lightbulb,
  Hash,
  Zap,
  BarChart3,
} from "lucide-react";

const actions = [
  { icon: TrendingUp, label: "Trending topics", action: "trending" },
  { icon: Search, label: "Find niche", action: "niche" },
  { icon: FileText, label: "Generate script", action: "script" },
  { icon: Hash, label: "Find hashtags", action: "hashtags" },
  { icon: Lightbulb, label: "Content ideas", action: "ideas" },
  { icon: Newspaper, label: "Latest news", action: "news" },
  { icon: BarChart3, label: "Analyze trends", action: "analyze" },
  { icon: Zap, label: "Quick hook", action: "hook" },
];

interface ActionChipsProps {
  onAction: (action: string) => void;
}

export default function ActionChips({ onAction }: ActionChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
      {actions.map((a) => (
        <button
          key={a.action}
          onClick={() => onAction(a.action)}
          className="action-chip"
        >
          <a.icon className="w-4 h-4 text-muted-foreground" />
          {a.label}
        </button>
      ))}
    </div>
  );
}
