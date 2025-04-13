# 06-implementation.md

## Technologies
- Next.js + Tailwind CSS
- Replicate or DeepAI API for images
- ElevenLabs or gTTS for text-to-speech
- `fluent-ffmpeg` for video assembly (with `ffmpeg-static`)

## Workflow Summary
1. **Input text** → via form
2. **Generate image** → using AI API
3. **Generate audio** → using TTS
4. **Merge** → image + audio into video
5. **Display video** → with download button

## Local Dev Setup
```bash
npx create-next-app@latest ai-media-maker
cd ai-media-maker
npm install tailwindcss fluent-ffmpeg ffmpeg-static axios
