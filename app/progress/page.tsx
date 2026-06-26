import { PageTransition } from '@/components/PageTransition';
import { ProgressOverview } from '@/components/ProgressOverview';
import { CloudSync } from '@/components/CloudSync';
import { problems, subtopics, topics } from '@/lib/data';

export default function ProgressPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">學習回饋</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">進度總覽</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            手冊學習與實戰提交使用不同資料來源；總覽只保留入口與核心數字，詳細分析分頁維護。
          </p>
        </div>
        <CloudSync />
        <ProgressOverview problems={problems} topics={topics} subtopics={subtopics} />
      </div>
    </PageTransition>
  );
}
