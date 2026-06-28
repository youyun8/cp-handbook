'use client';

import { useEffect, useRef, useState } from 'react';
import { Cloud, X } from 'lucide-react';
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
    state.completedPracticeProblemIds,
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
    hour12: false,
  }).format(date);
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
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean | ((v: boolean) => boolean)) => void;
}) {
  const { data: session, status } = useSession();
  const lastCloudSyncAt = useProgressStore((s) => s.lastCloudSyncAt);

  const [autoSyncStatus, setAutoSyncStatus] = useState<AutoSyncStatus>('idle');
  const [manualResult, setManualResult] = useState<ManualResult>({ kind: 'idle' });
  const [busyManual, setBusyManual] = useState<null | 'save' | 'load'>(null);

  const lastSyncedHashRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLoggedInRef = useRef<boolean | undefined>(undefined);

  const isLoggedIn = !!session?.user;
  const lastCloudSyncText = formatSyncTime(lastCloudSyncAt);

  // sessionKey is stable per logged-in user identity across re-renders
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

    // Auto-load from cloud whenever a new login is detected (including page refresh)
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

    // Subscribe to data changes; debounce auto-sync to cloud
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

  async function runManualSync(action: 'save' | 'load') {
    setBusyManual(action);
    setManualResult({ kind: 'idle' });
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    isSyncingRef.current = true;
    setAutoSyncStatus('syncing');

    try {
      const fn =
        action === 'save'
          ? useProgressStore.getState().syncToCloud
          : useProgressStore.getState().loadFromCloud;
      const res = await fn();
      lastSyncedHashRef.current = computeDataHash(useProgressStore.getState());
      setAutoSyncStatus(res.ok ? 'idle' : 'error');
      setManualResult(
        res.ok
          ? { kind: 'ok', message: action === 'save' ? '已同步至雲端。' : '已從雲端載入。' }
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

  const dotClass =
    !isLoggedIn
      ? null
      : autoSyncStatus === 'syncing'
        ? 'bg-sky-400 animate-pulse'
        : autoSyncStatus === 'pending'
          ? 'bg-amber-400 animate-pulse'
          : autoSyncStatus === 'error'
            ? 'bg-red-500'
            : 'bg-emerald-500';

  const syncStatusLine =
    autoSyncStatus === 'syncing'
      ? '同步中…'
      : autoSyncStatus === 'pending'
        ? '有待同步的變更'
        : autoSyncStatus === 'error'
          ? '上次同步失敗'
          : lastCloudSyncText
            ? `已同步：${lastCloudSyncText}`
            : '尚未同步至雲端';

  const isBusy = busyManual !== null || autoSyncStatus === 'syncing';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(calc(100vw-2.5rem),24rem)] rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">雲端同步</p>
              {status === 'loading' ? (
                <p className="mt-1 text-xs text-muted-foreground">讀取登入狀態中…</p>
              ) : isLoggedIn ? (
                <>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {session.user?.name ?? session.user?.email ?? 'GitHub 使用者'}
                  </p>
                  <p
                    className={`mt-0.5 text-xs ${
                      autoSyncStatus === 'error'
                        ? 'text-red-500'
                        : autoSyncStatus === 'pending'
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {syncStatusLine}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  登入後可自動同步進度、解答與練習狀態。
                </p>
              )}
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

          {isLoggedIn ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => runManualSync('load')}
                disabled={isBusy}
                className="rounded-xl border border-border px-3 py-2 text-sm font-semibold transition hover:bg-accent disabled:opacity-50"
              >
                {busyManual === 'load' ? '載入中…' : '從雲端載入'}
              </button>
              <button
                type="button"
                onClick={() => runManualSync('save')}
                disabled={isBusy}
                className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {busyManual === 'save' ? '同步中…' : '立即同步'}
              </button>
            </div>
          ) : status !== 'loading' ? (
            <button
              type="button"
              onClick={() => signIn('github')}
              className="mt-4 w-full rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              使用 GitHub 登入
            </button>
          ) : null}

          {manualResult.kind !== 'idle' && (
            <p
              className={`mt-3 text-xs font-medium ${
                manualResult.kind === 'ok'
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-red-500'
              }`}
            >
              {manualResult.message}
            </p>
          )}
        </div>
      )}

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
    </div>
  );
}
