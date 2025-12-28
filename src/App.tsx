import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/auth/ResetPassword";
import AITools from "./pages/AITools";
import BrandVoice from "./pages/ai/BrandVoice";
import TrendMining from "./pages/ai/TrendMining";
import SmartCampaign from "./pages/ai/SmartCampaign";
import AudiencePersona from "./pages/ai/AudiencePersona";
import ViralHooks from "./pages/ai/ViralHooks";
import Vision from "./pages/ai/Vision";
import SpeechToText from "./pages/ai/SpeechToText";
import TextToSpeech from "./pages/ai/TextToSpeech";
import Multilingual from "./pages/ai/Multilingual";
import ContentModeration from "./pages/ai/ContentModeration";
import AutoReply from "./pages/ai/AutoReply";
import EmotionOptimizer from "./pages/ai/EmotionOptimizer";
import InfluencerMatcher from "./pages/ai/InfluencerMatcher";
import ContentMonetizer from "./pages/ai/ContentMonetizer";
import Accessibility from "./pages/ai/Accessibility";
import Reasoning from "./pages/ai/Reasoning";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><ContentUpload /></ProtectedRoute>} />
          <Route path="/repurpose" element={<ProtectedRoute><ContentRepurpose /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/dashboard/content" element={<ProtectedRoute><ContentUpload /></ProtectedRoute>} />
          <Route path="/dashboard/repurpose" element={<ProtectedRoute><ContentRepurpose /></ProtectedRoute>} />
          <Route path="/dashboard/bulk" element={<ProtectedRoute><BulkContentManager /></ProtectedRoute>} />
          <Route path="/dashboard/templates" element={<ProtectedRoute><ContentTemplates /></ProtectedRoute>} />
          <Route path="/dashboard/scheduling" element={<ProtectedRoute><ContentScheduling /></ProtectedRoute>} />
          <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          {/* AI Tools Hub */}
          <Route path="/ai" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
          <Route path="/ai/brand-voice" element={<ProtectedRoute><BrandVoice /></ProtectedRoute>} />
          <Route path="/ai/trends" element={<ProtectedRoute><TrendMining /></ProtectedRoute>} />
          <Route path="/ai/campaigns" element={<ProtectedRoute><SmartCampaign /></ProtectedRoute>} />
          <Route path="/ai/personas" element={<ProtectedRoute><AudiencePersona /></ProtectedRoute>} />
          <Route path="/ai/hooks" element={<ProtectedRoute><ViralHooks /></ProtectedRoute>} />
          <Route path="/ai/vision" element={<ProtectedRoute><Vision /></ProtectedRoute>} />
          <Route path="/ai/speech-to-text" element={<ProtectedRoute><SpeechToText /></ProtectedRoute>} />
          <Route path="/ai/text-to-speech" element={<ProtectedRoute><TextToSpeech /></ProtectedRoute>} />
          <Route path="/ai/multilingual" element={<ProtectedRoute><Multilingual /></ProtectedRoute>} />
          <Route path="/ai/moderation" element={<ProtectedRoute><ContentModeration /></ProtectedRoute>} />
          <Route path="/ai/auto-reply" element={<ProtectedRoute><AutoReply /></ProtectedRoute>} />
          <Route path="/ai/emotion" element={<ProtectedRoute><EmotionOptimizer /></ProtectedRoute>} />
          <Route path="/ai/influencers" element={<ProtectedRoute><InfluencerMatcher /></ProtectedRoute>} />
          <Route path="/ai/monetize" element={<ProtectedRoute><ContentMonetizer /></ProtectedRoute>} />
          <Route path="/ai/accessibility" element={<ProtectedRoute><Accessibility /></ProtectedRoute>} />
          <Route path="/ai/reasoning" element={<ProtectedRoute><Reasoning /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
