'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Check, Send, Copy, Share2, Settings } from 'lucide-react';
import { useContentStore } from '@/lib/store';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { postToSocialMedia, isPlatformConnected } from '@/lib/social-media-service';
import Link from 'next/link';

interface PlatformData {
  name: string;
  color: string;
  icon: React.ReactNode;
  maxLength: number;
}

const platformData: Record<string, PlatformData> = {
  linkedin: {
    name: 'LinkedIn',
    color: '#0077B5',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    maxLength: 3000,
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>,
    maxLength: 2200,
  },
  instagram: {
    name: 'Instagram',
    color: '#E1306C',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    maxLength: 2200,
  },
  twitter: {
    name: 'X / Twitter',
    color: '#1DA1F2',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 002.048-2.578 9.3 9.3 0 01-2.958 1.13 4.66 4.66 0 00-7.938 4.25 13.229 13.229 0 01-9.602-4.868c-.4.69-.63 1.49-.63 2.342A4.66 4.66 0 003.96 9.824a4.647 4.647 0 01-2.11-.583v.06a4.66 4.66 0 003.737 4.568 4.692 4.692 0 01-2.104.08 4.661 4.661 0 004.352 3.234 9.348 9.348 0 01-5.786 1.995 9.5 9.5 0 01-1.112-.065 13.175 13.175 0 007.14 2.093c8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602a9.47 9.47 0 002.323-2.41z"/></svg>,
    maxLength: 280,
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    maxLength: 63206,
  }
};

const SocialPostPreview: React.FC = () => {
  const { 
    content, 
    status, 
    selectedPlatform, 
    setStatus, 
    setCurrentStep,
    includeImage 
  } = useContentStore();
  const [copied, setCopied] = useState(false);
  const [posted, setPosted] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  
  // Calculate character count and limit
  const platform = platformData[selectedPlatform] || platformData.linkedin;
  const textLength = content.text?.length || 0;
  const isOverLimit = textLength > platform.maxLength;
  
  // Format the platform-specific data
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  // Copy text to clipboard
  const handleCopyText = () => {
    if (content.text && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(content.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Post to social media
  const handlePost = async () => {
    if (!content.text) return;
    // Only require image if includeImage is true
    if (includeImage && !content.image) return;
    
    setIsPosting(true);
    setPostError(null);
    
    try {
      // Use our social media service to post content
      const result = await postToSocialMedia(
        selectedPlatform, 
        content.text || '', 
        includeImage && content.image ? content.image : undefined // Ensure both includeImage is true and content.image exists
      );
      
      if (result.success) {
        setPosted(true);
        setStatus('socialPost', 'success');
        setCurrentStep(5); // Move to next step
      } else {
        throw new Error(result.message || 'Failed to post content');
      }
    } catch (error) {
      console.error('Error posting content:', error);
      setPostError(error instanceof Error ? error.message : 'Failed to post content. Please try again.');
      setStatus('socialPost', 'error');
    } finally {
      setIsPosting(false);
    }
  };
  
  // Check if the platform is connected
  const [isConnected, setIsConnected] = useState(false);
  
  // Check for connected social accounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const connected = isPlatformConnected(selectedPlatform);
      setIsConnected(connected);
    }
  }, [selectedPlatform]);
  
  // Don't show anything if we're not at the right step or content isn't ready
  if (!content.text || 
      (includeImage && !content.image) || 
      status.text !== 'success' || 
      (includeImage && status.image !== 'success')) {
    return null;
  }
  
  return (
    <Card className="border border-gray-200 shadow-sm mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Social Media Post Preview</span>
          <Badge style={{ backgroundColor: platform.color }} className="text-white">
            <span className="mr-1">{platform.icon}</span>
            {platform.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Platform-specific preview */}
        <div className="rounded-md border overflow-hidden">
          <div className="bg-white p-4">
            <div className="flex items-center mb-3">
              {/* Profile info */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="font-bold text-sm">Your Name</div>
                <div className="text-xs text-gray-500">{formattedDate}</div>
              </div>
            </div>
            
            {/* Post content */}
            <div className="mb-3 text-sm whitespace-pre-wrap">
              {content.text}
            </div>
            
            {/* Image - only show if includeImage is true */}
            {includeImage && content.image && (
              <div className="rounded-md overflow-hidden relative aspect-video">
                <Image 
                  src={content.image} 
                  alt="Post image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            {/* Character count */}
            <div className={`text-xs mt-2 ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
              {textLength} / {platform.maxLength} characters
              {isOverLimit && ' (over limit)'}
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {postError && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>
              {postError}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyText} disabled={!content.text || isPosting}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" disabled={!content.text || isPosting}>
            <Share2 className="h-4 w-4 mr-1" />
            Share Link
          </Button>
        </div>
        
        {isConnected ? (
          <Button 
            onClick={handlePost} 
            disabled={!content.text || (includeImage && !content.image) || posted || isPosting}
            className="ml-auto"
          >
            {isPosting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                Posting...
              </>
            ) : posted ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Posted
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Post to {platform.name}
              </>
            )}
          </Button>
        ) : (
          <div className="ml-auto flex gap-2 items-center">
            <div className="text-sm text-orange-600">Account not connected</div>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Connect Account
              </Button>
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SocialPostPreview;
