import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Topic } from '@/lib/types';
import { topicIcon } from '@/lib/utils';

export function FeaturedTopics({ topics }: { topics: Topic[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {topics.slice(0, 3).map((topic) => (
        <Link key={topic.id} href={`/handbook/${topic.slug}`} className="group">
          <Card className="h-full transition-transform duration-200 hover:scale-[1.02] hover:border-primary hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-xl"
                  aria-hidden
                >
                  {topicIcon(topic.id)}
                </span>
                <CardTitle className="group-hover:text-primary">{topic.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="truncate text-sm leading-6 text-muted-foreground">{topic.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
