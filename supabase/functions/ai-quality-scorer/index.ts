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

    const { content, platform, contentType } = await req.json();

    console.log('Quality Scoring for:', platform);

    const systemPrompt = `You are an elite AI Content Quality Scorer. You evaluate content before publishing to predict and improve performance.

QUALITY SCORING MATRIX (Score each 1-100):

1. HOOK STRENGTH (First 3 seconds/lines):
- Pattern interrupt power
- Curiosity generation
- Relevance signal
- Emotional trigger
SCORE: X/100

2. CLARITY SCORE:
- Message simplicity
- Jargon avoidance
- Reading level appropriateness
- Logical flow
SCORE: X/100

3. VALUE DENSITY:
- Insight per paragraph ratio
- Actionable takeaways
- Unique perspectives
- Problem-solution clarity
SCORE: X/100

4. EMOTIONAL ENGAGEMENT:
- Story element presence
- Relatability factor
- Aspiration trigger
- Pain point addressing
SCORE: X/100

5. CTA EFFECTIVENESS:
- Action clarity
- Urgency creation
- Benefit visibility
- Friction reduction
SCORE: X/100

6. PLATFORM OPTIMIZATION:
- Length optimization
- Format adherence
- Algorithm alignment
- Hashtag/keyword usage
SCORE: X/100

7. SHAREABILITY FACTOR:
- Social currency (makes sharer look good)
- Practical value
- Emotional resonance
- Conversation starter
SCORE: X/100

OVERALL SCORE: X/100

IMPROVEMENT PRIORITIES:
List top 3 specific improvements that would most increase the score.

REWRITTEN VERSION:
Provide an optimized version implementing the improvements.`;

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
          { role: 'user', content: `Score this ${contentType || 'content'} for ${platform || 'social media'}:\n\n${content}` }
        ],
        temperature: 0.6,
        max_tokens: 2500,
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
    const scoring = result.choices?.[0]?.message?.content || '';

    // Extract overall score
    const scoreMatch = scoring.match(/OVERALL SCORE[:\s]*(\d+)/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

    console.log('Quality scoring complete, Overall:', overallScore);

    return new Response(JSON.stringify({
      scoring,
      overallScore,
      model: 'google/gemini-2.5-flash',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Quality Scorer error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
