import { cn } from "@/components/ui/utils";

export function StatCard({ label, value, helper, tone = "default", className }: { label: string; value: number | string; helper?: string; tone?: "default" | "success" | "danger"; className?: string }) {
  const tones = { default: "border-muted-foreground", success: "border-primary", danger: "border-danger" };
  return <section className={cn("min-w-0 border-l pl-3", tones[tone], className)}><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-foreground">{value}</p>{helper ? <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{helper}</p> : null}</section>;
}
