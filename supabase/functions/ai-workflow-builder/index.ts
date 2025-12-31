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

    const { description, triggers, actions, conditions } = await req.json();

    if (!description) {
      throw new Error('Workflow description is required');
    }

    console.log('Building AI workflow:', description);

    const systemPrompt = `You are the WORKFLOW ARCHITECT - an expert AI system that designs intelligent content automation workflows.

## YOUR EXPERTISE
1. **Trigger Design**: Define when workflows activate (time, event, condition-based)
2. **Action Sequencing**: Chain actions in optimal order with error handling
3. **Conditional Logic**: Create branching paths based on conditions
4. **Integration Mapping**: Connect various content tools and platforms

## WORKFLOW DESIGN PRINCIPLES
- **Reliability**: Design for failure recovery and graceful degradation
- **Efficiency**: Minimize unnecessary steps and optimize resource usage
- **Flexibility**: Allow for customization and extension
- **Observability**: Include logging and monitoring points

## AVAILABLE TRIGGERS
- time_based: Scheduled execution (cron expressions)
- event_based: On content publish, edit, delete
- performance_based: When metrics reach thresholds
- manual: User-initiated

## AVAILABLE ACTIONS
- repurpose: Transform content for different platforms
- schedule: Queue content for publishing
- analyze: Run analytics and generate insights
- optimize: Apply AI improvements
- notify: Send alerts and notifications
- archive: Store and organize content

## USER SPECIFICATIONS
${triggers ? `Requested Triggers: ${JSON.stringify(triggers)}` : ''}
${actions ? `Requested Actions: ${JSON.stringify(actions)}` : ''}
${conditions ? `Requested Conditions: ${JSON.stringify(conditions)}` : ''}

## OUTPUT FORMAT
{
  "workflow": {
    "name": "string",
    "description": "string",
    "version": "1.0"
  },
  "triggers": [
    {
      "id": "trigger_1",
      "type": "time_based|event_based|performance_based|manual",
      "config": {},
      "description": "string"
    }
  ],
  "steps": [
    {
      "id": "step_1",
      "action": "string",
      "config": {},
      "conditions": [],
      "onSuccess": "next_step_id or null",
      "onFailure": "error_handler_id or null"
    }
  ],
  "errorHandlers": [
    {
      "id": "error_1",
      "type": "retry|skip|notify|fallback",
      "config": {}
    }
  ],
  "metadata": {
    "estimatedDuration": "string",
    "complexity": "simple|moderate|complex",
    "recommendations": ["rec1", "rec2"]
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
          { role: 'user', content: `Design a workflow for: ${description}` }
        ],
        temperature: 0.6,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }),
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
    const content = data.choices[0]?.message?.content;

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { workflow: { name: 'Custom Workflow', description }, rawResponse: content };
      }
    } catch {
      result = { workflow: { name: 'Custom Workflow', description }, rawResponse: content };
    }

    console.log('Workflow built successfully');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in workflow builder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
