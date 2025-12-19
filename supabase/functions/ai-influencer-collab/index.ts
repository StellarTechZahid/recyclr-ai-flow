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
    const apiKey = Deno.env.get('GROQ_GPT_OSS_120B_KEY');
    if (!apiKey) {
      throw new Error('GROQ_GPT_OSS_120B_KEY not configured');
    }

    const { 
      niche, 
      followerRange,
      platform,
      campaignGoal,
      brandInfo
    } = await req.json();

    console.log('Influencer analysis for niche:', niche);

    const systemPrompt = `You are an influencer marketing expert. Identify ideal influencer profiles and create personalized outreach strategies that get responses.`;

    const userPrompt = `Find and analyze influencers for a collaboration:

Niche: ${niche}
Platform: ${platform || 'Instagram'}
Follower Range: ${followerRange || '10K-100K'}
Campaign Goal: ${campaignGoal || 'Brand awareness'}
Brand Info: ${brandInfo || 'Not specified'}

Provide:
1. Ideal influencer profile characteristics
2. Sample outreach templates
3. Collaboration ideas
4. Negotiation tips
5. Red flags to watch for

Return JSON:
{
  "idealProfile": {
    "followerRange": "",
    "engagementRate": "",
    "contentStyle": [],
    "audienceDemographics": {},
    "mustHaves": [],
    "niceToHaves": []
  },
  "searchCriteria": {
    "hashtags": [],
    "keywords": [],
    "competitors": [],
    "platforms": []
  },
  "outreachTemplates": [
    {
      "type": "initial/followup/negotiation",
      "subject": "",
      "message": "",
      "personalizationTips": []
    }
  ],
  "collaborationIdeas": [
    {
      "type": "",
      "description": "",
      "expectedROI": "",
      "effort": "low/medium/high"
    }
  ],
  "negotiationTips": [],
  "redFlags": [],
  "budgetGuidelines": {
    "micro": "",
    "mid": "",
    "macro": ""
  },
  "successMetrics": []
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3072,
      }),
    });

    if (!response.ok) {
      throw new Error(`Influencer API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || '';

    let influencerData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        influencerData = JSON.parse(jsonMatch[0]);
      } else {
        influencerData = { raw: content };
      }
    } catch {
      influencerData = { raw: content };
    }

    console.log('Influencer analysis complete');

    return new Response(JSON.stringify({
      ...influencerData,
      niche,
      platform,
      model: 'gpt-oss-120b'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Influencer error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
