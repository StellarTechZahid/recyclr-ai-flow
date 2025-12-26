import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  Wand2, 
  Mic, 
  Volume2, 
  Eye, 
  Globe, 
  Shield, 
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  Zap,
  Handshake,
  DollarSign,
  Accessibility,
  Target,
  Sparkles,
  ArrowRight,
  Search,
  Star,
  Clock,
  ArrowLeft
} from "lucide-react";

const AITools = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const aiTools = [
    {
      id: "vision",
      title: "AI Vision",
      description: "Extract text and insights from images, analyze visual content, and generate captions",
      icon: Eye,
      gradient: "from-blue-600 to-cyan-600",
      category: "Vision",
      model: "Llama 4 Scout",
      href: "/ai/vision",
      badge: "Popular"
    },
    {
      id: "speech-to-text",
      title: "Speech to Text",
      description: "Transcribe audio and video content into text with high accuracy",
      icon: Mic,
      gradient: "from-green-600 to-emerald-600",
      category: "Audio",
      model: "Whisper Large v3 Turbo",
      href: "/ai/speech-to-text"
    },
    {
      id: "text-to-speech",
      title: "Text to Speech",
      description: "Convert your content into natural-sounding audio with multiple voices",
      icon: Volume2,
      gradient: "from-purple-600 to-pink-600",
      category: "Audio",
      model: "PlayAI TTS",
      href: "/ai/text-to-speech"
    },
    {
      id: "reasoning",
      title: "AI Reasoning",
      description: "Deep analysis and strategic content planning with advanced reasoning",
      icon: Brain,
      gradient: "from-indigo-600 to-purple-600",
      category: "Reasoning",
      model: "GPT OSS 120B",
      href: "/ai/reasoning",
      badge: "New"
    },
    {
      id: "multilingual",
      title: "Multilingual AI",
      description: "Translate and adapt your content for global audiences",
      icon: Globe,
      gradient: "from-teal-600 to-cyan-600",
      category: "Language",
      model: "GPT OSS 120B",
      href: "/ai/multilingual"
    },
    {
      id: "content-moderation",
      title: "Content Moderation",
      description: "AI-powered safety checks to ensure brand-safe content",
      icon: Shield,
      gradient: "from-red-600 to-orange-600",
      category: "Safety",
      model: "Llama Guard",
      href: "/ai/moderation"
    },
    {
      id: "trend-mining",
      title: "Trend Mining",
      description: "Discover viral trends and hashtags across platforms",
      icon: TrendingUp,
      gradient: "from-orange-600 to-amber-600",
      category: "Research",
      model: "GPT OSS 120B",
      href: "/ai/trends",
      badge: "Hot"
    },
    {
      id: "brand-voice",
      title: "Brand Voice Trainer",
      description: "Train AI to match your unique brand tone and style",
      icon: Sparkles,
      gradient: "from-pink-600 to-rose-600",
      category: "Branding",
      model: "GPT OSS 120B",
      href: "/ai/brand-voice"
    },
    {
      id: "audience-persona",
      title: "Audience Persona Builder",
      description: "Create detailed audience personas for targeted content",
      icon: Users,
      gradient: "from-violet-600 to-purple-600",
      category: "Strategy",
      model: "GPT OSS 120B",
      href: "/ai/personas"
    },
    {
      id: "smart-campaign",
      title: "Smart Campaign Generator",
      description: "Generate complete multi-platform campaigns automatically",
      icon: Target,
      gradient: "from-emerald-600 to-teal-600",
      category: "Campaigns",
      model: "GPT OSS 120B",
      href: "/ai/campaigns",
      badge: "Pro"
    },
    {
      id: "auto-reply",
      title: "Auto Reply System",
      description: "Generate contextual responses to audience engagement",
      icon: MessageCircle,
      gradient: "from-blue-600 to-indigo-600",
      category: "Engagement",
      model: "Kimi K2",
      href: "/ai/auto-reply"
    },
    {
      id: "emotion-optimizer",
      title: "Emotion Optimizer",
      description: "Optimize content for emotional impact and resonance",
      icon: Heart,
      gradient: "from-rose-600 to-red-600",
      category: "Optimization",
      model: "GPT OSS 120B",
      href: "/ai/emotion"
    },
    {
      id: "viral-hooks",
      title: "Viral Hook Generator",
      description: "Create attention-grabbing hooks that stop the scroll",
      icon: Zap,
      gradient: "from-yellow-600 to-orange-600",
      category: "Content",
      model: "GPT OSS 120B",
      href: "/ai/hooks",
      badge: "Hot"
    },
    {
      id: "influencer-collab",
      title: "Influencer Matcher",
      description: "Find and match with perfect brand collaboration partners",
      icon: Handshake,
      gradient: "from-cyan-600 to-blue-600",
      category: "Partnerships",
      model: "GPT OSS 120B",
      href: "/ai/influencers"
    },
    {
      id: "content-monetizer",
      title: "Content Monetizer",
      description: "Identify monetization opportunities and sponsorship fits",
      icon: DollarSign,
      gradient: "from-green-600 to-emerald-600",
      category: "Revenue",
      model: "GPT OSS 120B",
      href: "/ai/monetize"
    },
    {
      id: "accessibility",
      title: "Accessibility Optimizer",
      description: "Make content accessible with alt text and captions",
      icon: Accessibility,
      gradient: "from-purple-600 to-violet-600",
      category: "Accessibility",
      model: "GPT OSS 120B",
      href: "/ai/accessibility"
    }
  ];

  const filteredTools = aiTools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(aiTools.map(tool => tool.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-black/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-black rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Tools Hub</h1>
                  <p className="text-sm text-gray-600">16 Powerful AI Features</p>
                </div>
              </div>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-purple-100 text-purple-700 mb-4">Powered by Groq Cloud</Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Content Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            16 specialized AI tools to supercharge your content creation, from vision analysis to viral hooks
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant="outline" 
              className="cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => setSearchQuery(category)}
            >
              {category}
            </Badge>
          ))}
          {searchQuery && (
            <Badge 
              variant="destructive" 
              className="cursor-pointer"
              onClick={() => setSearchQuery("")}
            >
              Clear Filter
            </Badge>
          )}
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <Link key={tool.id} to={tool.href}>
              <Card className="group h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    {tool.badge && (
                      <Badge className={`text-xs ${
                        tool.badge === 'New' ? 'bg-green-500' : 
                        tool.badge === 'Hot' ? 'bg-red-500' : 
                        tool.badge === 'Pro' ? 'bg-purple-500' : 'bg-blue-500'
                      } text-white`}>
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-4">{tool.title}</CardTitle>
                  <CardDescription className="text-sm">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Star className="w-3 h-3" />
                      <span>{tool.model}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITools;
