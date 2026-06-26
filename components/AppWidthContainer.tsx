'use client';

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMounted } from '@/lib/useMounted';
import { useSettingsStore } from '@/store/useSettingsStore';

const widthClass = {
  standard: 'max-w-7xl',
  wide: 'max-w-[96rem]'
};

export function AppWidthContainer({
  as: Component = 'div',
  className,
  children
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const mounted = useMounted();
  const contentWidth = useSettingsStore((state) => state.contentWidth);
  const resolvedWidth = mounted ? contentWidth : 'standard';

  return <Component className={cn('mx-auto', widthClass[resolvedWidth], className)}>{children}</Component>;
}
