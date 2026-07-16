import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./utils";

const fieldClassName = "w-full rounded-[var(--radius-sm)] border bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted-foreground hover:border-muted-foreground focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClassName, "min-h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClassName, "min-h-28 py-3", className)} {...props} />;
}

export function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn("mb-2 block text-sm font-semibold text-foreground", className)}>{children}</label>;
}

export function FieldHint({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return <p className={cn("mt-1.5 text-xs leading-5", error ? "text-danger" : "text-muted-foreground")}>{children}</p>;
}
