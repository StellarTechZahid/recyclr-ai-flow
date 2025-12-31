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

    const { transcript, targetFormats, tone, audience, brand } = await req.json();

    if (!transcript) {
      throw new Error('Transcript is required');
    }

    console.log('Converting voice to content, length:', transcript.length);

    const formats = targetFormats || ['thread', 'blog', 'email', 'linkedin'];

    const systemPrompt = `You are the VOICE-TO-CONTENT FACTORY - an AI that transforms spoken words into polished, multi-format content.

## YOUR EXPERTISE
1. **Natural Language Enhancement**: Clean up speech patterns while preserving voice
2. **Format Mastery**: Transform ideas into platform-perfect content
3. **Tone Calibration**: Match the speaker's intent with appropriate style
4. **Structure Optimization**: Organize rambling speech into coherent content

## TRANSFORMATION PRINCIPLES
- Preserve the speaker's unique voice and personality
- Remove filler words while keeping authenticity
- Add structure without losing conversational feel
- Optimize for each platform's requirements

## TARGET FORMATS
${formats.map((f: string) => `- ${f}`).join('\n')}

## STYLE SPECIFICATIONS
${tone ? `Tone: ${tone}` : 'Tone: Match the natural voice of the transcript'}
${audience ? `Audience: ${audience}` : ''}
${brand ? `Brand Voice: ${brand}` : ''}

## FORMAT REQUIREMENTS
- thread: 5-10 tweets, hook first, clear progression
- blog: Title, intro, sections with headers, conclusion
- email: Subject line, greeting, body, CTA, signature
- linkedin: Hook, story/insight, takeaway, engagement question
- script: Intro hook, sections, transitions, outro
- carousel: 5-10 slides with headline + supporting text

## OUTPUT FORMAT
{
  "analysis": {
    "mainTopics": ["topic1", "topic2"],
    "keyInsights": ["insight1", "insight2"],
    "suggestedAngle": "string",
    "estimatedReadTime": "string"
  },
  "content": {
    "thread": {
      "tweets": ["tweet1", "tweet2", ...],
      "hookStrength": number
    },
    "blog": {
      "title": "string",
      "metaDescription": "string",
      "content": "markdown string",
      "readTime": "string"
    },
    "email": {
      "subject": "string",
      "preheader": "string",
      "body": "string",
      "cta": "string"
    },
    "linkedin": {
      "post": "string",
      "hashtags": ["tag1", "tag2"]
    }
  },
  "metadata": {
    "originalWordCount": number,
    "cleanedWordCount": number,
    "qualityScore": number
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
          { role: 'user', content: `Transform this voice transcript into content:\n\n${transcript}` }
        ],
        temperature: 0.7,
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
        result = { rawContent: content };
      }
    } catch {
      result = { rawContent: content };
    }

    console.log('Voice-to-content conversion complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in voice-to-content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
