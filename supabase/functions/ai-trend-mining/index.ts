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

    const { niche, platforms, existingContent, region } = await req.json();

    console.log('Trend mining for niche:', niche, 'platforms:', platforms);

    const systemPrompt = `You are an expert social media trend analyst with real-time knowledge of trending topics. Your task is to:

1. Identify current trending topics, hashtags, and conversations in the specified niche
2. Analyze which trends are gaining momentum
3. Suggest how existing content can be repurposed to match current trends
4. Provide specific hashtags and posting strategies

Always provide actionable, specific recommendations with actual hashtag examples.`;

    const userPrompt = `Analyze current trends for:
- Niche/Industry: ${niche}
- Platforms: ${platforms?.join(', ') || 'Twitter, LinkedIn, Instagram, TikTok'}
${region ? `- Region/Market: ${region}` : ''}

${existingContent ? `
The user has this existing content that could be repurposed:
"${existingContent.substring(0, 500)}..."

Suggest how to adapt this content to current trends.
` : ''}

Provide a structured analysis with:
1. Top 5 trending topics in this niche right now
2. Trending hashtags for each platform
3. Content angle suggestions that align with trends
4. Best posting times and engagement strategies
5. Specific repurposing ideas

Format as JSON:
{
  "trendingTopics": [{"topic": "", "momentum": "rising/stable/falling", "relevance": 1-10}],
  "hashtags": {"twitter": [], "linkedin": [], "instagram": [], "tiktok": []},
  "contentAngles": [{"angle": "", "platform": "", "why": ""}],
  "repurposingIdeas": [{"idea": "", "originalContent": "", "trendConnection": ""}],
  "bestTimes": {"twitter": "", "linkedin": "", "instagram": "", "tiktok": ""},
  "emergingOpportunities": []
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Trend mining API error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Trend mining API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || '';

    // Try to parse JSON from response
    let trendData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        trendData = JSON.parse(jsonMatch[0]);
      } else {
        trendData = { raw: content };
      }
    } catch {
      trendData = { raw: content };
    }

    console.log('Trend mining complete');

    return new Response(JSON.stringify({
      ...trendData,
      model: 'google/gemini-2.5-flash',
      analyzedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Trend mining error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
