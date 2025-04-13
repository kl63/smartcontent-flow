'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiConfig, isOpenAIConfigured } from '@/lib/config';
import { Info, Check, AlertCircle, KeyRound } from 'lucide-react';

export function ApiKeySetup() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Check if API is configured
  useEffect(() => {
    // Since we're using localStorage, only check on client side
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('openai_api_key');
      
      if (storedKey) {
        // We don't show the actual key for security reasons
        setOpenaiKey('••••••••••••••••••••••••••');
        setIsConfigured(true);
      } else {
        setIsConfigured(isOpenAIConfigured());
      }
    }
  }, []);

  const handleSaveKey = () => {
    setIsLoading(true);
    
    // Simulate API validation
    setTimeout(() => {
      if (openaiKey.trim().length > 20) {
        // In a real app, we would validate the key by making a test API call
        // For demo, we'll just store it in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('openai_api_key', openaiKey);
        }
        setIsConfigured(true);
        
        // Tell the user to refresh to apply the new key
        if (typeof window !== 'undefined') {
          window.alert('API key saved! Please refresh the page to apply the changes.');
        }
      } else {
        if (typeof window !== 'undefined') {
          window.alert('Please enter a valid OpenAI API key');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRemoveKey = () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to remove your API key?')) {
      localStorage.removeItem('openai_api_key');
      setOpenaiKey('');
      setIsConfigured(false);
      setShowSetup(true);
    }
  };

  if (isConfigured && !showSetup) {
    return (
      <div className="flex items-center space-x-2 text-sm mb-4">
        <div className="flex-1 flex items-center">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          <span>OpenAI API configured</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowSetup(true)}
          className="h-7 px-2 text-xs"
        >
          Configure
        </Button>
      </div>
    );
  }

  return (
    <Card className={!isConfigured ? "border border-red-200 bg-red-50 mb-6" : "border border-amber-200 bg-amber-50 mb-6"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {!isConfigured ? (
            <>
              <KeyRound className="h-5 w-5 mr-2 text-red-500" />
              API Key Required
            </>
          ) : (
            <>
              <Info className="h-5 w-5 mr-2 text-amber-500" />
              API Configuration
            </>
          )}
        </CardTitle>
        <CardDescription>
          {!isConfigured ? (
            "You need to configure an OpenAI API key to use real AI-generated content"
          ) : (
            "Configure your OpenAI API key to unlock AI-generated content"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="openai-key" className="block text-sm font-medium">
              OpenAI API Key
            </label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a 
                href="https://platform.openai.com/account/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAI Dashboard
              </a>
            </p>
          </div>
          
          <div className={!isConfigured ? "bg-white p-3 rounded-md border border-red-100" : "bg-white p-3 rounded-md border border-amber-100"}>
            <div className="flex items-start">
              <AlertCircle className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${!isConfigured ? "text-red-500" : "text-amber-500"}`} />
              <div className="text-xs">
                {!isConfigured ? (
                  <>
                    <p className="font-medium">API Key Required!</p>
                    <p className="mt-1">
                      Without an API key, the application will throw errors when trying to generate content. 
                      Add your OpenAI API key to enable real AI-generated content.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">API Key Information</p>
                    <p className="mt-1">
                      Your API key is stored locally in your browser and never sent to our servers.
                      API calls are made directly from your browser to OpenAI.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isConfigured ? (
          <>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleRemoveKey}
            >
              Remove Key
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSetup(false)}
            >
              Hide
            </Button>
          </>
        ) : (
          <>
            <div />
            <Button 
              onClick={handleSaveKey} 
              disabled={isLoading || openaiKey.trim().length < 10}
              size="sm"
            >
              {isLoading ? 'Saving...' : 'Save API Key'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default ApiKeySetup;
