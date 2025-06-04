import React from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      iconPosition = "left",
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      "inline-flex items-center justify-center",
      "font-medium rounded-lg transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "active:scale-95",
    ];

    const variants = {
      primary: [
        "bg-gradient-to-r from-blue-600 to-purple-600",
        "hover:from-blue-500 hover:to-purple-500",
        "text-white shadow-lg",
        "focus:ring-blue-500",
      ],
      secondary: [
        "bg-gray-600 hover:bg-gray-500",
        "text-white",
        "focus:ring-gray-500",
      ],
      ghost: [
        "bg-transparent hover:bg-gray-700/50",
        "text-gray-300 hover:text-white",
        "border border-gray-600/50 hover:border-gray-500/50",
        "focus:ring-gray-500",
      ],
      danger: [
        "bg-red-600 hover:bg-red-500",
        "text-white",
        "focus:ring-red-500",
      ],
      success: [
        "bg-emerald-600 hover:bg-emerald-500",
        "text-white",
        "focus:ring-emerald-500",
      ],
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        )}

        {!loading && icon && iconPosition === "left" && (
          <span className="flex-shrink-0">{icon}</span>
        )}

        {children && (
          <span className={cn(loading && "opacity-70")}>{children}</span>
        )}

        {!loading && icon && iconPosition === "right" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
