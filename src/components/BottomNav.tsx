import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Newspaper, FileText, Settings, Youtube, Instagram, Tag, Search } from "lucide-react";

const IG_GRAD = "linear-gradient(135deg, #6f48b2, #9c27b0)";
const IG_COLOR = "#6f48b2";
const YT_GRAD = "linear-gradient(135deg, #c62828, #e53935)";
const YT_COLOR = "#c62828";

const instagramNav = [
  { icon: LayoutDashboard, label: "Home", path: "/home" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Newspaper, label: "News", path: "/news" },
  { icon: FileText, label: "Scripts", path: "/scripts" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const youtubeNav = [
  { icon: LayoutDashboard, label: "Home", path: "/home" },
  { icon: Tag, label: "SEO", path: "/youtube/seo" },
  { icon: FileText, label: "Script", path: "/youtube/script" },
  { icon: Search, label: "Analyzer", path: "/youtube/analyzer" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );

  // Sync with sidebar toggle
  useEffect(() => {
    const handleCustom = (e: any) => setPlatform(e.detail);
    window.addEventListener("platformChanged", handleCustom);
    return () => window.removeEventListener("platformChanged", handleCustom);
  }, []);

  const isYoutubePath = location.pathname.startsWith("/youtube");
  const effectivePlatform = isYoutubePath ? "youtube" : platform;
  const navItems = effectivePlatform === "instagram" ? instagramNav : youtubeNav;
  const activeGrad = effectivePlatform === "instagram" ? IG_GRAD : YT_GRAD;
  const activeColor = effectivePlatform === "instagram" ? IG_COLOR : YT_COLOR;
  const activeBg = effectivePlatform === "instagram" ? "#ede7f6" : "#ffebee";

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    window.dispatchEvent(new CustomEvent("platformChanged", { detail: p }));
    navigate("/home");
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'hsl(var(--card))',
      borderTop: '1px solid hsl(var(--border))',
    }}>
      {/* Platform toggle */}
      <div style={{ display: 'flex', gap: '6px', padding: '8px 12px 4px', borderBottom: '1px solid hsl(var(--border))' }}>
        <button
          onClick={() => switchPlatform("instagram")}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px', padding: '7px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '11px', fontWeight: 700,
            background: effectivePlatform === "instagram" ? IG_GRAD : 'transparent',
            color: effectivePlatform === "instagram" ? 'white' : 'hsl(var(--muted-foreground))',
            transition: 'all 0.2s',
          }}>
          <Instagram style={{ width: '14px', height: '14px' }} />
          Instagram
        </button>
        <button
          onClick={() => switchPlatform("youtube")}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px', padding: '7px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '11px', fontWeight: 700,
            background: effectivePlatform === "youtube" ? YT_GRAD : 'transparent',
            color: effectivePlatform === "youtube" ? 'white' : 'hsl(var(--muted-foreground))',
            transition: 'all 0.2s',
          }}>
          <Youtube style={{ width: '14px', height: '14px' }} />
          YouTube
        </button>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 4px 12px' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                padding: '6px 12px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: active ? activeBg : 'transparent',
                color: active ? activeColor : 'hsl(var(--muted-foreground))',
                transition: 'all 0.2s', minWidth: '56px',
              }}>
              <item.icon style={{ width: '20px', height: '20px', color: active ? activeColor : undefined }} />
              <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}