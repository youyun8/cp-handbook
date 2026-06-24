'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button type="button" variant="secondary" size="sm" aria-label="切換色彩模式">
        色彩
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label={isDark ? '切換為淺色模式' : '切換為深色模式'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? '淺色' : '深色'}
    </Button>
  );
}
