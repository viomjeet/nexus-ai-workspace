"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 2400) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]); // Keep max 4 toasts

      // Fast auto-dismiss
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration = 2400) => showToast(message, "success", duration),
    [showToast]
  );
  const error = useCallback(
    (message: string, duration = 2600) => showToast(message, "error", duration),
    [showToast]
  );
  const warning = useCallback(
    (message: string, duration = 2500) => showToast(message, "warning", duration),
    [showToast]
  );
  const info = useCallback(
    (message: string, duration = 2400) => showToast(message, "info", duration),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Floating Toast Container (Responsive for Mobile & Desktop) */}
      <div
        className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:top-4 z-50 flex flex-col gap-2 pointer-events-none max-w-md"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          let typeStyles = {
            border: "border-cyan-500/40 dark:border-cyan-500/40",
            bg: "bg-white/95 text-slate-800 dark:bg-[#0c1322]/95 dark:text-cyan-200",
            icon: "ℹ",
            iconBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
            progress: "bg-cyan-500",
          };

          if (toast.type === "success") {
            typeStyles = {
              border: "border-emerald-500/40 dark:border-emerald-500/40",
              bg: "bg-white/95 text-slate-800 dark:bg-[#071714]/95 dark:text-emerald-200",
              icon: "✓",
              iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
              progress: "bg-emerald-500",
            };
          } else if (toast.type === "error") {
            typeStyles = {
              border: "border-rose-500/40 dark:border-rose-500/40",
              bg: "bg-white/95 text-slate-800 dark:bg-[#1a0a0f]/95 dark:text-rose-200",
              icon: "✕",
              iconBg: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
              progress: "bg-rose-500",
            };
          } else if (toast.type === "warning") {
            typeStyles = {
              border: "border-amber-500/40 dark:border-amber-500/40",
              bg: "bg-white/95 text-slate-800 dark:bg-[#1a1407]/95 dark:text-amber-200",
              icon: "⚠",
              iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
              progress: "bg-amber-500",
            };
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto border ${typeStyles.border} ${typeStyles.bg} shadow-xl shadow-black/10 backdrop-blur-md rounded-xl p-3 flex items-center justify-between gap-3 text-xs font-mono transition-all duration-300 animate-in fade-in slide-in-from-top-2 relative overflow-hidden`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-6 h-6 rounded-lg ${typeStyles.iconBg} flex items-center justify-center font-bold text-xs shrink-0`}
                >
                  {typeStyles.icon}
                </span>
                <span className="font-semibold truncate leading-snug">{toast.message}</span>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 text-xs p-1 rounded transition cursor-pointer shrink-0"
                aria-label="Dismiss toast"
              >
                ✕
              </button>

              {/* Fast progress timer indicator */}
              <div
                className={`absolute bottom-0 left-0 h-0.5 w-full ${typeStyles.progress} opacity-70 animate-pulse`}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
