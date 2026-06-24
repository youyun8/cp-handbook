import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import { ProblemStrategy } from '@/components/ProblemStrategy';
import { getSimilarProblems, problemById, problems, topicById } from '@/lib/data';

export function generateStaticParams() {
  return problems.map((problem) => ({ id: problem.id }));
}

export default function ProblemPage({ params }: { params: { id: string } }) {
  const problem = problemById.get(params.id);

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
