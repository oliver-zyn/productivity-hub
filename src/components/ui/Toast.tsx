import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/utils/cn";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (
    message: string,
    type: Toast["type"],
    options?: Partial<Toast>
  ) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: () => {},
  hideToast: () => {},
  clearAllToasts: () => {},
});

export const useToast = () => useContext(ToastContext);

const ToastIcon: React.FC<{ type: Toast["type"] }> = ({ type }) => {
  const iconClass = "w-5 h-5 flex-shrink-0";

  switch (type) {
    case "success":
      return <CheckCircle className={cn(iconClass, "text-emerald-400")} />;
    case "error":
      return <AlertCircle className={cn(iconClass, "text-red-400")} />;
    case "warning":
      return <AlertTriangle className={cn(iconClass, "text-orange-400")} />;
    case "info":
      return <Info className={cn(iconClass, "text-blue-400")} />;
    default:
      return <Info className={cn(iconClass, "text-blue-400")} />;
  }
};

const ToastItem: React.FC<{
  toast: Toast;
  onClose: (id: string) => void;
}> = ({ toast, onClose }) => {
  const getToastStyles = (type: Toast["type"]) => {
    const baseStyles = "border-l-4 backdrop-blur-sm";

    switch (type) {
      case "success":
        return cn(
          baseStyles,
          "bg-emerald-500/10 border-emerald-500 text-emerald-100"
        );
      case "error":
        return cn(baseStyles, "bg-red-500/10 border-red-500 text-red-100");
      case "warning":
        return cn(
          baseStyles,
          "bg-orange-500/10 border-orange-500 text-orange-100"
        );
      case "info":
        return cn(baseStyles, "bg-blue-500/10 border-blue-500 text-blue-100");
      default:
        return cn(baseStyles, "bg-gray-500/10 border-gray-500 text-gray-100");
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-lg animate-fade-in-up max-w-sm",
        getToastStyles(toast.type)
      )}
    >
      <ToastIcon type={toast.type} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">{toast.message}</p>

        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-medium underline hover:no-underline opacity-90 hover:opacity-100 transition-opacity"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: Toast["type"], options: Partial<Toast> = {}) => {
      const id = `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const duration = options.duration ?? 5000;

      const newToast: Toast = {
        id,
        message,
        type,
        duration,
        ...options,
      };

      setToasts((prev) => {
        // Limitar a 5 toasts máximo
        const updated = [...prev, newToast];
        return updated.slice(-5);
      });

      // Auto-remover após duração especificada
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        hideToast,
        clearAllToasts,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <div className="pointer-events-auto space-y-2">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={hideToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

// Hook para facilitar o uso
export const useToastHelpers = () => {
  const { showToast } = useToast();

  return {
    success: (message: string, options?: Partial<Toast>) =>
      showToast(message, "success", options),
    error: (message: string, options?: Partial<Toast>) =>
      showToast(message, "error", options),
    warning: (message: string, options?: Partial<Toast>) =>
      showToast(message, "warning", options),
    info: (message: string, options?: Partial<Toast>) =>
      showToast(message, "info", options),
  };
};
