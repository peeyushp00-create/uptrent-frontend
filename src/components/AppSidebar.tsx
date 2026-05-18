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

const PRIMARY = "#6f48b2";
const SECONDARY = "#9c27b0";
const PRIMARY_GRAD = "linear-gradient(135deg, #6f48b2, #9c27b0)";
const PRIMARY_CONTAINER = "#ede7f6";
const YT_GRAD = "linear-gradient(135deg, #c62828, #e53935)";
const YT_COLOR = "#c62828";
const YT_CONTAINER = "#ffebee";

const instagramNav = [
  { icon: LayoutDashboard, label: "Home", path: "/home" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Newspaper, label: "News Feed", path: "/news" },
  { icon: FileText, label: "Scripts", path: "/scripts" },
  { icon: Search, label: "Analyzer", path: "/instagram/analyzer" },
];

const youtubeNav = [
  { icon: LayoutDashboard, label: "Home", path: "/home" },
  { icon: Tag, label: "SEO", path: "/youtube/seo" },
  { icon: FileText, label: "Script", path: "/youtube/script" },
  { icon: Search, label: "Analyzer", path: "/youtube/analyzer" },
  { icon: TrendingUp, label: "Trending", path: "/youtube/trending" },
];

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

  // Listen for platform changes from Index page
  useEffect(() => {
    const handleCustom = (e: any) => setPlatform(e.detail);
    const handleStorage = () => {
      const p = localStorage.getItem("platform") as "instagram" | "youtube";
      if (p) setPlatform(p);
    };
    window.addEventListener("platformChanged", handleCustom);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("platformChanged", handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogout = async () => { await signOut(); navigate("/login"); };

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    window.dispatchEvent(new CustomEvent("platformChanged", { detail: p }));
     navigate("/home");
  };

  const isYoutubePath = location.pathname.startsWith("/youtube");
  const effectivePlatform = isYoutubePath ? "youtube" : platform;
  const navItems = effectivePlatform === "youtube" ? youtubeNav : instagramNav;
  const ac = effectivePlatform === "youtube" ? YT_COLOR : PRIMARY;
  const ag = effectivePlatform === "youtube" ? YT_GRAD : PRIMARY_GRAD;
  const acContainer = effectivePlatform === "youtube" ? YT_CONTAINER : PRIMARY_CONTAINER;

  const avatarInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <aside className={`flex flex-col h-screen border-r border-border bg-card transition-all duration-300 relative ${collapsed ? "w-16" : "w-60"}`}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GRAD }}>
          <img src="/logo.png" alt="SocialRum" className="w-8 h-8 rounded-xl object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif', color: PRIMARY }}>
            SocialRum
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent">
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Platform toggle */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-1 p-1 rounded-xl" >
            <button onClick={() => switchPlatform("instagram")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              style={effectivePlatform === "instagram"
                ? { background: PRIMARY_GRAD, color: '#fff', boxShadow: '0 2px 8px rgba(36,56,156,0.3)' }
                : { color: '#757684' }}>
              <Instagram className="w-3.5 h-3.5" />
              Instagram
            </button>
            <button onClick={() => switchPlatform("youtube")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              style={effectivePlatform === "youtube"
                ? { background: PRIMARY_GRAD, color: '#fff', boxShadow: '0 2px 8px rgba(36,56,156,0.3)' }
                : { color: '#757684' }}>
              <Youtube className="w-3.5 h-3.5" />
              YouTube
            </button>
          </div>
        </div>
      )}

      {/* Collapsed platform icon */}
      {collapsed && (
        <div className="flex justify-center pt-3 pb-1">
          <button onClick={() => switchPlatform(effectivePlatform === "instagram" ? "youtube" : "instagram")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: PRIMARY_GRAD }}>
            {effectivePlatform === "instagram"
              ? <Instagram className="w-4 h-4 text-white" />
              : <Youtube className="w-4 h-4 text-white" />}
          </button>
        </div>
      )}

      {/* Section label */}
      {!collapsed && (
        <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#c5c5d4' }}>
          {effectivePlatform === "instagram" ? "Instagram" : "YouTube"}
        </p>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={active
                ? { background: acContainer, color: ac }
                : { color: '#454652' }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "hsl(var(--accent))"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = ''; }}>
              <item.icon className="w-4 h-4 shrink-0" style={active ? { color: ac } : { color: '#757684' }} />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: ag }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t space-y-1" >

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground/80 transition-all"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "hsl(var(--accent))"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
          {theme === "dark"
            ? <Sun className="w-4 h-4 shrink-0 text-muted-foreground" />
            : <Moon className="w-4 h-4 shrink-0 text-muted-foreground" />}
          {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* Settings */}
        <button onClick={() => navigate('/settings')}
          title={collapsed ? "Settings" : undefined}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground/80 transition-all"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "hsl(var(--accent))"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
          <Settings className="w-4 h-4 shrink-0 text-muted-foreground" />
          {!collapsed && <span>Settings</span>}
        </button>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all"
            style={showProfileMenu ? { background: acContainer } : {}}
            onMouseEnter={e => { if (!showProfileMenu) (e.currentTarget as HTMLElement).style.background = "hsl(var(--accent))"; }}
            onMouseLeave={e => { if (!showProfileMenu) (e.currentTarget as HTMLElement).style.background = ''; }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
              style={{ background: PRIMARY_GRAD }}>{avatarInitials}</div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-foreground truncate">{user?.user_metadata?.full_name || 'Creator'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileMenu ? '' : 'rotate-180'}`} />
              </>
            )}
          </button>

          {/* Profile popup */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: PRIMARY_GRAD }}>{avatarInitials}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user?.user_metadata?.full_name || 'Creator'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button onClick={() => { navigate('/pricing'); setShowProfileMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ color: ac }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = acContainer}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  <Crown className="w-4 h-4" /> Upgrade to Pro
                </button>
                <div className="border-t border-border my-1" />
                <button onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-semibold text-red-500 transition-all"
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fef2f2'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}