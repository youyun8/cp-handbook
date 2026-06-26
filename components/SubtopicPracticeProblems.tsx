'use client';

import { useState } from 'react';
import {
  CompletionBadge,
  DifficultyBadge,
  SourceBadge,
  TierBadge,
  type CompletionStatus
} from '@/components/Badges';
import { ProblemNotesModal } from '@/components/ProblemNotesModal';
import { ProblemSourceLink } from '@/components/ProblemSourceLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PracticeProblem } from '@/lib/types';
import { useMounted } from '@/lib/useMounted';
import { hasPracticeNote, practiceProblemId } from '@/lib/practiceProgress';
import { useProgressStore } from '@/store/useProgressStore';

function SubtopicPracticeProblemCard({ problem }: { problem: PracticeProblem }) {
  const [showNotes, setShowNotes] = useState(false);
  const mounted = useMounted();
  const problemId = practiceProblemId(problem);
  const note = useProgressStore((state) => state.problemNotes[problemId]);
  const completedPracticeProblemIds = useProgressStore((state) => state.completedPracticeProblemIds);
  const markPracticeProblemCompleted = useProgressStore((state) => state.markPracticeProblemCompleted);
  const unmarkPracticeProblemCompleted = useProgressStore((state) => state.unmarkPracticeProblemCompleted);
  const completed = mounted && completedPracticeProblemIds.includes(problemId);
  const completion: CompletionStatus =
    mounted && (completed || hasPracticeNote(note)) ? 'reviewed' : 'none';

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          {problem.rating ? <DifficultyBadge rating={problem.rating} /> : null}
          {problem.tier ? <TierBadge tier={problem.tier} /> : null}
          <SourceBadge source={problem.source} />
          <CompletionBadge status={completion} />
        </div>
        <CardTitle className="text-base">{problem.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {problem.tags && problem.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {problem.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-accent px-2 py-1">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <ProblemSourceLink
            problem={problem}
            className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            打開原題
          </ProblemSourceLink>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowNotes(true)}>
            {note ? '查看記錄' : '記錄解答'}
          </Button>
          <Button
            type="button"
            variant={completed ? 'ghost' : 'secondary'}
            size="sm"
            onClick={() =>
              completed
                ? unmarkPracticeProblemCompleted(problemId)
                : markPracticeProblemCompleted(problemId)
            }
          >
            {completed ? '取消完成' : '標記完成'}
          </Button>
        </div>

        <ProblemNotesModal
          problemId={problemId}
          title={problem.title}
          open={showNotes}
          onClose={() => setShowNotes(false)}
        />
      </CardContent>
    </Card>
  );
}

export function SubtopicPracticeProblems({ problems }: { problems: PracticeProblem[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {problems.map((problem) => (
        <SubtopicPracticeProblemCard
          key={`${problem.source}-${problem.source_id}`}
          problem={problem}
        />
      ))}
    </div>
  );
}
