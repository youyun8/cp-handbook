import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LayerVariant = 'core' | 'references' | 'template' | 'supplemental' | 'problems';

const variantClass: Record<LayerVariant, string> = {
  core: 'border-blue-400/40 bg-blue-500/10',
  references: 'border-border bg-card/70',
  template: 'border-slate-600 bg-slate-950/20',
  supplemental: 'border-violet-400/30 bg-violet-500/10',
  problems: 'border-emerald-400/30 bg-emerald-500/10'
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
  return (
    <section className={cn('rounded-3xl border p-5 sm:p-6', variantClass[variant])}>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
