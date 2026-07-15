import { cn } from "@/components/ui/utils";

export function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className="min-h-dvh bg-background"><main className={cn("mx-auto w-full max-w-[var(--content-width)] px-4 pb-[calc(6rem+var(--bottom-safe-area))] pt-5 sm:px-6", className)}>{children}</main></div>;
}
