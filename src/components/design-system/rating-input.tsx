"use client";

import { cn } from "@/components/ui/utils";

const copy = ["", "很差", "不太行", "一般", "不错", "真香"];

export function RatingInput({ value, onChange, disabled = false, className }: { value: number | null; onChange: (rating: number) => void; disabled?: boolean; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)}><div className="flex gap-1" role="radiogroup" aria-label="综合评分">
    {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" role="radio" aria-checked={value === rating} aria-label={`${rating} 星：${copy[rating]}`} disabled={disabled} onClick={() => onChange(rating)} className={cn("flex size-10 items-center justify-center", value !== null && rating <= value ? "text-primary" : "text-border", "hover:text-primary disabled:cursor-not-allowed")}><StarIcon filled={value !== null && rating <= value} /></button>)}
  </div><span className="min-w-10 text-sm font-semibold text-muted-foreground" aria-live="polite">{value ? copy[value] : "未评分"}</span></div>;
}

function StarIcon({ filled }: { filled: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 2.78 5.63 6.22.91-4.5 4.38 1.06 6.19L12 17.18l-5.56 2.93 1.06-6.19L3 9.54l6.22-.91L12 3Z" /></svg>;
}
