import { cn } from "@/components/ui/utils";

export function StatCard({ label, value, helper, tone = "default", className }: { label: string; value: number | string; helper?: string; tone?: "default" | "success" | "danger"; className?: string }) {
  const tones = { default: "bg-surface", success: "bg-success-soft", danger: "bg-danger-soft" };
  return <section className={cn("min-w-0 rounded-[var(--radius-md)] p-4 shadow-[0_3px_12px_rgb(71_48_35/5%)]", tones[tone], className)}><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-foreground">{value}</p>{helper ? <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{helper}</p> : null}</section>;
}
