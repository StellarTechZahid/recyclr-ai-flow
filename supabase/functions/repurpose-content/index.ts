
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

    // TODO: Update this with your real OpenAI API key
    const openAIApiKey = "YOUR_OPENAI_API_KEY_HERE"; // Replace with actual key
    
    const platformPrompt = PLATFORM_PROMPTS[platform as keyof typeof PLATFORM_PROMPTS] || PLATFORM_PROMPTS.twitter;
    const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.professional;

    const systemPrompt = `You are an expert content creator who specializes in repurposing content for different social media platforms. ${platformPrompt} ${toneModifier}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Please repurpose this ${contentType} content for ${platform}: ${content}` }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error:', response.status, response.statusText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const repurposedContent = data.choices[0]?.message?.content || '';

      // Generate AI suggestions based on the platform
      const suggestions = generateSuggestions(platform, tone);

      return new Response(
        JSON.stringify({
          repurposedContent,
          suggestions
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (openAIError) {
      console.error('OpenAI request failed:', openAIError);
      
      // Fallback to mock response if OpenAI fails (for development)
      const mockResponse = generateMockResponse(content, platform, tone);
      const suggestions = [
        "Note: Using mock response - please add your OpenAI API key",
        "Add more engaging hooks to grab attention"
      ];

      return new Response(
        JSON.stringify({
          repurposedContent: mockResponse,
          suggestions
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in repurpose-content function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateSuggestions(platform: string, tone: string): string[] {
  const baseSuggestions = [
    "Add more engaging hooks to grab attention",
    "Include relevant hashtags for better discoverability",
    "Consider adding a call-to-action to increase engagement",
    "Break up long paragraphs for better readability"
  ];

  const platformSuggestions: Record<string, string[]> = {
    twitter: ["Keep tweets under 280 characters", "Use thread format for longer content"],
    linkedin: ["Add industry-specific keywords", "Include professional insights"],
    instagram: ["Use relevant emojis", "Add visual storytelling elements"],
    facebook: ["Ask questions to encourage comments", "Use conversational language"],
    youtube: ["Include timestamps", "Add SEO keywords in description"],
    blog: ["Use clear headings and subheadings", "Add internal links"]
  };

  const platformSpecific = platformSuggestions[platform] || [];
  return [...platformSpecific, ...baseSuggestions.slice(0, 2)];
}

function generateMockResponse(content: string, platform: string, tone: string): string {
  const contentSnippet = content.substring(0, 200);
  
  switch (platform) {
    case 'twitter':
      return `🧵 Thread: ${contentSnippet.substring(0, 100)}...\n\n1/ Let me break this down for you:\n\n2/ ${contentSnippet.substring(100, 200)}...\n\n3/ What are your thoughts? 🤔\n\n#ContentCreation #AI #Productivity`;
    
    case 'linkedin':
      return `🚀 Insights on ${content.split(' ').slice(0, 3).join(' ')}\n\n${contentSnippet}...\n\nKey takeaways:\n✅ Point 1\n✅ Point 2\n✅ Point 3\n\nWhat's your experience with this? Share in the comments! 👇\n\n#LinkedIn #Professional #Growth`;
    
    case 'instagram':
      return `✨ ${contentSnippet.substring(0, 150)}... ✨\n\nSwipe to see more! 👉\n\nDouble tap if you agree! 💕\n\n#InstaDaily #Content #Inspiration #Motivation #Growth`;
    
    case 'facebook':
      return `Hey everyone! 👋\n\n${contentSnippet}...\n\nI'd love to hear your thoughts on this! What's been your experience?\n\nDrop a comment below and let's discuss! 💬`;
    
    case 'youtube':
      return `📹 ${content.split(' ').slice(0, 5).join(' ')}\n\n${contentSnippet}...\n\n🎯 TIMESTAMPS:\n00:00 Introduction\n02:30 Main topic\n05:15 Key insights\n08:00 Conclusion\n\n👍 Like this video if it helped!\n🔔 Subscribe for more content!\n💬 Comment your thoughts below!`;
    
    case 'blog':
      return `# ${content.split(' ').slice(0, 6).join(' ')}\n\n## Introduction\n\n${contentSnippet}...\n\n## Main Points\n\n### Point 1\nDetailed explanation here...\n\n### Point 2\nMore insights...\n\n## Conclusion\n\nWrapping up the key insights...\n\n---\n\n*What did you think of this post? Share your thoughts in the comments!*`;
    
    default:
      return `${contentSnippet}...\n\nAdapted for ${platform} with ${tone} tone.`;
  }
}
