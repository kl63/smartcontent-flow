'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentForm from '@/components/content-form';
import WorkflowSteps from '@/components/workflow-steps';
import TextDisplay from '@/components/content-display/text-display';
import ImageDisplay from '@/components/content-display/image-display';
import AudioPlayer from '@/components/content-display/audio-player';
import VideoPlayer from '@/components/content-display/video-player';
import ApiKeySetup from '@/components/api-key-setup';
import { useContentStore } from '@/lib/store';

export default function Home() {
  const { 
    currentStep,
    content,
  } = useContentStore();
  
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex flex-col items-center justify-center py-8 md:py-12">
        <div className="container max-w-5xl px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              AI Media Maker
            </h1>
            <p className="max-w-[700px] text-gray-500 md:text-lg/relaxed">
              Transform your ideas into professional social media content for LinkedIn, TikTok, and Instagram in seconds.
            </p>
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showSettings ? 'Hide API Settings' : 'Configure API Keys'}
            </button>
            
            {showSettings && <ApiKeySetup />}
          </div>
          
          <div className="grid gap-8">
            {/* Workflow Visualization */}
            <WorkflowSteps />
            
            {/* Content Generation Form */}
            <div className="grid gap-6">
              <ContentForm />
              
              {/* Content Display Section - Only show if we have content */}
              {(currentStep > 0 || content.text) && (
                <div className="grid gap-6">
                  <div className="grid gap-4">
                    <h2 className="text-2xl font-bold tracking-tighter">
                      Generated Content
                    </h2>
                    <div className="grid gap-6">
                      {/* Text content */}
                      <TextDisplay />
                      
                      {/* Image content */}
                      <ImageDisplay />
                      
                      {/* Audio player */}
                      <AudioPlayer />
                      
                      {/* Video player */}
                      <VideoPlayer />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Instructions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-blue-800 text-xl font-bold">1</span>
                    </div>
                    <h3 className="text-lg font-medium">Enter Your Idea</h3>
                    <p className="text-sm text-gray-500">
                      Type in your content idea and select your target platform
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-blue-800 text-xl font-bold">2</span>
                    </div>
                    <h3 className="text-lg font-medium">AI Does the Work</h3>
                    <p className="text-sm text-gray-500">
                      Our AI generates platform-optimized text, image, and audio content
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-blue-800 text-xl font-bold">3</span>
                    </div>
                    <h3 className="text-lg font-medium">Share Your Content</h3>
                    <p className="text-sm text-gray-500">
                      Download or share your professional content directly to social media
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
