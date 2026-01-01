import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { 
      topic,
      platform,
      audience,
      contentType,
      count
    } = await req.json();

    console.log('Viral hook generation for topic:', topic, 'user:', user.id);

    const systemPrompt = `You are a viral content expert who has analyzed millions of high-performing posts. You understand the psychology of why people click, engage, and share. Generate hooks that are proven to capture attention.`;

    const platformPatterns: Record<string, string> = {
      twitter: 'Short, punchy, controversial or curiosity-inducing. Use "This", "The", "I", "Why", "How"',
      linkedin: 'Professional but bold. Use contrarian takes, career insights, industry revelations',
      instagram: 'Visual storytelling hooks. Use "POV:", "The truth about", "What no one tells you"',
      tiktok: 'Ultra-short, trend-aware. Use "Wait for it", "No one talks about", "The way that"',
      youtube: 'Clickable but honest. Use numbers, "How to", "Why I", time-based hooks',
      blog: 'SEO-friendly but compelling. Use "Ultimate guide", "X ways", "The complete"'
    };

    const userPrompt = `Generate ${count || 10} viral hooks for:

Topic: ${topic}
Platform: ${platform || 'twitter'}
Audience: ${audience || 'general'}
Content Type: ${contentType || 'post'}

Platform Pattern: ${platformPatterns[platform || 'twitter']}

For each hook, provide:
1. The hook itself
2. Why it works psychologically
3. Predicted engagement score (1-10)
4. Best time to post
5. Suggested follow-up content

Return JSON:
{
  "hooks": [
    {
      "hook": "The hook text",
      "psychology": "Why this works",
      "engagementScore": 8,
      "emotionalTrigger": "curiosity/fear/surprise/etc",
      "bestTime": "Tuesday 9am",
      "followUp": "Suggested follow-up angle",
      "variations": ["Variation 1", "Variation 2"]
    }
  ],
  "topPick": {
    "hookIndex": 0,
    "reason": "Why this is the best"
  },
  "abtestSuggestion": {
    "hookA": 0,
    "hookB": 1,
    "hypothesis": "What we're testing"
  },
  "generalTips": []
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
        temperature: 0.9,
        max_tokens: 3072,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Hook API error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Hook API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || '';

    let hooks;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        hooks = JSON.parse(jsonMatch[0]);
      } else {
        hooks = { raw: content };
      }
    } catch {
      hooks = { raw: content };
    }

    console.log('Generated', hooks.hooks?.length || 0, 'hooks');

    return new Response(JSON.stringify({
      ...hooks,
      topic,
      platform,
      model: 'google/gemini-2.5-flash'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Hook generator error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
