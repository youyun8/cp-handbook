'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, Topic } from '@/lib/types';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function ProgressSummary({ problems, topics }: { problems: Problem[]; topics: Topic[] }) {
  const mounted = useMounted();
  const reviewedProblemIds = useProgressStore((state) => state.reviewedProblemIds);
  const contestSessions = useProgressStore((state) => state.contestSessions);
  const currentRating = useProgressStore((state) => state.currentRating);
  const submissions = useProgressStore((state) => state.submissions);
  const reviewEvents = useProgressStore((state) => state.reviewEvents);

  const topicCount = useMemo(() => {
    const reviewed = new Set(reviewedProblemIds);
    return new Set(problems.filter((problem) => reviewed.has(problem.id)).map((problem) => problem.topic_id))
      .size;
  }, [problems, reviewedProblemIds]);

  const problemById = useMemo(() => new Map(problems.map((problem) => [problem.id, problem])), [problems]);
  const recentActivity = useMemo(() => {
    return [
      ...submissions.map((submission) => ({
        id: submission.id,
        at: submission.createdAt,
        label: `提交：${problemById.get(submission.problemId)?.title ?? '未知題目'}`
      })),
      ...reviewEvents.map((event) => ({
        id: `${event.problemId}-${event.reviewedAt}`,
        at: event.reviewedAt,
        label: `複習：${problemById.get(event.problemId)?.title ?? '未知題目'}`
      }))
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 3);
  }, [problemById, reviewEvents, submissions]);

  const stats = mounted
    ? [
        { label: '已複習題目', value: reviewedProblemIds.length.toString() },
        { label: '覆蓋主題', value: `${topicCount}/${topics.length}` },
        { label: '模擬賽場次', value: contestSessions.length.toString() },
        { label: '自評分數', value: currentRating.toString() }
      ]
    : [
        { label: '已複習題目', value: '0' },
        { label: '覆蓋主題', value: `0/${topics.length}` },
        { label: '模擬賽場次', value: '0' },
        { label: '自評分數', value: '1800' }
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>近期進度摘要</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-background/50 p-4 transition-colors hover:border-primary/50"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-border bg-background/45 p-4">
          <p className="text-sm font-medium">最近活動</p>
          {mounted && recentActivity.length > 0 ? (
            <div className="mt-3 space-y-2">
              {recentActivity.map((activity) => (
                <p key={activity.id} className="text-sm text-muted-foreground">
                  {activity.label}・{new Date(activity.at).toLocaleDateString('zh-TW')}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">尚未有本機活動紀錄。</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
