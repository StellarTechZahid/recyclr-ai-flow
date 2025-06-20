
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, FileText, Zap, Users, Calendar } from "lucide-react";
import AnalyticsInsights from "@/components/AnalyticsInsights";

const Analytics = () => {
  // Mock data for demonstration
  const mockAnalytics = {
    totalContent: 12,
    totalRepurposed: 48,
    avgEngagement: 324,
    bestPerformingPlatform: "LinkedIn",
    platformMetrics: [
      { platform: "Twitter", count: 15, avgEngagement: 287 },
      { platform: "LinkedIn", count: 12, avgEngagement: 445 },
      { platform: "Instagram", count: 8, avgEngagement: 198 },
      { platform: "Facebook", count: 13, avgEngagement: 267 }
    ]
  };

  const engagementData = [
    { name: 'Jan', engagement: 240 },
    { name: 'Feb', engagement: 298 },
    { name: 'Mar', engagement: 324 },
    { name: 'Apr', engagement: 387 },
    { name: 'May', engagement: 445 },
    { name: 'Jun', engagement: 512 }
  ];

  const platformData = mockAnalytics.platformMetrics.map(platform => ({
    name: platform.platform,
    value: platform.count,
    engagement: platform.avgEngagement
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your content performance and get AI-powered insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Content</CardDescription>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">{mockAnalytics.totalContent}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Repurposed Content</CardDescription>
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">{mockAnalytics.totalRepurposed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +24% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Avg Engagement</CardDescription>
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-2xl">{mockAnalytics.avgEngagement}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Best Platform</CardDescription>
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <CardTitle className="text-xl">{mockAnalytics.bestPerformingPlatform}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-xs">
                {mockAnalytics.platformMetrics.find(p => p.platform === mockAnalytics.bestPerformingPlatform)?.avgEngagement} avg engagement
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Engagement Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trend</CardTitle>
              <CardDescription>Monthly engagement performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#8884d8" />
                </BarChart>
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
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <AnalyticsInsights analytics={mockAnalytics} />
      </div>
    </div>
  );
};

export default Analytics;
