import type { RepurchaseDecision, UsageStatus } from "@/types/product";
import { cn } from "@/components/ui/utils";

const decision = {
  repurchase: { label: "会复购", className: "border-primary text-foreground" },
  avoid: { label: "不会复购", className: "border-danger text-foreground" },
  undecided: { label: "再看看", className: "border-muted-foreground text-muted-foreground" },
} satisfies Record<RepurchaseDecision, { label: string; className: string }>;
const status = {
  unused: "还没开始用",
  using: "使用中",
  finished: "已经用完",
} satisfies Record<UsageStatus, string>;

export function RepurchaseBadge({ decision: value, className }: { decision: RepurchaseDecision; className?: string }) {
  const item = decision[value];
  return <span className={cn("inline-flex min-h-5 items-center border-l-2 pl-1.5 text-xs font-medium", item.className, className)}>{item.label}</span>;
}

export function StatusBadge({ status: value, className }: { status: UsageStatus; className?: string }) {
  return <span className={cn("inline-flex min-h-5 items-center text-xs text-muted-foreground", className)}>{status[value]}</span>;
}
