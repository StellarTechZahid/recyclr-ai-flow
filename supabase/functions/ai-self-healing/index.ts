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

    const { error, context, failedAction, retryCount, originalContent } = await req.json();

    if (!error) {
      throw new Error('Error description is required');
    }

    console.log('Self-healing analysis for:', error);

    const systemPrompt = `You are the SELF-HEALING ENGINE - an AI system that diagnoses failures and provides recovery strategies.

## YOUR CAPABILITIES
1. **Root Cause Analysis**: Identify why operations failed
2. **Recovery Strategy**: Design step-by-step recovery plans
3. **Prevention**: Suggest measures to prevent recurrence
4. **Adaptation**: Modify approach based on failure patterns

## FAILURE CATEGORIES
- NETWORK: API timeouts, connection failures
- VALIDATION: Invalid content, format errors
- PERMISSION: Access denied, rate limits
- CONTENT: Policy violations, quality issues
- SYSTEM: Resource exhaustion, internal errors

## RECOVERY STRATEGIES
- RETRY: Attempt again with exponential backoff
- REWRITE: Modify content and retry
- RESCHEDULE: Delay execution to later time
- FALLBACK: Use alternative approach
- ESCALATE: Notify user for intervention
- SKIP: Mark as failed and continue

## CONTEXT
Failed Action: ${failedAction || 'Unknown'}
Retry Count: ${retryCount || 0}
${context ? `Additional Context: ${context}` : ''}
${originalContent ? `Original Content Length: ${originalContent.length} chars` : ''}

## OUTPUT FORMAT
{
  "diagnosis": {
    "category": "NETWORK|VALIDATION|PERMISSION|CONTENT|SYSTEM",
    "rootCause": "string",
    "severity": "low|medium|high|critical",
    "isRecoverable": boolean
  },
  "recovery": {
    "strategy": "RETRY|REWRITE|RESCHEDULE|FALLBACK|ESCALATE|SKIP",
    "steps": [
      {
        "action": "string",
        "params": {},
        "timeout": number
      }
    ],
    "expectedSuccessRate": number
  },
  "modifications": {
    "contentChanges": "string or null",
    "configChanges": {},
    "timing": "string or null"
  },
  "prevention": {
    "recommendations": ["rec1", "rec2"],
    "monitoring": ["metric1", "metric2"]
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
          { role: 'user', content: `Analyze and provide recovery for this error:\n\nError: ${error}\n\n${originalContent ? `Content that failed: ${originalContent.substring(0, 500)}...` : ''}` }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429 || status === 402) {
        return new Response(
          JSON.stringify({ 
            diagnosis: { category: 'SYSTEM', rootCause: 'AI rate limit', severity: 'medium', isRecoverable: true },
            recovery: { strategy: 'RETRY', steps: [{ action: 'Wait and retry', timeout: 30000 }] }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`API request failed: ${status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = {
          diagnosis: { category: 'SYSTEM', rootCause: error, severity: 'medium', isRecoverable: true },
          recovery: { strategy: 'RETRY', steps: [{ action: 'Retry with backoff' }] },
          rawAnalysis: content
        };
      }
    } catch {
      result = {
        diagnosis: { category: 'SYSTEM', rootCause: error, severity: 'medium', isRecoverable: true },
        recovery: { strategy: 'RETRY', steps: [{ action: 'Retry with backoff' }] }
      };
    }

    console.log('Self-healing analysis complete');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in self-healing:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
