'use client';

import { Platform } from './store';
import { postToLinkedIn, isLinkedInAuthenticated } from './linkedin-service';
import { postToSocialViaMake, isMakeConfigured } from './make-service';
import { postToSocialViaBuffer, isBufferAuthenticated } from './buffer-service';

// Social media posting method options
export type PostingMethod = 'direct' | 'make' | 'buffer';

// Configuration for social posting
export const SOCIAL_CONFIG = {
  // Default method to use for posting
  defaultMethod: 'make' as PostingMethod,
  
  // Is the Zapier webhook available?
  zapierWebhookConfigured: false,
  
  // Is the Make.com webhook configured?
  makeWebhookConfigured: true,
  
  // Is Buffer configured?
  bufferConfigured: isBufferAuthenticated(),
  
  // Platform-specific integrations available
  availablePlatforms: {
    linkedin: true,
    twitter: false,
    instagram: false,
    facebook: false,
    tiktok: false
  }
};

/**
 * Post content to a social media platform using the best available method
 */
export async function postToSocialMedia(
  platform: Platform,
  content: string,
  imageUrl?: string | null,
  method?: PostingMethod
): Promise<{ success: boolean; message: string; data?: any }> {
  // Determine which method to use for posting
  const postingMethod = method || SOCIAL_CONFIG.defaultMethod || 'direct';
  
  console.log(`Posting to ${platform} via ${postingMethod}...`);
  
  try {
    // Post via Make.com (webhook)
    if (postingMethod === 'make' && SOCIAL_CONFIG.makeWebhookConfigured) {
      return await postToSocialViaMake(platform, content, imageUrl);
    }
    
    // Post via Buffer
    if (postingMethod === 'buffer' && SOCIAL_CONFIG.bufferConfigured) {
      return await postToSocialViaBuffer(platform, content, imageUrl);
    }
    
    // Direct posting to platform APIs
    if (postingMethod === 'direct') {
      // For LinkedIn, use the direct API integration if possible
      if (platform === 'linkedin') {
        return await postToLinkedIn(content, imageUrl);
      }
      
      // If no suitable method is available
      throw new Error(`No suitable method available to post to ${platform}`);
    }
    
    // Default error if no posting method matched
    throw new Error(`Unknown posting method: ${postingMethod}`);
    
  } catch (error) {
    console.error(`Error posting to ${platform}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : `Failed to post to ${platform}`
    };
  }
}

/**
 * Check if a platform is connected/authenticated
 */
export function isPlatformConnected(platform: Platform): boolean {
  // For Make.com integration - if Make is configured and it's the default method
  if (SOCIAL_CONFIG.makeWebhookConfigured && SOCIAL_CONFIG.defaultMethod === 'make' && isMakeConfigured()) {
    return true;
  }
  
  // Platform-specific checks
  if (platform === 'linkedin') {
    return isLinkedInAuthenticated();
  }
  
  // For other platforms
  return false;
}

/**
 * Get all available posting methods for a platform
 */
export function getAvailablePostingMethods(platform: Platform): PostingMethod[] {
  const methods: PostingMethod[] = [];
  
  // LinkedIn supports direct API
  if (platform === 'linkedin') {
    methods.push('direct');
  }
  
  // Add Make.com if configured
  if (SOCIAL_CONFIG.makeWebhookConfigured) {
    methods.push('make');
  }
  
  // Add Buffer if configured
  if (SOCIAL_CONFIG.bufferConfigured) {
    methods.push('buffer');
  }
  
  return methods;
}
