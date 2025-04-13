export interface ContentDisplayProps {
  content: {
    text?: string;
    image?: string;
    audio?: string;
    video?: string;
  };
  platform?: string;
}

export type Platform = 'linkedin' | 'tiktok' | 'instagram' | 'twitter' | 'facebook';
