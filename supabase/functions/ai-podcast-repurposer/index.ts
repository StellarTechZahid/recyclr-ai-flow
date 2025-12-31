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

    const { transcript, podcastTitle, episodeNumber, hosts, duration, targetOutputs } = await req.json();

    if (!transcript) {
      throw new Error('Podcast transcript is required');
    }

    console.log('Repurposing podcast content');

    const systemPrompt = `You are the PODCAST REPURPOSER - an AI expert at extracting maximum value from podcast content.

## YOUR MISSION
Transform podcast transcripts into a comprehensive content ecosystem that maximizes reach and engagement.

## EXTRACTION CAPABILITIES
1. **Highlight Detection**: Find the most quotable, shareable moments
2. **Topic Segmentation**: Break down into distinct topic sections
3. **Insight Mining**: Extract key takeaways and actionable advice
4. **Story Extraction**: Identify compelling stories and anecdotes

## PODCAST METADATA
${podcastTitle ? `Title: ${podcastTitle}` : ''}
${episodeNumber ? `Episode: ${episodeNumber}` : ''}
${hosts ? `Hosts: ${hosts.join(', ')}` : ''}
${duration ? `Duration: ${duration} minutes` : ''}

## OUTPUT TYPES TO GENERATE
1. **Highlights Reel**: 3-5 best clips (with timestamps if available)
2. **Quote Posts**: 10 shareable quote graphics
3. **Thread Summary**: Twitter thread summarizing key points
4. **Blog Post**: Long-form written version
5. **Newsletter Segment**: Email-friendly excerpt
6. **Shorts Scripts**: 3 scripts for vertical video shorts
7. **Carousel Content**: LinkedIn/Instagram carousel
8. **Show Notes**: SEO-optimized episode description

## OUTPUT FORMAT
{
  "analysis": {
    "mainThemes": ["theme1", "theme2"],
    "keyMoments": [
      { "timestamp": "00:00", "description": "string", "quote": "string" }
    ],
    "guestInsights": ["insight1", "insight2"]
  },
  "highlights": [
    {
      "title": "string",
      "startTime": "string",
      "endTime": "string",
      "quote": "string",
      "context": "string"
    }
  ],
  "quotePosts": [
    { "quote": "string", "attribution": "string", "platform": "string" }
  ],
  "threadSummary": {
    "hook": "string",
    "tweets": ["tweet1", "tweet2", ...]
  },
  "blogPost": {
    "title": "string",
    "metaDescription": "string",
    "content": "markdown"
  },
  "shortsScripts": [
    {
      "title": "string",
      "hook": "string",
      "script": "string",
      "duration": "30-60s"
    }
  ],
  "showNotes": {
    "summary": "string",
    "timestamps": ["00:00 - Topic"],
    "resources": ["resource1", "resource2"]
  }
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
          { role: 'user', content: `Repurpose this podcast transcript:\n\n${transcript}` }
        ],
        temperature: 0.7,
        max_tokens: 5000,
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
        result = { rawContent: content };
      }
    } catch {
      result = { rawContent: content };
    }

    console.log('Podcast repurposing complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in podcast repurposer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
