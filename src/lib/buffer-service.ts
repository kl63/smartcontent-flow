'use client';

import { Platform } from './store';

// Buffer API configuration
const BUFFER_API = {
  baseUrl: 'https://api.bufferapp.com/1',
  accessToken: process.env.NEXT_PUBLIC_BUFFER_ACCESS_TOKEN || ''
};

/**
 * Service for Buffer API integration
 * Buffer offers a free plan with up to 3 social accounts and 10 posts per account
 */

type BufferResponse = {
  success: boolean;
  message: string;
  data?: any;
};

/**
 * Post content to social media via Buffer
 */
export async function postToSocialViaBuffer(
  platform: Platform, 
  content: string, 
  imageUrl?: string | null
): Promise<BufferResponse> {
  console.log(`Posting to ${platform} via Buffer...`);
  
  try {
    if (!BUFFER_API.accessToken) {
      throw new Error('Buffer access token not configured. Please add your Buffer access token to .env.local');
    }
    
    // Map our platform to Buffer profile IDs
    // In a real implementation, you would fetch these from Buffer API
    const profileMap: Record<string, string> = {
      linkedin: 'your_linkedin_profile_id',
      twitter: 'your_twitter_profile_id',
      instagram: 'your_instagram_profile_id',
      facebook: 'your_facebook_profile_id'
    };
    
    const profileId = profileMap[platform];
    if (!profileId) {
      throw new Error(`No Buffer profile configured for ${platform}`);
    }
    
    // Create Buffer API payload
    const payload = {
      text: content,
      profile_ids: [profileId],
      media: imageUrl !== null && imageUrl !== undefined ? { photo: imageUrl } : undefined,
      // You can schedule for later by adding a "scheduled_at" parameter
    };
    
    /*
    // Post to Buffer API
    const response = await fetch(`${BUFFER_API.baseUrl}/updates/create.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BUFFER_API.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: payload.text,
        profile_ids: JSON.stringify(payload.profile_ids),
        media: payload.media ? JSON.stringify(payload.media) : ''
      })
    });
    
    if (!response.ok) {
      throw new Error(`Buffer API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    */
    
    // For demonstration, simulate successful Buffer post
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Successfully scheduled post to ${platform} via Buffer!`,
      data: {
        postId: `buffer-${Date.now()}`,
        postUrl: `https://buffer.com/app/${platform}/content`
      }
    };
  } catch (error) {
    console.error(`Error posting to ${platform} via Buffer:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : `Failed to post to ${platform}`
    };
  }
}

/**
 * Check if a user is authenticated with Buffer
 */
export function isBufferAuthenticated(): boolean {
  return !!BUFFER_API.accessToken;
}
