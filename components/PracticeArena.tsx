'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DifficultyBadge, ProblemTypeBadge } from '@/components/Badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, SubmissionStatus, Topic } from '@/lib/types';
import { problemTypeLabel, ratingBands, sourceLabel, sourceUrl, submissionStatusLabel, cn } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

const statusOptions: SubmissionStatus[] = ['AC', 'WA', 'TLE', 'SKIP'];

const statusIcon: Record<SubmissionStatus, string> = {
  AC: '✅',
  WA: '❌',
  TLE: '⏱',
  SKIP: '⏭'
};

const statusButtonClass: Record<SubmissionStatus, string> = {
  AC: 'hover:border-emerald-400/60 hover:bg-emerald-500/15',
  WA: 'hover:border-red-400/60 hover:bg-red-500/15',
  TLE: 'hover:border-yellow-400/60 hover:bg-yellow-500/15',
  SKIP: 'hover:border-slate-400/60 hover:bg-slate-500/15'
};

export function PracticeArena({ problems, topics }: { problems: Problem[]; topics: Topic[] }) {
  const [problemCount, setProblemCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [now, setNow] = useState(() => Date.now());
  const currentRating = useProgressStore((state) => state.currentRating);
  const filters = useProgressStore((state) => state.filters);
  const reviewedProblemIds = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);
  const activeContest = useProgressStore((state) => state.activeContest);
  const setCurrentRating = useProgressStore((state) => state.setCurrentRating);
  const setFilters = useProgressStore((state) => state.setFilters);
  const startContest = useProgressStore((state) => state.startContest);
  const endContest = useProgressStore((state) => state.endContest);
  const logSubmission = useProgressStore((state) => state.logSubmission);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const topicById = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);
  const problemById = useMemo(() => new Map(problems.map((problem) => [problem.id, problem])), [problems]);
  const reviewedSet = useMemo(() => new Set(reviewedProblemIds), [reviewedProblemIds]);
  const acceptedSet = useMemo(
    () => new Set(submissions.filter((submission) => submission.status === 'AC').map((submission) => submission.problemId)),
    [submissions]
  );
  const allTags = useMemo(() => Array.from(new Set(problems.flatMap((problem) => problem.tags))).sort(), [problems]);
  const bands = ratingBands(currentRating);

  const filteredProblems = useMemo(() => {
    return problems
      .filter((problem) => {
        if (filters.tag !== 'all' && !problem.tags.includes(filters.tag)) return false;
        if (problem.rating < filters.minRating) return false;
        if (filters.maxRating !== null && problem.rating > filters.maxRating) return false;
        if (filters.problemType !== 'all' && problem.problem_type !== filters.problemType) return false;
        if (filters.completion === 'reviewed' && !reviewedSet.has(problem.id)) return false;
        if (filters.completion === 'unreviewed' && reviewedSet.has(problem.id)) return false;
        if (filters.completion === 'accepted' && !acceptedSet.has(problem.id)) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.band === 'stretch') return (b.solve_count ?? 0) - (a.solve_count ?? 0);
        return a.rating - b.rating || (b.solve_count ?? 0) - (a.solve_count ?? 0);
      });
  }, [acceptedSet, filters, problems, reviewedSet]);

  const contestProblems = useMemo(() => {
    if (!activeContest) return [];
    const picked = new Set(activeContest.problemIds);
    return problems.filter((problem) => picked.has(problem.id));
  }, [activeContest, problems]);

  const remainingText = useMemo(() => {
    if (!activeContest) return '尚未開始';
    const endTime = new Date(activeContest.startedAt).getTime() + activeContest.durationMinutes * 60_000;
    const remaining = Math.max(0, endTime - now);
    const minutes = Math.floor(remaining / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [activeContest, now]);

  function applyBand(bandId: typeof filters.band) {
    const band = bands.find((item) => item.id === bandId);
    if (!band) return;
    setFilters({ band: bandId, minRating: band.min, maxRating: band.max });
  }

  function updateRating(value: number) {
    setCurrentRating(value);
    const band = ratingBands(value).find((item) => item.id === filters.band);
    if (band) setFilters({ minRating: band.min, maxRating: band.max });
  }

  function beginContest() {
    const picked = filteredProblems.slice(0, problemCount).map((problem) => problem.id);
    if (picked.length > 0) startContest(picked, durationMinutes);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>練習篩選器</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">自評分數</span>
            <input
              type="number"
              value={currentRating}
              onChange={(event) => updateRating(Number(event.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">標籤</span>
            <select
              value={filters.tag}
              onChange={(event) => setFilters({ tag: event.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部標籤</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">題型</span>
            <select
              value={filters.problemType}
              onChange={(event) => setFilters({ problemType: event.target.value as typeof filters.problemType })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部題型</option>
              <option value="template">模板</option>
              <option value="classic">經典</option>
              <option value="insight_transfer">思維</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">完成狀態</span>
            <select
              value={filters.completion}
              onChange={(event) => setFilters({ completion: event.target.value as typeof filters.completion })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部狀態</option>
              <option value="unreviewed">尚未複習</option>
              <option value="reviewed">已複習</option>
              <option value="accepted">已通過</option>
            </select>
          </label>
          <div className="space-y-2 text-sm lg:col-span-2">
            <span className="text-muted-foreground">分數範圍</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minRating}
                onChange={(event) => setFilters({ minRating: Number(event.target.value) })}
                className="rounded-xl border border-border bg-background px-3 py-2"
                aria-label="最低分數"
              />
              <input
                type="number"
                value={filters.maxRating ?? ''}
                onChange={(event) =>
                  setFilters({ maxRating: event.target.value ? Number(event.target.value) : null })
                }
                placeholder="無上限"
                className="rounded-xl border border-border bg-background px-3 py-2"
                aria-label="最高分數"
              />
            </div>
          </div>
          <div className="space-y-2 text-sm lg:col-span-2">
            <span className="text-muted-foreground">分段預設</span>
            <div className="flex flex-wrap gap-2">
              {bands.map((band) => (
                <button
                  key={band.id}
                  type="button"
                  onClick={() => applyBand(band.id)}
                  className={
                    filters.band === band.id
                      ? 'rounded-xl bg-primary px-3 py-2 text-primary-foreground'
                      : 'rounded-xl border border-border px-3 py-2 text-muted-foreground'
                  }
                  title={band.description}
                >
                  {band.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>虛擬競賽模式</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">題目數量</span>
              <input
                type="number"
                min={1}
                value={problemCount}
                onChange={(event) => setProblemCount(Number(event.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">計時分鐘</span>
              <input
                type="number"
                min={10}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              />
            </label>
            <div className="flex items-end gap-2">
              <Button type="button" onClick={beginContest} disabled={filteredProblems.length === 0}>
                開始模擬賽
              </Button>
              {activeContest ? (
                <Button type="button" variant="secondary" onClick={endContest}>
                  結束
                </Button>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="text-sm text-muted-foreground">剩餘時間</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{remainingText}</p>
          </div>
          {contestProblems.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {contestProblems.map((problem) => (
                <PracticeProblemRow
                  key={problem.id}
                  problem={problem}
                  topicTitle={topicById.get(problem.topic_id)?.title ?? '未分類'}
                  onLog={(status) => logSubmission(problem.id, status, problem.topic_id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">尚未選取競賽題目。</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>題庫結果（{filteredProblems.length} 題）</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {filteredProblems.slice(0, 30).map((problem) => (
            <PracticeProblemRow
              key={problem.id}
              problem={problem}
              topicTitle={topicById.get(problem.topic_id)?.title ?? '未分類'}
              onLog={(status) => logSubmission(problem.id, status, problem.topic_id)}
            />
          ))}
          {filteredProblems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              目前篩選條件沒有符合的題目。
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>提交紀錄</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {submissions.length > 0 ? (
            submissions.slice(0, 12).map((submission) => {
              const problem = problemById.get(submission.problemId);
              return (
                <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4">
                  <div>
                    <p className="font-medium">{problem?.title ?? '未知題目'}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <span className="rounded-full border border-border bg-accent px-3 py-1 text-sm">
                    {submissionStatusLabel(submission.status)}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              尚未記錄任何提交結果。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PracticeProblemRow({
  problem,
  topicTitle,
  onLog
}: {
  problem: Problem;
  topicTitle: string;
  onLog: (status: SubmissionStatus) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/45 p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/problems/${problem.id}`} className="font-medium hover:text-primary">
            {problem.title}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{topicTitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DifficultyBadge rating={problem.rating} />
          <ProblemTypeBadge problemType={problem.problem_type} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a href={sourceUrl(problem)} target="_blank" rel="noreferrer" className="text-sm text-primary">
          {sourceLabel(problem.source)} 題面
        </a>
        <span className="text-xs text-muted-foreground">題型：{problemTypeLabel(problem.problem_type)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {statusOptions.map((status) => {
          const label = submissionStatusLabel(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => onLog(status)}
              title={label}
              aria-label={label}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/60 text-base transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                statusButtonClass[status]
              )}
            >
              <span aria-hidden>{statusIcon[status]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
