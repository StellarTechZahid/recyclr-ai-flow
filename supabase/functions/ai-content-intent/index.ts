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

    const { content, contentType } = await req.json();

    console.log('Content Intent Analysis for:', contentType);

    const systemPrompt = `You are an expert Content Intent Analyzer. Your role is to deeply understand the strategic purpose behind any content.

ANALYSIS FRAMEWORK:

1. PRIMARY INTENT CLASSIFICATION:
- Awareness: Building brand/topic recognition
- Consideration: Educating potential customers
- Conversion: Driving specific actions
- Retention: Keeping existing audience engaged
- Authority: Establishing thought leadership
- Community: Building relationships

2. TARGET AUDIENCE ANALYSIS:
- Demographics indicators
- Psychographic markers
- Pain points addressed
- Aspirations targeted

3. EMOTIONAL ARCHITECTURE:
- Primary emotion triggered
- Secondary emotions layered
- Emotional journey mapped

4. FUNNEL POSITIONING:
- Top of funnel (TOFU)
- Middle of funnel (MOFU)
- Bottom of funnel (BOFU)

5. CONTENT DNA:
- Core message
- Supporting arguments
- Call-to-action type
- Value proposition

6. REPURPOSING INTELLIGENCE:
Based on intent, suggest optimal repurposing strategies.

Respond in JSON format with detailed analysis.`;

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
          { role: 'user', content: `Analyze the intent behind this ${contentType || 'content'}:\n\n${content}` }
        ],
        temperature: 0.7,
        max_tokens: 2048,
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
    const analysisContent = result.choices?.[0]?.message?.content || '';

    // Try to parse as JSON
    let analysis;
    try {
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { rawAnalysis: analysisContent };
    } catch {
      analysis = { rawAnalysis: analysisContent };
    }

    console.log('Intent analysis complete');

    return new Response(JSON.stringify({
      analysis,
      model: 'google/gemini-2.5-flash',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content Intent error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
