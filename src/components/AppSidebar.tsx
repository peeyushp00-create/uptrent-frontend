import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, Newspaper, FileText,
  PanelLeftClose, PanelLeft, LogOut, Settings,
  Sun, Moon, ChevronUp, Crown, Youtube, Instagram,
  Search, Tag,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const instagramNav = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Newspaper, label: "News Feed", path: "/news" },
  { icon: FileText, label: "Scripts", path: "/scripts" },
  { icon: Search, label: "Analyzer", path: "/instagram/analyzer" },
];

const youtubeNav = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Tag, label: "SEO", path: "/youtube/seo" },
  { icon: FileText, label: "Script", path: "/youtube/script" },
  { icon: Search, label: "Analyzer", path: "/youtube/analyzer" },
  { icon: TrendingUp, label: "Trending", path: "/youtube/trending" },
];

const C = {
  bg: "#111111",
  sidebar: "#171717",
  card: "#1C1C1C",
  border: "#2E2E2E",
  gold: "#E8B84B",
  goldDark: "#C17D20",
  text: "#EDE0C8",
  muted: "#6B6B6B",
  subtle: "#242424",
};

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    if (p === "youtube") navigate("/youtube/seo");
    else navigate("/");
  };

  const isYoutubePath = location.pathname.startsWith("/youtube");
  const effectivePlatform = isYoutubePath ? "youtube" : platform;
  const navItems = effectivePlatform === "youtube" ? youtubeNav : instagramNav;

  const avatarInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <aside
      className={`flex flex-col h-screen transition-all duration-300 relative ${collapsed ? "w-16" : "w-60"}`}
      style={{ background: C.sidebar, borderRight: `1px solid ${C.border}` }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
          <img src="/logo.png" alt="Uptrent" className="w-8 h-8 rounded-lg object-cover" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-lg tracking-tight" style={{ color: C.text }}>
            Uptrent
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto transition-colors"
          style={{ color: C.muted }}
          onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Platform toggle */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
            <button
              onClick={() => switchPlatform("instagram")}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={effectivePlatform === "instagram"
                ? { background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: "#111" }
                : { color: C.muted }}
            >
              <Instagram className="w-3.5 h-3.5" />
              Instagram
            </button>
            <button
              onClick={() => switchPlatform("youtube")}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={effectivePlatform === "youtube"
                ? { background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: "#111" }
                : { color: C.muted }}
            >
              <Youtube className="w-3.5 h-3.5" />
              YouTube
            </button>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={active
                ? { background: `${C.gold}18`, color: C.gold, borderLeft: `2px solid ${C.gold}` }
                : { color: C.muted, borderLeft: "2px solid transparent" }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.subtle; e.currentTarget.style.color = C.text; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; } }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Profile popup */}
      {showProfileMenu && (
        <div className="absolute bottom-16 left-2 right-2 rounded-2xl z-50 overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}>
          <div className="p-3" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: "#111" }}>
                {avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: C.text }}>{user?.user_metadata?.full_name || 'Creator'}</p>
                <p className="text-xs truncate" style={{ color: C.muted }}>{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="p-1">
            {[
              { icon: Settings, label: "Settings", action: () => { navigate('/settings'); setShowProfileMenu(false); } },
              { icon: theme === "dark" ? Sun : Moon, label: theme === "dark" ? "Light Mode" : "Dark Mode", action: () => { toggleTheme(); setShowProfileMenu(false); } },
            ].map((item, i) => (
              <button key={i} onClick={item.action}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all"
                style={{ color: C.muted }}
                onMouseEnter={e => { e.currentTarget.style.background = C.subtle; e.currentTarget.style.color = C.text; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; }}
              >
                <item.icon className="w-4 h-4" />{item.label}
              </button>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}`, margin: "4px 0" }} />
            <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all"
              style={{ color: C.gold }}
              onMouseEnter={e => { e.currentTarget.style.background = `${C.gold}10`; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <Crown className="w-4 h-4" />Upgrade to Pro
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all"
              style={{ color: "#ef4444" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ef444410"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        </div>
      )}

      {/* Bottom profile */}
      <div className="p-2" style={{ borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-xl transition-all"
          onMouseEnter={e => { e.currentTarget.style.background = C.subtle; }}
          onMouseLeave={e => { if (!showProfileMenu) e.currentTarget.style.background = "transparent"; }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, color: "#111" }}>
            {avatarInitials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium truncate" style={{ color: C.text }}>{user?.user_metadata?.full_name || 'Creator'}</p>
                <p className="text-xs truncate" style={{ color: C.muted }}>{user?.email}</p>
              </div>
              <ChevronUp className={`w-4 h-4 transition-transform ${showProfileMenu ? '' : 'rotate-180'}`} style={{ color: C.muted }} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
