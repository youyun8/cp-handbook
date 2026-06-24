import type { SupplementalPattern } from '@/lib/types';
import { MarkdownBlock } from '@/components/MarkdownBlock';

export function Accordion({ items }: { items: SupplementalPattern[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.name}
          className="group rounded-2xl border border-border bg-background/45 p-4"
          open={index === 0}
        >
          <summary className="cursor-pointer list-none font-medium">
            <span className="mr-2 text-primary">#{index + 1}</span>
            {item.name}
            <span className="float-right text-sm text-muted-foreground group-open:hidden">展開</span>
            <span className="float-right hidden text-sm text-muted-foreground group-open:inline">收合</span>
          </summary>
          <MarkdownBlock className="mt-3 text-muted-foreground">{item.description}</MarkdownBlock>
        </details>
      ))}
    </div>
  );
}
