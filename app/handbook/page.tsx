import { PageTransition } from '@/components/PageTransition';
import { TopicHandbook } from '@/components/TopicHandbook';
import { getProblemsByTopic, subtopics, topics } from '@/lib/data';

export default function HandbookPage() {
  const topic = topics[0];
  const topicProblems = getProblemsByTopic(topic.id);

  return (
    <PageTransition>
      <TopicHandbook topic={topic} topics={topics} subtopics={subtopics} problems={topicProblems} />
    </PageTransition>
  );
}
