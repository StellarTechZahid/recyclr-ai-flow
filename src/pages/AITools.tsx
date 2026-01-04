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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" aria-label="Back to dashboard" className="h-8 w-8 sm:h-9 sm:w-9">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground">AI Tools Hub</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">{aiToolsCatalog.length} AI Features</p>
                </div>
              </div>
            </div>

            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search AI tools…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Hero */}
        <section className="text-center mb-6 sm:mb-8 md:mb-10">
          <Badge className="mb-3 sm:mb-4 text-xs sm:text-sm">Powered by Gemini 2.5 (Lovable AI Gateway)</Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 sm:mb-3">
            AI-Powered Content Tools
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
            Browse and run {aiToolsCatalog.length} specialized AI tools.
          </p>
        </section>

        {/* Categories */}
        <section className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-4 sm:mb-6 md:mb-8 px-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-accent transition-colors text-xs sm:text-sm py-1 px-2 sm:px-3"
              onClick={() => setSearchQuery(category)}
            >
              {category}
            </Badge>
          ))}
          {searchQuery && (
            <Badge variant="destructive" className="cursor-pointer text-xs sm:text-sm py-1 px-2 sm:px-3" onClick={() => setSearchQuery("")}
            >
              Clear
            </Badge>
          )}
        </section>

        {/* Tools Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {filteredTools.map((tool) => (
            <Link key={tool.id} to={tool.href} aria-label={`Open ${tool.title}`}>
              <Card className="group h-full hover:shadow-lg transition-all duration-300 border-border/60 cursor-pointer">
                <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                      <tool.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-foreground" />
                    </div>
                    {tool.badge && (
                      <Badge className="text-xs px-1.5 py-0.5">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm sm:text-base md:text-lg mt-2 sm:mt-3 md:mt-4 text-foreground leading-tight">{tool.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm line-clamp-2">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
                      <Star className="w-3 h-3" />
                      <span className="hidden xs:inline">{tool.modelLabel || "Gemini 2.5"}</span>
                      <span className="xs:hidden">AI</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <section className="text-center py-10 sm:py-12 md:py-16">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/40 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">No tools found</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your search query.</p>
          </section>
        )}
      </div>
    </main>
  );
};

export default AITools;

