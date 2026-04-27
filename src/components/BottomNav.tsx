import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Newspaper, FileText, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Newspaper, label: "News", path: "/news" },
  { icon: FileText, label: "Scripts", path: "/scripts" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 4px 12px',
        borderTop: '1px solid hsl(var(--border))',
        background: 'hsl(var(--sidebar-background))',
      }}
    >
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 12px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: active ? 'linear-gradient(135deg, #D4537E, #D85A30)' : 'transparent',
              color: active ? 'white' : 'hsl(var(--muted-foreground))',
              transition: 'all 0.2s',
              minWidth: '56px',
            }}
          >
            <item.icon style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '10px', fontWeight: 500 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}