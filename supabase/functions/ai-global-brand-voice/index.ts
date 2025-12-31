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

    const { brandVoice, content, targetLanguages, consistencyLevel } = await req.json();

    if (!brandVoice || !content) {
      throw new Error('Brand voice profile and content are required');
    }

    console.log('Applying global brand voice');

    const systemPrompt = `You are the GLOBAL BRAND VOICE CONTROLLER - an AI that maintains brand consistency across languages and regions while allowing appropriate cultural adaptation.

## YOUR MISSION
Ensure brand voice remains recognizable and consistent across all markets while respecting cultural nuances.

## BRAND VOICE PROFILE
${JSON.stringify(brandVoice, null, 2)}

## CONSISTENCY PARAMETERS
Level: ${consistencyLevel || 'balanced'} 
- strict: Minimal adaptation, maximum consistency
- balanced: Smart adaptation while preserving core voice
- flexible: Prioritize cultural fit over consistency

## TARGET LANGUAGES
${targetLanguages ? targetLanguages.join(', ') : 'Spanish, French, German, Portuguese, Arabic, Hindi, Japanese, Korean, Chinese'}

## VOICE PRESERVATION ELEMENTS
1. **Core Personality**: The fundamental character must remain
2. **Key Phrases**: Signature expressions adapted, not lost
3. **Tone Range**: Maintain the same emotional spectrum
4. **Values Expression**: Brand values must come through

## ADAPTATION ALLOWANCES
1. **Formality Adjustment**: Can shift for cultural norms
2. **Humor Style**: Can adapt to local preferences
3. **Reference Points**: Can use local equivalents
4. **Length**: Can adjust for language efficiency

## OUTPUT FORMAT
{
  "brandVoiceAnalysis": {
    "coreElements": ["element1", "element2"],
    "adaptableElements": ["element1", "element2"],
    "signaturePhrases": ["phrase1", "phrase2"]
  },
  "globalVersions": [
    {
      "language": "string",
      "region": "string",
      "content": "string",
      "voiceConsistencyScore": number,
      "adaptations": [
        { "element": "string", "original": "string", "adapted": "string" }
      ],
      "culturalNotes": "string"
    }
  ],
  "consistencyReport": {
    "overallScore": number,
    "strongestMarkets": ["market1", "market2"],
    "challengingMarkets": ["market1"],
    "recommendations": ["rec1", "rec2"]
  },
  "brandGuidance": {
    "doGlobally": ["do1", "do2"],
    "avoidGlobally": ["avoid1", "avoid2"],
    "regionSpecificNotes": {}
  }
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Apply this brand's voice globally to the following content:\n\n${content}` }
        ],
        temperature: 0.6,
        max_tokens: 5000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`API request failed: ${status}`);
    }

    const data = await response.json();
    const responseContent = data.choices[0]?.message?.content;

    let result;
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { rawContent: responseContent };
      }
    } catch {
      result = { rawContent: responseContent };
    }

    console.log('Global brand voice applied');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in global brand voice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
