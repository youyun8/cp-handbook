'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMounted } from '@/lib/useMounted';
import {
  type ContentWidth,
  type LeetCodeSite,
  type TextSize,
  useSettingsStore
} from '@/store/useSettingsStore';

const themeOptions = [
  { value: 'system', label: '跟隨系統', description: '使用作業系統目前的外觀設定。' },
  { value: 'light', label: '淺色', description: '固定使用淺色介面。' },
  { value: 'dark', label: '深色', description: '固定使用深色介面。' }
] as const;

const leetCodeOptions: { value: LeetCodeSite; label: string; description: string }[] = [
  { value: 'cn', label: 'CN', description: 'LeetCode 中國站：leetcode.cn' },
  { value: 'en', label: 'EN', description: 'LeetCode 國際站：leetcode.com' }
];

const contentWidthOptions: { value: ContentWidth; label: string; description: string }[] = [
  { value: 'standard', label: '標準', description: '維持較集中的閱讀寬度，適合手冊與策略頁。' },
  { value: 'wide', label: '寬', description: '放寬內容寬度至約 1760px，適合表格、題卡與大螢幕。' },
  { value: 'full', label: '全幅', description: '內容填滿視窗寬度，消除兩側空白，適合超寬螢幕。' }
];

const textSizeOptions: { value: TextSize; label: string; description: string }[] = [
  { value: 'small', label: '小', description: '提高資訊密度，適合大螢幕快速掃讀。' },
  { value: 'standard', label: '標準', description: '使用預設文字大小。' },
  { value: 'large', label: '大', description: '放大文字，適合長時間閱讀。' }
];

export function SettingsPanel() {
  const mounted = useMounted();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const leetCodeSite = useSettingsStore((state) => state.leetCodeSite);
  const contentWidth = useSettingsStore((state) => state.contentWidth);
  const textSize = useSettingsStore((state) => state.textSize);
  const setLeetCodeSite = useSettingsStore((state) => state.setLeetCodeSite);
  const setContentWidth = useSettingsStore((state) => state.setContentWidth);
  const setTextSize = useSettingsStore((state) => state.setTextSize);

  const currentTheme = mounted ? (theme ?? 'system') : 'system';

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
          <p className="text-sm font-medium text-primary">外觀</p>
          <h2 className="mt-2 text-xl font-semibold">內容寬度</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            選擇主要內容區的最大寬度；寬版會讓大螢幕顯示更多題卡與內容。
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {contentWidthOptions.map((option) => {
            const selected = contentWidth === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={selected ? 'default' : 'outline'}
                className="h-auto flex-col items-start gap-2 p-4 text-left"
                onClick={() => setContentWidth(option.value)}
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

      <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-primary">外觀</p>
          <h2 className="mt-2 text-xl font-semibold">文字大小</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            調整整個網站的文字比例，包含導覽、手冊內容與題目卡片。
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {textSizeOptions.map((option) => {
            const selected = textSize === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={selected ? 'default' : 'outline'}
                className="h-auto flex-col items-start gap-2 p-4 text-left"
                onClick={() => setTextSize(option.value)}
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
