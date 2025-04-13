// Type definitions for browser environment globals
// This helps ESLint recognize browser globals like window, document, etc.

interface Window {
  speechSynthesis: SpeechSynthesis;
  SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
}

// Add global declarations to avoid ESLint errors
declare var window: Window;
declare var document: Document;
declare var navigator: Navigator;
declare var console: Console;
declare var setTimeout: typeof setTimeout;
declare var clearTimeout: typeof clearTimeout;
declare var localStorage: Storage;
declare var alert: (message?: any) => void;
declare var confirm: (message?: string) => boolean;
