'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ProblemNotesModal } from '@/components/ProblemNotesModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PracticeProblem, Problem, Subtopic, Topic } from '@/lib/types';
import { hasPracticeNote, practiceProblemId } from '@/lib/practiceProgress';
import { problemTypeLabel } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

type HandbookFilter = 'all' | 'incomplete' | 'completed';

interface ActivePracticeNote {
  id: string;
  title: string;
}

export function ProgressDashboard({
  problems,
  topics,
  subtopics
}: {
  problems: Problem[];
  topics: Topic[];
  subtopics: Subtopic[];
}) {
  const reviewedProblemIds = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);
  const reviewEvents = useProgressStore((state) => state.reviewEvents);
  const contestSessions = useProgressStore((state) => state.contestSessions);
  const problemNotes = useProgressStore((state) => state.problemNotes);
  const completedPracticeProblemIds = useProgressStore((state) => state.completedPracticeProblemIds);
  const markPracticeProblemCompleted = useProgressStore((state) => state.markPracticeProblemCompleted);
  const unmarkPracticeProblemCompleted = useProgressStore((state) => state.unmarkPracticeProblemCompleted);
  const [handbookFilter, setHandbookFilter] = useState<HandbookFilter>('all');
  const [activePracticeNote, setActivePracticeNote] = useState<ActivePracticeNote | null>(null);

  const problemById = useMemo(() => new Map(problems.map((problem) => [problem.id, problem])), [problems]);
  const topicById = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);
  const completedPracticeSet = useMemo(
    () => new Set(completedPracticeProblemIds),
    [completedPracticeProblemIds]
  );

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

  const handbookPracticeBreakdown = useMemo(() => {
    return subtopics
      .map((subtopic) => {
        const practiceProblems = subtopic.practice_problems ?? [];
        const rows = practiceProblems.map((practiceProblem) => {
          const id = practiceProblemId(practiceProblem);
          const completed = completedPracticeSet.has(id) || hasPracticeNote(problemNotes[id]);
          return { id, problem: practiceProblem, completed };
        });
        const completedCount = rows.filter((row) => row.completed).length;
        const total = rows.length;
        const parentTopic = topicById.get(subtopic.parent_id);
        return {
          subtopic,
          parentTopic,
          rows,
          completedCount,
          total,
          percent: total === 0 ? 0 : Math.round((completedCount / total) * 100)
        };
      })
      .filter((item) => item.total > 0)
      .filter((item) => {
        if (handbookFilter === 'completed') return item.completedCount === item.total;
        if (handbookFilter === 'incomplete') return item.completedCount < item.total;
        return true;
      });
  }, [completedPracticeSet, handbookFilter, problemNotes, subtopics, topicById]);

  const handbookPracticeTotals = useMemo(() => {
    const allPracticeProblems = subtopics.flatMap((subtopic) => subtopic.practice_problems ?? []);
    const total = allPracticeProblems.length;
    const completed = allPracticeProblems.filter((practiceProblem) => {
      const id = practiceProblemId(practiceProblem);
      return completedPracticeSet.has(id) || hasPracticeNote(problemNotes[id]);
    }).length;
    return {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100)
    };
  }, [completedPracticeSet, problemNotes, subtopics]);

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
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>手冊練習進度</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                已完成 {handbookPracticeTotals.completed}/{handbookPracticeTotals.total} 題・
                {handbookPracticeTotals.percent}%
              </p>
            </div>
            <div className="flex rounded-xl border border-border bg-background p-1">
              {[
                { id: 'all', label: '全部' },
                { id: 'incomplete', label: '未完成' },
                { id: 'completed', label: '已完成' }
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setHandbookFilter(option.id as HandbookFilter)}
                  className={
                    handbookFilter === option.id
                      ? 'rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground'
                      : 'rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground'
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-3 rounded-full bg-accent">
            <div
              className="h-3 rounded-full bg-primary"
              style={{ width: `${handbookPracticeTotals.percent}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {handbookPracticeBreakdown.length > 0 ? (
            handbookPracticeBreakdown.map((item) => (
              <div key={item.subtopic.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {item.parentTopic?.title ?? '未分類主題'}
                    </p>
                    <h3 className="mt-1 font-semibold">{item.subtopic.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold">
                      {item.completedCount}/{item.total} 題・{item.percent}%
                    </span>
                    {item.parentTopic ? (
                      <Link
                        href={`/handbook/${item.parentTopic.slug}/${item.subtopic.slug}#practice`}
                        className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        前往練習
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-accent">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${item.percent}%` }} />
                </div>
                <div className="mt-4 grid gap-2">
                  {item.rows.map((row) => (
                    <PracticeProgressRow
                      key={row.id}
                      id={row.id}
                      problem={row.problem}
                      completed={row.completed}
                      onOpenNote={() =>
                        setActivePracticeNote({ id: row.id, title: row.problem.title })
                      }
                      onToggleCompleted={() =>
                        completedPracticeSet.has(row.id)
                          ? unmarkPracticeProblemCompleted(row.id)
                          : markPracticeProblemCompleted(row.id)
                      }
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              目前沒有符合篩選條件的手冊練習題。
            </p>
          )}
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

      <ProblemNotesModal
        problemId={activePracticeNote?.id ?? ''}
        title={activePracticeNote?.title}
        open={Boolean(activePracticeNote)}
        onClose={() => setActivePracticeNote(null)}
      />
    </div>
  );
}

function PracticeProgressRow({
  id,
  problem,
  completed,
  onOpenNote,
  onToggleCompleted
}: {
  id: string;
  problem: PracticeProblem;
  completed: boolean;
  onOpenNote: () => void;
  onToggleCompleted: () => void;
}) {
  const explicitlyCompleted = useProgressStore((state) =>
    state.completedPracticeProblemIds.includes(id)
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/45 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{problem.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {problem.source} {problem.source_id}
          {problem.rating ? `・${problem.rating}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={
            completed
              ? 'rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300'
              : 'rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-muted-foreground'
          }
        >
          {completed ? '已完成' : '未完成'}
        </span>
        <button
          type="button"
          onClick={onOpenNote}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          筆記
        </button>
        <button
          type="button"
          onClick={onToggleCompleted}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          {explicitlyCompleted ? '取消' : '完成'}
        </button>
      </div>
    </div>
  );
}
