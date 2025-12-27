import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Accessibility as AccessibilityIcon,
  Loader2,
  Copy,
  Image,
  Video,
  FileText,
  CheckCircle
} from "lucide-react";

interface AccessibilityResult {
  altText?: string;
  captions?: string[];
  transcription?: string;
  readabilityScore?: number;
  suggestions?: string[];
}

const Accessibility = () => {
  const { user } = useAuth();
  const [contentType, setContentType] = useState<'image' | 'video' | 'text'>('image');
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AccessibilityResult | null>(null);

  const processContent = async () => {
    if (!user) {
      toast.error("Please sign in to process content");
      return;
    }

    if (contentType === 'image' && !imageUrl.trim()) {
      toast.error("Please provide an image URL or description");
      return;
    }

    if ((contentType === 'video' || contentType === 'text') && !content.trim()) {
      toast.error("Please provide content to process");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-accessibility', {
        body: { 
          contentType,
          content: contentType === 'image' ? imageUrl : content,
          includeHashtags
        }
      });

      if (error) throw error;
      
      setResult(data);
      toast.success("Accessibility content generated!");
    } catch (error: any) {
      console.error('Accessibility error:', error);
      toast.error(error.message || "Failed to process content");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center">
                <AccessibilityIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Accessibility Optimizer</h1>
                <p className="text-sm text-gray-600">Generate alt text and captions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-purple-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AccessibilityIcon className="w-5 h-5 text-purple-600" />
                Content Input
              </CardTitle>
              <CardDescription>Select content type and provide details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Type Selection */}
              <div className="flex gap-2">
                <Button
                  variant={contentType === 'image' ? 'default' : 'outline'}
                  className={contentType === 'image' ? 'bg-purple-600' : ''}
                  onClick={() => setContentType('image')}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Image
                </Button>
                <Button
                  variant={contentType === 'video' ? 'default' : 'outline'}
                  className={contentType === 'video' ? 'bg-purple-600' : ''}
                  onClick={() => setContentType('video')}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
                <Button
                  variant={contentType === 'text' ? 'default' : 'outline'}
                  className={contentType === 'text' ? 'bg-purple-600' : ''}
                  onClick={() => setContentType('text')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Text
                </Button>
              </div>

              {/* Content Input Based on Type */}
              {contentType === 'image' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL or Description</label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL or describe the image..."
                  />
                  <p className="text-xs text-gray-500">
                    Describe what's in the image for AI to generate alt text
                  </p>
                </div>
              )}

              {contentType === 'video' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video Transcription</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste the video transcription or description..."
                    rows={6}
                  />
                </div>
              )}

              {contentType === 'text' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content to Optimize</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste content to check readability and accessibility..."
                    rows={6}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="hashtags"
                  checked={includeHashtags}
                  onCheckedChange={setIncludeHashtags}
                />
                <Label htmlFor="hashtags">Include accessibility hashtags</Label>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600"
                onClick={processContent}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <AccessibilityIcon className="w-4 h-4 mr-2" />
                    Generate Accessibility Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="border-purple-200 shadow-xl">
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>Accessibility-optimized output</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* Alt Text */}
                  {result.altText && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Image className="w-4 h-4 text-purple-600" />
                          Alt Text
                        </label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(result.altText!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <p className="text-gray-800">{result.altText}</p>
                      </div>
                    </div>
                  )}

                  {/* Captions */}
                  {result.captions && result.captions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-600" />
                        Captions
                      </label>
                      <div className="p-4 bg-purple-50 rounded-xl space-y-2">
                        {result.captions.map((caption, i) => (
                          <p key={i} className="text-gray-800">{caption}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Readability Score */}
                  {result.readabilityScore !== undefined && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Readability Score</label>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-purple-600">
                          {result.readabilityScore}/100
                        </div>
                        <Badge className={
                          result.readabilityScore >= 70 ? 'bg-green-500' :
                          result.readabilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }>
                          {result.readabilityScore >= 70 ? 'Good' :
                           result.readabilityScore >= 50 ? 'Fair' : 'Needs Work'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Suggestions</label>
                      <div className="space-y-2">
                        {result.suggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-sm text-gray-700">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <AccessibilityIcon className="w-16 h-16 mx-auto mb-4 text-purple-200" />
                  <p className="text-lg font-medium">No content generated yet</p>
                  <p className="text-sm">Select content type and process to generate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
