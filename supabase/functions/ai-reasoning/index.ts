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
    const { prompt, systemPrompt, model, temperature, maxTokens, tools } = await req.json();

    // Select API key based on model
    const modelType = model || 'gpt-oss-120b';
    let apiKey: string | undefined;
    let modelName: string;

    switch (modelType) {
      case 'gpt-oss-20b':
        apiKey = Deno.env.get('GROQ_GPT_OSS_20B_KEY');
        modelName = 'gpt-oss-20b';
        break;
      case 'kimi-k2':
        apiKey = Deno.env.get('GROQ_KIMI_K2_KEY');
        modelName = 'kimi-k2';
        break;
      case 'llama-3.3-70b':
        apiKey = Deno.env.get('GROQ_LLAMA_3_3_70B_KEY');
        modelName = 'llama-3.3-70b-versatile';
        break;
      default:
        apiKey = Deno.env.get('GROQ_GPT_OSS_120B_KEY');
        modelName = 'gpt-oss-120b';
    }

    if (!apiKey) {
      throw new Error(`API key not configured for model: ${modelType}`);
    }

    console.log('AI Reasoning called with model:', modelName);

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const requestBody: any = {
      model: modelName,
      messages,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 2048,
    };

    // Add tools for function calling if provided
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Reasoning API error:', error);
      throw new Error(`Reasoning API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    const toolCalls = result.choices?.[0]?.message?.tool_calls;

    console.log('Reasoning complete, response length:', content.length);

    return new Response(JSON.stringify({
      content,
      toolCalls,
      model: modelName,
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Reasoning error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
