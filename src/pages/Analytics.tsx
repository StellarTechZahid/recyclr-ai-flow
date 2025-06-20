
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, Eye, Heart, Share2, MessageCircle, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  totalContent: number;
  totalRepurposed: number;
  avgEngagement: number;
  bestPerformingPlatform: string;
  contentPerformance: Array<{
    title: string;
    platform: string;
    engagement: number;
    views: number;
    likes: number;
    shares: number;
    comments: number;
    created_at: string;
  }>;
  platformMetrics: Array<{
    platform: string;
    count: number;
    avgEngagement: number;
  }>;
  timelineData: Array<{
    date: string;
    content: number;
    engagement: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      if (timeRange === "7d") startDate.setDate(endDate.getDate() - 7);
      else if (timeRange === "30d") startDate.setDate(endDate.getDate() - 30);
      else if (timeRange === "90d") startDate.setDate(endDate.getDate() - 90);

      // Fetch content and repurposed content data
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (contentError) throw contentError;

      const { data: repurposedData, error: repurposedError } = await supabase
        .from('repurposed_content')
        .select('*, content:original_content_id(title)')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (repurposedError) throw repurposedError;

      // Process analytics data
      const totalContent = contentData?.length || 0;
      const totalRepurposed = repurposedData?.length || 0;

      // Mock engagement data (in real app, this would come from platform APIs)
      const contentPerformance = repurposedData?.map((item, index) => ({
        title: item.content?.title || 'Untitled',
        platform: item.platform,
        engagement: Math.floor(Math.random() * 1000) + 50, // Mock data
        views: Math.floor(Math.random() * 5000) + 100,
        likes: Math.floor(Math.random() * 500) + 10,
        shares: Math.floor(Math.random() * 100) + 5,
        comments: Math.floor(Math.random() * 50) + 2,
        created_at: item.created_at,
      })) || [];

      const avgEngagement = contentPerformance.length > 0 
        ? Math.round(contentPerformance.reduce((sum, item) => sum + item.engagement, 0) / contentPerformance.length)
        : 0;

      // Platform metrics
      const platformCounts = repurposedData?.reduce((acc, item) => {
        acc[item.platform] = (acc[item.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const platformMetrics = Object.entries(platformCounts).map(([platform, count]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        count,
        avgEngagement: Math.floor(Math.random() * 500) + 100, // Mock data
      }));

      const bestPerformingPlatform = platformMetrics.reduce((best, current) => 
        current.avgEngagement > best.avgEngagement ? current : best, 
        platformMetrics[0] || { platform: 'N/A' }
      ).platform;

      // Timeline data (mock)
      const timelineData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          content: Math.floor(Math.random() * 5) + 1,
          engagement: Math.floor(Math.random() * 300) + 50,
        };
      });

      setAnalytics({
        totalContent,
        totalRepurposed,
        avgEngagement,
        bestPerformingPlatform,
        contentPerformance,
        platformMetrics,
        timelineData,
      });

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-pulse" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Content Analytics</h1>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Content</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                {analytics?.totalContent || 0}
                <TrendingUp className="w-4 h-4 ml-2 text-green-500" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Repurposed Posts</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                {analytics?.totalRepurposed || 0}
                <Share2 className="w-4 h-4 ml-2 text-blue-500" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Engagement</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                {analytics?.avgEngagement || 0}
                <Heart className="w-4 h-4 ml-2 text-red-500" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Best Platform</CardDescription>
              <CardTitle className="text-lg">
                {analytics?.bestPerformingPlatform || 'N/A'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Engagement Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Over Time</CardTitle>
              <CardDescription>Daily engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.timelineData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>Content distribution across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.platformMetrics || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ platform, count }) => `${platform}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics?.platformMetrics?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Platform Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Average engagement by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.platformMetrics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgEngagement" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Content Performance</CardTitle>
            <CardDescription>Detailed metrics for your repurposed content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Content</th>
                    <th className="text-left p-2">Platform</th>
                    <th className="text-left p-2 flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Views
                    </th>
                    <th className="text-left p-2">
                      <Heart className="w-4 h-4 mr-1 inline" />
                      Likes
                    </th>
                    <th className="text-left p-2">
                      <Share2 className="w-4 h-4 mr-1 inline" />
                      Shares
                    </th>
                    <th className="text-left p-2">
                      <MessageCircle className="w-4 h-4 mr-1 inline" />
                      Comments
                    </th>
                    <th className="text-left p-2">Total Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.contentPerformance?.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="max-w-xs truncate font-medium">{item.title}</div>
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {item.platform}
                        </span>
                      </td>
                      <td className="p-2">{item.views.toLocaleString()}</td>
                      <td className="p-2">{item.likes.toLocaleString()}</td>
                      <td className="p-2">{item.shares.toLocaleString()}</td>
                      <td className="p-2">{item.comments.toLocaleString()}</td>
                      <td className="p-2 font-semibold">{item.engagement.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!analytics?.contentPerformance || analytics.contentPerformance.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No content data available yet. Start repurposing content to see analytics!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
