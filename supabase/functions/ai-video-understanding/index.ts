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

    const { frames, transcript, videoMetadata, analysisType } = await req.json();

    if (!frames && !transcript) {
      throw new Error('Either frames or transcript is required');
    }

    console.log('Analyzing video content');

    // Use vision model for frame analysis
    const messages: any[] = [
      {
        role: 'system',
        content: `You are the VIDEO UNDERSTANDING ENGINE - an AI that extracts deep insights from video content.

## YOUR CAPABILITIES
1. **Scene Analysis**: Understand what's happening in each frame
2. **Content Extraction**: Pull key ideas, quotes, and moments
3. **Engagement Prediction**: Identify most engaging segments
4. **Repurposing Opportunities**: Suggest content derivations

## VIDEO METADATA
${videoMetadata ? JSON.stringify(videoMetadata) : 'No metadata provided'}

## ANALYSIS TYPE
${analysisType || 'comprehensive'}

## OUTPUT FORMAT
{
  "videoSummary": {
    "title": "string",
    "description": "string",
    "mainTopics": ["topic1", "topic2"],
    "duration": "string",
    "contentType": "educational|entertainment|promotional|tutorial"
  },
  "keyMoments": [
    {
      "timestamp": "string",
      "description": "string",
      "engagementScore": number,
      "contentType": "hook|insight|story|cta"
    }
  ],
  "extractedContent": {
    "quotes": ["quote1", "quote2"],
    "keyPoints": ["point1", "point2"],
    "stories": ["story1", "story2"]
  },
  "repurposingOpportunities": [
    {
      "format": "short|post|carousel|thread",
      "segment": "string",
      "reasoning": "string"
    }
  ],
  "visualElements": {
    "dominantColors": ["color1", "color2"],
    "textOverlays": ["text1", "text2"],
    "sceneryTypes": ["type1", "type2"]
  },
  "recommendations": {
    "bestClips": ["clip description 1", "clip description 2"],
    "thumbnailSuggestions": ["suggestion1", "suggestion2"],
    "titleOptions": ["title1", "title2"]
  }
}`
      }
    ];

    // Build user message based on available content
    let userContent = 'Analyze this video content:\n\n';
    
    if (frames && frames.length > 0) {
      // For vision analysis with frames
      const frameContent: any[] = [{ type: 'text', text: userContent }];
      frames.slice(0, 5).forEach((frame: string, index: number) => {
        if (frame.startsWith('data:image')) {
          frameContent.push({
            type: 'image_url',
            image_url: { url: frame }
          });
        }
      });
      messages.push({ role: 'user', content: frameContent });
    } else if (transcript) {
      userContent += `Transcript:\n${transcript}`;
      messages.push({ role: 'user', content: userContent });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: frames && frames.length > 0 ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash',
        messages,
        temperature: 0.6,
        max_tokens: 4000,
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
        result = { rawAnalysis: content };
      }
    } catch {
      result = { rawAnalysis: content };
    }

    console.log('Video understanding complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in video understanding:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
