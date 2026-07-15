import type { RepurchaseDecision, UsageStatus } from "@/types/product";
import { cn } from "@/components/ui/utils";

const decision = {
  repurchase: { label: "会复购", className: "bg-success-soft text-success" },
  avoid: { label: "不会复购", className: "bg-danger-soft text-danger" },
  undecided: { label: "再看看", className: "bg-warning-soft text-warning" },
} satisfies Record<RepurchaseDecision, { label: string; className: string }>;
const status = {
  unused: "还没开始用",
  using: "使用中",
  finished: "已经用完",
} satisfies Record<UsageStatus, string>;

export function RepurchaseBadge({ decision: value, className }: { decision: RepurchaseDecision; className?: string }) {
  const item = decision[value];
  return <span className={cn("inline-flex min-h-6 items-center rounded-full px-2 text-xs font-bold", item.className, className)}>{item.label}</span>;
}

export function StatusBadge({ status: value, className }: { status: UsageStatus; className?: string }) {
  return <span className={cn("inline-flex min-h-6 items-center rounded-full bg-surface-muted px-2 text-xs font-medium text-muted-foreground", className)}>{status[value]}</span>;
}
