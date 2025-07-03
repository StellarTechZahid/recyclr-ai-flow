
import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { repurposeContent } from '@/services/aiService';
import { toast } from 'sonner';

interface ContentRecommendation {
  id: string;
  title: string;
  content: string;
  reason: string;
  suggestedFormat: string;
  priority: 'high' | 'medium' | 'low';
  originalContentId: string;
}

interface ContentRecommendationsProps {
  onRepurpose?: (contentId: string, format: string) => void;
}

const ContentRecommendations = ({ onRepurpose }: ContentRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  const generateRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch user's content
      const { data: contentData, error } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!contentData || contentData.length === 0) {
        setRecommendations([]);
        return;
      }

      // Generate AI-powered recommendations
      const mockRecommendations: ContentRecommendation[] = contentData.slice(0, 5).map((content, index) => {
        const formats = ['twitter', 'linkedin', 'instagram', 'blog'];
        const reasons = [
          'This content performed well previously',
          'Trending topic in your niche',
          'Perfect for current season',
          'High engagement potential',
          'Great for your audience'
        ];
        
        return {
          id: `rec-${content.id}-${index}`,
          title: content.title,
          content: content.original_content.substring(0, 200) + '...',
          reason: reasons[index % reasons.length],
          suggestedFormat: formats[index % formats.length],
          priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
          originalContentId: content.id,
        };
      });

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRepurpose = async (recommendation: ContentRecommendation) => {
    if (onRepurpose) {
      onRepurpose(recommendation.originalContentId, recommendation.suggestedFormat);
    } else {
      // Navigate to repurpose page with pre-filled data
      window.location.href = `/repurpose?contentId=${recommendation.originalContentId}&format=${recommendation.suggestedFormat}`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <TrendingUp className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <Star className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="card-modern animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Lightbulb className="w-6 h-6 mr-3 text-yellow-500" />
          AI Content Recommendations
        </CardTitle>
        <CardDescription className="text-lg">
          Smart suggestions for your next content repurposing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No recommendations yet</p>
            <p className="text-sm">Upload more content to get AI-powered suggestions!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 bg-white/50 rounded-xl border border-gray-200/50 hover:bg-white/70 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getPriorityColor(rec.priority)}`}>
                        {getPriorityIcon(rec.priority)}
                        <span className="capitalize">{rec.priority}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💡 {rec.reason}</span>
                      <span>📱 Suggested: {rec.suggestedFormat}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRepurpose(rec)}
                    className="btn-primary-modern text-sm px-4 py-2"
                  >
                    Repurpose Now
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4">
              <Button
                onClick={generateRecommendations}
                variant="outline"
                className="text-sm"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Refresh Recommendations
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentRecommendations;
