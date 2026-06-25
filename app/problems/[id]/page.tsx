import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import { ProblemStrategy } from '@/components/ProblemStrategy';
import { getSimilarProblems, problemById, problems, topicById } from '@/lib/data';

export function generateStaticParams() {
  return problems.map((problem) => ({ id: problem.id }));
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = problemById.get(id);

  if (!problem) {
    notFound();
  }

  const topic = topicById.get(problem.topic_id);

  if (!topic) {
    notFound();
  }

  return (
    <PageTransition>
      <ProblemStrategy problem={problem} topic={topic} similarProblems={getSimilarProblems(problem)} />
    </PageTransition>
  );
}
