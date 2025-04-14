/* eslint-disable no-console, no-undef */
/* eslint-disable @next/next/no-img-element */
'use client';

// Import the correct FFmpeg components
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Define video generation options interface
export interface VideoGenerationOptions {
  imageUrl: string;
  text: string;
  duration?: number; // Duration in seconds
  fontSize?: number;
  fontColor?: string;
  withAnimation?: boolean;
  platform?: string;
  audioUrl?: string;
  outputFormat?: 'mp4' | 'webm' | 'gif';
}

// Default options
const defaultOptions: Partial<VideoGenerationOptions> = {
  duration: 10,
  fontSize: 24,
  fontColor: 'white',
  withAnimation: true,
  outputFormat: 'mp4'
};

// Create a loading progress callback type
export type ProgressCallback = Function; // Simplified type to avoid unused var lint errors

// Track the current progress for ffmpeg operation
let currentProgress = 0;

/**
 * Initialize the FFmpeg library for video processing
 */
export const initFFmpeg = async (): Promise<void> => {
  if (ffmpegLoaded) return;
  
  try {
    // Create FFmpeg instance
    ffmpeg = new FFmpeg();
    
    if (typeof window === 'undefined') return;
    
    // Load FFmpeg with the correct parameter formats
    await ffmpeg.load({
      coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
    });
    
    console.log('FFmpeg loaded successfully');
    ffmpegLoaded = true;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw new Error(`Failed to initialize FFmpeg: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate a video from an image and text with animation effects
 * @param options Video generation options
 * @param onProgress Optional progress callback
 * @returns URL to the generated video file
 */
export const generateVideo = async (
  options: VideoGenerationOptions,
  onProgress?: ProgressCallback
): Promise<string> => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Video generation requires a browser environment');
    }
    
    // Merge with default options
    const opts = { ...defaultOptions, ...options };
    
    // Report initial progress
    if (onProgress) onProgress(0.1);
    currentProgress = 0.1;
    
    // Ensure FFmpeg is initialized
    if (!ffmpegLoaded) {
      await initFFmpeg();
    }
    
    if (!ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }
    
    // Set up a logger for FFmpeg to track progress
    ffmpeg.on('log', ({ message }) => {
      // Look for progress indicators in the message
      if (message.includes('frame=') && message.includes('fps=') && onProgress) {
        // Extract progress from FFmpeg output if possible
        currentProgress = Math.min(0.8, currentProgress + 0.1);
        onProgress(currentProgress);
      }
    });
    
    // Create a canvas to generate our frame with text overlay
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }
    
    // Set canvas dimensions
    canvas.width = 1280;
    canvas.height = 720;
    
    // Report progress
    if (onProgress) onProgress(0.2);
    currentProgress = 0.2;
    
    // Load the image
    const img = new window.Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for the image
    
    // Create a promise to wait for image loading
    const imageLoaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = opts.imageUrl;
    });
    
    // Wait for the image to load
    await imageLoaded;
    
    // Report progress
    if (onProgress) onProgress(0.3);
    currentProgress = 0.3;
    
    // Draw image on canvas with overlay and text
    const frameDataUrl = createFrameWithOverlay(img, opts, canvas, ctx);
    
    // Convert data URL to a File object
    const frameBlob = await fetch(frameDataUrl).then(r => r.blob());
    const frameFile = new File([frameBlob], 'frame.jpg', { type: 'image/jpeg' });
    
    // Create a URL to the file
    const frameUrl = URL.createObjectURL(frameFile);
    
    // Report progress
    if (onProgress) onProgress(0.4);
    currentProgress = 0.4;
    
    // Use FFmpeg to process the frame and generate a video
    
    // Write input frame to FFmpeg's virtual file system
    await ffmpeg.writeFile('frame.jpg', await fetchFile(frameFile));
    
    // Create a simplified approach - Generate video without trying to capture speech synthesis
    // This is more reliable than trying to capture browser audio
    
    // Report progress
    if (onProgress) onProgress(0.6);
    currentProgress = 0.6;
    
    // Create a video from the image (without audio for now)
    await ffmpeg.exec([
      '-loop', '1',
      '-i', 'frame.jpg',
      '-c:v', 'libx264',
      '-t', opts.duration ? opts.duration.toString() : '10',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', // Add this flag to enable streaming playback
      '-profile:v', 'baseline', // Use baseline profile for better compatibility
      '-level', '3.0', // Set level for better compatibility
      'output.mp4'
    ]);
    
    // Report progress
    if (onProgress) onProgress(0.8);
    currentProgress = 0.8;
    
    // Read the video file from FFmpeg's file system
    const data = await ffmpeg.readFile('output.mp4');
    
    // Create a Blob from the output data
    const videoBlob = new Blob([data], { type: 'video/mp4' });
    
    // Create a URL for the video blob
    const videoUrl = URL.createObjectURL(videoBlob);
    
    // Clean up: Revoke the frame URL to avoid memory leaks
    URL.revokeObjectURL(frameUrl);
    
    // Report completion
    if (onProgress) onProgress(1);
    currentProgress = 1;
    
    return videoUrl;
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error(`Failed to generate video: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Create a single frame with text overlay
 */
const createFrameWithOverlay = (
  img: HTMLImageElement,
  opts: VideoGenerationOptions & typeof defaultOptions,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): string => {
  // Calculate aspect ratio to maintain proportions
  const imgRatio = img.width / img.height;
  let drawWidth = canvas.width;
  let drawHeight = canvas.width / imgRatio;
  
  if (drawHeight > canvas.height) {
    drawHeight = canvas.height;
    drawWidth = canvas.height * imgRatio;
  }
  
  // Calculate centering
  const x = (canvas.width - drawWidth) / 2;
  const y = (canvas.height - drawHeight) / 2;
  
  // Draw the image on the canvas
  ctx.drawImage(img, x, y, drawWidth, drawHeight);
  
  // Add a semi-transparent overlay for better text visibility
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Configure text styling
  ctx.fillStyle = 'white';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Format the text for display
  const lines = formatTextForCanvas(opts.text, ctx, canvas.width - 200);
  
  // Draw the text
  const lineHeight = 50;
  const startY = (canvas.height - (lines.length * lineHeight)) / 2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
  });
  
  // Add platform indicator
  const platformLabel = getPlatformLabel(opts.platform);
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillStyle = '#4f46e5';
  ctx.fillText(platformLabel, canvas.width / 2, 50);
  
  // Add branding
  ctx.font = '16px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('Created with SmartContent Flow', canvas.width / 2, canvas.height - 30);
  
  // Convert to data URL and return
  return canvas.toDataURL('image/jpeg', 0.95);
};

/**
 * Clean up any resources and unload FFmpeg
 */
export const destroyFFmpeg = async (): Promise<void> => {
  if (ffmpeg) {
    ffmpegLoaded = false;
    ffmpeg = null;
  }
};

// Helper function to format text with line breaks for canvas
const formatTextForCanvas = (text: string, ctx: CanvasRenderingContext2D, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// Helper function to get platform label
const getPlatformLabel = (platform?: string): string => {
  if (!platform) return "Social Media Content";
  
  const platformMap: Record<string, string> = {
    linkedin: "LinkedIn Post",
    tiktok: "TikTok Script",
    instagram: "Instagram Caption",
    twitter: "Twitter Post",
    facebook: "Facebook Post"
  };
  
  return platformMap[platform.toLowerCase()] || "Social Media Content";
};

// Initialize FFmpeg instance
let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;
