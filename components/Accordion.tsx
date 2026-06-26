import { ChevronDown } from 'lucide-react';
import type { SupplementalPattern } from '@/lib/types';
import { MarkdownBlock } from '@/components/MarkdownBlock';

export function Accordion({ items }: { items: SupplementalPattern[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.name}
          className="group rounded-2xl border border-border bg-background/45 p-4 transition hover:border-primary/40"
          open={index === 0}
        >
          <summary className="flex cursor-pointer list-none items-center gap-2 font-medium">
            <span className="text-primary">#{index + 1}</span>
            <span className="min-w-0 flex-1">{item.name}</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <MarkdownBlock className="mt-3 text-muted-foreground">{item.description}</MarkdownBlock>
        </details>
      ))}
    </div>
  );
}
