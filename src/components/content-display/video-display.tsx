'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { generateVideo } from "@/lib/api";

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
      if (content.image && content.audio && status.audio === 'success' && status.video === 'generating') {
        try {
          const videoUrl = await generateVideo(content.image, content.audio);
          setContent('video', videoUrl);
          setStatus('video', 'success');
          setCurrentStep(4);
        } catch (error) {
          console.error('Error generating video:', error);
          setStatus('video', 'error');
        }
      }
    };

    createVideo();
  }, [content.image, content.audio, status.audio, status.video]);

  const handleDownload = () => {
    if (!content.video) return;
    
    // Create a temporary link to download the video
    const link = document.createElement('a');
    link.href = content.video;
    link.download = 'ai-generated-video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (!content.video) return;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Check out my AI-generated content!',
        text: 'Created with AI Media Maker',
        url: content.video
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback - copy video URL to clipboard
      navigator.clipboard.writeText(content.video);
      alert('Video URL copied to clipboard!');
    }
  };

  // Return null if prerequisites aren't met
  if (!content.image || !content.audio || status.video === 'idle') return null;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Final Video</span>
          <div className="flex gap-2">
            {content.video && status.video === 'success' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare}
                  className="h-8 px-2 text-xs"
                >
                  <Share2 className="h-4 w-4 mr-1" /> Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload}
                  className="h-8 px-2 text-xs"
                >
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status.video === 'generating' ? (
          <div className="w-full aspect-video bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#6B7280]">Creating video...</div>
          </div>
        ) : status.video === 'error' ? (
          <div className="w-full aspect-video bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#EF4444]">Error creating video. Please try again.</div>
          </div>
        ) : content.video ? (
          <div className="w-full overflow-hidden rounded-md">
            <video 
              ref={videoRef}
              src={content.video} 
              controls
              className="w-full h-auto"
              poster={content.image || undefined}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default VideoDisplay;
