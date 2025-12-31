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

    const { slides, content, platform, style, topic } = await req.json();

    console.log('Processing carousel intelligence');

    const systemPrompt = `You are the CAROUSEL INTELLIGENCE engine - an AI expert at creating and optimizing carousel content for maximum engagement.

## YOUR EXPERTISE
1. **Slide Optimization**: Perfect balance of text and visual guidance
2. **Story Arc Design**: Create compelling progression through slides
3. **Hook Engineering**: Craft irresistible first slides
4. **CTA Mastery**: End with action-driving final slides

## CAROUSEL BEST PRACTICES
- Slide 1: Bold hook that creates curiosity
- Slides 2-N: Deliver value with clear, scannable points
- Final Slide: Strong CTA with engagement prompt

## PLATFORM
${platform || 'linkedin'}

## STYLE
${style || 'professional'}

## ANALYSIS MODE (if slides provided)
When analyzing existing carousel slides:
- Identify strengths and weaknesses
- Suggest specific improvements
- Rewrite underperforming slides

## CREATION MODE (if content/topic provided)
When creating new carousels:
- Design optimal slide count (5-10)
- Write headline + supporting text for each
- Include design guidance

## OUTPUT FORMAT
{
  "analysis": {
    "overallScore": number,
    "hookStrength": number,
    "flowScore": number,
    "ctaEffectiveness": number,
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "carousel": {
    "title": "string",
    "slideCount": number,
    "slides": [
      {
        "slideNumber": number,
        "headline": "string",
        "body": "string",
        "designNote": "string",
        "purpose": "hook|value|transition|cta"
      }
    ]
  },
  "alternativeHooks": [
    { "hook": "string", "style": "curiosity|authority|story|statistic" }
  ],
  "hashtags": ["tag1", "tag2"],
  "caption": "string",
  "bestPostingTime": "string"
}`;

    let userMessage = '';
    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    if (slides && slides.length > 0) {
      // Vision analysis of existing slides
      const slideContent: any[] = [
        { type: 'text', text: 'Analyze and improve this carousel:' }
      ];
      slides.forEach((slide: string) => {
        if (slide.startsWith('data:image')) {
          slideContent.push({ type: 'image_url', image_url: { url: slide } });
        }
      });
      messages.push({ role: 'user', content: slideContent });
    } else if (content || topic) {
      userMessage = `Create an optimized carousel for:\n\n${content || topic}`;
      messages.push({ role: 'user', content: userMessage });
    } else {
      throw new Error('Either slides or content/topic is required');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: slides && slides.length > 0 ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 4000,
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

    console.log('Carousel intelligence complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in carousel intelligence:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
