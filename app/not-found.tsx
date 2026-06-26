import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-border bg-card/80 p-8 text-center">
      <p className="text-sm font-medium text-primary">找不到頁面</p>
      <h1 className="mt-3 text-3xl font-bold">這個策略頁尚未建立</h1>
      <p className="mt-3 text-muted-foreground">請回到手冊或練習場選擇其他題目。</p>
      <Link
        className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground"
        href="/handbook"
      >
        回到手冊
      </Link>
    </div>
  );
}
