/* eslint-disable no-undef */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Edit, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { generateText } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

const TextDisplay = () => {
  const { 
    content, 
    status, 
    contentIdea, 
    selectedPlatform, 
    setContent, 
    setStatus 
  } = useContentStore();
  
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(content.text || '');

  // Update editedText when content.text changes (for initial load and regeneration)
  useEffect(() => {
    if (content.text) {
      setEditedText(content.text);
    }
  }, [content.text]);

  // Return null if no text has been generated
  if (!content.text && status.text !== 'generating') return null;

  const handleCopyToClipboard = () => {
    if (isBrowser && navigator && content.text) {
      navigator.clipboard.writeText(content.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRegenerate = async () => {
    if (!contentIdea || !selectedPlatform) return;
    
    try {
      setStatus('text', 'generating');
      const newText = await generateText(contentIdea, selectedPlatform);
      setContent('text', newText);
      setStatus('text', 'success');
      // Exit edit mode when regenerating
      setIsEditing(false);
    } catch (error) {
      if (isBrowser && console) {
        console.error('Error regenerating text:', error);
      }
      setStatus('text', 'error');
    }
  };
  
  const handleEditToggle = () => {
    setIsEditing(prev => !prev);
    // Reset edited text to the current content when entering edit mode
    if (!isEditing) {
      setEditedText(content.text || '');
    }
  };
  
  const handleSaveChanges = () => {
    // Save the edited text to the content store
    setContent('text', editedText);
    // Exit edit mode
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    // Reset edited text to the original content
    setEditedText(content.text || '');
    // Exit edit mode
    setIsEditing(false);
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Generated Text</span>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRegenerate}
                  disabled={status.text === 'generating'}
                  className="h-8 px-2 text-xs"
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                </Button>
                {content.text && status.text === 'success' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEditToggle}
                      className="h-8 px-2 text-xs"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopyToClipboard}
                      className="h-8 px-2 text-xs"
                    >
                      <Copy className="h-4 w-4 mr-1" /> {isCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </>
                )}
              </>
            )}
            
            {isEditing && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveChanges}
                  className="h-8 px-2 text-xs"
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancelEdit}
                  className="h-8 px-2 text-xs"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status.text === 'generating' ? (
          <div className="w-full p-4 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#6B7280]">Generating text...</div>
          </div>
        ) : status.text === 'error' ? (
          <div className="w-full p-4 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-[#EF4444]">Error generating text. Please try again.</div>
          </div>
        ) : content.text ? (
          isEditing ? (
            <div className="w-full rounded-md">
              <Textarea 
                value={editedText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedText(e.target.value)}
                className="w-full min-h-[200px] p-3 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Edit your generated text here..."
              />
              <div className="mt-2 text-sm text-gray-500">
                Edit your text above and click Save when finished
              </div>
            </div>
          ) : (
            <div className="w-full p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
              {content.text}
            </div>
          )
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TextDisplay;
