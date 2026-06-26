'use client';

import { useEffect } from 'react';
import { useMounted } from '@/lib/useMounted';
import { useSettingsStore } from '@/store/useSettingsStore';

export function AppPreferenceEffects() {
  const mounted = useMounted();
  const textSize = useSettingsStore((state) => state.textSize);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.textSize = textSize;
    return () => {
      delete document.documentElement.dataset.textSize;
    };
  }, [mounted, textSize]);

  return null;
}
