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

    const { content, checkBrandSafety } = await req.json();

    if (!content) {
      throw new Error('No content provided');
    }

    console.log('Content moderation called, content length:', content.length, 'user:', user.id);

    const systemPrompt = checkBrandSafety 
      ? `You are a content safety and brand safety moderator. Analyze the following content for:
1. Harmful or unsafe content (violence, hate speech, harassment)
2. Brand safety issues (controversial topics, inappropriate language)
3. Compliance concerns (misinformation, legal issues)

Respond with a JSON object containing:
- safe: boolean (true if content is safe)
- issues: array of strings (any issues found)
- brandSafe: boolean (true if brand safe)
- recommendations: array of strings (how to improve)
- confidence: number (0-1, your confidence level)`
      : `You are a content safety moderator. Analyze the content for safety issues.

Respond with a JSON object:
- safe: boolean
- category: string (if unsafe, the category)
- explanation: string`;

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
          { role: 'user', content: `Analyze this content: ${content}` }
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Moderation API error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Moderation API error: ${response.status}`);
    }

    const result = await response.json();
    let analysis = result.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { safe: !analysis.toLowerCase().includes('unsafe'), raw: analysis };
      }
    } catch {
      parsed = { safe: !analysis.toLowerCase().includes('unsafe'), raw: analysis };
    }

    console.log('Moderation complete:', parsed.safe ? 'safe' : 'flagged');

    return new Response(JSON.stringify({
      ...parsed,
      model: 'google/gemini-2.5-flash'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
