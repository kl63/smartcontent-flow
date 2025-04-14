import { NextResponse } from 'next/server';
import { Platform } from '@/lib/store';

// Define the request body interface
interface ZapierPostRequest {
  platform: Platform;
  message: string;
  imageUrl: string;
  timestamp: string;
  actionData?: Record<string, any>;
}

// Handler for POST requests
export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json() as ZapierPostRequest;
    
    // Log for debugging
    console.log('Posting to Zapier:', data);
    
    // Validate the request data
    if (!data.platform || !data.message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Here we call the Zapier MCP to post the content
    try {
      // This is where we would use the actual Zapier MCP integration
      // In a real implementation, use the mcp1_add_actions or relevant Zapier MCP tool
      
      // For demonstration purposes, we're mocking a successful response
      // with a simulated delay to mimic network latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful Zapier action response
      const zapierResponse = {
        success: true,
        id: `zapier-${Date.now()}`,
        url: `https://${data.platform}.com/posts/example-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      // Return a successful response with Zapier details
      return NextResponse.json({
        success: true,
        message: `Successfully posted to ${data.platform}`,
        postUrl: zapierResponse.url,
        postId: zapierResponse.id,
        timestamp: zapierResponse.timestamp
      });
      
    } catch (zapierError) {
      console.error('Zapier MCP error:', zapierError);
      return NextResponse.json(
        {
          success: false,
          message: zapierError instanceof Error 
            ? `Zapier error: ${zapierError.message}` 
            : 'Failed to execute Zapier action'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in Zapier post API:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
