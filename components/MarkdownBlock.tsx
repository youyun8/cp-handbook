import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

const cppKeywords = new Set([
  'auto',
  'bool',
  'break',
  'case',
  'char',
  'class',
  'const',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'false',
  'float',
  'for',
  'if',
  'int',
  'long',
  'namespace',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'signed',
  'sizeof',
  'static',
  'struct',
  'switch',
  'template',
  'true',
  'typedef',
  'typename',
  'unsigned',
  'using',
  'void',
  'while'
]);

const cppTypesAndFunctions = new Set([
  'array',
  'deque',
  'greater',
  'map',
  'max',
  'min',
  'pair',
  'priority_queue',
  'queue',
  'set',
  'sort',
  'string',
  'unordered_map',
  'unordered_set',
  'vector'
]);

function HighlightedCode({ children, className }: { children: string; className?: string }) {
  const language = className?.replace('language-', '') ?? 'text';

  return (
    <code className={cn('block min-w-max font-mono text-[13px]', className)} data-language={language}>
      {children
        .replace(/\n$/, '')
        .split('\n')
        .map((line, lineIndex) => (
          <span key={lineIndex} className="block">
            {highlightCppLine(line)}
          </span>
        ))}
    </code>
  );
}

function highlightCppLine(line: string) {
  const tokens: ReactNode[] = [];
  let index = 0;
  let tokenIndex = 0;

  const push = (text: string, className?: string) => {
    if (!text) return;
    tokens.push(
      className ? (
        <span key={tokenIndex++} className={className}>
          {text}
        </span>
      ) : (
        <span key={tokenIndex++}>{text}</span>
      )
    );
  };

  while (index < line.length) {
    const commentStart = line.indexOf('//', index);

    if (commentStart === index) {
      push(line.slice(index), 'text-emerald-700 dark:text-emerald-300');
      break;
    }

    const char = line[index];

    if (char === '"' || char === "'") {
      const quote = char;
      let end = index + 1;

      while (end < line.length) {
        if (line[end] === '\\') {
          end += 2;
          continue;
        }

        if (line[end] === quote) {
          end += 1;
          break;
        }

        end += 1;
      }

      push(line.slice(index, end), 'text-amber-700 dark:text-amber-300');
      index = end;
      continue;
    }

    if (char === '#' && line.slice(0, index).trim() === '') {
      push(line.slice(index), 'text-violet-700 dark:text-violet-300');
      break;
    }

    const numberMatch = line.slice(index).match(/^\b\d+(?:\.\d+)?\b/);
    if (numberMatch) {
      push(numberMatch[0], 'text-blue-700 dark:text-blue-300');
      index += numberMatch[0].length;
      continue;
    }

    const wordMatch = line.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (wordMatch) {
      const word = wordMatch[0];

      if (cppKeywords.has(word)) {
        push(word, 'font-semibold text-fuchsia-700 dark:text-fuchsia-300');
      } else if (cppTypesAndFunctions.has(word)) {
        push(word, 'text-sky-700 dark:text-sky-300');
      } else {
        push(word);
      }

      index += word.length;
      continue;
    }

    const operatorMatch = line
      .slice(index)
      .match(/^(?:==|!=|<=|>=|\+\+|--|&&|\|\||->|::|[+\-*/%=!<>()[\]{}.,;:&|])/);
    if (operatorMatch) {
      push(operatorMatch[0], 'text-slate-700 dark:text-slate-300');
      index += operatorMatch[0].length;
      continue;
    }

    push(char);
    index += 1;
  }

  return tokens;
}

export function MarkdownBlock({ children, className }: { children: string; className?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn('space-y-3 text-sm leading-7', className)}
      components={{
        p: ({ children: paragraphChildren }) => <p>{paragraphChildren}</p>,
        h1: ({ children: headingChildren }) => (
          <h1 className="text-lg font-semibold text-foreground">{headingChildren}</h1>
        ),
        h2: ({ children: headingChildren }) => (
          <h2 className="text-base font-semibold text-foreground">{headingChildren}</h2>
        ),
        h3: ({ children: headingChildren }) => (
          <h3 className="text-sm font-semibold text-foreground">{headingChildren}</h3>
        ),
        blockquote: ({ children: quoteChildren }) => (
          <blockquote className="space-y-3 border-l-4 border-primary/40 pl-4 text-muted-foreground italic">
            {quoteChildren}
          </blockquote>
        ),
        a: ({ children: linkChildren, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2"
          >
            {linkChildren}
          </a>
        ),
        hr: () => <hr className="border-border" />,
        ul: ({ children: listChildren }) => (
          <ul className="list-inside list-['・'] space-y-2">{listChildren}</ul>
        ),
        ol: ({ children: listChildren }) => (
          <ol className="list-inside list-decimal space-y-2">{listChildren}</ol>
        ),
        li: ({ children: itemChildren }) => <li>{itemChildren}</li>,
        code: ({ children: codeChildren, className: codeClassName }) => {
          if (codeClassName) {
            return <HighlightedCode className={codeClassName}>{String(codeChildren)}</HighlightedCode>;
          }

          return (
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              {codeChildren}
            </code>
          );
        },
        pre: ({ children: preChildren }) => (
          <pre className="overflow-x-auto rounded-2xl border border-border bg-slate-100 p-4 font-mono leading-6 text-slate-900 dark:bg-[#0d1117] dark:text-slate-100">
            {preChildren}
          </pre>
        )
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
