import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopicGlyph } from '@/components/icons';
import type { Topic } from '@/lib/types';

export function FeaturedTopics({ topics }: { topics: Topic[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {topics.slice(0, 3).map((topic) => {
        return (
          <Link key={topic.id} href={`/handbook/${topic.slug}`} className="group">
            <Card className="flex h-full flex-col shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card-hover">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <TopicGlyph topicId={topic.id} className="h-5 w-5" />
                  </span>
                  <CardTitle className="transition-colors group-hover:text-primary">{topic.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{topic.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition group-hover:gap-2 group-hover:opacity-100">
                  進入主題 <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
