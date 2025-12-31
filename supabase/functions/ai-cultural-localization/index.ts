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

    const { content, sourceRegion, targetRegions, preserveBrand, adaptationLevel } = await req.json();

    if (!content) {
      throw new Error('Content is required');
    }

    console.log('Performing cultural localization');

    const systemPrompt = `You are the CULTURAL LOCALIZATION ENGINE - an AI expert at adapting content for different cultural contexts while maintaining brand integrity.

## YOUR EXPERTISE
1. **Cultural Nuance**: Understand regional differences in communication styles
2. **Idiom Translation**: Convert expressions to culturally equivalent ones
3. **Tone Adaptation**: Adjust formality and style for each region
4. **Sensitivity Awareness**: Avoid cultural taboos and misunderstandings

## LOCALIZATION PRINCIPLES
- Translation is NOT enough - true localization means cultural rewriting
- Humor, idioms, and references must be region-appropriate
- Formality levels vary significantly by culture
- Visual and emoji preferences differ by region

## SOURCE REGION
${sourceRegion || 'US/Global English'}

## TARGET REGIONS
${targetRegions ? targetRegions.join(', ') : 'UK, India, UAE, Germany, Japan, Brazil'}

## ADAPTATION LEVEL
${adaptationLevel || 'full'} (light = minimal changes, moderate = adapt idioms/tone, full = complete cultural rewrite)

## BRAND PRESERVATION
${preserveBrand ? 'Yes - maintain core brand voice' : 'Flexible - prioritize cultural fit'}

## OUTPUT FORMAT
{
  "originalAnalysis": {
    "sourceRegion": "string",
    "tone": "string",
    "formalityLevel": "casual|professional|formal",
    "culturalElements": ["element1", "element2"]
  },
  "localizations": [
    {
      "region": "string",
      "language": "string",
      "adaptedContent": "string",
      "changes": [
        { "original": "string", "adapted": "string", "reason": "string" }
      ],
      "toneAdjustments": "string",
      "formalityLevel": "string",
      "culturalNotes": ["note1", "note2"],
      "warnings": ["warning1"] or null
    }
  ],
  "universalVersion": {
    "content": "string",
    "notes": "string"
  },
  "recommendations": {
    "bestPerformingRegions": ["region1", "region2"],
    "contentType": "string",
    "suggestedAdaptations": ["suggestion1", "suggestion2"]
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
          { role: 'user', content: `Localize this content for multiple regions:\n\n${content}` }
        ],
        temperature: 0.7,
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

    console.log('Cultural localization complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cultural localization:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
