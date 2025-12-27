import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Copy,
  Sparkles,
  Smile,
  Frown,
  Meh,
  Zap
} from "lucide-react";

interface EmotionAnalysis {
  originalScore: number;
  optimizedScore: number;
  emotions: { name: string; score: number }[];
  optimizedContent: string;
  suggestions: string[];
}

const EmotionOptimizer = () => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [targetEmotion, setTargetEmotion] = useState("inspiring");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EmotionAnalysis | null>(null);

  const emotionTargets = [
    { id: "inspiring", label: "Inspiring", emoji: "✨" },
    { id: "exciting", label: "Exciting", emoji: "🔥" },
    { id: "calming", label: "Calming", emoji: "🌿" },
    { id: "motivating", label: "Motivating", emoji: "💪" },
    { id: "empathetic", label: "Empathetic", emoji: "💝" },
    { id: "urgent", label: "Urgent", emoji: "⚡" }
  ];

  const analyzeEmotion = async () => {
    if (!user) {
      toast.error("Please sign in to analyze content");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter content to analyze");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-emotion-optimizer', {
        body: { 
          content: content,
          targetEmotion: targetEmotion
        }
      });

      if (error) throw error;
      
      setResult(data);
      toast.success("Content analyzed and optimized!");
    } catch (error: any) {
      console.error('Emotion analysis error:', error);
      toast.error(error.message || "Failed to analyze content");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getEmotionIcon = (score: number) => {
    if (score >= 70) return <Smile className="w-5 h-5 text-green-500" />;
    if (score >= 40) return <Meh className="w-5 h-5 text-yellow-500" />;
    return <Frown className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-rose-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Emotion Optimizer</h1>
                <p className="text-sm text-gray-600">Optimize content for emotional impact</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-rose-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600" />
                Content Input
              </CardTitle>
              <CardDescription>Enter content to analyze and optimize</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your social media post, email, or any content..."
                rows={8}
              />

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Target Emotion</label>
                <div className="flex flex-wrap gap-2">
                  {emotionTargets.map((emotion) => (
                    <Badge
                      key={emotion.id}
                      variant={targetEmotion === emotion.id ? "default" : "outline"}
                      className={`cursor-pointer ${
                        targetEmotion === emotion.id 
                          ? 'bg-rose-600 hover:bg-rose-700' 
                          : 'hover:bg-rose-100'
                      }`}
                      onClick={() => setTargetEmotion(emotion.id)}
                    >
                      {emotion.emoji} {emotion.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600"
                onClick={analyzeEmotion}
                disabled={!content.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Analyze & Optimize
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="border-rose-200 shadow-xl">
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>Emotional analysis and improved content</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* Score Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-2">Original Score</p>
                      <div className="flex items-center justify-center gap-2">
                        {getEmotionIcon(result.originalScore)}
                        <span className="text-2xl font-bold">{result.originalScore}%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-2">Optimized Score</p>
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5 text-rose-600" />
                        <span className="text-2xl font-bold text-rose-600">{result.optimizedScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Emotion Breakdown */}
                  {result.emotions && result.emotions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Emotion Breakdown</h4>
                      {result.emotions.map((emotion, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{emotion.name}</span>
                            <span>{emotion.score}%</span>
                          </div>
                          <Progress value={emotion.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Optimized Content */}
                  {result.optimizedContent && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Optimized Version</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyContent(result.optimizedContent)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl">
                        <p className="text-gray-800 whitespace-pre-wrap">{result.optimizedContent}</p>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Suggestions</h4>
                      <ul className="space-y-2">
                        {result.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Sparkles className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-rose-200" />
                  <p className="text-lg font-medium">No analysis yet</p>
                  <p className="text-sm">Enter content and analyze to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmotionOptimizer;
