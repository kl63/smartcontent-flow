'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { generateImage, ApiError } from "@/lib/api";
import Image from "next/image";

const ImageDisplay = () => {
  const { 
    content, 
    status, 
    setContent, 
    setStatus,
    setCurrentStep
  } = useContentStore();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Generate image when text is successfully generated
  useEffect(() => {
    const generateImageContent = async () => {
      if (content.text && status.text === 'success' && status.image === 'generating') {
        try {
          setErrorMessage(null);
          const imageUrl = await generateImage(content.text);
          setContent('image', imageUrl);
          setStatus('image', 'success');
          setCurrentStep(3);
          
          // Move to audio generation
          setStatus('audio', 'idle');
        } catch (error) {
          if (typeof console !== 'undefined') {
            console.error('Error generating image:', error);
          }
          
          setStatus('image', 'error');
          
          // Handle error message
          if (error instanceof ApiError) {
            setErrorMessage(error.message);
          } else if (error instanceof Error) {
            setErrorMessage(`Error: ${error.message}`);
          } else {
            setErrorMessage('An unexpected error occurred while generating the image.');
          }
        }
      }
    };

    generateImageContent();
  }, [content.text, status.text, status.image]);

  const handleRegenerate = async () => {
    if (!content.text) return;
    
    try {
      setErrorMessage(null);
      setStatus('image', 'generating');
      const imageUrl = await generateImage(content.text);
      setContent('image', imageUrl);
      setStatus('image', 'success');
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('Error regenerating image:', error);
      }
      
      setStatus('image', 'error');
      
      // Handle error message
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else if (error instanceof Error) {
        setErrorMessage(`Error: ${error.message}`);
      } else {
        setErrorMessage('An unexpected error occurred while regenerating the image.');
      }
    }
  };

  const handleDownload = () => {
    if (!content.image) return;
    
    if (typeof window !== 'undefined') {
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = content.image;
      link.download = 'ai-generated-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Return null if not at the image generation step or if text hasn't been generated
  // IMPORTANT: Moved this condition AFTER all hook declarations to avoid React hooks errors
  if (!content.text || (status.image === 'idle' && status.text !== 'success')) {
    return null;
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Generated Image</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRegenerate}
              disabled={status.image === 'generating'}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
            </Button>
            {content.image && status.image === 'success' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="h-8 px-2 text-xs"
              >
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status.image === 'generating' ? (
          <div className="w-full p-8 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#6B7280]">Generating image...</div>
          </div>
        ) : status.image === 'error' ? (
          <div className="w-full p-8 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#EF4444]">
              {errorMessage || 'Error generating image. Please try again.'}
            </div>
          </div>
        ) : content.image ? (
          <div className="w-full h-[300px] bg-gray-50 rounded-md overflow-hidden relative">
            <Image 
              src={content.image} 
              alt="AI generated image" 
              fill 
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ImageDisplay;
