'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={copyText}>
      {copied ? '已複製' : '複製模板'}
    </Button>
  );
}
