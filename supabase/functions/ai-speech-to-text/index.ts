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
    const apiKey = Deno.env.get('GROQ_WHISPER_KEY');
    if (!apiKey) {
      throw new Error('GROQ_WHISPER_KEY not configured');
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    console.log('STT: Processing audio file:', audioFile.name, 'size:', audioFile.size);

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

    if (!response.ok) {
      const error = await response.text();
      console.error('Whisper API error:', error);
      throw new Error(`Whisper API error: ${response.status}`);
    }

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

  } catch (error) {
    console.error('STT error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
