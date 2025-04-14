export interface ContentDisplayProps {
  content: {
    text?: string;
    image?: string;
    audio?: string;
    video?: string;
  };
  platform?: string;
}

// Simplified to only include LinkedIn
export type Platform = 'linkedin'; // Other platforms commented out for future use
// export type Platform = 'linkedin' | 'tiktok' | 'instagram' | 'twitter' | 'facebook';
