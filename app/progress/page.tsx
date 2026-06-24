import { PageTransition } from '@/components/PageTransition';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { problems, topics } from '@/lib/data';

export default function ProgressPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">學習回饋</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">進度儀表板</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            追蹤複習題數、主題覆蓋率、模擬賽場次、弱區與題型比例，讓下一輪練習更有方向。
          </p>
        </div>
        <ProgressDashboard problems={problems} topics={topics} />
      </div>
    </PageTransition>
  );
}
