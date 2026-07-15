import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-soft)]", className)} {...props} />;
}
