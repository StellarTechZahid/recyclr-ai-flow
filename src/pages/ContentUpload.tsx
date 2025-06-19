
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, FileText, Link as LinkIcon, PenTool } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ContentUpload = () => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text' | 'url'>('text');
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      let finalContent = content;
      let fileUrl = null;

      // Handle file upload
      if (uploadMethod === 'file' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('content-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        fileUrl = uploadData.path;

        // For text files, read content
        if (file.type.startsWith('text/')) {
          finalContent = await file.text();
        } else {
          finalContent = `File uploaded: ${file.name}`;
        }
      }

      // Calculate word count
      const wordCount = finalContent.split(/\s+/).filter(word => word.length > 0).length;

      // Save to database
      const { error } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          title,
          content_type: contentType,
          original_content: finalContent,
          source_type: uploadMethod === 'file' ? 'upload' : uploadMethod === 'url' ? 'url' : 'manual',
          source_url: uploadMethod === 'url' ? url : null,
          file_url: fileUrl,
          word_count: wordCount,
        });

      if (error) throw error;

      toast.success('Content uploaded successfully!');
      
      // Reset form
      setTitle("");
      setContent("");
      setContentType("");
      setUrl("");
      setFile(null);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload content');
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-bold">Upload Content</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Content</CardTitle>
            <CardDescription>
              Upload your content to start repurposing it across different platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Upload Method Selection */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card 
                className={`cursor-pointer transition-all ${uploadMethod === 'text' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setUploadMethod('text')}
              >
                <CardContent className="p-4 text-center">
                  <PenTool className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">Write Text</h3>
                  <p className="text-sm text-gray-600">Type or paste your content</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${uploadMethod === 'file' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setUploadMethod('file')}
              >
                <CardContent className="p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">Upload File</h3>
                  <p className="text-sm text-gray-600">PDF, DOC, TXT files</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${uploadMethod === 'url' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setUploadMethod('url')}
              >
                <CardContent className="p-4 text-center">
                  <LinkIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">From URL</h3>
                  <p className="text-sm text-gray-600">Import from web link</p>
                </CardContent>
              </Card>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter content title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog_post">Blog Post</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="social_post">Social Media Post</SelectItem>
                      <SelectItem value="video_script">Video Script</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {uploadMethod === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste or type your content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    required
                  />
                </div>
              )}

              {uploadMethod === 'file' && (
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    required
                  />
                  {file && (
                    <p className="text-sm text-gray-600">Selected: {file.name}</p>
                  )}
                </div>
              )}

              {uploadMethod === 'url' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content Preview</Label>
                    <Textarea
                      id="content"
                      placeholder="Content will be extracted from URL..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      required
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Uploading..." : "Upload Content"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentUpload;
