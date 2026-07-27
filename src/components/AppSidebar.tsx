import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, Newspaper, FileText,
  PanelLeftClose, PanelLeft, LogOut, Settings,
  Sun, Moon, ChevronUp, Crown, Youtube, Instagram,
  Search, Tag, Clapperboard, Captions,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';

export default function AppSidebar() {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // -- Nav arrays inside component so they re-render on language change --
  const instagramNav = [
    { icon: LayoutDashboard, label: t('nav.home'), path: "/home" },
    // Trending hidden for now -- re-add this line to bring it back:
    // { icon: TrendingUp, label: t('nav.trending'), path: "/trending" },
    { icon: Newspaper, label: t('nav.news'), path: "/news" },
    { icon: FileText, label: t('nav.scripts'), path: "/scripts" },
    { icon: Search, label: t('nav.analyzer'), path: "/instagram/analyzer" },
    { icon: Clapperboard, label: "Studio", path: "/studio" },
    // { icon: Captions, label: "Captions", path: "/captions" }, // temporarily hidden
  ];

  const youtubeNav = [
    { icon: LayoutDashboard, label: t('nav.home'), path: "/home" },
    { icon: Tag, label: t('nav.seo'), path: "/youtube/seo" },
    { icon: FileText, label: t('nav.scripts'), path: "/youtube/script" },
    { icon: Search, label: t('nav.analyzer'), path: "/youtube/analyzer" },
    { icon: TrendingUp, label: t('nav.trending'), path: "/youtube/trending" },
  ];

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

  const avatarInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  // -- Real YouTube channel picture, fetched during OAuth connect --
  const youtubeChannel = user?.user_metadata?.youtube_channel;
  const channelThumbnail = youtubeChannel?.channel_thumbnail;
  const showChannelPic = !!channelThumbnail && !avatarError;

  return (
    <aside
      data-platform={effectivePlatform}
      className={`theme-redesign ${theme} flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 relative ${collapsed ? "w-16" : "w-64"}`}
    >

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-accent text-accent-foreground overflow-hidden">
          <img src="/socialrum-logo.png" alt="SocialRum" className="w-8 h-8 rounded-lg object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        {!collapsed && (
          <span className="font-heading text-lg font-semibold tracking-tight text-sidebar-foreground">
            SocialRum
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors p-1.5 rounded-lg hover:bg-sidebar-accent">
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Platform toggle */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <div className="p-1 rounded-xl bg-sidebar-accent flex">
            <button onClick={() => switchPlatform("instagram")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
                effectivePlatform === "instagram"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              }`}>
              <Instagram className="w-3.5 h-3.5" /> Instagram
            </button>
            <button onClick={() => switchPlatform("youtube")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
                effectivePlatform === "youtube"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              }`}>
              <Youtube className="w-3.5 h-3.5" /> YouTube
            </button>
          </div>
        </div>
      )}

      {/* Collapsed platform icon */}
      {collapsed && (
        <div className="flex justify-center pt-3 pb-1">
          <button onClick={() => switchPlatform(effectivePlatform === "instagram" ? "youtube" : "instagram")}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent text-accent-foreground transition-opacity hover:opacity-80">
            {effectivePlatform === "instagram"
              ? <Instagram className="w-4 h-4" />
              : <Youtube className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Section label */}
      {!collapsed && (
        <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/50">
          {effectivePlatform === "instagram" ? "Instagram" : "YouTube"}
        </p>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}>
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 bg-accent" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-sidebar-border space-y-0.5 shrink-0">

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition">
          {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{theme === "dark" ? t('nav.light_mode') : t('nav.dark_mode')}</span>}
        </button>

        {/* Settings */}
        <button onClick={() => navigate('/settings')}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition">
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t('nav.settings')}</span>}
        </button>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-3 w-full p-2 rounded-lg transition ${!showProfileMenu ? "hover:bg-sidebar-accent" : "bg-sidebar-accent"}`}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-accent text-accent-foreground overflow-hidden">
              {showChannelPic ? (
                <img src={channelThumbnail} alt="Profile" className="w-9 h-9 rounded-full object-cover"
                  onError={() => setAvatarError(true)} />
              ) : avatarInitials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.user_metadata?.full_name || 'Creator'}</p>
                  <p className="text-[11px] text-sidebar-foreground/60 truncate">{user?.email}</p>
                </div>
                <ChevronUp className={`w-4 h-4 text-sidebar-foreground/50 transition-transform ${showProfileMenu ? '' : 'rotate-180'}`} />
              </>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg z-50 overflow-hidden text-sm">
              <div className="px-4 py-3 bg-gradient-to-br from-accent/15 to-transparent border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-accent text-accent-foreground overflow-hidden">
                    {showChannelPic ? (
                      <img src={channelThumbnail} alt="Profile" className="w-10 h-10 rounded-full object-cover"
                        onError={() => setAvatarError(true)} />
                    ) : avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{user?.user_metadata?.full_name || 'Creator'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-1">
                <button onClick={() => { navigate('/pricing'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-accent hover:bg-accent/10 transition">
                  <Crown className="w-3.5 h-3.5" /> {t('nav.upgrade')}
                </button>
                <div className="my-1 border-t border-border" />
                <button onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-muted transition">
                  <LogOut className="w-3.5 h-3.5" /> {t('nav.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
