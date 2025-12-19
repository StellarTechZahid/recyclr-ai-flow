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
      content, 
      contentType,
      targetEmotion,
      platform 
    } = await req.json();

    console.log('Emotional optimization for:', targetEmotion);

    const systemPrompt = `You are an expert copywriter specializing in emotional impact and persuasion psychology. Your task is to rewrite content to evoke stronger emotional responses while maintaining authenticity.`;

    const emotionStrategies: Record<string, string> = {
      curiosity: 'Use open loops, intriguing questions, unexpected angles, and information gaps',
      urgency: 'Create time pressure, scarcity, FOMO, and immediate action triggers',
      joy: 'Use positive language, celebration, humor, and feel-good moments',
      inspiration: 'Use aspirational language, success stories, and motivational triggers',
      trust: 'Use social proof, authority, transparency, and reliability signals',
      fear: 'Highlight risks of inaction, consequences, and what they might miss',
      surprise: 'Use unexpected twists, counterintuitive insights, and pattern interrupts',
      empathy: 'Use relatable struggles, shared experiences, and "I understand" moments'
    };

    const userPrompt = `Optimize this ${contentType || 'content'} for ${platform || 'social media'} to evoke ${targetEmotion || 'curiosity'}:

Original Content:
${content}

Strategy: ${emotionStrategies[targetEmotion || 'curiosity']}

Provide:
1. Rewritten content optimized for emotional impact
2. Emotional analysis of original vs optimized
3. Specific techniques used
4. Predicted engagement lift

Return JSON:
{
  "optimizedContent": "The rewritten content",
  "emotionalAnalysis": {
    "original": {
      "dominantEmotion": "",
      "intensity": 1-10,
      "weaknesses": []
    },
    "optimized": {
      "dominantEmotion": "",
      "intensity": 1-10,
      "improvements": []
    }
  },
  "techniquesUsed": [
    {"technique": "", "example": "", "purpose": ""}
  ],
  "predictedLift": {
    "engagement": "+X%",
    "clicks": "+X%",
    "shares": "+X%"
  },
  "alternativeVersions": [
    {"emotion": "", "content": ""}
  ]
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
        temperature: 0.8,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`Emotion API error: ${response.status}`);
    }

    const result = await response.json();
    let responseContent = result.choices?.[0]?.message?.content || '';

    let optimized;
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimized = JSON.parse(jsonMatch[0]);
      } else {
        optimized = { optimizedContent: responseContent };
      }
    } catch {
      optimized = { optimizedContent: responseContent };
    }

    console.log('Emotional optimization complete');

    return new Response(JSON.stringify({
      ...optimized,
      targetEmotion,
      model: 'gpt-oss-120b'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Emotion optimizer error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
