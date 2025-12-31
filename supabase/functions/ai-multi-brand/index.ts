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

    const { content, brands, operation } = await req.json();

    if (!content || !brands || brands.length === 0) {
      throw new Error('Content and at least one brand are required');
    }

    console.log('Processing multi-brand content for', brands.length, 'brands');

    const systemPrompt = `You are the MULTI-BRAND CONTENT ENGINE - an AI that adapts single content pieces for multiple brand voices while maintaining core message integrity.

## YOUR MISSION
Enable agencies and multi-brand companies to efficiently create brand-specific versions of content without losing the essential value proposition.

## OPERATION MODE
${operation || 'adapt'} (adapt = create versions, compare = analyze differences, merge = combine elements)

## BRAND PROFILES
${JSON.stringify(brands, null, 2)}

## ADAPTATION PRINCIPLES
1. Core message remains consistent across all versions
2. Each brand version feels authentically "on-brand"
3. Platform-specific nuances are preserved
4. Legal/compliance elements are maintained

## FOR EACH BRAND, CONSIDER:
- Voice attributes (formal/casual, serious/playful)
- Target audience differences
- Unique value propositions
- Brand-specific terminology
- Visual language preferences (emojis, formatting)

## OUTPUT FORMAT
{
  "originalAnalysis": {
    "coreMessage": "string",
    "keyPoints": ["point1", "point2"],
    "universalElements": ["element1", "element2"]
  },
  "brandVersions": [
    {
      "brandName": "string",
      "adaptedContent": "string",
      "voiceAdjustments": ["adjustment1", "adjustment2"],
      "audienceTargeting": "string",
      "platformRecommendation": "string",
      "brandAlignmentScore": number,
      "uniqueElements": ["element1", "element2"]
    }
  ],
  "comparisonMatrix": {
    "sharedElements": ["element1", "element2"],
    "differentiators": [
      { "brand": "string", "uniqueAspect": "string" }
    ]
  },
  "recommendations": {
    "contentCalendar": [
      { "brand": "string", "suggestedPostTime": "string", "platform": "string" }
    ],
    "crossPromotionOpportunities": ["opportunity1"],
    "conflictWarnings": ["warning1"] or null
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
          { role: 'user', content: `Adapt this content for all specified brands:\n\n${content}` }
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

    console.log('Multi-brand content processing complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in multi-brand:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
