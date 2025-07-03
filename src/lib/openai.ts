
// OpenAI integration for advanced AI features
export interface AIRepurposeRequest {
  content: string;
  targetFormat: string;
  tone?: string;
  platform?: string;
}

export interface AIRepurposeResponse {
  repurposedContent: string;
  suggestions: string[];
  wordCount: number;
}

export const repurposeWithAI = async (request: AIRepurposeRequest): Promise<AIRepurposeResponse> => {
  // This uses the existing Hugging Face edge function for now
  // Can be extended to use OpenAI for more advanced features
  const response = await fetch('/api/repurpose', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: request.content,
      platform: request.platform || 'twitter',
      contentType: 'article',
      tone: request.tone || 'professional',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to repurpose content');
  }

  const data = await response.json();
  
  return {
    repurposedContent: data.repurposedContent,
    suggestions: data.suggestions || [],
    wordCount: data.repurposedContent?.split(' ').length || 0,
  };
};
