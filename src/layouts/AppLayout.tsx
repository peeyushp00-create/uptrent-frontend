import { useRef, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

// Persists across route changes for the lifetime of the JS session
const scrollPositions = new Map<string, number>();

export default function AppLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const bottomNavRef = useRef<HTMLDivElement>(null);
  const [bottomNavHeight, setBottomNavHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Measure the real BottomNav height instead of guessing a fixed padding —
  // it renders two stacked rows (platform toggle + nav items) that add up to
  // more than a hardcoded value would assume, which was clipping page
  // content (e.g. Studio's timeline) behind the fixed nav bar.
  useEffect(() => {
    if (!isMobile) { setBottomNavHeight(0); return; }
    const el = bottomNavRef.current;
    if (!el) return;
    const update = () => setBottomNavHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

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
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Sidebar — desktop only */}
      {!isMobile && <AppSidebar />}

      {/* Main content */}
      <main ref={mainRef} className="flex-1 overflow-y-auto" style={{ paddingBottom: isMobile ? bottomNavHeight : 0 }}>
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      {isMobile && <BottomNav ref={bottomNavRef} />}

      <KeyboardShortcuts />

    </div>
  );
}
