'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CompletionBadge,
  DifficultyBadge,
  ProblemTypeBadge,
  SourceBadge,
  TierBadge,
  type CompletionStatus
} from '@/components/Badges';
import { ProblemNotesModal } from '@/components/ProblemNotesModal';
import { ProblemSourceLink } from '@/components/ProblemSourceLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem } from '@/lib/types';
import { useMounted } from '@/lib/useMounted';
import { problemDisplayTitle } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

export function ProblemCard({ problem }: { problem: Problem }) {
  const [showHint, setShowHint] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const mounted = useMounted();
  const reviewedProblemIds = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);
  const problemNote = useProgressStore((state) => state.problemNotes[problem.id]);

  let completion: CompletionStatus = 'none';
  if (mounted) {
    const accepted = submissions.some(
      (submission) => submission.problemId === problem.id && submission.status === 'AC'
    );
    if (accepted) {
      completion = 'accepted';
    } else if (reviewedProblemIds.includes(problem.id)) {
      completion = 'reviewed';
    }
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/80 bg-card/90 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <SourceBadge source={problem.source} />
            <DifficultyBadge rating={problem.rating} />
            <ProblemTypeBadge problemType={problem.problem_type} />
            <TierBadge tier={problem.tier} />
          </div>
          <CompletionBadge status={completion} />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-base leading-6">{problemDisplayTitle(problem)}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {problem.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border bg-accent/70 px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 border-t border-border/70 pt-4">
          <ProblemSourceLink
            problem={problem}
            className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            打開原題
          </ProblemSourceLink>
          <Link
            href={`/problems/${problem.id}`}
            className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            查看策略
          </Link>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowHint((value) => !value)}>
            {showHint ? '隱藏提示' : '策略提示'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowNotes(true)}>
            {problemNote ? '查看記錄' : '記錄解答'}
          </Button>
        </div>
        {showHint ? (
          <ul className="space-y-2 rounded-2xl border border-border bg-background/55 p-3 text-sm leading-6 text-muted-foreground">
            {problem.strategy_hints.map((hint) => (
              <li key={hint}>・{hint}</li>
            ))}
          </ul>
        ) : null}
        <ProblemNotesModal
          problemId={problem.id}
          title={problemDisplayTitle(problem)}
          open={showNotes}
          onClose={() => setShowNotes(false)}
        />
      </CardContent>
    </Card>
  );
}
