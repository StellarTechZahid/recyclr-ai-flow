
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Quick Upload Content
        </CardTitle>
        <CardDescription>
          Add content to start repurposing across platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content-title">Title</Label>
          <Input
            id="content-title"
            placeholder="Enter content title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content-type">Content Type</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blog_post">Blog Post</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="social_media">Social Media Post</SelectItem>
              <SelectItem value="video_script">Video Script</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="presentation">Presentation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content-text">Content</Label>
          <Textarea
            id="content-text"
            placeholder="Paste or type your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <div className="text-xs text-gray-500 text-right">
            {content.length} characters
          </div>
        </div>

        <Button 
          onClick={handleUpload} 
          className="w-full" 
          disabled={!title.trim() || !content.trim() || !contentType || isUploading}
        >
          {isUploading ? (
            <>
              <FileText className="w-4 h-4 mr-2 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContentUploadWidget;
