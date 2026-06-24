import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Topic } from '@/lib/types';

export function FeaturedTopics({ topics }: { topics: Topic[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {topics.slice(0, 3).map((topic) => (
        <Link key={topic.id} href={`/handbook/${topic.slug}`}>
          <Card className="h-full transition hover:-translate-y-1 hover:border-primary">
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{topic.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
