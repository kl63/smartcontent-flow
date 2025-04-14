'use client';

import { Platform } from './store';

// Your Zapier webhook URL
const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/14002250/20em4b9/';

/**
 * Service for handling Zapier webhook integration 
 * This makes it easier to connect and post to social media accounts
 */

// Types for API responses
type ZapierResponse = {
  success: boolean;
  message: string;
  data?: any;
};

/**
 * Connect to a social media platform (simulated)
 */
export async function connectPlatform(platform: Platform): Promise<ZapierResponse> {
  console.log(`Connecting to ${platform}...`);

  try {
    // This is a simulated connection since webhooks don't require authentication
    // In a real app, you'd store the platform connection status in a database
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Store connection in localStorage for demo
    const accounts = JSON.parse(localStorage.getItem('socialConnections') || '{}');
    accounts[platform] = true;
    localStorage.setItem('socialConnections', JSON.stringify(accounts));
    
    return {
      success: true,
      message: `Successfully connected to ${platform}!`,
      data: {
        accountId: `${platform}-account-${Date.now()}`,
        accountName: `Your ${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`
      }
    };
  } catch (error) {
    console.error(`Error connecting to ${platform}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : `Failed to connect to ${platform}`
    };
  }
}

/**
 * Post content to LinkedIn using your Zapier webhook
 */
export async function postToSocialViaMCP(
  platform: Platform, 
  content: string, 
  imageUrl?: string
): Promise<ZapierResponse> {
  console.log(`Posting to ${platform} via Zapier webhook...`);
  
  try {
    // Only proceed if we're posting to LinkedIn for now
    if (platform !== 'linkedin') {
      throw new Error(`Currently only LinkedIn posting is supported through Zapier`);
    }
    
    // Create payload for Zapier webhook
    // This should match the data expected by your LinkedIn "Create Share Update" action
    const payload = {
      platform,
      content, // Main post text
      image_url: imageUrl, // Optional image URL
      post_tags: extractHashtags(content), // Extract hashtags from content
      timestamp: new Date().toISOString(),
      visibility: 'anyone' // Public visibility
    };
    
    // Post to Zapier webhook
    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to post to Zapier: ${response.statusText}`);
    }
    
    // Zapier webhooks typically don't return data, so we'll simulate a success response
    return {
      success: true,
      message: `Successfully posted to ${platform}!`,
      data: {
        postId: `post-${Date.now()}`,
        postUrl: `https://linkedin.com/feed/update/example-${Date.now()}`
      }
    };
  } catch (error) {
    console.error(`Error posting to ${platform}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : `Failed to post to ${platform}`
    };
  }
}

/**
 * Extract hashtags from content
 */
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return (content.match(hashtagRegex) || []).map(tag => tag.substring(1));
}

/**
 * Get connected social media accounts
 */
export function getConnectedAccounts(): Record<Platform, boolean> {
  if (typeof window === 'undefined') {
    return {} as Record<Platform, boolean>;
  }
  
  try {
    const savedConnections = localStorage.getItem('socialConnections');
    if (savedConnections) {
      return JSON.parse(savedConnections) as Record<Platform, boolean>;
    }
  } catch (error) {
    console.error('Error getting connected accounts:', error);
  }
  
  return {} as Record<Platform, boolean>;
}
