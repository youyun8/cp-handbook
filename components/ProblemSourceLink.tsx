'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import type { PracticeProblem, Problem } from '@/lib/types';
import { cn, sourceLabel, sourceUrl } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

interface ProblemSourceLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  problem: Pick<Problem, 'source' | 'source_id'> | PracticeProblem;
  children?: ReactNode;
}

export function ProblemSourceLink({ problem, children, className, ...props }: ProblemSourceLinkProps) {
  const leetCodeSite = useSettingsStore((state) => state.leetCodeSite);

  return (
    <a
      href={sourceUrl(problem, leetCodeSite)}
      target="_blank"
      rel="noreferrer"
      className={cn(className)}
      {...props}
    >
      {children ?? `${sourceLabel(problem.source)} 原題`}
    </a>
  );
}
