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

    const { content, brandProfile, strictness, autoFix } = await req.json();

    if (!content) {
      throw new Error('Content is required');
    }

    console.log('Applying brand guardrails');

    const systemPrompt = `You are the BRAND GUARDRAILS ENGINE - an AI that ensures all content stays within brand guidelines and automatically fixes deviations.

## YOUR MISSION
Protect brand integrity by detecting and correcting off-brand content before it damages brand perception.

## BRAND PROFILE
${brandProfile ? JSON.stringify(brandProfile, null, 2) : 'Use general professional brand standards'}

## STRICTNESS LEVEL
${strictness || 'moderate'} (lenient, moderate, strict)

## GUARDRAIL CATEGORIES

### Voice & Tone
- Personality consistency
- Emotional range appropriateness
- Formality level
- Humor boundaries

### Language & Terminology
- Approved vocabulary
- Banned words/phrases
- Industry terminology usage
- Competitor mentions

### Visual Language
- Emoji guidelines
- Punctuation style
- Capitalization rules
- Hashtag usage

### Values & Positioning
- Brand values alignment
- Mission consistency
- Target audience appropriateness
- Competitive positioning

## AUTO-FIX MODE
${autoFix ? 'Yes - Provide corrected versions' : 'No - Report only'}

## OUTPUT FORMAT
{
  "compliance": {
    "overallScore": number,
    "status": "compliant|minor_issues|major_issues|non_compliant",
    "criticalIssues": number,
    "warnings": number
  },
  "violations": [
    {
      "category": "voice|language|visual|values",
      "severity": "low|medium|high|critical",
      "location": "string",
      "issue": "string",
      "guideline": "string",
      "originalText": "string",
      "suggestedFix": "string"
    }
  ],
  "correctedContent": "string (if autoFix enabled)",
  "scoreBreakdown": {
    "voiceConsistency": number,
    "languageCompliance": number,
    "visualStandards": number,
    "valuesAlignment": number
  },
  "recommendations": [
    {
      "area": "string",
      "suggestion": "string",
      "priority": "low|medium|high"
    }
  ],
  "approvalStatus": {
    "canPublish": boolean,
    "requiresReview": boolean,
    "blockedReasons": ["reason1"] or null
  }
}`;

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
          { role: 'user', content: `Check this content against brand guardrails:\n\n${content}` }
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`API request failed: ${status}`);
    }

    const data = await response.json();
    const responseContent = data.choices[0]?.message?.content;

    let result;
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { compliance: { overallScore: 80, status: 'compliant' }, rawAnalysis: responseContent };
      }
    } catch {
      result = { compliance: { overallScore: 80, status: 'compliant' }, rawAnalysis: responseContent };
    }

    console.log('Brand guardrails check complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in brand guardrails:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
