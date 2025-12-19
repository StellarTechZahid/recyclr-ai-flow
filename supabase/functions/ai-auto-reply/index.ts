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
    const apiKey = Deno.env.get('GROQ_GPT_OSS_20B_KEY');
    if (!apiKey) {
      throw new Error('GROQ_GPT_OSS_20B_KEY not configured');
    }

    const { 
      comment, 
      context, 
      brandVoice, 
      responseType,
      platform
    } = await req.json();

    console.log('Auto-reply generation for platform:', platform);

    const guardKey = Deno.env.get('GROQ_LLAMA_GUARD_KEY');
    
    // First check if the comment is safe to respond to
    if (guardKey) {
      const moderationResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${guardKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-guard-3-8b',
          messages: [
            { role: 'user', content: `Check if this comment is safe: ${comment}` }
          ],
          temperature: 0.1,
          max_tokens: 256,
        }),
      });

      if (moderationResponse.ok) {
        const modResult = await moderationResponse.json();
        const modContent = modResult.choices?.[0]?.message?.content || '';
        if (modContent.toLowerCase().includes('unsafe')) {
          return new Response(JSON.stringify({
            reply: null,
            flagged: true,
            reason: 'Comment flagged as potentially unsafe',
            model: 'llama-guard-3-8b'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    let systemPrompt = `You are a social media community manager. Generate authentic, engaging replies that build relationships.`;
    
    if (brandVoice) {
      systemPrompt += `\n\nBrand Voice: ${JSON.stringify(brandVoice)}`;
    }

    const typeInstructions: Record<string, string> = {
      'thank': 'Thank them warmly and encourage further engagement',
      'question': 'Answer their question helpfully and invite follow-up',
      'complaint': 'Acknowledge their concern, apologize if appropriate, offer help',
      'praise': 'Thank them and share their enthusiasm',
      'general': 'Engage naturally and keep the conversation going'
    };

    const userPrompt = `Generate a reply to this ${platform || 'social media'} comment:

Comment: "${comment}"
${context ? `Context: ${context}` : ''}
Response Type: ${responseType || 'general'}
Instructions: ${typeInstructions[responseType || 'general']}

Requirements:
- Keep it authentic and human-sounding
- Match the platform's style (${platform || 'general'})
- Be concise (1-2 sentences usually)
- Include emoji if appropriate for the platform
- Never be defensive or argumentative

Return JSON:
{
  "reply": "Your reply here",
  "sentiment": "positive/neutral/empathetic",
  "suggestedEmojis": ["🙏", "❤️"],
  "alternativeReplies": ["Alt 1", "Alt 2"]
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      throw new Error(`Reply API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || '';

    let replyData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        replyData = JSON.parse(jsonMatch[0]);
      } else {
        replyData = { reply: content };
      }
    } catch {
      replyData = { reply: content };
    }

    console.log('Reply generated:', replyData.reply?.substring(0, 50));

    return new Response(JSON.stringify({
      ...replyData,
      flagged: false,
      model: 'gpt-oss-20b'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Auto-reply error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
