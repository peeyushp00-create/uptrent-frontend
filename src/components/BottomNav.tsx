import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Newspaper, FileText, Settings, Youtube, Instagram, Tag, Search, BarChart2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useTheme } from "@/contexts/ThemeContext";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [platform, setPlatform] = useState<"instagram" | "youtube">(
    () => (localStorage.getItem("platform") as "instagram" | "youtube") || "instagram"
  );

  const instagramNav = [
    { icon: LayoutDashboard, label: t('nav.home'), path: "/home" },
    { icon: Newspaper, label: t('nav.news'), path: "/news" },
    { icon: BarChart2, label: t('nav.analyzer'), path: "/instagram/analyzer" },
    { icon: FileText, label: t('nav.scripts'), path: "/scripts" },
    { icon: Settings, label: t('nav.settings'), path: "/settings" },
  ];

  const youtubeNav = [
    { icon: LayoutDashboard, label: t('nav.home'), path: "/home" },
    { icon: Tag, label: t('nav.seo'), path: "/youtube/seo" },
    { icon: FileText, label: t('nav.scripts'), path: "/youtube/script" },
    { icon: Search, label: t('nav.analyzer'), path: "/youtube/analyzer" },
    { icon: Settings, label: t('nav.settings'), path: "/settings" },
  ];

  useEffect(() => {
    const handleCustom = (e: any) => setPlatform(e.detail);
    window.addEventListener("platformChanged", handleCustom);
    return () => window.removeEventListener("platformChanged", handleCustom);
  }, []);

  const isYoutubePath = location.pathname.startsWith("/youtube");
  const effectivePlatform = isYoutubePath ? "youtube" : platform;
  const navItems = effectivePlatform === "instagram" ? instagramNav : youtubeNav;

  const switchPlatform = (p: "instagram" | "youtube") => {
    setPlatform(p);
    localStorage.setItem("platform", p);
    window.dispatchEvent(new CustomEvent("platformChanged", { detail: p }));
    navigate("/home");
  };

  return (
    <div
      data-platform={effectivePlatform}
      className={`theme-redesign ${theme} fixed bottom-0 left-0 right-0 z-[100] bg-card border-t border-border`}
    >
      {/* Platform toggle */}
      <div className="flex gap-1.5 px-3 pt-2 pb-1 border-b border-border">
        <button onClick={() => switchPlatform("instagram")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold transition ${
            effectivePlatform === "instagram" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          }`}>
          <Instagram className="w-3.5 h-3.5" /> Instagram
        </button>
        <button onClick={() => switchPlatform("youtube")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold transition ${
            effectivePlatform === "youtube" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          }`}>
          <Youtube className="w-3.5 h-3.5" /> YouTube
        </button>
      </div>

      {/* Nav items */}
      <div className="flex items-center justify-around px-1 pt-1.5 pb-3">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl min-w-[56px] transition ${
                active ? "bg-accent/15 text-accent" : "text-muted-foreground"
              }`}>
              <item.icon className="w-5 h-5" />
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
