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

    const { content, personality, customVoice, region } = await req.json();

    console.log('Tone Personality Engine for:', personality);

    const personalities: Record<string, string> = {
      professional: `PROFESSIONAL EXECUTIVE VOICE:
- Authoritative but accessible
- Data-driven statements
- Industry terminology (not jargon)
- Confident assertions
- Forward-thinking perspective`,

      casual: `CASUAL FRIEND VOICE:
- Conversational flow
- Contractions and informal language
- Relatable examples
- Light humor when appropriate
- Direct, personal connection`,

      humorous: `ENTERTAINING COMEDIAN VOICE:
- Wit and wordplay
- Unexpected comparisons
- Self-deprecating moments
- Pop culture references
- Punchlines that land`,

      inspirational: `MOTIVATIONAL LEADER VOICE:
- Uplifting language
- Vision-casting statements
- Overcome-adversity framing
- Call-to-action energy
- Emotional resonance`,

      educational: `EXPERT TEACHER VOICE:
- Clear explanations
- Step-by-step breakdowns
- Examples and analogies
- "Did you know" moments
- Encourage curiosity`,

      storyteller: `NARRATIVE STORYTELLER VOICE:
- "Picture this..." openings
- Character development
- Tension and resolution
- Sensory details
- Lessons wrapped in stories`,

      provocative: `THOUGHT LEADER VOICE:
- Challenge assumptions
- Contrarian perspectives
- Bold predictions
- Question the status quo
- Spark debate`,

      empathetic: `SUPPORTIVE COACH VOICE:
- Understanding pain points
- "You're not alone" messaging
- Practical solutions
- Gentle guidance
- Celebrate small wins`,

      luxury: `PREMIUM BRAND VOICE:
- Sophisticated vocabulary
- Exclusivity language
- Quality emphasis
- Refined elegance
- Aspirational imagery`,

      gen_z: `GEN Z NATIVE VOICE:
- Current slang (appropriately)
- Meme-aware references
- Authentic and unfiltered
- Social consciousness
- Platform-native style`,

      corporate: `CORPORATE COMMUNICATIONS VOICE:
- Polished and precise
- Stakeholder-aware
- Brand-safe language
- Clear value propositions
- Professional formality`
    };

    const selectedPersonality = personalities[personality] || customVoice || personalities.professional;

    const systemPrompt = `You are a master Content Voice Transformer. Your job is to rewrite content in a specific personality and tone while preserving the core message.

TARGET VOICE PROFILE:
${selectedPersonality}

${region ? `REGIONAL ADAPTATION:
Adapt language, references, and examples for: ${region}
- Use regionally appropriate idioms
- Reference local context when relevant
- Adjust formality based on cultural norms` : ''}

TRANSFORMATION RULES:
1. Maintain the exact same meaning and key points
2. Transform vocabulary, sentence structure, and flow
3. Add voice-appropriate phrases and expressions
4. Adjust examples to match the voice
5. Keep the same length (±10%)

Provide the rewritten content with the new voice fully embodied.`;

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
          { role: 'user', content: `Rewrite this content in the target voice:\n\n${content}` }
        ],
        temperature: 0.8,
        max_tokens: 2000,
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
    const transformedContent = result.choices?.[0]?.message?.content || '';

    console.log('Tone transformation complete');

    return new Response(JSON.stringify({
      content: transformedContent,
      personality,
      model: 'google/gemini-2.5-flash',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Tone Personality error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
