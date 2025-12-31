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

    const { content, platform, audience, historicalPerformance, postingTime } = await req.json();

    if (!content) {
      throw new Error('Content is required');
    }

    console.log('Generating predictive performance score');

    const systemPrompt = `You are the PREDICTIVE PERFORMANCE SCORER - an AI that forecasts content engagement before publishing.

## YOUR EXPERTISE
1. **Multi-Factor Analysis**: Evaluate all elements affecting performance
2. **Platform Modeling**: Apply platform-specific engagement patterns
3. **Audience Matching**: Assess content-audience fit
4. **Timing Intelligence**: Factor in temporal performance patterns

## PREDICTION FACTORS

### Content Quality (40%)
- Hook strength
- Value density
- Originality
- Clarity
- Emotional resonance

### Platform Fit (25%)
- Format optimization
- Length appropriateness
- Feature utilization
- Algorithm alignment

### Audience Match (20%)
- Topic relevance
- Tone appropriateness
- Pain point addressing
- Interest alignment

### Timing (15%)
- Day of week impact
- Time of day optimization
- Trend alignment
- Competition assessment

## PLATFORM
${platform || 'linkedin'}

## AUDIENCE PROFILE
${audience ? JSON.stringify(audience) : 'General professional audience'}

## HISTORICAL PERFORMANCE
${historicalPerformance ? JSON.stringify(historicalPerformance) : 'No historical data'}

## PROPOSED POSTING TIME
${postingTime || 'Not specified'}

## OUTPUT FORMAT
{
  "predictedPerformance": {
    "overallScore": number,
    "confidence": number,
    "percentile": number,
    "category": "likely_viral|high_performer|above_average|average|below_average|needs_work"
  },
  "metricPredictions": {
    "views": { "min": number, "expected": number, "max": number },
    "likes": { "min": number, "expected": number, "max": number },
    "comments": { "min": number, "expected": number, "max": number },
    "shares": { "min": number, "expected": number, "max": number },
    "engagementRate": { "min": number, "expected": number, "max": number }
  },
  "factorBreakdown": {
    "contentQuality": { "score": number, "reasoning": "string" },
    "platformFit": { "score": number, "reasoning": "string" },
    "audienceMatch": { "score": number, "reasoning": "string" },
    "timing": { "score": number, "reasoning": "string" }
  },
  "optimizationOpportunities": [
    {
      "change": "string",
      "currentScore": number,
      "potentialScore": number,
      "effort": "low|medium|high",
      "implementation": "string"
    }
  ],
  "riskFactors": [
    { "risk": "string", "likelihood": "low|medium|high", "mitigation": "string" }
  ],
  "recommendation": {
    "shouldPublish": boolean,
    "suggestedChanges": ["change1", "change2"],
    "optimalPostingTime": "string",
    "finalAssessment": "string"
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
          { role: 'user', content: `Predict the performance of this content:\n\n${content}` }
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
        result = { rawPrediction: responseContent };
      }
    } catch {
      result = { rawPrediction: responseContent };
    }

    console.log('Predictive scoring complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in predictive scoring:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
