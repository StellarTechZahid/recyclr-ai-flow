import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload,
  Image,
  FileText,
  Mic,
  Video,
  X,
  Check,
  Loader2,
  Sparkles,
  Eye,
  Volume2,
  FileImage,
  File,
} from "lucide-react";

interface MultimodalUploadProps {
  onContentProcessed?: (content: string, type: string, metadata?: any) => void;
  allowedTypes?: ('image' | 'audio' | 'video' | 'document' | 'text')[];
  maxFileSize?: number; // in MB
}

const MultimodalUpload = ({ 
  onContentProcessed, 
  allowedTypes = ['image', 'audio', 'video', 'document', 'text'],
  maxFileSize = 20
}: MultimodalUploadProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [processedResults, setProcessedResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const getFileTypeIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-600" />;
    if (type.startsWith('audio/')) return <Mic className="w-5 h-5 text-green-600" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-600" />;
    if (type.includes('pdf')) return <File className="w-5 h-5 text-red-600" />;
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxFileSize}MB limit`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioFile = new window.File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setFiles(prev => [...prev, audioFile]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      toast.error("Failed to start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording saved!");
    }
  };

  const processFiles = async () => {
    if (!user) {
      toast.error("Please sign in to process content");
      return;
    }

    if (files.length === 0 && !textContent.trim()) {
      toast.error("Please add files or text content");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    const results: any[] = [];

    try {
      // Process text content first
      if (textContent.trim()) {
        setProcessingStatus("Processing text content...");
        setProcessingProgress(10);
        results.push({
          type: 'text',
          content: textContent,
          processed: true
        });
        onContentProcessed?.(textContent, 'text');
      }

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = 20 + (i / files.length) * 70;
        setProcessingProgress(progress);
        setProcessingStatus(`Processing ${file.name}...`);

        try {
          if (file.type.startsWith('image/')) {
            // Process image with AI Vision
            const base64 = await fileToBase64(file);
            const { data, error } = await supabase.functions.invoke('ai-vision', {
              body: { image: base64, prompt: "Analyze this image and extract all text and describe the visual content." }
            });
            
            if (error) throw error;
            
            results.push({
              type: 'image',
              filename: file.name,
              content: data.analysis,
              processed: true
            });
            onContentProcessed?.(data.analysis, 'image', { filename: file.name });

          } else if (file.type.startsWith('audio/')) {
            // Process audio with Speech-to-Text
            const base64 = await fileToBase64(file);
            const { data, error } = await supabase.functions.invoke('ai-speech-to-text', {
              body: { audio: base64, filename: file.name }
            });
            
            if (error) throw error;
            
            results.push({
              type: 'audio',
              filename: file.name,
              content: data.transcription,
              processed: true
            });
            onContentProcessed?.(data.transcription, 'audio', { filename: file.name });

          } else if (file.type.startsWith('video/')) {
            // For video, extract audio and transcribe
            setProcessingStatus(`Extracting audio from ${file.name}...`);
            // Note: Video processing would need additional handling
            results.push({
              type: 'video',
              filename: file.name,
              content: "Video processing requires additional setup",
              processed: false
            });

          } else {
            // Document files - read as text if possible
            const text = await file.text();
            results.push({
              type: 'document',
              filename: file.name,
              content: text,
              processed: true
            });
            onContentProcessed?.(text, 'document', { filename: file.name });
          }
        } catch (fileError: any) {
          console.error(`Error processing ${file.name}:`, fileError);
          results.push({
            type: file.type.split('/')[0],
            filename: file.name,
            error: fileError.message,
            processed: false
          });
        }
      }

      setProcessingProgress(100);
      setProcessedResults(results);
      toast.success(`Processed ${results.filter(r => r.processed).length} items successfully!`);
      
    } catch (error: any) {
      console.error('Processing error:', error);
      toast.error(error.message || "Failed to process content");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const clearAll = () => {
    setFiles([]);
    setTextContent("");
    setProcessedResults([]);
    setProcessingProgress(0);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-purple-200/50 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              Multimodal Content Intake
            </CardTitle>
            <CardDescription>Upload images, audio, video, documents, or paste text</CardDescription>
          </div>
          {(files.length > 0 || textContent) && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-purple-50/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.md"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 mx-auto text-purple-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">Drop files here or click to upload</p>
          <p className="text-sm text-gray-500 mt-2">
            Supports images, audio, video, PDFs, and documents (max {maxFileSize}MB each)
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline"><Image className="w-3 h-3 mr-1" /> Images</Badge>
            <Badge variant="outline"><Mic className="w-3 h-3 mr-1" /> Audio</Badge>
            <Badge variant="outline"><Video className="w-3 h-3 mr-1" /> Video</Badge>
            <Badge variant="outline"><FileText className="w-3 h-3 mr-1" /> Docs</Badge>
          </div>
        </div>

        {/* Voice Recording */}
        {allowedTypes.includes('audio') && (
          <div className="flex items-center justify-center">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              className="flex items-center gap-2"
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
              {isRecording ? 'Stop Recording' : 'Record Audio'}
            </Button>
          </div>
        )}

        {/* Text Input */}
        {allowedTypes.includes('text') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or paste text content
            </label>
            <Textarea
              placeholder="Paste your blog post, article, script, or any text content here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={4}
              className="bg-white/80"
            />
            {textContent && (
              <p className="text-xs text-gray-500 mt-1">{textContent.split(/\s+/).length} words</p>
            )}
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Uploaded Files ({files.length})</p>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileTypeIcon(file)}
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{processingStatus}</span>
              <span className="font-medium">{Math.round(processingProgress)}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>
        )}

        {/* Processed Results */}
        {processedResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Processed Results</p>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {processedResults.map((result, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${result.processed ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2">
                    {result.processed ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                    <span className="text-sm">{result.filename || result.type}</span>
                  </div>
                  <Badge variant={result.processed ? "default" : "destructive"}>
                    {result.processed ? 'Processed' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Button */}
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-black text-white"
          onClick={processFiles}
          disabled={isProcessing || (files.length === 0 && !textContent.trim())}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Process with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MultimodalUpload;
