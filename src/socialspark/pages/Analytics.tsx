import { DashboardLayout } from "@/socialspark/components/layout/DashboardLayout";
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  TrendingDown,
  Users,
  Play
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const viewsData = [
  { date: "Dec 1", views: 12400, engagement: 890 },
  { date: "Dec 5", views: 18200, engagement: 1200 },
  { date: "Dec 9", views: 15600, engagement: 980 },
  { date: "Dec 13", views: 24500, engagement: 1800 },
  { date: "Dec 17", views: 21000, engagement: 1450 },
];

const platformStats = [
  { name: "YouTube", views: "89.2K", change: "+12%", positive: true },
  { name: "Instagram", views: "45.8K", change: "+8%", positive: true },
  { name: "TikTok", views: "32.1K", change: "+24%", positive: true },
  { name: "LinkedIn", views: "12.4K", change: "-3%", positive: false },
];

const topContent = [
  { title: "10 Tips for Better Content", views: "24.5K", engagement: "8.2%", platform: "YouTube" },
  { title: "Behind the Scenes", views: "18.2K", engagement: "12.1%", platform: "Instagram" },
  { title: "Quick Tutorial #15", views: "15.8K", engagement: "15.3%", platform: "TikTok" },
  { title: "Industry Insights", views: "8.4K", engagement: "6.8%", platform: "LinkedIn" },
];

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-6 md:mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track your content performance across all platforms.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {[
            { label: "Total Views", value: "2.4M", change: "+12.5%", icon: Eye, positive: true },
            { label: "Engagement", value: "186K", change: "+8.3%", icon: Heart, positive: true },
            { label: "Shares", value: "24.8K", change: "+15.2%", icon: Share2, positive: true },
            { label: "New Followers", value: "+5.2K", change: "+4.1%", icon: Users, positive: true },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-xl p-3 md:p-6">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <span className="text-xs md:text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </div>
              <p className="text-xl md:text-3xl font-bold font-display">{stat.value}</p>
              <p className={`text-xs md:text-sm mt-1 flex items-center gap-1 ${stat.positive ? 'text-emerald-400' : 'text-destructive'}`}>
                {stat.positive ? <TrendingUp className="h-2 w-2 md:h-3 md:w-3" /> : <TrendingDown className="h-2 w-2 md:h-3 md:w-3" />}
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Views Chart */}
          <div className="lg:col-span-2 glass-card rounded-xl p-4 md:p-6">
            <h3 className="font-display text-lg font-semibold mb-6">Views Over Time</h3>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewsData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold mb-4">By Platform</h3>
            <div className="space-y-4">
              {platformStats.map((platform, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-sm">{platform.name}</p>
                    <p className="text-xl font-bold font-display">{platform.views}</p>
                  </div>
                  <span className={`text-sm ${platform.positive ? 'text-emerald-400' : 'text-destructive'}`}>
                    {platform.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Content */}
        <div className="mt-6 md:mt-8">
          <h3 className="font-display text-lg font-semibold mb-4">Top Performing Content</h3>

          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            {topContent.map((item, i) => (
              <div key={i} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                    <span className="inline-block mt-1 px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
                      {item.platform}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.views}</span>
                  <span className="text-emerald-400">{item.engagement}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block glass-card rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Content</th>
                    <th className="pb-3 font-medium">Platform</th>
                    <th className="pb-3 font-medium">Views</th>
                    <th className="pb-3 font-medium">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {topContent.map((item, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                            <Play className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-sm">
                          {item.platform}
                        </span>
                      </td>
                      <td className="py-4 font-medium">{item.views}</td>
                      <td className="py-4 text-emerald-400">{item.engagement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

