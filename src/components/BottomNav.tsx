import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Newspaper, FileText, Settings, Youtube, Instagram } from "lucide-react";

const instagramNav = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Newspaper, label: "News", path: "/news" },
  { icon: FileText, label: "Scripts", path: "/scripts" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const youtubeNav = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Youtube, label: "YouTube", path: "/youtube" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [platform, setPlatform] = useState<"instagram" | "youtube">("instagram");

  const navItems = platform === "instagram" ? instagramNav : youtubeNav;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'hsl(var(--sidebar-background))',
      borderTop: '1px solid hsl(var(--border))',
    }}>
      {/* ✅ Platform toggle */}
      <div style={{ display: 'flex', gap: '6px', padding: '8px 12px 4px', borderBottom: '1px solid hsl(var(--border))' }}>
        <button
          onClick={() => { setPlatform("instagram"); navigate("/"); }}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px', padding: '6px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '11px', fontWeight: 600,
            background: platform === "instagram" ? "linear-gradient(135deg, #D4537E, #D85A30)" : 'transparent',
            color: platform === "instagram" ? 'white' : 'hsl(var(--muted-foreground))',
          }}
        >
          <Instagram style={{ width: '14px', height: '14px' }} />
          Instagram
        </button>
        <button
          onClick={() => { setPlatform("youtube"); navigate("/"); }}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px', padding: '6px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '11px', fontWeight: 600,
            background: platform === "youtube" ? "linear-gradient(135deg, #FF0000, #CC0000)" : 'transparent',
            color: platform === "youtube" ? 'white' : 'hsl(var(--muted-foreground))',
          }}
        >
          <Youtube style={{ width: '14px', height: '14px' }} />
          YouTube
        </button>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 4px 12px' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                padding: '6px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: active ? (platform === 'youtube' ? 'linear-gradient(135deg, #FF0000, #CC0000)' : 'linear-gradient(135deg, #D4537E, #D85A30)') : 'transparent',
                color: active ? 'white' : 'hsl(var(--muted-foreground))',
                transition: 'all 0.2s', minWidth: '56px',
              }}
            >
              <item.icon style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '10px', fontWeight: 500 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}