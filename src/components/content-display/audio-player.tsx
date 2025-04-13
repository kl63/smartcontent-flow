/* eslint-disable no-undef */
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, RefreshCw } from "lucide-react";
import { useContentStore } from "@/lib/store";
import { ApiError, isSpeechSynthesisAvailable, generateSpeechInBrowser } from "@/lib/api";

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

const AudioPlayer = () => {
  const { 
    content, 
    status, 
    setContent, 
    setStatus,
    setCurrentStep 
  } = useContentStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [speechText, setSpeechText] = useState<string | null>(null);
  
  // Generate audio when image is successfully generated
  useEffect(() => {
    const generateAudioContent = async () => {
      if (content.text && 
          status.text === 'success' && 
          status.image === 'success' && 
          status.audio === 'generating') {
        try {
          setErrorMessage(null);
          console.log('Generating audio for:', content.text);
          
          // Instead of generating a URL, we'll store the text to be spoken
          setSpeechText(content.text);
          
          // Mark audio as success
          setContent('audio', 'speech-synthesis'); // Just a placeholder value
          setStatus('audio', 'success');
          setCurrentStep(4);
          
          // Move to video generation
          setStatus('video', 'generating');
        } catch (error) {
          console.error('Error generating audio:', error);
          setStatus('audio', 'error');
          
          if (error instanceof ApiError) {
            setErrorMessage(error.message);
          } else if (error instanceof Error) {
            setErrorMessage(`Error: ${error.message}`);
          } else {
            setErrorMessage('Failed to generate audio content. Please try again.');
          }
        }
      }
    };
    
    generateAudioContent();
  }, [content.text, status.text, status.image, status.audio, setContent, setStatus, setCurrentStep]);
  
  const togglePlayPause = () => {
    if (!speechText || !isBrowser) return;
    
    if (isPlaying) {
      // Stop speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
    } else {
      // Start speech
      try {
        if (!isSpeechSynthesisAvailable()) {
          throw new Error('Speech synthesis is not supported in your browser.');
        }
        
        generateSpeechInBrowser(speechText, () => {
          setIsPlaying(false);
        });
        
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        setErrorMessage('Could not play the audio. Please try again.');
      }
    }
  };
  
  const handleRegenerate = async () => {
    if (!content.text) return;
    
    try {
      setErrorMessage(null);
      setStatus('audio', 'generating');
      console.log('Regenerating audio for:', content.text);
      
      // Use the existing text for speech synthesis
      setSpeechText(content.text);
      
      // Mark as successful
      setContent('audio', 'speech-synthesis'); // Just a placeholder
      setStatus('audio', 'success');
    } catch (error) {
      console.error('Error regenerating audio:', error);
      setStatus('audio', 'error');
      
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else if (error instanceof Error) {
        setErrorMessage(`Error: ${error.message}`);
      } else {
        setErrorMessage('Failed to regenerate audio content. Please try again.');
      }
    }
  };
  
  const handleDownload = () => {
    // For a real implementation, we would need to convert speech to an audio file
    if (!speechText || !isBrowser) return;
    
    try {
      // In a production app, we'd use a server endpoint to generate the audio file
      // For this demo, we'll create a text file with the content that would be spoken
      
      // Create a blob with the text content
      const blob = new Blob([speechText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link for the text
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ai-generated-speech.txt';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
      // Show information about audio downloads
      alert('In a production app, this would download an MP3 file of the narration. This demo version provides the text content that would be spoken.');
    } catch (error) {
      console.error('Error during download:', error);
      alert('Download failed. Please try again.');
    }
  };

  // Return null if not at the audio generation step or previous steps haven't completed successfully
  // IMPORTANT: Always keep all hooks above this conditional return
  if (!content.text || !content.image || 
      status.text !== 'success' || 
      status.image !== 'success' || 
      (status.audio === 'idle' && status.image !== 'success')) {
    return null;
  }
  
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Audio Narration</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRegenerate}
              disabled={status.audio === 'generating'}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
            </Button>
            {speechText && status.audio === 'success' && (
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
        {status.audio === 'generating' ? (
          <div className="w-full p-8 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#6B7280]">Generating audio...</div>
          </div>
        ) : status.audio === 'error' ? (
          <div className="w-full p-8 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#EF4444]">
              {errorMessage || 'Error generating audio. Please try again.'}
            </div>
          </div>
        ) : speechText ? (
          <div className="w-full p-6 bg-gray-100 rounded-md flex items-center justify-center">
            <Button 
              onClick={togglePlayPause} 
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              {isPlaying ? (
                <><Pause className="h-5 w-5 mr-2" /> Pause</>
              ) : (
                <><Play className="h-5 w-5 mr-2" /> Play</>
              )}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
