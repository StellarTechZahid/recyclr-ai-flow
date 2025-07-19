
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
  Brain,
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  Video,
  Image,
  MessageSquare,
  ArrowRight,
  Trophy,
  Rocket,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Trash2,
  Edit3,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  totalShares: number;
  avgEngagement: number;
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'repurpose' | 'schedule' | 'publish';
  title: string;
  description: string;
  timestamp: Date;
  platform?: string;
  status?: 'success' | 'pending' | 'failed';
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
    activeStreaks: 0,
    totalShares: 0,
    avgEngagement: 0
  });
  const [recentContent, setRecentContent] = usePersistentState<any[]>('recent_content', []);
  const [recentActivity, setRecentActivity] = usePersistentState<RecentActivity[]>('recent_activity', []);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = usePersistentState('content_search', '');
  const [selectedView, setSelectedView] = usePersistentState('dashboard_view', 'overview');

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
      const totalShares = analyticsData?.reduce((sum, item) => sum + (item.shares || 0), 0) || 0;
      const avgEngagement = analyticsData?.length ? 
        analyticsData.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / analyticsData.length : 0;

      const newStats = {
        totalContent: contentData?.length || 0,
        repurposedThisMonth: repurposedData?.length || 0,
        scheduledPosts: scheduledPostsCount,
        engagementRate: Number(avgEngagement.toFixed(1)),
        totalViews,
        totalLikes,
        totalShares,
        avgEngagement: Number(avgEngagement.toFixed(1)),
        activeStreaks: Math.floor(Math.random() * 15) + 7 // Mock streak data
      };

      setStats(newStats);
      setRecentContent(contentData || []);

      // Generate recent activity with status
      const activities: RecentActivity[] = [
        ...(contentData?.slice(0, 3).map(content => ({
          id: content.id,
          type: 'upload' as const,
          title: 'Content Uploaded',
          description: content.title,
          timestamp: new Date(content.created_at),
          status: 'success' as const
        })) || []),
        ...(repurposedData?.slice(0, 3).map(item => ({
          id: item.id,
          type: 'repurpose' as const,
          title: 'Content Repurposed',
          description: `Generated for ${item.platform}`,
          timestamp: new Date(item.created_at),
          platform: item.platform,
          status: Math.random() > 0.8 ? 'pending' as const : 'success' as const
        })) || [])
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Plus className="w-4 h-4 text-purple-600" />;
      case 'repurpose': return <Wand2 className="w-4 h-4 text-emerald-600" />;
      case 'schedule': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'publish': return <Share2 className="w-4 h-4 text-cyan-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-emerald-100 text-emerald-700 text-xs">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 text-xs">Failed</Badge>;
      default:
        return null;
    }
  };

  const filteredContent = recentContent.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-black/5">
        <div className="animate-pulse space-y-6 p-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gradient-to-r from-purple-200 to-gray-200 rounded-3xl opacity-60"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-black/5">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-purple-200/30 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-black rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">
                  RecyclrAI
                </span>
              </Link>
              <Badge className="hidden md:flex bg-purple-100 text-purple-700 border-purple-300">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            </div>
            
            {/* Navigation - Hidden on mobile, shown on desktop */}
            <nav className="hidden lg:flex items-center space-x-6">
              {[
                { name: 'Dashboard', href: '/dashboard', active: true },
                { name: 'Transform', href: '/repurpose' },
                { name: 'Schedule', href: '/schedule' },
                { name: 'Analytics', href: '/analytics' }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    item.active 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
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

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Enhanced Welcome Section - Mobile Optimized */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-lg text-gray-600">
                Your content empire is growing strong. Let's create something amazing today.
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
                <Trophy className="w-4 h-4 mr-1" />
                {stats.activeStreaks} day streak
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
                <Rocket className="w-4 h-4 mr-1" />
                Pro Member
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Total Content</p>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalContent}</p>
                  <p className="text-xs text-purple-200 mt-1">pieces created</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-100">AI Generated</p>
                  <p className="text-2xl md:text-3xl font-bold">{stats.repurposedThisMonth}</p>
                  <p className="text-xs text-emerald-200 mt-1">this month</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Scheduled</p>
                  <p className="text-2xl md:text-3xl font-bold">{stats.scheduledPosts}</p>
                  <p className="text-xs text-blue-200 mt-1">ready to publish</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-600 to-cyan-800 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-100">Engagement</p>
                  <p className="text-2xl md:text-3xl font-bold">{stats.engagementRate}%</p>
                  <p className="text-xs text-cyan-200 mt-1">average rate</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Performance Dashboard */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-purple-200/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Target className="w-6 h-6 mr-3 text-purple-600" />
                Performance Overview
              </CardTitle>
              <CardDescription className="text-lg">Your content's impact across all platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <p className="text-2xl font-bold text-purple-700">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-purple-600">Total Views</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-700">{stats.totalLikes.toLocaleString()}</p>
                  <p className="text-sm text-emerald-600">Total Likes</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <p className="text-2xl font-bold text-blue-700">{stats.totalShares.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">Total Shares</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50 p-6 rounded-2xl border border-purple-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">Achievement Unlocked! 🎉</h4>
                  <Badge className="bg-purple-100 text-purple-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Creator
                  </Badge>
                </div>
                <p className="text-gray-600">You've maintained a {stats.activeStreaks}-day content creation streak and generated over {stats.totalViews.toLocaleString()} total views!</p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex space-x-2">
                    {[Instagram, Twitter, Linkedin, Youtube, Facebook].map((Icon, i) => (
                      <div key={i} className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Connected platforms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                  Live Activity
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 text-xs animate-pulse">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No recent activity</p>
                    <p className="text-sm">Start creating to see your activity here!</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-purple-50/50 transition-colors">
                      <div className="p-1.5 rounded-full bg-white shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                          {getStatusBadge(activity.status)}
                        </div>
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

        {/* Enhanced Quick Actions - Mobile Optimized */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            AI-Powered Creation Studio
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Card className={`group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 ${action.glow} bg-white/90 backdrop-blur-sm`}>
                  <CardContent className="p-4 md:p-6 text-center relative">
                    {action.badge && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1">
                        {action.badge}
                      </Badge>
                    )}
                    <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 md:mb-2 text-sm md:text-lg">{action.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Enhanced Content Management */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Widget */}
          <ContentUploadWidget onContentUploaded={loadDashboardData} />

          {/* Enhanced Content Library */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-2xl">
                  <FileText className="w-6 h-6 mr-3 text-purple-600" />
                  Content Library
                </CardTitle>
                <Badge className="bg-purple-100 text-purple-700">
                  {recentContent.length} items
                </Badge>
              </div>
              <CardDescription className="text-lg">Your creative masterpieces</CardDescription>
              
              {/* Search & Filter */}
              <div className="flex items-center space-x-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-purple-200 focus:border-purple-400"
                  />
                </div>
                <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredContent.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-medium">Ready to create?</p>
                  <p className="text-sm">Upload your first piece of content to begin your journey!</p>
                  <Button className="mt-4 bg-gradient-to-r from-purple-600 to-black text-white border-0" asChild>
                    <Link to="/upload">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Content
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredContent.map((content) => (
                    <div key={content.id} className="group p-4 bg-gradient-to-r from-purple-50/30 to-white rounded-xl border border-purple-200/30 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">{content.title}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 mb-3">
                            <Badge className="bg-purple-100 text-purple-700 text-xs capitalize font-medium">
                              {content.content_type.replace('_', ' ')}
                            </Badge>
                            <span>{new Date(content.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link to={`/repurpose?contentId=${content.id}`}>
                              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white border-0 shadow-md">
                                <Wand2 className="w-3 h-3 mr-1" />
                                Transform
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-1 ml-4">
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link to="/repurpose">
                      <Button variant="outline" className="border-purple-200 hover:bg-purple-50">
                        View All Content
                        <ArrowRight className="w-4 h-4 ml-2" />
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

        {/* Enhanced Pro Upgrade CTA */}
        <Card className="bg-gradient-to-br from-purple-600 via-black to-purple-800 border-0 text-white mt-8 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-black/20"></div>
          <CardContent className="p-8 md:p-12 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Crown className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Unleash Your Content Superpowers
            </h3>
            <p className="text-purple-100 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
              Join thousands of creators who've 10x'd their content output with our AI-powered platform. 
              Unlimited repurposing, advanced scheduling, and deep analytics await.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link to="/settings?tab=billing">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold text-lg px-8 py-4 shadow-xl border-0">
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Pro - $29/mo
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-4">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm opacity-90">
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                30-day money back
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
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
