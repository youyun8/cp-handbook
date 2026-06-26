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
import { problemDisplayTitle, sourceProblemIdLabel } from '@/lib/utils';
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
    <Card className="flex h-full flex-col overflow-hidden border-border/80 bg-card/90 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <SourceBadge source={problem.source} />
            {problem.rating ? <DifficultyBadge rating={problem.rating} /> : null}
            {problem.tier ? <TierBadge tier={problem.tier} /> : null}
          </div>
          <CompletionBadge status={completion} />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-base leading-6">{problemDisplayTitle(problem)}</CardTitle>
          <p className="break-all rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-medium text-muted-foreground">
            {sourceProblemIdLabel(problem)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {problem.tags && problem.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {problem.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border bg-accent/70 px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-border/70 pt-4">
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
          title={problemDisplayTitle(problem)}
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
