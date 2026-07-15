import { cn } from "@/components/ui/utils";

export function PageHeader({ eyebrow, title, description, action, className }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return <header className={cn("flex items-start justify-between gap-4", className)}><div className="min-w-0"><p className="text-sm font-semibold text-primary">{eyebrow}</p><h1 className="mt-1 text-[clamp(1.75rem,7vw,2.25rem)] font-bold tracking-[-0.035em] text-foreground">{title}</h1>{description ? <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p> : null}</div>{action ? <div className="shrink-0">{action}</div> : null}</header>;
}

export function SectionHeader({ title, action, className }: { title: string; action?: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between gap-3", className)}><h2 className="text-lg font-bold tracking-[-0.02em] text-foreground">{title}</h2>{action}</div>;
}
