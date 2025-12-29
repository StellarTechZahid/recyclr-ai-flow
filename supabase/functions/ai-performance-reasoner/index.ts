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

    const { content, platform, analytics, historicalData } = await req.json();

    console.log('Performance Reasoning for platform:', platform);

    const systemPrompt = `You are an elite Content Performance Reasoner powered by advanced AI. You analyze content and predict performance with deep strategic reasoning.

REASONING CHAIN:

STEP 1 - PLATFORM DNA ANALYSIS:
Analyze how this content aligns with ${platform || 'social media'} algorithm preferences:
- Optimal content length for platform
- Engagement triggers
- Algorithm boost factors
- Peak timing patterns

STEP 2 - HISTORICAL PATTERN MATCHING:
${historicalData ? `Based on provided historical data: ${JSON.stringify(historicalData)}` : 'Analyze typical patterns for this content type'}
- What similar content performed well/poorly
- Key differentiators

STEP 3 - CONTENT ELEMENT SCORING:
Score each element 1-10:
- Hook strength
- Value density
- Emotional resonance
- Call-to-action clarity
- Visual/format optimization
- Shareability factor

STEP 4 - PLATFORM FIT PREDICTION:
Predict performance on each platform:
- Twitter/X: Thread potential, engagement rate
- LinkedIn: Professional resonance, comment potential
- Instagram: Visual adaptation, story potential
- TikTok: Video script potential, virality
- YouTube: Long-form potential, SEO value

STEP 5 - STRATEGIC RECOMMENDATIONS:
- Best platform for this content
- Required adaptations per platform
- Optimal format (carousel, thread, video, etc.)
- Posting strategy

Provide detailed reasoning with confidence scores.`;

    const userPrompt = `Analyze this content for performance prediction:

CONTENT:
${content}

${analytics ? `CURRENT ANALYTICS DATA:\n${JSON.stringify(analytics, null, 2)}` : ''}

Provide deep strategic reasoning about where and how this content will perform best.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const reasoning = result.choices?.[0]?.message?.content || '';

    console.log('Performance reasoning complete');

    return new Response(JSON.stringify({
      reasoning,
      model: 'google/gemini-2.5-pro',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Performance Reasoner error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
