import { Badge } from '@/components/ui/badge';
import type { Problem } from '@/lib/types';
import { difficultyClass, difficultyLabel, problemTypeClass, problemTypeLabel, tierLabel } from '@/lib/utils';

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
  return <Badge className="border-cyan-400/30 bg-cyan-500/10 text-cyan-200">{tierLabel(tier)}</Badge>;
}
