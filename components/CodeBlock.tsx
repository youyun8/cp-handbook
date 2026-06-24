import { codeToHtml } from 'shiki';
import { CopyButton } from '@/components/CopyButton';

export async function CodeBlock({ code, lang = 'cpp' }: { code: string; lang?: string }) {
  const html = await codeToHtml(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark'
    }
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-slate-100 dark:bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">C++ 註解模板</span>
        <CopyButton text={code} />
      </div>
      <div className="overflow-x-auto p-4" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
