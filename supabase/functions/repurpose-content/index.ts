
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Repurpose content function called');
    
    if (!groqApiKey) {
      console.error('Missing GROQ_API_KEY');
      throw new Error('Groq API key not configured');
    }

    const { content, platform, contentType, tone } = await req.json();
    
    console.log('Using Groq model: meta-llama/llama-4-scout-17b-16e-instruct');
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
    
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 512,
        }),
      }
    );

    console.log('Groq API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Groq response:', result);

    let repurposedContent = '';
    if (result.choices && result.choices[0]?.message?.content) {
      repurposedContent = result.choices[0].message.content.trim();
    } else {
      console.error('Unexpected response format:', result);
      throw new Error('Unexpected response format from Groq API');
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
      model: 'meta-llama/llama-4-scout-17b-16e-instruct'
    };

    console.log('Final response:', finalResponse);

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in repurpose-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to repurpose content',
      model: 'meta-llama/llama-4-scout-17b-16e-instruct'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createRepurposePrompt(content: string, platform: string, contentType: string, tone: string): string {
  const platformInstructions = {
    twitter: 'Create engaging Twitter posts (max 280 chars per tweet). Use emojis and hashtags.',
    linkedin: 'Create a professional LinkedIn post (max 3000 chars). Include insights and relevant hashtags.',
    instagram: 'Create an Instagram caption (max 2200 chars). Use storytelling, emojis, and hashtags.',
    facebook: 'Create a Facebook post (max 5000 chars). Make it conversational and engaging.',
    youtube: 'Create a YouTube video description (max 5000 chars). Include clear structure.',
    blog: 'Create a blog post outline with key points and structure.'
  };

  const toneInstructions = {
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
