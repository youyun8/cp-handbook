import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export function MarkdownBlock({ children, className }: { children: string; className?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn('space-y-3 text-sm leading-7', className)}
      components={{
        p: ({ children: paragraphChildren }) => <p>{paragraphChildren}</p>,
        ul: ({ children: listChildren }) => <ul className="space-y-2">{listChildren}</ul>,
        li: ({ children: itemChildren }) => <li>・{itemChildren}</li>,
        code: ({ children: codeChildren, className: codeClassName }) => {
          if (codeClassName) {
            return <code className={codeClassName}>{codeChildren}</code>;
          }

          return (
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              {codeChildren}
            </code>
          );
        },
        pre: ({ children: preChildren }) => (
          <pre className="overflow-x-auto rounded-2xl border border-border bg-slate-100 p-4 text-xs leading-6 text-slate-800 dark:bg-[#0d1117] dark:text-slate-200">
            {preChildren}
          </pre>
        )
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
