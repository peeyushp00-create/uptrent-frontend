import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/socialspark/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Content from "./pages/Content";
import Schedule from "./pages/Schedule";
import Analytics from "./pages/Analytics";
import JobSearch from "./pages/JobSearch";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/content" element={<Content />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/job-search" element={<JobSearch />} />
              <Route path="/team" element={<Team />} />
              <Route path="/security" element={<Security />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

