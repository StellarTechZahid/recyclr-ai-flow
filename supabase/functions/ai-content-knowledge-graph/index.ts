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

    const { contents, operation, query } = await req.json();

    console.log('Processing content knowledge graph');

    const systemPrompt = `You are the CONTENT KNOWLEDGE GRAPH engine - an AI that builds and queries intelligent relationships between content pieces.

## YOUR MISSION
Create a connected web of content knowledge that reveals patterns, enables smart recommendations, and powers content strategy.

## GRAPH CAPABILITIES

### Entity Extraction
- Topics and themes
- People and brands mentioned
- Concepts and ideas
- Industry terms
- Action items and CTAs

### Relationship Mapping
- Topic-to-topic connections
- Content-to-audience mapping
- Performance correlations
- Sequential relationships (series, threads)
- Reference relationships

### Pattern Detection
- Recurring themes
- Successful combinations
- Audience resonance patterns
- Seasonal trends
- Platform preferences

## OPERATION
${operation || 'analyze'} (analyze, query, recommend, expand)

## CONTENT TO PROCESS
${contents ? JSON.stringify(contents.slice(0, 10)) : 'No content provided'}

## QUERY (if applicable)
${query || ''}

## OUTPUT FORMAT
{
  "graph": {
    "nodes": [
      {
        "id": "string",
        "type": "topic|concept|entity|content|audience",
        "label": "string",
        "properties": {},
        "importance": number
      }
    ],
    "edges": [
      {
        "source": "node_id",
        "target": "node_id",
        "relationship": "string",
        "weight": number
      }
    ]
  },
  "clusters": [
    {
      "name": "string",
      "nodes": ["node_id1", "node_id2"],
      "theme": "string",
      "strength": number
    }
  ],
  "patterns": [
    {
      "pattern": "string",
      "frequency": number,
      "insight": "string",
      "actionable": boolean
    }
  ],
  "recommendations": {
    "unexploredTopics": ["topic1", "topic2"],
    "strongConnections": [
      { "from": "topic1", "to": "topic2", "opportunity": "string" }
    ],
    "contentGaps": ["gap1", "gap2"],
    "seriesOpportunities": ["series idea 1", "series idea 2"]
  },
  "queryResults": {
    "answer": "string",
    "relatedNodes": ["node1", "node2"],
    "confidence": number
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
          { role: 'user', content: query ? `Query the content graph: ${query}` : 'Analyze and build the content knowledge graph.' }
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
        result = { rawGraph: responseContent };
      }
    } catch {
      result = { rawGraph: responseContent };
    }

    console.log('Content knowledge graph processed');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in content knowledge graph:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
