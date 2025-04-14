'use client';

/* eslint-disable no-undef */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Download, Share2, Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { generateVideo, isSpeechSynthesisAvailable, generateSpeechInBrowser } from "@/lib/api";

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

const VideoDisplay = () => {
  const { 
    content, 
    status, 
    setContent, 
    setStatus,
    setCurrentStep
  } = useContentStore();
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate video when audio is successfully generated
  useEffect(() => {
    const createVideo = async () => {
      if (
        content.text && 
        content.image && 
        content.audio && 
        status.audio === 'success' && 
        status.video === 'generating'
      ) {
        try {
          const videoUrl = await generateVideo(content.text, content.image, content.audio);
          setContent('video', videoUrl);
          setStatus('video', 'success');
          setCurrentStep(4);
        } catch (error) {
          if (isBrowser && window.console) {
            window.console.error('Error generating video:', error);
          }
          setStatus('video', 'error');
        }
      }
    };

    createVideo();
  }, [content.text, content.image, content.audio, status.audio, status.video, setContent, setStatus, setCurrentStep]);

  // Handle video playback with synchronized speech
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;
    
    const handlePlay = () => {
      if (content.text && isSpeechSynthesisAvailable()) {
        // Start speech synthesis when video plays
        generateSpeechInBrowser(content.text, () => {
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    };
    
    const handlePause = () => {
      // Stop speech synthesis when video pauses
      if (isBrowser && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
    };
    
    const handleEnded = () => {
      // Stop speech synthesis when video ends
      if (isBrowser && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
    };
    
    // Add event listeners
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    
    // Clean up event listeners
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [content.text]);

  const handleDownload = () => {
    if (!content.video || !isBrowser) return;
    
    try {
      // Create a temporary link to download the video
      const link = document.createElement('a');
      link.href = content.video;
      link.download = 'ai-generated-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      if (window.console) {
        window.console.error('Download error:', error);
      }
    }
  };

  const handleShare = () => {
    if (!content.video || !isBrowser) return;
    
    try {
      if (window.navigator.share) {
        window.navigator.share({
          title: 'AI Generated Video',
          text: content.text || 'Check out this AI-generated video!',
          url: content.video
        }).catch((error) => {
          if (window.console) {
            window.console.error('Error sharing:', error);
          }
        });
      } else {
        // Fallback for browsers without Web Share API
        window.navigator.clipboard.writeText(content.video);
        window.alert('Video URL copied to clipboard! You can now paste it to share with others.');
      }
    } catch (error) {
      if (window.console) {
        window.console.error('Share error:', error);
      }
    }
  };

  // Manual play/pause with audio sync
  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  };

  // Return null if not at the video generation step or video is not ready
  if (status.video !== 'success' || !content.video) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Your Generated Video</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Video player with poster image */}
          <div className="aspect-video w-full overflow-hidden rounded-md relative">
            <video 
              ref={videoRef}
              controls
              poster={content.image || undefined}
              className="w-full h-full"
            >
              <source src={content.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Custom play button with audio sync */}
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-20 hover:bg-opacity-30"
              onClick={togglePlayPause}
              style={{ display: 'none' }} // Hide this for now and use native controls
            >
              {isPlaying ? (
                <Pause className="h-16 w-16 text-white" />
              ) : (
                <Play className="h-16 w-16 text-white" />
              )}
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoDisplay;
