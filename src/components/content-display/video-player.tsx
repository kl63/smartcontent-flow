/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useContentStore } from '@/lib/store';
import { generateVideo, initFFmpeg } from '@/lib/video-generator';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
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
    };
  }, [videoUrl]);

  // Load video from content store if available
  useEffect(() => {
    if (content.video) {
      setVideoUrl(content.video);
    }
  }, [content.video]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
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
        setIsPlaying(true);
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
  const handleDownload = () => {
    if (!videoUrl) return;
    
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `smartcontent-${selectedPlatform}-${new Date().getTime()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
              controls={false}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Custom play/pause button overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={togglePlayPause}
            >
              {!isPlaying && (
                <div className="bg-black bg-opacity-50 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-8 h-8"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
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
              onClick={togglePlayPause}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
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
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
