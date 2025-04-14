'use client';

/* eslint-disable no-undef */
import { Platform } from './store';

// Custom error class for API-related errors
export class ApiError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

// Check if code is running in browser
const isBrowser = typeof window !== 'undefined';

// Check if speech synthesis is available
export const isSpeechSynthesisAvailable = (): boolean => {
  return isBrowser && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

// Platform-specific prompts for text generation
const platformPrompts = {
  linkedin: (idea: string) => `Create professional LinkedIn post about: ${idea}. Include relevant hashtags. Keep it under 150 words. Focus on business value and professional insights.`,
  
  tiktok: (idea: string) => `Create engaging TikTok script about: ${idea}. Include hook, key points, and call to action. Keep it under 60 seconds when spoken. Use casual, energetic language.`,
  
  instagram: (idea: string) => `Create Instagram caption about: ${idea}. Include emojis and 5-7 relevant hashtags. Keep it under 100 words. Make it visually descriptive and engaging.`
};

// Configure OpenAI API (safely access environment variables)
const getOpenAIApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  }
  return '';
};

const OPENAI_API_KEY = getOpenAIApiKey();

// Generate text content based on idea and platform
export const generateText = async (text: string, platform: Platform): Promise<string> => {
  if (!text || !platform) {
    throw new ApiError(
      'Missing required parameters: text and platform',
      'missing_parameters'
    );
  }
  
  if (!OPENAI_API_KEY) {
    throw new ApiError(
      'OpenAI API key not configured. Please add your API key in the .env.local file.',
      'openai_api_key_missing'
    );
  }
  
  try {
    const prompt = platformPrompts[platform](text);
    
    // Use the fetch API safely in browser environments
    if (!isBrowser) {
      throw new ApiError(
        'Text generation is only supported in browser environments',
        'browser_required'
      );
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: 'system', content: 'You are a social media content creator' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    if (!response.ok) {
      // Get error information but don't use it to avoid lint errors
      await response.text();
      throw new ApiError(
        `OpenAI API error: ${response.status} ${response.statusText}`,
        'openai_api_error'
      );
    }
    
    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new ApiError(
        'No content generated from OpenAI',
        'no_content_generated'
      );
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      `Failed to generate text: ${(error as Error).message}`,
      'text_generation_failed'
    );
  }
};

// Generate image based on text using Lorem Picsum (free, no API key needed)
export const generateImage = async (text: string): Promise<string> => {
  try {
    // Extract a seed number from the text for deterministic image selection
    // This ensures similar content ideas get similar images
    const textSeed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageId = textSeed % 1000; // Limit to 1000 possible images
    
    // Set image dimensions
    const width = 800;
    const height = 600;
    
    // Create a Lorem Picsum URL with the seed
    // This service provides free placeholder images without requiring an API key
    const imageUrl = `https://picsum.photos/seed/${imageId}/${width}/${height}`;
    
    return imageUrl;
  } catch (error) {
    console.error('Image generation error:', error);
    // Fallback to a default image in case of any errors
    return 'https://picsum.photos/800/600';
  }
};

// Generate audio URL from text
export const generateAudio = async (text: string): Promise<string> => {
  if (!text) {
    throw new ApiError(
      'Missing required parameter: text',
      'missing_parameters'
    );
  }
  
  try {
    console.log('API: generateAudio called with text:', text);
    
    // For browser environments, we'll use a mock audio URL
    // In a production app, you would use a real audio API service like AWS Polly, Google Text-to-Speech, etc.
    
    // This mock implementation simulates an audio generation process
    // It creates a unique audio URL based on the text content
    
    // Create a hash from the text to use as part of the URL
    const textHash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Simulate processing time with browser-safe timeout
    if (isBrowser) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Return a mock audio URL
    // In a real implementation, this would be a URL to an audio file generated by a TTS service
    const audioUrl = `https://example.com/audio/${textHash}.mp3`;
    console.log('API: Generated audio URL:', audioUrl);
    return audioUrl;
  } catch (error) {
    console.error('Audio generation error:', error);
    throw new ApiError(
      'Failed to generate audio. Please try again.',
      'audio_generation_failed'
    );
  }
};

// Generate video by combining image and audio (enhanced implementation)
export const generateVideo = async (text: string, imageUrl: string, audioUrl: string): Promise<string> => {
  try {
    console.log('Generating video with:', { text, imageUrl, audioUrl });
    
    // Import the video generator from our implementation
    const { generateVideo: createVideoFromImageAndAudio, initFFmpeg } = await import('./video-generator');
    
    // Initialize FFmpeg if needed
    await initFFmpeg();
    
    // Generate the video with our implementation
    const videoUrl = await createVideoFromImageAndAudio({
      imageUrl: imageUrl,
      text: text,
      audioUrl: audioUrl,
      duration: 10,
      withAnimation: true,
      platform: 'social',
      outputFormat: 'mp4'
    }, (progress: number) => {
      console.log(`Video generation progress: ${Math.round(progress * 100)}%`);
    });
    
    return videoUrl;
  } catch (error) {
    console.error('Video generation error:', error);
    throw new ApiError(
      `Failed to generate video. Please try again.`,
      'video_generation_failed'
    );
  }
};

// Generate audio using Web Speech API (browser)
export const generateSpeechInBrowser = (text: string, onEnd: () => void): void => {
  if (!isSpeechSynthesisAvailable()) {
    throw new ApiError(
      'Speech synthesis is not supported in your browser.',
      'speech_synthesis_unsupported'
    );
  }
  
  try {
    if (!isBrowser) {
      throw new ApiError(
        'Speech synthesis is only available in browser environments',
        'browser_required'
      );
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = onEnd;
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Speech synthesis error:', error);
    throw new ApiError(
      'Failed to generate speech audio.',
      'speech_synthesis_failed'
    );
  }
};
