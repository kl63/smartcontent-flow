'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

const TextContent = () => {
  const { content, status, selectedPlatform } = useContentStore();
  const [copied, setCopied] = useState(false);

  // Return null if no text content is available
  if (!content.text) return null;

  const platformLabels = {
    linkedin: "LinkedIn",
    tiktok: "TikTok",
    instagram: "Instagram",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content.text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Generated {platformLabels[selectedPlatform]} Text</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="h-8 px-2 text-xs"
          >
            {copied ? (
              <><CheckCheck className="h-4 w-4 mr-1" /> Copied</>
            ) : (
              <><Copy className="h-4 w-4 mr-1" /> Copy Text</>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
          {content.text}
        </div>
      </CardContent>
    </Card>
  );
};

export default TextContent;
