'use client';

import { useMemo } from 'react';
import { ProgressBar } from '@/components/ProgressBar';
import type { PracticeProblem } from '@/lib/types';
import { hasPracticeNote, practiceProblemId } from '@/lib/practiceProgress';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function SubtopicPracticeProgress({ problems }: { problems: PracticeProblem[] }) {
  const mounted = useMounted();
  const completedPracticeProblemIds = useProgressStore((state) => state.completedPracticeProblemIds);
  const problemNotes = useProgressStore((state) => state.problemNotes);

  const stats = useMemo(() => {
    const completedSet = new Set(completedPracticeProblemIds);
    const completed = problems.filter((problem) => {
      const id = practiceProblemId(problem);
      return completedSet.has(id) || hasPracticeNote(problemNotes[id]);
    }).length;
    const total = problems.length;
    return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [completedPracticeProblemIds, problemNotes, problems]);

  if (stats.total === 0) return null;

  const percent = mounted ? stats.percent : 0;
  const completed = mounted ? stats.completed : 0;

  return (
    <ProgressBar
      label="題單完成進度"
      detail={`${completed}/${stats.total} 題・${percent}%`}
      percent={percent}
    />
  );
}
