'use client';

/* eslint-disable no-undef */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { generateVideo } from "@/lib/api";

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

  // Return null if not at the video generation step or video is not ready
  if (status.video !== 'success' || !content.video) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Your Generated Video</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Video player with poster image since we're not generating real videos */}
          <div className="aspect-video w-full overflow-hidden rounded-md">
            <video 
              ref={videoRef}
              controls
              poster={content.image || undefined}
              className="w-full h-full"
            >
              <source src={content.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
