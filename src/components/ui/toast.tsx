"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";
interface Toast { id: number; message: string; tone: ToastTone; }
interface ToastContextValue { showToast: (message: string, tone?: ToastTone) => void; }
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone }].slice(-3));
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600);
  }, []);
  const value = useMemo(() => ({ showToast }), [showToast]);
  return <ToastContext.Provider value={value}>{children}<div className="pointer-events-none fixed inset-x-4 bottom-[calc(5.5rem+var(--bottom-safe-area))] z-50 mx-auto flex max-w-md flex-col gap-2" aria-live="polite">
    {toasts.map((toast) => <div key={toast.id} className={`rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium shadow-[var(--shadow-float)] ${toast.tone === "error" ? "bg-danger text-white" : toast.tone === "info" ? "bg-foreground text-white" : "bg-success text-white"}`}>{toast.message}</div>)}
  </div></ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast 必须在 ToastProvider 内使用");
  return context;
}
