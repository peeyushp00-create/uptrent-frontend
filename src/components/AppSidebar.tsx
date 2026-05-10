import { useState, useEffect } from "react";
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

// ── Instagram: Teal + Aqua ──
const IG_COLOR = "#14BBA6";
const IG_GRAD = "linear-gradient(135deg, #14BBA6, #22D3EE)";

// ── YouTube: Warm Sunset ──
const YT_COLOR = "#FF6B6B";
const YT_GRAD = "linear-gradient(135deg, #FF6B6B, #FFB86C)";

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

  useEffect(() => {
    const handleCustom = (e: any) => setPlatform(e.detail);
    window.addEventListener("platformChanged", handleCustom);
    return () => window.removeEventListener("platformChanged", handleCustom);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    window.dispatchEvent(new StorageEvent("storage", { key: "platform", newValue: p }));
    window.dispatchEvent(new CustomEvent("platformChanged", { detail: p }));
   if (p === "youtube") navigate("/");
else navigate("/");
  };

  const isYoutubePath = location.pathname.startsWith("/youtube");
  const effectivePlatform = isYoutubePath ? "youtube" : platform;
  const navItems = effectivePlatform === "youtube" ? youtubeNav : instagramNav;
  const ac = effectivePlatform === "instagram" ? IG_COLOR : YT_COLOR;
  const ag = effectivePlatform === "instagram" ? IG_GRAD : YT_GRAD;

  const avatarInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <aside className={`flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 relative ${collapsed ? "w-16" : "w-60"}`}>

      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
          <img src="/logo.png" alt="SocialRum" className="w-8 h-8 rounded-lg object-cover" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-lg tracking-tight text-foreground">SocialRum</span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Platform toggle */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-background border border-border">
            <button onClick={() => switchPlatform("instagram")}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={effectivePlatform === "instagram"
                ? { background: IG_GRAD, color: "#fff" }
                : { color: "hsl(var(--muted-foreground))" }}>
              <Instagram className="w-3.5 h-3.5" />
              Instagram
            </button>
            <button onClick={() => switchPlatform("youtube")}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={effectivePlatform === "youtube"
                ? { background: YT_GRAD, color: "#fff" }
                : { color: "hsl(var(--muted-foreground))" }}>
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
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              }`}
              style={active
                ? { background: `${ac}18`, borderLeft: `2px solid ${ac}` }
                : { borderLeft: "2px solid transparent" }}>
              <item.icon className="w-4 h-4 flex-shrink-0" style={active ? { color: ac } : {}} />
              {!collapsed && <span style={active ? { color: ac } : {}}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Profile popup */}
      {showProfileMenu && (
        <div className="absolute bottom-16 left-2 right-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                style={{ background: ag }}>{avatarInitials}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.user_metadata?.full_name || 'Creator'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="p-1">
            <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors">
              <Settings className="w-4 h-4 text-muted-foreground" />Settings
            </button>
            <button onClick={() => { toggleTheme(); setShowProfileMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors">
              {theme === "dark"
                ? <><Sun className="w-4 h-4 text-muted-foreground" />Light Mode</>
                : <><Moon className="w-4 h-4 text-muted-foreground" />Dark Mode</>}
            </button>
            <div className="border-t border-border my-1" />
            <button onClick={() => { navigate('/pricing'); setShowProfileMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
              style={{ color: ac }}>
              <Crown className="w-4 h-4" />Upgrade to Pro
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        </div>
      )}

      {/* Bottom profile */}
      <div className="p-2 border-t border-sidebar-border">
        <button onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`flex items-center gap-3 w-full px-2 py-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors ${showProfileMenu ? 'bg-sidebar-accent' : ''}`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
            style={{ background: ag }}>{avatarInitials}</div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-foreground truncate">{user?.user_metadata?.full_name || 'Creator'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileMenu ? '' : 'rotate-180'}`} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}