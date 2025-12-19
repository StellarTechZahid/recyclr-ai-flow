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
    const apiKey = Deno.env.get('GROQ_GPT_OSS_120B_KEY');
    if (!apiKey) {
      throw new Error('GROQ_GPT_OSS_120B_KEY not configured');
    }

    const { 
      content,
      contentType,
      performanceData,
      targetProducts
    } = await req.json();

    console.log('Content monetization analysis');

    const systemPrompt = `You are a content monetization expert who helps creators turn their content into revenue-generating assets. You understand e-books, courses, merch, and digital products.`;

    const userPrompt = `Analyze this content for monetization opportunities:

Content:
${content}

Content Type: ${contentType || 'blog post'}
${performanceData ? `Performance Data: ${JSON.stringify(performanceData)}` : ''}
${targetProducts ? `Interested in: ${targetProducts.join(', ')}` : ''}

Provide monetization strategies:

{
  "contentAnalysis": {
    "mainTopics": [],
    "expertise": "",
    "audienceValue": "",
    "monetizationPotential": "low/medium/high"
  },
  "products": {
    "ebook": {
      "viable": true/false,
      "title": "",
      "chapters": [],
      "estimatedLength": "",
      "priceRange": "",
      "creationEffort": ""
    },
    "course": {
      "viable": true/false,
      "title": "",
      "modules": [],
      "format": "video/text/hybrid",
      "priceRange": "",
      "platforms": []
    },
    "newsletter": {
      "viable": true/false,
      "frequency": "",
      "monetizationModel": "",
      "growthStrategy": ""
    },
    "consulting": {
      "viable": true/false,
      "services": [],
      "hourlyRate": "",
      "packageIdeas": []
    },
    "merch": {
      "viable": true/false,
      "ideas": [],
      "platforms": [],
      "estimatedMargin": ""
    }
  },
  "quickWins": [
    {
      "product": "",
      "effort": "1-10",
      "potential": "1-10",
      "timeToLaunch": ""
    }
  ],
  "contentPipeline": {
    "freeContent": [],
    "leadMagnets": [],
    "paidProducts": [],
    "premiumOffers": []
  },
  "revenueProjections": {
    "conservative": "",
    "moderate": "",
    "optimistic": ""
  }
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`Monetization API error: ${response.status}`);
    }

    const result = await response.json();
    let responseContent = result.choices?.[0]?.message?.content || '';

    let monetization;
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        monetization = JSON.parse(jsonMatch[0]);
      } else {
        monetization = { raw: responseContent };
      }
    } catch {
      monetization = { raw: responseContent };
    }

    console.log('Monetization analysis complete');

    return new Response(JSON.stringify({
      ...monetization,
      model: 'gpt-oss-120b'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Monetization error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
