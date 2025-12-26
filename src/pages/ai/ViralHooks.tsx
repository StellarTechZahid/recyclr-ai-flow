import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Zap,
  Loader2,
  Sparkles,
  Copy,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

const hookTypes = [
  { id: 'question', name: 'Question Hook', desc: 'Start with an intriguing question' },
  { id: 'statistic', name: 'Statistic Hook', desc: 'Lead with a surprising stat' },
  { id: 'story', name: 'Story Hook', desc: 'Begin with a mini story' },
  { id: 'controversy', name: 'Controversy Hook', desc: 'Challenge common beliefs' },
  { id: 'curiosity', name: 'Curiosity Gap', desc: 'Create an information gap' },
  { id: 'bold', name: 'Bold Statement', desc: 'Make a strong claim' },
];

const platforms = [
  'Twitter/X', 'LinkedIn', 'Instagram', 'TikTok', 'YouTube', 'Blog'
];

interface GeneratedHook {
  text: string;
  type: string;
  score: number;
}

const ViralHooks = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("");
  const [hookType, setHookType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hooks, setHooks] = useState<GeneratedHook[]>([]);
  const [savedHooks, setSavedHooks] = useState<string[]>([]);

  const generateHooks = async () => {
    if (!user) {
      toast.error("Please sign in to generate hooks");
      return;
    }

    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-viral-hooks', {
        body: {
          topic: topic.trim(),
          platform: platform || null,
          hookType: hookType || null,
          count: 5
        }
      });

      if (error) throw error;

      setHooks(data.hooks || []);
      toast.success(`Generated ${data.hooks?.length || 0} viral hooks!`);

    } catch (error: any) {
      console.error('Error generating hooks:', error);
      toast.error(error.message || "Failed to generate hooks");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyHook = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Hook copied to clipboard!");
  };

  const saveHook = async (hookText: string) => {
    if (!user) return;

    try {
      await supabase
        .from('ai_generated_content')
        .insert({
          user_id: user.id,
          content_type: 'viral_hook',
          original_input: topic,
          generated_output: hookText,
          platform: platform || null,
          is_saved: true
        });

      setSavedHooks(prev => [...prev, hookText]);
      toast.success("Hook saved!");
    } catch (error) {
      toast.error("Failed to save hook");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-yellow-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Viral Hook Generator</h1>
                <p className="text-sm text-gray-600">Create scroll-stopping opening lines</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Generator Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-yellow-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  Generate Hooks
                </CardTitle>
                <CardDescription>Tell us about your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Topic / Content *</Label>
                  <Textarea
                    placeholder="What's your content about? e.g., '5 productivity tips for remote workers'"
                    rows={4}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Platform (Optional)</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hook Type (Optional)</Label>
                  <Select value={hookType} onValueChange={setHookType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      {hookTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-xs text-gray-500">{type.desc}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateHooks} 
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Viral Hooks
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Hook Types Guide */}
            <Card className="border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hook Types Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hookTypes.map((type) => (
                  <div key={type.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-yellow-50 cursor-pointer" onClick={() => setHookType(type.id)}>
                    <Zap className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{type.name}</p>
                      <p className="text-xs text-gray-500">{type.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Generated Hooks */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Generated Hooks</h2>
              {hooks.length > 0 && (
                <Button variant="outline" size="sm" onClick={generateHooks}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              )}
            </div>

            {hooks.length === 0 ? (
              <Card className="border-dashed border-2 border-yellow-200">
                <CardContent className="py-16 text-center">
                  <Zap className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hooks yet</h3>
                  <p className="text-gray-600">Enter your topic and generate viral hooks</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {hooks.map((hook, idx) => (
                  <Card key={idx} className={`transition-all hover:shadow-lg ${savedHooks.includes(hook.text) ? 'border-green-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-lg font-medium text-gray-900 mb-3">
                            "{hook.text}"
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{hook.type}</Badge>
                            <span className={`text-sm font-medium ${getScoreColor(hook.score)}`}>
                              <Star className="w-3 h-3 inline mr-1" />
                              {hook.score}% viral potential
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyHook(hook.text)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {!savedHooks.includes(hook.text) && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-yellow-600"
                              onClick={() => saveHook(hook.text)}
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViralHooks;
