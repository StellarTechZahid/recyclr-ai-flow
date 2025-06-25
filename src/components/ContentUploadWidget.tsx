
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentUploadWidgetProps {
  onContentUploaded?: () => void;
}

const ContentUploadWidget = ({ onContentUploaded }: ContentUploadWidgetProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleUpload = async () => {
    if (!user) {
      toast.error('Please login to upload content');
      return;
    }

    if (!title.trim() || !content.trim() || !contentType) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    try {
      const { error } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          title: title.trim(),
          original_content: content.trim(),
          content_type: contentType,
          source_type: 'manual', // Add the required source_type field
        });

      if (error) throw error;

      toast.success('Content uploaded successfully!');
      setTitle('');
      setContent('');
      setContentType('');
      
      if (onContentUploaded) {
        onContentUploaded();
      }
    } catch (error: any) {
      console.error('Error uploading content:', error);
      toast.error('Failed to upload content');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="card-modern shadow-modern-lg border-purple-200/50">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl brand-gradient-text">
          <Upload className="w-6 h-6 mr-3" />
          Quick Upload Content
        </CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Add content to start repurposing across platforms with AI-powered optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="content-title" className="text-base font-semibold text-gray-700">
            Content Title
          </Label>
          <Input
            id="content-title"
            placeholder="Enter a compelling title for your content..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-modern text-lg py-4"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="content-type" className="text-base font-semibold text-gray-700">
            Content Type
          </Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="input-modern text-lg py-4">
              <SelectValue placeholder="Select the type of content you're uploading" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border border-gray-200/50">
              <SelectItem value="blog_post" className="text-lg py-3">📝 Blog Post</SelectItem>
              <SelectItem value="article" className="text-lg py-3">📰 Article</SelectItem>
              <SelectItem value="social_media" className="text-lg py-3">📱 Social Media Post</SelectItem>
              <SelectItem value="video_script" className="text-lg py-3">🎥 Video Script</SelectItem>
              <SelectItem value="newsletter" className="text-lg py-3">📧 Newsletter</SelectItem>
              <SelectItem value="presentation" className="text-lg py-3">📊 Presentation</SelectItem>
              <SelectItem value="other" className="text-lg py-3">📄 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="content-text" className="text-base font-semibold text-gray-700">
            Content
          </Label>
          <Textarea
            id="content-text"
            placeholder="Paste or type your content here. The more detailed, the better AI can repurpose it..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="input-modern text-lg resize-none leading-relaxed"
          />
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-500">
              {content.length} characters
            </div>
            <div className="flex items-center space-x-2">
              {content.length > 100 && (
                <span className="status-success">Good length ✓</span>
              )}
              {content.length > 500 && (
                <span className="status-success">Excellent for repurposing ✓</span>
              )}
            </div>
          </div>
        </div>

        <Button 
          onClick={handleUpload} 
          className="w-full btn-primary-modern text-lg py-4 shadow-modern-lg transform hover:-translate-y-1 transition-all duration-200" 
          disabled={!title.trim() || !content.trim() || !contentType || isUploading}
        >
          {isUploading ? (
            <>
              <FileText className="w-5 h-5 mr-3 animate-pulse" />
              Uploading Your Content...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-3" />
              Upload & Start Repurposing
            </>
          )}
        </Button>
        
        {!isUploading && (
          <div className="text-center text-sm text-gray-500">
            Your content will be processed instantly and ready for AI repurposing
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentUploadWidget;
