'use client';

import { useState } from 'react';
import {
  CompletionBadge,
  DifficultyBadge,
  SourceBadge,
  TierBadge,
  type CompletionStatus
} from '@/components/Badges';
import { ProblemNotesPanel } from '@/components/ProblemNotesPanel';
import { ProblemSourceLink } from '@/components/ProblemSourceLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PracticeProblem } from '@/lib/types';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

function practiceProblemId(problem: PracticeProblem) {
  return `practice:${problem.source}:${problem.source_id}`;
}

function SubtopicPracticeProblemCard({ problem }: { problem: PracticeProblem }) {
  const [showNotes, setShowNotes] = useState(false);
  const mounted = useMounted();
  const problemId = practiceProblemId(problem);
  const note = useProgressStore((state) => state.problemNotes[problemId]);
  const completion: CompletionStatus =
    mounted && note && (note.solution.trim() || note.thought.trim()) ? 'reviewed' : 'none';

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
          <Button type="button" variant="outline" size="sm" onClick={() => setShowNotes((value) => !value)}>
            {showNotes ? '收起記錄' : note ? '查看記錄' : '記錄解答'}
          </Button>
        </div>

        {showNotes ? <ProblemNotesPanel key={note?.updatedAt ?? problemId} problemId={problemId} /> : null}
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
