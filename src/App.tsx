import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import NewsPage from "./pages/NewsPage";
import ScriptsPage from "./pages/ScriptsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
// import CreatorLeaderboard from "./pages/CreatorLeaderboard"; // hidden for now — route disabled below, code kept for later
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import YouTubeSEO from "./pages/YouTubeSEO";
import YouTubeScript from "./pages/YouTubeScript";
import YouTubeAnalyzer from "./pages/YouTubeAnalyzer";
import YouTubeTrending from "./pages/YouTubeTrending";
import InstagramAnalyzer from "./pages/InstagramAnalyzer";
import InsightPage from "./pages/InsightPage";
import PricingPage from "./pages/PricingPage";
import ContentStudio from "./pages/Contentstudio";
// import VideoCaptioner from "./pages/VideoCaptioner"; // temporarily hidden
import LandingPage from "./pages/LandingPage";
import BlogPage from "@/pages/BlogPage";
import AdminBlogPage from "@/pages/AdminBlogPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

const queryClient = new QueryClient();

// Always mounted — keeps Studio state alive across navigation (File refs, blob URLs survive)
function StudioKeepAlive() {
  const location = useLocation();
  const { session, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (loading || !session) return null;

  return (
    <div style={{
      display: location.pathname === "/studio" ? "flex" : "none",
      position: "fixed", inset: 0, zIndex: 10,
      background: "hsl(var(--background))",
      height: "100vh", overflow: "hidden",
    }}>
      {!isMobile && <AppSidebar />}
      <main style={{ flex: 1, overflowY: "auto", paddingBottom: isMobile ? "70px" : "0" }}>
        <ContentStudio />
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <>
          <Routes>

            {/* ── Public pages (no auth required) ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/admin/blog" element={<AdminBlogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* ── Public home/dashboard ── */}
            <Route path="/home" element={<AppLayout />}>
              <Route index element={<Index />} />
            </Route>

            {/* ── Protected app routes ── */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/insight" element={<InsightPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/scripts" element={<ScriptsPage />} />
              {/* /trending route hidden for now — uncomment below + import above to re-enable */}
              {/* <Route path="/trending" element={<CreatorLeaderboard />} /> */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/instagram/analyzer" element={<InstagramAnalyzer />} />
              <Route path="/youtube/seo" element={<YouTubeSEO />} />
              <Route path="/youtube/script" element={<YouTubeScript />} />
              <Route path="/youtube/analyzer" element={<YouTubeAnalyzer />} />
              <Route path="/youtube/trending" element={<YouTubeTrending />} />
              <Route path="/studio" element={<></>} />
              {/* <Route path="/captions" element={<VideoCaptioner />} /> */}
            </Route>

            <Route path="*" element={<NotFound />} />

          </Routes>
          <StudioKeepAlive />
          </>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;