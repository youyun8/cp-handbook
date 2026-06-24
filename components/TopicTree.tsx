import Link from 'next/link';
import type { Topic } from '@/lib/types';
import { cn } from '@/lib/utils';

export function TopicTree({ topics, activeSlug }: { topics: Topic[]; activeSlug: string }) {
  return (
    <aside className="rounded-3xl border border-border bg-card/75 p-4">
      <details open>
        <summary className="cursor-pointer list-none text-sm font-semibold text-muted-foreground">主題樹</summary>
        <div className="mt-4 space-y-1">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/handbook/${topic.slug}`}
              className={cn(
                'block rounded-xl px-3 py-2 text-sm transition hover:bg-accent hover:text-foreground',
                activeSlug === topic.slug ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
              )}
            >
              {topic.title}
            </Link>
          ))}
        </div>
      </details>
    </aside>
  );
}
