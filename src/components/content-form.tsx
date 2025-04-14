'use client';

import React, { useState } from 'react';
import { useContentStore, Platform } from "@/lib/store";
import { generateText } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Simple error alert component
const ErrorAlert = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 mb-4">
    {message}
  </div>
);

const ContentForm = () => {
  // Get store values and methods
  const { 
    contentIdea, 
    selectedPlatform, 
    setContentIdea, 
    setSelectedPlatform, 
    setContent, 
    setStatus,
    setCurrentStep 
  } = useContentStore();
  
  // Local state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!contentIdea.trim()) {
      setErrorMessage("Please enter a content idea first");
      return;
    }
    
    // Clear any previous errors and set generating state
    setErrorMessage(null);
    setIsGenerating(true);
    
    try {
      // Reset content and update status
      setContent('text', '');
      setContent('image', '');
      setContent('audio', '');
      setContent('video', '');
      
      // Start text generation
      setStatus('text', 'generating');
      setCurrentStep(1);
      
      // Generate text content
      const generatedText = await generateText(contentIdea, selectedPlatform);
      
      // Update with generated text and move to next step
      setContent('text', generatedText);
      setStatus('text', 'success');
      
      // Move to image generation
      setCurrentStep(2);
      setStatus('image', 'generating');
    } catch (error) {
      // Handle errors
      setStatus('text', 'error');
      
      if (error instanceof Error) {
        setErrorMessage(`Error: ${error.message}`);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Platform selection handler
  const handlePlatformClick = (platform: Platform) => {
    setSelectedPlatform(platform);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message */}
      {errorMessage && <ErrorAlert message={errorMessage} />}
      
      {/* Content idea input */}
      <div className="space-y-2">
        <label htmlFor="content-idea" className="block text-sm font-medium text-gray-700">
          What would you like to create content about?
        </label>
        <textarea
          id="content-idea"
          value={contentIdea}
          onChange={(e) => setContentIdea(e.target.value)}
          className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your content idea or topic here..."
          disabled={isGenerating}
        />
      </div>
      
      {/* Platform selection - temporarily removed to focus on LinkedIn only */}
      {/* 
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Select platform</label>
        <div className="grid grid-cols-3 gap-3">
          {(['linkedin', 'tiktok', 'instagram'] as Platform[]).map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => handlePlatformClick(platform)}
              className={`
                border rounded-md p-3 text-center cursor-pointer transition-colors
                ${selectedPlatform === platform 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={isGenerating}
            >
              <div className="font-medium capitalize">{platform}</div>
            </button>
          ))}
        </div>
      </div>
      */}
      
      {/* LinkedIn badge - shows that we're focused on LinkedIn */}
      <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-md border border-blue-100">
        <span className="text-blue-800 font-medium">Platform:</span>
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">LinkedIn</span>
        <span className="text-sm text-blue-600 ml-auto">Professional network optimized content</span>
      </div>
      
      {/* Submit button */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={isGenerating || !contentIdea.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Content
          </>
        ) : (
          'Generate Content'
        )}
      </Button>
    </form>
  );
};

export default ContentForm;
