import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Target,
  Loader2,
  Calendar as CalendarIcon,
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  FileText,
  Rocket,
  Plus,
  Check,
  BarChart3
} from "lucide-react";

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'tiktok', name: 'TikTok', icon: FileText },
];

const goals = [
  "Brand Awareness",
  "Lead Generation",
  "Sales & Conversions",
  "Community Building",
  "Product Launch",
  "Event Promotion",
  "Customer Retention",
  "Thought Leadership"
];

const SmartCampaign = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [generatedCampaign, setGeneratedCampaign] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    description: "",
    platforms: [] as string[],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    budget: "",
    targetAudience: ""
  });

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const togglePlatform = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const generateCampaign = async () => {
    if (!user) {
      toast.error("Please sign in to generate a campaign");
      return;
    }

    if (!formData.name || !formData.goal || formData.platforms.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-smart-campaign', {
        body: {
          name: formData.name,
          goal: formData.goal,
          description: formData.description,
          platforms: formData.platforms,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          budget: formData.budget,
          targetAudience: formData.targetAudience
        }
      });

      if (error) throw error;

      setGeneratedCampaign(data.campaign);
      toast.success("Campaign generated successfully!");

    } catch (error: any) {
      console.error('Error generating campaign:', error);
      toast.error(error.message || "Failed to generate campaign");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCampaign = async () => {
    if (!generatedCampaign || !user) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          goal: formData.goal,
          target_platforms: formData.platforms,
          content_pieces: generatedCampaign.contentPieces,
          schedule: generatedCampaign.schedule,
          status: 'draft',
          start_date: formData.startDate.toISOString(),
          end_date: formData.endDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCampaigns(prev => [data, ...prev]);
      setGeneratedCampaign(null);
      setFormData({
        name: "",
        goal: "",
        description: "",
        platforms: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: "",
        targetAudience: ""
      });
      toast.success("Campaign saved!");

    } catch (error: any) {
      toast.error("Failed to save campaign");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-emerald-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Smart Campaign Generator</h1>
                <p className="text-sm text-gray-600">AI-powered multi-platform campaigns</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Campaign Form */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-emerald-200 shadow-xl">
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
                <CardDescription>Fill in the details and let AI generate your complete campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Campaign Name *</Label>
                    <Input
                      placeholder="e.g., Summer Product Launch"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Goal *</Label>
                    <Select value={formData.goal} onValueChange={(v) => setFormData(prev => ({ ...prev, goal: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map((goal) => (
                          <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Campaign Description</Label>
                  <Textarea
                    placeholder="Describe your campaign, key messages, and any specific requirements..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Platforms */}
                <div className="space-y-2">
                  <Label>Target Platforms *</Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {platforms.map((platform) => (
                      <div
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                          formData.platforms.includes(platform.id)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <platform.icon className={`w-6 h-6 mx-auto mb-1 ${
                          formData.platforms.includes(platform.id) ? 'text-emerald-600' : 'text-gray-400'
                        }`} />
                        <p className="text-xs font-medium">{platform.name}</p>
                        {formData.platforms.includes(platform.id) && (
                          <Check className="w-4 h-4 mx-auto mt-1 text-emerald-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {format(formData.startDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {format(formData.endDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budget (Optional)</Label>
                    <Input
                      placeholder="e.g., $5,000"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Input
                      placeholder="e.g., Tech professionals 25-45"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={generateCampaign} 
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Campaign...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Campaign
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Campaign Preview */}
            {generatedCampaign && (
              <Card className="border-emerald-500 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-emerald-600" />
                      Generated Campaign
                    </CardTitle>
                    <Button onClick={saveCampaign} className="bg-emerald-600 hover:bg-emerald-700">
                      Save Campaign
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Content Pieces */}
                  <div>
                    <h4 className="font-semibold mb-3">Content Schedule ({generatedCampaign.contentPieces?.length || 0} pieces)</h4>
                    <div className="space-y-3">
                      {generatedCampaign.contentPieces?.slice(0, 5).map((piece: any, idx: number) => (
                        <div key={idx} className="p-4 bg-emerald-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge>{piece.platform}</Badge>
                            <span className="text-xs text-gray-500">{piece.scheduledFor}</span>
                          </div>
                          <p className="text-sm text-gray-700">{piece.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Recent Campaigns */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Your Campaigns
            </h3>
            
            {campaigns.length === 0 ? (
              <Card className="border-dashed border-2 border-emerald-200">
                <CardContent className="py-8 text-center">
                  <Target className="w-12 h-12 mx-auto text-emerald-300 mb-3" />
                  <p className="text-gray-500">No campaigns yet</p>
                  <p className="text-sm text-gray-400">Generate your first campaign above</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                          <p className="text-sm text-gray-500">{campaign.goal}</p>
                        </div>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {campaign.target_platforms?.map((p: string) => (
                          <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                        ))}
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

export default SmartCampaign;
