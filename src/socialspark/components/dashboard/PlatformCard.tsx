import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PlatformCardProps {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  followers: string;
  colorClass: string;
  delay?: number;
}

export function PlatformCard({ name, icon, connected, followers, colorClass, delay = 0 }: PlatformCardProps) {
  return (
    <div 
      className="glass-card rounded-xl p-4 opacity-0 animate-fade-in hover:scale-[1.02] transition-transform duration-300 cursor-pointer group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg p-2.5", colorClass)}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            {connected && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-3 w-3 text-emerald-400" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {connected ? followers : "Not connected"}
          </p>
        </div>
      </div>
    </div>
  );
}

