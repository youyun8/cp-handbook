'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DifficultyBadge, ProblemTypeBadge, TierBadge } from '@/components/Badges';
import { MarkdownBlock } from '@/components/MarkdownBlock';
import { ProblemSourceLink } from '@/components/ProblemSourceLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, Topic } from '@/lib/types';
import { problemDisplayTitle, problemTypeLabel, sourceProblemIdLabel } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

type StrategyTab = 'approach' | 'pattern' | 'mistakes' | 'insight' | 'similar';

const tabs: { id: StrategyTab; label: string }[] = [
  { id: 'approach', label: '解題思路' },
  { id: 'pattern', label: '模式辨識' },
  { id: 'mistakes', label: '常見錯誤' },
  { id: 'insight', label: '思維轉換筆記' },
  { id: 'similar', label: '相似題目' }
];

export function ProblemStrategy({
  problem,
  topic,
  similarProblems
}: {
  problem: Problem;
  topic: Topic;
  similarProblems: Problem[];
}) {
  const [active, setActive] = useState<StrategyTab>('approach');
  const markReviewed = useProgressStore((state) => state.markReviewed);
  const reviewedProblemIds = useProgressStore((state) => state.reviewedProblemIds);
  const reviewed = reviewedProblemIds.includes(problem.id);

  const mistakes = useMemo(
    () => [
      `沒有先確認 ${topic.title} 的單調性或狀態定義，導致模板套錯。`,
      '邊界條件與索引範圍沒有寫成固定慣例，容易在極小測資失敗。',
      '只記住程式碼，沒有說清楚為什麼這個模型能覆蓋所有情況。'
    ],
    [topic.title]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <DifficultyBadge rating={problem.rating} />
            <ProblemTypeBadge problemType={problem.problem_type} />
            <TierBadge tier={problem.tier} />
          </div>
          <CardTitle className="text-3xl">{problemDisplayTitle(problem)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border p-3">
              <p>主題</p>
              <p className="mt-1 font-medium text-foreground">{topic.title}</p>
            </div>
            <div className="rounded-2xl border border-border p-3">
              <p>來源</p>
              <ProblemSourceLink problem={problem} className="mt-1 block font-medium text-primary">
                {sourceProblemIdLabel(problem)}
              </ProblemSourceLink>
            </div>
            <div className="rounded-2xl border border-border p-3">
              <p>通過數</p>
              <p className="mt-1 font-medium text-foreground">{problem.solve_count?.toLocaleString('zh-TW') ?? '未提供'}</p>
            </div>
            <div className="rounded-2xl border border-border p-3">
              <p>標籤</p>
              <p className="mt-1 font-medium text-foreground">{problem.tags.join('、')}</p>
            </div>
          </div>
          <Button type="button" onClick={() => markReviewed(problem.id, problem.topic_id)}>
            {reviewed ? '已標記複習' : '標記為已複習'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="mb-5 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={
                  active === tab.id
                    ? 'rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                    : 'rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground'
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {active === 'approach' ? (
            <ol className="space-y-3">
              {problem.strategy_hints.map((hint, index) => (
                <li key={hint} className="rounded-2xl border border-border bg-background/50 p-4">
                  <p className="text-sm font-semibold text-primary">步驟 {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{hint}</p>
                </li>
              ))}
            </ol>
          ) : null}

          {active === 'pattern' ? (
            <div className="rounded-2xl border border-border bg-background/50 p-5 text-sm leading-7 text-muted-foreground">
              這題歸在「{topic.title}」與「{problemTypeLabel(problem.problem_type)}」類型，重點不是直接背答案，而是先辨識
              {topic.supplemental_patterns.map((item) => item.name).join('、')} 之間哪個變形最貼近題意，再把限制轉成可維護的狀態。
            </div>
          ) : null}

          {active === 'mistakes' ? (
            <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
              {mistakes.map((mistake) => (
                <li key={mistake} className="rounded-2xl border border-border bg-background/50 p-4">
                  ・{mistake}
                </li>
              ))}
            </ul>
          ) : null}

          {active === 'insight' ? (
            <div className="rounded-2xl border border-border bg-background/50 p-5 text-sm leading-7 text-muted-foreground">
              {problem.insight_note ? (
                <MarkdownBlock>{problem.insight_note}</MarkdownBlock>
              ) : (
                '這題主要是經典建模題，思維轉換幅度較小；請把重點放在模板邊界、狀態維護與複雜度控制。'
              )}
            </div>
          ) : null}

          {active === 'similar' ? (
            <div className="grid gap-3 md:grid-cols-2">
              {similarProblems.map((item) => (
                <Link key={item.id} href={`/problems/${item.id}`} className="rounded-2xl border border-border p-4 transition hover:border-primary">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.tags.join('、')}</p>
                </Link>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
