'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  SkipForward,
  X,
  type LucideIcon
} from 'lucide-react';
import { DifficultyBadge, ProblemTypeBadge } from '@/components/Badges';
import { ProblemSourceLink } from '@/components/ProblemSourceLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, SubmissionStatus, Topic } from '@/lib/types';
import { cn, problemTypeLabel, ratingBands, submissionStatusLabel, toneSelectedClass } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

const statusOptions: SubmissionStatus[] = ['AC', 'WA', 'TLE', 'SKIP'];

const PAGE_SIZE = 20;

const statusIcon: Record<SubmissionStatus, LucideIcon> = {
  AC: Check,
  WA: X,
  TLE: Clock,
  SKIP: SkipForward
};

const statusButtonClass: Record<SubmissionStatus, string> = {
  AC: 'hover:border-emerald-400/60 hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-300',
  WA: 'hover:border-red-400/60 hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-300',
  TLE: 'hover:border-amber-400/60 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-300',
  SKIP: 'hover:border-slate-400/60 hover:bg-slate-500/15 hover:text-slate-600 dark:hover:text-slate-300'
};

export function PracticeArena({ problems, topics }: { problems: Problem[]; topics: Topic[] }) {
  const [problemCount, setProblemCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [page, setPage] = useState(1);
  const [filterSignatureState, setFilterSignatureState] = useState('');
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
    () =>
      new Set(
        submissions
          .filter((submission) => submission.status === 'AC')
          .map((submission) => submission.problemId)
      ),
    [submissions]
  );
  const allTags = useMemo(
    () => Array.from(new Set(problems.flatMap((problem) => problem.tags))).sort(),
    [problems]
  );
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

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProblems = useMemo(
    () => filteredProblems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredProblems, currentPage]
  );

  // Snap back to the first page whenever the filter signature changes. This uses
  // React's "adjust state while rendering" pattern instead of an effect.
  const filterSignature = `${filters.tag}|${filters.problemType}|${filters.completion}|${filters.band}|${filters.minRating}|${filters.maxRating}|${currentRating}`;
  if (filterSignature !== filterSignatureState) {
    setFilterSignatureState(filterSignature);
    setPage(1);
  }

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
              onChange={(event) =>
                setFilters({ problemType: event.target.value as typeof filters.problemType })
              }
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
              onChange={(event) =>
                setFilters({ completion: event.target.value as typeof filters.completion })
              }
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
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    filters.band === band.id
                      ? toneSelectedClass(band.tone)
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
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
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>題庫結果（{filteredProblems.length} 題）</CardTitle>
          {filteredProblems.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              第 {currentPage} / {totalPages} 頁
            </span>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-3">
          {pagedProblems.map((problem) => (
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
          {totalPages > 1 ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={filteredProblems.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
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
                <div
                  key={submission.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
                >
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
    <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-card-hover">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/problems/${problem.id}`} className="font-medium transition-colors hover:text-primary">
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
        <ProblemSourceLink
          problem={problem}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          打開原題
        </ProblemSourceLink>
        <span className="text-xs text-muted-foreground">
          ・題型：{problemTypeLabel(problem.problem_type)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <span className="text-xs text-muted-foreground">記錄結果</span>
        {statusOptions.map((status) => {
          const label = submissionStatusLabel(status);
          const Icon = statusIcon[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => onLog(status)}
              title={label}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 text-xs font-medium text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                statusButtonClass[status]
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onChange
}: {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);
  const pages = pageRange(currentPage, totalPages);

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
      <span className="text-xs text-muted-foreground">
        顯示第 {from}–{to} 題，共 {total} 題
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="上一頁"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        {pages.map((p, index) =>
          p === null ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={cn(
                'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                p === currentPage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="下一頁"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// Build a compact page list with ellipsis gaps, e.g. [1, null, 4, 5, 6, null, 12].
function pageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | null)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push(null);
    result.push(p);
    prev = p;
  }
  return result;
}
