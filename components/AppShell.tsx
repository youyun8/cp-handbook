import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BarChart3, BookOpen, Dices, Dumbbell, Home } from 'lucide-react';
import { AppWidthContainer } from '@/components/AppWidthContainer';
import { FloatingCloudSync } from '@/components/FloatingCloudSync';
import { GithubIcon } from '@/components/icons';
import { SettingsNavButton } from '@/components/SettingsModal';
import { SignOutButton } from '@/components/SignOutButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { auth } from '@/lib/auth';
import { isStaticExport } from '@/lib/runtime';

const navItems = [
  { href: '/', label: '首頁', icon: Home },
  { href: '/handbook', label: '手冊', icon: BookOpen },
  { href: '/practice', label: '練習場', icon: Dumbbell },
  { href: '/contest-picker', label: '抽題', icon: Dices },
  { href: '/progress', label: '進度', icon: BarChart3 }
];

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const inferredBasePath = process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}` : '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? inferredBasePath;
const appIconSrc = `${basePath}/icon.svg`;

export async function AppShell({ children }: { children: ReactNode }) {
  const session = isStaticExport ? null : await auth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <AppWidthContainer className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-90"
          >
            <Image
              src={appIconSrc}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl shadow-sm"
              priority
              unoptimized
              aria-hidden
            />
            <span className="text-[15px]">競程策略手冊</span>
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            ))}
            <SettingsNavButton />
          </nav>
          <div className="flex items-center gap-2">
            {session?.user ? (
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt="avatar"
                    width={28}
                    height={28}
                    className="rounded-full border border-border"
                  />
                )}
                <SignOutButton />
              </div>
            ) : (
              !isStaticExport && (
                <a
                  href="/auth/signin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  GitHub 登入
                </a>
              )
            )}
            <ThemeToggle />
          </div>
        </AppWidthContainer>
        <AppWidthContainer
          as="nav"
          className="flex gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-thin md:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card/60 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          ))}
          <SettingsNavButton compact />
        </AppWidthContainer>
      </header>
      <AppWidthContainer as="main" className="px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </AppWidthContainer>
      <FloatingCloudSync />
    </div>
  );
}
