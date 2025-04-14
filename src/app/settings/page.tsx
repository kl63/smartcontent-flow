'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Check, ExternalLink, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';
import NextLink from 'next/link';
import { connectPlatform, getConnectedAccounts } from '@/lib/zapier-mcp-service';
import { PostingMethod, SOCIAL_CONFIG } from '@/lib/social-media-service';
import { initiateLinkedInAuth, isLinkedInAuthenticated } from '@/lib/linkedin-service';
import { useMakeWebhookUrl } from '@/lib/make-service';

export default function SettingsPage() {
  const [connections, setConnections] = useState<Record<string, boolean>>({
    linkedin: false,
    twitter: false,
    instagram: false,
    facebook: false,
    tiktok: false
  });
  
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PostingMethod>(SOCIAL_CONFIG.defaultMethod);
  const { webhookUrl, setWebhookUrl, loading: loadingWebhook } = useMakeWebhookUrl();
  const [savingWebhook, setSavingWebhook] = useState(false);
  
  // Load existing connections
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check LinkedIn direct connection
      if (isLinkedInAuthenticated()) {
        setConnections(prev => ({ ...prev, linkedin: true }));
      } else {
        const savedConnections = getConnectedAccounts();
        setConnections(savedConnections);
      }
    }
  }, []);
  
  // Handle connecting to LinkedIn directly
  const handleConnectLinkedIn = async () => {
    setIsConnecting('linkedin');
    setError(null);
    setSuccess(null);
    
    try {
      // Initialize the LinkedIn OAuth flow
      initiateLinkedInAuth();
      
      // Note: The page will redirect to LinkedIn, so we don't need to set success here
    } catch (err) {
      console.error(`Error connecting to LinkedIn:`, err);
      setError(`Failed to connect to LinkedIn. Please try again.`);
      setIsConnecting(null);
    }
  };
  
  // Handle connecting to a platform via other methods
  const handleConnect = async (platform: string) => {
    setIsConnecting(platform);
    setError(null);
    setSuccess(null);
    
    try {
      // Use our Zapier MCP service to connect to the platform
      const result = await connectPlatform(platform as any);
      
      if (result.success) {
        setSuccess(`Successfully connected to ${platform}!`);
        
        // Update the connections state
        const newConnections = { ...connections, [platform]: true };
        setConnections(newConnections);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error(`Error connecting to ${platform}:`, err);
      setError(`Failed to connect to ${platform}. Please try again.`);
    } finally {
      setIsConnecting(null);
    }
  };
  
  // Platform configuration for UI
  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-600' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-700' },
    { id: 'tiktok', name: 'TikTok', icon: ExternalLink, color: 'bg-black' }
  ];
  
  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center mb-8">
        <NextLink href="/" className="mr-4">
          <Button variant="outline" size="icon" aria-label="Back to home">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </NextLink>
        <h1 className="text-2xl font-bold">Social Media Connections</h1>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Posting Method</CardTitle>
            <CardDescription>Choose how to post to social media</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant={selectedMethod === 'direct' ? 'default' : 'outline'} 
                className={selectedMethod === 'direct' ? 'border-2 border-primary' : ''}
                onClick={() => setSelectedMethod('direct')}
              >
                Direct API Integration
              </Button>
              <Button 
                variant={selectedMethod === 'make' ? 'default' : 'outline'} 
                className={selectedMethod === 'make' ? 'border-2 border-primary' : ''}
                onClick={() => setSelectedMethod('make')}
              >
                Make.com (Free)
              </Button>
              <Button 
                variant={selectedMethod === 'buffer' ? 'default' : 'outline'} 
                className={selectedMethod === 'buffer' ? 'border-2 border-primary' : ''}
                onClick={() => setSelectedMethod('buffer')}
              >
                Buffer (Free)
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {selectedMethod === 'direct' && 'Direct API connection - no third party required but requires LinkedIn Developer setup'}
              {selectedMethod === 'make' && 'Make.com offers 1,000 free operations per month - easy to set up'}
              {selectedMethod === 'buffer' && 'Buffer free plan supports 3 social accounts with 10 posts each - good for scheduling'}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Make.com Webhook Configuration */}
      {selectedMethod === 'make' && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Make.com Webhook Configuration</CardTitle>
              <CardDescription>
                Enter the webhook URL from your Make.com scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="webhook-url" className="text-sm font-medium">
                    Webhook URL
                  </label>
                  <input
                    id="webhook-url"
                    type="text"
                    value={webhookUrl || ''}
                    onChange={(e) => {
                      // Directly update state first for responsive typing
                      setWebhookUrl(e.target.value);
                    }}
                    placeholder="https://hook.eu1.make.com/..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Paste the webhook URL from your Make.com scenario here
                  </p>
                </div>
                
                <Button 
                  onClick={async () => {
                    setSavingWebhook(true);
                    await setWebhookUrl(webhookUrl);
                    setSavingWebhook(false);
                    setSuccess('Make.com webhook URL saved successfully!');
                  }}
                  disabled={savingWebhook || loadingWebhook || !webhookUrl}
                >
                  {savingWebhook ? 'Saving...' : 'Save Webhook URL'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid gap-6">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${platform.color}`}>
                  <platform.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle>{platform.name}</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {connections[platform.id as keyof typeof connections] && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <CardDescription>
                {connections[platform.id as keyof typeof connections]
                  ? `Your ${platform.name} account is connected. You can post directly from SmartContent Flow.`
                  : `Connect your ${platform.name} account to post content directly from SmartContent Flow.`
                }
              </CardDescription>
            </CardContent>
            <CardFooter>
              {platform.id === 'linkedin' && selectedMethod === 'direct' ? (
                <Button 
                  onClick={handleConnectLinkedIn} 
                  disabled={isConnecting !== null || connections[platform.id as keyof typeof connections]}
                  variant={connections[platform.id as keyof typeof connections] ? "outline" : "default"}
                >
                  {isConnecting === platform.id
                    ? "Connecting..."
                    : connections[platform.id as keyof typeof connections]
                      ? "Reconnect"
                      : `Connect ${platform.name} (Direct)`
                  }
                </Button>
              ) : (
                <Button 
                  onClick={() => handleConnect(platform.id)} 
                  disabled={isConnecting !== null || connections[platform.id as keyof typeof connections]}
                  variant={connections[platform.id as keyof typeof connections] ? "outline" : "default"}
                >
                  {isConnecting === platform.id
                    ? "Connecting..."
                    : connections[platform.id as keyof typeof connections]
                      ? "Reconnect"
                      : `Connect ${platform.name}`
                  }
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <h3 className="font-medium mb-2">Free Posting Options</h3>
        <p className="text-sm text-muted-foreground mb-2">
          SmartContent Flow offers several free options for posting to social media:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
          <li>LinkedIn API - Direct integration with LinkedIn</li>
          <li>Make.com - Alternative to Zapier with 1,000 free operations per month</li>
          <li>Buffer - Free plan for scheduling posts to 3 social accounts</li>
        </ul>
      </div>
    </div>
  );
}
