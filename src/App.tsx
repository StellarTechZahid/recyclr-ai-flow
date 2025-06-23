import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import ContentUpload from "./pages/ContentUpload";
import ContentRepurpose from "./pages/ContentRepurpose";
import BulkContentManager from "./pages/BulkContentManager";
import ContentTemplates from "./pages/ContentTemplates";
import ContentScheduling from "./pages/ContentScheduling";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/auth/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/reset-password" element={
              <ResetPassword />
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/content" element={
              <ProtectedRoute>
                <ContentUpload />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/repurpose" element={
              <ProtectedRoute>
                <ContentRepurpose />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/bulk" element={
              <ProtectedRoute>
                <BulkContentManager />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/templates" element={
              <ProtectedRoute>
                <ContentTemplates />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/scheduling" element={
              <ProtectedRoute>
                <ContentScheduling />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
