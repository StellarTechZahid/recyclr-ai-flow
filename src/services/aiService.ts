
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
  console.log('Making AI repurpose request:', request);
  
  try {
    const response = await fetch('https://wtjgswjapvrnrckcnwer.supabase.co/functions/v1/repurpose-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0amdzd2phcHZybnJja2Nud2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzY2NzcsImV4cCI6MjA2NTkxMjY3N30.BV9EjV0AUs8cxBDRZ4A_ag6Nzj4IzmXeZXpxkXBNtTE`,
      },
      body: JSON.stringify(request),
    });

    console.log('Edge function response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function response:', response.status, errorText);
      throw new Error(`Failed to repurpose content: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Successful AI response:', result);
    
    if (!result.repurposedContent) {
      throw new Error('No repurposed content received from AI service');
    }

    return result;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error; // Don't provide fallback, let user know AI failed
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
