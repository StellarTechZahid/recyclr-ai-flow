import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw
} from "lucide-react";

interface ModerationResult {
  safe: boolean;
  brandSafe: boolean;
  confidence: number;
  issues: string[];
  recommendations: string[];
  category?: string;
}

const ContentModeration = () => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [checkBrandSafety, setCheckBrandSafety] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<ModerationResult | null>(null);

  const moderateContent = async () => {
    if (!user) {
      toast.error("Please sign in to moderate content");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter content to check");
      return;
    }

    setIsChecking(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-moderation', {
        body: { 
          content: content,
          checkBrandSafety: checkBrandSafety
        }
      });

      if (error) throw error;
      
      setResult(data);
      
      if (data.safe && data.brandSafe) {
        toast.success("Content passed all checks!");
      } else if (!data.safe) {
        toast.error("Content flagged for safety issues");
      } else {
        toast.warning("Content may have brand safety concerns");
      }
    } catch (error: any) {
      console.error('Moderation error:', error);
      toast.error(error.message || "Failed to moderate content");
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.safe && result.brandSafe) {
      return <CheckCircle className="w-16 h-16 text-green-500" />;
    } else if (!result.safe) {
      return <XCircle className="w-16 h-16 text-red-500" />;
    }
    return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (!result) return "";
    if (result.safe && result.brandSafe) return "All Clear";
    if (!result.safe) return "Safety Issues Found";
    return "Brand Safety Warning";
  };

  const getStatusColor = () => {
    if (!result) return "bg-gray-100";
    if (result.safe && result.brandSafe) return "bg-green-50";
    if (!result.safe) return "bg-red-50";
    return "bg-yellow-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-red-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Content Moderation</h1>
                <p className="text-sm text-gray-600">AI-powered safety checks with Llama Guard</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-red-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Content to Check
              </CardTitle>
              <CardDescription>Paste your content for safety analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your social media post, blog content, or any text to check for safety issues..."
                rows={10}
                className="resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="brand-safety"
                    checked={checkBrandSafety}
                    onCheckedChange={setCheckBrandSafety}
                  />
                  <Label htmlFor="brand-safety">Include brand safety check</Label>
                </div>
                <p className="text-xs text-gray-500">
                  {content.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-red-600 to-orange-600"
                onClick={moderateContent}
                disabled={!content.trim() || isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Check Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="border-red-200 shadow-xl">
            <CardHeader>
              <CardTitle>Moderation Results</CardTitle>
              <CardDescription>AI safety analysis of your content</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* Status */}
                  <div className={`${getStatusColor()} rounded-xl p-8 text-center`}>
                    <div className="flex justify-center mb-4">
                      {getStatusIcon()}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {getStatusText()}
                    </h3>
                    <p className="text-gray-600">
                      Confidence: {Math.round((result.confidence || 0.95) * 100)}%
                    </p>
                  </div>

                  {/* Scores */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Content Safety</span>
                        <Badge variant={result.safe ? "default" : "destructive"}>
                          {result.safe ? "Pass" : "Fail"}
                        </Badge>
                      </div>
                      <Progress value={result.safe ? 100 : 30} className="h-2" />
                    </div>
                    
                    {checkBrandSafety && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Brand Safety</span>
                          <Badge variant={result.brandSafe ? "default" : "secondary"}>
                            {result.brandSafe ? "Pass" : "Warning"}
                          </Badge>
                        </div>
                        <Progress value={result.brandSafe ? 100 : 60} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Issues */}
                  {result.issues && result.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Issues Found</h4>
                      <div className="space-y-2">
                        {result.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                            <span className="text-sm text-gray-700">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-sm text-gray-700">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setResult(null)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Another
                  </Button>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-red-200" />
                  <p className="text-lg font-medium">No results yet</p>
                  <p className="text-sm">Enter content and click check to analyze</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentModeration;
