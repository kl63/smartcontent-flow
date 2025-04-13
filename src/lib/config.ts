// Configuration settings for API integration

/**
 * API configuration for the application.
 * In a production application, these values would be loaded from environment variables.
 * For this demo, we're using placeholder values that will be replaced at runtime.
 */

// API Configuration
export type Platform = 'linkedin' | 'tiktok' | 'instagram';

export interface ApiConfig {
  openai: {
    apiKey: string | null;
    model: string;
  };
  unsplash: {
    accessKey: string | null;
  };
}

// Helper to safely access environment variables
const getEnvVar = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    // Check localStorage first (for client-side storage)
    const localStorageKey = key.toLowerCase().replace('next_public_', '');
    const localStorageValue = localStorage.getItem(localStorageKey);
    if (localStorageValue) return localStorageValue;

    // Directly access from window for Next.js public env vars
    const windowEnv = (window as any).__ENV__ || {};
    if (windowEnv[key]) return windowEnv[key];
    
    // Access from process.env for client-side Next.js
    if (process.env[key]) return process.env[key] as string;
  }
  
  // Server-side access
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || null;
  }
  
  return null;
};

// Store API keys in localStorage for debugging
const storeApiKeysInLocalStorage = () => {
  if (typeof window !== 'undefined') {
    // Get OpenAI API key
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
    
    // Get Unsplash API key
    const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    if (unsplashKey) localStorage.setItem('unsplash_access_key', unsplashKey);
    
    // Log for debugging
    console.log("API keys stored in localStorage");
  }
};

// Try to store API keys when the config module is loaded
if (typeof window !== 'undefined') {
  console.log("Attempting to store API keys");
  storeApiKeysInLocalStorage();
  
  // Debug: directly log the environment variables (without exposing full keys)
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  
  console.log("Environment variables available:");
  console.log("OpenAI API key:", openaiKey ? `${openaiKey.substring(0, 5)}...${openaiKey.substring(openaiKey.length - 4)}` : "Not found");
  console.log("Unsplash API key:", unsplashKey ? `${unsplashKey.substring(0, 5)}...${unsplashKey.substring(unsplashKey.length - 4)}` : "Not found");
}

export const isOpenAIConfigured = (): boolean => {
  const apiKey = getEnvVar('NEXT_PUBLIC_OPENAI_API_KEY');
  return !!apiKey && apiKey.length > 20;
};

export const isUnsplashConfigured = (): boolean => {
  const apiKey = getEnvVar('NEXT_PUBLIC_UNSPLASH_ACCESS_KEY');
  return !!apiKey && apiKey.length > 10;
};

// If environment variables aren't available, try to use hardcoded values for testing only
// IMPORTANT: This is just for development and should be removed in production
const HARDCODED_UNSPLASH_KEY = 'Zl-Ba_feKBlylermRTve6oW4E10o0n8dGAGovzAVMUY';

// API Configuration
export const apiConfig: ApiConfig = {
  openai: {
    apiKey: getEnvVar('NEXT_PUBLIC_OPENAI_API_KEY'),
    model: 'gpt-3.5-turbo',
  },
  unsplash: {
    // Try to get from env var first, then localStorage, then fallback to hardcoded value
    accessKey: getEnvVar('NEXT_PUBLIC_UNSPLASH_ACCESS_KEY') || 
               (typeof window !== 'undefined' ? localStorage.getItem('unsplash_access_key') : null) || 
               HARDCODED_UNSPLASH_KEY
  },
};

/**
 * Platform-specific prompts for AI text generation
 */
export const platformPrompts: Record<Platform, (basePrompt: string) => string> = {
  linkedin: (basePrompt: string) => `
    Create a professional LinkedIn post about: "${basePrompt}"
    
    Make it:
    - Professional and thoughtful
    - Include relevant hashtags (3-5)
    - Add a call to action
    - Keep it under 300 words
    - Use line breaks appropriately for readability
    
    Format as plain text, ready to post.
  `,
  tiktok: (basePrompt: string) => `
    Create a catchy TikTok caption about: "${basePrompt}"
    
    Make it:
    - Attention-grabbing and trendy
    - Include 3-5 relevant hashtags
    - Use emojis effectively
    - Keep it under 100 characters if possible
    - Make it casual and engaging
    
    Format as plain text, ready to post.
  `,
  instagram: (basePrompt: string) => `
    Create an engaging Instagram caption about: "${basePrompt}"
    
    Make it:
    - Visually descriptive and evocative
    - Include line breaks for readability
    - Add 5-7 relevant hashtags
    - Use emojis where appropriate
    - Balance personal tone with broad appeal
    
    Format as plain text, ready to post.
  `,
};
