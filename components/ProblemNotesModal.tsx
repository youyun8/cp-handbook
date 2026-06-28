'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CODE_LANGUAGES, CodeEditor, DEFAULT_CODE_LANGUAGE } from '@/components/CodeEditor';
import { MarkdownBlock } from '@/components/MarkdownBlock';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function ProblemNotesModal({
  problemId,
  title,
  open,
  onClose
}: {
  problemId: string;
  title?: string;
  open: boolean;
  onClose: () => void;
}) {
  const mounted = useMounted();

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="記錄解答"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Blurred, dimmed backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={onClose} aria-hidden />
      {/* The dialog body remounts each time it opens, so its form state is
          initialized from the latest saved note without a re-hydration effect. */}
      <NotesDialogBody problemId={problemId} title={title} onClose={onClose} />
    </div>,
    document.body
  );
}

function NotesDialogBody({
  problemId,
  title,
  onClose
}: {
  problemId: string;
  title?: string;
  onClose: () => void;
}) {
  const note = useProgressStore((state) => state.problemNotes[problemId]);
  const saveProblemNote = useProgressStore((state) => state.saveProblemNote);

  const [solution, setSolution] = useState(note?.solution ?? '');
  const [thought, setThought] = useState(note?.thought ?? '');
  const [language, setLanguage] = useState(note?.language ?? DEFAULT_CODE_LANGUAGE);
  const [thoughtView, setThoughtView] = useState<'edit' | 'preview'>('preview');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveProblemNote(problemId, { solution, thought, language });
    setSaved(true);
  }

  const updatedAt = note?.updatedAt
    ? new Intl.DateTimeFormat('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(note.updatedAt))
    : null;

  return (
    <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card/95 shadow-2xl">
      <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">記錄解答與思路</p>
          {title ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{title}</p> : null}
          {updatedAt ? <p className="mt-0.5 text-xs text-muted-foreground">上次更新：{updatedAt}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="rounded-full border border-border p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">解答（程式碼）</span>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              語言
              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value);
                  setSaved(false);
                }}
                className="rounded-lg border border-border bg-background/70 px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
              >
                {CODE_LANGUAGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <CodeEditor
            value={solution}
            language={language}
            onValueChange={(value) => {
              setSolution(value);
              setSaved(false);
            }}
            placeholder={'// 在此貼上 / 撰寫你的解答程式碼\n// 會依所選語言自動上色'}
            minHeight="14rem"
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">思路（支援 Markdown）</span>
            <div className="flex items-center gap-1 rounded-xl border border-border p-0.5">
              {(
                [
                  { id: 'edit', label: '編輯' },
                  { id: 'preview', label: '預覽' }
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setThoughtView(option.id)}
                  className={
                    thoughtView === option.id
                      ? 'rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground'
                      : 'rounded-lg px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground'
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {thoughtView === 'edit' ? (
            <textarea
              value={thought}
              onChange={(event) => {
                setThought(event.target.value);
                setSaved(false);
              }}
              rows={4}
              className="min-h-28 w-full resize-y rounded-2xl border border-border bg-card/70 px-3 py-2 font-mono text-sm leading-6 outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder={
                '記錄如何建模、判斷單調性、邊界處理與下次複習提醒。\n\n支援 **粗體**、清單、行內 `code` 與 ``` 程式碼區塊。'
              }
            />
          ) : thought.trim() ? (
            <div className="min-h-28 rounded-2xl border border-border bg-card/70 px-4 py-3">
              <MarkdownBlock>{thought}</MarkdownBlock>
            </div>
          ) : (
            <div className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-4 py-3 text-sm text-muted-foreground">
              尚無內容可預覽
            </div>
          )}
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
        <p className="text-xs leading-5 text-muted-foreground">
          內容會先儲存在此瀏覽器；使用雲端同步時會一併上傳。
        </p>
        <div className="flex items-center gap-2">
          {saved ? (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">已儲存</span>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            關閉
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            儲存記錄
          </Button>
        </div>
      </footer>
    </div>
  );
}
