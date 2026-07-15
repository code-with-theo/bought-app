import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, actionLabel, onAction, icon = "♡" }: { title: string; description: string; actionLabel?: string; onAction?: () => void; icon?: string }) {
  return <section className="flex min-h-64 flex-col items-center justify-center rounded-[var(--radius-lg)] bg-surface-muted px-6 py-10 text-center"><span className="flex size-14 items-center justify-center rounded-full bg-surface text-2xl text-primary shadow-[var(--shadow-soft)]" aria-hidden="true">{icon}</span><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{description}</p>{actionLabel && onAction ? <Button className="mt-5" onClick={onAction}>{actionLabel}</Button> : null}</section>;
}

export function LoadingState({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-lg)] bg-surface-muted ${className ?? "h-40"}`} aria-label="正在加载" role="status"><span className="sr-only">正在加载</span></div>;
}
