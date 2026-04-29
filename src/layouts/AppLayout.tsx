import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";

export default function AppLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'hsl(var(--background))' }}>

      {/* Sidebar — desktop only */}
      {!isMobile && <AppSidebar />}

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? '70px' : '0' }}>
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      {isMobile && <BottomNav />}

    </div>
  );
}
