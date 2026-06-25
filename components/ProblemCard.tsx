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
import { ProblemSourceLink } from '@/components/ProblemSourceLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem } from '@/lib/types';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function ProblemCard({ problem }: { problem: Problem }) {
  const [showHint, setShowHint] = useState(false);
  const mounted = useMounted();
  const reviewedProblemIds = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);

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
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <DifficultyBadge rating={problem.rating} />
          <ProblemTypeBadge problemType={problem.problem_type} />
          <TierBadge tier={problem.tier} />
          <SourceBadge source={problem.source} />
          <CompletionBadge status={completion} />
        </div>
        <CardTitle className="text-base">{problem.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {problem.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-accent px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
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
        </div>
        {showHint ? (
          <ul className="space-y-2 rounded-2xl border border-border bg-background/55 p-3 text-sm leading-6 text-muted-foreground">
            {problem.strategy_hints.map((hint) => (
              <li key={hint}>・{hint}</li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
