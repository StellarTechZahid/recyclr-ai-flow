
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
  Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ContentUploadWidget from "@/components/ContentUploadWidget";
import ContentRecommendations from "@/components/ContentRecommendations";
import { socialMediaManager } from "@/lib/socialMedia";
import { toast } from "sonner";

interface DashboardStats {
  totalContent: number;
  repurposedThisMonth: number;
  scheduledPosts: number;
  engagementRate: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalContent: 0,
    repurposedThisMonth: 0,
    scheduledPosts: 0,
    engagementRate: 0
  });
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      console.log('Loading dashboard data for user:', user.id);
      
      // Load content statistics
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('id, title, created_at, content_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (contentError) {
        console.error('Content loading error:', contentError);
        throw contentError;
      }

      console.log('Loaded content:', contentData);

      // Load repurposed content count for this month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const { data: repurposedData, error: repurposedError } = await supabase
        .from('repurposed_content')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', currentMonth.toISOString());

      if (repurposedError) {
        console.error('Repurposed content error:', repurposedError);
        // Don't throw, just log
      }

      // Load scheduled posts
      let scheduledPostsCount = 0;
      try {
        const scheduledPosts = await socialMediaManager.getScheduledPosts(user.id);
        scheduledPostsCount = scheduledPosts.filter(post => post.status === 'scheduled').length;
      } catch (error) {
        console.error('Scheduled posts error:', error);
        // Don't throw, use default value
      }

      setStats({
        totalContent: contentData?.length || 0,
        repurposedThisMonth: repurposedData?.length || 0,
        scheduledPosts: scheduledPostsCount,
        engagementRate: 4.2 // Mock data - would come from social media APIs
      });

      setRecentContent(contentData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Upload Content",
      description: "Add new content to repurpose",
      icon: Plus,
      href: "/upload",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Repurpose Content",
      description: "Transform existing content with AI",
      icon: Wand2,
      href: "/repurpose",
      color: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      title: "Schedule Posts",
      description: "Plan your content calendar",
      icon: Calendar,
      href: "/schedule",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "View Analytics",
      description: "Track your performance",
      icon: BarChart3,
      href: "/analytics",
      color: "bg-cyan-500 hover:bg-cyan-600"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse space-y-6 p-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold brand-gradient-text">
                RecyclrAI
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/dashboard" className="nav-link text-purple-600">Dashboard</Link>
                <Link to="/repurpose" className="nav-link">Repurpose</Link>
                <Link to="/schedule" className="nav-link">Schedule</Link>
                <Link to="/analytics" className="nav-link">Analytics</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/settings">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Ready to repurpose your content and grow your audience?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Content</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalContent}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Repurposed This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.repurposedThisMonth}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <Wand2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled Posts</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.scheduledPosts}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.engagementRate}%</p>
                </div>
                <div className="p-3 bg-cyan-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Card className="card-modern card-interactive hover:shadow-modern-lg">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Widget */}
          <ContentUploadWidget onContentUploaded={loadDashboardData} />

          {/* Recent Content */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <FileText className="w-6 h-6 mr-3 text-gray-600" />
                Recent Content
              </CardTitle>
              <CardDescription className="text-lg">
                Your latest uploaded content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentContent.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No content yet</p>
                  <p className="text-sm">Upload your first piece of content to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentContent.map((content) => (
                    <div key={content.id} className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{content.title}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">
                              {content.content_type.replace('_', ' ')}
                            </span>
                            <span>{new Date(content.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Link to={`/repurpose?contentId=${content.id}`}>
                          <Button size="sm" className="btn-primary-modern text-sm">
                            <Wand2 className="w-4 h-4 mr-1" />
                            Repurpose
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link to="/repurpose">
                      <Button variant="outline">View All Content</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <ContentRecommendations />

        {/* Upgrade Prompt for Free Users */}
        <Card className="card-modern bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mt-8">
          <CardContent className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Unlock Your Full Potential
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Upgrade to Pro for unlimited AI repurposing, advanced scheduling, 
              and detailed analytics to supercharge your content strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/settings?tab=billing">
                <Button className="btn-primary-modern text-lg px-8 py-3">
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="outline" className="text-lg px-8 py-3">
                  View Analytics
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
