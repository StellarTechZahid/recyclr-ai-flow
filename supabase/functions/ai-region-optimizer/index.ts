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

    const { content, targetRegion, platform, optimizationGoal } = await req.json();

    if (!content || !targetRegion) {
      throw new Error('Content and target region are required');
    }

    console.log('Optimizing content for region:', targetRegion);

    const systemPrompt = `You are the REGION-SPECIFIC ENGAGEMENT OPTIMIZER - an AI expert at maximizing engagement for specific geographic audiences.

## YOUR EXPERTISE
1. **Regional Behavior**: Deep understanding of how different regions engage with content
2. **Platform Nuances**: How platform usage varies by region
3. **Timing Intelligence**: Optimal posting times by region
4. **Format Preferences**: What content types work best where

## REGIONAL ENGAGEMENT PATTERNS

### US/North America
- Direct, value-focused messaging
- Emojis: moderate use, casual
- CTA style: clear and actionable
- Peak times: 9-11am, 7-9pm EST

### UK/Europe
- Slightly more formal, witty appreciated
- Emojis: conservative use
- CTA style: less pushy, suggestion-based
- Peak times: 8-10am, 5-7pm local

### India/South Asia
- Relationship-focused, inspirational content
- Emojis: high usage, expressive
- CTA style: community-oriented
- Peak times: 11am-1pm, 8-10pm IST

### Middle East/Gulf
- Respectful, aspirational messaging
- Emojis: moderate, respectful
- CTA style: value-emphasis
- Peak times: 9-11am, 9-11pm local

### East Asia
- Quality and detail-focused
- Emojis: platform-specific stickers preferred
- CTA style: informational
- Peak times: varies significantly

## TARGET REGION
${targetRegion}

## PLATFORM
${platform || 'linkedin'}

## OPTIMIZATION GOAL
${optimizationGoal || 'engagement'}

## OUTPUT FORMAT
{
  "regionProfile": {
    "region": "string",
    "engagementStyle": "string",
    "contentPreferences": ["pref1", "pref2"],
    "tabooTopics": ["topic1", "topic2"],
    "optimalLength": "short|medium|long"
  },
  "optimizedContent": {
    "main": "string",
    "alternateVersions": ["v1", "v2"],
    "headline": "string"
  },
  "engagement": {
    "emojiStrategy": "string",
    "recommendedEmojis": ["emoji1", "emoji2"],
    "hashtagStrategy": ["tag1", "tag2"],
    "ctaStyle": "string",
    "cta": "string"
  },
  "timing": {
    "optimalDays": ["day1", "day2"],
    "optimalTimes": ["time1", "time2"],
    "timezone": "string",
    "reasoning": "string"
  },
  "predictions": {
    "expectedEngagementLift": "string",
    "confidenceScore": number,
    "risks": ["risk1"] or null
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
          { role: 'user', content: `Optimize this content for ${targetRegion}:\n\n${content}` }
        ],
        temperature: 0.6,
        max_tokens: 3000,
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

    console.log('Region optimization complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in region optimizer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
