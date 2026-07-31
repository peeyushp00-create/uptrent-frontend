import { Calendar, ChevronRight } from "lucide-react";

const scheduledPosts = [
  { time: "Today, 6:00 PM", title: "Product Launch Teaser", platform: "Instagram" },
  { time: "Tomorrow, 10:00 AM", title: "Weekly Tips #12", platform: "YouTube" },
  { time: "Dec 20, 2:00 PM", title: "Holiday Special", platform: "TikTok" },
];

export function SchedulePreview() {
  return (
    <div className="glass-card rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Upcoming</h3>
        </div>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          View Calendar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {scheduledPosts.map((post, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200 cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium">{post.title}</p>
              <p className="text-xs text-muted-foreground">{post.time}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
              {post.platform}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

