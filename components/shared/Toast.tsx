"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  sub?: string;
}

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    // Auto-dismiss
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle size={16} className="text-[#059669] shrink-0" />,
    error:   <XCircle    size={16} className="text-red-500 shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
  };

  const borders = {
    success: "border-[#059669]/20",
    error:   "border-red-200",
    warning: "border-amber-200",
  };

  return (
    <div className={`bg-white border shadow-lg rounded-xl px-4 py-3 flex items-start gap-3 transition-all duration-300 ${borders[toast.type]} ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
    }`}>
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-gray-900">{toast.title}</div>
        {toast.sub && <div className="text-[12px] text-gray-500 mt-0.5">{toast.sub}</div>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0 mt-0.5">
        <X size={13} />
      </button>
    </div>
  );
}

// Hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function add(type: ToastType, title: string, sub?: string) {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, type, title, sub }]);
  }

  function remove(id: string) {
    setToasts(p => p.filter(t => t.id !== id));
  }

  return { toasts, remove, success: (t: string, s?: string) => add("success", t, s), error: (t: string, s?: string) => add("error", t, s) };
}
