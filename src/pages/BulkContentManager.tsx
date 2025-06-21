
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, Download, Trash2, Eye, Send, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { platforms } from "@/services/aiService";
import type { Tables } from "@/integrations/supabase/types";

type Content = Tables<'content'>;
type RepurposedContent = Tables<'repurposed_content'>;

const BulkContentManager = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContents, setSelectedContents] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState<RepurposedContent[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchContents();
  }, [user]);

  const fetchContents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error: any) {
      console.error('Error fetching contents:', error);
      toast.error('Failed to load content');
    }
  };

  const handleContentSelection = (contentId: string, checked: boolean) => {
    if (checked) {
      setSelectedContents(prev => [...prev, contentId]);
    } else {
      setSelectedContents(prev => prev.filter(id => id !== contentId));
    }
  };

  const handlePlatformSelection = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms(prev => [...prev, platform]);
    } else {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    }
  };

  const handleBulkRepurpose = async () => {
    if (selectedContents.length === 0 || selectedPlatforms.length === 0) {
      toast.error('Please select content and platforms');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setBulkResults([]);

    const totalOperations = selectedContents.length * selectedPlatforms.length;
    let completedOperations = 0;

    try {
      for (const contentId of selectedContents) {
        const content = contents.find(c => c.id === contentId);
        if (!content) continue;

        for (const platform of selectedPlatforms) {
          try {
            const response = await fetch('/api/repurpose-content', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: content.original_content,
                platform,
                contentType: content.content_type
              }),
            });

            if (response.ok) {
              const result = await response.json();
              
              // Save to database
              const { data: savedContent, error } = await supabase
                .from('repurposed_content')
                .insert({
                  user_id: user.id,
                  original_content_id: contentId,
                  platform,
                  content_text: result.repurposedContent,
                  status: 'draft'
                })
                .select()
                .single();

              if (error) throw error;
              setBulkResults(prev => [...prev, savedContent]);
            }
          } catch (error) {
            console.error(`Error repurposing ${content.title} for ${platform}:`, error);
          }

          completedOperations++;
          setProcessingProgress((completedOperations / totalOperations) * 100);
        }
      }

      toast.success(`Bulk repurposing completed! Generated ${completedOperations} pieces of content.`);
    } catch (error: any) {
      console.error('Bulk repurpose error:', error);
      toast.error('Some items failed to process');
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResults = () => {
    const csvContent = [
      ['Title', 'Platform', 'Content', 'Status', 'Created At'],
      ...bulkResults.map(result => [
        contents.find(c => c.id === result.original_content_id)?.title || 'Unknown',
        result.platform,
        `"${result.content_text.replace(/"/g, '""')}"`,
        result.status,
        format(new Date(result.created_at), 'yyyy-MM-dd HH:mm:ss')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-repurposed-content-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Bulk Content Manager</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Repurpose Settings</CardTitle>
                <CardDescription>Select content and platforms for bulk processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Select Platforms</h3>
                  <div className="space-y-2">
                    {platforms.map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.id}
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={(checked) => 
                            handlePlatformSelection(platform.id, checked as boolean)
                          }
                        />
                        <label htmlFor={platform.id} className="text-sm font-medium">
                          {platform.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">
                      Selected: {selectedContents.length} content(s), {selectedPlatforms.length} platform(s)
                    </span>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Processing...</span>
                        <span>{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="w-full" />
                    </div>
                  )}

                  <Button 
                    onClick={handleBulkRepurpose}
                    disabled={isProcessing || selectedContents.length === 0 || selectedPlatforms.length === 0}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Start Bulk Repurpose
                      </>
                    )}
                  </Button>

                  {bulkResults.length > 0 && (
                    <Button
                      onClick={exportResults}
                      variant="outline"
                      className="w-full mt-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Content for Bulk Processing</CardTitle>
                <CardDescription>Choose the content items you want to repurpose</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contents.map((content) => (
                    <div key={content.id} className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedContents.includes(content.id)}
                          onCheckedChange={(checked) => 
                            handleContentSelection(content.id, checked as boolean)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium truncate">{content.title}</h4>
                            <Badge variant="secondary">{content.content_type}</Badge>
                            {content.word_count && (
                              <Badge variant="outline">{content.word_count} words</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {content.original_content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Created: {format(new Date(content.created_at), 'MMM d, yyyy')}</span>
                            <span>Source: {content.source_type}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {contents.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No content available. Upload some content first!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {bulkResults.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Bulk Processing Results</CardTitle>
                  <CardDescription>
                    Generated {bulkResults.length} pieces of repurposed content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bulkResults.slice(0, 5).map((result) => (
                      <div key={result.id} className="p-3 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            {platforms.find(p => p.id === result.platform)?.name}
                          </Badge>
                          <Badge variant="outline">{result.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {result.content_text}
                        </p>
                      </div>
                    ))}
                    {bulkResults.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        And {bulkResults.length - 5} more results...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkContentManager;
