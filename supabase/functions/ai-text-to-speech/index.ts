import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GROQ_PLAYAI_TTS_KEY');
    if (!apiKey) {
      throw new Error('GROQ_PLAYAI_TTS_KEY not configured');
    }

    const { text, voice, speed, format } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    console.log('TTS: Generating speech for text length:', text.length);

    // PlayAI TTS via Groq
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'playai-tts',
        input: text,
        voice: voice || 'alloy',
        speed: speed || 1.0,
        response_format: format || 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('TTS API error:', error);
      throw new Error(`TTS API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    console.log('TTS: Audio generated, size:', audioBuffer.byteLength);

    return new Response(JSON.stringify({
      audioContent: base64Audio,
      format: format || 'mp3',
      model: 'playai-tts'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('TTS error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
