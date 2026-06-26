import Link from 'next/link';
import { FeaturedTopics } from '@/components/FeaturedTopics';
import { PageTransition } from '@/components/PageTransition';
import { ProgressSummary } from '@/components/ProgressSummary';
import { problems, topics } from '@/lib/data';

const guideSteps = [
  {
    icon: '📖',
    title: '閱讀手冊',
    description: '從核心想法與註解模板入手，理解每個主題的解題框架。',
    href: '/handbook',
    cta: '前往手冊'
  },
  {
    icon: '🏋️',
    title: '練習場刷題',
    description: '依自評分數分層挑題，把目標分段練穩後再往上挑戰。',
    href: '/practice',
    cta: '前往練習場'
  },
  {
    icon: '📊',
    title: '追蹤進度',
    description: '分開追蹤手冊完成度與實戰提交分析，讓複習更有方向。',
    href: '/progress',
    cta: '查看進度'
  }
];

export default function HomePage() {
  const featuredTopics = [topics[0], topics[1], topics[4]];

  return (
    <PageTransition>
      <div className="space-y-12">
        <section className="overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary/15 via-card/80 to-accent/40 p-6 shadow-glow sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">靈茶山艾府風格的策略訓練路線</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">把模板、建模與思維轉換練成一條路線</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              每個主題依照核心想法、參考連結、註解模板、補充套路與分級題單五層展開，讓練習不只刷題，而是累積可遷移的解題策略。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/handbook"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                開始閱讀手冊
              </Link>
              <Link
                href="/practice"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-accent px-6 text-base font-medium text-accent-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                進入練習場
              </Link>
            </div>
          </div>
        </section>

        <hr className="border-border/60" />

        <section className="space-y-4">
          <div>
            <p className="text-sm font-medium text-primary">三步上手</p>
            <h2 className="mt-2 text-2xl font-semibold">如何使用本網站</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {guideSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative flex h-full flex-col rounded-2xl border border-border bg-card/70 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-2xl" aria-hidden>
                    {step.icon}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">步驟 {index + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                <Link
                  href={step.href}
                  className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary transition hover:gap-2"
                >
                  {step.cta} <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
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
