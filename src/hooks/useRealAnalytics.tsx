
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealTimeMetrics {
  totalPosts: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPlatform: string;
  weeklyGrowth: number;
  monthlyActive: number;
  conversionRate: number;
}

interface ContentPerformance {
  id: string;
  title: string;
  platform: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  engagementRate: number;
  publishedAt: Date;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

interface PlatformStats {
  platform: string;
  posts: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
  growth: number;
  color: string;
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

export function useRealAnalytics(timeRange: string = '30') {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [topContent, setTopContent] = useState<ContentPerformance[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      loadRealAnalytics();
      const interval = setInterval(loadRealAnalytics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, timeRange]);

  const loadRealAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const daysAgo = Number(timeRange) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Load real analytics data — no joins to avoid FK issues
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('post_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false });

      if (analyticsError) throw analyticsError;

      // Load scheduled posts
      const { data: scheduledPosts, error: postsError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const analytics = analyticsData || [];
      const posts = scheduledPosts || [];

      // Calculate REAL metrics — zero when no data
      const processedMetrics = calculateRealMetrics(analytics, posts, daysAgo);
      const processedContent = processContentPerformance(analytics, posts);
      const processedPlatforms = calculatePlatformStats(analytics, posts, daysAgo);

      setMetrics(processedMetrics);
      setTopContent(processedContent);
      setPlatformStats(processedPlatforms);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading real analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateRealMetrics = (analytics: any[], posts: any[], daysAgo: number): RealTimeMetrics => {
    const totalViews = analytics.reduce((sum, item) => sum + (Number(item.views) || 0), 0);
    const totalLikes = analytics.reduce((sum, item) => sum + (Number(item.likes) || 0), 0);
    const totalShares = analytics.reduce((sum, item) => sum + (Number(item.shares) || 0), 0);
    const totalComments = analytics.reduce((sum, item) => sum + (Number(item.comments) || 0), 0);
    const totalEngagement = totalLikes + totalShares + totalComments;

    const avgEngagementRate = analytics.length > 0
      ? analytics.reduce((sum, item) => sum + (Number(item.engagement_rate) || 0), 0) / analytics.length
      : 0;

    // Calculate platform distribution from real posts
    const platformCounts = posts.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPlatform = Object.entries(platformCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'None';

    // Calculate REAL growth by comparing halves of the period
    const midDate = new Date();
    midDate.setDate(midDate.getDate() - Math.floor(daysAgo / 2));

    const recentAnalytics = analytics.filter(item => new Date(item.recorded_at) >= midDate);
    const olderAnalytics = analytics.filter(item => new Date(item.recorded_at) < midDate);

    const recentEngagement = recentAnalytics.reduce((sum, item) =>
      sum + (Number(item.likes) || 0) + (Number(item.shares) || 0) + (Number(item.comments) || 0), 0);
    const olderEngagement = olderAnalytics.reduce((sum, item) =>
      sum + (Number(item.likes) || 0) + (Number(item.shares) || 0) + (Number(item.comments) || 0), 0);

    const weeklyGrowth = olderEngagement > 0
      ? Math.round(((recentEngagement - olderEngagement) / olderEngagement) * 100)
      : 0;

    return {
      totalPosts: posts.length,
      totalViews,
      totalEngagement,
      avgEngagementRate: Number(avgEngagementRate.toFixed(1)),
      topPlatform,
      weeklyGrowth,
      monthlyActive: posts.length > 0 ? 1 : 0, // The current user
      conversionRate: totalViews > 0 ? Number(((totalEngagement / totalViews) * 100).toFixed(1)) : 0,
    };
  };

  const processContentPerformance = (analytics: any[], posts: any[]): ContentPerformance[] => {
    return posts.slice(0, 10).map(post => {
      const postAnalytics = analytics.find(item => item.post_id === post.id);
      const views = Number(postAnalytics?.views) || 0;
      const likes = Number(postAnalytics?.likes) || 0;
      const shares = Number(postAnalytics?.shares) || 0;
      const comments = Number(postAnalytics?.comments) || 0;
      const clicks = Number(postAnalytics?.clicks) || 0;
      const engagementRate = Number(postAnalytics?.engagement_rate) || 0;

      let performance: 'excellent' | 'good' | 'average' | 'poor' = 'poor';
      if (engagementRate >= 8) performance = 'excellent';
      else if (engagementRate >= 5) performance = 'good';
      else if (engagementRate >= 2) performance = 'average';

      return {
        id: post.id,
        title: (post.content?.substring(0, 60) || 'Untitled Post') + (post.content?.length > 60 ? '...' : ''),
        platform: post.platform,
        views,
        likes,
        shares,
        comments,
        clicks,
        engagementRate,
        publishedAt: new Date(post.created_at),
        performance,
      };
    }).sort((a, b) => b.engagementRate - a.engagementRate);
  };

  const calculatePlatformStats = (analytics: any[], posts: any[], daysAgo: number): PlatformStats[] => {
    // Only include platforms that have real posts
    const platformSet = new Set(posts.map(p => p.platform));

    return Array.from(platformSet).map((platform) => {
      const platformPosts = posts.filter(post => post.platform === platform);
      const platformAnalytics = analytics.filter(item =>
        platformPosts.some(post => post.id === item.post_id)
      );

      const totalViews = platformAnalytics.reduce((sum, item) => sum + (Number(item.views) || 0), 0);
      const totalEngagement = platformAnalytics.reduce((sum, item) =>
        sum + (Number(item.likes) || 0) + (Number(item.shares) || 0) + (Number(item.comments) || 0), 0
      );
      const avgEngagementRate = platformAnalytics.length > 0
        ? platformAnalytics.reduce((sum, item) => sum + (Number(item.engagement_rate) || 0), 0) / platformAnalytics.length
        : 0;

      // Calculate real growth by comparing halves
      const midDate = new Date();
      midDate.setDate(midDate.getDate() - Math.floor(daysAgo / 2));
      const recentPlatAnalytics = platformAnalytics.filter(a => new Date(a.recorded_at) >= midDate);
      const olderPlatAnalytics = platformAnalytics.filter(a => new Date(a.recorded_at) < midDate);
      const recentEng = recentPlatAnalytics.reduce((s, a) => s + (Number(a.likes) || 0) + (Number(a.shares) || 0) + (Number(a.comments) || 0), 0);
      const olderEng = olderPlatAnalytics.reduce((s, a) => s + (Number(a.likes) || 0) + (Number(a.shares) || 0) + (Number(a.comments) || 0), 0);
      const growth = olderEng > 0 ? Math.round(((recentEng - olderEng) / olderEng) * 100) : 0;

      return {
        platform,
        posts: platformPosts.length,
        totalViews,
        totalEngagement,
        avgEngagementRate: Number(avgEngagementRate.toFixed(1)),
        growth,
        color: PLATFORM_COLORS[platform] || '#8b5cf6',
      };
    }).filter(stat => stat.posts > 0);
  };

  return {
    metrics,
    topContent,
    platformStats,
    loading,
    lastUpdated,
    refreshAnalytics: loadRealAnalytics,
  };
}
