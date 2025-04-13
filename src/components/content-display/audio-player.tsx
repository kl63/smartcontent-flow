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

// Handle TypeScript for webkit prefixed APIs
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

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
  
  const handleDownload = async () => {
    if (!speechText || !isBrowser) return;
    
    try {
      // For a production version, we should use a server API to generate proper MP3 files
      // Since we're using browser speech synthesis, we'll create a more sophisticated approach
      
      // Create a new SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(speechText);
      
      // Set up an audio recorder to capture the synthesized speech
      // This is a simple implementation, but in production you'd use a more robust solution
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const mediaStreamDest = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDest.stream);
      
      // Array to store the audio chunks
      const audioChunks: BlobPart[] = [];
      
      // Listen for data available events
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      // When recording stops, create and download the audio file
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create a download link
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = 'ai-generated-speech.mp3';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(audioUrl);
        }, 100);
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Play the speech
      speechSynthesis.speak(utterance);
      
      // When speech ends, stop recording
      utterance.onend = () => {
        mediaRecorder.stop();
        audioContext.close();
      };
      
      // If something goes wrong, provide a fallback
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          // If recording is taking too long, stop it
          mediaRecorder.stop();
          audioContext.close();
        }
      }, 30000); // 30 seconds timeout
      
    } catch (error) {
      console.error('Error during audio download:', error);
      
      // Fallback for browsers that don't support MediaRecorder
      // Create a blob with the text content instead
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
      
      alert('Your browser doesn\'t support direct audio recording. A text file with the speech content has been downloaded instead.');
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
