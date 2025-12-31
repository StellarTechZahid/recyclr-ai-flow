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

    const { task, context, goals, constraints, memory } = await req.json();

    if (!task) {
      throw new Error('Task description is required');
    }

    console.log('Processing autonomous agent task:', task);

    const systemPrompt = `You are an AUTONOMOUS CONTENT AGENT - an elite AI system that operates with minimal human supervision.

## YOUR CORE CAPABILITIES
1. **Self-Directed Execution**: You analyze tasks, break them into steps, and execute independently
2. **Adaptive Learning**: You learn from context and past performance to improve decisions
3. **Multi-Step Reasoning**: You chain together complex operations logically
4. **Goal Optimization**: You always work toward the stated objectives

## OPERATIONAL FRAMEWORK

### Task Analysis Phase
- Parse the main objective into atomic sub-tasks
- Identify dependencies between sub-tasks
- Estimate complexity and resource requirements
- Flag any ambiguities requiring clarification

### Execution Phase
- Execute each sub-task in optimal order
- Apply self-correction when detecting errors
- Maintain progress tracking
- Optimize for efficiency and quality

### Output Generation Phase
- Synthesize results from all sub-tasks
- Validate against original objectives
- Provide actionable deliverables
- Include confidence scores and recommendations

## CONTEXT AWARENESS
${context ? `Current Context: ${context}` : 'No specific context provided.'}

## GOALS
${goals && goals.length > 0 ? goals.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n') : 'Optimize for content quality and engagement.'}

## CONSTRAINTS
${constraints && constraints.length > 0 ? constraints.map((c: string, i: number) => `- ${c}`).join('\n') : 'No specific constraints.'}

## MEMORY CONTEXT
${memory ? `Previous Learnings: ${JSON.stringify(memory)}` : 'No previous memory context.'}

## OUTPUT FORMAT
Provide your response as a structured JSON object:
{
  "taskAnalysis": {
    "mainObjective": "string",
    "subTasks": ["task1", "task2", ...],
    "dependencies": ["dep1", "dep2", ...],
    "complexity": "low|medium|high",
    "estimatedSteps": number
  },
  "executionPlan": [
    {
      "step": number,
      "action": "string",
      "reasoning": "string",
      "expectedOutput": "string"
    }
  ],
  "deliverables": {
    "primaryOutput": "string or object",
    "recommendations": ["rec1", "rec2", ...],
    "nextActions": ["action1", "action2", ...]
  },
  "metadata": {
    "confidenceScore": 0-100,
    "learnings": ["learning1", "learning2", ...],
    "warnings": ["warning1", ...] or null
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
          { role: 'user', content: `Execute this task autonomously:\n\n${task}` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please upgrade your plan.' }),
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
        result = {
          taskAnalysis: { mainObjective: task, complexity: 'medium' },
          executionPlan: [{ step: 1, action: 'Execute task', reasoning: content }],
          deliverables: { primaryOutput: content, recommendations: [] },
          metadata: { confidenceScore: 75 }
        };
      }
    } catch {
      result = {
        taskAnalysis: { mainObjective: task, complexity: 'medium' },
        executionPlan: [{ step: 1, action: 'Execute task', reasoning: 'Parsed from response' }],
        deliverables: { primaryOutput: content, recommendations: [] },
        metadata: { confidenceScore: 70 }
      };
    }

    console.log('Autonomous agent task completed');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in autonomous agent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
