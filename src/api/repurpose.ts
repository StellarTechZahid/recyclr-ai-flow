
// API route handler for content repurposing - Fixed for React Router
export async function repurposeContent(request: {
  content: string;
  platform: string;
  contentType: string;
  tone: string;
}) {
  try {
    console.log('Making request to Hugging Face with model: mistralai/Mistral-7B-Instruct-v0.1');
    
    const response = await fetch('https://wtjgswjapvrnrckcnwer.supabase.co/functions/v1/repurpose-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0amdzd2phcHZybnJja2Nud2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzY2NzcsImV4cCI6MjA2NTkxMjY3N30.BV9EjV0AUs8cxBDRZ4A_ag6Nzj4IzmXeZXpxkXBNtTE`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to repurpose content: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API repurpose error:', error);
    throw error;
  }
}
