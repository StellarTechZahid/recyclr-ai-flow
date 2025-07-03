
export interface RepurposeResponse {
  repurposedContent: string;
  suggestions: string[];
  model?: string; // Add this optional property
}

export interface RepurposeRequest {
  content: string;
  platform: string;
  contentType: string;
  tone: string;
}

export const platforms = [
  { id: 'twitter', name: 'Twitter', description: 'Short, engaging tweets', maxLength: 280 },
  { id: 'linkedin', name: 'LinkedIn', description: 'Professional posts', maxLength: 3000 },
  { id: 'instagram', name: 'Instagram', description: 'Visual storytelling', maxLength: 2200 },
  { id: 'facebook', name: 'Facebook', description: 'Social engagement', maxLength: 5000 },
  { id: 'youtube', name: 'YouTube', description: 'Video descriptions', maxLength: 5000 },
  { id: 'blog', name: 'Blog', description: 'Long-form content', maxLength: 10000 }
];

export const tones = [
  { id: 'professional', name: 'Professional', description: 'Formal business tone' },
  { id: 'casual', name: 'Casual', description: 'Friendly and approachable' },
  { id: 'humorous', name: 'Humorous', description: 'Light and entertaining' },
  { id: 'inspirational', name: 'Inspirational', description: 'Motivating and uplifting' },
  { id: 'educational', name: 'Educational', description: 'Informative and teaching' }
];

export const repurposeContent = async (request: RepurposeRequest): Promise<RepurposeResponse> => {
  const response = await fetch('/api/repurpose', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to repurpose content: ${response.status}`);
  }

  const result = await response.json();
  return result;
};
