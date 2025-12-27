import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  MessageCircle,
  Loader2,
  Copy,
  RefreshCw,
  ThumbsUp,
  Heart,
  Sparkles
} from "lucide-react";

const toneOptions = [
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "professional", label: "Professional", emoji: "💼" },
  { value: "casual", label: "Casual", emoji: "👋" },
  { value: "enthusiastic", label: "Enthusiastic", emoji: "🎉" },
  { value: "grateful", label: "Grateful", emoji: "🙏" },
  { value: "witty", label: "Witty", emoji: "😄" }
];

const AutoReply = () => {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("friendly");
  const [isGenerating, setIsGenerating] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);

  const generateReplies = async () => {
    if (!user) {
      toast.error("Please sign in to generate replies");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment to reply to");
      return;
    }

    setIsGenerating(true);
    setReplies([]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-auto-reply', {
        body: { 
          comment: comment,
          context: context,
          tone: tone,
          count: 3
        }
      });

      if (error) throw error;
      
      setReplies(data.replies || [data.reply] || ["Great point! Thanks for sharing."]);
      toast.success("Replies generated!");
    } catch (error: any) {
      console.error('Auto-reply error:', error);
      toast.error(error.message || "Failed to generate replies");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyReply = (reply: string) => {
    navigator.clipboard.writeText(reply);
    toast.success("Copied to clipboard!");
  };

  const sampleComments = [
    "This is so helpful! Can you share more tips?",
    "I disagree with this approach. What about XYZ?",
    "Amazing content as always! 🔥",
    "How long did it take you to learn this?",
    "Can you make a tutorial on this topic?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-blue-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Auto Reply System</h1>
                <p className="text-sm text-gray-600">Generate contextual responses with Kimi K2</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Comment to Reply
              </CardTitle>
              <CardDescription>Paste the comment you want to respond to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Paste the comment here..."
                  rows={4}
                />
                <div className="flex flex-wrap gap-2">
                  {sampleComments.slice(0, 3).map((sample, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className="cursor-pointer hover:bg-blue-100 text-xs"
                      onClick={() => setComment(sample)}
                    >
                      Sample {i + 1}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Context (Optional)</label>
                <Input
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., This was on my productivity tips video"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Reply Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span>{option.emoji}</span>
                          <span>{option.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={generateReplies}
                disabled={!comment.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Replies
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Generated Replies
              </CardTitle>
              <CardDescription>Choose the best response for your audience</CardDescription>
            </CardHeader>
            <CardContent>
              {replies.length > 0 ? (
                <div className="space-y-4">
                  {replies.map((reply, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-gray-800 flex-1">{reply}</p>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyReply(reply)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          Option {index + 1}
                        </span>
                        <span>{reply.length} chars</span>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={generateReplies}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate More
                  </Button>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-200" />
                  <p className="text-lg font-medium">No replies yet</p>
                  <p className="text-sm">Enter a comment and generate replies</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutoReply;
