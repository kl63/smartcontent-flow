'use client';

import { ReactNode } from 'react';

// This is a client component wrapper for providers that need to be used on the client side
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
