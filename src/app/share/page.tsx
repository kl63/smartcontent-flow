'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Define platform-specific styling
const platformConfig = {
  linkedin: {
    color: '#0077B5',
    label: 'LinkedIn Post',
    icon: '🔵'
  },
  tiktok: {
    color: '#000000',
    label: 'TikTok Script',
    icon: '🎵'
  },
  instagram: {
    color: '#E1306C',
    label: 'Instagram Caption',
    icon: '📷'
  },
  general: {
    color: '#4F46E5',
    label: 'Social Media Content',
    icon: '✨'
  }
};

// Create a client-only component for parts that need browser APIs
const ClientSideShareContent = dynamic(() => Promise.resolve(({ 
  imageUrl, 
  platform, 
  decodedText 
}: { 
  imageUrl: string, 
  platform: string, 
  decodedText: string 
}) => {
  /* eslint-disable no-undef */
  const [copied, setCopied] = useState(false);
  const config = platformConfig[platform as keyof typeof platformConfig] || platformConfig.general;
  
  // Update meta tags on component mount
  useEffect(() => {
    // This code only runs in the browser
    const metaTitle = document.querySelector('meta[property="og:title"]');
    const metaDescription = document.querySelector('meta[property="og:description"]');
    const metaImage = document.querySelector('meta[property="og:image"]');
    
    if (metaTitle) metaTitle.setAttribute('content', `AI-Generated ${config.label}`);
    if (metaDescription) metaDescription.setAttribute('content', decodedText.substring(0, 150) + (decodedText.length > 150 ? '...' : ''));
    if (metaImage && imageUrl) metaImage.setAttribute('content', imageUrl);
  }, [decodedText, config.label, imageUrl]);
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(decodedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  /* eslint-enable no-undef */
  
  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-0" style={{ borderBottom: `4px solid ${config.color}` }}>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-xl font-bold">
              <span className="mr-2">{config.icon}</span>
              AI-Generated {config.label}
            </CardTitle>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Create Your Own
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          {/* Image */}
          <div className="aspect-video w-full overflow-hidden rounded-md mb-4 bg-black relative">
            {imageUrl && (
              <Image 
                src={imageUrl} 
                alt={`AI-Generated ${config.label}`}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Text content */}
          <div className="mt-4 text-lg whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-100">
            {decodedText}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4 bg-gray-50">
          <div className="text-sm text-gray-500">
            Created with SmartContent Flow
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Copy className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>
            <Link href="/">
              <Button size="sm">
                Create Your Own
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}), { ssr: false }); // Disable SSR for this component

// Separate client component to handle search params
const ShareContent = () => {
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const imageUrl = searchParams.get('img') || '';
  const platform = searchParams.get('platform') || 'general';
  const text = searchParams.get('text') || '';
  const decodedText = text ? decodeURIComponent(text) : '';
  
  // Show invalid share link message if parameters are missing
  if (!imageUrl || !text) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Invalid Share Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This share link is incomplete or invalid. Please try creating new content.</p>
          </CardContent>
          <CardFooter>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" /> Go to Content Creator
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Show client-side content with browser APIs
  return <ClientSideShareContent imageUrl={imageUrl} platform={platform} decodedText={decodedText} />;
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Loading Shared Content...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60 flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-slate-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" /> Go to Content Creator
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
