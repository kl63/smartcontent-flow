import { create } from 'zustand';

export type Platform = 'linkedin' | 'tiktok' | 'instagram' | 'twitter' | 'facebook';

export type ContentState = {
  text: string | null;
  image: string | null;
  audio: string | null;
  video: string | null;
  socialPost: string | null;
};

type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

type ContentStore = {
  // Input and selection
  contentIdea: string;
  selectedPlatform: Platform;
  
  // Generated content
  content: ContentState;
  
  // Process state
  currentStep: number;
  status: {
    text: GenerationStatus;
    image: GenerationStatus;
    audio: GenerationStatus;
    video: GenerationStatus;
    socialPost: GenerationStatus;
  };
  error: string | null;
  
  // Actions
  setContentIdea: (idea: string) => void;
  setSelectedPlatform: (platform: Platform) => void;
  startGeneration: () => void;
  setContent: (type: keyof ContentState, content: string) => void;
  setStatus: (type: keyof ContentState, status: GenerationStatus) => void;
  setCurrentStep: (step: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const initialState = {
  contentIdea: '',
  selectedPlatform: 'linkedin' as Platform,
  content: {
    text: null,
    image: null,
    audio: null,
    video: null,
    socialPost: null,
  },
  currentStep: 0,
  status: {
    text: 'idle' as GenerationStatus,
    image: 'idle' as GenerationStatus,
    audio: 'idle' as GenerationStatus,
    video: 'idle' as GenerationStatus,
    socialPost: 'idle' as GenerationStatus,
  },
  error: null,
};

export const useContentStore = create<ContentStore>((set) => ({
  ...initialState,
  
  setContentIdea: (idea) => set({ contentIdea: idea }),
  
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
  
  startGeneration: () => set({ 
    currentStep: 1,
    status: {
      text: 'generating',
      image: 'idle',
      audio: 'idle',
      video: 'idle',
      socialPost: 'idle',
    },
    error: null,
  }),
  
  setContent: (type, content) => set((state) => ({
    content: { ...state.content, [type]: content }
  })),
  
  setStatus: (type, status) => set((state) => ({
    status: { ...state.status, [type]: status }
  })),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
}));
