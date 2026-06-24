import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { ClientProviders } from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: '競程策略手冊',
  description: '以策略、模板與分級題單為核心的互動式競程學習網站。'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body>
        <ClientProviders>
          <AppShell>{children}</AppShell>
        </ClientProviders>
      </body>
    </html>
  );
}
