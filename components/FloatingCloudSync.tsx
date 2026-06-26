'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { isStaticExport } from '@/lib/runtime';
import { useProgressStore } from '@/store/useProgressStore';

type SyncState = { kind: 'idle' | 'ok' | 'error'; message?: string };

export function FloatingCloudSync() {
  const [open, setOpen] = useState(false);

  if (isStaticExport) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {open ? (
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
                className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
              >
                x
              </button>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="開啟進度同步"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-primary text-xl text-primary-foreground shadow-2xl transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ☁
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
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
}) {
  const { data: session, status } = useSession();
  const syncToCloud = useProgressStore((state) => state.syncToCloud);
  const loadFromCloud = useProgressStore((state) => state.loadFromCloud);
  const [busy, setBusy] = useState<null | 'save' | 'load'>(null);
  const [result, setResult] = useState<SyncState>({ kind: 'idle' });

  async function runSync(action: 'save' | 'load') {
    setBusy(action);
    setResult({ kind: 'idle' });
    const res = action === 'save' ? await syncToCloud() : await loadFromCloud();
    setBusy(null);
    setResult(
      res.ok
        ? {
            kind: 'ok',
            message: action === 'save' ? '已同步至雲端。' : '已從雲端載入。'
          }
        : { kind: 'error', message: res.error ?? '操作失敗。' }
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[min(calc(100vw-2.5rem),24rem)] rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">雲端同步</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {status === 'loading'
                  ? '讀取登入狀態中...'
                  : session?.user
                    ? `目前登入：${session.user.name ?? session.user.email ?? 'GitHub 使用者'}`
                    : '登入後可同步進度、解答與手冊練習完成狀態。'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="關閉同步面板"
              className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
            >
              x
            </button>
          </div>

          {session?.user ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => runSync('load')}
                disabled={busy !== null}
                className="rounded-xl border border-border px-3 py-2 text-sm font-semibold transition hover:bg-accent disabled:opacity-50"
              >
                {busy === 'load' ? '載入中...' : '從雲端載入'}
              </button>
              <button
                type="button"
                onClick={() => runSync('save')}
                disabled={busy !== null}
                className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {busy === 'save' ? '同步中...' : '同步至雲端'}
              </button>
            </div>
          ) : status === 'loading' ? null : (
            <button
              type="button"
              onClick={() => signIn('github')}
              className="mt-4 w-full rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              使用 GitHub 登入
            </button>
          )}

          {result.kind !== 'idle' ? (
            <p
              className={
                result.kind === 'ok'
                  ? 'mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-300'
                  : 'mt-3 text-xs font-medium text-red-500'
              }
            >
              {result.message}
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="開啟雲端同步"
        className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-primary text-xl text-primary-foreground shadow-2xl transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        ☁
      </button>
    </div>
  );
}
