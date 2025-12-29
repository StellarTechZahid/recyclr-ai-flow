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

    const { content, publishDate, contentType, industry } = await req.json();

    console.log('Content Decay Detection for:', contentType);

    const systemPrompt = `You are an expert Content Decay Detector. You identify when content becomes stale, outdated, or loses relevance.

DECAY DETECTION FRAMEWORK:

1. TEMPORAL DECAY ANALYSIS:
- Time-sensitive references (dates, events, "this year")
- Trend references that may have passed
- Seasonal relevance factors
- News/current events dependencies

2. TECHNICAL DECAY:
- Outdated statistics or data points
- Deprecated technologies mentioned
- Changed industry standards
- Updated best practices

3. CULTURAL DECAY:
- Slang or phrases that dated
- Cultural references that aged
- Shifting social norms
- Generational relevance

4. COMPETITIVE DECAY:
- Competitors mentioned that changed
- Market positioning that shifted
- Pricing/offers that expired
- Product features outdated

5. SEO DECAY:
- Keywords that lost relevance
- Search intent changes
- Algorithm preference shifts

6. DECAY SEVERITY SCORING:
- Fresh (0-20%): Still highly relevant
- Aging (21-40%): Minor updates needed
- Stale (41-60%): Significant refresh required
- Outdated (61-80%): Major rewrite needed
- Expired (81-100%): Full replacement recommended

7. REFRESH RECOMMENDATIONS:
For each decay point:
- Specific update needed
- Priority level
- Estimated effort
- Alternative: Archive or redirect

Provide actionable decay analysis with specific fixes.`;

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
          { role: 'user', content: `Analyze this content for decay (Published: ${publishDate || 'Unknown'}, Industry: ${industry || 'General'}):\n\n${content}` }
        ],
        temperature: 0.6,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const analysis = result.choices?.[0]?.message?.content || '';

    console.log('Decay detection complete');

    return new Response(JSON.stringify({
      analysis,
      model: 'google/gemini-2.5-flash',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content Decay error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
