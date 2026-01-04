
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center text-lg sm:text-xl md:text-2xl brand-gradient-text">
          <Upload className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
          Quick Upload Content
        </CardTitle>
        <CardDescription className="text-sm sm:text-base md:text-lg text-gray-600">
          Add content to start repurposing across platforms with AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="content-title" className="text-sm sm:text-base font-semibold text-gray-700">
            Content Title
          </Label>
          <Input
            id="content-title"
            placeholder="Enter a compelling title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-modern text-sm sm:text-base md:text-lg py-2.5 sm:py-3 md:py-4"
          />
        </div>

        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="content-type" className="text-sm sm:text-base font-semibold text-gray-700">
            Content Type
          </Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="input-modern text-sm sm:text-base md:text-lg py-2.5 sm:py-3 md:py-4">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border border-gray-200/50">
              <SelectItem value="blog_post" className="text-sm sm:text-base md:text-lg py-2 sm:py-3">📝 Blog Post</SelectItem>
              <SelectItem value="article" className="text-sm sm:text-base md:text-lg py-2 sm:py-3">📰 Article</SelectItem>
              <SelectItem value="social_media" className="text-sm sm:text-base md:text-lg py-2 sm:py-3">📱 Social Media</SelectItem>
              <SelectItem value="video_script" className="text-sm sm:text-base md:text-lg py-2 sm:py-3">🎥 Video Script</SelectItem>
              <SelectItem value="newsletter" className="text-sm sm:text-base md:text-lg py-2 sm:py-3">📧 Newsletter</SelectItem>
              <SelectItem value="presentation" className="text-sm sm:text-base md:text-lg py-2 sm:py-3">📊 Presentation</SelectItem>
              <SelectItem value="other" className="text-sm sm:text-base md:text-lg py-2 sm:py-3">📄 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="content-text" className="text-sm sm:text-base font-semibold text-gray-700">
            Content
          </Label>
          <Textarea
            id="content-text"
            placeholder="Paste or type your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="input-modern text-sm sm:text-base md:text-lg resize-none leading-relaxed"
          />
          <div className="flex flex-wrap justify-between items-center gap-2 text-xs sm:text-sm">
            <div className="text-gray-500">
              {content.length} characters
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {content.length > 100 && (
                <span className="status-success text-xs">Good ✓</span>
              )}
              {content.length > 500 && (
                <span className="status-success text-xs hidden xs:inline">Ready for AI ✓</span>
              )}
            </div>
          </div>
        </div>

        <Button 
          onClick={handleUpload} 
          className="w-full btn-primary-modern text-sm sm:text-base md:text-lg py-3 sm:py-4 shadow-modern-lg transform hover:-translate-y-1 transition-all duration-200" 
          disabled={!title.trim() || !content.trim() || !contentType || isUploading}
        >
          {isUploading ? (
            <>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-pulse" />
              <span className="hidden xs:inline">Uploading Your Content...</span>
              <span className="xs:hidden">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              <span className="hidden xs:inline">Upload & Start Repurposing</span>
              <span className="xs:hidden">Upload Content</span>
            </>
          )}
        </Button>
        
        {!isUploading && (
          <div className="text-center text-xs sm:text-sm text-gray-500">
            Your content will be processed instantly
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentUploadWidget;
