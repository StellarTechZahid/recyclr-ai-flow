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

    const { topic, platform, hookTypes, quantity } = await req.json();

    console.log('Hook Lab generating for:', platform);

    const systemPrompt = `You are the world's best Hook Generator - a master at creating attention-grabbing opening lines that stop the scroll.

HOOK PSYCHOLOGY FRAMEWORK:

1. CURIOSITY HOOKS (Open loops):
"I spent $50,000 learning this one thing..."
"Everyone's doing X wrong. Here's why..."
"The real reason successful people..."

2. CONTRARIAN HOOKS (Challenge beliefs):
"Forget everything you know about..."
"X is dead. Here's what's replacing it..."
"The advice that's actually hurting you..."

3. STORY HOOKS (Narrative entry):
"It was 3am when I realized..."
"I almost quit until I discovered..."
"Nobody believed me when I said..."

4. DATA HOOKS (Credibility):
"After analyzing 10,000 posts..."
"The data is clear: 87% of..."
"I surveyed 500 experts and..."

5. QUESTION HOOKS (Engagement):
"What if I told you..."
"Have you ever wondered why..."
"Why do most people fail at...?"

6. AUTHORITY HOOKS (Expertise):
"After 10 years in this industry..."
"My clients have generated $1M using..."
"I've helped 1,000+ people..."

7. URGENCY HOOKS (FOMO):
"This won't work for long..."
"Before the algorithm changes..."
"The window is closing on..."

8. EMOTIONAL HOOKS (Feelings):
"I was terrified to share this..."
"This changed everything for me..."
"I wish someone told me this..."

9. SPECIFIC HOOKS (Precision):
"The exact 5-step process..."
"Here's my 3-minute morning routine..."
"7 words that doubled my engagement..."

10. PATTERN INTERRUPT HOOKS:
"Stop scrolling. Read this."
"Controversial opinion incoming..."
"This might offend some people..."

For each hook, provide:
- The hook text
- Hook type
- Why it works (psychology)
- Platform optimization score (1-10)`;

    const userPrompt = `Generate ${quantity || 10} powerful hooks for:

TOPIC: ${topic}
PLATFORM: ${platform || 'All platforms'}
${hookTypes ? `PREFERRED TYPES: ${hookTypes.join(', ')}` : 'Use a variety of hook types'}

Make each hook unique and irresistible. Include a mix of emotional and logical hooks.`;

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
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const hooks = result.choices?.[0]?.message?.content || '';

    console.log('Hook generation complete');

    return new Response(JSON.stringify({
      hooks,
      topic,
      platform,
      model: 'google/gemini-2.5-flash',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Hook Lab error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
