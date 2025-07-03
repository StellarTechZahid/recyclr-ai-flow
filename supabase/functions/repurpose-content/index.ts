
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

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
    
    if (!huggingFaceToken) {
      console.error('Missing HUGGING_FACE_ACCESS_TOKEN');
      throw new Error('Hugging Face API token not configured');
    }

    const { content, platform, contentType, tone } = await req.json();
    
    console.log('Using Hugging Face model: mistralai/Mistral-7B-Instruct-v0.1');
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
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false,
          },
        }),
      }
    );

    console.log('Hugging Face API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Hugging Face response:', result);

    let repurposedContent = '';
    if (Array.isArray(result) && result[0]?.generated_text) {
      repurposedContent = result[0].generated_text.trim();
    } else if (result.generated_text) {
      repurposedContent = result.generated_text.trim();
    } else {
      console.error('Unexpected response format:', result);
      throw new Error('Unexpected response format from Hugging Face API');
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
      model: 'mistralai/Mistral-7B-Instruct-v0.1'
    };

    console.log('Final response:', finalResponse);

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in repurpose-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to repurpose content',
      model: 'mistralai/Mistral-7B-Instruct-v0.1'
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

  return `<s>[INST] Transform the following ${contentType} content for ${platform}. ${platformInstructions[platform] || 'Optimize for the platform'}. Tone: ${toneInstructions[tone] || 'professional'}.

Original content: ${content}

Create the repurposed content now: [/INST]`;
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
