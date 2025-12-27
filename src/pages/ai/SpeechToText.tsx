import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mic,
  Upload,
  Loader2,
  Copy,
  Download,
  FileAudio,
  Square,
  Play,
  Pause,
  X
} from "lucide-react";

const SpeechToText = () => {
  const { user } = useAuth();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error("Audio file must be less than 25MB");
        return;
      }
      setAudioFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
        toast.success("Recording saved!");
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (!user) {
      toast.error("Please sign in to transcribe");
      return;
    }

    if (!audioFile) {
      toast.error("Please select or record audio first");
      return;
    }

    setIsTranscribing(true);
    setProgress(0);
    setTranscription("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setProgress(30);
        const base64 = (reader.result as string).split(',')[1];
        
        setProgress(50);
        const { data, error } = await supabase.functions.invoke('ai-speech-to-text', {
          body: { 
            audio: base64,
            filename: audioFile.name
          }
        });

        setProgress(90);
        if (error) throw error;
        
        setTranscription(data.transcription || data.text || "Transcription complete");
        setProgress(100);
        toast.success("Audio transcribed successfully!");
      };
      reader.readAsDataURL(audioFile);
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast.error(error.message || "Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    toast.success("Copied to clipboard!");
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-green-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Speech to Text</h1>
                <p className="text-sm text-gray-600">Transcribe audio with Whisper Large v3</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-green-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-green-600" />
                Audio Input
              </CardTitle>
              <CardDescription>Upload an audio file or record directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-10 h-10 mx-auto text-green-400 mb-3" />
                <p className="font-medium text-gray-700">Upload audio file</p>
                <p className="text-sm text-gray-500">MP3, WAV, M4A up to 25MB</p>
              </div>

              {/* Recording Controls */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Or record directly</p>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="w-40"
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Record
                    </>
                  )}
                </Button>
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-600">Recording...</span>
                  </div>
                )}
              </div>

              {/* Selected File */}
              {audioFile && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{audioFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setAudioFile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Progress */}
              {isTranscribing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-gray-600">
                    Transcribing... {progress}%
                  </p>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                onClick={transcribeAudio}
                disabled={!audioFile || isTranscribing}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Transcribe Audio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="border-green-200 shadow-xl">
            <CardHeader>
              <CardTitle>Transcription</CardTitle>
              <CardDescription>Your audio converted to text</CardDescription>
            </CardHeader>
            <CardContent>
              {transcription ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 min-h-[300px] max-h-[400px] overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{transcription}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" onClick={downloadTranscript}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {transcription.split(/\s+/).length} words
                  </p>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Mic className="w-16 h-16 mx-auto mb-4 text-green-200" />
                  <p className="text-lg font-medium">No transcription yet</p>
                  <p className="text-sm">Upload or record audio to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
