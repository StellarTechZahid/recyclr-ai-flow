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
      sourceContent, 
      platforms, 
      duration, 
      brandVoice, 
      campaignGoal,
      startDate 
    } = await req.json();

    console.log('Smart campaign generation for', duration, 'days across', platforms);

    const systemPrompt = `You are an expert content strategist and campaign planner. Create comprehensive, actionable content campaigns that maximize engagement across platforms.`;

    const userPrompt = `Create a ${duration || 30}-day content campaign starting ${startDate || 'today'}.

Source Content:
${sourceContent}

Platforms: ${platforms?.join(', ') || 'Twitter, LinkedIn, Instagram, TikTok, Facebook'}
Campaign Goal: ${campaignGoal || 'Maximize engagement and brand awareness'}
${brandVoice ? `Brand Voice: ${JSON.stringify(brandVoice)}` : ''}

Generate a complete campaign with:
1. Daily content calendar with specific posts for each platform
2. Optimal posting times for each day/platform
3. Content variations (reels, tweets, carousels, stories)
4. Hashtag strategies
5. Engagement hooks and CTAs
6. Cross-platform linking strategy

Return JSON:
{
  "campaignOverview": {
    "goal": "",
    "duration": ${duration || 30},
    "platforms": [],
    "keyThemes": [],
    "expectedOutcomes": []
  },
  "contentCalendar": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "posts": [
        {
          "platform": "",
          "type": "tweet/post/reel/story/carousel",
          "content": "",
          "hashtags": [],
          "optimalTime": "",
          "cta": "",
          "linkedTo": ""
        }
      ]
    }
  ],
  "weeklyThemes": [
    {"week": 1, "theme": "", "focus": ""}
  ],
  "contentMix": {
    "educational": 0,
    "promotional": 0,
    "entertaining": 0,
    "engaging": 0
  },
  "kpis": [
    {"metric": "", "target": "", "platform": ""}
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Campaign API error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Campaign API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || '';

    let campaign;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        campaign = JSON.parse(jsonMatch[0]);
      } else {
        campaign = { raw: content };
      }
    } catch {
      campaign = { raw: content };
    }

    console.log('Campaign generated with', campaign.contentCalendar?.length || 0, 'days');

    return new Response(JSON.stringify({
      ...campaign,
      model: 'google/gemini-2.5-flash',
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Campaign error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
