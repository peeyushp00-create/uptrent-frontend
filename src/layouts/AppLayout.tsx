import { useRef, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";

// Persists across route changes for the lifetime of the JS session
const scrollPositions = new Map<string, number>();

export default function AppLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save scroll position on every scroll event
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const save = () => scrollPositions.set(location.pathname, el.scrollTop);
    el.addEventListener("scroll", save, { passive: true });
    return () => el.removeEventListener("scroll", save);
  }, [location.pathname]);

  // Restore scroll position when route changes
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.scrollTop = scrollPositions.get(location.pathname) ?? 0;
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'hsl(var(--background))' }}>

      {/* Sidebar — desktop only */}
      {!isMobile && <AppSidebar />}

      {/* Main content */}
      <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? '70px' : '0' }}>
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      {isMobile && <BottomNav />}

    </div>
  );
}
