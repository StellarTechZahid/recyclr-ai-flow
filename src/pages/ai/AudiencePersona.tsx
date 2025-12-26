import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Loader2,
  Plus,
  Sparkles,
  User,
  Target,
  Heart,
  Star,
  Trash2,
  Edit3
} from "lucide-react";

interface Persona {
  id: string;
  name: string;
  description: string;
  demographics: any;
  interests: string[];
  pain_points: string[];
  preferred_platforms: string[];
  content_preferences: any;
  is_primary: boolean;
}

const AudiencePersona = () => {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ageRange: "",
    gender: "",
    location: "",
    occupation: "",
    interests: "",
    painPoints: "",
    platforms: ""
  });

  useEffect(() => {
    if (user) {
      loadPersonas();
    }
  }, [user]);

  const loadPersonas = async () => {
    try {
      const { data, error } = await supabase
        .from('audience_personas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPersonas(data || []);
    } catch (error) {
      console.error('Error loading personas:', error);
      toast.error("Failed to load personas");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersona = async () => {
    if (!user) {
      toast.error("Please sign in to create a persona");
      return;
    }

    if (!formData.name || !formData.description) {
      toast.error("Please provide a name and description");
      return;
    }

    setIsGenerating(true);

    try {
      // Call AI to enhance persona details
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-audience-persona', {
        body: {
          name: formData.name,
          description: formData.description,
          demographics: {
            ageRange: formData.ageRange,
            gender: formData.gender,
            location: formData.location,
            occupation: formData.occupation
          },
          interests: formData.interests,
          painPoints: formData.painPoints,
          platforms: formData.platforms
        }
      });

      if (aiError) throw aiError;

      // Save the persona
      const { data, error } = await supabase
        .from('audience_personas')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          demographics: aiData?.demographics || {},
          interests: aiData?.interests || [],
          pain_points: aiData?.painPoints || [],
          preferred_platforms: aiData?.platforms || [],
          content_preferences: aiData?.contentPreferences || {},
          is_primary: personas.length === 0
        })
        .select()
        .single();

      if (error) throw error;

      setPersonas(prev => [data, ...prev]);
      setFormData({
        name: "",
        description: "",
        ageRange: "",
        gender: "",
        location: "",
        occupation: "",
        interests: "",
        painPoints: "",
        platforms: ""
      });
      setIsCreating(false);
      toast.success("Audience persona created!");

    } catch (error: any) {
      console.error('Error generating persona:', error);
      toast.error(error.message || "Failed to create persona");
    } finally {
      setIsGenerating(false);
    }
  };

  const setPrimaryPersona = async (personaId: string) => {
    try {
      await supabase
        .from('audience_personas')
        .update({ is_primary: false })
        .eq('user_id', user?.id);

      await supabase
        .from('audience_personas')
        .update({ is_primary: true })
        .eq('id', personaId);

      setPersonas(prev => prev.map(p => ({
        ...p,
        is_primary: p.id === personaId
      })));

      toast.success("Primary persona updated!");
    } catch (error) {
      toast.error("Failed to update persona");
    }
  };

  const deletePersona = async (personaId: string) => {
    try {
      const { error } = await supabase
        .from('audience_personas')
        .delete()
        .eq('id', personaId);

      if (error) throw error;

      setPersonas(prev => prev.filter(p => p.id !== personaId));
      toast.success("Persona deleted");
    } catch (error) {
      toast.error("Failed to delete persona");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-violet-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/ai">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Audience Persona Builder</h1>
                  <p className="text-sm text-gray-600">Create detailed audience personas for targeted content</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-violet-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              New Persona
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 border-violet-200 shadow-xl">
            <CardHeader>
              <CardTitle>Create Audience Persona</CardTitle>
              <CardDescription>AI will enhance your persona with detailed insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Persona Name *</Label>
                  <Input
                    placeholder="e.g., Tech-Savvy Millennial"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Input
                    placeholder="e.g., 25-35"
                    value={formData.ageRange}
                    onChange={(e) => setFormData(prev => ({ ...prev, ageRange: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe your ideal audience member in detail..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input
                    placeholder="e.g., All, Female, Male"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., US, Urban areas"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input
                    placeholder="e.g., Marketing professionals"
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Interests (comma separated)</Label>
                <Input
                  placeholder="e.g., Technology, Fitness, Travel"
                  value={formData.interests}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Pain Points (comma separated)</Label>
                <Input
                  placeholder="e.g., Time management, Work-life balance"
                  value={formData.painPoints}
                  onChange={(e) => setFormData(prev => ({ ...prev, painPoints: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Platforms (comma separated)</Label>
                <Input
                  placeholder="e.g., Instagram, LinkedIn, TikTok"
                  value={formData.platforms}
                  onChange={(e) => setFormData(prev => ({ ...prev, platforms: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={generatePersona} 
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Persona with AI
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personas Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Audience Personas</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
            <p className="mt-2 text-gray-600">Loading personas...</p>
          </div>
        ) : personas.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-2 border-violet-200">
            <Users className="w-16 h-16 mx-auto text-violet-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No personas yet</h3>
            <p className="text-gray-600 mb-6">Create your first audience persona to start targeting your content</p>
            <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-violet-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Persona
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <Card key={persona.id} className={`transition-all ${persona.is_primary ? 'border-violet-500 ring-2 ring-violet-200' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {persona.name}
                          {persona.is_primary && (
                            <Badge className="bg-violet-600">Primary</Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{persona.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Demographics */}
                  {persona.demographics && Object.keys(persona.demographics).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Demographics</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(persona.demographics).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {value as string}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {persona.interests?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> Interests
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {persona.interests.slice(0, 4).map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                        ))}
                        {persona.interests.length > 4 && (
                          <Badge variant="secondary" className="text-xs">+{persona.interests.length - 4}</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Platforms */}
                  {persona.preferred_platforms?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Platforms
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {persona.preferred_platforms.map((platform) => (
                          <Badge key={platform} className="bg-violet-100 text-violet-700 text-xs">{platform}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {!persona.is_primary && (
                      <Button size="sm" onClick={() => setPrimaryPersona(persona.id)} className="bg-violet-600 hover:bg-violet-700">
                        <Star className="w-3 h-3 mr-1" />
                        Set Primary
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => deletePersona(persona.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudiencePersona;
