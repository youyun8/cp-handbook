import { Accordion } from '@/components/Accordion';
import { CodeBlock } from '@/components/CodeBlock';
import { LayerCallout } from '@/components/LayerCallout';
import { MarkdownBlock } from '@/components/MarkdownBlock';
import type { Subtopic, Topic } from '@/lib/types';

export function SubtopicHandbook({
  subtopic,
  parentTopic
}: {
  subtopic: Subtopic;
  parentTopic: Topic;
}) {
  return (
    <article className="space-y-6">
      <div className="rounded-3xl border border-border bg-card/80 p-6">
        <p className="text-sm font-medium text-muted-foreground">
          <span className="text-primary">{parentTopic.title}</span> › 子主題
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{subtopic.title}</h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{subtopic.description}</p>
      </div>

      <div id="core">
        <LayerCallout eyebrow="核心想法" title="原理與直覺" variant="core">
          <MarkdownBlock>{subtopic.core_idea}</MarkdownBlock>
          <p className="mt-3 rounded-2xl bg-background/55 p-3 text-sm font-medium text-blue-800 dark:text-blue-200">
            複雜度：{subtopic.complexity}
          </p>
        </LayerCallout>
      </div>

      {subtopic.deep_dive && subtopic.deep_dive.length > 0 && (
        <LayerCallout eyebrow="過程剖析" title="原理與進階拆解" variant="deepdive">
          <div className="space-y-5">
            {subtopic.deep_dive.map((section) => (
              <div
                key={section.title}
                id={section.title.replace(/\s+/g, '-').toLowerCase()}
                className="rounded-2xl border border-border bg-background/45 p-4"
              >
                <h3 className="text-lg font-semibold tracking-tight text-cyan-900 dark:text-cyan-100">
                  {section.title}
                </h3>
                <MarkdownBlock className="mt-2 text-muted-foreground">{section.body}</MarkdownBlock>
              </div>
            ))}
          </div>
        </LayerCallout>
      )}

      <LayerCallout eyebrow="參考連結" title="外部資源" variant="references">
        <ul className="grid gap-3 md:grid-cols-2">
          {subtopic.reference_links.map((link) => (
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

      <div id="template">
        <LayerCallout eyebrow="模板" title="C++ 模板程式碼" variant="template">
          <CodeBlock code={subtopic.template_code} />
        </LayerCallout>
      </div>

      <div id="patterns">
        <LayerCallout eyebrow="套路" title="補充套路" variant="supplemental">
          <Accordion items={subtopic.supplemental_patterns} />
        </LayerCallout>
      </div>

      {subtopic.pitfalls && subtopic.pitfalls.length > 0 && (
        <LayerCallout eyebrow="陷阱" title="容易踩雷的地方" variant="pitfalls">
          <ul className="space-y-3">
            {subtopic.pitfalls.map((pitfall) => (
              <li
                key={pitfall}
                className="rounded-2xl border border-rose-400/30 bg-background/45 p-3 text-sm leading-7 text-rose-900 dark:text-rose-100"
              >
                <MarkdownBlock className="text-rose-900 dark:text-rose-100">{pitfall}</MarkdownBlock>
              </li>
            ))}
          </ul>
        </LayerCallout>
      )}
    </article>
  );
}
