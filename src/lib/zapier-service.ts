'use client';

import { Platform } from './store';

// Interface for Zapier action request
interface ZapierActionRequest {
  platform: Platform;
  text: string;
  imageUrl?: string;
}

// Interface for Zapier action response
interface ZapierActionResponse {
  success: boolean;
  postUrl?: string;
  message?: string;
}

/**
 * Post content to a social media platform via Zapier
 * @param platform The social platform to post to
 * @param text The text content to post
 * @param imageUrl Optional image URL to include in post
 * @returns Response with success status and post details
 */
export const postToSocialMedia = async (
  platform: Platform,
  text: string,
  imageUrl?: string
): Promise<ZapierActionResponse> => {
  try {
    console.log(`Preparing to post to ${platform}:`, { text, imageUrl });
    
    // Here we would integrate with Zapier MCP
    // For now, we'll mock a successful response
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would make an API call to Zapier
    // const response = await mcp1_add_actions({...})
    
    // Return a mock response
    return {
      success: true,
      message: `Successfully posted to ${platform}`,
      postUrl: 'https://platform.com/your-post-url'
    };
  } catch (error) {
    console.error('Error posting to social media:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to post to social media'
    };
  }
};

/**
 * Get the character limit for a specific platform
 * @param platform Social media platform
 * @returns Character limit
 */
export const getPlatformCharacterLimit = (platform: Platform): number => {
  const limits: Record<Platform, number> = {
    linkedin: 3000,
    tiktok: 2200,
    instagram: 2200,
    twitter: 280,
    facebook: 63206,
  };
  
  return limits[platform] || 1000; // Default to 1000 if platform not found
};

/**
 * Check if content is valid for a specific platform
 * @param platform Social media platform
 * @param text Content text
 * @returns Validation result with error message if invalid
 */
export const validateContent = (
  platform: Platform, 
  text: string
): { valid: boolean; errorMessage?: string } => {
  const limit = getPlatformCharacterLimit(platform);
  
  if (text.length > limit) {
    return {
      valid: false,
      errorMessage: `Content exceeds the ${platform} character limit of ${limit}`
    };
  }
  
  return { valid: true };
};
