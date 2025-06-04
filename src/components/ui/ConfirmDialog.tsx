import React, { useEffect, useRef } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Button from "./Button";
import { cn } from "@/utils/cn";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  preventClose?: boolean;
  children?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  variant = "danger",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmLoading = false,
  preventClose = false,
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !preventClose && !confirmLoading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel, preventClose, confirmLoading]);

  // Click outside handler
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventClose && !confirmLoading) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const getVariantConfig = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-red-400" />,
          iconBg: "bg-red-500/20",
          confirmVariant: "danger" as const,
          borderColor: "border-red-500/30",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
          iconBg: "bg-orange-500/20",
          confirmVariant: "warning" as const,
          borderColor: "border-orange-500/30",
        };
      case "info":
        return {
          icon: <HelpCircle className="w-6 h-6 text-blue-400" />,
          iconBg: "bg-blue-500/20",
          confirmVariant: "primary" as const,
          borderColor: "border-blue-500/30",
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-gray-400" />,
          iconBg: "bg-gray-500/20",
          confirmVariant: "secondary" as const,
          borderColor: "border-gray-500/30",
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div
        ref={dialogRef}
        className={cn(
          "bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full mx-4 shadow-2xl",
          "transform transition-all duration-200 scale-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={cn("p-6 border-b border-gray-700/50", config.borderColor)}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                config.iconBg
              )}
            >
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3
                id="confirm-dialog-title"
                className="text-lg font-semibold text-gray-100 mb-1"
              >
                {title}
              </h3>
              <p
                id="confirm-dialog-description"
                className="text-gray-300 text-sm leading-relaxed"
              >
                {message}
              </p>
            </div>

            {/* Close button (only if not prevented) */}
            {!preventClose && !confirmLoading && (
              <button
                onClick={onCancel}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-gray-300"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Custom Content */}
        {children && (
          <div className="p-6 border-b border-gray-700/50">{children}</div>
        )}

        {/* Actions */}
        <div className="p-6 flex gap-3 justify-end">
          <Button
            ref={cancelButtonRef}
            variant="ghost"
            onClick={onCancel}
            disabled={confirmLoading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>

          <Button
            variant={config.confirmVariant as "primary" | "secondary" | "ghost" | "danger" | "success" | undefined}
            onClick={onConfirm}
            loading={confirmLoading}
            disabled={confirmLoading}
            className="min-w-[100px]"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

// ===================================
// Hook for easier usage
// ===================================

import { useState, useCallback } from "react";

export interface UseConfirmDialogOptions {
  title: string;
  message: string;
  variant?: ConfirmDialogProps["variant"];
  confirmText?: string;
  cancelText?: string;
}

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UseConfirmDialogOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = useCallback(
    (options: UseConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfig(options);
        setIsOpen(true);
        setResolvePromise(() => resolve);
      });
    },
    []
  );

  const handleConfirm = useCallback(async () => {
    if (resolvePromise) {
      setLoading(true);
      // Pequeno delay para mostrar o loading
      await new Promise((resolve) => setTimeout(resolve, 100));
      resolvePromise(true);
      setLoading(false);
      setIsOpen(false);
      setResolvePromise(null);
      setConfig(null);
    }
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
      setIsOpen(false);
      setResolvePromise(null);
      setConfig(null);
      setLoading(false);
    }
  }, [resolvePromise]);

  const ConfirmDialogComponent = useCallback(() => {
    if (!config) return null;

    return (
      <ConfirmDialog
        isOpen={isOpen}
        title={config.title}
        message={config.message}
        variant={config.variant}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmLoading={loading}
        preventClose={loading}
      />
    );
  }, [isOpen, config, handleConfirm, handleCancel, loading]);

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
    isOpen,
    loading,
  };
};
