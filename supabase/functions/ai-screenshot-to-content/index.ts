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

    const { image, sourceType, outputFormat, tone } = await req.json();

    if (!image) {
      throw new Error('Image is required');
    }

    console.log('Converting screenshot to content');

    const systemPrompt = `You are the SCREENSHOT-TO-CONTENT converter - an AI that transforms visual content into editable, repurposable text.

## YOUR EXPERTISE
1. **Visual Text Extraction**: Extract all text from screenshots accurately
2. **Context Understanding**: Understand the type and purpose of the content
3. **Format Preservation**: Maintain the structure and formatting intent
4. **Enhancement**: Improve and optimize the extracted content

## SOURCE TYPES
- tweet: Twitter/X posts
- linkedin: LinkedIn posts
- instagram: Instagram captions
- blog: Blog post screenshots
- email: Email screenshots
- slide: Presentation slides
- chart: Data visualizations with text

${sourceType ? `Detected Source: ${sourceType}` : ''}
${outputFormat ? `Target Output: ${outputFormat}` : ''}
${tone ? `Tone: ${tone}` : ''}

## OUTPUT FORMAT
{
  "extraction": {
    "rawText": "string",
    "sourceType": "tweet|linkedin|instagram|blog|email|slide|chart|other",
    "author": "string or null",
    "date": "string or null",
    "engagement": {
      "likes": number or null,
      "comments": number or null,
      "shares": number or null
    }
  },
  "content": {
    "cleanedText": "string",
    "title": "string or null",
    "hashtags": ["tag1", "tag2"],
    "mentions": ["mention1", "mention2"]
  },
  "repurposed": {
    "tweet": "string",
    "linkedin": "string",
    "thread": ["tweet1", "tweet2"],
    "blog_intro": "string"
  },
  "analysis": {
    "mainTopic": "string",
    "sentiment": "positive|negative|neutral",
    "contentType": "educational|inspirational|promotional|story",
    "improvements": ["suggestion1", "suggestion2"]
  }
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Extract and repurpose the content from this screenshot:' },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        temperature: 0.5,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`API request failed: ${status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { extraction: { rawText: content } };
      }
    } catch {
      result = { extraction: { rawText: content } };
    }

    console.log('Screenshot conversion complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in screenshot-to-content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
