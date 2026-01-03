import { supabase } from "@/integrations/supabase/client";

export interface RepurposeResponse {
  repurposedContent: string;
  suggestions: string[];
  model?: string;
}

export interface RepurposeRequest {
  content: string;
  platform: string;
  contentType: string;
  tone: string;
}

export const platforms = [
  { id: "twitter", name: "Twitter", description: "Short, engaging tweets", maxLength: 280 },
  { id: "linkedin", name: "LinkedIn", description: "Professional posts", maxLength: 3000 },
  { id: "instagram", name: "Instagram", description: "Visual storytelling", maxLength: 2200 },
  { id: "facebook", name: "Facebook", description: "Social engagement", maxLength: 5000 },
  { id: "youtube", name: "YouTube", description: "Video descriptions", maxLength: 5000 },
  { id: "blog", name: "Blog", description: "Long-form content", maxLength: 10000 },
];

export const tones = [
  { id: "professional", name: "Professional", description: "Formal business tone" },
  { id: "casual", name: "Casual", description: "Friendly and approachable" },
  { id: "humorous", name: "Humorous", description: "Light and entertaining" },
  { id: "inspirational", name: "Inspirational", description: "Motivating and uplifting" },
  { id: "educational", name: "Educational", description: "Informative and teaching" },
];

export const repurposeContent = async (request: RepurposeRequest): Promise<RepurposeResponse> => {
  const { data, error } = await supabase.functions.invoke("repurpose-content", {
    body: request,
  });

  if (error) {
    // Try to extract a clean error message from the edge function response
    let message = error.message || "Failed to repurpose content";
    try {
      const ctx = (error as any)?.context as Response | undefined;
      if (ctx) {
        const body = await ctx.clone().json().catch(() => null);
        if (body?.error) message = body.error;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return data as RepurposeResponse;
};
