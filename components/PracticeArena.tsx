'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  ListChecks,
  RefreshCw,
  Shuffle,
  SkipForward,
  Swords,
  Trophy,
  X,
  type LucideIcon
} from 'lucide-react';
import { DifficultyBadge, ProblemTypeBadge } from '@/components/Badges';
import { ProblemNotesModal } from '@/components/ProblemNotesModal';
import { ProblemSourceLink } from '@/components/ProblemSourceLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Contest, ContestProblem, Problem, SubmissionStatus, Subtopic, Topic } from '@/lib/types';
import {
  cn,
  problemDisplayTitle,
  problemTypeLabel,
  ratingBands,
  submissionStatusLabel,
  toneSelectedClass
} from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useProgressStore } from '@/store/useProgressStore';

const statusOptions: SubmissionStatus[] = ['AC', 'WA', 'TLE', 'SKIP'];

const PAGE_SIZE = 20;
type ContestType = 'all' | 'weekly' | 'biweekly';
type Position = 0 | 1 | 2 | 3;
type ActiveTab = 'problems' | 'contest' | 'lc-contest';

interface PickedContestProblem {
  problem: ContestProblem;
  contest: Contest;
  position: Position;
  canonicalProblem?: Problem;
}

const positionLabels: Record<Position, string> = { 0: 'Q1', 1: 'Q2', 2: 'Q3', 3: 'Q4' };

const positionClass: Record<Position, string> = {
  0: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  1: 'border-blue-400/40 bg-blue-500/15 text-blue-700 dark:text-blue-300',
  2: 'border-orange-400/40 bg-orange-500/15 text-orange-700 dark:text-orange-300',
  3: 'border-rose-400/40 bg-rose-500/15 text-rose-700 dark:text-rose-300'
};

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

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

function lcUrl(titleSlug: string, site: 'cn' | 'en') {
  const host = site === 'en' ? 'leetcode.com' : 'leetcode.cn';
  return `https://${host}/problems/${titleSlug}/`;
}

function contestUrl(contestId: string, site: 'cn' | 'en') {
  const host = site === 'en' ? 'leetcode.com' : 'leetcode.cn';
  return `https://${host}/contest/${contestId}/`;
}

export function PracticeArena({
  problems,
  topics,
  subtopics,
  contests
}: {
  problems: Problem[];
  topics: Topic[];
  subtopics: Subtopic[];
  contests: Contest[];
}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('problems');
  const [problemCount, setProblemCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [page, setPage] = useState(1);
  const [filterSignatureState, setFilterSignatureState] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [subtopicFilter, setSubtopicFilter] = useState('all');
  const [contestType, setContestType] = useState<ContestType>('all');
  const [contestPositions, setContestPositions] = useState<Set<Position>>(new Set([2, 3]));
  const [contestMinRating, setContestMinRating] = useState(1600);
  const [contestMaxRating, setContestMaxRating] = useState(2800);
  const [contestPickCount, setContestPickCount] = useState(4);
  const [pickedContestProblems, setPickedContestProblems] = useState<PickedContestProblem[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const leetCodeSite = useSettingsStore((state) => state.leetCodeSite);
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
  const problemBySlug = useMemo(
    () =>
      new Map(
        problems
          .filter((problem) => problem.source === 'leetcode')
          .map((problem) => [problem.source_id, problem])
      ),
    [problems]
  );
  const visibleSubtopics = useMemo(
    () => subtopics.filter((subtopic) => topicFilter === 'all' || subtopic.parent_id === topicFilter),
    [subtopics, topicFilter]
  );
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
        if (topicFilter !== 'all' && problem.topic_id !== topicFilter) return false;
        if (subtopicFilter !== 'all' && !problem.subtopic_ids?.includes(subtopicFilter)) return false;
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
  }, [acceptedSet, filters, problems, reviewedSet, subtopicFilter, topicFilter]);

  const contestPool = useMemo<PickedContestProblem[]>(() => {
    const result: PickedContestProblem[] = [];
    for (const contest of contests) {
      if (contestType !== 'all' && contest.type !== contestType) continue;
      for (const position of [0, 1, 2, 3] as Position[]) {
        if (!contestPositions.has(position)) continue;
        const problem = contest.problems[position];
        if (!problem) continue;
        if (problem.rating === 0) continue;
        if (problem.rating < contestMinRating || problem.rating > contestMaxRating) continue;
        result.push({
          problem,
          contest,
          position,
          canonicalProblem: problemBySlug.get(problem.titleSlug)
        });
      }
    }
    return result;
  }, [contestMaxRating, contestMinRating, contestPositions, contestType, contests, problemBySlug]);

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

  const filterSignature = `${filters.tag}|${filters.problemType}|${filters.completion}|${filters.band}|${filters.minRating}|${filters.maxRating}|${currentRating}|${topicFilter}|${subtopicFilter}`;
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

  const isContestActive = activeContest !== null;
  const isContestExpired = useMemo(() => {
    if (!activeContest) return false;
    const endTime = new Date(activeContest.startedAt).getTime() + activeContest.durationMinutes * 60_000;
    return Date.now() >= endTime;
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
    const picked = pickRandom(filteredProblems, problemCount).map((problem) => problem.id);
    if (picked.length > 0) startContest(picked, durationMinutes);
  }

  function toggleContestPosition(position: Position) {
    setContestPositions((prev) => {
      const next = new Set(prev);
      if (next.has(position)) {
        if (next.size > 1) next.delete(position);
      } else {
        next.add(position);
      }
      return next;
    });
  }

  function pickContestProblems() {
    setPickedContestProblems(pickRandom(contestPool, contestPickCount));
  }

  const tabs: { id: ActiveTab; label: string; icon: LucideIcon; description: string }[] = [
    {
      id: 'problems',
      label: '題庫練習',
      icon: ListChecks,
      description: '依照分段篩選題目，記錄提交結果'
    },
    {
      id: 'contest',
      label: '虛擬競賽',
      icon: Swords,
      description: '從篩選結果抽題模擬比賽計時'
    },
    {
      id: 'lc-contest',
      label: '競賽抽題',
      icon: Trophy,
      description: '從 LeetCode 週賽 / 雙週賽抽取題目'
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── Filter card: always visible ─────────────────────────────────── */}
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
            <span className="text-muted-foreground">主題</span>
            <select
              value={topicFilter}
              onChange={(event) => {
                setTopicFilter(event.target.value);
                setSubtopicFilter('all');
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部主題</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">子分類</span>
            <select
              value={subtopicFilter}
              onChange={(event) => setSubtopicFilter(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部子分類</option>
              {visibleSubtopics.map((subtopic) => (
                <option key={subtopic.id} value={subtopic.id}>
                  {topicById.get(subtopic.parent_id)?.title ?? '未分類'} / {subtopic.title}
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
          <div className="space-y-2 text-sm lg:col-span-4">
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

      {/* ── Tab navigation ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-muted/40 p-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{tab.label}</span>
              {tab.id === 'contest' && isContestActive && !isContestExpired && (
                <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab: 題庫練習 ────────────────────────────────────────────────── */}
      {activeTab === 'problems' && (
        <>
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
        </>
      )}

      {/* ── Tab: 虛擬競賽 ────────────────────────────────────────────────── */}
      {activeTab === 'contest' && (
        <Card>
          <CardHeader>
            <CardTitle>虛擬競賽模式</CardTitle>
            <p className="text-sm text-muted-foreground">
              從上方篩選器的結果中隨機抽取題目，設定時間後開始模擬競賽。
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Settings row */}
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
                <Button
                  type="button"
                  onClick={beginContest}
                  disabled={filteredProblems.length === 0 || isContestActive}
                >
                  開始模擬賽
                </Button>
                {isContestActive ? (
                  <Button type="button" variant="secondary" onClick={endContest}>
                    結束競賽
                  </Button>
                ) : null}
              </div>
            </div>

            {filteredProblems.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠ 目前篩選結果為空，請調整上方篩選器後再開始。
              </p>
            )}

            {/* Timer */}
            <div
              className={cn(
                'rounded-2xl border p-4',
                isContestActive && !isContestExpired
                  ? 'border-emerald-400/40 bg-emerald-500/10'
                  : isContestExpired
                    ? 'border-rose-400/40 bg-rose-500/10'
                    : 'border-border bg-background/50'
              )}
            >
              <p className="text-sm text-muted-foreground">
                {isContestExpired ? '時間到' : '剩餘時間'}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {isContestExpired ? '00:00' : remainingText}
              </p>
            </div>

            {/* Contest problem list */}
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
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                按「開始模擬賽」後，競賽題目會顯示在這裡。
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Tab: 競賽抽題 ────────────────────────────────────────────────── */}
      {activeTab === 'lc-contest' && (
        <Card>
          <CardHeader>
            <CardTitle>LeetCode 競賽抽題</CardTitle>
            <p className="text-sm text-muted-foreground">
              從 LeetCode 週賽 / 雙週賽題庫依難度隨機抽取題目，不受上方篩選器限制。
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Filters */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2 text-sm">
                <span className="text-muted-foreground">比賽類型</span>
                <div className="flex flex-wrap gap-2">
                  {([['all', '全部'], ['weekly', '週賽'], ['biweekly', '雙週賽']] as const).map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setContestType(value as ContestType)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          contestType === value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <span className="text-muted-foreground">題目位置</span>
                <div className="flex flex-wrap gap-2">
                  {([0, 1, 2, 3] as Position[]).map((position) => (
                    <button
                      key={position}
                      type="button"
                      onClick={() => toggleContestPosition(position)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        contestPositions.has(position)
                          ? positionClass[position]
                          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {positionLabels[position]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <span className="text-muted-foreground">難度範圍</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={contestMinRating}
                    onChange={(event) => setContestMinRating(Number(event.target.value))}
                    className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5"
                    aria-label="最低 rating"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="number"
                    value={contestMaxRating}
                    onChange={(event) => setContestMaxRating(Number(event.target.value))}
                    className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5"
                    aria-label="最高 rating"
                  />
                </div>
              </div>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">抽取題數</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={contestPickCount}
                  onChange={(event) =>
                    setContestPickCount(Math.max(1, Math.min(10, Number(event.target.value))))
                  }
                  className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5"
                />
              </label>
            </div>

            {/* Action row */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={pickContestProblems}
                disabled={contestPool.length === 0}
                className="gap-2"
              >
                <Shuffle className="h-4 w-4" aria-hidden />
                隨機抽題（{contestPickCount} 題）
              </Button>
              {pickedContestProblems.length > 0 ? (
                <Button variant="secondary" onClick={pickContestProblems} className="gap-2">
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  重新抽取
                </Button>
              ) : null}
              <span className="text-sm text-muted-foreground">
                符合條件：{contestPool.length} 題（來自{' '}
                {new Set(contestPool.map((p) => p.contest.contestId)).size} 場比賽）
              </span>
            </div>

            {/* Picked problems */}
            {contestPool.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                目前篩選條件沒有符合的題目，請調整難度範圍或題目位置。
              </div>
            )}
            {pickedContestProblems.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {pickedContestProblems.map((picked, index) => (
                  <ContestPickedProblemRow
                    key={`${picked.problem.id}-${index}`}
                    picked={picked}
                    site={leetCodeSite}
                    topicTitle={
                      picked.canonicalProblem
                        ? (topicById.get(picked.canonicalProblem.topic_id)?.title ?? '未分類')
                        : '未分類'
                    }
                    onLog={(status) =>
                      picked.canonicalProblem
                        ? logSubmission(
                            picked.canonicalProblem.id,
                            status,
                            picked.canonicalProblem.topic_id
                          )
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : contestPool.length > 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                按「隨機抽題」從 LeetCode 週賽題庫抽取題目。
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContestPickedProblemRow({
  picked,
  site,
  topicTitle,
  onLog
}: {
  picked: PickedContestProblem;
  site: 'cn' | 'en';
  topicTitle: string;
  onLog: (status: SubmissionStatus) => void;
}) {
  const canonical = picked.canonicalProblem;
  const [showNotes, setShowNotes] = useState(false);
  const problemNote = useProgressStore((state) => (canonical ? state.problemNotes[canonical.id] : undefined));

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-card-hover">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium',
                positionClass[picked.position]
              )}
            >
              {positionLabels[picked.position]}
            </span>
            {picked.problem.premium ? (
              <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                Premium
              </span>
            ) : null}
          </div>
          {canonical ? (
            <Link
              href={`/problems/${canonical.id}`}
              className="font-medium transition-colors hover:text-primary"
            >
              {canonical.frontend_id}. {canonical.title}
            </Link>
          ) : (
            <a
              href={lcUrl(picked.problem.titleSlug, site)}
              target="_blank"
              rel="noreferrer"
              className="font-medium transition-colors hover:text-primary"
            >
              {picked.problem.id}. {picked.problem.title}
            </a>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {topicTitle}・
            <a
              href={contestUrl(picked.contest.contestId, site)}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-primary"
            >
              {picked.contest.title}
            </a>
          </p>
        </div>
        <DifficultyBadge rating={picked.problem.rating} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={lcUrl(picked.problem.titleSlug, site)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          打開原題
        </a>
        {canonical ? (
          <span className="text-xs text-muted-foreground">・已併入手冊，可記錄進度</span>
        ) : (
          <span className="text-xs text-muted-foreground">・尚未對應到手冊分類</span>
        )}
        {canonical ? (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="text-sm font-medium text-primary transition hover:underline"
          >
            {problemNote ? '查看解答與思路' : '記錄解答與思路'}
          </button>
        ) : null}
      </div>
      {canonical ? (
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
      ) : null}
      {canonical ? (
        <ProblemNotesModal
          problemId={canonical.id}
          title={problemDisplayTitle(canonical)}
          open={showNotes}
          onClose={() => setShowNotes(false)}
        />
      ) : null}
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
  const [showNotes, setShowNotes] = useState(false);
  const problemNote = useProgressStore((state) => state.problemNotes[problem.id]);

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
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="text-sm font-medium text-primary transition hover:underline"
        >
          {problemNote ? '查看解答與思路' : '記錄解答與思路'}
        </button>
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
      <ProblemNotesModal
        problemId={problem.id}
        title={problemDisplayTitle(problem)}
        open={showNotes}
        onClose={() => setShowNotes(false)}
      />
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
