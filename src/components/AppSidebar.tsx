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
];

const youtubeNav = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Tag, label: "SEO", path: "/youtube/seo" },
  { icon: FileText, label: "Script", path: "/youtube/script" },
  { icon: Search, label: "Analyzer", path: "/youtube/analyzer" },
  { icon: TrendingUp, label: "Trending", path: "/youtube/trending" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ✅ Read platform from localStorage
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

  // ✅ Save platform to localStorage
  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    if (p === "youtube") {
      navigate("/youtube/seo");
    } else {
      navigate("/");
    }
  };

  // ✅ Auto-detect platform from URL
  const isYoutubePath = location.pathname.startsWith("/youtube");
  const effectivePlatform = isYoutubePath ? "youtube" : platform;
  const navItems = effectivePlatform === "youtube" ? youtubeNav : instagramNav;

  const avatarInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <aside
      className={`flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 relative ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
          <img src="/logo.png" alt="Uptrent" className="w-8 h-8 rounded-lg object-cover" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-foreground text-lg tracking-tight">
            Uptrent
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Platform toggle */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-1 p-1 bg-background rounded-xl border border-border">
            <button
              onClick={() => switchPlatform("instagram")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                effectivePlatform === "instagram" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              style={effectivePlatform === "instagram" ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
            >
              <Instagram className="w-3.5 h-3.5" />
              Instagram
            </button>
            <button
              onClick={() => switchPlatform("youtube")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                effectivePlatform === "youtube" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              style={effectivePlatform === "youtube" ? { background: "linear-gradient(135deg, #FF0000, #CC0000)" } : {}}
            >
              <Youtube className="w-3.5 h-3.5" />
              YouTube
            </button>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          // ✅ Simple exact path match
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Profile popup menu */}
      {showProfileMenu && (
        <div className="absolute bottom-16 left-2 right-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}>
                {avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name || 'Creator'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="p-1">
            <button
              onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Settings
            </button>
            <button
              onClick={() => { toggleTheme(); setShowProfileMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
            >
              {theme === "dark" ? (
                <><Sun className="w-4 h-4 text-muted-foreground" /> Light Mode</>
              ) : (
                <><Moon className="w-4 h-4 text-muted-foreground" /> Dark Mode</>
              )}
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
              style={{ color: '#D4537E' }}
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Bottom profile button */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors ${
            showProfileMenu ? 'bg-sidebar-accent' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #D4537E, #D85A30)" }}>
            {avatarInitials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name || 'Creator'}
                </p>
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