
import { useState, useEffect } from "react";
import { 
  Plus, 
  Wand2, 
  Calendar, 
  BarChart3, 
  Settings, 
  FileText, 
  Clock,
  TrendingUp,
  Lightbulb,
  Crown,
  Zap,
  Target,
  Users,
  Activity,
  Share2,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePersistentState } from "@/hooks/usePersistentState";
import ContentUploadWidget from "@/components/ContentUploadWidget";
import ContentRecommendations from "@/components/ContentRecommendations";
import { socialMediaManager } from "@/lib/socialMedia";
import { toast } from "sonner";

interface DashboardStats {
  totalContent: number;
  repurposedThisMonth: number;
  scheduledPosts: number;
  engagementRate: number;
  totalViews: number;
  totalLikes: number;
  activeStreaks: number;
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'repurpose' | 'schedule' | 'publish';
  title: string;
  description: string;
  timestamp: Date;
  platform?: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = usePersistentState<DashboardStats>('dashboard_stats', {
    totalContent: 0,
    repurposedThisMonth: 0,
    scheduledPosts: 0,
    engagementRate: 0,
    totalViews: 0,
    totalLikes: 0,
    activeStreaks: 0
  });
  const [recentContent, setRecentContent] = usePersistentState<any[]>('recent_content', []);
  const [recentActivity, setRecentActivity] = usePersistentState<RecentActivity[]>('recent_activity', []);
  const [loading, setLoading] = useState(true);
  const [dashboardView, setDashboardView] = usePersistentState('dashboard_view', 'overview');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      console.log('Loading comprehensive dashboard data for user:', user.id);
      
      // Load content statistics
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('id, title, created_at, content_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (contentError) {
        console.error('Content loading error:', contentError);
        throw contentError;
      }

      // Load repurposed content count for this month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const { data: repurposedData, error: repurposedError } = await supabase
        .from('repurposed_content')
        .select('id, created_at, platform')
        .eq('user_id', user.id)
        .gte('created_at', currentMonth.toISOString());

      if (repurposedError) {
        console.error('Repurposed content error:', repurposedError);
      }

      // Load analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('post_analytics')
        .select('views, likes, shares, comments, engagement_rate, recorded_at, platform')
        .eq('user_id', user.id)
        .gte('recorded_at', currentMonth.toISOString());

      if (analyticsError) {
        console.error('Analytics loading error:', analyticsError);
      }

      // Load scheduled posts
      let scheduledPostsCount = 0;
      try {
        const scheduledPosts = await socialMediaManager.getScheduledPosts(user.id);
        scheduledPostsCount = scheduledPosts.filter(post => post.status === 'scheduled').length;
      } catch (error) {
        console.error('Scheduled posts error:', error);
      }

      // Calculate comprehensive stats
      const totalViews = analyticsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
      const totalLikes = analyticsData?.reduce((sum, item) => sum + (item.likes || 0), 0) || 0;
      const avgEngagement = analyticsData?.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / (analyticsData?.length || 1) || 0;

      const newStats = {
        totalContent: contentData?.length || 0,
        repurposedThisMonth: repurposedData?.length || 0,
        scheduledPosts: scheduledPostsCount,
        engagementRate: Number(avgEngagement.toFixed(1)),
        totalViews,
        totalLikes,
        activeStreaks: Math.floor(Math.random() * 10) + 5 // Mock streak data
      };

      setStats(newStats);
      setRecentContent(contentData || []);

      // Generate recent activity
      const activities: RecentActivity[] = [
        ...(contentData?.slice(0, 3).map(content => ({
          id: content.id,
          type: 'upload' as const,
          title: 'Content Uploaded',
          description: content.title,
          timestamp: new Date(content.created_at)
        })) || []),
        ...(repurposedData?.slice(0, 3).map(item => ({
          id: item.id,
          type: 'repurpose' as const,
          title: 'Content Repurposed',
          description: `Repurposed for ${item.platform}`,
          timestamp: new Date(item.created_at),
          platform: item.platform
        })) || [])
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

      setRecentActivity(activities);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "AI Content Creator",
      description: "Generate content with AI assistance",
      icon: Brain,
      href: "/upload",
      color: "bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900",
      glow: "shadow-purple-500/25"
    },
    {
      title: "Smart Repurpose",
      description: "Transform content across platforms",
      icon: Wand2,
      href: "/repurpose",
      color: "bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900",
      glow: "shadow-emerald-500/25"
    },
    {
      title: "Auto Scheduler",
      description: "Schedule posts automatically",
      icon: Calendar,
      href: "/schedule",
      color: "bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900",
      glow: "shadow-blue-500/25"
    },
    {
      title: "Live Analytics",
      description: "Real-time performance insights",
      icon: BarChart3,
      href: "/analytics",
      color: "bg-gradient-to-br from-cyan-600 to-cyan-800 hover:from-cyan-700 hover:to-cyan-900",
      glow: "shadow-cyan-500/25"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Plus className="w-4 h-4 text-purple-600" />;
      case 'repurpose': return <Wand2 className="w-4 h-4 text-emerald-600" />;
      case 'schedule': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'publish': return <Share2 className="w-4 h-4 text-cyan-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="animate-pulse space-y-6 p-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gradient-to-r from-purple-200 to-blue-200 rounded-2xl opacity-60"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Enhanced Header with Purple Theme */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-200/50 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-3xl font-bold brand-gradient-text flex items-center">
                <Zap className="w-8 h-8 mr-2 text-purple-600" />
                RecyclrAI
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link to="/dashboard" className="nav-link text-purple-600 font-semibold">Dashboard</Link>
                <Link to="/repurpose" className="nav-link">Smart Repurpose</Link>
                <Link to="/schedule" className="nav-link">Auto Schedule</Link>
                <Link to="/analytics" className="nav-link">Analytics</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-purple-100/50 px-4 py-2 rounded-full">
                <Crown className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Pro Plan</span>
              </div>
              <Link to="/settings">
                <Button variant="outline" size="sm" className="hidden md:flex border-purple-200 hover:bg-purple-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button onClick={signOut} variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 🚀
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI-powered content empire awaits. Let's create something extraordinary today.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-modern border-purple-200/50 hover:shadow-purple-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Content Library</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalContent}</p>
                  <p className="text-xs text-gray-500 mt-1">pieces created</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full animate-pulse-glow">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern border-emerald-200/50 hover:shadow-emerald-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">AI Transformations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.repurposedThisMonth}</p>
                  <p className="text-xs text-gray-500 mt-1">this month</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <Wand2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern border-blue-200/50 hover:shadow-blue-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Auto-Scheduled</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.scheduledPosts}</p>
                  <p className="text-xs text-gray-500 mt-1">ready to publish</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern border-cyan-200/50 hover:shadow-cyan-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-600">Engagement Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.engagementRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">average performance</p>
                </div>
                <div className="p-3 bg-cyan-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="card-modern lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Target className="w-6 h-6 mr-3 text-purple-600" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Views</span>
                    <span className="text-sm text-gray-600">{stats.totalViews.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min((stats.totalViews / 10000) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Likes</span>
                    <span className="text-sm text-gray-600">{stats.totalLikes.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min((stats.totalLikes / 1000) * 100, 100)} className="h-2" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Achievement Unlocked! 🎉</h4>
                <p className="text-sm text-gray-600">You've maintained a {stats.activeStreaks}-day content creation streak!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="p-1 rounded-full bg-gray-100">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-400">{activity.timestamp.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">AI-Powered Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Card className={`card-modern card-interactive hover:shadow-2xl ${action.glow} border-0`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Upload Widget */}
          <ContentUploadWidget onContentUploaded={loadDashboardData} />

          {/* Enhanced Recent Content */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <FileText className="w-6 h-6 mr-3 text-purple-600" />
                Content Library
              </CardTitle>
              <CardDescription className="text-lg">
                Your creative masterpieces
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentContent.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-medium">Ready to create?</p>
                  <p className="text-sm">Upload your first piece of content to begin your journey!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentContent.map((content) => (
                    <div key={content.id} className="p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-xl border border-purple-200/30 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{content.title}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full capitalize font-medium">
                              {content.content_type.replace('_', ' ')}
                            </span>
                            <span>{new Date(content.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Link to={`/repurpose?contentId=${content.id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg">
                            <Wand2 className="w-4 h-4 mr-2" />
                            Transform
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link to="/repurpose">
                      <Button variant="outline" className="border-purple-200 hover:bg-purple-50">
                        View All Content
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <ContentRecommendations />

        {/* Enhanced Upgrade Section */}
        <Card className="card-modern bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 border-0 text-white mt-8 shadow-2xl">
          <CardContent className="p-12 text-center">
            <Crown className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <h3 className="text-4xl font-bold mb-4">
              Unleash Your Content Superpowers
            </h3>
            <p className="text-purple-100 mb-8 max-w-3xl mx-auto text-lg">
              Join thousands of creators who've 10x'd their content output with our AI-powered platform. 
              Unlimited repurposing, advanced scheduling, and deep analytics await.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/settings?tab=billing">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 shadow-xl border-0">
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Pro - $29/mo
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-4">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Full Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
