import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { action, sampleContent, brandProfile, contentToGenerate, platform } = await req.json();

    console.log('Brand voice action:', action);

    if (action === 'analyze') {
      // Analyze sample content to extract brand voice
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are an expert brand voice analyst. Analyze the provided content samples to extract a comprehensive brand voice profile. Be specific and actionable.`
            },
            {
              role: 'user',
              content: `Analyze these content samples and create a detailed brand voice profile:

${sampleContent.map((s: string, i: number) => `Sample ${i + 1}:\n${s}`).join('\n\n')}

Create a JSON profile with:
{
  "tonalQualities": ["list of tone descriptors"],
  "vocabulary": {
    "preferred": ["words/phrases commonly used"],
    "avoided": ["words/phrases never used"],
    "jargon": ["industry-specific terms"]
  },
  "sentenceStructure": {
    "averageLength": "short/medium/long",
    "complexity": "simple/moderate/complex",
    "style": "declarative/conversational/formal"
  },
  "personality": {
    "traits": ["personality traits"],
    "values": ["brand values expressed"],
    "emotionalTone": "description"
  },
  "writingPatterns": {
    "openingStyle": "how content typically starts",
    "closingStyle": "how content typically ends",
    "transitionWords": ["common transitions"],
    "punctuationStyle": "description"
  },
  "platformAdaptations": {
    "twitter": "style notes for twitter",
    "linkedin": "style notes for linkedin",
    "instagram": "style notes for instagram"
  },
  "doAndDont": {
    "do": ["specific guidelines to follow"],
    "dont": ["specific things to avoid"]
  }
}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Brand analysis API error:', error);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`Brand analysis API error: ${response.status}`);
      }

      const result = await response.json();
      let content = result.choices?.[0]?.message?.content || '';

      let profile;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          profile = JSON.parse(jsonMatch[0]);
        } else {
          profile = { raw: content };
        }
      } catch {
        profile = { raw: content };
      }

      return new Response(JSON.stringify({
        brandProfile: profile,
        model: 'google/gemini-2.5-flash'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'generate') {
      // Generate content in brand voice
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are a content writer who MUST write exactly in this brand voice:

${JSON.stringify(brandProfile, null, 2)}

Every word you write must match this brand's tone, vocabulary, and style. Follow the do's and don'ts strictly.`
            },
            {
              role: 'user',
              content: `Write ${platform ? `a ${platform} post` : 'content'} about: ${contentToGenerate}

Match the brand voice exactly. Provide only the content, no explanations.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Content generation API error:', error);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`Content generation API error: ${response.status}`);
      }

      const result = await response.json();
      const generatedContent = result.choices?.[0]?.message?.content || '';

      return new Response(JSON.stringify({
        content: generatedContent,
        platform,
        model: 'google/gemini-2.5-flash'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action. Use "analyze" or "generate"');

  } catch (error) {
    console.error('Brand voice error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
