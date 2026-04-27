import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav — only on mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
