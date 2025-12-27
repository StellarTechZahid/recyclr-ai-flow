import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Handshake,
  Loader2,
  Search,
  Users,
  Star,
  TrendingUp,
  Plus,
  ExternalLink
} from "lucide-react";

interface InfluencerMatch {
  name: string;
  platform: string;
  niche: string[];
  followers: number;
  engagementRate: number;
  matchScore: number;
  collaborationIdeas: string[];
}

const InfluencerMatcher = () => {
  const { user } = useAuth();
  const [brandDescription, setBrandDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [niche, setNiche] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<InfluencerMatch[]>([]);
  const [savedMatches, setSavedMatches] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadSavedMatches();
  }, [user]);

  const loadSavedMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('influencer_matches')
        .select('*')
        .order('match_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedMatches(data || []);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const findInfluencers = async () => {
    if (!user) {
      toast.error("Please sign in to find influencers");
      return;
    }

    if (!brandDescription.trim() || !niche.trim()) {
      toast.error("Please provide brand description and niche");
      return;
    }

    setIsSearching(true);
    setMatches([]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-influencer-collab', {
        body: { 
          brandDescription,
          targetAudience,
          niche,
          platform: "all"
        }
      });

      if (error) throw error;
      
      setMatches(data.matches || []);
      toast.success(`Found ${data.matches?.length || 0} potential matches!`);
    } catch (error: any) {
      console.error('Influencer search error:', error);
      toast.error(error.message || "Failed to find influencers");
    } finally {
      setIsSearching(false);
    }
  };

  const saveMatch = async (match: InfluencerMatch) => {
    try {
      const { error } = await supabase
        .from('influencer_matches')
        .insert({
          user_id: user?.id,
          influencer_name: match.name,
          platform: match.platform,
          niche: match.niche,
          follower_count: match.followers,
          engagement_rate: match.engagementRate,
          match_score: match.matchScore,
          collaboration_ideas: match.collaborationIdeas,
          status: 'discovered'
        });

      if (error) throw error;
      toast.success("Influencer saved!");
      loadSavedMatches();
    } catch (error: any) {
      toast.error("Failed to save influencer");
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-cyan-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Handshake className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Influencer Matcher</h1>
                <p className="text-sm text-gray-600">Find perfect collaboration partners</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Section */}
        <Card className="mb-8 border-cyan-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-600" />
              Find Influencers
            </CardTitle>
            <CardDescription>Describe your brand to find matching influencers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Description *</label>
                <Textarea
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  placeholder="Describe your brand, products, and values..."
                  rows={3}
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Niche *</label>
                  <Input
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g., fitness, tech, beauty"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., millennials, entrepreneurs"
                  />
                </div>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
              onClick={findInfluencers}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Matches
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Grid */}
        {matches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Potential Matches</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match, index) => (
                <Card key={index} className="border-cyan-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{match.name}</h3>
                        <Badge variant="outline" className="mt-1">{match.platform}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-cyan-600">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-bold">{match.matchScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Followers</span>
                        <span className="font-medium">{formatFollowers(match.followers)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Engagement</span>
                        <span className="font-medium">{match.engagementRate}%</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {match.niche.slice(0, 3).map((n, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{n}</Badge>
                        ))}
                      </div>

                      <Progress value={match.matchScore} className="h-2" />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => saveMatch(match)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Save Match
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Saved Matches */}
        {savedMatches.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Influencers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedMatches.map((match) => (
                <Card key={match.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{match.influencer_name}</h3>
                        <p className="text-sm text-gray-500">{match.platform}</p>
                      </div>
                      <Badge>{match.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {matches.length === 0 && savedMatches.length === 0 && !isSearching && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-cyan-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600">Describe your brand to find influencer matches</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerMatcher;
