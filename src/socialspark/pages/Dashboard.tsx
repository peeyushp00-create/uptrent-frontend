import { Eye, Heart, Users, Video, Bell, Search, Menu, User, Settings, LogOut, HelpCircle } from "lucide-react";
import { DashboardLayout } from "@/socialspark/components/layout/DashboardLayout";
import { StatsCard } from "@/socialspark/components/dashboard/StatsCard";
import { PlatformCard } from "@/socialspark/components/dashboard/PlatformCard";
import { UploadZone } from "@/socialspark/components/dashboard/UploadZone";
import { RecentContent } from "@/socialspark/components/dashboard/RecentContent";
import { AIInsights } from "@/socialspark/components/dashboard/AIInsights";
import { SchedulePreview } from "@/socialspark/components/dashboard/SchedulePreview";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

// Platform icons as SVG components
const YouTubeIcon = () => (
  <svg className="h-5 w-5 text-youtube" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-5 w-5 text-instagram" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="h-5 w-5 text-tiktok" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-5 w-5 text-linkedin" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const stats = [
  { title: "Total Views", value: "2.4M", change: "+12.5% from last month", changeType: "positive" as const, icon: Eye },
  { title: "Engagement Rate", value: "8.7%", change: "+2.1% from last month", changeType: "positive" as const, icon: Heart },
  { title: "Followers", value: "156K", change: "+5.2K this week", changeType: "positive" as const, icon: Users },
  { title: "Videos Posted", value: "47", change: "8 this month", changeType: "neutral" as const, icon: Video },
];

const platforms = [
  { name: "YouTube", icon: <YouTubeIcon />, connected: true, followers: "89.2K subscribers", colorClass: "bg-youtube/20" },
  { name: "Instagram", icon: <InstagramIcon />, connected: true, followers: "45.8K followers", colorClass: "bg-instagram/20" },
  { name: "TikTok", icon: <TikTokIcon />, connected: true, followers: "21.5K followers", colorClass: "bg-tiktok/20" },
  { name: "LinkedIn", icon: <LinkedInIcon />, connected: false, followers: "", colorClass: "bg-linkedin/20" },
];

const notifications = [
  {
    id: 1,
    title: "New follower on Instagram",
    message: "John Doe started following you",
    time: "2 minutes ago",
    unread: true,
  },
  {
    id: 2,
    title: "Video performance boost",
    message: "Your TikTok video gained 500+ views in the last hour",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    title: "YouTube comment",
    message: "Someone commented on your latest video: 'Great content!'",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: 4,
    title: "Analytics update",
    message: "Your weekly analytics report is ready",
    time: "1 day ago",
    unread: false,
  },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) return setSidebarOpen(false);
    setSidebarOpen(true);
  };

  handleResize();
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative flex-1 max-w-xs md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search content, analytics..."
              className="w-full rounded-lg bg-secondary/50 py-2 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                      notification.unread ? "bg-muted/20" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <Button variant="ghost" className="w-full text-sm">
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>QS</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 md:p-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Welcome back, <span className="gradient-text">Creator</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm md:text-base">
            Here's what's happening with your content today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={stat.title} {...stat} delay={index * 100} />
          ))}
        </div>

        {/* Platforms */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">Connected Platforms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform, index) => (
              <PlatformCard key={platform.name} {...platform} delay={index * 100 + 200} />
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UploadZone />
            <RecentContent />
          </div>
          <div className="space-y-6">
            <AIInsights />
            <SchedulePreview />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

