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

    const { content, formats, tone } = await req.json();

    console.log('Infinite Format Generation for formats:', formats);

    const formatInstructions: Record<string, string> = {
      thread: `TWITTER/X THREAD (8-12 tweets):
- First tweet: Powerful hook with curiosity gap
- Each tweet: One clear point, ends with momentum
- Use numbers, contrasts, and pattern interrupts
- Final tweet: CTA + retweet prompt`,

      linkedin_post: `LINKEDIN POST:
- Hook line that stops scrolling
- Personal story or insight
- Actionable takeaways
- Engagement question at end
- Relevant hashtags (3-5)`,

      instagram_carousel: `INSTAGRAM CAROUSEL (8-10 slides):
Slide 1: Bold hook headline (not clickbait)
Slides 2-9: One key point per slide, minimal text
Slide 10: Summary + CTA to save/share`,

      blog_article: `BLOG ARTICLE (1500-2000 words):
- SEO-optimized headline
- Meta description
- Introduction with hook
- Subheadings (H2, H3)
- Bullet points for scanability
- Conclusion with CTA`,

      email_newsletter: `EMAIL NEWSLETTER:
- Subject line (curiosity + benefit)
- Preview text
- Personal greeting
- One main idea
- Clear CTA button text
- PS line for bonus engagement`,

      youtube_script: `YOUTUBE VIDEO SCRIPT:
- Hook (0-30 seconds): Pattern interrupt
- Intro (30-60 seconds): Promise the value
- Body: Key points with transitions
- Retention hooks every 2-3 minutes
- CTA: Subscribe + comment prompt
- End screen suggestions`,

      tiktok_script: `TIKTOK/REELS SCRIPT (30-60 seconds):
- Hook (0-3 seconds): Stop the scroll
- Setup (3-10 seconds): The problem/context
- Content (10-45 seconds): Value delivery
- CTA (last 5 seconds): Follow/comment
- Text overlay suggestions
- Sound/music recommendations`,

      podcast_outline: `PODCAST EPISODE OUTLINE:
- Episode title
- Hook/teaser
- Introduction
- Main segments with talking points
- Guest questions (if applicable)
- Key takeaways
- CTA and outro`,

      infographic: `INFOGRAPHIC CONTENT:
- Main headline
- Section headers
- Key statistics (bullet points)
- Process steps
- Callout boxes
- Source citations`,

      ad_copy: `AD COPY (Multiple versions):
Version 1: Pain point focused
Version 2: Benefit focused  
Version 3: Social proof focused
Version 4: Urgency focused
Each with: Headline, Body, CTA`
    };

    const selectedFormats = formats || Object.keys(formatInstructions);
    
    const systemPrompt = `You are an expert Content Format Transformer. You take one piece of content and transform it into multiple optimized formats while maintaining the core message.

TRANSFORMATION RULES:
1. Each format must stand alone - don't assume reader saw other formats
2. Adapt length, tone, and structure for each platform
3. Maintain brand voice consistency
4. Optimize for each platform's algorithm
5. Include platform-specific elements (hashtags, emojis, etc.)

FORMATS TO GENERATE:
${selectedFormats.map((f: string) => formatInstructions[f] || f).join('\n\n')}

Generate each format with clear separation and labels.`;

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
          { role: 'user', content: `Transform this content into all requested formats (Tone: ${tone || 'Professional'}):\n\n${content}` }
        ],
        temperature: 0.8,
        max_tokens: 6000,
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
    const generatedFormats = result.choices?.[0]?.message?.content || '';

    console.log('Format generation complete');

    return new Response(JSON.stringify({
      formats: generatedFormats,
      requestedFormats: selectedFormats,
      model: 'google/gemini-2.5-pro',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Format Generator error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
