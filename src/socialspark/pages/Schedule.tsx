import { DashboardLayout } from "@/socialspark/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const currentMonth = "December 2024";

// Mock calendar data
const calendarDays = Array.from({ length: 35 }, (_, i) => {
  const day = i - 6; // Start from previous month
  return {
    day: day <= 0 ? 30 + day : day > 31 ? day - 31 : day,
    isCurrentMonth: day > 0 && day <= 31,
    isToday: day === 18,
    events: day === 18 ? [{ title: "Product Launch", platform: "instagram", time: "6:00 PM" }]
           : day === 19 ? [{ title: "Weekly Tips #12", platform: "youtube", time: "10:00 AM" }]
           : day === 20 ? [{ title: "Holiday Special", platform: "tiktok", time: "2:00 PM" }]
           : day === 22 ? [{ title: "Year in Review", platform: "linkedin", time: "9:00 AM" }]
           : []
  };
});

const platformColors: Record<string, string> = {
  youtube: "bg-youtube/20 border-l-youtube",
  instagram: "bg-instagram/20 border-l-instagram",
  tiktok: "bg-tiktok/20 border-l-tiktok",
  linkedin: "bg-linkedin/20 border-l-linkedin",
};

const upcomingPosts = [
  { title: "Product Launch Teaser", platform: "Instagram", time: "Today, 6:00 PM", status: "scheduled" },
  { title: "Weekly Tips #12", platform: "YouTube", time: "Tomorrow, 10:00 AM", status: "scheduled" },
  { title: "Holiday Special", platform: "TikTok", time: "Dec 20, 2:00 PM", status: "draft" },
  { title: "Year in Review", platform: "LinkedIn", time: "Dec 22, 9:00 AM", status: "scheduled" },
];

export default function Schedule() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Content Schedule</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Plan and schedule your content across all platforms.
            </p>
          </div>
          <Button variant="gradient" className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Schedule Post
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Calendar */ }
          <div className="lg:col-span-2 glass-card rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">{currentMonth}</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Container - Scrollable on mobile */}
            <div className="overflow-x-auto md:overflow-visible">
              <div className="min-w-[280px] md:min-w-0">
                {/* Days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {days.map(day => (
                    <div key={day} className="text-center text-xs md:text-sm text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        "min-h-[80px] md:min-h-[100px] p-1 md:p-2 rounded-lg border border-transparent hover:border-border transition-colors cursor-pointer",
                        !item.isCurrentMonth && "opacity-30",
                        item.isToday && "bg-primary/10 border-primary/30"
                      )}
                    >
                      <span className={cn(
                        "text-xs md:text-sm",
                        item.isToday && "text-primary font-semibold"
                      )}>
                        {item.day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {item.events.map((event, j) => (
                          <div
                            key={j}
                            className={cn(
                              "text-xs p-1 rounded border-l-2 truncate",
                              platformColors[event.platform]
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Upcoming Posts</h3>
            <div className="space-y-3">
              {upcomingPosts.map((post, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{post.time}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      post.status === "scheduled" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {post.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {post.platform}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

