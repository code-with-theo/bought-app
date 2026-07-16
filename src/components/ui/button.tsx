import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "default" | "small" | "icon";
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:brightness-95 active:translate-y-px disabled:opacity-45",
  secondary: "bg-surface text-foreground shadow-[0_1px_0_rgb(71_48_35/6%)] ring-1 ring-border hover:bg-surface-muted active:translate-y-px disabled:bg-surface-muted",
  ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground active:bg-surface-muted",
  danger: "bg-danger text-white shadow-[var(--shadow-soft)] hover:brightness-95 active:translate-y-px disabled:opacity-45",
};

const sizes = { default: "min-h-11 px-4 text-sm", small: "min-h-9 px-3 text-sm", icon: "size-11 p-0" };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", size = "default", type = "button", ...props }, ref) {
  return <button ref={ref} type={type} className={cn("inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold whitespace-nowrap disabled:pointer-events-none disabled:cursor-not-allowed disabled:shadow-none", variants[variant], sizes[size], className)} {...props} />;
});
