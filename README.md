# SmartContent Flow - LinkedIn AI Content Generator

SmartContent Flow is an AI-powered content creation platform that helps you generate professional LinkedIn posts with just a few clicks. Create engaging text content, matching images, and post directly to LinkedIn using free integrations.

## Features

- **LinkedIn-Optimized Content**: Create tailored professional content specifically for LinkedIn
- **AI-Powered Text Generation**: Craft professional, business-focused text content
- **Automatic Image Selection**: Find the perfect image to match your content
- **Free LinkedIn Integration**: Post directly to LinkedIn using Make.com's free webhook integration
- **Audio & Video Preview**: Generate spoken versions and video-like content for sharing
- **Easy Publishing Workflow**: From idea to posted content in minutes

## Tech Stack

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library
- **[Make.com](https://make.com/)** - Free webhook integration for LinkedIn posting
- **Web Speech API** - Browser-based text-to-speech
- **OpenAI API** - AI-powered text generation

## Getting Started

### Prerequisites

Make sure you have the following installed:
- Node.js (v18 or newer)
- npm or yarn package manager
- OpenAI API key (for text generation)
- Make.com account (for LinkedIn posting)

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
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## LinkedIn Integration Setup

1. Create a free [Make.com](https://make.com) account
2. Create a new scenario with these modules:
   - Webhook trigger
   - Download an image from URL
   - LinkedIn: Create a User Image Post
3. Copy your webhook URL from Make.com
4. Configure it in the Settings page of SmartContent Flow
5. You can now post directly from the application to LinkedIn

## Application Workflow

1. **Input**: Provide a topic or idea for your LinkedIn content
2. **Text Generation**: AI creates professionally optimized LinkedIn content
3. **Content Editing**: Review and customize the generated text
4. **Image Selection**: System finds a relevant image
5. **Preview**: See your content in a LinkedIn-like format
6. **Publish**: Post directly to LinkedIn with one click
7. **Media**: Optionally create audio and video versions for enhanced engagement

## Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components 
│   ├── lib/                # Utility functions, API calls, and services
│   │   ├── api.ts          # OpenAI API integration
│   │   ├── make-service.ts # Make.com integration for LinkedIn posting
│   │   └── store.ts        # Zustand state management
│   └── types/              # TypeScript type definitions
└── tailwind.config.js      # Tailwind CSS configuration
```

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
