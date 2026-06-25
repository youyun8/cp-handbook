'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/lib/useMounted';

export function ThemeToggle() {
  const mounted = useMounted();
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <Button type="button" variant="secondary" size="sm" aria-label="切換色彩模式">
        外觀
      </Button>
    );
  }

  const currentTheme = theme ?? 'system';
  const isDark = resolvedTheme === 'dark';
  const nextTheme = currentTheme === 'system' ? 'light' : currentTheme === 'light' ? 'dark' : 'system';
  const label = currentTheme === 'system' ? '系統' : isDark ? '深色' : '淺色';

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label="切換色彩模式"
      onClick={() => setTheme(nextTheme)}
    >
      {label}
    </Button>
  );
}
