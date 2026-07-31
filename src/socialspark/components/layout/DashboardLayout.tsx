import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  Video,
  Users,
  Zap,
  Menu,
  LogOut,
  Briefcase,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/socialspark/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Video, label: "Content", path: "/content" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Briefcase, label: "Job Search", path: "/job-search" },
  { icon: Users, label: "Team", path: "/team" },
  { icon: Shield, label: "Security", path: "/security" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export function DashboardLayout({ children, sidebarOpen: propSidebarOpen, setSidebarOpen: propSetSidebarOpen }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(
  window.innerWidth >= 768
);

  const [isMobile, setIsMobile] = useState(false);

  // Use props if provided, otherwise use internal state
  const sidebarOpen = propSidebarOpen !== undefined ? propSidebarOpen : internalSidebarOpen;
  const setSidebarOpen = propSetSidebarOpen || setInternalSidebarOpen;

  useEffect(() => {
  const checkMobile = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
  };

  checkMobile();
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);


  const handleLogout = async () => {
    try {
      await logOut();
      // Small delay to ensure auth state updates before navigation
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16",
        "md:w-64 md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={closeSidebarOnMobile}>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              {sidebarOpen && (
                <span className="font-display text-xl font-bold gradient-text">ContentAI</span>
              )}
            </Link>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex"
            >
              <Menu className="h-4 w-4" />
            </Button> */}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={closeSidebarOnMobile}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                  <span className={cn(
                    "md:inline",
                    sidebarOpen ? "inline" : "hidden"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className={cn(
                      "ml-auto h-1.5 w-1.5 rounded-full bg-primary md:inline",
                      sidebarOpen ? "inline" : "hidden"
                    )} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* AI Credits */}
          <div className={cn(
            "border-t border-border p-4",
            "md:block",
            sidebarOpen ? "block" : "hidden"
          )}>
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Credits
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-bold font-display">847</span>
                <span className="text-xs text-muted-foreground">/ 1000</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted">
                <div className="h-full w-[84.7%] rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                !sidebarOpen && "justify-center px-0"
              )}
              onClick={() => {
                handleLogout();
                closeSidebarOnMobile();
              }}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className={cn(
                "md:inline",
                sidebarOpen ? "inline" : "hidden"
              )}>
                Logout
              </span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        "md:ml-64",
        isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-16"
      )}>
        {/* Mobile Menu Button - Fixed Position */}
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-20 md:hidden bg-background/80 backdrop-blur-sm border-border shadow-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {children}
      </main>
    </div>
  );
}

