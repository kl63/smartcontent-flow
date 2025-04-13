/* eslint-disable no-undef */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Download, Share2, RefreshCw, Info, Play, Pause } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { generateVideo, isSpeechSynthesisAvailable } from "@/lib/api";
import Image from "next/image";

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

// Average speaking rate (words per minute)
const AVERAGE_SPEAKING_RATE = 150;

const VideoPlayer = () => {
  const { 
    content, 
    status, 
    setContent, 
    setStatus,
    setCurrentStep
  } = useContentStore();
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const animationRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const totalDurationRef = useRef<number>(0);
  
  // Keep track of the speech utterance
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Calculate estimated duration based on word count
  useEffect(() => {
    if (content.text) {
      const wordCount = content.text.split(/\s+/).filter(word => word.length > 0).length;
      // Calculate duration in milliseconds (words / words per minute * 60 seconds * 1000ms)
      const estimatedDuration = (wordCount / AVERAGE_SPEAKING_RATE) * 60 * 1000;
      totalDurationRef.current = Math.max(estimatedDuration, 3000); // Minimum 3 seconds
    }
  }, [content.text]);
  
  // Animation effects for the video player
  useEffect(() => {
    if (isPlaying && content.image) {
      // Start tracking time for progress bar
      startTimeRef.current = Date.now();
      
      // Update progress bar every 50ms
      const updateProgress = () => {
        if (startTimeRef.current && totalDurationRef.current > 0) {
          const elapsed = Date.now() - startTimeRef.current;
          const percent = Math.min(100, (elapsed / totalDurationRef.current) * 100);
          setProgressPercent(percent);
          
          if (percent < 100) {
            progressTimerRef.current = window.setTimeout(updateProgress, 50);
          } else {
            // Auto-stop at the end
            setIsPlaying(false);
            startTimeRef.current = null;
          }
        }
      };
      
      // Start progress updates
      progressTimerRef.current = window.setTimeout(updateProgress, 50);
      
      // Create a simple animation loop for visual effects
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      // Clean up animation and timers
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (progressTimerRef.current) {
          clearTimeout(progressTimerRef.current);
        }
      };
    } else {
      // Pause progress updates
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
    }
  }, [isPlaying, content.image]);
  
  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (isBrowser && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Generate video when audio is successfully generated
  useEffect(() => {
    const generateVideoContent = async () => {
      if (content.text && content.image && content.audio && status.audio === 'success' && status.video === 'generating') {
        try {
          setErrorMessage(null);
          // We're using the image URL as a placeholder for the video in this demo
          // In a real implementation, you would use a video creation API
          const videoUrl = await generateVideo(content.text, content.image, content.audio);
          setContent('video', videoUrl);
          setStatus('video', 'success');
          setCurrentStep(4); // Complete
        } catch (error) {
          console.error('Error generating video:', error);
          setStatus('video', 'error');
          setErrorMessage(error instanceof Error ? error.message : 'Failed to generate video. Please try again.');
        }
      }
    };

    generateVideoContent();
  }, [content.text, content.image, content.audio, status.audio, status.video, setContent, setCurrentStep, setStatus]);

  const togglePlayPause = () => {
    if (!content.text || !isBrowser) return;
    
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    // Handle speech synthesis based on play/pause state
    if (newPlayingState) {
      // Start playing - reset progress if we finished before
      if (progressPercent >= 100) {
        setProgressPercent(0);
      }
      
      startTimeRef.current = Date.now() - (progressPercent / 100) * totalDurationRef.current;
      
      if (window.speechSynthesis) {
        try {
          // Check if speech synthesis is available
          if (!isSpeechSynthesisAvailable()) {
            throw new Error('Speech synthesis is not supported in your browser.');
          }
          
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          
          // Create new utterance
          const utterance = new SpeechSynthesisUtterance(content.text);
          utterance.rate = 1;
          utterance.pitch = 1;
          utterance.volume = 1;
          
          // When speech ends, pause the video if it was this utterance
          utterance.onend = () => {
            if (utteranceRef.current === utterance) {
              setIsPlaying(false);
              setProgressPercent(100);
            }
          };
          
          // Store the utterance reference
          utteranceRef.current = utterance;
          
          // Start speaking
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Error playing audio:', error);
          setErrorMessage('Could not play audio narration. The animation will play without sound.');
        }
      }
    } else {
      // Pause the speech
      if (window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
    }
  };

  const handleRegenerate = async () => {
    if (!content.text || !content.image || !content.audio) return;
    
    try {
      setErrorMessage(null);
      setStatus('video', 'generating');
      // We're using the image URL as a placeholder for the video in this demo
      const videoUrl = await generateVideo(content.text, content.image, content.audio);
      setContent('video', videoUrl);
      setStatus('video', 'success');
      setProgressPercent(0); // Reset progress
    } catch (error) {
      console.error('Error regenerating video:', error);
      setStatus('video', 'error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to regenerate video. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!content.image || !isBrowser || !content.text) return;
    
    try {
      // Create a timestamp for filenames
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const imageFilename = `smartcontent-image-${timestamp}.jpg`;
      
      // Download image first - this is the most reliable approach
      try {
        // Fetch the image directly
        const response = await fetch(content.image);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
        
        // Get image as blob
        const imageBlob = await response.blob();
        
        // Create object URL and download link
        const imageUrl = URL.createObjectURL(imageBlob);
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
          const textBlob = new Blob([content.text], { type: 'text/plain' });
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
      window.alert('Failed to download content. Please try again.');
    }
  };

  const handleShare = () => {
    if (!isBrowser || !content.image || !content.text) return;
    
    try {
      // Get the platform from the content store
      const { selectedPlatform } = useContentStore.getState();
      
      // Create a formatted shareable text with the image link
      const shareText = `🔥 AI-Generated Content for ${selectedPlatform || 'social media'}\n\n${content.text}\n\nImage: ${content.image}`;
      
      // Try to use the native share API, but fall back to clipboard copy
      if (navigator.share) {
        navigator.share({
          title: `AI-Generated Content for ${selectedPlatform || 'social media'}`,
          text: shareText
        }).catch((error) => {
          console.error('Error sharing:', error);
          // If share fails, fall back to clipboard
          copyToClipboard(shareText);
        });
      } else {
        // Copy to clipboard as fallback
        copyToClipboard(shareText);
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share content. Please try again.');
    }
  };
  
  // Helper function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Content copied to clipboard! You can now paste it to share with others.');
    }).catch(() => {
      // Final fallback - show the text to manually copy
      alert('Could not copy automatically. Please copy this content manually:\n\n' + text);
    });
  };

  // Return null if not at the video generation step or if prerequisites aren't ready
  if (!content.text || !content.image || !content.audio || status.audio !== 'success') return null;

  // Split the text into words to show them animated
  const words = content.text?.split(' ') || [];
  // Calculate how many words to show based on progress
  const wordsToShow = Math.min(words.length, Math.floor((progressPercent / 100) * words.length) + 1);
  const animatedText = words.slice(0, wordsToShow).join(' ');
  
  // Calculate animation effects based on the animation frame
  const animationProgress = progressPercent / 100;
  const scale = 1 + Math.sin(animationProgress * Math.PI * 2) * 0.02;
  const translateX = Math.sin(animationProgress * Math.PI * 3) * 4;
  const translateY = Math.cos(animationProgress * Math.PI * 2) * 4;
  const brightness = 100 + Math.sin(animationProgress * Math.PI * 4) * 8;
  
  // Format time for display (MM:SS)
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate current time and total time
  const currentTimeMs = (progressPercent / 100) * totalDurationRef.current;
  const totalTimeMs = totalDurationRef.current;
  
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            Social Media Video
            <Button variant="ghost" size="sm" className="ml-1 p-0 h-6 w-6" title="This is a demo with animated effects and audio narration">
              <Info className="h-4 w-4 text-gray-400" />
            </Button>
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRegenerate}
              disabled={status.video === 'generating'}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
            </Button>
            {content.video && status.video === 'success' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload}
                  className="h-8 px-2 text-xs"
                >
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare}
                  className="h-8 px-2 text-xs"
                >
                  <Share2 className="h-4 w-4 mr-1" /> Share
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status.video === 'generating' ? (
          <div className="w-full p-8 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#6B7280]">Creating social media video...</div>
          </div>
        ) : status.video === 'error' ? (
          <div className="w-full p-8 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#EF4444]">
              {errorMessage || 'Error generating video. Please try again.'}
            </div>
          </div>
        ) : content.video ? (
          <div className="relative w-full bg-black rounded-md overflow-hidden aspect-video">
            {/* Animated image with subtle movements */}
            <div 
              className="w-full h-full transition-transform duration-500 ease-in-out"
              style={{
                transform: isPlaying ? `scale(${scale}) translate(${translateX}px, ${translateY}px)` : 'none',
                filter: isPlaying ? `brightness(${brightness}%)` : 'none'
              }}
            >
              <Image 
                src={content.image} 
                alt="AI-generated content"
                className="w-full h-full object-cover"
                width={800}
                height={600}
              />
            </div>
            
            {/* Animated text overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black to-transparent">
              <div className="text-white text-lg font-medium mb-2 line-clamp-2">
                {isPlaying ? animatedText : content.text}
              </div>
              
              {/* Play/pause button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={togglePlayPause}
                  variant="outline"
                  className={`rounded-full w-16 h-16 ${isPlaying ? 'bg-black/30' : 'bg-white/30'} backdrop-blur-sm hover:bg-white/50 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'} transition-opacity duration-300`}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-white" />
                  ) : (
                    <Play className="h-8 w-8 text-white" />
                  )}
                </Button>
              </div>
              
              {/* Control bar at bottom */}
              <div className="flex items-center">
                <Button
                  onClick={togglePlayPause}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <><Pause className="h-4 w-4 mr-1" /> Pause</>
                  ) : (
                    <><Play className="h-4 w-4 mr-1" /> Play</>
                  )}
                </Button>
                
                {/* Time display */}
                <span className="text-white text-xs mr-2">
                  {formatTime(currentTimeMs)}
                </span>
                
                {/* Progress bar */}
                <div className="flex-grow mx-2 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                
                {/* Total duration */}
                <span className="text-white text-xs ml-2">
                  {formatTime(totalTimeMs)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
