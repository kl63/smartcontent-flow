'use client';

import { Platform } from './store';

// Define the types of platforms we support
const PLATFORM_INFO = {
  linkedin: {
    name: 'LinkedIn',
    zapierAction: 'create_linkedin_post',
    contentKey: 'post_content',
    imageKey: 'image_url',
  },
  instagram: {
    name: 'Instagram',
    zapierAction: 'create_instagram_post',
    contentKey: 'caption',
    imageKey: 'media_url',
  },
  tiktok: {
    name: 'TikTok',
    zapierAction: 'post_tiktok_video',
    contentKey: 'caption',
    imageKey: 'video_url',
  },
  twitter: {
    name: 'Twitter',
    zapierAction: 'create_tweet',
    contentKey: 'text',
    imageKey: 'image_url',
  },
  facebook: {
    name: 'Facebook',
    zapierAction: 'create_facebook_post',
    contentKey: 'message',
    imageKey: 'media_url',
  },
};

/**
 * Create a Zapier action request for a specific platform
 * @param platform The social media platform
 * @param content The text content for the post
 * @param imageUrl Optional image URL to include
 * @returns The formatted action data for Zapier
 */
export function createZapierActionData(platform: Platform, content: string, imageUrl?: string) {
  const platformConfig = PLATFORM_INFO[platform];
  
  if (!platformConfig) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  
  // Create the base action data
  const actionData: Record<string, any> = {
    action: platformConfig.zapierAction,
    [platformConfig.contentKey]: content,
  };
  
  // Add image URL if provided
  if (imageUrl && platformConfig.imageKey) {
    actionData[platformConfig.imageKey] = imageUrl;
  }
  
  return actionData;
}

/**
 * Post content to a social media platform via Zapier
 * @param platform The platform to post to
 * @param content The text content to post
 * @param imageUrl Optional image URL to include
 * @returns Response with success status and details
 */
export async function postToSocialMedia(platform: Platform, content: string, imageUrl?: string) {
  try {
    // Create the action data for Zapier
    const actionData = createZapierActionData(platform, content, imageUrl);
    
    // Send the request to our API endpoint
    const response = await fetch('/api/zapier/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform,
        message: content,
        imageUrl,
        timestamp: new Date().toISOString(),
        actionData,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to post: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error posting to social media:', error);
    throw error;
  }
}
