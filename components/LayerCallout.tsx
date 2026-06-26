import type { ReactNode } from 'react';
import {
  BookMarked,
  HelpCircle,
  Layers3,
  Lightbulb,
  Link2,
  ListChecks,
  type LucideIcon,
  TriangleAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LayerVariant =
  | 'motivation'
  | 'core'
  | 'deepdive'
  | 'references'
  | 'supplemental'
  | 'pitfalls'
  | 'problems';

const variantStyle: Record<LayerVariant, { panel: string; chip: string; icon: LucideIcon }> = {
  motivation: {
    panel: 'border-amber-400/30 bg-amber-500/[0.06]',
    chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
    icon: HelpCircle
  },
  core: {
    panel: 'border-blue-400/30 bg-blue-500/[0.06]',
    chip: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
    icon: Lightbulb
  },
  deepdive: {
    panel: 'border-cyan-400/30 bg-cyan-500/[0.06]',
    chip: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
    icon: Layers3
  },
  references: {
    panel: 'border-border bg-card/70',
    chip: 'bg-accent text-foreground',
    icon: Link2
  },
  supplemental: {
    panel: 'border-violet-400/30 bg-violet-500/[0.06]',
    chip: 'bg-violet-500/15 text-violet-600 dark:text-violet-300',
    icon: BookMarked
  },
  pitfalls: {
    panel: 'border-rose-400/30 bg-rose-500/[0.06]',
    chip: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
    icon: TriangleAlert
  },
  problems: {
    panel: 'border-emerald-400/30 bg-emerald-500/[0.06]',
    chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
    icon: ListChecks
  }
};

export function LayerCallout({
  title,
  eyebrow,
  variant,
  children
}: {
  title: string;
  eyebrow: string;
  variant: LayerVariant;
  children: ReactNode;
}) {
  const style = variantStyle[variant];
  const Icon = style.icon;
  return (
    <section className={cn('rounded-3xl border p-5 shadow-card sm:p-6', style.panel)}>
      <div className="mb-4 flex items-center gap-3">
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', style.chip)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
