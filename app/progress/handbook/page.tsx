import Link from 'next/link';
import { HandbookProgressDashboard } from '@/components/HandbookProgressDashboard';
import { PageTransition } from '@/components/PageTransition';
import { subtopics, topics } from '@/lib/data';

export default function HandbookProgressPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">手冊學習</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">手冊進度</h1>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              追蹤手冊練習完成度、筆記與主題覆蓋率，不混入競賽提交結果。
            </p>
          </div>
          <Link
            href="/progress"
            className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            返回總覽
          </Link>
        </div>
        <HandbookProgressDashboard topics={topics} subtopics={subtopics} />
      </div>
    </PageTransition>
  );
}
