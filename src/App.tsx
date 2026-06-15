import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import Index from "./pages/Index";
import NewsPage from "./pages/NewsPage";
import ScriptsPage from "./pages/ScriptsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CreatorLeaderboard from "./pages/CreatorLeaderboard";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import YouTubeSEO from "./pages/YouTubeSEO";
import YouTubeScript from "./pages/YouTubeScript";
import YouTubeAnalyzer from "./pages/YouTubeAnalyzer";
import YouTubeTrending from "./pages/YouTubeTrending";
import InstagramAnalyzer from "./pages/InstagramAnalyzer";
import InsightPage from "./pages/InsightPage";
import PricingPage from "./pages/PricingPage";
import LandingPage from "./pages/LandingPage";
import BlogPage from "@/pages/BlogPage";
import AdminBlogPage from "@/pages/AdminBlogPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
              <Route path="/trending" element={<CreatorLeaderboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/instagram/analyzer" element={<InstagramAnalyzer />} />
              <Route path="/youtube/seo" element={<YouTubeSEO />} />
              <Route path="/youtube/script" element={<YouTubeScript />} />
              <Route path="/youtube/analyzer" element={<YouTubeAnalyzer />} />
              <Route path="/youtube/trending" element={<YouTubeTrending />} />
            </Route>

            <Route path="*" element={<NotFound />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;