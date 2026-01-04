
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Calendar, BarChart3, Sparkles, Users, Shield, Download, Smartphone, Wifi, Bell, CheckCircle, Star, Play, TrendingUp, Globe, Rocket, Brain, Target, Award, Instagram, Twitter, Linkedin, Youtube, Facebook, MessageSquare, Video, FileText, Image, Share2, Wand2, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-black/5">
      {/* Enhanced Header with Mobile-First Design */}
      <header className="glass-card sticky top-0 z-50 border-b border-purple-200/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-black rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">
                Vyralix AI
              </span>
              <Badge className="hidden sm:block bg-purple-100 text-purple-800 border-purple-300">
                Pro
              </Badge>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">Features</a>
              <a href="#demo" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">Demo</a>
              <a href="#testimonials" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">Reviews</a>
            </nav>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="hidden sm:block" asChild>
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-black hover:from-purple-700 hover:to-gray-900 text-white border-0 shadow-lg px-6" asChild>
                <Link to="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Professional & Mobile-Optimized */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-black/5 to-purple-600/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <Badge className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 border-purple-300 px-4 py-2 text-sm font-medium animate-pulse">
                <Zap className="w-4 h-4" />
                <span>10,000+ Creators Trust Us</span>
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">
                  Transform Content
                </span>
                <br />
                <span className="text-gray-900">Into Viral Gold</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                AI-powered content repurposing that turns one piece into dozens. 
                <span className="font-semibold text-purple-700">Schedule, publish, and track</span> — all automatically.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-black hover:from-purple-700 hover:to-gray-900 text-white text-lg px-8 py-4 shadow-xl border-0" asChild>
                  <Link to="/auth/signup">
                    Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-purple-200 hover:bg-purple-50 group">
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  Free 14-day trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  No credit card
                </div>
              </div>
            </div>

            {/* Right Visual - Branded App Preview */}
            <div className="relative">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                {/* Phone Mockup */}
                <div className="relative bg-gradient-to-br from-purple-600 to-black p-2 rounded-[2.5rem] shadow-2xl">
                  <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-gray-900 text-white text-xs py-2 px-4 flex justify-between items-center">
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-2 bg-white rounded-sm"></div>
                        <Wifi className="w-4 h-4" />
                        <div className="w-6 h-3 bg-white rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-white min-h-[500px]">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-black rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">Vyralix AI</span>
                        </div>
                        <Bell className="w-6 h-6 text-gray-400" />
                      </div>
                      
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200/50 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-purple-600 font-medium">Content</p>
                              <p className="text-xl font-bold">127</p>
                            </div>
                            <FileText className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200/50 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>  
                              <p className="text-xs text-emerald-600 font-medium">Generated</p>
                              <p className="text-xl font-bold">1.2K</p>
                            </div>
                            <Wand2 className="w-6 h-6 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Platform Icons */}
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200/50 shadow-sm mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Connected Platforms</p>
                        <div className="flex justify-between">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Instagram className="w-5 h-5 text-white" />
                          </div>
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Twitter className="w-5 h-5 text-white" />
                          </div>
                          <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                            <Linkedin className="w-5 h-5 text-white" />
                          </div>
                          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                            <Youtube className="w-5 h-5 text-white" />
                          </div>
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Facebook className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-black text-white border-0 shadow-lg">
                        <Brain className="w-5 h-5 mr-2" />
                        Generate Content
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-black/10 rounded-full blur-xl animate-pulse [animation-delay:1s]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof with Branded Design */}
      <section className="py-12 bg-white/70 backdrop-blur-sm border-y border-purple-200/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-6">Trusted by content creators worldwide</p>
            <div className="flex items-center justify-center space-x-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-lg font-semibold ml-2">4.9/5</span>
              <span className="text-gray-500">(2,847 reviews)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-60">
            {[
              { icon: Users, name: "Creator Hub", users: "10K+" },
              { icon: Shield, name: "Brand Pro", users: "5K+" },
              { icon: Sparkles, name: "Content AI", users: "15K+" },
              { icon: TrendingUp, name: "Growth Co", users: "8K+" }
            ].map((company, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-purple-200/30">
                <company.icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">{company.name}</p>
                <p className="text-sm text-gray-500">{company.users} users</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Visual & Professional */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-purple-100 text-purple-800 border-purple-300">
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional tools designed for modern content creators and brands
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Content Magic",
                description: "Transform any content into multiple formats instantly. Blog to tweets, videos to posts, podcasts to articles.",
                image: "✨",
                gradient: "from-purple-500 to-purple-700",
                features: ["Multi-format conversion", "Brand voice matching", "Instant generation"]
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description: "AI-powered optimal timing across all platforms. Never miss the perfect moment to engage your audience.",
                image: "📅",
                gradient: "from-blue-500 to-purple-600",
                features: ["Optimal timing AI", "Multi-platform sync", "Auto-publishing"]
              },
              {
                icon: BarChart3,
                title: "Deep Analytics",
                description: "Real-time performance tracking with actionable insights. See what works and scale what converts.",
                image: "📊",
                gradient: "from-emerald-500 to-blue-600",
                features: ["Real-time metrics", "Growth insights", "ROI tracking"]
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-purple-200/50 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl mb-4">{feature.image}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6 text-center">
                    {feature.description}
                  </p>
                  <div className="space-y-3">
                    {feature.features.map((item, i) => (
                      <div key={i} className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section with Visual Content */}
      <section id="demo" className="py-20 bg-gradient-to-br from-purple-600 via-black to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              See It In Action
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Watch Vyralix AI Transform Content</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              See how one blog post becomes 20+ pieces of engaging content across all platforms
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Demo Content */}
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <FileText className="w-8 h-8 mr-3 text-purple-300" />
                  Input: Blog Post
                </h3>
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-purple-200 text-sm">
                    "The Future of AI in Content Marketing: 5 Game-Changing Trends..."
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 rotate-90 lg:rotate-0" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Twitter, title: "5 Tweet Thread", color: "bg-blue-500" },
                  { icon: Instagram, title: "3 IG Posts", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
                  { icon: Linkedin, title: "LinkedIn Article", color: "bg-blue-700" },
                  { icon: Video, title: "Video Script", color: "bg-red-600" }
                ].map((output, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                    <div className={`w-12 h-12 ${output.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <output.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium">{output.title}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Video Placeholder */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
                <div className="w-full h-64 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center group cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="w-10 h-10 ml-1 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">3-Minute Demo</h3>
                <p className="opacity-90 mb-6">Watch how Vyralix AI transforms one piece of content into dozens</p>
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-3">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-8 bg-purple-100 text-purple-800 border-purple-300 text-lg px-6 py-2">
              Ready to 10x Your Content?
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">
                Start Creating Viral Content Today
              </span>
            </h2>
            
            <p className="text-2xl text-gray-600 mb-12 leading-relaxed">
              Join thousands of creators who've transformed their content strategy with AI
            </p>
            
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-black hover:from-purple-700 hover:to-gray-900 text-white text-xl px-12 py-6 rounded-2xl font-bold shadow-2xl transform hover:-translate-y-1 transition-all border-0" asChild>
              <Link to="/auth/signup">
                Get Started Free <ArrowRight className="ml-3 w-6 h-6" />
              </Link>
            </Button>
            
            <div className="flex items-center justify-center space-x-8 mt-8 text-gray-500">
              <div className="flex items-center">
                <Award className="w-6 h-6 mr-2 text-purple-600" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <Shield className="w-6 h-6 mr-2 text-purple-600" />
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Brand Consistency */}
      <footer className="bg-gradient-to-br from-black to-purple-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-white rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold">Vyralix AI</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Transform your content into viral gold with the power of AI.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "API", "Integrations"]
              },
              {
                title: "Company", 
                links: ["About", "Blog", "Careers", "Press"]
              },
              {
                title: "Support",
                links: ["Help Center", "Community", "Contact", "Status"]
              }
            ].map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-semibold text-lg text-purple-300">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2024 Vyralix AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {[Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <div key={i} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                  <Icon className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
