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

    const { date, industry, region, contentType, lookAhead } = await req.json();

    const targetDate = date || new Date().toISOString().split('T')[0];
    console.log('Generating seasonal intelligence for:', targetDate);

    const systemPrompt = `You are the SEASONAL CONTENT INTELLIGENCE engine - an AI that identifies and leverages seasonal opportunities for content.

## YOUR MISSION
Help content creators capitalize on seasonal events, trends, and opportunities to maximize relevance and engagement.

## SEASONAL CATEGORIES

### Calendar Events
- Holidays (international, regional, religious)
- Awareness days/weeks/months
- Industry-specific dates
- Cultural celebrations

### Business Cycles
- Fiscal year patterns
- Budget seasons
- Hiring cycles
- Product launch seasons

### Cultural Moments
- Sports events
- Entertainment releases
- Award seasons
- Political cycles

### Natural Cycles
- Weather patterns
- Academic calendars
- Travel seasons
- Consumer behavior shifts

## PARAMETERS
Target Date: ${targetDate}
Industry: ${industry || 'general'}
Region: ${region || 'global'}
Content Type: ${contentType || 'all'}
Look Ahead: ${lookAhead || '30'} days

## OUTPUT FORMAT
{
  "currentMoment": {
    "date": "string",
    "activEvents": [
      {
        "event": "string",
        "type": "holiday|awareness|industry|cultural|business",
        "relevance": number,
        "endDate": "string"
      }
    ],
    "mood": "string",
    "contentThemes": ["theme1", "theme2"]
  },
  "upcoming": [
    {
      "date": "string",
      "event": "string",
      "type": "string",
      "daysAway": number,
      "preparationNeeded": "none|light|moderate|heavy",
      "contentIdeas": ["idea1", "idea2"],
      "hashtags": ["tag1", "tag2"],
      "bestPlatforms": ["platform1", "platform2"]
    }
  ],
  "missedOpportunities": [
    {
      "event": "string",
      "when": "string",
      "nextOccurrence": "string"
    }
  ],
  "contentCalendar": [
    {
      "date": "string",
      "suggestedContent": "string",
      "hook": "string",
      "event": "string or null",
      "priority": "low|medium|high"
    }
  ],
  "industrySpecific": {
    "events": ["event1", "event2"],
    "trends": ["trend1", "trend2"],
    "opportunities": ["opp1", "opp2"]
  },
  "evergreen": {
    "suggestions": ["content that works anytime"],
    "seasonalTwists": ["how to make evergreen seasonal"]
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
          { role: 'user', content: `Generate seasonal content intelligence for ${targetDate} looking ahead ${lookAhead || 30} days.` }
        ],
        temperature: 0.7,
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
        result = { rawIntelligence: responseContent };
      }
    } catch {
      result = { rawIntelligence: responseContent };
    }

    console.log('Seasonal intelligence generated');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in seasonal intelligence:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
