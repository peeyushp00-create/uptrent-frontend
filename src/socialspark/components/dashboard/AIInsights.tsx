import { Sparkles, TrendingUp, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const insights = [
  {
    icon: TrendingUp,
    title: "Trending Topic",
    description: '"AI in Daily Life" is gaining traction in your niche',
    action: "Create Content",
    color: "text-emerald-400",
  },
  {
    icon: Clock,
    title: "Best Time to Post",
    description: "Your audience is most active at 6 PM EST",
    action: "Schedule",
    color: "text-primary",
  },
  {
    icon: Target,
    title: "Engagement Tip",
    description: "Videos under 60s get 2.5x more shares",
    action: "Learn More",
    color: "text-accent",
  },
];

export function AIInsights() {
  return (
    <div className="glass-card rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="font-display text-lg font-semibold">AI Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200"
          >
            <div className="flex items-start gap-3">
              <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">{insight.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-3 w-full justify-center">
              {insight.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

