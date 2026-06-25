'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMounted } from '@/lib/useMounted';
import { type LeetCodeSite, useSettingsStore } from '@/store/useSettingsStore';

const themeOptions = [
  { value: 'system', label: '跟隨系統', description: '使用作業系統目前的外觀設定。' },
  { value: 'light', label: '淺色', description: '固定使用淺色介面。' },
  { value: 'dark', label: '深色', description: '固定使用深色介面。' }
] as const;

const leetCodeOptions: { value: LeetCodeSite; label: string; description: string }[] = [
  { value: 'cn', label: 'CN', description: 'LeetCode 中國站：leetcode.cn' },
  { value: 'en', label: 'EN', description: 'LeetCode 國際站：leetcode.com' }
];

export function SettingsPanel() {
  const mounted = useMounted();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const leetCodeSite = useSettingsStore((state) => state.leetCodeSite);
  const setLeetCodeSite = useSettingsStore((state) => state.setLeetCodeSite);

  const currentTheme = mounted ? theme ?? 'system' : 'system';

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-primary">外觀</p>
          <h2 className="mt-2 text-xl font-semibold">Theme</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            選擇網站的色彩模式。系統模式會依照瀏覽器或作業系統偏好自動切換。
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {themeOptions.map((option) => {
            const selected = currentTheme === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={selected ? 'default' : 'outline'}
                className="h-auto flex-col items-start gap-2 p-4 text-left"
                onClick={() => setTheme(option.value)}
                aria-pressed={selected}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span
                  className={cn(
                    'text-xs leading-5',
                    selected ? 'text-primary-foreground/85' : 'text-muted-foreground'
                  )}
                >
                  {option.description}
                </span>
              </Button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          目前實際顯示：{mounted ? (resolvedTheme === 'dark' ? '深色' : '淺色') : '讀取中'}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-primary">刷題連結</p>
          <h2 className="mt-2 text-xl font-semibold">力扣站點</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            控制 LeetCode 題目外部連結打開中國站或國際站；其他題庫來源不受影響。
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {leetCodeOptions.map((option) => {
            const selected = leetCodeSite === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={selected ? 'default' : 'outline'}
                className="h-auto flex-col items-start gap-2 p-4 text-left"
                onClick={() => setLeetCodeSite(option.value)}
                aria-pressed={selected}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span
                  className={cn(
                    'text-xs leading-5',
                    selected ? 'text-primary-foreground/85' : 'text-muted-foreground'
                  )}
                >
                  {option.description}
                </span>
              </Button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
