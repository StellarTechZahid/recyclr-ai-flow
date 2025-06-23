
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RepurposeRequest {
  content: string;
  platform: string;
  contentType: string;
  tone?: string;
  length?: string;
}

const PLATFORM_PROMPTS = {
  twitter: "Create a compelling Twitter thread (2-3 tweets) from this content. Make it engaging, use relevant hashtags, and ensure each tweet is under 280 characters.",
  linkedin: "Transform this into a professional LinkedIn post. Include a hook, valuable insights, and a call-to-action. Use proper formatting with line breaks.",
  instagram: "Create an Instagram caption that's engaging and visual. Include relevant hashtags and emojis. Focus on storytelling.",
  facebook: "Write a Facebook post that encourages engagement. Make it conversational and include a question to spark discussion.",
  youtube: "Create a YouTube video description with timestamps, key points, and calls-to-action. Include SEO-friendly keywords.",
  blog: "Transform this into a well-structured blog post with headings, subheadings, and clear sections."
};

const TONE_MODIFIERS = {
  professional: "Use a professional, business-appropriate tone.",
  casual: "Use a casual, friendly, and conversational tone.",
  humorous: "Add humor and wit while keeping the message clear.",
  inspirational: "Make it motivational and uplifting.",
  educational: "Focus on being informative and instructive."
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, platform, contentType, tone = 'professional' }: RepurposeRequest = await req.json()

    if (!content || !platform) {
      return new Response(
        JSON.stringify({ error: 'Content and platform are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    
    if (!huggingFaceToken) {
      return new Response(
        JSON.stringify({ error: 'Hugging Face API token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const platformPrompt = PLATFORM_PROMPTS[platform as keyof typeof PLATFORM_PROMPTS] || PLATFORM_PROMPTS.twitter;
    const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.professional;

    const prompt = `${platformPrompt} ${toneModifier}

Original ${contentType} content:
${content}

Please repurpose this content for ${platform}:`;

    console.log('Making request to Hugging Face API...');

    // Use a more reliable text generation model
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false,
          repetition_penalty: 1.1
        }
      }),
    });

    console.log('Hugging Face response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      
      // Try alternative model if first fails
      const fallbackResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 400,
            temperature: 0.8,
            do_sample: true
          }
        }),
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const repurposedContent = fallbackData[0]?.generated_text || content;
        const suggestions = generateSuggestions(platform, tone);

        return new Response(
          JSON.stringify({
            repurposedContent: cleanupGeneratedText(repurposedContent),
            suggestions
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Hugging Face response data:', data);

    const repurposedContent = data[0]?.generated_text || content;
    const suggestions = generateSuggestions(platform, tone);

    return new Response(
      JSON.stringify({
        repurposedContent: cleanupGeneratedText(repurposedContent),
        suggestions
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in repurpose-content function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to repurpose content. Please try again.',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function cleanupGeneratedText(text: string): string {
  // Remove any unwanted prefixes or suffixes from the generated text
  return text
    .replace(/^(Assistant:|AI:|Bot:)/i, '')
    .replace(/^Response:/i, '')
    .trim();
}

function generateSuggestions(platform: string, tone: string): string[] {
  const baseSuggestions = [
    "Add more engaging hooks to grab attention",
    "Include relevant hashtags for better discoverability",
    "Consider adding a call-to-action to increase engagement",
    "Break up long paragraphs for better readability"
  ];

  const platformSuggestions: Record<string, string[]> = {
    twitter: ["Keep tweets under 280 characters", "Use thread format for longer content", "Add trending hashtags"],
    linkedin: ["Add industry-specific keywords", "Include professional insights", "Tag relevant connections"],
    instagram: ["Use relevant emojis", "Add visual storytelling elements", "Create Instagram Stories version"],
    facebook: ["Ask questions to encourage comments", "Use conversational language", "Add Facebook-specific features"],
    youtube: ["Include timestamps", "Add SEO keywords in description", "Create compelling thumbnails"],
    blog: ["Use clear headings and subheadings", "Add internal links", "Optimize for SEO"]
  };

  const platformSpecific = platformSuggestions[platform] || [];
  return [...platformSpecific, ...baseSuggestions.slice(0, 2)];
}
