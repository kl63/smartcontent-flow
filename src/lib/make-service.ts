'use client';

import { Platform } from './store';
import { useState, useEffect } from 'react';

// Make.com webhook configuration
// This will be loaded from the config file
let MAKE_WEBHOOK_URL = '';

// Try to load the webhook URL from the server
export async function loadMakeWebhookUrl(): Promise<string> {
  try {
    const response = await fetch('/api/config/make-webhook');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.webhookUrl) {
        MAKE_WEBHOOK_URL = data.webhookUrl;
        return data.webhookUrl;
      }
    }
    return '';
  } catch (error) {
    console.error('Error loading Make.com webhook URL:', error);
    return '';
  }
}

// Save the webhook URL to the server
export async function saveMakeWebhookUrl(webhookUrl: string): Promise<boolean> {
  try {
    const response = await fetch('/api/config/make-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ webhookUrl })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        MAKE_WEBHOOK_URL = webhookUrl;
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error saving Make.com webhook URL:', error);
    return false;
  }
}

// Load webhook URL on client-side
if (typeof window !== 'undefined') {
  loadMakeWebhookUrl().catch(console.error);
}

/**
 * Service for Make.com integration
 * Make.com offers 1,000 free operations per month
 */

type MakeResponse = {
  success: boolean;
  message: string;
  data?: any;
};

/**
 * Check if Make.com is configured
 */
export function isMakeConfigured(): boolean {
  return Boolean(MAKE_WEBHOOK_URL);
}

/**
 * React hook to get and set the Make.com webhook URL
 */
export function useMakeWebhookUrl() {
  const [webhookUrl, setWebhookUrlState] = useState<string>(MAKE_WEBHOOK_URL || '');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load webhook URL from server or localStorage
    loadMakeWebhookUrl()
      .then(url => {
        if (url) {
          setWebhookUrlState(url);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  
  const setWebhookUrl = async (url: string) => {
    // Allow immediate UI updates while saving in background
    setWebhookUrlState(url);
    
    // Then save to server in the background
    const success = await saveMakeWebhookUrl(url);
    return success;
  };
  
  return { webhookUrl, setWebhookUrl, loading };
}

/**
 * Post content to social media via Make.com
 */
export async function postToSocialViaMake(
  platform: Platform, 
  content: string, 
  imageUrl?: string
): Promise<MakeResponse> {
  console.log(`Posting to ${platform} via Make.com...`);
  
  try {
    // Ensure we have the latest webhook URL
    if (!MAKE_WEBHOOK_URL) {
      MAKE_WEBHOOK_URL = await loadMakeWebhookUrl();
    }
    
    if (!MAKE_WEBHOOK_URL) {
      throw new Error('Make.com webhook URL not configured. Please set up a Make.com account and add your webhook URL in Settings.');
    }
    
    // Create payload for Make.com webhook
    const payload: any = {
      // Simple format recommended by Make.com for LinkedIn posts
      text: content,
      url: "https://smartcontentflow.app",
      post_type: imageUrl ? "image" : "text",
      // No need for additional fields - keeping it simple
    };
    
    // Only include image_url if one is provided
    if (imageUrl) {
      payload.image_url = imageUrl;
    }
    
    console.log('Sending to Make.com:', payload);
    
    // Post to Make.com webhook
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Make.com response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to post via Make.com: ${response.statusText}`);
    }
    
    // Return success response
    return {
      success: true,
      message: `Successfully posted to ${platform}!`,
      data: {
        postId: `post-${Date.now()}`,
        postUrl: `https://${platform}.com/feed/update/example-${Date.now()}`
      }
    };
  } catch (error) {
    console.error(`Error posting to ${platform} via Make.com:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : `Failed to post to ${platform}`
    };
  }
}
