import { Play, MoreVertical, Eye, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const recentVideos = [
  {
    id: 1,
    title: "10 Tips for Better Content Creation",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop",
    platforms: ["youtube", "tiktok", "instagram"],
    views: "24.5K",
    likes: "1.2K",
    comments: "89",
    status: "published",
  },
  {
    id: 2,
    title: "Behind the Scenes - Studio Setup",
    thumbnail:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=200&fit=crop",
    platforms: ["youtube", "linkedin"],
    views: "18.2K",
    likes: "856",
    comments: "42",
    status: "published",
  },
  {
    id: 3,
    title: "Product Launch Announcement",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
    platforms: ["instagram", "tiktok"],
    views: "—",
    likes: "—",
    comments: "—",
    status: "scheduled",
  },
];

const platformColors = {
  youtube: "bg-red-500/20 text-red-400",
  instagram: "bg-pink-500/20 text-pink-400",
  tiktok: "bg-cyan-500/20 text-cyan-400",
  linkedin: "bg-blue-500/20 text-blue-400",
};

export function RecentContent() {
  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold">Recent Content</h3>
        <button className="text-sm text-cyan-400 hover:underline">
          View all
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {recentVideos.map((video) => (
          <div
            key={video.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition group"
          >
            {/* Thumbnail */}
            <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">
                {video.title}
              </h4>

              {/* Platforms */}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {video.platforms.map((platform) => (
                  <span
                    key={platform}
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-full capitalize",
                      platformColors[platform]
                    )}
                  >
                    {platform}
                  </span>
                ))}
                {video.status === "scheduled" && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                    Scheduled
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {video.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {video.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {video.comments}
                </span>
              </div>
            </div>

            {/* More */}
            <button className="opacity-0 group-hover:opacity-100 transition">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

