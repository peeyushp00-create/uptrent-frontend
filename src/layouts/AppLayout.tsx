import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";

const isMobile = () => window.innerWidth < 768;

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — only on desktop */}
      {!isMobile() && <AppSidebar />}

      {/* Main content — full width on mobile */}
      <main className="flex-1 overflow-auto" style={{ paddingBottom: isMobile() ? '70px' : '0' }}>
        <Outlet />
      </main>

      {/* Bottom nav — only on mobile */}
      {isMobile() && <BottomNav />}
    </div>
  );
}