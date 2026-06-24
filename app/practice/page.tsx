import { PageTransition } from '@/components/PageTransition';
import { PracticeArena } from '@/components/PracticeArena';
import { problems, topics } from '@/lib/data';

export default function PracticePage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">主動訓練</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">練習場</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            依照分數帶、標籤、題型與完成狀態挑題，手動記錄通過、錯誤、超時或略過；目標分段練穩後，定期挑戰高一階題目建立餘裕。
          </p>
        </div>
        <PracticeArena problems={problems} topics={topics} />
      </div>
    </PageTransition>
  );
}
