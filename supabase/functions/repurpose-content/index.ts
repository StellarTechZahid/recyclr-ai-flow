
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

// Fallback AI repurposing function
function fallbackRepurpose(content: string, platform: string, tone: string): string {
  const platformPrompt = PLATFORM_PROMPTS[platform as keyof typeof PLATFORM_PROMPTS] || PLATFORM_PROMPTS.twitter;
  const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.professional;
  
  // Create a structured repurposed content based on platform
  switch (platform) {
    case 'twitter':
      return createTwitterContent(content, tone);
    case 'linkedin':
      return createLinkedInContent(content, tone);
    case 'instagram':
      return createInstagramContent(content, tone);
    case 'facebook':
      return createFacebookContent(content, tone);
    case 'youtube':
      return createYouTubeContent(content, tone);
    case 'blog':
      return createBlogContent(content, tone);
    default:
      return createGenericContent(content, platform, tone);
  }
}

function createTwitterContent(content: string, tone: string): string {
  const words = content.split(' ').slice(0, 30);
  const summary = words.join(' ');
  
  if (tone === 'casual') {
    return `🧵 Just discovered something interesting!\n\n${summary}...\n\nWhat do you think? Drop your thoughts below! 👇\n\n#ContentCreation #Ideas #Thread`;
  } else if (tone === 'professional') {
    return `Key insights from recent analysis:\n\n${summary}...\n\nShare your perspective on this topic.\n\n#ProfessionalDevelopment #Insights #Business`;
  } else {
    return `💡 Here's an interesting perspective:\n\n${summary}...\n\nLet's discuss! What's your take?\n\n#Discussion #Ideas #Community`;
  }
}

function createLinkedInContent(content: string, tone: string): string {
  const words = content.split(' ').slice(0, 50);
  const summary = words.join(' ');
  
  return `🚀 Key Insights Worth Sharing

${summary}...

💭 My takeaways:
• This highlights the importance of strategic thinking
• Implementation is key to success
• Continuous learning drives growth

What's your experience with this topic? I'd love to hear your thoughts in the comments.

#Leadership #ProfessionalGrowth #Strategy #Business`;
}

function createInstagramContent(content: string, tone: string): string {
  const words = content.split(' ').slice(0, 40);
  const summary = words.join(' ');
  
  return `✨ Today's inspiration ✨

${summary}...

Double tap if you agree! 💫

Share this with someone who needs to see it 👇

#inspiration #motivation #content #creative #success #mindset #growth #dailyinspo`;
}

function createFacebookContent(content: string, tone: string): string {
  const words = content.split(' ').slice(0, 60);
  const summary = words.join(' ');
  
  return `Hey everyone! 👋

I wanted to share something that really got me thinking...

${summary}...

What do you all think about this? Have you had similar experiences? I'd love to start a conversation about this in the comments!

Drop a 👍 if you found this helpful, and feel free to share your own thoughts below! ⬇️`;
}

function createYouTubeContent(content: string, tone: string): string {
  const words = content.split(' ').slice(0, 80);
  const summary = words.join(' ');
  
  return `🎥 ABOUT THIS VIDEO

${summary}...

⏰ TIMESTAMPS:
0:00 Introduction
2:30 Main Points
5:15 Key Takeaways
7:45 Conclusion

📌 WHAT YOU'LL LEARN:
• Core concepts and ideas
• Practical applications
• Real-world examples

👍 LIKE this video if it helped you!
🔔 SUBSCRIBE for more content like this!
💬 COMMENT your thoughts below - I read every single one!

#YouTube #Content #Education #Learning`;
}

function createBlogContent(content: string, tone: string): string {
  const words = content.split(' ');
  const intro = words.slice(0, 30).join(' ');
  const body = words.slice(30, 80).join(' ');
  
  return `# Understanding the Core Concepts

## Introduction

${intro}...

## Key Points to Consider

${body}...

## Main Takeaways

• Strategic approach is essential for success
• Implementation requires careful planning
• Continuous improvement drives results

## Conclusion

This topic offers valuable insights that can be applied across various contexts. By understanding these principles, we can make more informed decisions and achieve better outcomes.

---

*What are your thoughts on this topic? Share your experiences in the comments below.*`;
}

function createGenericContent(content: string, platform: string, tone: string): string {
  const words = content.split(' ').slice(0, 50);
  const summary = words.join(' ');
  
  return `Content optimized for ${platform}:\n\n${summary}...\n\nThis content has been adapted to match the ${tone} tone you requested.`;
}

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
    
    let repurposedContent: string;
    
    if (huggingFaceToken) {
      // Try to use Hugging Face API if token is available
      try {
        const platformPrompt = PLATFORM_PROMPTS[platform as keyof typeof PLATFORM_PROMPTS] || PLATFORM_PROMPTS.twitter;
        const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.professional;

        const prompt = `${platformPrompt} ${toneModifier}

Original ${contentType} content:
${content}

Please repurpose this content for ${platform}:`;

        console.log('Making request to Hugging Face API...');

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

        if (response.ok) {
          const data = await response.json();
          repurposedContent = cleanupGeneratedText(data[0]?.generated_text || fallbackRepurpose(content, platform, tone));
        } else {
          console.log('Hugging Face API failed, using fallback');
          repurposedContent = fallbackRepurpose(content, platform, tone);
        }
      } catch (error) {
        console.log('Error with Hugging Face API, using fallback:', error);
        repurposedContent = fallbackRepurpose(content, platform, tone);
      }
    } else {
      console.log('No Hugging Face token, using fallback repurposing');
      repurposedContent = fallbackRepurpose(content, platform, tone);
    }

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
  return text
    .replace(/^(Assistant:|AI:|Bot:|Response:)/i, '')
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
