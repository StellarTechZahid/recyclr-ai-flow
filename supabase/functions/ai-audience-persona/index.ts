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
      engagementData, 
      comments, 
      demographics,
      platforms,
      niche
    } = await req.json();

    console.log('Audience persona generation for niche:', niche);

    const systemPrompt = `You are an expert audience analyst and persona builder. Create detailed, actionable audience personas based on engagement data and interactions.`;

    const userPrompt = `Analyze this audience data and create detailed personas:

Engagement Data:
${JSON.stringify(engagementData || {}, null, 2)}

Sample Comments/Interactions:
${comments?.slice(0, 20)?.join('\n') || 'No comments provided'}

Demographics:
${JSON.stringify(demographics || {}, null, 2)}

Platforms: ${platforms?.join(', ') || 'All platforms'}
Niche: ${niche || 'General'}

Create 3-5 detailed audience personas with:

{
  "personas": [
    {
      "name": "Persona name (e.g., 'Startup Steve')",
      "demographics": {
        "ageRange": "",
        "gender": "",
        "location": "",
        "occupation": "",
        "income": ""
      },
      "psychographics": {
        "values": [],
        "interests": [],
        "painPoints": [],
        "goals": [],
        "fears": []
      },
      "behaviorPatterns": {
        "activeHours": "",
        "preferredPlatforms": [],
        "contentPreferences": [],
        "engagementStyle": "",
        "purchaseBehavior": ""
      },
      "contentStrategy": {
        "topicsTheyLove": [],
        "formatsTheyPrefer": [],
        "toneTheyRespondTo": "",
        "ctasTheyClickOn": [],
        "hashtagsTheyFollow": []
      },
      "percentage": 0
    }
  ],
  "insights": {
    "bestPostingTimes": {},
    "topPerformingContentTypes": [],
    "engagementTriggers": [],
    "conversionDrivers": []
  },
  "recommendations": []
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
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Persona API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || '';

    let personas;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        personas = JSON.parse(jsonMatch[0]);
      } else {
        personas = { raw: content };
      }
    } catch {
      personas = { raw: content };
    }

    console.log('Generated', personas.personas?.length || 0, 'personas');

    return new Response(JSON.stringify({
      ...personas,
      model: 'gpt-oss-120b',
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Persona error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
