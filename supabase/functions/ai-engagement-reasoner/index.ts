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

    const { content, metrics, platform, historicalData, compareWith } = await req.json();

    if (!content) {
      throw new Error('Content is required');
    }

    console.log('Analyzing engagement reasoning');

    const systemPrompt = `You are the ENGAGEMENT REASONING ENGINE - an AI that provides deep, actionable explanations for why content performs the way it does.

## YOUR EXPERTISE
1. **Performance Attribution**: Identify specific elements driving success/failure
2. **Pattern Recognition**: Connect current performance to known engagement patterns
3. **Causal Analysis**: Distinguish correlation from causation
4. **Actionable Insights**: Provide specific, implementable recommendations

## ENGAGEMENT FACTORS TO ANALYZE

### Hook Quality
- First-line impact score
- Curiosity generation
- Pattern interrupt effectiveness
- Emotional trigger strength

### Content Structure
- Scannability
- Information density
- Narrative flow
- Value delivery timing

### Platform Fit
- Format optimization
- Length appropriateness
- Visual elements
- Hashtag/mention strategy

### Timing & Context
- Posting time effectiveness
- Current events relevance
- Trend alignment
- Audience availability

## PERFORMANCE DATA
${metrics ? JSON.stringify(metrics) : 'No metrics provided - analyze based on content quality'}

## PLATFORM
${platform || 'general'}

## HISTORICAL COMPARISON
${historicalData ? JSON.stringify(historicalData) : 'No historical data'}

## OUTPUT FORMAT
{
  "performanceAssessment": {
    "overallScore": number,
    "category": "viral|high|average|low|underperforming",
    "summary": "string"
  },
  "successFactors": [
    {
      "factor": "string",
      "impact": "high|medium|low",
      "explanation": "string",
      "evidence": "string"
    }
  ],
  "failureFactors": [
    {
      "factor": "string",
      "impact": "high|medium|low",
      "explanation": "string",
      "fix": "string"
    }
  ],
  "elementAnalysis": {
    "hook": { "score": number, "reasoning": "string" },
    "body": { "score": number, "reasoning": "string" },
    "cta": { "score": number, "reasoning": "string" },
    "format": { "score": number, "reasoning": "string" }
  },
  "audienceInsights": {
    "resonatedWith": ["segment1", "segment2"],
    "missedAudience": ["segment1"],
    "engagementPattern": "string"
  },
  "improvements": [
    {
      "priority": number,
      "change": "string",
      "expectedImpact": "string",
      "implementation": "string"
    }
  ],
  "replicableElements": {
    "keepDoing": ["element1", "element2"],
    "avoid": ["element1"],
    "test": ["element1", "element2"]
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
          { role: 'user', content: `Analyze and explain the engagement potential/performance of this content:\n\n${content}` }
        ],
        temperature: 0.5,
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
        result = { rawAnalysis: responseContent };
      }
    } catch {
      result = { rawAnalysis: responseContent };
    }

    console.log('Engagement reasoning complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in engagement reasoner:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
