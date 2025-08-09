
import { 
  FileText, 
  Wand2, 
  Clock, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share, 
  MessageCircle,
  Target,
  Zap,
  Trophy,
  Users,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface StatsData {
  totalPosts: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPlatform: string;
  weeklyGrowth: number;
  monthlyActive: number;
  conversionRate: number;
}

interface DashboardStatsProps {
  stats: StatsData;
  loading: boolean;
}

const DashboardStats = ({ stats, loading }: DashboardStatsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-gradient-to-r from-purple-200 to-gray-200 rounded-lg opacity-60"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Content',
      value: stats.totalPosts.toLocaleString(),
      subtitle: 'pieces created',
      icon: FileText,
      gradient: 'from-purple-600 to-purple-800',
      change: '+12%',
      changeType: 'positive' as const,
      bgPattern: 'bg-purple-500/10'
    },
    {
      title: 'Total Views',
      value: formatNumber(stats.totalViews),
      subtitle: 'across platforms',
      icon: Eye,
      gradient: 'from-blue-600 to-blue-800',
      change: '+' + stats.weeklyGrowth + '%',
      changeType: stats.weeklyGrowth >= 0 ? 'positive' as const : 'negative' as const,
      bgPattern: 'bg-blue-500/10'
    },
    {
      title: 'Engagement',
      value: formatNumber(stats.totalEngagement),
      subtitle: 'total interactions',
      icon: Heart,
      gradient: 'from-emerald-600 to-emerald-800',
      change: '+23%',
      changeType: 'positive' as const,
      bgPattern: 'bg-emerald-500/10'
    },
    {
      title: 'Avg. Rate',
      value: stats.avgEngagementRate + '%',
      subtitle: 'engagement rate',
      icon: TrendingUp,
      gradient: 'from-cyan-600 to-cyan-800',
      change: 'Above avg',
      changeType: 'neutral' as const,
      bgPattern: 'bg-cyan-500/10'
    },
    {
      title: 'Top Platform',
      value: stats.topPlatform,
      subtitle: 'best performer',
      icon: Target,
      gradient: 'from-orange-600 to-orange-800',
      change: 'Leading',
      changeType: 'positive' as const,
      bgPattern: 'bg-orange-500/10'
    },
    {
      title: 'Conversion',
      value: stats.conversionRate + '%',
      subtitle: 'click-through rate',
      icon: Zap,
      gradient: 'from-pink-600 to-pink-800',
      change: '+15%',
      changeType: 'positive' as const,
      bgPattern: 'bg-pink-500/10'
    },
    {
      title: 'Active Users',
      value: stats.monthlyActive.toLocaleString(),
      subtitle: 'monthly reach',
      icon: Users,
      gradient: 'from-indigo-600 to-indigo-800',
      change: '+8%',
      changeType: 'positive' as const,
      bgPattern: 'bg-indigo-500/10'
    },
    {
      title: 'Performance',
      value: 'Excellent',
      subtitle: 'overall rating',
      icon: Trophy,
      gradient: 'from-yellow-600 to-yellow-800',
      change: 'Top 10%',
      changeType: 'positive' as const,
      bgPattern: 'bg-yellow-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden relative bg-white/80 backdrop-blur-sm">
            <div className={`absolute inset-0 ${stat.bgPattern} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Badge 
                  className={`text-xs px-2 py-1 ${
                    stat.changeType === 'positive' 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : stat.changeType === 'negative'
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {stat.change}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>

              {/* Mini progress indicator */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Progress 
                  value={Math.random() * 100} 
                  className="h-1"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

export default DashboardStats;
