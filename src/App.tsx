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
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TrendingDashboard from "./pages/TrendingDashboard";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import YouTubeSEO from "./pages/YouTubeSEO";
import YouTubeScript from "./pages/YouTubeScript";
import YouTubeAnalyzer from "./pages/YouTubeAnalyzer";
import YouTubeTrending from "./pages/YouTubeTrending";
import InstagramAnalyzer from "./pages/InstagramAnalyzer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes — all with sidebar */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Index />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/scripts" element={<ScriptsPage />} />
              <Route path="/trending" element={<TrendingDashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Instagram routes */}
              <Route path="/instagram/analyzer" element={<InstagramAnalyzer />} />
              {/* YouTube routes */}
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
