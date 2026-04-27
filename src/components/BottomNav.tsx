import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Newspaper, FileText } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Newspaper, label: "News", path: "/news" },
  { icon: FileText, label: "Scripts", path: "/scripts" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-2 py-2 safe-area-pb">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              active ? "text-white" : "text-muted-foreground"
            }`}
            style={active ? { background: "linear-gradient(135deg, #D4537E, #D85A30)" } : {}}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}