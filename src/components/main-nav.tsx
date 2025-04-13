'use client';

import Link from "next/link";
import { Sparkles, Video, Github } from "lucide-react";

export function MainNav() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[#1E40AF]" />
          <span className="text-lg font-bold text-[#111827]">AI Media Maker</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
          >
            <span className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline-block">Create</span>
            </span>
          </Link>
          <Link
            href="https://github.com/kaw393939/autocoderbase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
          >
            <span className="flex items-center gap-1">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline-block">GitHub</span>
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}