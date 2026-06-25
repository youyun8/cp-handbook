'use client';

import { useMemo } from 'react';
import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import plaintext from 'highlight.js/lib/languages/plaintext';
import { cn } from '@/lib/utils';

// Register a curated set of common competitive-programming languages once.
let registered = false;
function ensureRegistered() {
  if (registered) return;
  hljs.registerLanguage('cpp', cpp);
  hljs.registerLanguage('c', c);
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('java', java);
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('go', go);
  hljs.registerLanguage('rust', rust);
  hljs.registerLanguage('plaintext', plaintext);
  registered = true;
}

export const CODE_LANGUAGES: { value: string; label: string }[] = [
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'plaintext', label: '純文字' }
];

export const DEFAULT_CODE_LANGUAGE = 'cpp';

export function CodeEditor({
  value,
  onValueChange,
  language,
  placeholder,
  minHeight = '12rem',
  className
}: {
  value: string;
  onValueChange: (value: string) => void;
  language: string;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}) {
  ensureRegistered();

  const highlight = useMemo(() => {
    const lang = hljs.getLanguage(language) ? language : 'plaintext';
    return (code: string) => {
      if (!code) return '';
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch {
        return escapeHtml(code);
      }
    };
  }, [language]);

  return (
    <div
      className={cn(
        'overflow-auto rounded-2xl border border-border bg-slate-50 dark:bg-[#0d1117]',
        className
      )}
      style={{ maxHeight: '60vh' }}
    >
      <Editor
        value={value}
        onValueChange={onValueChange}
        highlight={highlight}
        placeholder={placeholder}
        padding={16}
        textareaClassName="code-editor-textarea"
        preClassName="hljs"
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.6,
          minHeight,
          outline: 'none'
        }}
      />
    </div>
  );
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
