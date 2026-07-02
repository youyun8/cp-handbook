export function ProgressBar({
  percent,
  label,
  detail
}: {
  percent: number;
  label: string;
  detail: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const isComplete = clamped >= 100;

  return (
    <div className="rounded-2xl border border-border bg-background/45 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs font-medium text-muted-foreground">{detail}</p>
      </div>
      <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-accent">
        <div
          className={
            isComplete
              ? 'relative h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.55)] transition-[width] duration-700 ease-out'
              : 'relative h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.35)] transition-[width] duration-700 ease-out'
          }
          style={{ width: `${clamped}%` }}
        >
          <div className="absolute inset-0 animate-pulse bg-white/10" />
        </div>
      </div>
    </div>
  );
}
