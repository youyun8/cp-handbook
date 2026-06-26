'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/lib/useMounted';

export function ThemeToggle() {
  const mounted = useMounted();
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <Button type="button" variant="secondary" size="sm" aria-label="切換色彩模式">
        <Monitor className="h-4 w-4" aria-hidden />
      </Button>
    );
  }

  const currentTheme = theme ?? 'system';
  const isDark = resolvedTheme === 'dark';
  const nextTheme = currentTheme === 'system' ? 'light' : currentTheme === 'light' ? 'dark' : 'system';
  const label = currentTheme === 'system' ? '系統' : isDark ? '深色' : '淺色';
  const Icon = currentTheme === 'system' ? Monitor : currentTheme === 'light' ? Sun : Moon;

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label={`色彩模式：${label}（點擊切換）`}
      title={`色彩模式：${label}`}
      className="gap-1.5"
      onClick={() => setTheme(nextTheme)}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
