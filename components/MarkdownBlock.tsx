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
        li: ({ children: itemChildren }) => <li>・{itemChildren}</li>
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
