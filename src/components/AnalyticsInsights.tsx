
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

interface InsightsProps {
  analytics: {
    totalContent: number;
    totalRepurposed: number;
    avgEngagement: number;
    bestPerformingPlatform: string;
    platformMetrics: Array<{
      platform: string;
      count: number;
      avgEngagement: number;
    }>;
  };
}

const AnalyticsInsights = ({ analytics }: InsightsProps) => {
  const generateInsights = () => {
    const insights = [];

    // Content volume insights
    if (analytics.totalContent < 5) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Content Volume',
        message: 'You have limited content. Consider uploading more original content to maximize repurposing opportunities.',
        actionable: 'Upload at least 5-10 pieces of content for better analytics.'
      });
    } else {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Good Content Volume',
        message: `You have ${analytics.totalContent} pieces of content - great foundation for repurposing!`,
        actionable: 'Keep adding quality content regularly.'
      });
    }

    // Repurposing ratio insights
    const repurposeRatio = analytics.totalContent > 0 ? analytics.totalRepurposed / analytics.totalContent : 0;
    if (repurposeRatio < 2) {
      insights.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Repurposing Opportunity',
        message: 'You can get more value from your content by repurposing each piece for multiple platforms.',
        actionable: 'Aim for 3-5 repurposed versions per original content piece.'
      });
    }

    // Platform performance insights
    if (analytics.platformMetrics.length > 0) {
      const sortedPlatforms = [...analytics.platformMetrics].sort((a, b) => b.avgEngagement - a.avgEngagement);
      const bestPlatform = sortedPlatforms[0];
      const worstPlatform = sortedPlatforms[sortedPlatforms.length - 1];

      if (sortedPlatforms.length > 1 && bestPlatform.avgEngagement > worstPlatform.avgEngagement * 1.5) {
        insights.push({
          type: 'trend',
          icon: TrendingUp,
          title: 'Platform Performance Gap',
          message: `${bestPlatform.platform} is performing ${Math.round(bestPlatform.avgEngagement / worstPlatform.avgEngagement)}x better than ${worstPlatform.platform}.`,
          actionable: `Focus more content on ${bestPlatform.platform} or improve your ${worstPlatform.platform} strategy.`
        });
      }
    }

    // Engagement insights
    if (analytics.avgEngagement < 100) {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Low Engagement',
        message: 'Your average engagement is below 100. This could indicate content or timing issues.',
        actionable: 'Try different posting times, add more calls-to-action, or experiment with content formats.'
      });
    } else if (analytics.avgEngagement > 500) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Excellent Engagement',
        message: `Your average engagement of ${analytics.avgEngagement} is performing very well!`,
        actionable: 'Keep doing what you\'re doing and consider scaling up your content production.'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'tip': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'trend': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-orange-500';
      case 'tip': return 'text-blue-500';
      case 'trend': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          AI Insights & Recommendations
        </CardTitle>
        <CardDescription>
          Personalized insights based on your content performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-0.5 ${getIconColor(insight.type)}`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{insight.message}</p>
                  <p className="text-xs font-medium opacity-75">
                    💡 Action: {insight.actionable}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {insights.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Start creating and repurposing content to get personalized insights!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsInsights;
