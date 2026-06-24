import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Problem, ProblemType, RatingBand, Source, SubmissionStatus, Tier } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sourceLabel(source: Source) {
  const labels: Record<Source, string> = {
    leetcode: '力扣',
    codeforces: 'Codeforces',
    luogu: '洛谷',
    atcoder: 'AtCoder'
  };
  return labels[source];
}

export function sourceUrl(problem: Problem) {
  if (problem.source === 'leetcode') {
    return `https://leetcode.cn/problems/${problem.source_id}/`;
  }

  if (problem.source === 'codeforces') {
    const match = problem.source_id.match(/^(\d+)([A-Z]\d*)$/);
    return match
      ? `https://codeforces.com/problemset/problem/${match[1]}/${match[2]}`
      : 'https://codeforces.com/problemset';
  }

  if (problem.source === 'luogu') {
    return `https://www.luogu.com.cn/problem/${problem.source_id}`;
  }

  return `https://atcoder.jp/contests/${problem.source_id.split('_')[0]}/tasks/${problem.source_id}`;
}

export function difficultyLabel(rating: number) {
  if (rating < 1400) return '暖身';
  if (rating <= 1800) return '中等';
  if (rating < 2100) return '困難';
  return '專家';
}

export function difficultyClass(rating: number) {
  if (rating < 1400) return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300';
  if (rating <= 1800) return 'border-yellow-400/40 bg-yellow-500/15 text-yellow-800 dark:text-yellow-200';
  if (rating < 2100) return 'border-orange-400/40 bg-orange-500/15 text-orange-800 dark:text-orange-200';
  return 'border-red-400/40 bg-red-500/15 text-red-800 dark:text-red-200';
}

export function problemTypeLabel(problemType: ProblemType) {
  const labels: Record<ProblemType, string> = {
    template: '模板',
    classic: '經典',
    insight_transfer: '思維'
  };
  return labels[problemType];
}

export function problemTypeClass(problemType: ProblemType) {
  const classes: Record<ProblemType, string> = {
    template: 'border-slate-400/40 bg-slate-500/15 text-slate-700 dark:text-slate-200',
    classic: 'border-blue-400/40 bg-blue-500/15 text-blue-800 dark:text-blue-200',
    insight_transfer: 'border-purple-400/40 bg-purple-500/15 text-purple-800 dark:text-purple-200'
  };
  return classes[problemType];
}

export function tierLabel(tier: Tier) {
  const labels: Record<Tier, string> = {
    warmup: '暖身',
    core: '核心',
    challenge: '挑戰'
  };
  return labels[tier];
}

export function submissionStatusLabel(status: SubmissionStatus) {
  const labels: Record<SubmissionStatus, string> = {
    AC: '通過',
    WA: '答案錯誤',
    TLE: '超時',
    SKIP: '略過'
  };
  return labels[status];
}

export function topicIcon(topicId: string) {
  const icons: Record<string, string> = {
    'binary-search': '🔍',
    'graph-traversal': '🕸️',
    intervals: '📏',
    'heap-priority-queue': '⛰️',
    'dp-fundamentals': '📐',
    'two-pointers': '↔️',
    dsu: '🔗',
    'binary-lifting-lca': '🌲',
    'monotonic-structure': '📊',
    'segment-tree-bit': '🌳'
  };
  return icons[topicId] ?? '📚';
}

export function sourceClass(source: Source) {
  const classes: Record<Source, string> = {
    leetcode: 'border-amber-400/40 bg-amber-500/15 text-amber-800 dark:text-amber-300',
    codeforces: 'border-red-400/40 bg-red-500/15 text-red-800 dark:text-red-200',
    luogu: 'border-teal-400/40 bg-teal-500/15 text-teal-800 dark:text-teal-200',
    atcoder: 'border-sky-400/40 bg-sky-500/15 text-sky-800 dark:text-sky-200'
  };
  return classes[source];
}

export function ratingBands(currentRating: number): RatingBand[] {
  return [
    {
      id: 'consolidate',
      label: '鞏固',
      min: Math.max(0, currentRating - 200),
      max: currentRating,
      description: '補強目前分段的穩定度'
    },
    {
      id: 'target',
      label: '目標',
      min: currentRating,
      max: currentRating + 200,
      description: '依照當前目標分數練習'
    },
    {
      id: 'stretch',
      label: '伸展',
      min: 2200,
      max: null,
      description: '選擇二二零零以上且按通過數排序'
    }
  ];
}
