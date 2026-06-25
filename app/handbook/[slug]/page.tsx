import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import { TopicHandbook } from '@/components/TopicHandbook';
import { getProblemsByTopic, getTopicBySlug, subtopics, topics } from '@/lib/data';

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  return (
    <PageTransition>
      <TopicHandbook
        topic={topic}
        topics={topics}
        subtopics={subtopics}
        problems={getProblemsByTopic(topic.id)}
      />
    </PageTransition>
  );
}
