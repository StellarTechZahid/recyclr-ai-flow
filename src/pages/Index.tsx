
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, Calendar, BarChart3, Sparkles, Users, Shield, Download, Smartphone, Wifi, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RecyclrAI
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#app" className="text-gray-600 hover:text-gray-900 transition-colors">Mobile App</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Transform Your Content Into Viral Gold
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Use AI to repurpose your existing content into engaging posts across all platforms. 
            Schedule, publish, and track performance—all in one powerful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth/signup">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Scale</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful AI-driven tools to maximize your content's reach and engagement
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">AI Content Repurposing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-lg leading-relaxed">
                Transform blogs into tweet threads, videos into LinkedIn posts, and more with GPT-4 powered AI that understands your brand voice.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-lg leading-relaxed">
                Schedule posts across Twitter, LinkedIn, and more. AI suggests optimal posting times for maximum engagement.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-lg leading-relaxed">
                Track engagement, reach, and growth across all platforms. Get AI-powered insights on what content performs best.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* App Installation Section */}
      <section id="app" className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Download Our Mobile App</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Get the full Recyclr AI experience on your mobile device. Works offline, sends push notifications, and integrates seamlessly with your workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Native App Experience</h3>
                  <p className="opacity-90">Install directly to your home screen for instant access. No app store required - it's a Progressive Web App (PWA).</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Works Offline</h3>
                  <p className="opacity-90">Access your content, templates, and drafts even without internet connection. Changes sync when you're back online.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Push Notifications</h3>
                  <p className="opacity-90">Get notified when your content is ready, scheduled posts go live, or analytics insights are available.</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-md border border-white/20">
                <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Download className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Install Recyclr AI</h3>
                <p className="mb-6 opacity-90">Tap the install button when it appears, or add to home screen from your browser menu.</p>
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-lg p-3 text-sm">
                    📱 iOS: Tap Share → Add to Home Screen
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-sm">
                    🤖 Android: Tap Menu → Install App
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-sm">
                    💻 Desktop: Click Install button in address bar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold mb-8 text-gray-600">Trusted by creators and brands worldwide</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="w-32 h-12 bg-gray-200 rounded flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <div className="w-32 h-12 bg-gray-200 rounded flex items-center justify-center">
              <Shield className="w-6 h-6 text-gray-400" />
            </div>
            <div className="w-32 h-12 bg-gray-200 rounded flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to 10x Your Content Reach?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators who've already transformed their content strategy with RecyclrAI
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/auth/signup">
              Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">RecyclrAI</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RecyclrAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
