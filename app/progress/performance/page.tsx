import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { problems, topics } from '@/lib/data';

export default function PerformanceProgressPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">實戰分析</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">競賽與提交</h1>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              只根據提交、AC 狀態與競賽場次分析弱區與題型表現。
            </p>
          </div>
          <Link
            href="/progress"
            className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            返回總覽
          </Link>
        </div>
        <PerformanceDashboard problems={problems} topics={topics} />
      </div>
    </PageTransition>
  );
}
