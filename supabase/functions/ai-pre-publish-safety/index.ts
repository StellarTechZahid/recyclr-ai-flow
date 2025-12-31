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

    const { content, platform, checkTypes, brandGuidelines } = await req.json();

    if (!content) {
      throw new Error('Content is required');
    }

    console.log('Running pre-publish safety scan');

    const systemPrompt = `You are the PRE-PUBLISH SAFETY SCANNER - an AI that performs comprehensive safety checks before content goes live.

## YOUR RESPONSIBILITY
Protect brands from publishing content that could cause harm, violate policies, or damage reputation.

## SAFETY CHECK CATEGORIES

### 1. Platform Policy Compliance
- Hate speech and discrimination
- Harassment and bullying
- Violence and graphic content
- Sexual content
- Misinformation
- Spam and manipulation
- Copyright and IP issues

### 2. Brand Safety
- Off-brand messaging
- Controversial positioning
- Competitive mentions
- Unverified claims
- Legal liability risks

### 3. Cultural Sensitivity
- Regional taboos
- Religious sensitivities
- Political implications
- Demographic stereotypes

### 4. Legal & Regulatory
- FTC disclosure requirements
- Industry regulations
- Privacy concerns
- Defamation risks

## CHECK TYPES REQUESTED
${checkTypes ? checkTypes.join(', ') : 'all'}

## PLATFORM
${platform || 'general'}

## BRAND GUIDELINES
${brandGuidelines ? JSON.stringify(brandGuidelines) : 'Not specified'}

## OUTPUT FORMAT
{
  "overallStatus": "safe|warning|blocked",
  "riskScore": number,
  "checks": [
    {
      "category": "string",
      "status": "pass|warning|fail",
      "issues": [
        {
          "severity": "low|medium|high|critical",
          "description": "string",
          "location": "string",
          "suggestion": "string"
        }
      ]
    }
  ],
  "platformCompliance": {
    "platform": "string",
    "compliant": boolean,
    "violations": ["violation1"] or null,
    "recommendations": ["rec1", "rec2"]
  },
  "brandAlignment": {
    "score": number,
    "onBrand": ["element1", "element2"],
    "offBrand": ["element1"] or null,
    "suggestions": ["suggestion1"]
  },
  "legalFlags": {
    "hasDisclosureNeeds": boolean,
    "disclosureType": "string or null",
    "suggestedDisclosure": "string or null"
  },
  "approvalRecommendation": {
    "decision": "approve|review|reject",
    "reasoning": "string",
    "requiredChanges": ["change1"] or null
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
          { role: 'user', content: `Perform a pre-publish safety scan on this content:\n\n${content}` }
        ],
        temperature: 0.3,
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
        result = { overallStatus: 'safe', rawAnalysis: responseContent };
      }
    } catch {
      result = { overallStatus: 'safe', rawAnalysis: responseContent };
    }

    console.log('Pre-publish safety scan complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pre-publish safety:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
