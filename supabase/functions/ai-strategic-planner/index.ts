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

    const { 
      goals, 
      platforms, 
      timeframe, 
      industry, 
      targetAudience, 
      brandVoice,
      existingContent 
    } = await req.json();

    console.log('Strategic Planning for:', industry);

    const systemPrompt = `You are a world-class Content Strategist AI. You create comprehensive, actionable content strategies that drive real business results.

STRATEGIC PLANNING FRAMEWORK:

1. GOAL ALIGNMENT MATRIX:
- Map business goals to content objectives
- Define success metrics (KPIs)
- Set realistic benchmarks

2. AUDIENCE JOURNEY MAPPING:
- Awareness stage content needs
- Consideration stage content
- Decision stage content
- Retention/advocacy content

3. CONTENT PILLAR ARCHITECTURE:
Design 3-5 content pillars:
- Pillar theme
- Content types within pillar
- Frequency recommendation
- Platform distribution

4. WEEKLY CONTENT CALENDAR:
For each week provide:
- Monday: [Platform] - [Content Type] - [Topic]
- Continue for each posting day...

5. MONTHLY THEMES:
- Theme name
- Key topics to cover
- Tie-in opportunities (holidays, events)
- Campaign integration

6. CROSS-PLATFORM NARRATIVE:
How content flows across platforms:
- Long-form anchor content
- Repurposing chain
- Platform-specific adaptations

7. CONTENT MIX FORMULA:
Recommend percentage split:
- Educational: X%
- Entertaining: X%
- Promotional: X%
- Community/UGC: X%
- Trending/Reactive: X%

8. RESOURCE ALLOCATION:
- Content creation time estimates
- Tool recommendations
- Automation opportunities

9. RISK MITIGATION:
- Content backup ideas
- Crisis content protocols
- Trend-jacking guidelines

Provide a complete, ready-to-execute strategy.`;

    const userPrompt = `Create a comprehensive content strategy:

GOALS: ${goals || 'Grow audience and engagement'}
PLATFORMS: ${platforms?.join(', ') || 'All major platforms'}
TIMEFRAME: ${timeframe || '3 months'}
INDUSTRY: ${industry || 'General'}
TARGET AUDIENCE: ${targetAudience || 'Not specified'}
BRAND VOICE: ${brandVoice || 'Professional yet approachable'}
${existingContent ? `EXISTING CONTENT CONTEXT:\n${existingContent}` : ''}

Generate a detailed, actionable content strategy.`;

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
        temperature: 0.8,
        max_tokens: 4000,
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
    const strategy = result.choices?.[0]?.message?.content || '';

    console.log('Strategic planning complete');

    return new Response(JSON.stringify({
      strategy,
      model: 'google/gemini-2.5-pro',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Strategic Planner error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
