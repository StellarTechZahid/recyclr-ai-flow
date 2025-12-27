import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  DollarSign,
  Loader2,
  TrendingUp,
  Target,
  ShoppingBag,
  Video,
  BookOpen,
  Sparkles
} from "lucide-react";

interface MonetizationOpportunity {
  type: string;
  title: string;
  description: string;
  potentialRevenue: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  steps: string[];
}

const ContentMonetizer = () => {
  const { user } = useAuth();
  const [contentDescription, setContentDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [niche, setNiche] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [opportunities, setOpportunities] = useState<MonetizationOpportunity[]>([]);

  const analyzeMonetization = async () => {
    if (!user) {
      toast.error("Please sign in to analyze monetization");
      return;
    }

    if (!contentDescription.trim()) {
      toast.error("Please describe your content");
      return;
    }

    setIsAnalyzing(true);
    setOpportunities([]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-monetizer', {
        body: { 
          contentDescription,
          audience,
          niche
        }
      });

      if (error) throw error;
      
      setOpportunities(data.opportunities || []);
      toast.success("Monetization opportunities identified!");
    } catch (error: any) {
      console.error('Monetization error:', error);
      toast.error(error.message || "Failed to analyze monetization");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sponsorship': return <ShoppingBag className="w-5 h-5" />;
      case 'course': return <BookOpen className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'affiliate': return <Target className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-green-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Content Monetizer</h1>
                <p className="text-sm text-gray-600">Discover revenue opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-green-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Your Content
              </CardTitle>
              <CardDescription>Describe your content to find monetization opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Description *</label>
                <Textarea
                  value={contentDescription}
                  onChange={(e) => setContentDescription(e.target.value)}
                  placeholder="Describe your content, topics you cover, and what makes it unique..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Audience</label>
                <Input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g., entrepreneurs, developers, fitness enthusiasts"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Niche</label>
                <Input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., tech, health, finance"
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                onClick={analyzeMonetization}
                disabled={!contentDescription.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Find Opportunities
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Monetization Opportunities</h2>
            
            {opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opp, index) => (
                  <Card key={index} className="border-green-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-green-600">
                          {getTypeIcon(opp.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-lg">{opp.title}</h3>
                              <Badge variant="outline" className="mt-1">{opp.type}</Badge>
                            </div>
                            <Badge className={getDifficultyColor(opp.difficulty)}>
                              {opp.difficulty}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{opp.description}</p>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">{opp.potentialRevenue}</span>
                          </div>

                          {opp.steps && opp.steps.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-700">Quick Start:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {opp.steps.slice(0, 3).map((step, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-green-200">
                <CardContent className="py-16 text-center text-gray-500">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-200" />
                  <p className="text-lg font-medium">No opportunities yet</p>
                  <p className="text-sm">Describe your content to discover monetization paths</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentMonetizer;
