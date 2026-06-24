import Link from 'next/link';
import type { Topic } from '@/lib/types';
import { cn, topicIcon } from '@/lib/utils';

export function TopicTree({ topics, activeSlug }: { topics: Topic[]; activeSlug: string }) {
  return (
    <aside className="rounded-3xl border border-border bg-card/75 p-4">
      <details open>
        <summary className="cursor-pointer list-none text-sm font-semibold text-muted-foreground">主題樹</summary>
        <nav className="mt-4 space-y-1">
          {topics.map((topic) => {
            const isActive = activeSlug === topic.slug;
            return (
              <Link
                key={topic.id}
                href={`/handbook/${topic.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-xl border-l-2 px-3 py-2 text-sm transition',
                  isActive
                    ? 'border-blue-500 bg-primary/15 font-medium text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground'
                )}
              >
                <span className="text-base" aria-hidden>
                  {topicIcon(topic.id)}
                </span>
                <span className="truncate">{topic.title}</span>
              </Link>
            );
          })}
        </nav>
      </details>
    </aside>
  );
}
