import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { aiToolsCatalog } from "@/lib/aiToolsCatalog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Wand2 } from "lucide-react";

export default function ToolRunner() {
  const { toolSlug } = useParams();
  const tool = useMemo(
    () => aiToolsCatalog.find((t) => t.slug === toolSlug && t.runner === "generic"),
    [toolSlug]
  );

  const [simpleInput, setSimpleInput] = useState("");
  const [advancedJson, setAdvancedJson] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const defaultBody = useMemo(() => {
    if (!tool) return "";
    const primaryField = tool.primaryField || "prompt";
    return JSON.stringify(
      {
        [primaryField]: tool.placeholder ? tool.placeholder : "",
        // Tip: if the function expects a different field name, edit this JSON.
      },
      null,
      2
    );
  }, [tool]);

  // Initialize advanced JSON when tool loads
  useMemo(() => {
    if (tool && !advancedJson) setAdvancedJson(defaultBody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolSlug, tool]);

  const runSimple = async () => {
    if (!tool?.functionName) return;
    if (!simpleInput.trim()) {
      toast.error("Please enter input first.");
      return;
    }

    const primaryField = tool.primaryField || "prompt";
    const body = {
      [primaryField]: simpleInput,
      // Common aliases (harmless if ignored by the edge function)
      prompt: simpleInput,
      content: simpleInput,
      text: simpleInput,
      query: simpleInput,
    };

    setIsLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(tool.functionName, { body });
      if (error) throw error;
      setResult(data);
      toast.success("Done.");
    } catch (e: any) {
      const msg = e?.message || "Request failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const runAdvanced = async () => {
    if (!tool?.functionName) return;

    let body: any;
    try {
      body = JSON.parse(advancedJson);
    } catch {
      toast.error("Advanced JSON is not valid JSON.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(tool.functionName, { body });
      if (error) throw error;
      setResult(data);
      toast.success("Done.");
    } catch (e: any) {
      const msg = e?.message || "Request failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tool) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Link to="/ai">
              <Button variant="ghost" size="icon" aria-label="Back to AI tools">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Tool not found</h1>
              <p className="text-sm text-muted-foreground">This AI tool page isn’t available yet.</p>
            </div>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/ai">
              <Button variant="ghost" size="icon" aria-label="Back to AI tools">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{tool.title}</h1>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Model: {tool.modelLabel || "Gemini 2.5"}</div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Run</CardTitle>
              <CardDescription>
                Use Simple mode for quick runs, or Advanced JSON if this tool needs extra parameters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="simple" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger className="flex-1" value="simple">
                    Simple
                  </TabsTrigger>
                  <TabsTrigger className="flex-1" value="advanced">
                    Advanced JSON
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="simple" className="mt-4 space-y-3">
                  <Textarea
                    value={simpleInput}
                    onChange={(e) => setSimpleInput(e.target.value)}
                    rows={10}
                    placeholder={tool.placeholder || "Enter your input…"}
                    className="resize-none"
                  />
                  <Button onClick={runSimple} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      "Running…"
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Wand2 className="h-4 w-4" /> Run
                      </span>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="advanced" className="mt-4 space-y-3">
                  <Textarea
                    value={advancedJson}
                    onChange={(e) => setAdvancedJson(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder={defaultBody}
                  />
                  <Button onClick={runAdvanced} disabled={isLoading} className="w-full">
                    {isLoading ? "Running…" : "Run JSON"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Result</CardTitle>
              <CardDescription>Response returned from the edge function.</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <pre className="max-h-[520px] overflow-auto rounded-md border border-border bg-muted p-4 text-xs text-foreground">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Run the tool to see output here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
