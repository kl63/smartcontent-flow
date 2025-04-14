/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useContentStore } from '@/lib/store';
import { generateVideo, initFFmpeg } from '@/lib/video-generator';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { isSpeechSynthesisAvailable, generateSpeechInBrowser } from '@/lib/api';

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Keep isPlaying state as it's used in event listeners
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false);
  
  // Create an audio context for more reliable audio playback
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  const { 
    content, 
    status, 
    setStatus, 
    setContent, 
    currentStep,
    selectedPlatform
  } = useContentStore();
  
  // Initialize FFmpeg when component mounts
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        await initFFmpeg();
      } catch (error) {
        console.error('Failed to initialize FFmpeg:', error);
      }
    };
    
    loadFFmpeg();
    
    // Clean up function
    return () => {
      // If we have a videoUrl, revoke it to avoid memory leaks
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      
      // Cancel any active speech synthesis when unmounting
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [videoUrl]);

  // Initialize audio context when needed
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContext) {
      // Create audio context only when needed (on user interaction)
      const handleUserInteraction = () => {
        if (!audioContext) {
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const context = new AudioContextClass();
              setAudioContext(context);
            }
          } catch (error) {
            console.error('Could not create AudioContext:', error);
          }
        }
      };
      
      // Add event listeners for user interaction
      document.addEventListener('click', handleUserInteraction, { once: true });
      
      return () => {
        document.removeEventListener('click', handleUserInteraction);
      };
    }
  }, [audioContext]);
  
  // Load video from content store if available
  useEffect(() => {
    if (content.video) {
      setVideoUrl(content.video);
    }
  }, [content.video]);
  
  // Setup event listeners for video to sync with speech
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleVideoPlay = () => {
      // Ensure speech synthesis is available and content text exists
      if (content.text && isSpeechSynthesisAvailable()) {
        // Cancel any previous speech synthesis
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        
        // Play with a short delay to ensure video has started
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(content.text || '');
          
          // Set up utterance properties for better quality
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          // Handle when speech ends
          utterance.onend = () => {
            setSpeechSynthesisActive(false);
          };
          
          // Start speech
          window.speechSynthesis.speak(utterance);
          setSpeechSynthesisActive(true);
        }, 300);
      }
      setIsPlaying(true); // This state is used to track if the video is playing
    };
    
    const handleVideoPause = () => {
      // Cancel speech synthesis when video is paused
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeechSynthesisActive(false);
      }
      setIsPlaying(false);
    };
    
    const handleVideoEnded = () => {
      // Cancel speech synthesis when video ends
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeechSynthesisActive(false);
      }
      setIsPlaying(false);
    };
    
    // Add event listeners
    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('pause', handleVideoPause);
    video.addEventListener('ended', handleVideoEnded);
    
    return () => {
      // Remove event listeners on cleanup
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('pause', handleVideoPause);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [content.text, videoRef, speechSynthesisActive]);
  
  // We no longer need the togglePlayPause function since we're using native video controls
  // The play/pause functionality is now handled by the video's built-in controls
  
  // Generate video when requested
  const handleGenerateVideo = async () => {
    if (!content.image || !content.text) {
      setError('Image and text are required to generate a video');
      return;
    }
    
    try {
      setIsLoading(true);
      setProgress(0);
      setStatus('video', 'generating');
      
      // Generate the video using our library
      const url = await generateVideo(
        {
          imageUrl: content.image,
          text: content.text,
          platform: selectedPlatform,
          duration: 10, // 10 seconds video by default
          withAnimation: true,
        },
        (progress: number) => {
          setProgress(progress);
        }
      );
      
      setVideoUrl(url);
      setContent('video', url);
      setStatus('video', 'success');
      
      if (videoRef.current) {
        videoRef.current.play();
        // Speech will start via the play event handler
      }
    } catch (err) {
      console.error('Error generating video:', err);
      setError(`Failed to generate video: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('video', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Download the video
  const handleDownload = async () => {
    if (!videoUrl || !content.image) return;
    
    try {
      // Download image first - this is the most reliable approach
      try {
        // Fetch the image directly
        const response = await fetch(content.image);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
        
        // Get image as blob
        const imageBlob = await response.blob();
        
        // Create object URL and download link
        const imageUrl = URL.createObjectURL(imageBlob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const imageFilename = `smartcontent-image-${timestamp}.jpg`;
        const imageLink = document.createElement('a');
        imageLink.href = imageUrl;
        imageLink.download = imageFilename;
        document.body.appendChild(imageLink);
        imageLink.click();
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(imageUrl);
          document.body.removeChild(imageLink);
        }, 100);
        
        // Ask if user wants to download the text narration as well
        if (window.confirm('Image downloaded. Would you like to download the text narration as well?')) {
          // Download text narration
          const textFilename = `smartcontent-narration-${timestamp}.txt`;
          const textBlob = new Blob([content.text || ''], { type: 'text/plain' });
          const textUrl = URL.createObjectURL(textBlob);
          
          const textLink = document.createElement('a');
          textLink.href = textUrl;
          textLink.download = textFilename;
          document.body.appendChild(textLink);
          textLink.click();
          
          // Clean up
          setTimeout(() => {
            URL.revokeObjectURL(textUrl);
            document.body.removeChild(textLink);
          }, 100);
          
          window.alert('Content downloaded successfully! To create a video, you can use these files with any video editing tool.');
        }
        
      } catch (error) {
        console.error('Error downloading image:', error);
        window.alert('Failed to download image. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };
  
  // Return null if prerequisites aren't ready
  if (!content.text || 
      (currentStep < 4 && 
       status.audio !== 'success' && 
       status.video !== 'generating' && 
       status.video !== 'success')) {
    return null;
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Video container with responsive sizing */}
      <div 
        className="relative bg-gray-900 rounded-md overflow-hidden" 
        style={{ width: '100%', maxWidth: 640, height: 'auto', aspectRatio: '16/9' }}
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              controls={true}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Remove custom play/pause button overlay since we're using native controls */}
          </>
        ) : (
          // Display image or placeholder if video not generated yet
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            {content.image ? (
              <div className="relative w-full h-full">
                {/* Using Next.js Image for optimization */}
                <Image 
                  src={content.image}
                  alt="Content"
                  fill
                  sizes="(max-width: 640px) 100vw, 640px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-white text-center p-4">
                {isLoading ? 'Generating video...' : 'Generate a video from your content'}
              </div>
            )}
          </div>
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
            <div className="text-white mb-4">Generating video...</div>
            <Progress value={progress * 100} className="w-3/4 mb-2" />
            <div className="text-white text-sm">{Math.round(progress * 100)}%</div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      {/* Control buttons */}
      <div className="flex space-x-2">
        {!videoUrl && (
          <Button 
            onClick={handleGenerateVideo} 
            disabled={isLoading || !content.image || !content.text}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? 'Generating...' : 'Generate Video'}
          </Button>
        )}
        
        {videoUrl && (
          <>
            <Button 
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Download
            </Button>
            
            <Button 
              onClick={handleGenerateVideo}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Regenerate
            </Button>
            
            {/* Add an explicit play with audio button */}
            <Button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.play();
                  
                  // Explicitly start speech synthesis
                  if (content.text && isSpeechSynthesisAvailable()) {
                    const utterance = new SpeechSynthesisUtterance(content.text);
                    utterance.rate = 1.0;
                    utterance.pitch = 1.0;
                    utterance.volume = 1.0;
                    window.speechSynthesis.speak(utterance);
                  }
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Play with Audio
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
