import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import { TopicHandbook } from '@/components/TopicHandbook';
import { getProblemsByTopic, getTopicBySlug, topics } from '@/lib/data';

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const topic = getTopicBySlug(params.slug);

  if (!topic) {
    notFound();
  }

  return (
    <PageTransition>
      <TopicHandbook topic={topic} topics={topics} problems={getProblemsByTopic(topic.id)} />
    </PageTransition>
  );
}
