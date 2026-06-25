'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useProgressStore } from '@/store/useProgressStore';
import { isStaticExport } from '@/lib/runtime';

type SyncState = { kind: 'idle' | 'ok' | 'error'; message?: string };

export function CloudSync() {
  // Static export (e.g. GitHub Pages) has no OAuth backend and no SessionProvider,
  // so we must not call useSession here. Render a localStorage notice instead.
  if (isStaticExport) {
    return (
      <section className="rounded-3xl border border-border bg-card/75 p-5">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>💾</span>
          <h2 className="text-lg font-semibold">進度儲存</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          目前為靜態部署版本，進度僅儲存在此瀏覽器的 localStorage。
          若要使用 GitHub 登入並同步至雲端，請改用支援伺服器的部署（如 Vercel）。
        </p>
      </section>
    );
  }

  return <CloudSyncAuthed />;
}

function CloudSyncAuthed() {
  const { data: session, status } = useSession();
  const syncToCloud = useProgressStore((s) => s.syncToCloud);
  const loadFromCloud = useProgressStore((s) => s.loadFromCloud);
  const [busy, setBusy] = useState<null | 'save' | 'load'>(null);
  const [result, setResult] = useState<SyncState>({ kind: 'idle' });

  async function handleSave() {
    setBusy('save');
    setResult({ kind: 'idle' });
    const res = await syncToCloud();
    setBusy(null);
    setResult(
      res.ok
        ? { kind: 'ok', message: '已同步至雲端 Gist。' }
        : { kind: 'error', message: res.error ?? '同步失敗。' }
    );
  }

  async function handleLoad() {
    setBusy('load');
    setResult({ kind: 'idle' });
    const res = await loadFromCloud();
    setBusy(null);
    setResult(
      res.ok
        ? { kind: 'ok', message: '已從雲端載入進度。' }
        : { kind: 'error', message: res.error ?? '載入失敗。' }
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-card/75 p-5">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>☁️</span>
        <h2 className="text-lg font-semibold">雲端同步</h2>
      </div>

      {status === 'loading' ? (
        <p className="mt-2 text-sm text-muted-foreground">讀取登入狀態中…</p>
      ) : session?.user ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">
            已以{' '}
            <span className="font-medium text-foreground">
              {session.user.name ?? session.user.email ?? 'GitHub 使用者'}
            </span>{' '}
            登入。進度會儲存在你帳號下的私有 Gist。
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy !== null}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {busy === 'save' ? '同步中…' : '⬆ 同步至雲端'}
            </button>
            <button
              type="button"
              onClick={handleLoad}
              disabled={busy !== null}
              className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-accent disabled:opacity-50"
            >
              {busy === 'load' ? '載入中…' : '⬇ 從雲端載入'}
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-2xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-accent"
            >
              登出
            </button>
          </div>
          {result.kind !== 'idle' && (
            <p
              className={
                result.kind === 'ok'
                  ? 'text-sm font-medium text-emerald-500'
                  : 'text-sm font-medium text-red-500'
              }
            >
              {result.message}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">
            使用 GitHub 帳號登入，即可把練習進度同步到你的私有 Gist，換裝置也不遺失。
            未登入時進度仍會儲存在本機 localStorage。
          </p>
          <button
            type="button"
            onClick={() => signIn('github')}
            className="flex items-center gap-3 rounded-2xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            使用 GitHub 登入以同步
          </button>
        </div>
      )}
    </section>
  );
}
