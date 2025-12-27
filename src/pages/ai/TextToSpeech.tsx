import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Volume2,
  Play,
  Pause,
  Download,
  Loader2,
  Sparkles,
  Settings
} from "lucide-react";

const voices = [
  { id: "alloy", name: "Alloy", desc: "Neutral and balanced" },
  { id: "echo", name: "Echo", desc: "Warm and engaging" },
  { id: "fable", name: "Fable", desc: "British and expressive" },
  { id: "onyx", name: "Onyx", desc: "Deep and authoritative" },
  { id: "nova", name: "Nova", desc: "Friendly and upbeat" },
  { id: "shimmer", name: "Shimmer", desc: "Clear and professional" }
];

const TextToSpeech = () => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const [speed, setSpeed] = useState([1.0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateSpeech = async () => {
    if (!user) {
      toast.error("Please sign in to generate speech");
      return;
    }

    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    if (text.length > 4096) {
      toast.error("Text must be less than 4096 characters");
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-text-to-speech', {
        body: { 
          text: text,
          voice: selectedVoice,
          speed: speed[0]
        }
      });

      if (error) throw error;
      
      if (data.audioContent) {
        const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        toast.success("Audio generated successfully!");
      }
    } catch (error: any) {
      console.error('TTS error:', error);
      toast.error(error.message || "Failed to generate speech");
    } finally {
      setIsGenerating(false);
    }
  };

  const base64ToBlob = (base64: string, type: string): Blob => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'generated-speech.mp3';
      a.click();
    }
  };

  const sampleTexts = [
    "Welcome to our podcast! Today we're diving deep into the future of AI.",
    "Breaking news: Scientists have made a groundbreaking discovery.",
    "Hey everyone! Thanks for joining today's livestream.",
    "In today's video, I'll show you 5 tips to boost your productivity."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Text to Speech</h1>
                <p className="text-sm text-gray-600">Convert text to natural-sounding audio</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-purple-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Text Input
              </CardTitle>
              <CardDescription>Enter the text you want to convert to speech</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your text here..."
                  rows={8}
                  className="resize-none"
                  maxLength={4096}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{text.length} / 4096 characters</span>
                  <span>{text.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {sampleTexts.map((sample, i) => (
                  <Badge 
                    key={i}
                    variant="outline" 
                    className="cursor-pointer hover:bg-purple-100 text-xs"
                    onClick={() => setText(sample)}
                  >
                    Sample {i + 1}
                  </Badge>
                ))}
              </div>

              {/* Voice Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Voice Settings
                </label>
                
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-xs text-gray-500">{voice.desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Speed</span>
                    <span>{speed[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={generateSpeech}
                disabled={!text.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Generate Speech
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-purple-200 shadow-xl">
            <CardHeader>
              <CardTitle>Audio Output</CardTitle>
              <CardDescription>Listen to and download your generated audio</CardDescription>
            </CardHeader>
            <CardContent>
              {audioUrl ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-8 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <Volume2 className="w-12 h-12 text-white" />
                    </div>
                    
                    <audio 
                      ref={audioRef} 
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    
                    <div className="flex justify-center gap-4">
                      <Button
                        size="lg"
                        onClick={togglePlayback}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-5 h-5 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={downloadAudio}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>Voice: {voices.find(v => v.id === selectedVoice)?.name}</p>
                    <p>Speed: {speed[0].toFixed(1)}x</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Volume2 className="w-16 h-16 mx-auto mb-4 text-purple-200" />
                  <p className="text-lg font-medium">No audio generated yet</p>
                  <p className="text-sm">Enter text and click generate to create audio</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
