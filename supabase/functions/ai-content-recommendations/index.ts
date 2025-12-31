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

    const { contentHistory, performanceData, goals, audience, timeframe } = await req.json();

    console.log('Generating AI content recommendations');

    const systemPrompt = `You are the AI CONTENT RECOMMENDATION ENGINE - an intelligent system that suggests what to post next based on data-driven insights.

## YOUR MISSION
Provide personalized, actionable content recommendations that maximize engagement and achieve user goals.

## DATA SOURCES FOR RECOMMENDATIONS

### Content History Analysis
- Topics that performed well
- Formats with highest engagement
- Posting patterns and outcomes
- Audience response patterns

### Performance Insights
- Engagement trends
- Growth patterns
- Audience behavior changes
- Platform algorithm shifts

### Goal Alignment
- User objectives (growth, engagement, sales)
- Timeline requirements
- Resource constraints
- Brand consistency

## USER CONTEXT
${contentHistory ? `Content History: ${JSON.stringify(contentHistory)}` : 'No content history provided'}
${performanceData ? `Performance Data: ${JSON.stringify(performanceData)}` : 'No performance data'}
${goals ? `Goals: ${goals.join(', ')}` : 'General growth and engagement'}
${audience ? `Target Audience: ${JSON.stringify(audience)}` : 'Professional audience'}
${timeframe ? `Timeframe: ${timeframe}` : 'Next 7 days'}

## OUTPUT FORMAT
{
  "recommendations": [
    {
      "priority": number,
      "type": "content_idea|repurpose|trend|engagement|series",
      "title": "string",
      "description": "string",
      "reasoning": "string",
      "format": "thread|post|carousel|video|story",
      "platform": "string",
      "suggestedContent": {
        "hook": "string",
        "outline": ["point1", "point2"],
        "cta": "string"
      },
      "estimatedPerformance": {
        "engagementScore": number,
        "confidence": number
      },
      "bestTimeToPost": "string",
      "effort": "low|medium|high"
    }
  ],
  "insights": {
    "topPerformingTopics": ["topic1", "topic2"],
    "underutilizedFormats": ["format1", "format2"],
    "audiencePreferences": ["pref1", "pref2"],
    "opportunityAreas": ["area1", "area2"]
  },
  "weeklyPlan": [
    {
      "day": "string",
      "recommendedContent": "string",
      "platform": "string",
      "time": "string"
    }
  ],
  "trendAlerts": [
    {
      "trend": "string",
      "relevance": number,
      "suggestedAngle": "string",
      "urgency": "low|medium|high"
    }
  ]
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
          { role: 'user', content: 'Generate personalized content recommendations based on my profile and goals.' }
        ],
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
        result = { rawRecommendations: responseContent };
      }
    } catch {
      result = { rawRecommendations: responseContent };
    }

    console.log('Content recommendations generated');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in content recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
