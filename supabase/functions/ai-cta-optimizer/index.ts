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

    const { content, goal, platform, currentCta } = await req.json();

    console.log('CTA Optimization for goal:', goal);

    const systemPrompt = `You are a CTA (Call-to-Action) Optimization Expert. You craft CTAs that drive action while feeling natural and valuable.

CTA PSYCHOLOGY MATRIX:

1. SOFT CTA (Low commitment):
- "What do you think?"
- "Save this for later"
- "Follow for more"
Purpose: Build relationship, low friction

2. ENGAGEMENT CTA (Medium commitment):
- "Drop a 🔥 if you agree"
- "Tag someone who needs this"
- "Share in comments: your take?"
Purpose: Boost algorithm, community

3. CONVERSION CTA (High commitment):
- "Get the free guide [link]"
- "Book your call now"
- "Join 10,000+ subscribers"
Purpose: Direct action, measurable

4. CONVERSATIONAL CTA:
- "DM me 'strategy' for the template"
- "Comment 'YES' and I'll send you..."
Purpose: Personal connection, lead capture

5. URGENCY CTA:
- "Only 48 hours left"
- "First 100 get bonus"
- "Doors close Friday"
Purpose: Immediate action

6. VALUE-FIRST CTA:
- "Reply with your biggest challenge"
- "What topic should I cover next?"
Purpose: Audience research, engagement

CTA OPTIMIZATION PRINCIPLES:
- One clear action (not multiple)
- Benefit visible (what's in it for them)
- Friction minimized (easy to do)
- Appropriate to content value delivered
- Platform-native format

OUTPUT FORMAT:
1. CTA ANALYSIS: Review current CTA effectiveness
2. OPTIMIZED CTA OPTIONS: 5 versions ranked by predicted effectiveness
3. A/B TEST RECOMMENDATIONS: Which CTAs to test
4. PLACEMENT ADVICE: Where in content for maximum impact`;

    const userPrompt = `Optimize CTAs for this content:

CONTENT:
${content}

GOAL: ${goal || 'Engagement'}
PLATFORM: ${platform || 'Social media'}
${currentCta ? `CURRENT CTA: ${currentCta}` : ''}

Generate optimized CTA options.`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    const optimization = result.choices?.[0]?.message?.content || '';

    console.log('CTA optimization complete');

    return new Response(JSON.stringify({
      optimization,
      goal,
      platform,
      model: 'google/gemini-2.5-flash',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('CTA Optimizer error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
