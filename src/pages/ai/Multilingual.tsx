import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Globe,
  ArrowRightLeft,
  Loader2,
  Copy,
  Languages
} from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" }
];

const Multilingual = () => {
  const { user } = useAuth();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [preserveTone, setPreserveTone] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const translateContent = async () => {
    if (!user) {
      toast.error("Please sign in to translate");
      return;
    }

    if (!sourceText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }

    setIsTranslating(true);
    setTranslatedText("");

    try {
      const { data, error } = await supabase.functions.invoke('ai-multilingual', {
        body: { 
          content: sourceText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          preserveTone: preserveTone
        }
      });

      if (error) throw error;
      
      setTranslatedText(data.translatedContent || data.translation || "Translation complete");
      toast.success("Translation complete!");
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error(error.message || "Failed to translate");
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-teal-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/ai">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Multilingual AI</h1>
                <p className="text-sm text-gray-600">Translate content for global audiences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Language Selection */}
        <Card className="mb-6 border-teal-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="w-full md:w-48">
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Source language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="ghost" size="icon" onClick={swapLanguages}>
                <ArrowRightLeft className="w-5 h-5 text-teal-600" />
              </Button>
              
              <div className="w-full md:w-48">
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Switch
                  id="preserve-tone"
                  checked={preserveTone}
                  onCheckedChange={setPreserveTone}
                />
                <Label htmlFor="preserve-tone" className="text-sm">Preserve tone</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Panels */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Source */}
          <Card className="border-teal-200 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Languages className="w-5 h-5 text-teal-600" />
                  {languages.find(l => l.code === sourceLang)?.name}
                </CardTitle>
                {sourceText && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(sourceText)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                rows={12}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {sourceText.split(/\s+/).filter(Boolean).length} words
              </p>
            </CardContent>
          </Card>

          {/* Target */}
          <Card className="border-teal-200 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="w-5 h-5 text-cyan-600" />
                  {languages.find(l => l.code === targetLang)?.name}
                </CardTitle>
                {translatedText && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translatedText)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {translatedText ? (
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 min-h-[288px]">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{translatedText}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 min-h-[288px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Translation will appear here</p>
                  </div>
                </div>
              )}
              {translatedText && (
                <p className="text-xs text-gray-500 mt-2">
                  {translatedText.split(/\s+/).filter(Boolean).length} words
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Translate Button */}
        <div className="text-center mt-6">
          <Button
            size="lg"
            className="bg-gradient-to-r from-teal-600 to-cyan-600 px-12"
            onClick={translateContent}
            disabled={!sourceText.trim() || isTranslating}
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Globe className="w-5 h-5 mr-2" />
                Translate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Multilingual;
