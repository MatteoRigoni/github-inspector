"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    bg: "bg-green-600 dark:bg-green-500",
    text: "text-white",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: "bg-red-600 dark:bg-red-500",
    text: "text-white",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  info: {
    bg: "bg-blue-600 dark:bg-blue-500",
    text: "text-white",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-yellow-600 dark:bg-yellow-500",
    text: "text-white",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
};

export default function ToastComponent({ toast, onClose }: ToastProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const duration = toast.duration ?? 2000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onClose(toast.id);
      }, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  const style = toastStyles[toast.type];

  return (
    <div className={`${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className={`${style.bg} ${style.text} backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-white/20 flex items-center gap-2 min-w-[200px] max-w-[400px]`}>
        {style.icon}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
}

