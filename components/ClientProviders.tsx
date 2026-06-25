'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { isStaticExport } from '@/lib/runtime';

export function ClientProviders({ children }: { children: ReactNode }) {
  const themed = (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );

  // In static export there is no /api/auth/session endpoint, so skip the
  // SessionProvider (its background fetch would 404). Cloud sync is disabled
  // in that mode anyway.
  if (isStaticExport) {
    return themed;
  }

  return <SessionProvider>{themed}</SessionProvider>;
}
