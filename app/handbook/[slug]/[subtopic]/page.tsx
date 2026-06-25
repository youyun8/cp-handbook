import { notFound } from 'next/navigation';
import { HandbookSidebar } from '@/components/HandbookSidebar';
import { PageTransition } from '@/components/PageTransition';
import { SubtopicHandbook } from '@/components/SubtopicHandbook';
import { getSubtopics, getTopics } from '@/lib/data';

export function generateStaticParams() {
  const subtopics = getSubtopics();
  const topics = getTopics();
  return subtopics.map((s) => {
    const parent = topics.find((t) => t.id === s.parent_id);
    return { slug: parent?.slug ?? '', subtopic: s.slug };
  });
}

export default async function SubtopicPage({
  params
}: {
  params: Promise<{ slug: string; subtopic: string }>;
}) {
  const { slug, subtopic: subtopicSlug } = await params;
  const topics = getTopics();
  const subtopics = getSubtopics();
  const topic = topics.find((t) => t.slug === slug);
  const subtopic = subtopics.find((s) => s.parent_id === topic?.id && s.slug === subtopicSlug);

  if (!topic || !subtopic) {
    notFound();
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen gap-6">
        <HandbookSidebar
          topics={topics}
          subtopics={subtopics}
          activeTopicSlug={slug}
          activeSubtopicSlug={subtopicSlug}
          anchors={[
            { id: 'core', label: '核心想法' },
            ...(subtopic.deep_dive?.map((d) => ({
              id: d.title.replace(/\s+/g, '-').toLowerCase(),
              label: d.title
            })) ?? []),
            { id: 'template', label: '模板程式碼' },
            { id: 'patterns', label: '補充套路' }
          ]}
        />
        <div className="min-w-0 flex-1">
          <SubtopicHandbook subtopic={subtopic} parentTopic={topic} />
        </div>
      </div>
    </PageTransition>
  );
}
