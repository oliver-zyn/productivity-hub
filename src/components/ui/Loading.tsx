import React from "react";
import { cn } from "@/utils/cn";

// ===================================
// Loading Spinner
// ===================================

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "blue" | "white" | "gray" | "current";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "blue",
  className,
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    blue: "border-blue-500 border-t-blue-600",
    white: "border-white/20 border-t-white",
    gray: "border-gray-300 border-t-gray-600",
    current: "border-current border-t-transparent",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Carregando"
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
};

// ===================================
// Skeleton Components
// ===================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "text" | "rectangular" | "circular";
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = "rectangular",
  animation = "pulse",
}) => {
  const variantClasses = {
    text: "rounded",
    rectangular: "rounded-lg",
    circular: "rounded-full",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse", // Podemos melhorar isso depois
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height)
    style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        "bg-gray-700/50",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
};

// ===================================
// Skeleton Presets
// ===================================

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 1, className }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height={16}
        width={i === lines - 1 ? "75%" : "100%"}
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <Skeleton variant="circular" className={cn(sizeClasses[size], className)} />
  );
};

export const SkeletonButton: React.FC<{
  width?: string | number;
  className?: string;
}> = ({ width = 80, className }) => (
  <Skeleton
    variant="rectangular"
    width={width}
    height={36}
    className={className}
  />
);

// ===================================
// Complex Skeleton Layouts
// ===================================

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      "p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl",
      className
    )}
  >
    <div className="flex items-center gap-3 mb-4">
      <SkeletonAvatar size="sm" />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height={16} className="mb-2" />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
    <SkeletonText lines={2} className="mb-4" />
    <div className="flex gap-2">
      <SkeletonButton width={80} />
      <SkeletonButton width={60} />
    </div>
  </div>
);

export const SkeletonTask: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      "flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg",
      className
    )}
  >
    <Skeleton variant="rectangular" width={16} height={16} />
    <Skeleton variant="text" className="flex-1" height={16} />
    <Skeleton variant="rectangular" width={60} height={20} />
  </div>
);

export const SkeletonProject: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      "border border-gray-600/50 rounded-lg p-4 bg-gray-700/20",
      className
    )}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <Skeleton variant="text" width="70%" height={20} className="mb-2" />
        <Skeleton variant="text" width="90%" height={14} className="mb-3" />
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width={80} height={24} />
          <Skeleton variant="rectangular" width={100} height={24} />
        </div>
      </div>
      <div className="text-right">
        <Skeleton variant="text" width={50} height={24} className="mb-1" />
        <Skeleton variant="text" width={80} height={12} />
      </div>
    </div>
    <Skeleton variant="rectangular" width="100%" height={8} className="mb-4" />
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonTask key={i} />
      ))}
    </div>
  </div>
);

// ===================================
// Full Page Loading
// ===================================

export const FullPageLoading: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = "Carregando...", className }) => (
  <div
    className={cn(
      "fixed inset-0 bg-gray-900/80 backdrop-blur-sm",
      "flex items-center justify-center z-50",
      className
    )}
  >
    <div className="text-center">
      <LoadingSpinner size="xl" className="mx-auto mb-4" />
      <p className="text-gray-300 text-lg">{message}</p>
    </div>
  </div>
);

// ===================================
// Section Loading
// ===================================

export const SectionLoading: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = "Carregando...", className }) => (
  <div className={cn("flex items-center justify-center py-12", className)}>
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-3" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  </div>
);
