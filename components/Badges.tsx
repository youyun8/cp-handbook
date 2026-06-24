import { Badge } from '@/components/ui/badge';
import type { Problem } from '@/lib/types';
import {
  difficultyClass,
  difficultyLabel,
  problemTypeClass,
  problemTypeLabel,
  sourceClass,
  sourceLabel,
  tierLabel
} from '@/lib/utils';

export function DifficultyBadge({ rating }: { rating: number }) {
  return (
    <Badge className={difficultyClass(rating)}>
      {difficultyLabel(rating)}・{rating}
    </Badge>
  );
}

export function ProblemTypeBadge({ problemType }: { problemType: Problem['problem_type'] }) {
  return <Badge className={problemTypeClass(problemType)}>{problemTypeLabel(problemType)}</Badge>;
}

export function TierBadge({ tier }: { tier: Problem['tier'] }) {
  return <Badge className="border-cyan-400/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200">{tierLabel(tier)}</Badge>;
}

export function SourceBadge({ source }: { source: Problem['source'] }) {
  return <Badge className={sourceClass(source)}>{sourceLabel(source)}</Badge>;
}

export type CompletionStatus = 'accepted' | 'reviewed' | 'none';

const completionMeta: Record<CompletionStatus, { label: string; className: string }> = {
  accepted: { label: '已通過', className: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' },
  reviewed: { label: '已複習', className: 'border-blue-400/40 bg-blue-500/15 text-blue-800 dark:text-blue-200' },
  none: { label: '尚未練習', className: 'border-border bg-muted/40 text-muted-foreground' }
};

export function CompletionBadge({ status }: { status: CompletionStatus }) {
  const meta = completionMeta[status];
  return <Badge className={meta.className}>{meta.label}</Badge>;
}
