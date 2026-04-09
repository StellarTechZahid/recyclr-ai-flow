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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { content, platform, contentType, tone } = await req.json();

    if (!content || !platform || !contentType || !tone) {
      throw new Error('Missing required parameters: content, platform, contentType, or tone');
    }

    const systemPrompt = buildSystemPrompt(platform, contentType, tone);
    const userPrompt = `Here is the original ${contentType} content to repurpose for ${platform}:\n\n---\n${content}\n---\n\nTransform this into high-performing ${platform} content following all instructions in your system prompt. Output ONLY the final repurposed content — no preamble, no labels, no explanation.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.75,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please upgrade.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI error: ${response.status}`);
    }

    const result = await response.json();
    let repurposedContent = result.choices?.[0]?.message?.content?.trim() || '';

    if (!repurposedContent) {
      throw new Error('No content generated');
    }

    const suggestions = generateSmartSuggestions(platform, contentType, tone, content);

    return new Response(JSON.stringify({
      repurposedContent,
      suggestions,
      model: 'google/gemini-2.5-flash',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Repurpose error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to repurpose content',
      model: 'google/gemini-2.5-flash',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildSystemPrompt(platform: string, contentType: string, tone: string): string {
  const platformSpecs: Record<string, string> = {
    twitter: `PLATFORM: Twitter/X
CHARACTER LIMIT: 280 per tweet (create a thread of 3-7 tweets if content warrants it)
FORMAT RULES:
- Lead with the most provocative or valuable insight as Tweet 1
- Use "🧵" indicator if creating a thread
- Each tweet must standalone yet flow as a narrative
- Use 2-3 relevant hashtags only on the final tweet
- Weave in 1-2 strategic emojis per tweet — never decorate, only emphasize
- End with a clear CTA: reply prompt, retweet ask, or link
- Avoid walls of text — whitespace is your weapon
ALGORITHM NOTES: Replies, quote tweets, and bookmark-to-impression ratio drive reach.`,

    linkedin: `PLATFORM: LinkedIn
CHARACTER LIMIT: 3,000 (optimal 1,200-1,800 for maximum engagement)
FORMAT RULES:
- Open with a 1-line "pattern interrupt" hook that forces a click on "…see more"
- Use single-sentence paragraphs with line breaks between each
- Include a personal anecdote, data point, or contrarian take in the first 3 lines
- Structure: Hook → Context → 3-5 insights (numbered or bulleted) → Takeaway → CTA
- End with a question to drive comments (LinkedIn rewards comment velocity)
- Add 3-5 relevant hashtags at the bottom
- Avoid external links in the post body (put in comments)
ALGORITHM NOTES: Dwell time, comment count in first hour, and "see more" clicks are key signals.`,

    instagram: `PLATFORM: Instagram
CHARACTER LIMIT: 2,200 (optimal 800-1,500 for feed captions)
FORMAT RULES:
- First line must hook — it's the only line visible before "…more"
- Use storytelling: set the scene, build tension, deliver the payoff
- Break into short paragraphs (2-3 sentences max)
- Use emojis as visual anchors at paragraph starts, not as filler
- Include a "save this for later 🔖" prompt (saves boost algorithm ranking)
- End with a direct question or "Tag someone who…" CTA
- Add 20-30 relevant hashtags as the first comment (not in caption)
ALGORITHM NOTES: Saves > Shares > Comments > Likes in terms of algorithmic weight.`,

    facebook: `PLATFORM: Facebook
CHARACTER LIMIT: 5,000 (optimal 300-800 for highest engagement)
FORMAT RULES:
- Lead with emotion or curiosity — Facebook rewards reaction-triggering content
- Use conversational, first-person narrative style
- Break content into 2-3 sentence paragraphs
- Include a question early to prompt comments
- Tag relevant pages/people when appropriate
- Avoid clickbait — Facebook's algorithm penalizes it
- Use native video/image references when possible
ALGORITHM NOTES: Meaningful interactions (long comments, shares with commentary) are prioritized.`,

    youtube: `PLATFORM: YouTube (Description + Script)
CHARACTER LIMIT: 5,000 description
FORMAT RULES:
- DESCRIPTION: Start with a 2-3 sentence summary with primary keyword
- Include timestamps (00:00 format) for key sections
- Add relevant links, social handles, and resources
- Use 3-5 hashtags and relevant keywords naturally
- SCRIPT OUTLINE: Provide a hook (first 30 seconds), 3-5 key sections, and outro with CTA
- Include suggested B-roll/visual cues in [brackets]
ALGORITHM NOTES: Watch time, click-through rate, and session time drive recommendations.`,

    blog: `PLATFORM: Blog / Long-form Article
FORMAT RULES:
- Create an SEO-optimized title with primary keyword
- Write a compelling meta description (150-160 chars)
- Structure with H2/H3 subheadings for scannability
- Include an executive summary / TL;DR at the top
- Use data, quotes, and examples to substantiate claims
- Add internal/external link suggestions in [brackets]
- End with a "Key Takeaways" section and CTA
- Optimal length: 1,500-2,500 words
ALGORITHM NOTES: Dwell time, scroll depth, and backlink potential drive organic reach.`,

    tiktok: `PLATFORM: TikTok
FORMAT RULES:
- Write a video script optimized for 60-90 second delivery
- Hook MUST land in the first 3 seconds — start mid-action or with a bold claim
- Use pattern interrupts every 10-15 seconds to maintain watch time
- Include on-screen text suggestions in [TEXT: …] tags
- End with a loop-friendly transition or cliffhanger
- Caption: Keep under 150 chars with 3-5 hashtags
- Include a "Follow for more" or "Part 2?" CTA
ALGORITHM NOTES: Completion rate and rewatch rate are the #1 ranking factors.`,

    threads: `PLATFORM: Threads (Meta)
CHARACTER LIMIT: 500 per post
FORMAT RULES:
- Conversational, authentic tone — Threads rewards realness over polish
- Lead with a hot take or relatable observation
- Keep it to 1-3 short paragraphs
- Use minimal hashtags (0-2)
- Encourage replies with open-ended questions
- Cross-reference to Instagram content when relevant
ALGORITHM NOTES: Reply chains and reposts drive distribution.`,

    pinterest: `PLATFORM: Pinterest
FORMAT RULES:
- Write a keyword-rich pin title (60-100 chars)
- Create a detailed pin description (200-500 chars) with natural keyword placement
- Include a clear CTA: "Click to learn more," "Save for later," "Try this today"
- Suggest board categorization
- Focus on evergreen, actionable, and aspirational content
ALGORITHM NOTES: Save rate, click-through rate, and keyword relevance drive distribution.`,
  };

  const toneProfiles: Record<string, string> = {
    professional: `TONE: Professional & Authoritative
- Use confident, data-informed language
- Industry-appropriate terminology (not jargon)
- Balanced between accessible and expert
- Cite sources/data when available
- Maintain credibility without being dry
- Power words: "proven," "strategic," "insight," "framework," "leverage"`,

    casual: `TONE: Casual & Conversational
- Write like you're texting a smart friend
- Use contractions, rhetorical questions, and natural pauses
- Sprinkle in humor where it fits
- Be direct and relatable
- Use "you" and "I" frequently
- Power words: "honestly," "here's the thing," "real talk," "game-changer"`,

    humorous: `TONE: Witty & Entertaining
- Lead with unexpected angles and comedic timing
- Use self-deprecating humor and ironic observations
- Pop culture references that your audience gets
- Exaggeration for effect (but don't be cringe)
- Punchlines that also deliver value
- Power words: "plot twist," "spoiler alert," "apparently," "not gonna lie"`,

    inspirational: `TONE: Inspirational & Motivating
- Use vision-casting, future-oriented language
- Share transformation stories (before/after framing)
- Appeal to aspiration and possibility
- Include "you can" and "imagine" statements
- Build emotional crescendo toward the CTA
- Power words: "transform," "breakthrough," "unleash," "imagine," "unstoppable"`,

    educational: `TONE: Educational & Instructive
- Clear, structured explanations with logical flow
- Use analogies and real-world examples
- Break complex ideas into digestible steps
- Include "here's why this matters" bridges
- Anticipate and address objections
- Power words: "step-by-step," "here's how," "the key is," "most people miss," "framework"`,

    storytelling: `TONE: Narrative & Immersive
- Open with "Picture this…" or in media res
- Build characters, tension, and resolution
- Use sensory details and emotional beats
- Weave the lesson into the story arc
- End with a takeaway that feels earned, not forced
- Power words: "and then," "what I didn't expect," "the moment I realized," "little did I know"`,

    provocative: `TONE: Bold & Contrarian
- Challenge conventional wisdom directly
- Use "unpopular opinion" and "hot take" framing
- Back controversial claims with evidence
- Invite debate without being toxic
- Position yourself as the one who sees what others miss
- Power words: "wrong," "myth," "nobody's talking about," "here's the truth," "stop"`,
  };

  const platformContext = platformSpecs[platform] || `PLATFORM: ${platform}\nOptimize for this platform's best practices and character limits.`;
  const toneContext = toneProfiles[tone] || toneProfiles.professional;

  return `You are VYRALIX CONTENT ARCHITECT — an elite AI content strategist trained on 10,000+ viral posts across every major platform. You transform raw content into platform-native, high-converting social media assets.

## MISSION
Take the user's original ${contentType} content and repurpose it into a polished, publish-ready piece optimized for maximum engagement on the target platform.

## CONTENT TYPE CONTEXT
You are repurposing a "${contentType}" — adapt the structure, depth, and style accordingly:
- Article/Blog → Extract key insights, stats, and quotes
- Video transcript → Capture the energy and key moments
- Podcast notes → Highlight the most shareable soundbites
- Social post → Adapt format and depth for the new platform
- Notes/Ideas → Expand into a structured, compelling piece

${platformContext}

${toneContext}

## UNIVERSAL QUALITY STANDARDS
1. **Hook First**: The opening line must stop the scroll — use curiosity gaps, bold claims, or relatable pain points
2. **Value Density**: Every sentence must earn its place — cut fluff ruthlessly
3. **Readability**: Short paragraphs, whitespace, and rhythm. Content should be scannable.
4. **Authenticity**: Sound human, not AI-generated. No generic phrases like "in today's fast-paced world"
5. **CTA Clarity**: End with a specific, compelling call-to-action appropriate for the platform
6. **Native Feel**: The output should feel like it was crafted by a platform-native creator, not adapted from elsewhere

## FORBIDDEN
- Do NOT include meta-commentary ("Here's the repurposed version…")
- Do NOT use placeholder text or [brackets] in the final output (except for YouTube script cues)
- Do NOT water down the original message — amplify it
- Do NOT use generic filler phrases or corporate buzzwords
- Do NOT start with "In today's…", "Are you tired of…", or "Did you know…"

## OUTPUT
Return ONLY the final, publish-ready content. Nothing else.`;
}

function generateSmartSuggestions(platform: string, contentType: string, tone: string, content: string): string[] {
  const wordCount = content.split(/\s+/).length;
  const suggestions: string[] = [];

  // Platform-specific suggestions
  const platformSuggestions: Record<string, string[]> = {
    twitter: [
      'Pin the first tweet of your thread to your profile for maximum visibility',
      'Reply to your own thread with additional resources to boost engagement',
      'Schedule this during peak hours: 8-10 AM or 6-9 PM in your audience's timezone',
      'Quote-tweet your own thread 2-3 days later with a new angle to resurface it',
    ],
    linkedin: [
      'Post between 7-9 AM on Tuesday-Thursday for maximum feed visibility',
      'Reply to every comment within the first hour to boost algorithmic reach',
      'Drop the link in the first comment, not the post body — LinkedIn penalizes external links',
      'Tag 2-3 relevant people who might reshare to expand your reach',
    ],
    instagram: [
      'Add your hashtags as the first comment, not in the caption — keeps it clean',
      'Create a carousel version of this post for 2-3x more saves and shares',
      'Post at 11 AM-1 PM or 7-9 PM when engagement peaks on Instagram',
      'Use the "Collab" feature to co-post with a relevant account for 2x reach',
    ],
    facebook: [
      'Native video gets 10x more reach than links — consider a video version',
      'Ask a polarizing question early to drive comment velocity',
      'Share to 2-3 relevant Facebook Groups where your audience gathers',
      'Use Facebook Stories to tease this post and drive traffic to it',
    ],
    youtube: [
      'Create a custom thumbnail with a close-up face + bold text for higher CTR',
      'Add end screens linking to your best related video to increase session time',
      'Include timestamps — videos with chapters get boosted in search',
      'Post on Saturday/Sunday mornings for maximum watch time',
    ],
    blog: [
      'Add internal links to 3-5 related posts to improve SEO and reduce bounce rate',
      'Create a lead magnet (checklist, template) from this post to capture emails',
      'Repurpose the H2 sections as individual social media posts for a week of content',
      'Submit to relevant subreddits and communities for initial distribution',
    ],
  };

  const platSuggs = platformSuggestions[platform] || [
    'Test different posting times to find your audience's peak engagement windows',
    'Repurpose this content across 2-3 additional platforms for maximum reach',
    'A/B test different hooks to optimize click-through rate',
  ];

  // Pick 2 platform-specific + 1 content-specific
  suggestions.push(platSuggs[Math.floor(Math.random() * platSuggs.length)]);
  suggestions.push(platSuggs[Math.floor(Math.random() * platSuggs.length)]);

  if (wordCount > 500) {
    suggestions.push('Your original content is rich — consider creating a multi-part series from it');
  } else if (wordCount < 100) {
    suggestions.push('Consider expanding with a personal story or data point for deeper engagement');
  } else {
    suggestions.push('This length is ideal — focus on optimizing the hook and CTA for maximum impact');
  }

  // Deduplicate
  return [...new Set(suggestions)].slice(0, 4);
}
