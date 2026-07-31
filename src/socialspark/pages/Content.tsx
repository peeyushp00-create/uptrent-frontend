import { DashboardLayout } from "@/socialspark/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Play, 
  MoreVertical, 
  Eye, 
  Heart, 
  MessageCircle,
  Trash2,
  Edit2,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const contentItems = [
  {
    id: 1,
    title: "10 Tips for Better Content Creation",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
    platforms: ["youtube", "tiktok", "instagram"],
    views: "24.5K",
    likes: "1.2K",
    comments: "89",
    status: "published",
    date: "Dec 15, 2024"
  },
  {
    id: 2,
    title: "Behind the Scenes - Studio Setup",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop",
    platforms: ["youtube", "linkedin"],
    views: "18.2K",
    likes: "856",
    comments: "42",
    status: "published",
    date: "Dec 12, 2024"
  },
  {
    id: 3,
    title: "Product Launch Announcement",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    platforms: ["instagram", "tiktok"],
    views: "—",
    likes: "—",
    comments: "—",
    status: "scheduled",
    date: "Dec 18, 2024"
  },
  {
    id: 4,
    title: "Quick Tutorial - Editing Tips",
    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop",
    platforms: ["youtube", "tiktok"],
    views: "12.8K",
    likes: "642",
    comments: "31",
    status: "published",
    date: "Dec 10, 2024"
  },
  {
    id: 5,
    title: "Year in Review 2024",
    thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop",
    platforms: ["youtube", "linkedin"],
    views: "—",
    likes: "—",
    comments: "—",
    status: "draft",
    date: "Dec 8, 2024"
  },
  {
    id: 6,
    title: "Q&A Session Highlights",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    platforms: ["youtube", "instagram"],
    views: "9.4K",
    likes: "523",
    comments: "67",
    status: "published",
    date: "Dec 5, 2024"
  },
];

const platformColors: Record<string, string> = {
  youtube: "bg-youtube/20 text-youtube",
  instagram: "bg-instagram/20 text-instagram",
  tiktok: "bg-tiktok/20 text-tiktok",
  linkedin: "bg-linkedin/20 text-linkedin",
};

const statusColors: Record<string, string> = {
  published: "bg-emerald-500/20 text-emerald-400",
  scheduled: "bg-amber-500/20 text-amber-400",
  draft: "bg-muted text-muted-foreground",
};

export default function Content() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("all");

  const filteredContent = contentItems.filter(item => 
    filter === "all" || item.status === filter
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Content Library</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Manage all your uploaded content in one place.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search content..." className="pl-10" />
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-secondary p-1 overflow-x-auto">
              {["all", "published", "scheduled", "draft"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors whitespace-nowrap",
                    filter === f ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredContent.map((item) => (
              <div key={item.id} className="glass-card rounded-xl overflow-hidden group">
                <div className="relative aspect-video">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="gradient" size="sm" className="gap-2">
                      <Play className="h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                  <span className={cn(
                    "absolute top-2 right-2 md:top-3 md:right-3 text-xs px-2 py-1 rounded capitalize",
                    statusColors[item.status]
                  )}>
                    {item.status}
                  </span>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{item.title}</h3>
                  <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-3">
                    {item.platforms.map((platform) => (
                      <span
                        key={platform}
                        className={cn("text-xs px-1.5 py-0.5 rounded capitalize", platformColors[platform])}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {item.likes}
                      </span>
                    </div>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block md:hidden space-y-3">
              {filteredContent.map((item) => (
                <div key={item.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-12 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        {item.platforms.map((platform) => (
                          <span
                            key={platform}
                            className={cn("text-xs px-1.5 py-0.5 rounded capitalize", platformColors[platform])}
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                      <span className={cn("inline-block text-xs px-2 py-1 rounded capitalize mb-2", statusColors[item.status])}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {item.comments}
                      </span>
                    </div>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border">
                      <th className="p-4 font-medium">Content</th>
                      <th className="p-4 font-medium">Platforms</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Views</th>
                      <th className="p-4 font-medium">Engagement</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContent.map((item) => (
                      <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-16 h-10 rounded object-cover"
                            />
                            <span className="font-medium text-sm">{item.title}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {item.platforms.map((platform) => (
                              <span
                                key={platform}
                                className={cn("text-xs px-1.5 py-0.5 rounded capitalize", platformColors[platform])}
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn("text-xs px-2 py-1 rounded capitalize", statusColors[item.status])}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{item.views}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {item.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {item.comments}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{item.date}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

