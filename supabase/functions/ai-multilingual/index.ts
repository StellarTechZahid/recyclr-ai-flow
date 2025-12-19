import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const languageNames: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ar: 'Arabic',
  hi: 'Hindi', ru: 'Russian', nl: 'Dutch', pl: 'Polish', tr: 'Turkish',
  vi: 'Vietnamese', th: 'Thai', id: 'Indonesian', ms: 'Malay', sv: 'Swedish',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GROQ_GPT_OSS_120B_KEY');
    if (!apiKey) {
      throw new Error('GROQ_GPT_OSS_120B_KEY not configured');
    }

    const { content, sourceLanguage, targetLanguage, preserveTone, brandVoice } = await req.json();

    if (!content || !targetLanguage) {
      throw new Error('Content and target language are required');
    }

    console.log('Multilingual translation:', sourceLanguage, '->', targetLanguage);

    const sourceLang = languageNames[sourceLanguage] || sourceLanguage || 'the original language';
    const targetLang = languageNames[targetLanguage] || targetLanguage;

    let systemPrompt = `You are an expert multilingual translator and cultural adapter. Your task is to translate content while:
1. Preserving the original meaning and intent
2. Adapting cultural references and idioms appropriately
3. Maintaining the emotional tone and impact
4. Using natural, native-sounding expressions in the target language`;

    if (preserveTone) {
      systemPrompt += `\n5. Carefully preserve the original tone: ${preserveTone}`;
    }

    if (brandVoice) {
      systemPrompt += `\n6. Match this brand voice style: ${brandVoice}`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Translate the following content from ${sourceLang} to ${targetLang}. Provide only the translation, no explanations.

Content to translate:
${content}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Translation API error:', error);
      throw new Error(`Translation API error: ${response.status}`);
    }

    const result = await response.json();
    const translatedContent = result.choices?.[0]?.message?.content || '';

    console.log('Translation complete, length:', translatedContent.length);

    return new Response(JSON.stringify({
      translatedContent,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
      model: 'gpt-oss-120b'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
