import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStats from "@/components/DashboardStats";
import ContentUploadWidget from "@/components/ContentUploadWidget";
import ContentRecommendations from "@/components/ContentRecommendations";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useRealAnalytics } from "@/hooks/useRealAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Wand2, 
  Calendar, 
  BarChart3, 
  FileText,
  ArrowRight,
  Crown,
  Rocket,
  Trophy,
  Users,
  Activity,
  Edit3,
  MoreHorizontal,
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  MessageCircle,
  Share2,
  Clock,
  Filter,
  Grid3X3,
  List
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const { state: dashboardState, updateState, isRestoring } = useDashboardState();
  const { 
    metrics, 
    topContent, 
    platformStats, 
    loading: analyticsLoading, 
    lastUpdated,
    refreshAnalytics 
  } = useRealAnalytics(dashboardState.timeRange);
  
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user && !isRestoring) {
      loadDashboardData();
    }
  }, [user, isRestoring]);

  const loadDashboardData = async () => {
    // This function now relies on useRealAnalytics hook for real data
    console.log('Dashboard data loading handled by useRealAnalytics hook');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAnalytics();
      await loadDashboardData();
      toast.success('Dashboard refreshed!');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const quickActions = [
    {
      title: "AI Content Studio",
      description: "Create with AI assistance",
      icon: Brain,
      href: "/upload",
      gradient: "from-purple-600 to-purple-800",
      glow: "shadow-purple-500/25",
      badge: "New"
    },
    {
      title: "Smart Transform",
      description: "Repurpose instantly",
      icon: Wand2,
      href: "/repurpose",
      gradient: "from-emerald-600 to-emerald-800",
      glow: "shadow-emerald-500/25",
      badge: "Hot"
    },
    {
      title: "Auto Scheduler",
      description: "Schedule & publish",
      icon: Calendar,
      href: "/schedule",
      gradient: "from-blue-600 to-blue-800",
      glow: "shadow-blue-500/25"
    },
    {
      title: "Performance Hub",
      description: "Track & analyze",
      icon: BarChart3,
      href: "/analytics",
      gradient: "from-cyan-600 to-cyan-800",
      glow: "shadow-cyan-500/25"
    }
  ];

  const filteredContent = recentContent.filter(content =>
    content.title?.toLowerCase().includes(dashboardState.searchQuery.toLowerCase())
  );

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-black/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-black rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg text-gray-600">Restoring your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-black/5">
      <DashboardHeader
        searchQuery={dashboardState.searchQuery}
        onSearchChange={(query) => updateState({ searchQuery: query })}
        selectedView={dashboardState.selectedView}
        onViewChange={(view) => updateState({ selectedView: view })}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Your content empire is growing strong. Let's create something amazing today.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                7 day streak
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Pro Member
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        {metrics && (
          <DashboardStats 
            stats={metrics} 
            loading={analyticsLoading} 
          />
        )}

        {/* Quick Actions Grid */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 text-center">
            AI-Powered Creation Studio
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Card className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 ${action.glow} bg-white/90 backdrop-blur-sm h-full`}>
                  <CardContent className="p-3 sm:p-4 md:p-6 text-center relative h-full flex flex-col justify-between min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                    {action.badge && (
                      <Badge className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                        {action.badge}
                      </Badge>
                    )}
                    <div className="space-y-2 sm:space-y-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 lg:w-16 md:h-14 lg:h-16 bg-gradient-to-br ${action.gradient} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 lg:w-8 md:h-7 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base lg:text-lg leading-tight">{action.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 hidden xs:block">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Content Management Section */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
          <ContentUploadWidget onContentUploaded={loadDashboardData} />
          
          {/* Enhanced Content Library */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200/50 shadow-xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center text-base sm:text-lg md:text-xl lg:text-2xl">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3 text-purple-600 flex-shrink-0" />
                  <span className="truncate">Content Library</span>
                </CardTitle>
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  {filteredContent.length} items
                </Badge>
              </div>
              <CardDescription className="text-sm md:text-base lg:text-lg">Your creative masterpieces</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {filteredContent.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-base sm:text-lg md:text-xl font-medium">Ready to create?</p>
                  <p className="text-xs sm:text-sm mb-4 sm:mb-6">Upload your first piece of content to begin your journey!</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-black text-white border-0 text-sm sm:text-base" asChild>
                    <Link to="/upload">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Create Content
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-h-72 sm:max-h-96 overflow-y-auto">
                  {filteredContent.map((content) => (
                    <div key={content.id} className="group p-3 sm:p-4 bg-gradient-to-r from-purple-50/30 to-white rounded-lg sm:rounded-xl border border-purple-200/30 hover:shadow-lg transition-all">
                      {/* Content item rendering */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <ContentRecommendations />

        {/* Pro Upgrade CTA */}
        <Card className="bg-gradient-to-br from-purple-600 via-black to-purple-800 border-0 text-white mt-4 sm:mt-6 md:mt-8 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-black/20"></div>
          <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12 text-center relative z-10">
            <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl">
                <Crown className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">
              Unleash Your Content Superpowers
            </h3>
            <p className="text-purple-100 mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
              Join thousands of creators who've 10x'd their content output with our AI-powered platform. 
              <span className="hidden sm:inline"> Unlimited repurposing, advanced scheduling, and deep analytics await.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center mb-4 sm:mb-6">
              <Link to="/settings?tab=billing">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 shadow-xl border-0">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="outline" className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm opacity-90">
              <div className="flex items-center">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                30-day money back
              </div>
              <div className="flex items-center">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                10,000+ creators
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
