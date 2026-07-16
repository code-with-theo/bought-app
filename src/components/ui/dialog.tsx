"use client";

import { useEffect, useRef } from "react";
import { Button } from "./button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  isConfirming?: boolean;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "确认", cancelLabel = "取消", destructive = false, onConfirm, onOpenChange, isConfirming = false }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !isConfirming) onOpenChange(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isConfirming, onOpenChange, open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-4 sm:items-center" role="presentation" onMouseDown={() => !isConfirming && onOpenChange(false)}>
    <section aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" aria-modal="true" role="dialog" className="w-full max-w-sm rounded-[var(--radius-md)] border border-border bg-surface p-5 shadow-[var(--shadow-float)]" onMouseDown={(event) => event.stopPropagation()}>
      <h2 id="confirm-dialog-title" className="text-lg font-bold">{title}</h2>
      <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button ref={cancelRef} variant="secondary" onClick={() => onOpenChange(false)} disabled={isConfirming}>{cancelLabel}</Button>
        <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm} disabled={isConfirming}>{isConfirming ? "正在处理…" : confirmLabel}</Button>
      </div>
    </section>
  </div>;
}
