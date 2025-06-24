
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Calendar, BarChart3, Sparkles, Users, Shield, Download, Smartphone, Wifi, Bell, CheckCircle, Star, Play, TrendingUp, Globe, Rocket, Brain, Target, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 overflow-x-hidden">
      {/* Enhanced Header */}
      <header className="glass-card sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold brand-gradient-text">
              RecyclrAI
            </span>
            <Badge variant="secondary" className="hidden sm:block">
              Beta
            </Badge>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="nav-link">Features</a>
            <a href="#app" className="nav-link">Mobile App</a>
            <a href="#testimonials" className="nav-link">Reviews</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="font-medium" asChild>
              <Link to="/auth/login">Sign In</Link>
            </Button>
            <Button className="btn-primary-modern border-0" asChild>
              <Link to="/auth/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - World Class Design */}
      <section className="space-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-emerald-500/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-6 bg-purple-100 text-purple-800 border-purple-200 animate-bounce-gentle">
              🚀 #1 AI Content Repurposing Platform
            </Badge>
            
            <h1 className="text-display mb-8 brand-gradient-text leading-tight animate-fade-in-up">
              Transform Your Content Into
              <br />
              <span className="relative">
                Viral Gold
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 rounded-full"></div>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:0.2s]">
              Leverage advanced AI to repurpose your content across all platforms. 
              <br className="hidden md:block" />
              <strong className="text-purple-700">Schedule, publish, and track performance</strong> — all in one intelligent dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in-up [animation-delay:0.4s]">
              <Button size="lg" className="btn-primary-modern text-lg px-10 py-4 shadow-modern-lg" asChild>
                <Link to="/auth/signup">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="btn-secondary-modern text-lg px-10 py-4 group">
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 animate-fade-in-up [animation-delay:0.6s]">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-bounce-gentle [animation-delay:1s]"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-bounce-gentle [animation-delay:2s]"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl animate-bounce-gentle [animation-delay:0.5s]"></div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-gray-200/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gray-600 text-lg mb-8">Trusted by 10,000+ creators and brands worldwide</p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-lg font-semibold ml-2">4.9/5</span>
              <span className="text-gray-500">(2,847 reviews)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            {[
              { icon: Users, name: "Creator Hub" },
              { icon: Shield, name: "Brand Shield" },
              { icon: Sparkles, name: "Content Pro" },
              { icon: TrendingUp, name: "Growth Labs" }
            ].map((company, index) => (
              <div key={index} className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-white/50">
                <company.icon className="w-8 h-8 text-gray-400" />
                <span className="font-semibold text-gray-600">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="space-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              Powerful Features
            </Badge>
            <h2 className="text-headline mb-6 brand-gradient-text">Everything You Need to Scale</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-driven tools designed to maximize your content's reach and engagement across all platforms
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Brain,
                title: "AI Content Repurposing",
                description: "Transform blogs into tweet threads, videos into LinkedIn posts, and more with GPT-4 powered AI that understands your unique brand voice and audience.",
                color: "from-purple-500 to-purple-600",
                features: ["Multi-platform optimization", "Brand voice learning", "Content format conversion"]
              },
              {
                icon: Rocket,
                title: "Smart Scheduling",
                description: "Schedule posts across Twitter, LinkedIn, Instagram, and more. Our AI suggests optimal posting times for maximum engagement based on your audience analytics.",
                color: "from-blue-500 to-blue-600",
                features: ["Optimal timing AI", "Multi-platform publishing", "Audience insights"]
              },
              {
                icon: Target,
                title: "Performance Analytics",
                description: "Track engagement, reach, and growth across all platforms. Get AI-powered insights on what content performs best and actionable recommendations.",
                color: "from-emerald-500 to-emerald-600",
                features: ["Real-time analytics", "Performance insights", "Growth tracking"]
              }
            ].map((feature, index) => (
              <Card key={index} className="card-modern card-interactive group">
                <CardHeader className="text-center pb-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-lg leading-relaxed mb-6">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-2">
                    {feature.features.map((item, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced App Installation Section */}
      <section id="app" className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 space-section text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              Mobile App
            </Badge>
            <h2 className="text-headline mb-6">Download Our Mobile App</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Get the full RecyclrAI experience on your mobile device. Works offline, sends push notifications, 
              and integrates seamlessly with your workflow for content creation on-the-go.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="space-y-10">
              {[
                {
                  icon: Smartphone,
                  title: "Native App Experience",
                  description: "Install directly to your home screen for instant access. No app store required - it's a Progressive Web App (PWA) with native performance."
                },
                {
                  icon: Wifi,
                  title: "Works Offline",
                  description: "Access your content, templates, and drafts even without internet connection. Changes sync automatically when you're back online."
                },
                {
                  icon: Bell,
                  title: "Smart Notifications",
                  description: "Get notified when your content is ready, scheduled posts go live, or analytics insights are available. Stay connected to your content strategy."
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-6 group">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                    <p className="opacity-90 text-lg leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <div className="glass-card-dark rounded-3xl p-10 backdrop-blur-md border border-white/20 shadow-modern-lg">
                <div className="w-40 h-40 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Download className="w-20 h-20" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Install RecyclrAI</h3>
                <p className="mb-8 opacity-90 text-lg">Tap the install button when it appears, or add to home screen from your browser menu.</p>
                <div className="space-y-4">
                  {[
                    { icon: "📱", text: "iOS: Tap Share → Add to Home Screen" },
                    { icon: "🤖", text: "Android: Tap Menu → Install App" },
                    { icon: "💻", text: "Desktop: Click Install button in address bar" }
                  ].map((instruction, index) => (
                    <div key={index} className="bg-white/20 rounded-xl p-4 text-lg backdrop-blur-sm">
                      <span className="text-2xl mr-3">{instruction.icon}</span>
                      {instruction.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="space-section bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-emerald-100 text-emerald-800 border-emerald-200">
              Customer Stories
            </Badge>
            <h2 className="text-headline mb-6 brand-gradient-text">Loved by Content Creators</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how creators and brands are transforming their content strategy with RecyclrAI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Chen",
                role: "Content Creator",
                avatar: "SC",
                content: "RecyclrAI has completely transformed my content workflow. What used to take me hours now takes minutes. The AI understands my voice perfectly!",
                rating: 5
              },
              {
                name: "Marcus Johnson",
                role: "Marketing Director",
                avatar: "MJ",
                content: "Our engagement rates have increased by 300% since using RecyclrAI. The platform-specific optimization is incredible.",
                rating: 5
              },
              {
                name: "Elena Rodriguez",
                role: "Social Media Manager",
                avatar: "ER",
                content: "The analytics insights are game-changing. I can see exactly what content performs best and optimize accordingly.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="card-modern">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-2 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed text-lg">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="space-section bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-8 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              Ready to Transform Your Content?
            </Badge>
            
            <h2 className="text-headline mb-8">
              Join 10,000+ Creators Who've Already 
              <br />
              <span className="relative">
                10x Their Content Reach
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-white/50 rounded-full"></div>
              </span>
            </h2>
            
            <p className="text-2xl mb-12 opacity-90 leading-relaxed">
              Stop manually repurposing content. Let AI do the heavy lifting while you focus on what matters most — creating amazing content.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-12 py-6 rounded-2xl font-bold shadow-modern-lg transform hover:-translate-y-1 transition-all" asChild>
                <Link to="/auth/signup">
                  Start Your Free Trial <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-lg opacity-90">
              <div className="flex items-center">
                <Award className="w-6 h-6 mr-2" />
                30-day money back guarantee
              </div>
              <div className="flex items-center">
                <Globe className="w-6 h-6 mr-2" />
                Used in 50+ countries
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">RecyclrAI</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transform your content into viral gold with the power of AI. Join thousands of creators worldwide.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'instagram', 'youtube'].map((social) => (
                  <div key={social} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                    <Users className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "API", "Integrations", "Changelog"]
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press", "Partners"]
              },
              {
                title: "Support",
                links: ["Help Center", "Community", "Contact", "Status", "Privacy"]
              }
            ].map((section, index) => (
              <div key={index} className="space-y-6">
                <h3 className="font-semibold text-lg">{section.title}</h3>
                <ul className="space-y-3">
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
              &copy; 2024 RecyclrAI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
