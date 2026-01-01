import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { 
      content,
      contentType,
      performanceData,
      targetProducts
    } = await req.json();

    console.log('Content monetization analysis, user:', user.id);

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Monetization API error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
      model: 'google/gemini-2.5-flash'
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
