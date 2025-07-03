
// API route handler for content repurposing
import { NextRequest, NextResponse } from 'next/server';
import { repurposeContent } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await repurposeContent({
      content: body.content,
      platform: body.platform,
      contentType: body.contentType,
      tone: body.tone,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API repurpose error:', error);
    return NextResponse.json(
      { error: 'Failed to repurpose content' },
      { status: 500 }
    );
  }
}
