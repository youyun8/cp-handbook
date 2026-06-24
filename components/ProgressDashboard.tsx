'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, Topic } from '@/lib/types';
import { problemTypeLabel } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

export function ProgressDashboard({ problems, topics }: { problems: Problem[]; topics: Topic[] }) {
  const reviewedProblemIds = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);
  const reviewEvents = useProgressStore((state) => state.reviewEvents);
  const contestSessions = useProgressStore((state) => state.contestSessions);

  const problemById = useMemo(() => new Map(problems.map((problem) => [problem.id, problem])), [problems]);
  const topicById = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);

  const coveredTopics = useMemo(
    () =>
      new Set(
        reviewedProblemIds
          .map((id) => problemById.get(id)?.topic_id)
          .filter((topicId): topicId is string => Boolean(topicId))
      ),
    [problemById, reviewedProblemIds]
  );

  const weakAreas = useMemo(() => {
    return topics
      .map((topic) => {
        const topicProblems = new Set(problems.filter((problem) => problem.topic_id === topic.id).map((problem) => problem.id));
        const attempts = submissions.filter((submission) => topicProblems.has(submission.problemId));
        const accepted = attempts.filter((submission) => submission.status === 'AC').length;
        const total = attempts.filter((submission) => submission.status !== 'SKIP').length;
        return {
          topic,
          total,
          rate: total === 0 ? null : accepted / total
        };
      })
      .filter((item) => item.rate !== null)
      .sort((a, b) => (a.rate ?? 1) - (b.rate ?? 1))
      .slice(0, 4);
  }, [problems, submissions, topics]);

  const typeBreakdown = useMemo(() => {
    const acceptedIds = new Set(submissions.filter((submission) => submission.status === 'AC').map((submission) => submission.problemId));
    const counts = { template: 0, classic: 0, insight_transfer: 0 };
    acceptedIds.forEach((id) => {
      const problem = problemById.get(id);
      if (problem) counts[problem.problem_type] += 1;
    });
    const total = Math.max(1, counts.template + counts.classic + counts.insight_transfer);
    return Object.entries(counts).map(([type, count]) => ({
      type: type as Problem['problem_type'],
      count,
      percent: Math.round((count / total) * 100)
    }));
  }, [problemById, submissions]);

  const heatmapDays = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of reviewEvents) {
      const key = event.reviewedAt.slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const submission of submissions) {
      const key = submission.createdAt.slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from({ length: 35 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (34 - index));
      const key = date.toISOString().slice(0, 10);
      return { key, count: counts.get(key) ?? 0 };
    });
  }, [reviewEvents, submissions]);

  const stats = [
    { label: '已複習題目', value: reviewedProblemIds.length },
    { label: '已覆蓋主題', value: `${coveredTopics.size}/${topics.length}` },
    { label: '競賽場次', value: contestSessions.length },
    { label: '提交紀錄', value: submissions.length }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>弱區偵測</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weakAreas.length > 0 ? (
              weakAreas.map((item) => (
                <div key={item.topic.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.topic.title}</p>
                    <p className="text-sm text-muted-foreground">{Math.round((item.rate ?? 0) * 100)}%</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-accent">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.round((item.rate ?? 0) * 100)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                還沒有足夠提交紀錄可以判斷弱區。
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>題型通過比例</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeBreakdown.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between text-sm">
                  <span>{problemTypeLabel(item.type)}</span>
                  <span className="text-muted-foreground">
                    {item.count} 題・{item.percent}%
                  </span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-accent">
                  <div className="h-3 rounded-full bg-primary" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>練習連續熱力圖</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {heatmapDays.map((day) => (
              <div
                key={day.key}
                title={`${day.key}：${day.count} 筆`}
                className={
                  day.count === 0
                    ? 'h-10 rounded-lg border border-border bg-background'
                    : day.count < 3
                      ? 'h-10 rounded-lg border border-emerald-400/30 bg-emerald-500/30'
                      : 'h-10 rounded-lg border border-emerald-300/50 bg-emerald-500/70'
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>已覆蓋主題</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Array.from(coveredTopics).length > 0 ? (
            Array.from(coveredTopics).map((topicId) => (
              <span key={topicId} className="rounded-full border border-border bg-accent px-3 py-2 text-sm">
                {topicById.get(topicId)?.title ?? '未分類'}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">尚未標記任何複習題目。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
