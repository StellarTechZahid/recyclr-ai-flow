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

    const { operation, contentData, query, context } = await req.json();

    console.log('Processing AI content memory operation:', operation);

    const systemPrompt = `You are the AI CONTENT MEMORY system - an intelligent memory that learns from past content performance to improve future content.

## YOUR CAPABILITIES
1. **Pattern Learning**: Remember what works and what doesn't
2. **Preference Tracking**: Learn audience preferences over time
3. **Style Evolution**: Track how successful styles evolve
4. **Mistake Prevention**: Remember failures to avoid repetition

## OPERATION
${operation || 'recall'} (store, recall, analyze, recommend, forget)

## MEMORY CATEGORIES

### Success Patterns
- Hooks that generated high engagement
- Topics that resonated
- Formats that performed well
- Posting times that worked
- CTAs that converted

### Failure Patterns
- Content that underperformed
- Topics to avoid
- Timing mistakes
- Format mismatches
- Audience disconnects

### Audience Insights
- Preferences discovered
- Pain points identified
- Questions asked
- Feedback received
- Behavior patterns

### Evolution Tracking
- Brand voice changes
- Audience shifts
- Platform changes
- Trend adaptations

## CONTEXT
${context ? JSON.stringify(context) : 'No specific context'}

## CONTENT DATA
${contentData ? JSON.stringify(contentData) : 'No content data'}

## QUERY
${query || 'No specific query'}

## OUTPUT FORMAT
{
  "operation": "string",
  "result": {
    "stored": boolean,
    "recalled": {},
    "analyzed": {}
  },
  "memories": [
    {
      "id": "string",
      "type": "success|failure|insight|evolution",
      "content": "string",
      "context": "string",
      "strength": number,
      "lastAccessed": "string",
      "useCount": number
    }
  ],
  "patterns": {
    "strongPatterns": [
      { "pattern": "string", "confidence": number, "examples": number }
    ],
    "emergingPatterns": [
      { "pattern": "string", "confidence": number, "needsMoreData": boolean }
    ]
  },
  "recommendations": {
    "basedOnMemory": ["rec1", "rec2"],
    "avoidBasedOnMemory": ["avoid1", "avoid2"],
    "experimentSuggestions": ["exp1", "exp2"]
  },
  "insights": {
    "topLearnings": ["learning1", "learning2"],
    "blindSpots": ["blindspot1"],
    "growthAreas": ["area1", "area2"]
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
          { role: 'user', content: query || `Perform ${operation || 'recall'} operation on content memory.` }
        ],
        temperature: 0.6,
        max_tokens: 4000,
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
        result = { rawMemory: responseContent };
      }
    } catch {
      result = { rawMemory: responseContent };
    }

    console.log('Content memory operation complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in content memory:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
