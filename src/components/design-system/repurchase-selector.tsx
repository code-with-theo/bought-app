"use client";

import type { RepurchaseDecision } from "@/types/product";
import { cn } from "@/components/ui/utils";

const options: Array<{ value: RepurchaseDecision; label: string; detail: string; selected: string }> = [
  { value: "repurchase", label: "会复购", detail: "下次还买", selected: "border-success bg-success-soft text-success" },
  { value: "avoid", label: "不会复购", detail: "以后避开", selected: "border-danger bg-danger-soft text-danger" },
  { value: "undecided", label: "再看看", detail: "还在考虑", selected: "border-warning bg-warning-soft text-warning" },
];

export function RepurchaseSelector({ value, onChange, disabled = false, className }: { value: RepurchaseDecision; onChange: (value: RepurchaseDecision) => void; disabled?: boolean; className?: string }) {
  return <div className={cn("grid grid-cols-3 gap-2", className)} role="radiogroup" aria-label="复购结论">{options.map((option) => <button key={option.value} type="button" role="radio" aria-checked={value === option.value} disabled={disabled} onClick={() => onChange(option.value)} className={cn("min-h-16 rounded-[var(--radius-sm)] border px-2 text-center hover:bg-surface-muted disabled:cursor-not-allowed", value === option.value ? option.selected : "border-border bg-surface text-muted-foreground")}><span className="block text-sm font-bold">{option.label}</span><span className="mt-0.5 block text-xs opacity-80">{option.detail}</span></button>)}</div>;
}
