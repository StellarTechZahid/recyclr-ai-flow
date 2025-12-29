import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { content, audienceType, expertiseLevel, industryContext, demographics } = await req.json();

    console.log('Audience-Aware Writing for:', audienceType);

    const audienceProfiles: Record<string, string> = {
      beginner: `BEGINNER AUDIENCE:
- No assumed prior knowledge
- Define all terms
- Simple analogies to everyday life
- Step-by-step explanations
- Encouraging, supportive tone
- "You've got this" energy`,

      intermediate: `INTERMEDIATE AUDIENCE:
- Foundational knowledge assumed
- Industry terminology OK
- Focus on "why" not just "what"
- Nuanced perspectives
- Practical application focus`,

      expert: `EXPERT AUDIENCE:
- Deep expertise assumed
- Technical precision
- Cutting-edge insights
- Challenge existing thinking
- Peer-to-peer conversation`,

      founder: `FOUNDER/CEO AUDIENCE:
- Strategic implications focus
- ROI and business impact
- Time-efficient delivery
- Decision-making frameworks
- Competitive advantage angle`,

      marketer: `MARKETER AUDIENCE:
- Campaign applicability
- Metrics and measurement
- Trend awareness
- Tool and tactic focus
- Creative inspiration`,

      developer: `DEVELOPER AUDIENCE:
- Technical accuracy
- Code/implementation focus
- Efficiency emphasis
- Best practices
- Problem-solution format`,

      investor: `INVESTOR AUDIENCE:
- Market opportunity framing
- Scalability discussion
- Risk/reward analysis
- Traction metrics
- Future potential`,

      student: `STUDENT AUDIENCE:
- Learning-focused structure
- Career relevance
- Affordable/accessible solutions
- Aspiration building
- Actionable study tips`,

      enterprise: `ENTERPRISE BUYER AUDIENCE:
- Security and compliance
- Scalability proof
- Integration capabilities
- Support and SLA
- ROI justification`,

      smb: `SMALL BUSINESS AUDIENCE:
- Budget-conscious solutions
- Quick wins emphasis
- Wear-many-hats acknowledgment
- Growth-focused
- Practical over theoretical`
    };

    const selectedAudience = audienceProfiles[audienceType] || audienceProfiles.intermediate;

    const systemPrompt = `You are an expert Audience-Adaptive Writer. You transform content to perfectly resonate with specific audience segments.

TARGET AUDIENCE PROFILE:
${selectedAudience}

${expertiseLevel ? `EXPERTISE LEVEL: ${expertiseLevel}/10` : ''}
${industryContext ? `INDUSTRY CONTEXT: ${industryContext}` : ''}
${demographics ? `DEMOGRAPHICS: ${JSON.stringify(demographics)}` : ''}

ADAPTATION RULES:
1. Adjust vocabulary complexity for audience
2. Choose relevant examples they'll relate to
3. Address their specific pain points
4. Frame benefits in their language
5. Anticipate their questions/objections
6. Match their reading/consumption style

OUTPUT FORMAT:
1. ADAPTED CONTENT: Full rewrite for this audience
2. ADAPTATION NOTES: Key changes made and why
3. ENGAGEMENT HOOKS: 3 questions to spark discussion with this audience`;

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
          { role: 'user', content: `Adapt this content for the target audience:\n\n${content}` }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const adaptedContent = result.choices?.[0]?.message?.content || '';

    console.log('Audience adaptation complete');

    return new Response(JSON.stringify({
      content: adaptedContent,
      audienceType,
      model: 'google/gemini-2.5-flash',
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Audience Writer error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
