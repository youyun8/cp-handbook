import Link from 'next/link';
import { FeaturedTopics } from '@/components/FeaturedTopics';
import { PageTransition } from '@/components/PageTransition';
import { ProgressSummary } from '@/components/ProgressSummary';
import { problems, topics } from '@/lib/data';

export default function HomePage() {
  const featuredTopics = [topics[0], topics[1], topics[4]];

  return (
    <PageTransition>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-border bg-card/75 p-6 shadow-glow sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">靈茶山艾府風格的策略訓練路線</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">把模板、建模與思維轉換練成一條路線</h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              每個主題依照核心想法、參考連結、註解模板、補充套路與分級題單五層展開，讓練習不只刷題，而是累積可遷移的解題策略。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/handbook"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground shadow-glow transition hover:bg-primary/90"
              >
                開始閱讀手冊
              </Link>
              <Link
                href="/practice"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-accent px-6 text-base font-medium text-accent-foreground transition hover:bg-accent/80"
              >
                進入練習場
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-medium text-primary">推薦起點</p>
            <h2 className="mt-2 text-2xl font-semibold">精選主題</h2>
          </div>
          <FeaturedTopics topics={featuredTopics} />
        </section>

        <ProgressSummary problems={problems} topics={topics} />
      </div>
    </PageTransition>
  );
}
