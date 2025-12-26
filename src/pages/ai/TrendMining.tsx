import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  TrendingUp,
  Search,
  Loader2,
  Hash,
  Zap,
  Clock,
  BarChart3,
  Sparkles,
  Copy,
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface Trend {
  id: string;
  name: string;
  description: string;
  platform: string;
  type: string;
  relevanceScore: number;
  hashtags: string[];
  suggestedContent: string[];
}

const platforms = [
  { id: 'all', name: 'All Platforms' },
  { id: 'twitter', name: 'Twitter/X' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'youtube', name: 'YouTube' }
];

const TrendMining = () => {
  const { user } = useAuth();
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

  const searchTrends = async () => {
    if (!user) {
      toast.error("Please sign in to search trends");
      return;
    }

    if (!niche.trim()) {
      toast.error("Please enter a niche or topic");
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-trend-mining', {
        body: { 
          niche: niche.trim(), 
          platform: platform === 'all' ? null : platform 
        }
      });

      if (error) throw error;

      setTrends(data.trends || []);
      
      if (data.trends?.length === 0) {
        toast.info("No trends found. Try a different niche or platform.");
      } else {
        toast.success(`Found ${data.trends.length} trends!`);
      }

    } catch (error: any) {
      console.error('Error searching trends:', error);
      toast.error(error.message || "Failed to search trends");
    } finally {
      setIsSearching(false);
    }
  };

  const copyHashtags = (hashtags: string[]) => {
    navigator.clipboard.writeText(hashtags.join(' '));
    toast.success("Hashtags copied to clipboard!");
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Content idea copied!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-orange-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Trend Mining</h1>
                <p className="text-sm text-gray-600">Discover viral trends & hashtags</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Section */}
        <Card className="mb-8 border-orange-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-600" />
              Search Trends
            </CardTitle>
            <CardDescription>Enter your niche to discover trending topics and hashtags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter your niche (e.g., fitness, tech, cooking)"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && searchTrends()}
                />
              </div>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={searchTrends} 
                disabled={isSearching}
                className="bg-gradient-to-r from-orange-600 to-amber-600"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Trends
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {trends.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Trends List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Trending Now ({trends.length})
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {trends.map((trend) => (
                  <Card 
                    key={trend.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTrend?.id === trend.id ? 'ring-2 ring-orange-500' : ''
                    }`}
                    onClick={() => setSelectedTrend(trend)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{trend.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {trend.platform}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{trend.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">{trend.relevanceScore}% relevant</span>
                        </div>
                        <div className="flex gap-1">
                          {trend.hashtags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {trend.hashtags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{trend.hashtags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trend Details */}
            <div className="space-y-4">
              {selectedTrend ? (
                <>
                  <Card className="border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{selectedTrend.name}</CardTitle>
                      <CardDescription>{selectedTrend.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Hashtags */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Related Hashtags</h4>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyHashtags(selectedTrend.hashtags)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy All
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedTrend.hashtags.map((tag) => (
                            <Badge key={tag} className="bg-orange-100 text-orange-800 cursor-pointer hover:bg-orange-200">
                              <Hash className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Content Ideas */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Content Ideas</h4>
                        <div className="space-y-2">
                          {selectedTrend.suggestedContent.map((content, idx) => (
                            <div key={idx} className="p-3 bg-orange-50 rounded-lg text-sm">
                              <p className="text-gray-700 mb-2">{content}</p>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-orange-600"
                                onClick={() => copyContent(content)}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content for This Trend
                  </Button>
                </>
              ) : (
                <Card className="border-dashed border-2 border-orange-200">
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto text-orange-300 mb-4" />
                    <p className="text-gray-500">Select a trend to see details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && trends.length === 0 && (
          <Card className="text-center py-16 border-dashed border-2 border-orange-200">
            <TrendingUp className="w-20 h-20 mx-auto text-orange-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Discover What's Trending</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Enter your niche above to uncover viral trends, hashtags, and content ideas that will boost your engagement
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Fitness', 'Technology', 'Food', 'Travel', 'Fashion'].map((suggestion) => (
                <Badge 
                  key={suggestion}
                  variant="outline" 
                  className="cursor-pointer hover:bg-orange-100"
                  onClick={() => setNiche(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrendMining;
