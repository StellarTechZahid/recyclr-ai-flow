import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Brain,
  Loader2,
  Copy,
  Sparkles,
  Lightbulb,
  Target,
  Zap
} from "lucide-react";

const reasoningModes = [
  { id: "strategy", label: "Content Strategy", icon: Target, desc: "Long-term planning" },
  { id: "analysis", label: "Deep Analysis", icon: Brain, desc: "Comprehensive insights" },
  { id: "creative", label: "Creative Ideation", icon: Lightbulb, desc: "Generate new ideas" },
  { id: "optimization", label: "Optimization", icon: Zap, desc: "Improve existing content" }
];

const Reasoning = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("strategy");
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState("");

  const runReasoning = async () => {
    if (!user) {
      toast.error("Please sign in to use AI reasoning");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsThinking(true);
    setResponse("");

    try {
      const systemPrompts: Record<string, string> = {
        strategy: "You are a strategic content planning expert. Analyze the request and provide comprehensive, actionable strategies with clear steps and timelines.",
        analysis: "You are an analytical expert. Provide deep, thorough analysis with multiple perspectives, data-driven insights, and detailed recommendations.",
        creative: "You are a creative content ideation specialist. Generate innovative, unique ideas that stand out and resonate with audiences.",
        optimization: "You are a content optimization expert. Analyze and provide specific improvements to enhance engagement, reach, and impact."
      };

      const { data, error } = await supabase.functions.invoke('ai-reasoning', {
        body: { 
          prompt,
          systemPrompt: systemPrompts[mode],
          model: "gpt-oss-120b"
        }
      });

      if (error) throw error;
      
      setResponse(data.content || data.response || "Analysis complete");
      toast.success("Analysis complete!");
    } catch (error: any) {
      console.error('Reasoning error:', error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsThinking(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    toast.success("Copied to clipboard!");
  };

  const examplePrompts: Record<string, string[]> = {
    strategy: [
      "Create a 3-month content strategy for a new SaaS product launch",
      "Plan a viral marketing campaign for a fitness app",
      "Develop a content calendar for Q1 with seasonal themes"
    ],
    analysis: [
      "Analyze why short-form video content outperforms long-form in 2024",
      "Deep dive into the factors that make LinkedIn posts go viral",
      "Evaluate the ROI of influencer marketing vs paid ads"
    ],
    creative: [
      "Generate 10 unique content series ideas for a tech YouTube channel",
      "Create hook ideas for a personal finance TikTok account",
      "Brainstorm interactive content formats for audience engagement"
    ],
    optimization: [
      "How can I improve my Twitter engagement rate from 2% to 5%?",
      "Optimize this headline for maximum click-through: 'Our Product is Great'",
      "Suggest improvements for my content repurposing workflow"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-indigo-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Reasoning</h1>
                <p className="text-sm text-gray-600">Deep analysis with GPT OSS 120B</p>
              </div>
            </div>
            <Badge className="bg-indigo-600 ml-4">Advanced AI</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Mode Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {reasoningModes.map((m) => (
            <Card 
              key={m.id}
              className={`cursor-pointer transition-all ${
                mode === m.id 
                  ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setMode(m.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                  mode === m.id ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-sm">{m.label}</h3>
                <p className="text-xs text-gray-500">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-indigo-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Your Prompt
              </CardTitle>
              <CardDescription>Describe what you need help with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your question or request..."
                rows={8}
                className="resize-none"
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Example prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts[mode]?.slice(0, 2).map((example, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className="cursor-pointer hover:bg-indigo-100 text-xs"
                      onClick={() => setPrompt(example)}
                    >
                      {example.substring(0, 40)}...
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                onClick={runReasoning}
                disabled={!prompt.trim() || isThinking}
              >
                {isThinking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking deeply...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-indigo-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Response</CardTitle>
                  <CardDescription>Deep analysis and recommendations</CardDescription>
                </div>
                {response && (
                  <Button variant="ghost" size="sm" onClick={copyResponse}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 min-h-[300px] max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{response}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-indigo-200" />
                  <p className="text-lg font-medium">Ready to think</p>
                  <p className="text-sm">Enter a prompt and run analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reasoning;
