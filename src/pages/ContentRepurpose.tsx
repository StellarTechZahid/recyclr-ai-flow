
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Wand2, Copy, Download, Share, FileText, Calendar } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { repurposeContent, platforms, tones } from "@/services/aiService";
import ContentUploadWidget from "@/components/ContentUploadWidget";

interface ContentItem {
  id: string;
  title: string;
  original_content: string;
  content_type: string;
}

const ContentRepurpose = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const contentId = searchParams.get('contentId');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [availableContent, setAvailableContent] = useState<ContentItem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || "");
  const [selectedTone, setSelectedTone] = useState(searchParams.get('tone') || "professional");
  const [repurposedContent, setRepurposedContent] = useState(searchParams.get('repurposed') || "");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { user } = useAuth();

  // Save state to URL parameters
  const updateUrlParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('contentRepurposeState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.repurposedContent && !repurposedContent) {
          setRepurposedContent(parsed.repurposedContent);
        }
        if (parsed.suggestions) {
          setSuggestions(parsed.suggestions);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      repurposedContent,
      suggestions,
      selectedPlatform,
      selectedTone,
    };
    localStorage.setItem('contentRepurposeState', JSON.stringify(stateToSave));
  }, [repurposedContent, suggestions, selectedPlatform, selectedTone]);

  useEffect(() => {
    fetchUserContent();
  }, [user]);

  useEffect(() => {
    if (contentId && availableContent.length > 0) {
      const content = availableContent.find(c => c.id === contentId);
      if (content) {
        setSelectedContent(content);
      }
    }
  }, [contentId, availableContent]);

  // Update URL when platform changes
  useEffect(() => {
    updateUrlParams({ platform: selectedPlatform });
  }, [selectedPlatform]);

  // Update URL when tone changes
  useEffect(() => {
    updateUrlParams({ tone: selectedTone });
  }, [selectedTone]);

  const fetchUserContent = async () => {
    if (!user) return;

    try {
      console.log('Fetching user content...');
      const { data, error } = await supabase
        .from('content')
        .select('id, title, original_content, content_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content:', error);
        throw error;
      }
      
      console.log('Fetched content:', data);
      setAvailableContent(data || []);
    } catch (error: any) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    }
  };

  const handleRepurpose = async () => {
    if (!selectedContent || !selectedPlatform) {
      toast.error('Please select content and platform');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting repurpose with Mistral-7B model...');
      
      const result = await repurposeContent({
        content: selectedContent.original_content,
        platform: selectedPlatform,
        contentType: selectedContent.content_type,
        tone: selectedTone,
      });

      console.log('Repurpose result:', result);
      
      if (!result.repurposedContent) {
        throw new Error('No repurposed content received from AI');
      }
      
      setRepurposedContent(result.repurposedContent);
      setSuggestions(result.suggestions || []);
      
      // Update URL with repurposed content
      updateUrlParams({ repurposed: result.repurposedContent });
      
      // Save to database
      const platform = platforms.find(p => p.id === selectedPlatform);
      await saveRepurposedContent(result.repurposedContent, platform?.name || selectedPlatform);
      
      toast.success(`Content repurposed successfully using ${result.model || 'Mistral-7B'}!`);
    } catch (error: any) {
      console.error('Repurpose error:', error);
      toast.error(`Failed to repurpose content: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRepurposedContent = async (content: string, platformName: string) => {
    if (!user || !selectedContent) return;

    try {
      const { error } = await supabase
        .from('repurposed_content')
        .insert({
          user_id: user.id,
          original_content_id: selectedContent.id,
          platform: selectedPlatform,
          content_text: content,
          metadata: {
            tone: selectedTone,
            platform_name: platformName,
          },
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving repurposed content:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(repurposedContent);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadContent = () => {
    if (!repurposedContent) {
      toast.error('No content to download');
      return;
    }

    const selectedPlatformInfo = platforms.find(p => p.id === selectedPlatform);
    const filename = `${selectedContent?.title || 'content'}-${selectedPlatformInfo?.name || selectedPlatform}.txt`;
    
    const element = document.createElement('a');
    const file = new Blob([repurposedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Content downloaded successfully!');
  };

  const shareContent = async () => {
    if (!repurposedContent) {
      toast.error('No content to share');
      return;
    }

    const selectedPlatformInfo = platforms.find(p => p.id === selectedPlatform);
    const shareData = {
      title: `Repurposed content for ${selectedPlatformInfo?.name || selectedPlatform}`,
      text: repurposedContent,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Content shared successfully!');
      } else {
        await navigator.clipboard.writeText(repurposedContent);
        toast.success('Content copied to clipboard for sharing!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(repurposedContent);
        toast.success('Content copied to clipboard!');
      } catch (clipboardError) {
        toast.error('Failed to share content');
      }
    }
  };

  const scheduleRepurposedContent = () => {
    const params = new URLSearchParams({
      content: repurposedContent,
      platform: selectedPlatform
    });
    navigate(`/schedule?${params.toString()}`);
  };

  const selectedPlatformInfo = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">AI Content Repurposing</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {availableContent.length === 0 && (
              <ContentUploadWidget onContentUploaded={fetchUserContent} />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Select Content to Repurpose</CardTitle>
                <CardDescription>
                  {availableContent.length === 0 
                    ? "Upload content above to get started" 
                    : "Choose from your uploaded content"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableContent.length > 0 ? (
                  <>
                    <Select 
                      value={selectedContent?.id || ""} 
                      onValueChange={(value) => {
                        const content = availableContent.find(c => c.id === value);
                        setSelectedContent(content || null);
                        updateUrlParams({ contentId: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select content to repurpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableContent.map((content) => (
                          <SelectItem key={content.id} value={content.id}>
                            {content.title} ({content.content_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedContent && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Original Content Preview:</h4>
                        <div className="p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto text-sm">
                          {selectedContent.original_content.substring(0, 500)}
                          {selectedContent.original_content.length > 500 && '...'}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No content available</p>
                    <p className="text-sm">Upload your first piece of content above to start repurposing!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repurposing Settings</CardTitle>
                <CardDescription>Choose your target platform and style</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Platform</label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          <div>
                            <div className="font-medium">{platform.name}</div>
                            <div className="text-xs text-gray-500">{platform.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlatformInfo && (
                    <p className="text-xs text-gray-500">
                      Max length: {selectedPlatformInfo.maxLength} characters
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((tone) => (
                        <SelectItem key={tone.id} value={tone.id}>
                          <div>
                            <div className="font-medium">{tone.name}</div>
                            <div className="text-xs text-gray-500">{tone.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleRepurpose} 
                  className="w-full" 
                  disabled={!selectedContent || !selectedPlatform || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                      Repurposing with Mistral-7B...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Repurpose Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Repurposed Content</CardTitle>
                <CardDescription>AI-generated content using Mistral-7B model</CardDescription>
              </CardHeader>
              <CardContent>
                {repurposedContent ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={repurposedContent}
                        onChange={(e) => {
                          setRepurposedContent(e.target.value);
                          updateUrlParams({ repurposed: e.target.value });
                        }}
                        rows={12}
                        className="resize-none"
                        placeholder="Repurposed content will appear here..."
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                        {repurposedContent.length}
                        {selectedPlatformInfo && `/${selectedPlatformInfo.maxLength}`} characters
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadContent}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={shareContent}>
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="default" size="sm" onClick={scheduleRepurposedContent}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Post
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select content and platform, then click "Repurpose Content" to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Suggestions</CardTitle>
                  <CardDescription>Tips to improve your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentRepurpose;
