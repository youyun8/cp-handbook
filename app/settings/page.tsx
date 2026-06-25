import { PageTransition } from '@/components/PageTransition';
import { SettingsPanel } from '@/components/SettingsPanel';

export default function SettingsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">個人偏好</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">設定</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            調整網站外觀與刷題連結偏好。這些設定會保存在目前瀏覽器。
          </p>
        </div>
        <SettingsPanel />
      </div>
    </PageTransition>
  );
}
