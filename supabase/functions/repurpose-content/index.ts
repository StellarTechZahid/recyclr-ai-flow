import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    console.log('Repurpose content function called by user:', user.id);
    
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('Missing LOVABLE_API_KEY');
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { content, platform, contentType, tone } = await req.json();
    
    console.log('Using Lovable AI Gateway with model: google/gemini-2.5-flash');
    console.log('Request params:', { 
      contentLength: content?.length, 
      platform, 
      contentType, 
      tone 
    });

    if (!content || !platform || !contentType || !tone) {
      throw new Error('Missing required parameters: content, platform, contentType, or tone');
    }

    // Create platform-specific prompt
    const prompt = createRepurposePrompt(content, platform, contentType, tone);
    console.log('Generated prompt:', prompt.substring(0, 200) + '...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    console.log('Lovable AI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Lovable AI response received');

    let repurposedContent = '';
    if (result.choices && result.choices[0]?.message?.content) {
      repurposedContent = result.choices[0].message.content.trim();
    } else {
      console.error('Unexpected response format:', result);
      throw new Error('Unexpected response format from Lovable AI');
    }

    // Clean up the response - remove the prompt if it's included
    if (repurposedContent.includes(prompt)) {
      repurposedContent = repurposedContent.replace(prompt, '').trim();
    }

    // Generate suggestions based on the content
    const suggestions = generateSuggestions(platform, contentType);

    const finalResponse = {
      repurposedContent,
      suggestions,
      model: 'google/gemini-2.5-flash'
    };

    console.log('Final response prepared');

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in repurpose-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to repurpose content',
      model: 'google/gemini-2.5-flash'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createRepurposePrompt(content: string, platform: string, contentType: string, tone: string): string {
  const platformInstructions: Record<string, string> = {
    twitter: 'Create engaging Twitter posts (max 280 chars per tweet). Use emojis and hashtags.',
    linkedin: 'Create a professional LinkedIn post (max 3000 chars). Include insights and relevant hashtags.',
    instagram: 'Create an Instagram caption (max 2200 chars). Use storytelling, emojis, and hashtags.',
    facebook: 'Create a Facebook post (max 5000 chars). Make it conversational and engaging.',
    youtube: 'Create a YouTube video description (max 5000 chars). Include clear structure.',
    blog: 'Create a blog post outline with key points and structure.'
  };

  const toneInstructions: Record<string, string> = {
    professional: 'Use formal, business-appropriate language',
    casual: 'Use friendly, conversational tone',
    humorous: 'Add light humor and wit',
    inspirational: 'Be motivating and uplifting',
    educational: 'Focus on teaching and explaining'
  };

  return `Transform the following ${contentType} content for ${platform}. ${platformInstructions[platform] || 'Optimize for the platform'}. Tone: ${toneInstructions[tone] || 'professional'}.

Original content: ${content}

Create the repurposed content now:`;
}

function generateSuggestions(platform: string, contentType: string): string[] {
  const suggestions = [
    `Consider adding relevant hashtags for better ${platform} reach`,
    `Your ${contentType} could work well as a series of posts`,
    `Try posting at peak hours for your audience`,
    `Consider adding a call-to-action at the end`,
    `Visual content performs better on this platform`
  ];

  return suggestions.slice(0, 3);
}
