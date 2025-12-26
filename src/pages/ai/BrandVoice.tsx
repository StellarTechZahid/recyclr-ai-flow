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
  Sparkles,
  Plus,
  Save,
  Trash2,
  Loader2,
  Check,
  Edit3,
  Star,
  Volume2
} from "lucide-react";

interface BrandVoiceProfile {
  id: string;
  name: string;
  description: string;
  tone: string[];
  vocabulary: any;
  sample_content: string[];
  is_active: boolean;
}

const toneOptions = [
  "Professional", "Casual", "Friendly", "Authoritative", "Playful",
  "Inspirational", "Educational", "Witty", "Empathetic", "Bold"
];

const BrandVoice = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<BrandVoiceProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  
  // New profile form
  const [newProfile, setNewProfile] = useState({
    name: "",
    description: "",
    tone: [] as string[],
    sampleContent: ""
  });

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_voice_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      toast.error("Failed to load brand voice profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneToggle = (tone: string) => {
    setNewProfile(prev => ({
      ...prev,
      tone: prev.tone.includes(tone) 
        ? prev.tone.filter(t => t !== tone)
        : [...prev.tone, tone]
    }));
  };

  const trainBrandVoice = async () => {
    if (!user) {
      toast.error("Please sign in to create a brand voice");
      return;
    }

    if (!newProfile.name || newProfile.tone.length === 0) {
      toast.error("Please provide a name and select at least one tone");
      return;
    }

    setIsTraining(true);

    try {
      // Call AI to analyze and extract brand voice patterns
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-brand-voice', {
        body: {
          name: newProfile.name,
          description: newProfile.description,
          tones: newProfile.tone,
          sampleContent: newProfile.sampleContent
        }
      });

      if (aiError) throw aiError;

      // Save the profile
      const { data, error } = await supabase
        .from('brand_voice_profiles')
        .insert({
          user_id: user.id,
          name: newProfile.name,
          description: newProfile.description,
          tone: newProfile.tone,
          vocabulary: aiData?.vocabulary || {},
          sample_content: newProfile.sampleContent ? [newProfile.sampleContent] : [],
          is_active: profiles.length === 0
        })
        .select()
        .single();

      if (error) throw error;

      setProfiles(prev => [data, ...prev]);
      setNewProfile({ name: "", description: "", tone: [], sampleContent: "" });
      setIsCreating(false);
      toast.success("Brand voice profile created!");

    } catch (error: any) {
      console.error('Error training brand voice:', error);
      toast.error(error.message || "Failed to train brand voice");
    } finally {
      setIsTraining(false);
    }
  };

  const setActiveProfile = async (profileId: string) => {
    try {
      // Deactivate all profiles first
      await supabase
        .from('brand_voice_profiles')
        .update({ is_active: false })
        .eq('user_id', user?.id);

      // Activate selected profile
      await supabase
        .from('brand_voice_profiles')
        .update({ is_active: true })
        .eq('id', profileId);

      setProfiles(prev => prev.map(p => ({
        ...p,
        is_active: p.id === profileId
      })));

      toast.success("Active brand voice updated!");
    } catch (error: any) {
      toast.error("Failed to update active profile");
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('brand_voice_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => prev.filter(p => p.id !== profileId));
      toast.success("Profile deleted");
    } catch (error: any) {
      toast.error("Failed to delete profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-pink-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/ai">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Brand Voice Trainer</h1>
                  <p className="text-sm text-gray-600">Train AI to match your unique style</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-pink-600 to-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              New Voice Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Create New Profile */}
        {isCreating && (
          <Card className="mb-8 border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle>Create Brand Voice Profile</CardTitle>
              <CardDescription>Train AI to write in your unique brand voice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Profile Name *</Label>
                  <Input
                    placeholder="e.g., Corporate Blog, Social Media"
                    value={newProfile.name}
                    onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Brief description of this voice"
                    value={newProfile.description}
                    onChange={(e) => setNewProfile(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tone & Style *</Label>
                <p className="text-sm text-gray-500 mb-3">Select the tones that best describe your brand voice</p>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((tone) => (
                    <Badge
                      key={tone}
                      variant={newProfile.tone.includes(tone) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        newProfile.tone.includes(tone) 
                          ? 'bg-pink-600 hover:bg-pink-700' 
                          : 'hover:bg-pink-100'
                      }`}
                      onClick={() => handleToneToggle(tone)}
                    >
                      {newProfile.tone.includes(tone) && <Check className="w-3 h-3 mr-1" />}
                      {tone}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sample Content</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Paste examples of your writing style (the more the better!)
                </p>
                <Textarea
                  placeholder="Paste blog posts, social media posts, or any content that represents your brand voice..."
                  rows={6}
                  value={newProfile.sampleContent}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, sampleContent: e.target.value }))}
                />
                {newProfile.sampleContent && (
                  <p className="text-xs text-gray-500">{newProfile.sampleContent.split(/\s+/).length} words</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={trainBrandVoice} disabled={isTraining} className="bg-gradient-to-r from-pink-600 to-rose-600">
                  {isTraining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Training AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Train Brand Voice
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profiles List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Brand Voices</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-pink-600" />
              <p className="mt-2 text-gray-600">Loading profiles...</p>
            </div>
          ) : profiles.length === 0 ? (
            <Card className="text-center py-12 border-dashed border-2 border-pink-200">
              <Sparkles className="w-16 h-16 mx-auto text-pink-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No brand voice profiles yet</h3>
              <p className="text-gray-600 mb-6">Create your first brand voice to start generating on-brand content</p>
              <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-pink-600 to-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Voice
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {profiles.map((profile) => (
                <Card key={profile.id} className={`transition-all ${profile.is_active ? 'border-pink-500 shadow-lg ring-2 ring-pink-200' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {profile.name}
                          {profile.is_active && (
                            <Badge className="bg-pink-600">
                              <Star className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{profile.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Tones</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.tone.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!profile.is_active && (
                        <Button size="sm" onClick={() => setActiveProfile(profile.id)} className="bg-pink-600 hover:bg-pink-700">
                          <Check className="w-3 h-3 mr-1" />
                          Set Active
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Volume2 className="w-3 h-3 mr-1" />
                        Test Voice
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteProfile(profile.id)}>
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
    </div>
  );
};

export default BrandVoice;
