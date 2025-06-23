
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

    const huggingFaceToken = "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";
    
    const platformPrompt = PLATFORM_PROMPTS[platform as keyof typeof PLATFORM_PROMPTS] || PLATFORM_PROMPTS.twitter;
    const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.professional;

    const systemPrompt = `You are an expert content creator who specializes in repurposing content for different social media platforms. ${platformPrompt} ${toneModifier}`;
    const userPrompt = `Please repurpose this ${contentType} content for ${platform}: ${content}`;

    try {
      // Using Hugging Face Inference API with a better text generation model
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `${systemPrompt}\n\nUser: ${userPrompt}\nAssistant:`,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false,
            repetition_penalty: 1.1
          }
        }),
      });

      if (!response.ok) {
        console.error('Hugging Face API error:', response.status, response.statusText);
        
        // Try alternative model if the first one fails
        const fallbackResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${huggingFaceToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `${systemPrompt}\n\n${userPrompt}`,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.8,
              do_sample: true,
              return_full_text: false
            }
          }),
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const repurposedContent = fallbackData[0]?.generated_text || generateMockResponse(content, platform, tone);
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
        }
        
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const data = await response.json();
      const repurposedContent = data[0]?.generated_text || generateMockResponse(content, platform, tone);

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

    } catch (huggingFaceError) {
      console.error('Hugging Face request failed:', huggingFaceError);
      
      // Fallback to mock response if Hugging Face fails
      const mockResponse = generateMockResponse(content, platform, tone);
      const suggestions = [
        "AI service temporarily unavailable - showing enhanced mock response",
        "Add more engaging hooks to grab attention",
        "Consider A/B testing different versions"
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

function generateMockResponse(content: string, platform: string, tone: string): string {
  const contentSnippet = content.substring(0, 300);
  const currentDate = new Date().toLocaleDateString();
  
  switch (platform) {
    case 'twitter':
      return `🧵 THREAD: ${contentSnippet.substring(0, 80)}...\n\n1/ Let me break this down for you:\n\n${contentSnippet.substring(80, 160)}...\n\n2/ Here's what this means:\n\n${contentSnippet.substring(160, 240)}...\n\n3/ Key takeaway: ${contentSnippet.substring(240, 280)}...\n\nWhat are your thoughts? 🤔\n\n#ContentStrategy #AI #Productivity #RecyclrAI`;
    
    case 'linkedin':
      return `🚀 ${tone === 'professional' ? 'Professional Insights' : 'Thoughts'} on ${content.split(' ').slice(0, 4).join(' ')}\n\n${contentSnippet}...\n\n💡 Key takeaways:\n✅ Strategic insight #1\n✅ Actionable point #2  \n✅ Future consideration #3\n\nWhat's your experience with this? I'd love to hear your thoughts in the comments! 👇\n\n#LinkedIn #Professional #Growth #Industry #Leadership`;
    
    case 'instagram':
      return `✨ ${contentSnippet.substring(0, 120)}... ✨\n\n${tone === 'inspirational' ? '🌟 Remember: Every small step counts! 🌟' : '💭 Here\'s what I learned:'}\n\n${contentSnippet.substring(120, 200)}...\n\nSwipe to see more insights! 👉\nDouble tap if this resonates! 💕\nSave for later! 📌\n\n#InstaDaily #Content #Inspiration #Motivation #Growth #Mindset #Success`;
    
    case 'facebook':
      return `Hey everyone! 👋\n\n${tone === 'casual' ? 'So I was thinking about this...' : 'I wanted to share something important:'}\n\n${contentSnippet}...\n\n🤔 I'd love to hear your thoughts on this! What's been your experience?\n\n👇 Drop a comment below and let's discuss! I always love hearing different perspectives.\n\n#Community #Discussion #Thoughts`;
    
    case 'youtube':
      return `🎥 ${content.split(' ').slice(0, 6).join(' ')} | Complete Guide ${currentDate}\n\n${contentSnippet}...\n\n🎯 TIMESTAMPS:\n00:00 Introduction & Overview\n02:30 Main Topic Deep Dive\n05:15 Key Insights & Analysis  \n07:45 Practical Applications\n10:00 Common Mistakes to Avoid\n12:30 Conclusion & Next Steps\n\n📚 RESOURCES MENTIONED:\n• Link 1: [Description]\n• Link 2: [Description]\n\n👍 Like this video if it helped!\n🔔 Subscribe for more content!\n💬 Comment your thoughts below!\n🔗 Share with someone who needs this!\n\n#YouTube #Tutorial #Guide #Education`;
    
    case 'blog':
      return `# ${content.split(' ').slice(0, 8).join(' ')}: A Comprehensive Guide\n\n## Introduction\n\n${contentSnippet.substring(0, 150)}...\n\n## Understanding the Fundamentals\n\n${contentSnippet.substring(150, 250)}...\n\n### Key Point 1: Strategic Approach\n\nDetailed explanation and analysis...\n\n### Key Point 2: Implementation\n\nPractical steps and considerations...\n\n### Key Point 3: Best Practices\n\nExpert recommendations and tips...\n\n## Real-World Applications\n\n${contentSnippet.substring(250, 300)}...\n\n## Conclusion\n\nWrapping up the key insights and actionable takeaways...\n\n---\n\n*What did you think of this post? Share your thoughts and experiences in the comments below!*\n\n**Tags:** #Blog #Content #Strategy #Guide`;
    
    default:
      return `${contentSnippet}...\n\n✨ Optimized for ${platform} with ${tone} tone\n📅 Generated on ${currentDate}\n🤖 Powered by RecyclrAI\n\nReady to engage your audience!`;
  }
}
