import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Heart, Share, MessageCircle, Eye, Zap, Target, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePersistentState } from '@/hooks/usePersistentState';
import { toast } from 'sonner';

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
  clicks: number;
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
  views: number;
  clicks: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: '#1DA1F2',
  linkedin: '#0077B5',
  facebook: '#1877F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#000000',
  threads: '#000000',
  pinterest: '#E60023',
  blog: '#FF6B35',
};

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = usePersistentState<AnalyticsData | null>('analytics_data', null);
  const [timeRange, setTimeRange] = usePersistentState('analytics_time_range', '30');
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
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch real analytics data
      const { data: analyticsRaw, error: analyticsError } = await supabase
        .from('post_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false });

      if (analyticsError) throw analyticsError;

      // Fetch scheduled posts data
      const { data: postsData, error: postsError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const processedAnalytics = processRealAnalytics(analyticsRaw || [], postsData || [], daysAgo);
      setAnalyticsData(processedAnalytics);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processRealAnalytics = (analyticsData: any[], postsData: any[], daysAgo: number): AnalyticsData => {
    // Build platform breakdown from REAL data only
    const platformMap = new Map<string, { posts: number; engagement: number }>();

    for (const post of postsData) {
      const existing = platformMap.get(post.platform) || { posts: 0, engagement: 0 };
      existing.posts += 1;
      // Find analytics for this post
      const postAnalytics = analyticsData.filter(a => a.post_id === post.id);
      for (const a of postAnalytics) {
        existing.engagement += (Number(a.likes) || 0) + (Number(a.shares) || 0) + (Number(a.comments) || 0);
      }
      platformMap.set(post.platform, existing);
    }

    const platformBreakdown: PlatformData[] = Array.from(platformMap.entries()).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      posts: data.posts,
      engagement: data.engagement,
      color: PLATFORM_COLORS[name] || '#8b5cf6',
    }));

    // Build engagement trend from REAL data only
    const trendDays = Math.min(daysAgo, 30);
    const engagementTrend: TrendData[] = Array.from({ length: trendDays }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (trendDays - 1 - i));
      const dateStr = date.toDateString();

      const dayAnalytics = analyticsData.filter(d =>
        new Date(d.recorded_at).toDateString() === dateStr
      );
      const dayPosts = postsData.filter(p =>
        new Date(p.created_at).toDateString() === dateStr
      );

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        engagement: dayAnalytics.reduce((sum, d) => sum + (Number(d.likes) || 0) + (Number(d.shares) || 0) + (Number(d.comments) || 0), 0),
        posts: dayPosts.length,
        views: dayAnalytics.reduce((sum, d) => sum + (Number(d.views) || 0), 0),
        clicks: dayAnalytics.reduce((sum, d) => sum + (Number(d.clicks) || 0), 0),
      };
    });

    // Build recent posts from REAL data only
    const recentPosts: PostAnalytics[] = postsData.slice(0, 10).map((post) => {
      const postAnalytics = analyticsData.find(a => a.post_id === post.id);

      return {
        id: post.id,
        platform: post.platform,
        content: (post.content?.substring(0, 120) || 'Untitled') + (post.content?.length > 120 ? '...' : ''),
        likes: Number(postAnalytics?.likes) || 0,
        shares: Number(postAnalytics?.shares) || 0,
        comments: Number(postAnalytics?.comments) || 0,
        views: Number(postAnalytics?.views) || 0,
        clicks: Number(postAnalytics?.clicks) || 0,
        engagementRate: Number(postAnalytics?.engagement_rate) || 0,
        postedAt: new Date(post.created_at),
      };
    }).sort((a, b) => b.engagementRate - a.engagementRate);

    const totalEngagement = analyticsData.reduce((sum, d) =>
      sum + (Number(d.likes) || 0) + (Number(d.shares) || 0) + (Number(d.comments) || 0), 0);

    const avgEngagement = analyticsData.length > 0
      ? analyticsData.reduce((sum, d) => sum + (Number(d.engagement_rate) || 0), 0) / analyticsData.length
      : 0;

    const topPlatform = platformBreakdown.length > 0
      ? platformBreakdown.reduce((max, p) => p.engagement > max.engagement ? p : max, platformBreakdown[0]).name
      : 'None yet';

    return {
      totalPosts: postsData.length,
      totalEngagement,
      avgEngagementRate: Number(avgEngagement.toFixed(1)),
      topPerformingPlatform: topPlatform,
      recentPosts,
      platformBreakdown,
      engagementTrend,
    };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const refreshAnalytics = () => {
    loadAnalytics();
    toast.success('Analytics refreshed!');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <div className="h-48 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg"></div>
          </Card>
        ))}
      </div>
    );
  }

  const hasData = analyticsData && (analyticsData.totalPosts > 0 || analyticsData.totalEngagement > 0);

  if (!hasData) {
    return (
      <Card className="card-modern">
        <CardContent className="text-center py-16">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-xl text-foreground mb-2">No analytics data yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Start scheduling and publishing content to see real performance insights here.
            <br />Analytics are powered by your actual post data — no fake numbers.
          </p>
          <Button onClick={refreshAnalytics} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Analytics Command Center
          </h2>
          <p className="text-muted-foreground mt-1">Real performance data from your published content</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={refreshAnalytics} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-3xl font-bold text-foreground">{analyticsData!.totalPosts}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
                <p className="text-3xl font-bold text-foreground">{formatNumber(analyticsData!.totalEngagement)}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Heart className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Engagement Rate</p>
                <p className="text-3xl font-bold text-foreground">{analyticsData!.avgEngagementRate}%</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Platform</p>
                <p className="text-xl font-bold text-foreground">{analyticsData!.topPerformingPlatform}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Target className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Real engagement data over time</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData!.engagementTrend.some(d => d.views > 0 || d.engagement > 0) ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={analyticsData!.engagementTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="engagement" stackId="2" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="clicks" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                <div className="text-center">
                  <Eye className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No trend data yet — publish content to see performance over time</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Engagement breakdown by platform</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData!.platformBreakdown.length > 0 ? (
              <div className="space-y-4">
                {analyticsData!.platformBreakdown.map((platform) => (
                  <div key={platform.name} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: platform.color }}></div>
                        <span className="font-semibold text-foreground">{platform.name}</span>
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">{platform.posts} posts</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Engagement: </span>
                        <span className="font-semibold text-foreground">{formatNumber(platform.engagement)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg/post: </span>
                        <span className="font-semibold text-foreground">{platform.posts > 0 ? Math.round(platform.engagement / platform.posts) : 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="text-center">
                  <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No platform data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Post Performance Breakdown</CardTitle>
          <CardDescription>Real metrics from your published content</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData!.recentPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No posts to analyze yet</p>
              <p className="text-sm">Schedule and publish content to see per-post performance metrics here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyticsData!.recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-6 bg-muted/20 rounded-xl border border-border/30 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full capitalize">
                          {post.platform}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {post.postedAt.toLocaleDateString()}
                        </span>
                        {post.engagementRate > 0 && (
                          <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                            {post.engagementRate.toFixed(1)}% rate
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{post.content}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                    <div className="flex items-center justify-center space-x-2 p-2 bg-background/50 rounded-lg">
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">{formatNumber(post.views)}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 bg-background/50 rounded-lg">
                      <Heart className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-semibold">{post.likes}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 bg-background/50 rounded-lg">
                      <Share className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">{post.shares}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 bg-background/50 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold">{post.comments}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 bg-background/50 rounded-lg">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">{post.clicks}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 bg-accent/10 rounded-lg border border-accent/20">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-accent">{post.engagementRate.toFixed(1)}%</span>
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
