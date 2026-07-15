"use client";

import { cn } from "@/components/ui/utils";

const copy = ["", "很差", "不太行", "一般", "不错", "真香"];

export function RatingInput({ value, onChange, disabled = false, className }: { value: number | null; onChange: (rating: number) => void; disabled?: boolean; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)}><div className="flex gap-1" role="radiogroup" aria-label="综合评分">
    {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" role="radio" aria-checked={value === rating} aria-label={`${rating} 星：${copy[rating]}`} disabled={disabled} onClick={() => onChange(rating)} className={cn("flex size-10 items-center justify-center rounded-full text-2xl leading-none", value !== null && rating <= value ? "text-[#e3a33c]" : "text-[#d8cec5]", "hover:bg-warning-soft disabled:cursor-not-allowed")}>★</button>)}
  </div><span className="min-w-10 text-sm font-semibold text-muted-foreground" aria-live="polite">{value ? copy[value] : "未评分"}</span></div>;
}
