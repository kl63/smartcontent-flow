# SmartContent Flow - AI Social Media Content Generator

SmartContent Flow is an all-in-one AI-powered content creation platform that helps you generate engaging social media content across multiple platforms with just a few clicks. Create professional text, images, audio narration, and video-like content for LinkedIn, TikTok, Instagram, and more.

## Features

- **Multi-Platform Support**: Create tailored content for LinkedIn, TikTok, and Instagram
- **AI-Powered Text Generation**: Craft professional, platform-specific text content
- **Automatic Image Selection**: Find the perfect image to match your content
- **Audio Narration**: Generate spoken versions of your content
- **Video-Like Preview**: Combine text, image, and audio into shareable content
- **Easy Sharing**: Share your content directly or download for later use
- **Editable Content**: Customize AI-generated content to match your voice

## Tech Stack

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library
- **Web Speech API** - Browser-based text-to-speech
- **OpenAI API** - AI-powered text generation

## Getting Started

### Prerequisites

Make sure you have the following installed:
- Node.js (v18 or newer)
- npm or yarn package manager
- OpenAI API key (for text generation)

### Installation

1. Clone this repository to your local machine:
   ```bash
   git clone <repository-url>
   cd smartcontent-flow
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your API keys:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Application Workflow

1. **Input**: Provide a topic or idea for your content
2. **Platform Selection**: Choose your target platform (LinkedIn, TikTok, Instagram)
3. **Text Generation**: AI creates platform-optimized content
4. **Content Editing**: Review and customize the generated text
5. **Image Selection**: System finds a relevant image
6. **Audio Generation**: Text is converted to speech
7. **Preview**: See and hear your content with synchronized playback
8. **Download/Share**: Get your content ready for posting

## Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/
│   │   ├── content-display/# Content display components
│   │   ├── content-input/  # User input components
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utility functions and API calls
│   └── store/              # Zustand state management
└── tailwind.config.js      # Tailwind CSS configuration
```

## Future Enhancements

- Server-side MP3 generation
- More robust video creation
- Authentication and saved content libraries
- Enhanced AI image generation
- Multiple language support
- Custom voice options

## Deployment

When you're ready to deploy your application:

1. Build the production version:
   ```bash
   npm run build
   ```

2. Deploy to Vercel, Netlify, or your preferred hosting service.

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ by [Your Name]
