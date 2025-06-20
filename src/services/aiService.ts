
interface RepurposeRequest {
  content: string;
  platform: string;
  contentType: string;
  tone?: string;
  length?: string;
}

interface RepurposeResponse {
  repurposedContent: string;
  suggestions: string[];
}

export const repurposeContent = async (request: RepurposeRequest): Promise<RepurposeResponse> => {
  try {
    const response = await fetch('/api/repurpose-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to repurpose content');
    }

    return await response.json();
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
};

export const platforms = [
  { id: 'twitter', name: 'Twitter/X', description: 'Short, engaging tweets', maxLength: 280 },
  { id: 'linkedin', name: 'LinkedIn', description: 'Professional posts', maxLength: 3000 },
  { id: 'instagram', name: 'Instagram', description: 'Visual storytelling captions', maxLength: 2200 },
  { id: 'facebook', name: 'Facebook', description: 'Casual, engaging posts', maxLength: 5000 },
  { id: 'youtube', name: 'YouTube', description: 'Video descriptions & scripts', maxLength: 5000 },
  { id: 'blog', name: 'Blog Post', description: 'Long-form content', maxLength: 10000 },
];

export const tones = [
  { id: 'professional', name: 'Professional', description: 'Formal and business-like' },
  { id: 'casual', name: 'Casual', description: 'Friendly and conversational' },
  { id: 'humorous', name: 'Humorous', description: 'Light-hearted and funny' },
  { id: 'inspirational', name: 'Inspirational', description: 'Motivating and uplifting' },
  { id: 'educational', name: 'Educational', description: 'Informative and instructive' },
];
