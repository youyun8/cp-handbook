'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

export function ProblemNotesPanel({
  problemId,
  className
}: {
  problemId: string;
  className?: string;
}) {
  const note = useProgressStore((state) => state.problemNotes[problemId]);
  const saveProblemNote = useProgressStore((state) => state.saveProblemNote);
  const [solution, setSolution] = useState(note?.solution ?? '');
  const [thought, setThought] = useState(note?.thought ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveProblemNote(problemId, { solution, thought });
    setSaved(true);
  }

  const updatedAt =
    note?.updatedAt
      ? new Intl.DateTimeFormat('zh-TW', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(note.updatedAt))
      : null;

  return (
    <div className={cn('space-y-3 rounded-2xl border border-border bg-background/55 p-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">解答與思路</p>
          {updatedAt ? <p className="mt-1 text-xs text-muted-foreground">上次更新：{updatedAt}</p> : null}
        </div>
        {saved ? <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">已儲存</span> : null}
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-muted-foreground">解答</span>
        <textarea
          value={solution}
          onChange={(event) => {
            setSolution(event.target.value);
            setSaved(false);
          }}
          rows={5}
          className="min-h-32 w-full resize-y rounded-2xl border border-border bg-card/70 px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
          placeholder="記錄程式碼重點、關鍵轉移式或錯誤修正。"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-muted-foreground">思路</span>
        <textarea
          value={thought}
          onChange={(event) => {
            setThought(event.target.value);
            setSaved(false);
          }}
          rows={4}
          className="min-h-28 w-full resize-y rounded-2xl border border-border bg-card/70 px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
          placeholder="記錄如何建模、判斷單調性、邊界處理與下次複習提醒。"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs leading-5 text-muted-foreground">內容會先儲存在此瀏覽器；使用雲端同步時會一併上傳。</p>
        <Button type="button" size="sm" onClick={handleSave}>
          儲存記錄
        </Button>
      </div>
    </div>
  );
}
