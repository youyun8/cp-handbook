'use client';

import { useMemo } from 'react';
import { ProgressBar } from '@/components/ProgressBar';
import type { Problem } from '@/lib/types';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function TopicProblemsProgress({ problems, label }: { problems: Problem[]; label?: string }) {
  const mounted = useMounted();
  const reviewedProblemIds = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);

  const stats = useMemo(() => {
    const acceptedIds = new Set(
      submissions.filter((submission) => submission.status === 'AC').map((submission) => submission.problemId)
    );
    const reviewedSet = new Set(reviewedProblemIds);
    const completed = problems.filter(
      (problem) => acceptedIds.has(problem.id) || reviewedSet.has(problem.id)
    ).length;
    const total = problems.length;
    return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [problems, reviewedProblemIds, submissions]);

  if (stats.total === 0) return null;

  const percent = mounted ? stats.percent : 0;
  const completed = mounted ? stats.completed : 0;

  return (
    <ProgressBar
      label={label ?? '題單完成進度'}
      detail={`${completed}/${stats.total} 題・${percent}%`}
      percent={percent}
    />
  );
}
