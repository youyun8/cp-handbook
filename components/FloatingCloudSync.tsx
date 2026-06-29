'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CircleHelp, Cloud, RefreshCw, X } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { isStaticExport } from '@/lib/runtime';
import { useProgressStore } from '@/store/useProgressStore';

type AutoSyncStatus = 'idle' | 'pending' | 'syncing' | 'error';
type ManualResult = { kind: 'idle' | 'ok' | 'error'; message?: string };

const AUTO_SYNC_DEBOUNCE_MS = 3000;

function computeDataHash(state: ReturnType<typeof useProgressStore.getState>): string {
  return JSON.stringify([
    state.currentRating,
    state.reviewedProblemIds,
    state.coveredTopicIds,
    state.submissions.map((s) => s.id),
    state.reviewEvents.length,
    state.practiceCompletionEvents.length,
    state.contestSessions.map((s) => s.id),
    Object.entries(state.problemNotes)
      .map(([id, n]) => `${id}:${n.updatedAt}`)
      .sort(),
    state.completedPracticeProblemIds
  ]);
}

function formatSyncTime(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function formatSyncTimeCompact(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (isToday) {
    return new Intl.DateTimeFormat('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function DiagSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {title}
      </p>
      <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function DiagRow({ label, value, mono = true }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-3 py-2">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className={`break-all text-right text-xs ${mono ? 'font-mono' : 'font-medium'}`}>
        {String(value)}
      </span>
    </div>
  );
}

export function FloatingCloudSync() {
  const [open, setOpen] = useState(false);

  if (isStaticExport) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {open && (
          <div className="w-[min(calc(100vw-2.5rem),22rem)] rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">進度儲存</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  靜態部署版本只能使用本機儲存；雲端同步需伺服器部署。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="關閉同步面板"
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="開啟進度同步"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Cloud className="h-6 w-6" aria-hidden />
        </button>
      </div>
    );
  }

  return <FloatingCloudSyncAuthed open={open} setOpen={setOpen} />;
}

function FloatingCloudSyncAuthed({
  open,
  setOpen
}: {
  open: boolean;
  setOpen: (open: boolean | ((v: boolean) => boolean)) => void;
}) {
  const { data: session, status } = useSession();
  const lastCloudSyncAt = useProgressStore((s) => s.lastCloudSyncAt);

  // Diagnostic data from store
  const currentRating = useProgressStore((s) => s.currentRating);
  const reviewedCount = useProgressStore((s) => s.reviewedProblemIds.length);
  const submissionCount = useProgressStore((s) => s.submissions.length);
  const notesCount = useProgressStore((s) => Object.keys(s.problemNotes).length);
  const completedCount = useProgressStore((s) => s.completedPracticeProblemIds.length);
  const contestCount = useProgressStore((s) => s.contestSessions.length);

  const [autoSyncStatus, setAutoSyncStatus] = useState<AutoSyncStatus>('idle');
  const [manualResult, setManualResult] = useState<ManualResult>({ kind: 'idle' });
  const [busyManual, setBusyManual] = useState<null | 'save'>(null);
  const [showDiag, setShowDiag] = useState(false);

  const lastSyncedHashRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLoggedInRef = useRef<boolean | undefined>(undefined);

  const isLoggedIn = !!session?.user;
  const lastCloudSyncText = formatSyncTime(lastCloudSyncAt);
  const sessionKey = session?.user?.email ?? session?.user?.name ?? null;

  useEffect(() => {
    if (status === 'loading') return;

    const loggedIn = !!session?.user;
    const justLoggedIn = loggedIn && !prevLoggedInRef.current;
    prevLoggedInRef.current = loggedIn;

    if (!loggedIn) {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      setAutoSyncStatus('idle');
      return;
    }

    if (justLoggedIn) {
      isSyncingRef.current = true;
      setAutoSyncStatus('syncing');
      useProgressStore
        .getState()
        .loadFromCloud()
        .then(() => {
          lastSyncedHashRef.current = computeDataHash(useProgressStore.getState());
          setAutoSyncStatus('idle');
        })
        .catch(() => {
          setAutoSyncStatus('error');
        })
        .finally(() => {
          isSyncingRef.current = false;
        });
    }

    const unsub = useProgressStore.subscribe((state) => {
      if (isSyncingRef.current) return;
      const hash = computeDataHash(state);
      if (hash === lastSyncedHashRef.current) return;
      setAutoSyncStatus('pending');
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(async () => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;
        setAutoSyncStatus('syncing');
        try {
          const res = await useProgressStore.getState().syncToCloud();
          lastSyncedHashRef.current = computeDataHash(useProgressStore.getState());
          setAutoSyncStatus(res.ok ? 'idle' : 'error');
        } catch {
          setAutoSyncStatus('error');
        } finally {
          isSyncingRef.current = false;
        }
      }, AUTO_SYNC_DEBOUNCE_MS);
    });

    return () => {
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionKey]);

  async function runManualSync() {
    setBusyManual('save');
    setManualResult({ kind: 'idle' });
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    isSyncingRef.current = true;
    setAutoSyncStatus('syncing');
    try {
      const res = await useProgressStore.getState().syncToCloud();
      lastSyncedHashRef.current = computeDataHash(useProgressStore.getState());
      setAutoSyncStatus(res.ok ? 'idle' : 'error');
      setManualResult(
        res.ok
          ? { kind: 'ok', message: '已同步至雲端。' }
          : { kind: 'error', message: res.error ?? '操作失敗。' }
      );
    } catch {
      setAutoSyncStatus('error');
      setManualResult({ kind: 'error', message: '操作失敗。' });
    } finally {
      setBusyManual(null);
      isSyncingRef.current = false;
    }
  }

  // ── derived values ──────────────────────────────────────────────────────────

  const dotClass = !isLoggedIn
    ? null
    : autoSyncStatus === 'syncing'
      ? 'bg-sky-400 animate-pulse'
      : autoSyncStatus === 'pending'
        ? 'bg-amber-400 animate-pulse'
        : autoSyncStatus === 'error'
          ? 'bg-red-500'
          : 'bg-emerald-500';

  const statusColor =
    autoSyncStatus === 'error'
      ? 'text-red-500'
      : autoSyncStatus === 'pending'
        ? 'text-amber-500 dark:text-amber-400'
        : 'text-muted-foreground';

  const statusLabel =
    autoSyncStatus === 'syncing'
      ? '同步中…'
      : autoSyncStatus === 'pending'
        ? '有待同步的變更'
        : autoSyncStatus === 'error'
          ? '上次同步失敗'
          : lastCloudSyncText
            ? `已同步 · ${lastCloudSyncText}`
            : '尚未同步至雲端';

  const diagStatusLabel =
    autoSyncStatus === 'idle'
      ? lastCloudSyncAt
        ? '已同步'
        : '閒置（從未同步）'
      : autoSyncStatus === 'syncing'
        ? '同步中'
        : autoSyncStatus === 'pending'
          ? '待同步'
          : '同步失敗';

  const isBusy = busyManual !== null || autoSyncStatus === 'syncing';

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Diagnostic overlay ── */}
      {showDiag && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-black/30 backdrop-blur-md"
          onClick={() => setShowDiag(false)}
        >
          <div
            className="w-[min(calc(100vw-2.5rem),22rem)] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <CircleHelp className="h-4 w-4 text-muted-foreground" aria-hidden />
                <p className="text-sm font-semibold">同步診斷</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDiag(false)}
                aria-label="關閉診斷面板"
                className="rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Modal body */}
            <div className="space-y-4 p-4">
              <DiagSection title="登入資訊">
                <DiagRow label="使用者" value={session?.user?.name ?? '—'} mono={false} />
                <DiagRow label="Email" value={session?.user?.email ?? '—'} />
                <DiagRow label="狀態" value={isLoggedIn ? '已登入' : '未登入'} mono={false} />
              </DiagSection>

              <DiagSection title="同步狀態">
                <DiagRow label="目前狀態" value={diagStatusLabel} mono={false} />
                <DiagRow label="最後同步" value={lastCloudSyncAt ?? '從未同步'} />
              </DiagSection>

              <DiagSection title="本機資料">
                <DiagRow label="目前評分" value={currentRating} />
                <DiagRow label="已複習題目" value={`${reviewedCount} 題`} />
                <DiagRow label="提交記錄" value={`${submissionCount} 筆`} />
                <DiagRow label="解題筆記" value={`${notesCount} 則`} />
                <DiagRow label="已完成練習" value={`${completedCount} 題`} />
                <DiagRow label="比賽場次" value={`${contestCount} 場`} />
              </DiagSection>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB area ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {/* Panel */}
        {open && (
          <div className="w-[min(calc(100vw-2.5rem),22rem)] overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur">
            {isLoggedIn ? (
              <>
                {/* Header: avatar + name + status + close */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt=""
                      width={40}
                      height={40}
                      className="shrink-0 rounded-full border border-border"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Cloud className="h-5 w-5 text-muted-foreground" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {session.user?.name ?? session.user?.email ?? 'GitHub 使用者'}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {dotClass && (
                        <span
                          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`}
                          aria-hidden
                        />
                      )}
                      <p className={`truncate text-xs ${statusColor}`}>{statusLabel}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="關閉同步面板"
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-border/50" />

                {/* Actions */}
                <div className="px-4 pt-3 pb-4 space-y-3">
                  <button
                    type="button"
                    onClick={runManualSync}
                    disabled={isBusy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {autoSyncStatus === 'syncing' ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                        同步中…
                      </>
                    ) : (
                      '立即同步'
                    )}
                  </button>

                  {manualResult.kind !== 'idle' && (
                    <p
                      className={`text-center text-xs font-medium ${
                        manualResult.kind === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}
                    >
                      {manualResult.message}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setShowDiag(true);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1 text-xs text-muted-foreground/60 transition hover:text-muted-foreground"
                  >
                    <CircleHelp className="h-3.5 w-3.5" aria-hidden />
                    診斷資訊
                  </button>
                </div>
              </>
            ) : (
              /* Not logged in */
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">雲端同步</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      登入後可自動同步進度、解答與練習狀態。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="關閉同步面板"
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                {status !== 'loading' && (
                  <button
                    type="button"
                    onClick={() => signIn('github')}
                    className="mt-4 w-full rounded-xl bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    使用 GitHub 登入
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* FAB + compact time label */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="開啟雲端同步"
            className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Cloud className="h-6 w-6" aria-hidden />
            {dotClass && (
              <span
                className={`absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary ${dotClass}`}
                aria-hidden
              />
            )}
          </button>
          {isLoggedIn && (
            <span className="select-none text-[10px] leading-none text-muted-foreground/60">
              {autoSyncStatus === 'syncing'
                ? '同步中…'
                : (formatSyncTimeCompact(lastCloudSyncAt) ?? '未同步')}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
