import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Brain, Search, Star } from "lucide-react";
import { aiToolsCatalog } from "@/lib/aiToolsCatalog";

const AITools = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return aiToolsCatalog;
    return aiToolsCatalog.filter(
      (tool) =>
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const categories = useMemo(
    () => [...new Set(aiToolsCatalog.map((tool) => tool.category))],
    []
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" aria-label="Back to dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">AI Tools Hub</h1>
                  <p className="text-sm text-muted-foreground">{aiToolsCatalog.length} AI Features</p>
                </div>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search AI tools…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero */}
        <section className="text-center mb-10">
          <Badge className="mb-4">Powered by Gemini 2.5 (Lovable AI Gateway)</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            AI-Powered Content Tools
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Browse and run {aiToolsCatalog.length} specialized AI tools.
          </p>
        </section>

        {/* Categories */}
        <section className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSearchQuery(category)}
            >
              {category}
            </Badge>
          ))}
          {searchQuery && (
            <Badge variant="destructive" className="cursor-pointer" onClick={() => setSearchQuery("")}
            >
              Clear Filter
            </Badge>
          )}
        </section>

        {/* Tools Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <Link key={tool.id} to={tool.href} aria-label={`Open ${tool.title}`}>
              <Card className="group h-full hover:shadow-lg transition-all duration-300 border-border/60 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <tool.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    {tool.badge && (
                      <Badge className="text-xs">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-4 text-foreground">{tool.title}</CardTitle>
                  <CardDescription className="text-sm">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="w-3 h-3" />
                      <span>{tool.modelLabel || "Gemini 2.5"}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <section className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No tools found</h3>
            <p className="text-muted-foreground">Try adjusting your search query.</p>
          </section>
        )}
      </div>
    </main>
  );
};

export default AITools;

