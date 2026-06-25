import { Accordion } from '@/components/Accordion';
import { CodeBlock } from '@/components/CodeBlock';
import { HandbookSidebar } from '@/components/HandbookSidebar';
import { LayerCallout } from '@/components/LayerCallout';
import { MarkdownBlock } from '@/components/MarkdownBlock';
import { ProblemTabs } from '@/components/ProblemTabs';
import type { Problem, Subtopic, Topic } from '@/lib/types';

export function TopicHandbook({
  topic,
  topics,
  subtopics,
  problems
}: {
  topic: Topic;
  topics: Topic[];
  subtopics: Subtopic[];
  problems: Problem[];
}) {
  return (
    <div className="flex min-h-screen gap-6">
      <HandbookSidebar
        topics={topics}
        subtopics={subtopics}
        activeTopicSlug={topic.slug}
        anchors={[
          { id: 'core', label: '核心想法' },
          { id: 'deepdive', label: '原理剖析' },
          { id: 'references', label: '參考連結' },
          { id: 'template', label: '模板程式碼' },
          { id: 'patterns', label: '補充套路' },
          { id: 'pitfalls', label: '常見陷阱' },
          { id: 'problems', label: '分級題單' }
        ]}
      />
      <article className="min-w-0 flex-1 space-y-6">
        <div className="rounded-3xl border border-border bg-card/80 p-6">
          <p className="text-sm font-medium text-primary">演算法主題</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{topic.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{topic.description}</p>
        </div>

        {topic.motivation ? (
          <LayerCallout eyebrow="問題動機" title="這個問題為什麼難？" variant="motivation">
            <MarkdownBlock>{topic.motivation}</MarkdownBlock>
          </LayerCallout>
        ) : null}

        <div id="core">
          <LayerCallout eyebrow="第一層" title="核心想法" variant="core">
            <MarkdownBlock>{topic.core_idea}</MarkdownBlock>
            <p className="mt-3 rounded-2xl bg-background/55 p-3 text-sm font-medium text-blue-800 dark:text-blue-200">
              複雜度：{topic.complexity}
            </p>
          </LayerCallout>
        </div>

        {topic.deep_dive && topic.deep_dive.length > 0 ? (
          <div id="deepdive">
            <LayerCallout eyebrow="過程剖析" title="原理與進階拆解" variant="deepdive">
              <div className="space-y-5">
                {topic.deep_dive.map((section) => (
                  <div key={section.title} className="rounded-2xl border border-border bg-background/45 p-4">
                    <h3 className="text-lg font-semibold tracking-tight text-cyan-900 dark:text-cyan-100">{section.title}</h3>
                    <MarkdownBlock className="mt-2 text-muted-foreground">{section.body}</MarkdownBlock>
                  </div>
                ))}
              </div>
            </LayerCallout>
          </div>
        ) : null}

        <div id="references">
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
        </div>

        <div id="template">
          <LayerCallout eyebrow="第三層" title="註解模板" variant="template">
            <CodeBlock code={topic.template_code} />
          </LayerCallout>
        </div>

        <div id="patterns">
          <LayerCallout eyebrow="第四層" title="補充套路" variant="supplemental">
            <Accordion items={topic.supplemental_patterns} />
          </LayerCallout>
        </div>

        {topic.pitfalls && topic.pitfalls.length > 0 ? (
          <div id="pitfalls">
            <LayerCallout eyebrow="常見陷阱" title="容易踩雷的地方" variant="pitfalls">
              <ul className="space-y-3">
                {topic.pitfalls.map((pitfall) => (
                  <li
                    key={pitfall}
                    className="rounded-2xl border border-rose-400/30 bg-background/45 p-3 text-sm leading-7 text-rose-900 dark:text-rose-100"
                  >
                    <MarkdownBlock className="text-rose-900 dark:text-rose-100">{pitfall}</MarkdownBlock>
                  </li>
                ))}
              </ul>
            </LayerCallout>
          </div>
        ) : null}

        <div id="problems">
          <LayerCallout eyebrow="第五層" title="分級題單" variant="problems">
            <ProblemTabs problems={problems} />
          </LayerCallout>
        </div>
      </article>
    </div>
  );
}
