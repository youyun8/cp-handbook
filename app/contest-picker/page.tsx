import { Dices } from 'lucide-react';
import { ContestRandomPicker } from '@/components/ContestRandomPicker';
import { PageTransition } from '@/components/PageTransition';
import { contests } from '@/lib/data';

export default function ContestPickerPage() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/12 via-card/70 to-accent/50 p-6 shadow-card sm:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-2xl">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Dices className="h-3.5 w-3.5" aria-hidden />
              比賽題目隨機抽選
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">競賽題目隨機抽選</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              從歷屆週賽與雙週賽中隨機抽取題目。預設從 Q3、Q4 題目池中抽取，可依難度範圍與比賽類型篩選，
              模擬真實競賽訓練。資料來自 lc-rating，共收錄{' '}
              <span className="font-semibold text-foreground">{contests.length}</span> 場比賽。
            </p>
          </div>
        </section>

        <ContestRandomPicker contests={contests} />
      </div>
    </PageTransition>
  );
}
