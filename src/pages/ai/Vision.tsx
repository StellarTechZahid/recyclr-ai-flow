import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  Upload,
  Image,
  Loader2,
  Copy,
  Sparkles,
  FileImage,
  X,
  Check
} from "lucide-react";

const Vision = () => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [prompt, setPrompt] = useState("Analyze this image and describe what you see in detail.");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!user) {
      toast.error("Please sign in to analyze images");
      return;
    }

    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('ai-vision', {
          body: { 
            image: base64,
            prompt: prompt
          }
        });

        if (error) throw error;
        
        setAnalysis(data.analysis || data.description || "Analysis complete");
        toast.success("Image analyzed successfully!");
      };
      reader.readAsDataURL(selectedImage);
    } catch (error: any) {
      console.error('Vision error:', error);
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysis);
    toast.success("Copied to clipboard!");
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setAnalysis("");
  };

  const promptSuggestions = [
    "Analyze this image and describe what you see in detail.",
    "Extract all text visible in this image.",
    "Describe the main subjects and their actions.",
    "What emotions or mood does this image convey?",
    "Suggest social media captions for this image."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-blue-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Vision</h1>
                <p className="text-sm text-gray-600">Extract insights from images with Llama 4 Scout</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-blue-600" />
                Upload Image
              </CardTitle>
              <CardDescription>Select an image to analyze with AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 mx-auto text-blue-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700">Click to upload an image</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full rounded-xl shadow-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Analysis Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What would you like to know about this image?"
                  rows={3}
                />
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((suggestion, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => setPrompt(suggestion)}
                    >
                      {suggestion.substring(0, 30)}...
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                onClick={analyzeImage}
                disabled={!selectedImage || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Analyze Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Analysis Results
              </CardTitle>
              <CardDescription>AI-generated insights from your image</CardDescription>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 min-h-[300px]">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{analysis}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" className="text-green-600">
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-blue-200" />
                  <p className="text-lg font-medium">No analysis yet</p>
                  <p className="text-sm">Upload an image and click analyze to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Vision;
