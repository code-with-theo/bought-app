import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return <section className="flex min-h-64 flex-col items-center justify-center border-y border-border px-6 py-10 text-center"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{description}</p>{actionLabel && onAction ? <Button className="mt-5" onClick={onAction}>{actionLabel}</Button> : null}</section>;
}

export function LoadingState({ className }: { className?: string }) {
  return <div className={`animate-pulse border-y border-border bg-surface-muted/50 ${className ?? "h-40"}`} aria-label="正在加载" role="status"><span className="sr-only">正在加载</span></div>;
}
