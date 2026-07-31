import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

export function StatsCard({ title, value, change, changeType, icon: Icon, delay = 0 }: StatsCardProps) {
  return (
    <div 
      className="glass-card rounded-xl p-6 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold font-display">{value}</p>
          <p className={cn(
            "mt-1 text-sm",
            changeType === "positive" && "text-emerald-400",
            changeType === "negative" && "text-destructive",
            changeType === "neutral" && "text-muted-foreground"
          )}>
            {change}
          </p>
        </div>
        <div className="rounded-lg bg-secondary p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

