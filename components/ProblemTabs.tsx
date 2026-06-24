'use client';

import { useState } from 'react';
import { ProblemCard } from '@/components/ProblemCard';
import type { Problem, ProblemType } from '@/lib/types';
import { cn } from '@/lib/utils';

const tabs: { id: ProblemType; label: string; description: string }[] = [
  { id: 'template', label: '模板題', description: '直接套模板，練習邊界與寫法。' },
  { id: 'classic', label: '經典題', description: '需要先建模，再選用合適變形。' },
  { id: 'insight_transfer', label: '思維轉換題', description: '需要觀察規律或把問題轉成已知模型。' }
];

export function ProblemTabs({ problems }: { problems: Problem[] }) {
  const [active, setActive] = useState<ProblemType>('template');
  const visibleProblems = problems.filter((problem) => problem.problem_type === active);
  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-medium transition',
              active === tab.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background/50 text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{activeTab.description}</p>
      {visibleProblems.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleProblems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">暫無題目。</div>
      )}
    </div>
  );
}
