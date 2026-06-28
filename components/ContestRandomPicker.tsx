'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, RefreshCw, Shuffle, Trophy } from 'lucide-react';
import { DifficultyBadge } from '@/components/Badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Contest, ContestProblem } from '@/lib/types';
import { cn, difficultyClass, difficultyLabel } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

type ContestType = 'all' | 'weekly' | 'biweekly';
type Position = 0 | 1 | 2 | 3;

interface PickedProblem {
  problem: ContestProblem;
  contest: Contest;
  position: Position;
}

const positionLabels: Record<Position, string> = { 0: 'Q1', 1: 'Q2', 2: 'Q3', 3: 'Q4' };

const positionClass: Record<Position, string> = {
  0: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  1: 'border-blue-400/40 bg-blue-500/15 text-blue-700 dark:text-blue-300',
  2: 'border-orange-400/40 bg-orange-500/15 text-orange-700 dark:text-orange-300',
  3: 'border-rose-400/40 bg-rose-500/15 text-rose-700 dark:text-rose-300'
};

function lcUrl(titleSlug: string, site: 'cn' | 'en') {
  const host = site === 'en' ? 'leetcode.com' : 'leetcode.cn';
  return `https://${host}/problems/${titleSlug}/`;
}

function contestUrl(contestId: string, site: 'cn' | 'en') {
  const host = site === 'en' ? 'leetcode.com' : 'leetcode.cn';
  return `https://${host}/contest/${contestId}/`;
}

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

export function ContestRandomPicker({ contests }: { contests: Contest[] }) {
  const leetCodeSite = useSettingsStore((s) => s.leetCodeSite);

  const [contestType, setContestType] = useState<ContestType>('all');
  const [positions, setPositions] = useState<Set<Position>>(new Set([2, 3]));
  const [minRating, setMinRating] = useState(1600);
  const [maxRating, setMaxRating] = useState(2800);
  const [pickCount, setPickCount] = useState(4);
  const [picked, setPicked] = useState<PickedProblem[]>([]);

  function togglePosition(pos: Position) {
    setPositions((prev) => {
      const next = new Set(prev);
      if (next.has(pos)) {
        if (next.size > 1) next.delete(pos);
      } else {
        next.add(pos);
      }
      return next;
    });
  }

  const pool = useMemo<PickedProblem[]>(() => {
    const result: PickedProblem[] = [];
    for (const contest of contests) {
      if (contestType !== 'all' && contest.type !== contestType) continue;
      for (const pos of [0, 1, 2, 3] as Position[]) {
        if (!positions.has(pos)) continue;
        const prob = contest.problems[pos];
        if (!prob) continue;
        if (prob.rating === 0) continue;
        if (prob.rating < minRating || prob.rating > maxRating) continue;
        result.push({ problem: prob, contest, position: pos });
      }
    }
    return result;
  }, [contests, contestType, positions, minRating, maxRating]);

  function pick() {
    setPicked(pickRandom(pool, pickCount));
  }

  const typeOptions: { value: ContestType; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'weekly', label: '週賽' },
    { value: 'biweekly', label: '雙週賽' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>篩選設定</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 text-sm">
            <span className="text-muted-foreground">比賽類型</span>
            <div className="flex gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setContestType(opt.value)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    contestType === opt.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <span className="text-muted-foreground">題目位置</span>
            <div className="flex gap-2">
              {([0, 1, 2, 3] as Position[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => togglePosition(pos)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    positions.has(pos)
                      ? positionClass[pos]
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {positionLabels[pos]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm sm:col-span-2 lg:col-span-1">
            <span className="text-muted-foreground">難度範圍</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minRating}
                min={800}
                max={3500}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5"
                aria-label="最低 rating"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="number"
                value={maxRating}
                min={800}
                max={3500}
                onChange={(e) => setMaxRating(Number(e.target.value))}
                className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5"
                aria-label="最高 rating"
              />
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <span className="text-muted-foreground">抽取題數</span>
            <input
              type="number"
              value={pickCount}
              min={1}
              max={10}
              onChange={(e) => setPickCount(Math.max(1, Math.min(10, Number(e.target.value))))}
              className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={pick} disabled={pool.length === 0} className="gap-2">
          <Shuffle className="h-4 w-4" aria-hidden />
          隨機抽題（{pickCount} 題）
        </Button>
        {picked.length > 0 && (
          <Button variant="secondary" onClick={pick} className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden />
            重新抽取
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          符合條件：{pool.length} 題（來自 {new Set(pool.map((p) => p.contest.contestId)).size} 場比賽）
        </span>
      </div>

      {pool.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          目前篩選條件沒有符合的題目，請調整難度範圍或題目位置。
        </div>
      )}

      {picked.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {picked.map(({ problem, contest, position }, index) => (
            <PickedProblemCard
              key={`${problem.id}-${index}`}
              problem={problem}
              contest={contest}
              position={position}
              site={leetCodeSite}
            />
          ))}
        </div>
      )}

      {picked.length === 0 && pool.length > 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          按「隨機抽題」開始抽取比賽題目。
        </div>
      )}
    </div>
  );
}

function PickedProblemCard({
  problem,
  contest,
  position,
  site
}: {
  problem: ContestProblem;
  contest: Contest;
  position: Position;
  site: 'cn' | 'en';
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-5 shadow-sm transition hover:border-primary/40 hover:shadow-card-hover">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={positionClass[position]}>{positionLabels[position]}</Badge>
            {problem.premium && (
              <Badge className="border-amber-400/40 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                Premium
              </Badge>
            )}
          </div>
          <a
            href={lcUrl(problem.titleSlug, site)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1 font-semibold transition hover:text-primary"
          >
            {problem.id}. {problem.title}
            <ExternalLink className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden />
          </a>
        </div>
        <DifficultyBadge rating={problem.rating} />
      </div>

      <div className="flex items-center gap-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <Trophy className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <a
          href={contestUrl(contest.contestId, site)}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate transition hover:text-foreground hover:underline"
        >
          {contest.title}
        </a>
      </div>
    </div>
  );
}
