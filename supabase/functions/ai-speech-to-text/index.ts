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

    console.log('AI Speech-to-Text called by user:', user.id);

    const apiKey = Deno.env.get('GROQ_WHISPER_KEY');
    
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    console.log('STT: Processing audio file:', audioFile.name, 'size:', audioFile.size);

    // If we have the Groq Whisper key, use it
    if (apiKey) {
      try {
        const groqFormData = new FormData();
        groqFormData.append('file', audioFile);
        groqFormData.append('model', 'whisper-large-v3-turbo');
        groqFormData.append('language', language);
        groqFormData.append('response_format', 'verbose_json');

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: groqFormData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Transcription complete:', result.text?.substring(0, 100));

          return new Response(JSON.stringify({
            text: result.text,
            language: result.language,
            duration: result.duration,
            segments: result.segments,
            model: 'whisper-large-v3-turbo'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        console.log('Groq Whisper failed');
      } catch (e) {
        console.log('Groq Whisper error:', e);
      }
    }

    // Fallback: return an error message
    return new Response(JSON.stringify({
      text: null,
      message: 'Speech-to-text transcription requires a configured Whisper API key.',
      model: 'none'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('STT error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
