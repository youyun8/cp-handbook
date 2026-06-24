import { Accordion } from '@/components/Accordion';
import { CodeBlock } from '@/components/CodeBlock';
import { LayerCallout } from '@/components/LayerCallout';
import { MarkdownBlock } from '@/components/MarkdownBlock';
import { ProblemTabs } from '@/components/ProblemTabs';
import { TopicTree } from '@/components/TopicTree';
import type { Problem, Topic } from '@/lib/types';

export function TopicHandbook({
  topic,
  topics,
  problems
}: {
  topic: Topic;
  topics: Topic[];
  problems: Problem[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <TopicTree topics={topics} activeSlug={topic.slug} />
      </div>
      <article className="space-y-6">
        <div className="rounded-3xl border border-border bg-card/80 p-6">
          <p className="text-sm font-medium text-primary">演算法主題</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{topic.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{topic.description}</p>
        </div>

        <LayerCallout eyebrow="第一層" title="核心想法" variant="core">
          <MarkdownBlock>{topic.core_idea}</MarkdownBlock>
          <p className="mt-3 rounded-2xl bg-background/55 p-3 text-sm font-medium text-blue-200">複雜度：{topic.complexity}</p>
        </LayerCallout>

        <LayerCallout eyebrow="第二層" title="參考連結" variant="references">
          <ul className="grid gap-3 md:grid-cols-2">
            {topic.reference_links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-border bg-background/45 p-4 text-sm transition hover:border-primary hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </LayerCallout>

        <LayerCallout eyebrow="第三層" title="註解模板" variant="template">
          <CodeBlock code={topic.template_code} />
        </LayerCallout>

        <LayerCallout eyebrow="第四層" title="補充套路" variant="supplemental">
          <Accordion items={topic.supplemental_patterns} />
        </LayerCallout>

        <LayerCallout eyebrow="第五層" title="分級題單" variant="problems">
          <ProblemTabs problems={problems} />
        </LayerCallout>
      </article>
    </div>
  );
}
