import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
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
      console.error('Auth error:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI Accessibility called by user:', user.id);

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { imageBase64, imageUrl, platform } = await req.json();

    console.log('Generating accessibility content for platform:', platform);

    // Step 1: Analyze image with vision model
    const imageContent = imageBase64 
      ? { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      : { type: "image_url", image_url: { url: imageUrl } };

    const visionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [{
          role: 'user',
          content: [
            { 
              type: "text", 
              text: `Describe this image in detail for accessibility purposes. Include:
1. Main subject and action
2. People (appearance, expressions, positioning)
3. Background and setting
4. Colors and visual elements
5. Text visible in the image
6. Emotional tone and mood
7. Any important details a visually impaired person should know

Be descriptive but concise.`
            },
            imageContent
          ]
        }],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!visionResponse.ok) {
      const error = await visionResponse.text();
      console.error('Vision API error:', error);
      
      if (visionResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Vision API error: ${visionResponse.status}`);
    }

    const visionResult = await visionResponse.json();
    const imageDescription = visionResult.choices?.[0]?.message?.content || '';

    // Step 2: Generate accessibility content
    const accessibilityResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an accessibility expert. Create accessible content that helps all users engage with visual content.'
          },
          {
            role: 'user',
            content: `Based on this image description, create accessibility content for ${platform || 'social media'}:

Image Description:
${imageDescription}

Generate JSON:
{
  "altText": "Concise alt text (max 125 chars for Twitter, 2200 for Instagram)",
  "longDescription": "Detailed description for screen readers",
  "audioDescription": "Script for audio description/voiceover",
  "captions": {
    "short": "1-line caption",
    "medium": "2-3 sentence caption",
    "long": "Full paragraph caption"
  },
  "hashtags": ["#accessibility", "#a11y"],
  "seoKeywords": [],
  "emojiDescription": "🖼️ Description using emojis for quick understanding"
}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1536,
      }),
    });

    if (!accessibilityResponse.ok) {
      const error = await accessibilityResponse.text();
      console.error('Accessibility API error:', error);
      throw new Error(`Accessibility API error: ${accessibilityResponse.status}`);
    }

    const accessResult = await accessibilityResponse.json();
    let content = accessResult.choices?.[0]?.message?.content || '';

    let accessibility;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        accessibility = JSON.parse(jsonMatch[0]);
      } else {
        accessibility = { altText: content };
      }
    } catch {
      accessibility = { altText: content };
    }

    console.log('Accessibility content generated');

    return new Response(JSON.stringify({
      ...accessibility,
      imageDescription,
      platform,
      models: ['google/gemini-2.5-pro', 'google/gemini-2.5-flash']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Accessibility error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
