import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
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

    console.log('AI Text-to-Speech called by user:', user.id);

    // Try Groq PlayAI TTS first, fallback to text response
    const apiKey = Deno.env.get('GROQ_PLAYAI_TTS_KEY');
    
    const { text, voice, speed, format } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    console.log('TTS: Generating speech for text length:', text.length);

    // If we have the Groq TTS key, try to use it
    if (apiKey) {
      try {
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

        if (response.ok) {
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
        }
        
        console.log('Groq TTS failed, using text response');
      } catch (e) {
        console.log('Groq TTS error, using text response:', e);
      }
    }

    // Fallback: return text with a note that audio generation is not available
    return new Response(JSON.stringify({
      audioContent: null,
      text: text,
      message: 'Text-to-speech audio generation requires a configured TTS API key. The text has been processed.',
      format: format || 'mp3',
      model: 'text-only'
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
