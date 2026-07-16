"use client";

import type { RepurchaseDecision } from "@/types/product";
import { cn } from "@/components/ui/utils";

const options: Array<{ value: RepurchaseDecision; label: string; detail: string; selected: string }> = [
  { value: "repurchase", label: "会复购", detail: "下次还买", selected: "border-primary text-foreground" },
  { value: "avoid", label: "不会复购", detail: "以后避开", selected: "border-foreground text-foreground" },
  { value: "undecided", label: "再看看", detail: "还在考虑", selected: "border-muted-foreground text-foreground" },
];

export function RepurchaseSelector({ value, onChange, disabled = false, className }: { value: RepurchaseDecision; onChange: (value: RepurchaseDecision) => void; disabled?: boolean; className?: string }) {
  return <div className={cn("grid grid-cols-3 border-y border-border", className)} role="radiogroup" aria-label="复购结论">{options.map((option, index) => <button key={option.value} type="button" role="radio" aria-checked={value === option.value} disabled={disabled} onClick={() => onChange(option.value)} className={cn("min-h-16 px-2 text-center hover:bg-surface-muted disabled:cursor-not-allowed", index > 0 && "border-l border-border", value === option.value ? option.selected : "text-muted-foreground")}><span className="block text-sm font-semibold">{option.label}</span><span className="mt-0.5 block text-xs opacity-80">{option.detail}</span></button>)}</div>;
}
