
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Heart, Share, MessageCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPerformingPlatform: string;
  recentPosts: PostAnalytics[];
  platformBreakdown: PlatformData[];
  engagementTrend: TrendData[];
}

interface PostAnalytics {
  id: string;
  platform: string;
  content: string;
  likes: number;
  shares: number;
  comments: number;
  views: number;
  engagementRate: number;
  postedAt: Date;
}

interface PlatformData {
  name: string;
  posts: number;
  engagement: number;
  color: string;
}

interface TrendData {
  date: string;
  engagement: number;
  posts: number;
}

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get date range
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch scheduled posts data (as proxy for analytics)
      const { data: postsData, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock analytics calculations (in real app, this would come from social media APIs)
      const mockAnalytics = generateMockAnalytics(postsData || []);
      setAnalyticsData(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics = (posts: any[]): AnalyticsData => {
    // Generate realistic mock data based on actual posts
    const platformCounts = posts.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const platformData: PlatformData[] = [
      { name: 'Twitter', posts: platformCounts.twitter || 0, engagement: Math.floor(Math.random() * 1000) + 500, color: '#1DA1F2' },
      { name: 'LinkedIn', posts: platformCounts.linkedin || 0, engagement: Math.floor(Math.random() * 800) + 300, color: '#0077B5' },
    ];

    const engagementTrend: TrendData[] = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        engagement: Math.floor(Math.random() * 200) + 50,
        posts: Math.floor(Math.random() * 5) + 1,
      };
    });

    const recentPosts: PostAnalytics[] = posts.slice(0, 10).map(post => ({
      id: post.id,
      platform: post.platform,
      content: post.content.substring(0, 100) + '...',
      likes: Math.floor(Math.random() * 100) + 10,
      shares: Math.floor(Math.random() * 20) + 2,
      comments: Math.floor(Math.random() * 30) + 5,
      views: Math.floor(Math.random() * 1000) + 100,
      engagementRate: Math.random() * 10 + 2,
      postedAt: new Date(post.created_at),
    }));

    return {
      totalPosts: posts.length,
      totalEngagement: platformData.reduce((sum, p) => sum + p.engagement, 0),
      avgEngagementRate: 4.2,
      topPerformingPlatform: platformData.reduce((max, p) => p.engagement > max.engagement ? p : max, platformData[0])?.name || 'Twitter',
      recentPosts,
      platformBreakdown: platformData,
      engagementTrend,
    };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="card-modern">
        <CardContent className="text-center py-12">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-500">No analytics data available</p>
          <p className="text-sm text-gray-400">Start posting content to see your analytics!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold brand-gradient-text">Analytics Overview</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48 input-modern">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.totalPosts}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(analyticsData.totalEngagement)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Heart className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Engagement Rate</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.avgEngagementRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-cyan-100 rounded-full">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Platform</p>
                <p className="text-xl font-bold text-gray-900">{analyticsData.topPerformingPlatform}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Share className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Engagement Trend */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Engagement Trend</CardTitle>
            <CardDescription>Daily engagement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>Posts by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.platformBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, posts }) => `${name}: ${posts}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="posts"
                >
                  {analyticsData.platformBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts Performance */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Recent Posts Performance</CardTitle>
          <CardDescription>Your latest posts and their engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.recentPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent posts to analyze</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyticsData.recentPosts.map((post) => (
                <div key={post.id} className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                          {post.platform}
                        </span>
                        <span className="text-sm text-gray-500">
                          {post.postedAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{post.content}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Share className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{post.shares}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Eye className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">{formatNumber(post.views)}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium">{post.engagementRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
