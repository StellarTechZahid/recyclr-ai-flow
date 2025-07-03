
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
  console.log('Making repurpose request:', request);
  
  try {
    const response = await fetch('https://wtjgswjapvrnrckcnwer.supabase.co/functions/v1/repurpose-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0amdzd2phcHZybnJja2Nud2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzY2NzcsImV4cCI6MjA2NTkxMjY3N30.BV9EjV0AUs8cxBDRZ4A_ag6Nzj4IzmXeZXpxkXBNtTE`,
      },
      body: JSON.stringify(request),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`Failed to repurpose content: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Repurpose result:', result);
    return result;
  } catch (error) {
    console.error('Repurpose error:', error);
    throw error;
  }
};
