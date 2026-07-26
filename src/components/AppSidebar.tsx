import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, Newspaper, FileText,
  PanelLeftClose, PanelLeft, LogOut, Settings,
  Sun, Moon, ChevronUp, Crown, Youtube, Instagram,
  Search, Tag, Clapperboard, Captions, Compass,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';

const PRIMARY = "#7C3AED";
const PRIMARY_GRAD = "linear-gradient(135deg, #7C3AED, #6D28D9)";
const PRIMARY_CONTAINER = "#ede9fe";
const YT_GRAD = "linear-gradient(135deg, #ff0000, #cc0000)";
const YT_COLOR = "#ff0000";
const YT_CONTAINER = "#ffebee";

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
    { icon: Compass, label: "Discover", path: "/discover" },
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
  const ac = effectivePlatform === "youtube" ? YT_COLOR : PRIMARY;
  const ag = effectivePlatform === "youtube" ? YT_GRAD : PRIMARY_GRAD;
  const acContainer = effectivePlatform === "youtube" ? YT_CONTAINER : PRIMARY_CONTAINER;

  const avatarInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  // -- Real YouTube channel picture, fetched during OAuth connect --
  const youtubeChannel = user?.user_metadata?.youtube_channel;
  const channelThumbnail = youtubeChannel?.channel_thumbnail;
  const showChannelPic = !!channelThumbnail && !avatarError;

  return (
    <aside className={`flex flex-col h-screen border-r border-border bg-card transition-all duration-300 relative ${collapsed ? "w-16" : "w-60"}`}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: ag }}>
          <img src="/socialrum-logo.png" alt="SocialRum" className="w-8 h-8 rounded-xl object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-lg tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif', color: ac }}>
            SocialRum
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent">
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Platform toggle */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted">
            <button onClick={() => switchPlatform("instagram")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              style={effectivePlatform === "instagram"
                ? { background: PRIMARY_GRAD, color: '#fff', boxShadow: '0 2px 8px rgba(124,58,237,0.35)' }
                : { color: 'hsl(var(--muted-foreground))' }}>
              <Instagram className="w-3.5 h-3.5" /> Instagram
            </button>
            <button onClick={() => switchPlatform("youtube")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              style={effectivePlatform === "youtube"
                ? { background: YT_GRAD, color: '#fff', boxShadow: '0 2px 8px rgba(255,0,0,0.35)' }
                : { color: 'hsl(var(--muted-foreground))' }}>
              <Youtube className="w-3.5 h-3.5" /> YouTube
            </button>
          </div>
        </div>
      )}

      {/* Collapsed platform icon */}
      {collapsed && (
        <div className="flex justify-center pt-3 pb-1">
          <button onClick={() => switchPlatform(effectivePlatform === "instagram" ? "youtube" : "instagram")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: ag }}>
            {effectivePlatform === "instagram"
              ? <Instagram className="w-4 h-4 text-white" />
              : <Youtube className="w-4 h-4 text-white" />}
          </button>
        </div>
      )}

      {/* Section label */}
      {!collapsed && (
        <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {effectivePlatform === "instagram" ? "Instagram" : "YouTube"}
        </p>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${!active ? 'hover:bg-accent' : ''}`}
              style={active ? { background: acContainer, color: ac } : { color: 'hsl(var(--muted-foreground))' }}>
              <item.icon className="w-4 h-4 shrink-0 transition-colors" style={{ color: active ? ac : undefined }} />
              {!collapsed && <span className="transition-colors">{item.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ac }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-border space-y-0.5 shrink-0">

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150">
          {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{theme === "dark" ? t('nav.light_mode') : t('nav.dark_mode')}</span>}
        </button>

        {/* Settings */}
        <button onClick={() => navigate('/settings')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150">
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t('nav.settings')}</span>}
        </button>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 ${!showProfileMenu ? 'hover:bg-accent' : ''}`}
            style={showProfileMenu ? { background: acContainer } : {}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white overflow-hidden"
              style={!showChannelPic ? { background: ag } : undefined}>
              {showChannelPic ? (
                <img src={channelThumbnail} alt="Profile" className="w-8 h-8 rounded-full object-cover"
                  onError={() => setAvatarError(true)} />
              ) : avatarInitials}
            </div>
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

          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                    style={!showChannelPic ? { background: ag } : undefined}>
                    {showChannelPic ? (
                      <img src={channelThumbnail} alt="Profile" className="w-9 h-9 rounded-full object-cover"
                        onError={() => setAvatarError(true)} />
                    ) : avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user?.user_metadata?.full_name || 'Creator'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button onClick={() => { navigate('/pricing'); setShowProfileMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                  style={{ color: ac, background: `${acContainer}80` }}>
                  <Crown className="w-4 h-4" /> {t('nav.upgrade')}
                </button>
                <div className="border-t border-border my-1" />
                <button onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-semibold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/30">
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}